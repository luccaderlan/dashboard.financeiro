import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Field, Input, MoneyInput, Select, useToast } from '../components/ui/index.js';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import { getCategoryOptions } from '../services/financialCategories.js';
import {
  RECURRENCE_TYPES,
  addFinancialRecurrence,
  applyDueRecurrences,
  deleteFinancialRecurrence,
  updateFinancialRecurrence
} from '../services/financialRecurrences.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const initialForm = {
  type: 'saida',
  desc: '',
  valor: '',
  cat: 'Outro',
  frequency: 'mensal',
  baseDate: new Date().toISOString().split('T')[0],
  active: 'true'
};

function typeConfig(type) {
  return RECURRENCE_TYPES.find(item => item.id === type) || RECURRENCE_TYPES[1];
}

function createInitialForm(categories = [], type = 'saida') {
  const context = typeConfig(type).categoryContext;
  const options = getCategoryOptions(categories, context);

  return {
    ...initialForm,
    type,
    cat: options[0]?.value || (type === 'divida' ? 'outro' : 'Outro'),
    baseDate: new Date().toISOString().split('T')[0]
  };
}

function formFromRecurrence(recurrence, categories) {
  if (!recurrence) return createInitialForm(categories);

  return {
    type: recurrence.type,
    desc: recurrence.desc,
    valor: recurrence.valor,
    cat: recurrence.cat,
    frequency: 'mensal',
    baseDate: recurrence.baseDate,
    active: recurrence.active ? 'true' : 'false'
  };
}

function RecurrenceCard({ recurrence, onEdit, onDelete }) {
  const type = typeConfig(recurrence.type);
  const appliedCount = recurrence.appliedMonths?.length || 0;

  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words text-base font-bold text-finance-text">{recurrence.desc}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone={recurrence.active ? 'green' : 'red'}>{recurrence.active ? 'Ativa' : 'Inativa'}</Badge>
            <Badge>{type.label}</Badge>
            <Badge>Mensal</Badge>
          </div>
        </div>
        <div className="break-all font-number text-xl font-bold tabular-nums text-finance-blue">
          {formatCurrency(recurrence.valor)}
        </div>
      </div>

      <div className="grid gap-2 text-sm text-finance-muted sm:grid-cols-2">
        <div>
          <span className="font-semibold text-finance-text">Categoria:</span> {recurrence.cat}
        </div>
        <div>
          <span className="font-semibold text-finance-text">Data base:</span> {formatDate(recurrence.baseDate)}
        </div>
        <div className="sm:col-span-2">
          <span className="font-semibold text-finance-text">Meses gerados:</span> {appliedCount}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" type="button" onClick={() => onEdit(recurrence)}>
          Editar
        </Button>
        <Button size="sm" variant="danger" type="button" onClick={() => onDelete(recurrence)}>
          Excluir
        </Button>
      </div>
    </Card>
  );
}

export function RecurrencesPage() {
  const {
    categories,
    recurrences,
    refreshFinancialRecurrences,
    refreshLegacyDashboardData
  } = useDashboardContext();
  const [editingRecurrence, setEditingRecurrence] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => createInitialForm(categories));
  const [message, setMessage] = useState('');
  const formRef = useRef(null);
  const showToast = useToast();
  const isEditing = Boolean(editingRecurrence);

  useEffect(() => {
    setForm(formFromRecurrence(editingRecurrence, categories));
    setMessage('');
  }, [categories, editingRecurrence]);

  const categoryOptions = useMemo(() => {
    return getCategoryOptions(categories, typeConfig(form.type).categoryContext, form.cat);
  }, [categories, form.cat, form.type]);

  function refreshAfterWrite() {
    const result = applyDueRecurrences();
    refreshLegacyDashboardData();
    refreshFinancialRecurrences();
    return result;
  }

  function updateField(field, value) {
    setMessage('');
    setForm(current => {
      if (field === 'type') {
        const context = typeConfig(value).categoryContext;
        const options = getCategoryOptions(categories, context);

        return {
          ...current,
          type: value,
          cat: options[0]?.value || (value === 'divida' ? 'outro' : 'Outro')
        };
      }

      return { ...current, [field]: value };
    });
  }

  function scrollToForm() {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNewRecurrence() {
    setEditingRecurrence(null);
    setShowForm(true);
    setMessage('');
    scrollToForm();
  }

  function handleEditRecurrence(recurrence) {
    setEditingRecurrence(recurrence);
    setShowForm(true);
    scrollToForm();
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = {
        ...form,
        active: form.active === 'true'
      };

      if (isEditing) {
        updateFinancialRecurrence(editingRecurrence.id, payload);
        setEditingRecurrence(null);
        setShowForm(false);
        setMessage('Recorrência atualizada.');
      } else {
        addFinancialRecurrence(payload);
        setForm(createInitialForm(categories, form.type));
        setShowForm(false);
        setMessage('Recorrência criada.');
      }

      const result = refreshAfterWrite();
      showToast({
        title: isEditing ? 'Recorrência atualizada' : 'Recorrência criada',
        description: result.generatedCount > 0
          ? `${result.generatedCount} registro(s) gerado(s) para este mês.`
          : 'Nenhum registro duplicado foi gerado.',
        tone: 'success'
      });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível salvar', description: error.message, tone: 'error' });
    }
  }

  function handleDelete(recurrence) {
    const confirmed = window.confirm(`Excluir a recorrência "${recurrence.desc}"? Registros já gerados serão preservados.`);
    if (!confirmed) return;

    try {
      deleteFinancialRecurrence(recurrence.id);

      if (editingRecurrence?.id === recurrence.id) {
        setEditingRecurrence(null);
        setShowForm(false);
      }

      refreshFinancialRecurrences();
      setMessage('Recorrência excluída.');
      showToast({ title: 'Recorrência excluída', description: 'Registros já gerados foram preservados.', tone: 'success' });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível excluir', description: error.message, tone: 'error' });
    }
  }

  return (
    <section className="space-y-4">
      <div ref={formRef}>
        {!showForm ? (
          <Button type="button" onClick={handleNewRecurrence}>Nova recorrência</Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Editar Recorrência' : 'Nova Recorrência'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <Field label="Tipo">
                  <Select value={form.type} onChange={event => updateField('type', event.target.value)}>
                    {RECURRENCE_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Frequencia">
                  <Select value={form.frequency} onChange={event => updateField('frequency', event.target.value)}>
                    <option value="mensal">Mensal</option>
                  </Select>
                </Field>

                <Field label="Descrição" className="md:col-span-2">
                  <Input
                    placeholder="Ex: Salario mensal, aluguel, internet..."
                    value={form.desc}
                    onChange={event => updateField('desc', event.target.value)}
                  />
                </Field>

                <Field label="Valor">
                  <MoneyInput
                    min="0"
                    placeholder="0,00"
                    value={form.valor}
                    onChange={event => updateField('valor', event.target.value)}
                  />
                </Field>

                <Field label="Categoria">
                  <Select value={form.cat} onChange={event => updateField('cat', event.target.value)}>
                    {categoryOptions.map(category => (
                      <option key={category.id} value={category.value}>{category.label}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Data base">
                  <Input
                    type="date"
                    value={form.baseDate}
                    onChange={event => updateField('baseDate', event.target.value)}
                  />
                </Field>

                <Field label="Status">
                  <Select value={form.active} onChange={event => updateField('active', event.target.value)}>
                    <option value="true">Ativa</option>
                    <option value="false">Inativa</option>
                  </Select>
                </Field>

                <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                  <Button className="w-full sm:w-auto" type="submit">
                    {isEditing ? 'Salvar alterações' : 'Criar recorrência'}
                  </Button>
                  {isEditing ? (
                    <Button
                      className="w-full sm:w-auto"
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setEditingRecurrence(null);
                        setShowForm(false);
                      }}
                    >
                      Cancelar edição
                    </Button>
                  ) : null}
                  {message ? (
                    <span className="text-sm font-medium text-finance-muted">{message}</span>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {recurrences.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {recurrences.map(recurrence => (
            <RecurrenceCard
              key={recurrence.id}
              recurrence={recurrence}
              onEdit={handleEditRecurrence}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[14px] border border-finance-border bg-white dark:bg-slate-900">
          <EmptyState className="py-14">
            Nenhuma recorrência cadastrada. Crie uma para gerar entradas, saídas ou dívidas mensalmente.
          </EmptyState>
        </div>
      )}
    </section>
  );
}
