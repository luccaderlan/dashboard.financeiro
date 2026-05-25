import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input, MoneyInput, Select, useToast } from './ui/index.js';
import { useDashboardContext, useDashboardRefresh } from '../context/DashboardContext.jsx';
import { addLegacyCashFlowItem, updateLegacyCashFlowItem } from '../services/legacyCashFlowWrite.js';
import { getCategoryOptions } from '../services/financialCategories.js';

function today() {
  return new Date().toISOString().split('T')[0];
}

function createInitialFormState(categories = [], type = 'entrada') {
  const options = getCategoryOptions(categories, type);

  return {
    tipo: type,
    desc: '',
    valor: '',
    data: today(),
    cat: options[0]?.value || 'Outro'
  };
}

function formFromItem(item, categories) {
  if (!item) return createInitialFormState(categories);

  return {
    tipo: item.type,
    desc: item.description,
    valor: item.value,
    data: item.date || today(),
    cat: item.category || 'Outro'
  };
}

export function CashFlowEntryForm({ editingItem, onCancelEdit, onSaved }) {
  const { categories } = useDashboardContext();
  const [form, setForm] = useState(() => createInitialFormState(categories));
  const [message, setMessage] = useState('');
  const refreshDashboardData = useDashboardRefresh();
  const showToast = useToast();
  const isEditing = Boolean(editingItem);

  useEffect(() => {
    setForm(formFromItem(editingItem, categories));
    setMessage('');
  }, [categories, editingItem]);

  const availableCategories = useMemo(() => {
    return getCategoryOptions(categories, form.tipo, form.cat);
  }, [categories, form.cat, form.tipo]);

  function updateField(field, value) {
    setMessage('');
    setForm(current => {
      if (field === 'tipo') {
        const options = getCategoryOptions(categories, value);

        return {
          ...current,
          tipo: value,
          cat: options[0]?.value || 'Outro'
        };
      }

      return { ...current, [field]: value };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      if (isEditing) {
        updateLegacyCashFlowItem(editingItem.id, form);
      } else {
        addLegacyCashFlowItem(form);
      }

      refreshDashboardData();
      setForm(createInitialFormState(categories));
      setMessage(isEditing ? 'Lançamento atualizado.' : 'Lançamento adicionado.');
      showToast({
        title: isEditing ? 'Lançamento atualizado' : 'Lançamento salvo',
        description: 'Entradas, saídas, KPIs e gráficos foram atualizados.',
        tone: 'success'
      });
      onSaved?.();
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível salvar', description: error.message, tone: 'error' });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Lançamento' : 'Novo Lançamento'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Tipo">
            <Select
              value={form.tipo}
              onChange={event => updateField('tipo', event.target.value)}
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </Select>
          </Field>

          <Field label="Valor">
            <MoneyInput
              min="0"
              placeholder="0,00"
              value={form.valor}
              onChange={event => updateField('valor', event.target.value)}
            />
          </Field>

          <Field label="Descrição" className="md:col-span-2">
            <Input
              placeholder={form.tipo === 'entrada' ? 'Ex: Salario' : 'Ex: Mercado'}
              value={form.desc}
              onChange={event => updateField('desc', event.target.value)}
            />
          </Field>

          <Field label="Data">
            <Input
              type="date"
              value={form.data}
              onChange={event => updateField('data', event.target.value)}
            />
          </Field>

          <Field label="Categoria">
            <Select
              value={form.cat}
              onChange={event => updateField('cat', event.target.value)}
            >
              {availableCategories.map(category => (
                <option key={category.id} value={category.value}>{category.label}</option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button className="w-full sm:w-auto" type="submit">
              {isEditing ? 'Salvar Alteracoes' : 'Adicionar'}
            </Button>
            {isEditing ? (
              <Button className="w-full sm:w-auto" type="button" variant="ghost" onClick={onCancelEdit}>
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
