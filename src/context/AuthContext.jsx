import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient, ApiError } from '../services/api/apiClient.js';
import { setStorageAdapter } from '../services/persistence/storageProvider.js';
import { localStorageAdapter } from '../services/persistence/localStorageAdapter.js';
import { apiStorageAdapter, hydrateFromApi } from '../services/persistence/apiStorageAdapter.js';
import { STORAGE_KEYS, writeStorage } from '../services/storage.js';
import { refreshLegacyDashboardData } from '../hooks/useLegacyDashboardData.js';

/**
 * Sincroniza o nome e o estado de boas-vindas do usuário autenticado
 * para o localStorage, mantendo o sistema legado em sincronia.
 */
function syncUserToLegacy(user) {
  if (!user?.name) return;
  writeStorage(STORAGE_KEYS.userName, user.name);
  writeStorage(STORAGE_KEYS.welcomed, '1');
}

// ─── Cache de identidade do usuário (para sobreviver ao reload) ───────────────
// Salva apenas informações de identidade (sem tokens).
// Permite pre-popular o estado enquanto o refresh token está sendo verificado,
// evitando redirecionamento prematuro para login.
const SESSION_USER_KEY = 'meucontrole_session_user';

function readCachedUser() {
  try {
    const raw =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(SESSION_USER_KEY)
        : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedUser(user) {
  try {
    if (user) {
      const safe = { id: user.id, name: user.name, email: user.email };
      window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(safe));
    } else {
      window.localStorage.removeItem(SESSION_USER_KEY);
    }
  } catch {
    // Silencioso — falha aqui não é crítica
  }
}

// ─── Limpeza dos dados locais do usuário ─────────────────────────────────────
// Chamada no logout para evitar que o próximo usuário veja dados do anterior.
const DATA_KEYS_TO_CLEAR = [
  STORAGE_KEYS.appState,
  STORAGE_KEYS.goals,
  STORAGE_KEYS.categories,
  STORAGE_KEYS.recurrences,
  STORAGE_KEYS.budgets,
  STORAGE_KEYS.userName,
  STORAGE_KEYS.welcomed,
];

function clearLocalUserData() {
  try {
    const ls = typeof window !== 'undefined' ? window.localStorage : globalThis.localStorage;
    DATA_KEYS_TO_CLEAR.forEach(key => ls.removeItem(key));
  } catch {
    // Silencioso
  }
}

// ─── Refresh deduplication (module-level) ─────────────────────────────────────
// O backend rotaciona o refresh-token a cada chamada de /auth/refresh.
// Duas chamadas concorrentes (ex: StrictMode em dev, race entre setTimeout e
// restoreSession ao voltar de aba inativa) podem fazer o backend interpretar a
// segunda chamada como "token reuse attack" e invalidar TODOS os tokens do
// usuário — causando logout indevido.
// Para evitar isso, deduplicamos: enquanto houver uma chamada em vôo, qualquer
// pedido adicional aguarda o mesmo resultado.
let refreshInFlightPromise = null;
function refreshSessionDeduped() {
  if (!refreshInFlightPromise) {
    refreshInFlightPromise = apiClient
      .post('/auth/refresh', null, { skipAuth: true })
      .finally(() => {
        refreshInFlightPromise = null;
      });
  }
  return refreshInFlightPromise;
}

// Considera apenas 401/403 como "sessão realmente inválida".
// Qualquer outro erro (rede caindo, 429, 5xx) NÃO deve causar logout.
function isFatalAuthError(err) {
  if (err instanceof ApiError) {
    return err.statusCode === 401 || err.statusCode === 403;
  }
  return false;
}

const AuthContext = createContext(null);

/**
 * AuthProvider — gerencia estado de autenticação e tokens.
 *
 * Fluxo:
 * 1. No mount, pré-popula user com cache (evita logout falso no reload).
 * 2. Tenta renovar a sessão via /auth/refresh (cookie HttpOnly).
 * 3. Se bem-sucedido, ativa o apiStorageAdapter, hidrata dados da API e atualiza o cache.
 * 4. Se falhar com 401/403, limpa cache e dados locais — sessão realmente inválida.
 * 5. Se falhar com erro transiente (rede/5xx), mantém o cache (usuário permanece logado
 *    em modo degradado até que o refresh automático consiga renovar o token).
 * 6. Ao fazer login/cadastro, limpa dados antigos, ativa apiStorageAdapter e hidrata.
 * 7. Ao fazer logout, limpa cache, dados locais e volta para localStorageAdapter.
 */
export function AuthProvider({ children }) {
  // Pré-popula com cache para evitar flash de redirecionamento no reload
  const [user, setUser] = useState(() => readCachedUser());
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef(null);
  // Guard para evitar que restoreSession rode duas vezes no mount
  // (React StrictMode em dev faz o useEffect rodar duas vezes).
  const didInitRef = useRef(false);
  // Guarda referência ao handler de logout para o setTimeout sem
  // criar dependência circular nos useCallbacks.
  const handleLogoutRef = useRef(null);

  // Agenda renovação automática do access token (a cada 13 minutos — antes dos 15 de expiração).
  // Em caso de erro transiente (rede/5xx), tenta novamente em 30s sem deslogar.
  // Apenas 401/403 (sessão realmente inválida) acionam logout.
  const scheduleTokenRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const data = await refreshSessionDeduped();
        setAccessToken(data.accessToken);
        apiClient.setToken(data.accessToken);
        scheduleTokenRefresh();
      } catch (err) {
        if (isFatalAuthError(err)) {
          // Sessão realmente inválida — desloga.
          handleLogoutRef.current?.(false);
        } else {
          // Erro transiente: reagenda retry curto (30s) sem deslogar.
          refreshTimerRef.current = setTimeout(scheduleTokenRefresh, 30 * 1000);
        }
      }
    }, 13 * 60 * 1000);
  }, []);

  const activateApiMode = useCallback((token) => {
    apiClient.setToken(token);
    setStorageAdapter(apiStorageAdapter);
  }, []);

  const deactivateApiMode = useCallback(() => {
    apiClient.setToken(null);
    setStorageAdapter(localStorageAdapter);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
  }, []);

  // Tenta restaurar sessão existente via refresh token cookie
  useEffect(() => {
    // StrictMode em dev faz o useEffect rodar duas vezes. A segunda chamada
    // pode mandar um cookie já rotacionado e o backend invalidaria todos os
    // tokens. O guard abaixo + a deduplicação cobrem ambos os casos.
    if (didInitRef.current) return;
    didInitRef.current = true;

    async function restoreSession() {
      try {
        const data = await refreshSessionDeduped();
        setAccessToken(data.accessToken);
        setUser(data.user ?? null);
        syncUserToLegacy(data.user);
        saveCachedUser(data.user);
        activateApiMode(data.accessToken);
        scheduleTokenRefresh();

        // Hidrata dados do usuário autenticado no localStorage.
        // Chama em background para não bloquear a UI.
        hydrateFromApi()
          .then(() => refreshLegacyDashboardData())
          .catch(() => {});
      } catch (err) {
        if (isFatalAuthError(err)) {
          // Sessão realmente inválida — limpa tudo e redireciona para login.
          setUser(null);
          saveCachedUser(null);
          clearLocalUserData();
          refreshLegacyDashboardData();
          deactivateApiMode();
        } else {
          // Erro transiente (rede/servidor caído): NÃO desloga.
          // O usuário pré-carregado do cache permanece. O token automático
          // tentará renovar novamente em 30s.
          // Se não havia cache (primeira visita), user permanece null.
        }
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [activateApiMode, deactivateApiMode, scheduleTokenRefresh]);

  // Re-sincroniza ao voltar para a aba: browsers suspendem setTimeout em abas
  // em background, então o refresh agendado pode disparar muito depois do
  // previsto. Quando a aba volta a ficar visível, garantimos um refresh
  // imediato (dedupado) para manter o access token vivo.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return;
      // Só faz sentido tentar refresh se o usuário está autenticado.
      if (!accessToken) return;

      refreshSessionDeduped()
        .then((data) => {
          setAccessToken(data.accessToken);
          apiClient.setToken(data.accessToken);
          scheduleTokenRefresh();
        })
        .catch((err) => {
          if (isFatalAuthError(err)) {
            handleLogoutRef.current?.(false);
          }
          // Erros transientes: silenciosamente ignorados; o timer já tenta de novo.
        });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [accessToken, scheduleTokenRefresh]);

  const login = useCallback(async ({ email, password }) => {
    const data = await apiClient.post('/auth/login', { email, password }, { skipAuth: true });

    setAccessToken(data.accessToken);
    setUser(data.user);
    syncUserToLegacy(data.user);
    saveCachedUser(data.user);
    activateApiMode(data.accessToken);
    scheduleTokenRefresh();

    // Hidrata localStorage com dados deste usuário, sobrescrevendo dados antigos.
    hydrateFromApi()
      .then(() => refreshLegacyDashboardData())
      .catch(() => {});

    return data;
  }, [activateApiMode, scheduleTokenRefresh]);

  const register = useCallback(async ({ name, email, password }) => {
    const data = await apiClient.post('/auth/register', { name, email, password }, { skipAuth: true });

    setAccessToken(data.accessToken);
    setUser(data.user);
    syncUserToLegacy(data.user);
    saveCachedUser(data.user);
    activateApiMode(data.accessToken);
    scheduleTokenRefresh();

    // Novo usuário — hydrate retorna dados vazios (ok), mas garante modo API ativo.
    hydrateFromApi()
      .then(() => refreshLegacyDashboardData())
      .catch(() => {});

    return data;
  }, [activateApiMode, scheduleTokenRefresh]);

  const handleLogout = useCallback(async (callApi = true) => {
    if (callApi) {
      try {
        await apiClient.post('/auth/logout', null, { skipAuth: true });
      } catch {
        // Silencioso — logout local sempre acontece
      }
    }

    setAccessToken(null);
    setUser(null);
    saveCachedUser(null);

    // Limpa dados do usuário do localStorage antes de desativar o modo API,
    // para que o próximo login (ou outro usuário) comece com localStorage vazio.
    clearLocalUserData();
    deactivateApiMode();

    // Notifica os hooks React para re-renderizar com dados em branco.
    refreshLegacyDashboardData();
  }, [deactivateApiMode]);

  // Mantém o ref sempre apontando para o handleLogout atual, sem criar
  // dependência circular nos useCallbacks que precisam chamá-lo do setTimeout.
  useEffect(() => {
    handleLogoutRef.current = handleLogout;
  }, [handleLogout]);

  const value = useMemo(() => ({
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout: handleLogout,
  }), [user, accessToken, isLoading, login, register, handleLogout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
