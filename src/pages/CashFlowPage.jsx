import { useRef, useMemo, useState } from 'react';
import { CashFlowEntryForm } from '../components/CashFlowEntryForm.jsx';
import { CashFlowList } from '../components/CashFlowList.jsx';
import { Button, Card, CardContent, Field, Input, MoneyInput, Select, useToast } from '../components/ui/index.js';
import { useDashboardRefresh } from '../context/DashboardContext.jsx';
import { useLegacyCashFlow } from '../hooks/useLegacyCashFlow.js';
import { deleteAllLegacyCashFlowItems, deleteLegacyCashFlowItem } from '../services/legacyCashFlowWrite.js';
import { formatCurrency } from '../utils/formatters.js';

const initialFilters = {
  type: 'todos',
  date: '',
  description: '',
  value: ''
};

function moneyMatches(filterValue, value) {
  if (filterValue === '') return true;

  const parsedFilter = parseFloat(filterValue);
  if (Number.isNaN(parsedFilter)) return true;

  return Math.abs((parseFloat(value) || 0) - parsedFilter) < 0.01;
}

function getCashFlowTotals(items) {
  return items.reduce(
    (totals, item) => {
      if (item.type === 'entrada') {
        totals.income += item.value;
      } else {
        totals.expenses += item.value;
      }

      totals.balance = totals.income - totals.expenses;
      return totals;
    },
    { income: 0, expenses: 0, balance: 0 }
  );
}

function SummaryMetric({ label, value, tone = 'default' }) {
  const toneClasses = {
    green: 'text-finance-green',
    red: 'text-finance-red',
    default: 'text-finance-text'
  };

  return (
    <div>
      <div className="text-xs font-semibold uppercase text-finance-muted">{label}</div>
      <div className={['mt-1 break-all font-number text-lg font-bold tabular-nums sm:text-xl', toneClasses[tone]].join(' ')}>
        {value}
      </div>
    </div>
  );
}

export function CashFlowPage() {
  const cashFlowItems = useLegacyCashFlow();
  const [filters, setFilters] = useState(initialFilters);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const refreshDashboardData = useDashboardRefresh();
  const showToast = useToast();

  const totals = useMemo(() => getCashFlowTotals(cashFlowItems), [cashFlowItems]);

  const filteredItems = useMemo(() => {
    const normalizedDescription = filters.description.trim().toLowerCase();

    return cashFlowItems.filter(item => {
      const searchableText = `${item.description || ''} ${item.category || ''}`.toLowerCase();

      return (filters.type === 'todos' || item.type === filters.type)
        && (!filters.date || item.date === filters.date)
        && (!normalizedDescription || searchableText.includes(normalizedDescription))
        && moneyMatches(filters.value, item.value);
    });
  }, [cashFlowItems, filters]);

  function updateFilter(field, value) {
    setFilters(current => ({ ...current, [field]: value }));
  }

  function clearFilters() {
    setFilters(initialFilters);
  }

  function scrollToForm() {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNewItem() {
    if (showForm && !editingItem) {
      setShowForm(false);
      return;
    }
    setEditingItem(null);
    setShowForm(true);
    scrollToForm();
  }

  function handleEditItem(item) {
    setEditingItem(item);
    setShowForm(true);
    scrollToForm();
  }

  function handleDelete(item) {
    const confirmed = window.confirm(`Excluir o lançamento "${item.description}"?`);
    if (!confirmed) return;

    try {
      deleteLegacyCashFlowItem(item.id);
      if (editingItem?.id === item.id) setEditingItem(null);
      refreshDashboardData();
      showToast({
        title: 'Lançamento excluído',
        description: 'Entradas, saídas, KPIs e gráficos foram atualizados.',
        tone: 'success'
      });
    } catch (error) {
      showToast({ title: 'Não foi possível excluir', description: error.message, tone: 'error' });
    }
  }

  function handleClearAll() {
    if (!cashFlowItems.length) return;

    const firstConfirmation = window.confirm('Limpar todas as entradas e saídas? Dívidas, empréstimos, metas e configurações serão preservados.');
    if (!firstConfirmation) return;

    const typed = window.prompt('Para confirmar, digite LIMPAR.');
    if (typed !== 'LIMPAR') return;

    try {
      deleteAllLegacyCashFlowItems();
      setEditingItem(null);
      setShowForm(false);
      refreshDashboardData();
      showToast({
        title: 'Entradas e saídas limpas',
        description: 'Somente os lançamentos do fluxo financeiro foram removidos.',
        tone: 'success'
      });
    } catch (error) {
      showToast({ title: 'Não foi possível limpar', description: error.message, tone: 'error' });
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[14px] border border-finance-border bg-white p-4 dark:bg-slate-900 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryMetric label="Entradas" value={formatCurrency(totals.income)} tone="green" />
          <SummaryMetric label="Saídas" value={formatCurrency(totals.expenses)} tone="red" />
          <SummaryMetric
            label="Saldo"
            value={formatCurrency(totals.balance)}
            tone={totals.balance >= 0 ? 'green' : 'red'}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2" ref={formRef}>
        <Button type="button" onClick={handleNewItem}>Novo lançamento</Button>
        {cashFlowItems.length ? (
          <Button type="button" variant="danger" onClick={handleClearAll}>
            Limpar entradas e saídas
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <CashFlowEntryForm
          editingItem={editingItem}
          onCancelEdit={() => {
            setEditingItem(null);
            setShowForm(false);
          }}
          onSaved={() => {
            setEditingItem(null);
            setShowForm(false);
          }}
        />
      ) : null}

      <Card>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[140px_1fr_160px_160px_auto]">
            <Field label="Tipo">
              <Select
                value={filters.type}
                onChange={event => updateFilter('type', event.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="saida">Saídas</option>
              </Select>
            </Field>

            <Field label="Descrição ou categoria">
              <Input
                placeholder="Buscar lançamento..."
                value={filters.description}
                onChange={event => updateFilter('description', event.target.value)}
              />
            </Field>

            <Field label="Data">
              <Input
                type="date"
                value={filters.date}
                onChange={event => updateFilter('date', event.target.value)}
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

      <CashFlowList
        items={filteredItems}
        onDelete={handleDelete}
        onEdit={handleEditItem}
        showTypeFilters={false}
        title="Lançamentos"
      />
    </section>
  );
}
