import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiError } from '../services/api/apiClient.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(form);
      navigate('/', { replace: true });
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
    <div className="min-h-screen flex items-center justify-center bg-finance-bg text-finance-text px-4">
      <div className="w-full max-w-sm">
        {/* Logo / título */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-finance-text">MeuControle</h1>
          <p className="text-finance-muted text-sm mt-1">Seu dashboard financeiro pessoal</p>
        </div>

        <div className="bg-finance-surface border border-finance-border rounded-2xl p-6 shadow-sm shadow-slate-900/[0.04]">
          <h2 className="text-lg font-semibold text-finance-text mb-5">Entrar na conta</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-finance-red text-sm rounded-lg px-4 py-3 mb-4 dark:bg-red-950/40 dark:border-red-900/60">
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
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="bg-finance-bg border border-finance-border text-finance-text placeholder:text-finance-muted/70 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finance-accent focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-finance-muted font-medium" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-finance-bg border border-finance-border text-finance-text placeholder:text-finance-muted/70 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finance-accent focus:border-transparent transition"
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-finance-accent hover:opacity-80 transition font-medium">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 bg-finance-accent hover:opacity-90 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-finance-accent focus:ring-offset-2 focus:ring-offset-finance-surface"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-finance-muted text-sm mt-5">
          Ainda não tem conta?{' '}
          <Link to="/register" className="text-finance-accent hover:opacity-80 transition font-medium">
            Criar conta gratuita
          </Link>
        </p>
      </div>
    </div>
  );
}
