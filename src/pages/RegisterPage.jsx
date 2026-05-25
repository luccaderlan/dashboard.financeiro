import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiError } from '../services/api/apiClient.js';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    if (!acceptedTerms) {
      setError('Você precisa aceitar os termos de uso para criar uma conta.');
      return;
    }

    if (form.password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
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
    <div className="min-h-screen flex items-center justify-center bg-finance-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo / título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-finance-text tracking-tight">MeuControle</h1>
          <p className="text-finance-muted text-sm mt-1">Comece a controlar suas finanças agora</p>
        </div>

        <div className="bg-finance-surface border border-finance-border rounded-2xl p-6 shadow-sm shadow-slate-900/[0.04]">
          <h2 className="text-lg font-semibold text-finance-text mb-5">Criar conta gratuita</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-finance-red text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-finance-muted font-medium" htmlFor="name">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                className="bg-finance-bg border border-finance-border text-finance-text placeholder:text-finance-muted/70 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finance-accent focus:border-transparent transition"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                className="bg-finance-bg border border-finance-border text-finance-text placeholder:text-finance-muted/70 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finance-accent focus:border-transparent transition"
              />
              <p className="text-xs text-finance-muted">Use maiúsculas, minúsculas e números.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-finance-muted font-medium" htmlFor="confirmPassword">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-finance-bg border border-finance-border text-finance-text placeholder:text-finance-muted/70 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-finance-accent focus:border-transparent transition"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 accent-[rgb(var(--finance-accent))] w-4 h-4 flex-shrink-0"
              />
              <span className="text-xs text-finance-muted leading-relaxed">
                Eu li e aceito os{' '}
                <Link to="/termos" className="text-finance-accent hover:opacity-80 transition">
                  Termos de Uso e Política de Privacidade
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || !acceptedTerms}
              className="mt-1 bg-finance-accent hover:opacity-90 disabled:opacity-60 text-finance-text font-semibold rounded-lg py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-finance-accent focus:ring-offset-2 focus:ring-offset-finance-surface"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-finance-muted text-sm mt-5">
          Já tem conta?{' '}
          <Link to="/login" className="text-finance-accent hover:opacity-80 transition font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
