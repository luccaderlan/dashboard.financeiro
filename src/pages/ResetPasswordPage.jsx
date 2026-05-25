import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, ApiError } from '../services/api/apiClient.js';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Link inválido. Solicite um novo link de redefinição.');
    }
  }, [token]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password: form.password,
      }, { skipAuth: true });

      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível conectar ao servidor. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-finance-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-finance-text tracking-tight">MeuControle</h1>
          <p className="text-finance-muted text-sm mt-1">Redefinição de senha</p>
        </div>

        <div className="bg-finance-surface border border-finance-border rounded-2xl p-6 shadow-sm shadow-slate-900/[0.04]">
          {success ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-lg font-semibold text-finance-text mb-2">Senha redefinida!</h2>
              <p className="text-finance-muted text-sm leading-relaxed">
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-finance-text mb-5">Criar nova senha</h2>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-finance-red text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-finance-muted font-medium" htmlFor="password">
                    Nova senha
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={!token}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className="bg-finance-bg border border-finance-border text-finance-text placeholder:text-finance-muted/70 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finance-accent focus:border-transparent transition disabled:opacity-50"
                  />
                  <p className="text-xs text-finance-muted">Use maiúsculas, minúsculas e números.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-finance-muted font-medium" htmlFor="confirmPassword">
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    disabled={!token}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-finance-bg border border-finance-border text-finance-text placeholder:text-finance-muted/70 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finance-accent focus:border-transparent transition disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="mt-1 bg-finance-accent hover:opacity-90 disabled:opacity-60 text-finance-text font-semibold rounded-lg py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-finance-accent focus:ring-offset-2 focus:ring-offset-finance-surface"
                >
                  {isLoading ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <p className="text-center text-finance-muted text-sm mt-5">
            <Link to="/forgot-password" className="text-finance-accent hover:opacity-80 transition font-medium">
              ← Solicitar novo link
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
