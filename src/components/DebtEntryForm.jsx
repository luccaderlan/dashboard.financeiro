import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input, MoneyInput, Select, Textarea, useToast } from './ui/index.js';
import { useDashboardContext, useDashboardRefresh } from '../context/DashboardContext.jsx';
import { getCategoryOptions } from '../services/financialCategories.js';
import { addLegacyDebt, updateLegacyDebt } from '../services/legacyDebtWrite.js';

function today() {
  return new Date().toISOString().split('T')[0];
}

function createInitialFormState(categories = []) {
  const categoryOptions = getCategoryOptions(categories, 'divida');
  const fallbackCategory = categoryOptions.find(category => category.value === 'outro') || categoryOptions[0];

  return {
    desc: '',
    valor: '',
    venc: today(),
    cat: fallbackCategory?.value || 'outro',
    obs: ''
  };
}

function createFormStateFromDebt(debt, categories) {
  if (!debt) return createInitialFormState(categories);

  return {
    desc: debt.description || '',
    valor: debt.totalValue || '',
    venc: debt.dueDate || today(),
    cat: debt.category || 'outro',
    obs: debt.notes || ''
  };
}

export function DebtEntryForm({ editingDebt = null, onCancelEdit, onSaved }) {
  const { categories } = useDashboardContext();
  const [form, setForm] = useState(() => createInitialFormState(categories));
  const [message, setMessage] = useState('');
  const refreshDashboardData = useDashboardRefresh();
  const showToast = useToast();
  const isEditing = Boolean(editingDebt);

  useEffect(() => {
    setMessage('');
    setForm(createFormStateFromDebt(editingDebt, categories));
  }, [categories, editingDebt]);

  const categoryOptions = getCategoryOptions(categories, 'divida', form.cat);

  function updateField(field, value) {
    setMessage('');
    setForm(current => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      if (isEditing) {
        updateLegacyDebt(editingDebt.id, form);
      } else {
        addLegacyDebt(form);
      }

      refreshDashboardData();
      setForm(createInitialFormState(categories));
      setMessage(isEditing ? 'Dívida atualizada.' : 'Dívida adicionada.');
      onSaved?.(isEditing ? 'edit' : 'create');
      showToast({
        title: isEditing ? 'Dívida atualizada' : 'Dívida criada',
        description: 'A lista de dívidas foi atualizada.',
        tone: 'success'
      });
    } catch (error) {
      setMessage(error.message);
      showToast({
        title: isEditing ? 'Não foi possível atualizar' : 'Não foi possível criar',
        description: error.message,
        tone: 'error'
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Dívida' : 'Nova Dívida'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Descrição" className="md:col-span-2">
            <Input
              placeholder="Ex: Aluguel, Cartão Nubank..."
              value={form.desc}
              onChange={event => updateField('desc', event.target.value)}
            />
          </Field>

          <Field label="Categoria">
            <Select
              value={form.cat}
              onChange={event => updateField('cat', event.target.value)}
            >
              {categoryOptions.map(category => (
                <option key={category.id} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Valor total">
            <MoneyInput
              min="0"
              placeholder="0,00"
              value={form.valor}
              onChange={event => updateField('valor', event.target.value)}
            />
          </Field>

          <Field label="Vencimento">
            <Input
              type="date"
              value={form.venc}
              onChange={event => updateField('venc', event.target.value)}
            />
          </Field>

          <Field label="Observação" className="md:col-span-2">
            <Textarea
              placeholder="Alguma anotação importante?"
              value={form.obs}
              onChange={event => updateField('obs', event.target.value)}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button className="w-full sm:w-auto" type="submit">
              {isEditing ? 'Salvar Alteracoes' : 'Adicionar Dívida'}
            </Button>
            {isEditing ? (
              <Button className="w-full sm:w-auto" variant="ghost" type="button" onClick={onCancelEdit}>
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
  );
}
