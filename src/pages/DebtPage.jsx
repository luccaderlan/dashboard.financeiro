import { useMemo, useRef, useState } from 'react';
import { ActiveDebtTable, PaidDebtTable } from '../components/DebtTable.jsx';
import { DebtEntryForm } from '../components/DebtEntryForm.jsx';
import { DebtSummary } from '../components/DebtSummary.jsx';
import { Button, Card, CardContent, Field, Input, MoneyInput, useToast } from '../components/ui/index.js';
import { useDashboardContext, useDashboardRefresh } from '../context/DashboardContext.jsx';
import { useLegacyDebts } from '../hooks/useLegacyDebts.js';
import { getCategoryOptions } from '../services/financialCategories.js';
import { deleteLegacyDebt, markLegacyDebtAsPaid } from '../services/legacyDebtWrite.js';

const initialFilters = {
  category: 'todas',
  date: '',
  description: '',
  value: ''
};

function moneyMatches(filterValue, values) {
  if (filterValue === '') return true;

  const parsedFilter = parseFloat(filterValue);
  if (Number.isNaN(parsedFilter)) return true;

  return values.some(value => Math.abs((parseFloat(value) || 0) - parsedFilter) < 0.01);
}

function filterActiveDebts(debts, filters) {
  const normalizedDescription = filters.description.trim().toLowerCase();

  return debts.filter(debt => {
    const searchableText = `${debt.description || ''} ${debt.notes || ''}`.toLowerCase();

    return (filters.category === 'todas' || debt.category === filters.category)
      && (!filters.date || debt.dueDate === filters.date)
      && (!normalizedDescription || searchableText.includes(normalizedDescription))
      && moneyMatches(filters.value, [debt.totalValue, debt.paidValue, debt.remainingValue]);
  });
}

function filterPaidDebts(debts, filters) {
  const normalizedDescription = filters.description.trim().toLowerCase();

  return debts.filter(debt => {
    const searchableText = `${debt.description || ''} ${debt.notes || ''}`.toLowerCase();

    return (filters.category === 'todas' || debt.category === filters.category)
      && (!filters.date || debt.dueDate === filters.date)
      && (!normalizedDescription || searchableText.includes(normalizedDescription))
      && moneyMatches(filters.value, [debt.totalValue]);
  });
}

export function DebtPage() {
  const { activeDebts, paidDebts, summary } = useLegacyDebts();
  const { categories } = useDashboardContext();
  const [filters, setFilters] = useState(initialFilters);
  const [message, setMessage] = useState('');
  const [editingDebt, setEditingDebt] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const refreshDashboardData = useDashboardRefresh();
  const showToast = useToast();

  const filteredActiveDebts = useMemo(
    () => filterActiveDebts(activeDebts, filters),
    [activeDebts, filters]
  );
  const filteredPaidDebts = useMemo(
    () => filterPaidDebts(paidDebts, filters),
    [paidDebts, filters]
  );
  const categoryOptions = useMemo(() => {
    const options = getCategoryOptions(categories, 'divida');
    const seenValues = new Set(options.map(option => option.value));
    const legacyOptions = [...activeDebts, ...paidDebts]
      .map(debt => debt.category)
      .filter(category => category && !seenValues.has(category))
      .map(category => {
        seenValues.add(category);
        return { id: `legacy-divida-${category}`, value: category, label: category };
      });

    return [{ id: 'todas', value: 'todas', label: 'Todas' }, ...options, ...legacyOptions];
  }, [activeDebts, categories, paidDebts]);

  function updateFilter(field, value) {
    setMessage('');
    setFilters(current => ({ ...current, [field]: value }));
  }

  function clearFilters() {
    setMessage('');
    setFilters(initialFilters);
  }

  function scrollToForm() {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNewDebt() {
    setMessage('');
    setEditingDebt(null);
    setShowForm(true);
    scrollToForm();
  }

  function handlePayDebt(id) {
    try {
      markLegacyDebtAsPaid(id);
      refreshDashboardData();

      if (editingDebt?.id === id) {
        setEditingDebt(null);
      }

      setMessage('Dívida marcada como paga.');
      showToast({ title: 'Dívida paga', description: 'Dashboard, próximas contas e KPIs foram atualizados.', tone: 'success' });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível pagar', description: error.message, tone: 'error' });
    }
  }

  function handleEditDebt(debt) {
    setMessage('Editando dívida selecionada.');
    setEditingDebt(debt);
    setShowForm(true);
    scrollToForm();
  }

  function handleCancelEdit() {
    setMessage('');
    setEditingDebt(null);
    setShowForm(false);
  }

  function handleDebtSaved(mode) {
    setEditingDebt(null);
    setShowForm(false);
    setMessage(mode === 'edit' ? 'Dívida atualizada.' : '');
  }

  function handleDeleteDebt(debt) {
    const confirmed = window.confirm(`Excluir a dívida "${debt.description}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    try {
      deleteLegacyDebt(debt.id);
      refreshDashboardData();

      if (editingDebt?.id === debt.id) {
        setEditingDebt(null);
      }

      setMessage('Dívida excluída.');
      showToast({ title: 'Dívida excluída', description: 'KPIs, próximas contas e listas foram atualizados.', tone: 'success' });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível excluir', description: error.message, tone: 'error' });
    }
  }

  return (
    <section className="space-y-4">
      <DebtSummary summary={summary} />

      <div ref={formRef}>
        {!showForm ? (
          <Button type="button" onClick={handleNewDebt}>Nova dívida</Button>
        ) : (
          <DebtEntryForm
            editingDebt={editingDebt}
            onCancelEdit={handleCancelEdit}
            onSaved={handleDebtSaved}
          />
        )}
      </div>

      {message ? (
        <div className="rounded-[10px] border border-finance-border bg-white px-4 py-3 text-sm font-medium text-finance-muted dark:bg-slate-900">
          {message}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {categoryOptions.map(option => {
          const active = filters.category === option.value;
          return (
            <Button
              key={option.id}
              className="rounded-full px-4 py-2"
              size="sm"
              variant={active ? 'primary' : 'ghost'}
              type="button"
              onClick={() => updateFilter('category', option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[160px_1fr_160px_auto]">
            <Field label="Data">
              <Input
                type="date"
                value={filters.date}
                onChange={event => updateFilter('date', event.target.value)}
              />
            </Field>

            <Field label="Descrição">
              <Input
                placeholder="Buscar dívida..."
                value={filters.description}
                onChange={event => updateFilter('description', event.target.value)}
              />
            </Field>

            <Field label="Valor">
              <MoneyInput
                min="0"
                placeholder="0,00"
                value={filters.value}
                onChange={event => updateFilter('value', event.target.value)}
              />
            </Field>

            <Button
              className="w-full self-end sm:w-auto"
              variant="ghost"
              type="button"
              onClick={clearFilters}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <ActiveDebtTable
        debts={filteredActiveDebts}
        onPay={handlePayDebt}
        onEdit={handleEditDebt}
        onDelete={handleDeleteDebt}
      />
      <PaidDebtTable
        debts={filteredPaidDebts}
        onEdit={handleEditDebt}
        onDelete={handleDeleteDebt}
      />
    </section>
  );
}
