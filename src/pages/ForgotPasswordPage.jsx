import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiError } from '../services/api/apiClient.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/forgot-password', { email }, { skipAuth: true });
      setSent(true);
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
          <p className="text-finance-muted text-sm mt-1">Recuperação de senha</p>
        </div>

        <div className="bg-finance-surface border border-finance-border rounded-2xl p-6 shadow-sm shadow-slate-900/[0.04]">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-lg font-semibold text-finance-text mb-2">Verifique seu e-mail</h2>
              <p className="text-finance-muted text-sm leading-relaxed">
                Se este e-mail estiver cadastrado, você receberá as instruções para
                redefinir sua senha em instantes.
              </p>
              <p className="text-finance-muted text-xs mt-4">
                Não recebeu? Verifique sua caixa de spam.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-finance-text mb-2">Esqueci minha senha</h2>
              <p className="text-finance-muted text-sm mb-5 leading-relaxed">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-finance-red text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-finance-muted font-medium" htmlFor="email">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-finance-bg border border-finance-border text-finance-text placeholder:text-finance-muted/70 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finance-accent focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 bg-finance-accent hover:opacity-90 disabled:opacity-60 text-finance-text font-semibold rounded-lg py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-finance-accent focus:ring-offset-2 focus:ring-offset-finance-surface"
                >
                  {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-finance-muted text-sm mt-5">
          <Link to="/login" className="text-finance-accent hover:opacity-80 transition font-medium">
            ← Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
