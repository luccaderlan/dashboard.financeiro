import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Field, Input, MoneyInput, Select, useToast } from '../components/ui/index.js';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import { calculateBudgetUsage, addFinancialBudget, deleteFinancialBudget, getCurrentBudgetMonth, updateFinancialBudget } from '../services/financialBudgets.js';
import { getCategoryOptions } from '../services/financialCategories.js';
import { formatCurrency } from '../utils/formatters.js';

const initialForm = {
  category: 'Outro',
  limit: '',
  month: getCurrentBudgetMonth()
};

function createInitialForm(categories = [], month = getCurrentBudgetMonth()) {
  const options = getCategoryOptions(categories, 'saida');

  return {
    category: options[0]?.value || 'Outro',
    limit: '',
    month
  };
}

function formFromBudget(budget, categories, month) {
  if (!budget) return createInitialForm(categories, month);

  return {
    category: budget.category,
    limit: budget.limit,
    month: budget.month
  };
}

function statusMeta(status) {
  const map = {
    normal: { label: 'Normal', tone: 'green', bar: 'bg-finance-green' },
    near: { label: 'Próximo do limite', tone: 'yellow', bar: 'bg-finance-yellow' },
    over: { label: 'Ultrapassado', tone: 'red', bar: 'bg-finance-red' }
  };

  return map[status] || map.normal;
}

function BudgetCard({ budget, onEdit, onDelete }) {
  const meta = statusMeta(budget.status);
  const progressWidth = Math.min(100, Math.max(0, budget.percent));

  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words text-base font-bold text-finance-text">{budget.category}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone={meta.tone}>{meta.label}</Badge>
            <Badge>{budget.month}</Badge>
          </div>
        </div>
        <div className="break-all font-number text-xl font-bold tabular-nums text-finance-blue">
          {budget.percent}%
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap justify-between gap-3 text-sm font-semibold text-finance-muted">
          <span>Gasto: {formatCurrency(budget.spent)}</span>
          <span>Limite: {formatCurrency(budget.limit)}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={['h-3 rounded-full transition-all duration-300', meta.bar].join(' ')}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      <div className="text-sm font-semibold text-finance-muted">
        Restante: <span className={budget.remaining >= 0 ? 'text-finance-green' : 'text-finance-red'}>{formatCurrency(budget.remaining)}</span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" type="button" onClick={() => onEdit(budget)}>
          Editar
        </Button>
        <Button size="sm" variant="danger" type="button" onClick={() => onDelete(budget)}>
          Excluir
        </Button>
      </div>
    </Card>
  );
}

function SummaryMetric({ label, value, tone = 'default' }) {
  const toneClasses = {
    green: 'text-finance-green',
    red: 'text-finance-red',
    yellow: 'text-finance-yellow',
    default: 'text-finance-text'
  };

  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase text-finance-muted">{label}</div>
      <div className={['mt-2 break-all font-number text-lg font-bold tabular-nums sm:text-xl', toneClasses[tone]].join(' ')}>
        {value}
      </div>
    </Card>
  );
}

export function BudgetsPage() {
  const { budgets, cashFlow, categories, refreshFinancialBudgets } = useDashboardContext();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentBudgetMonth);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => createInitialForm(categories, selectedMonth));
  const [message, setMessage] = useState('');
  const formRef = useRef(null);
  const showToast = useToast();
  const isEditing = Boolean(editingBudget);

  const categoryOptions = useMemo(
    () => getCategoryOptions(categories, 'saida', form.category),
    [categories, form.category]
  );
  const budgetUsage = useMemo(
    () => calculateBudgetUsage(budgets, cashFlow, selectedMonth),
    [budgets, cashFlow, selectedMonth]
  );

  useEffect(() => {
    setForm(formFromBudget(editingBudget, categories, selectedMonth));
    setMessage('');
  }, [categories, editingBudget, selectedMonth]);

  function updateField(field, value) {
    setMessage('');
    setForm(current => ({ ...current, [field]: value }));
  }

  function scrollToForm() {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNewBudget() {
    setEditingBudget(null);
    setShowForm(true);
    setMessage('');
    scrollToForm();
  }

  function handleEditBudget(budget) {
    setEditingBudget(budget);
    setShowForm(true);
    scrollToForm();
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      if (isEditing) {
        updateFinancialBudget(editingBudget.id, form);
        setEditingBudget(null);
        setShowForm(false);
        setMessage('Orçamento atualizado.');
        showToast({ title: 'Orçamento atualizado', description: 'O consumo foi recalculado.', tone: 'success' });
      } else {
        addFinancialBudget(form);
        setForm(createInitialForm(categories, form.month));
        setShowForm(false);
        setMessage('Orçamento criado.');
        showToast({ title: 'Orçamento criado', description: 'Agora ele acompanha os gastos do mês.', tone: 'success' });
      }

      setSelectedMonth(form.month);
      refreshFinancialBudgets();
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível salvar', description: error.message, tone: 'error' });
    }
  }

  function handleDelete(budget) {
    const confirmed = window.confirm(`Excluir o orçamento de "${budget.category}" em ${budget.month}?`);
    if (!confirmed) return;

    try {
      deleteFinancialBudget(budget.id);

      if (editingBudget?.id === budget.id) {
        setEditingBudget(null);
        setShowForm(false);
      }

      refreshFinancialBudgets();
      setMessage('Orçamento excluído.');
      showToast({ title: 'Orçamento excluído', description: 'Os lançamentos financeiros foram preservados.', tone: 'success' });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível excluir', description: error.message, tone: 'error' });
    }
  }

  return (
    <section className="space-y-4">
      <div ref={formRef}>
        {!showForm ? (
          <Button type="button" onClick={handleNewBudget}>Novo orçamento</Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Editar orçamento' : 'Novo orçamento'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-[1fr_160px_160px_auto]" onSubmit={handleSubmit}>
                <Field label="Categoria">
                  <Select value={form.category} onChange={event => updateField('category', event.target.value)}>
                    {categoryOptions.map(category => (
                      <option key={category.id} value={category.value}>{category.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Mês e ano">
                  <Input
                    type="month"
                    value={form.month}
                    onChange={event => updateField('month', event.target.value || getCurrentBudgetMonth())}
                  />
                </Field>

                <Field label="Limite">
                  <MoneyInput
                    min="0"
                    placeholder="0,00"
                    value={form.limit}
                    onChange={event => updateField('limit', event.target.value)}
                  />
                </Field>

                <div className="flex flex-wrap items-end gap-2">
                  <Button className="w-full sm:w-auto" type="submit">
                    {isEditing ? 'Salvar' : 'Criar'}
                  </Button>
                  {isEditing ? (
                    <Button
                      className="w-full sm:w-auto"
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setEditingBudget(null);
                        setShowForm(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  ) : null}
                </div>

                {message ? (
                  <div className="text-sm font-medium text-finance-muted md:col-span-4">{message}</div>
                ) : null}
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[220px_1fr] md:items-end">
            <Field label="Ver mês">
              <Input
                type="month"
                value={selectedMonth}
                onChange={event => setSelectedMonth(event.target.value || getCurrentBudgetMonth())}
              />
            </Field>
            <div className="rounded-[10px] border border-finance-border bg-slate-50 px-4 py-3 text-sm font-medium text-finance-muted dark:bg-slate-950">
              Os gastos consideram apenas saídas do mês selecionado, incluindo lançamentos gerados por recorrências.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryMetric label="Limite total" value={formatCurrency(budgetUsage.summary.limit)} />
        <SummaryMetric label="Gasto" value={formatCurrency(budgetUsage.summary.spent)} tone={budgetUsage.summary.spent > budgetUsage.summary.limit ? 'red' : 'yellow'} />
        <SummaryMetric label="Restante" value={formatCurrency(budgetUsage.summary.remaining)} tone={budgetUsage.summary.remaining >= 0 ? 'green' : 'red'} />
        <SummaryMetric label="Ultrapassados" value={`${budgetUsage.summary.overCount} item(s)`} tone={budgetUsage.summary.overCount ? 'red' : 'green'} />
      </div>

      {budgetUsage.items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {budgetUsage.items.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditBudget}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[14px] border border-finance-border bg-white dark:bg-slate-900">
          <EmptyState className="py-14">
            Nenhum orçamento cadastrado para este mês.
          </EmptyState>
        </div>
      )}
    </section>
  );
}
