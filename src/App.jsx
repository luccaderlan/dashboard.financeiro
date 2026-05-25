import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { DashboardProvider } from './context/DashboardContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Skeleton, ToastProvider } from './components/ui/index.js';
import { AppLayout } from './layouts/AppLayout.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute.jsx';
import { BudgetsPage } from './pages/BudgetsPage.jsx';
import { CashFlowPage } from './pages/CashFlowPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { DebtPage } from './pages/DebtPage.jsx';
import { GoalsPage } from './pages/GoalsPage.jsx';
import { LoansPage } from './pages/LoansPage.jsx';
import { RecurrencesPage } from './pages/RecurrencesPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import TermsPage from './pages/TermsPage.jsx';

const ReportsPage = lazy(() => import('./pages/ReportsPage.jsx')
  .then(module => ({ default: module.ReportsPage })));

function ReportsFallback() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-finance-border bg-finance-surface p-5 shadow-sm">
        <Skeleton className="mb-4 h-5 w-44" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-finance-border bg-finance-surface p-4 shadow-sm">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardProvider>
          <ToastProvider>
            <HashRouter>
              <Routes>
                {/* Rotas publicas - redirecionam para / se ja autenticado */}
                <Route
                  path="/login"
                  element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>}
                />
                <Route
                  path="/register"
                  element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>}
                />
                <Route
                  path="/forgot-password"
                  element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>}
                />
                <Route
                  path="/reset-password"
                  element={<ResetPasswordPage />}
                />
                <Route
                  path="/termos"
                  element={<TermsPage />}
                />

                {/* Rotas protegidas - redirecionam para /login se nao autenticado */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="fluxo" element={<CashFlowPage />} />
                  <Route path="dividas" element={<DebtPage />} />
                  <Route path="emprestimos" element={<LoansPage />} />
                  <Route path="metas" element={<GoalsPage />} />
                  <Route path="categorias" element={<Navigate to="/configuracoes" replace />} />
                  <Route path="recorrencias" element={<RecurrencesPage />} />
                  <Route path="orcamentos" element={<BudgetsPage />} />
                  <Route
                    path="relatorios"
                    element={(
                      <Suspense fallback={<ReportsFallback />}>
                        <ReportsPage />
                      </Suspense>
                    )}
                  />
                  <Route path="configuracoes" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </HashRouter>
          </ToastProvider>
        </DashboardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
