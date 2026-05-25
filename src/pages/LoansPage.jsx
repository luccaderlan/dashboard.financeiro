import { useRef, useState } from 'react';
import { LoanEntryForm } from '../components/LoanEntryForm.jsx';
import { LoanSummary } from '../components/LoanSummary.jsx';
import { LoanTable } from '../components/LoanTable.jsx';
import { Button, useToast } from '../components/ui/index.js';
import { useDashboardRefresh } from '../context/DashboardContext.jsx';
import { useLegacyLoans } from '../hooks/useLegacyLoans.js';
import { deleteLegacyLoan, payLegacyLoanInstallment } from '../services/legacyLoanWrite.js';

export function LoansPage() {
  const { items, summary } = useLegacyLoans();
  const [editingLoan, setEditingLoan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const formRef = useRef(null);
  const refreshDashboardData = useDashboardRefresh();
  const showToast = useToast();

  function scrollToForm() {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNewLoan() {
    setMessage('');
    setEditingLoan(null);
    setShowForm(true);
    scrollToForm();
  }

  function handleEditLoan(loan) {
    setMessage('Editando empréstimo selecionado.');
    setEditingLoan(loan);
    setShowForm(true);
    scrollToForm();
  }

  function handleCancelEdit() {
    setMessage('');
    setEditingLoan(null);
    setShowForm(false);
  }

  function handleLoanSaved(mode) {
    setEditingLoan(null);
    setShowForm(false);
    setMessage(mode === 'edit' ? 'Empréstimo atualizado.' : '');
  }

  function handlePayInstallment(loan) {
    try {
      payLegacyLoanInstallment(loan.id);
      refreshDashboardData();
      showToast({
        title: 'Parcela registrada',
        description: `Parcela de "${loan.description}" registrada. Progresso atualizado.`,
        tone: 'success'
      });
    } catch (error) {
      showToast({ title: 'Não foi possível registrar', description: error.message, tone: 'error' });
    }
  }

  function handleDeleteLoan(loan) {
    const confirmed = window.confirm(`Excluir o empréstimo "${loan.description}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    try {
      deleteLegacyLoan(loan.id);
      refreshDashboardData();

      if (editingLoan?.id === loan.id) {
        setEditingLoan(null);
      }

      setMessage('Empréstimo excluído.');
      showToast({ title: 'Empréstimo excluído', description: 'Tabela, resumo e dashboard foram atualizados.', tone: 'success' });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível excluir', description: error.message, tone: 'error' });
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[14px] border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-100">
        <div className="mb-2 font-bold text-blue-700 dark:text-blue-300">Qual é a diferença entre dívida e empréstimo?</div>
        <p>
          Dívidas são contas com valor fixo. Empréstimos e financiamentos usam parcelas, juros e progresso de pagamento.
        </p>
      </div>

      <LoanSummary summary={summary} />
      <div ref={formRef}>
        {!showForm ? (
          <Button type="button" onClick={handleNewLoan}>Novo empréstimo</Button>
        ) : (
          <LoanEntryForm
            editingLoan={editingLoan}
            onCancelEdit={handleCancelEdit}
            onSaved={handleLoanSaved}
          />
        )}
      </div>

      {message ? (
        <div className="rounded-[10px] border border-finance-border bg-white px-4 py-3 text-sm font-medium text-finance-muted dark:bg-slate-900">
          {message}
        </div>
      ) : null}

      <LoanTable loans={items} onEdit={handleEditLoan} onDelete={handleDeleteLoan} onPayInstallment={handlePayInstallment} />
    </section>
  );
}
