import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Protege rotas que exigem autenticação.
 * Enquanto verifica a sessão, exibe um loader.
 * Se não autenticado, redireciona para /login preservando a rota original.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-finance-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-finance-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-finance-muted text-sm">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Rota pública — redireciona para / se já estiver autenticado.
 * Usado em /login e /register.
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-finance-bg">
        <div className="w-8 h-8 border-2 border-finance-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
