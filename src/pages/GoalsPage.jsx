import { useMemo, useRef, useState } from 'react';
import { GoalCard } from '../components/goals/GoalCard.jsx';
import { GoalForm } from '../components/goals/GoalForm.jsx';
import { GoalSummary } from '../components/goals/GoalSummary.jsx';
import { Button, EmptyState, useToast } from '../components/ui/index.js';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import {
  addFinancialGoal,
  addValueToFinancialGoal,
  deleteFinancialGoal,
  updateFinancialGoal
} from '../services/financialGoals.js';

export function GoalsPage() {
  const { goals, refreshFinancialGoals } = useDashboardContext();
  const [editingGoal, setEditingGoal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const formRef = useRef(null);
  const showToast = useToast();

  const sortedGoals = useMemo(
    () => [...goals.items].sort((a, b) => Number(a.completed) - Number(b.completed)),
    [goals.items]
  );

  function scrollToForm() {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNewGoal() {
    setEditingGoal(null);
    setMessage('');
    setShowForm(true);
    scrollToForm();
  }

  function handleSubmit(form) {
    try {
      if (editingGoal) {
        updateFinancialGoal(editingGoal.id, form);
        setEditingGoal(null);
        setShowForm(false);
        setMessage('Meta atualizada.');
        showToast({ title: 'Meta atualizada', description: 'O progresso foi recalculado.', tone: 'success' });
      } else {
        addFinancialGoal(form);
        setShowForm(false);
        setMessage('Meta criada.');
        showToast({ title: 'Meta criada', description: 'A nova meta já aparece no painel.', tone: 'success' });
      }

      refreshFinancialGoals();
      return true;
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível salvar', description: error.message, tone: 'error' });
      return false;
    }
  }

  function handleAddValue(id, amount) {
    try {
      addValueToFinancialGoal(id, amount);
      refreshFinancialGoals();
      showToast({ title: 'Valor adicionado', description: 'O progresso da meta foi atualizado.', tone: 'success' });
    } catch (error) {
      showToast({ title: 'Não foi possível adicionar', description: error.message, tone: 'error' });
    }
  }

  function handleDelete(id) {
    const goal = goals.items.find(item => item.id === id);
    const confirmed = window.confirm(`Excluir a meta "${goal?.title || 'selecionada'}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    try {
      deleteFinancialGoal(id);
      if (editingGoal?.id === id) setEditingGoal(null);
      refreshFinancialGoals();
      setMessage('Meta excluída.');
      showToast({ title: 'Meta excluída', description: 'A lista de metas foi atualizada.', tone: 'success' });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível excluir', description: error.message, tone: 'error' });
    }
  }

  return (
    <section className="space-y-4">
      <GoalSummary summary={goals.summary} />

      <div ref={formRef}>
        {!showForm ? (
          <Button type="button" onClick={handleNewGoal}>Nova meta</Button>
        ) : (
          <GoalForm
            editingGoal={editingGoal}
            message={message}
            onCancelEdit={() => {
              setEditingGoal(null);
              setMessage('');
              setShowForm(false);
            }}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {sortedGoals.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {sortedGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={goalToEdit => {
                setEditingGoal(goalToEdit);
                setShowForm(true);
                setMessage('Editando meta.');
                scrollToForm();
              }}
              onDelete={handleDelete}
              onAddValue={handleAddValue}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[14px] border border-finance-border bg-white dark:bg-slate-900">
          <EmptyState className="py-14">
            Nenhuma meta cadastrada ainda. Crie uma meta para acompanhar seu progresso financeiro.
          </EmptyState>
        </div>
      )}
    </section>
  );
}
