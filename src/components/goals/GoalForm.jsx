import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input, MoneyInput, Select } from '../ui/index.js';
import { useDashboardContext } from '../../context/DashboardContext.jsx';
import { getCategoryOptions } from '../../services/financialCategories.js';

const initialForm = {
  title: '',
  targetValue: '',
  currentValue: '',
  category: 'Geral',
  deadline: ''
};

function formFromGoal(goal) {
  if (!goal) return initialForm;

  return {
    title: goal.title,
    targetValue: goal.targetValue,
    currentValue: goal.currentValue,
    category: goal.category,
    deadline: goal.deadline
  };
}

export function GoalForm({ editingGoal, onCancelEdit, onSubmit, message }) {
  const { categories } = useDashboardContext();
  const [form, setForm] = useState(initialForm);
  const isEditing = Boolean(editingGoal);
  const categoryOptions = getCategoryOptions(categories, 'meta', form.category);

  useEffect(() => {
    setForm(formFromGoal(editingGoal));
  }, [editingGoal]);

  function updateField(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const saved = onSubmit(form);

    if (saved) {
      setForm(initialForm);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Meta' : 'Nova Meta'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Titulo" className="md:col-span-2">
            <Input
              placeholder="Ex: Reserva de emergencia"
              value={form.title}
              onChange={event => updateField('title', event.target.value)}
            />
          </Field>

          <Field label="Valor alvo">
            <MoneyInput
              min="0"
              placeholder="0,00"
              value={form.targetValue}
              onChange={event => updateField('targetValue', event.target.value)}
            />
          </Field>

          <Field label="Valor atual">
            <MoneyInput
              min="0"
              placeholder="0,00"
              value={form.currentValue}
              onChange={event => updateField('currentValue', event.target.value)}
            />
          </Field>

          <Field label="Categoria">
            <Select
              value={form.category}
              onChange={event => updateField('category', event.target.value)}
            >
              {categoryOptions.map(category => (
                <option key={category.id} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Prazo opcional">
            <Input
              type="date"
              value={form.deadline}
              onChange={event => updateField('deadline', event.target.value)}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button className="w-full sm:w-auto" type="submit">
              {isEditing ? 'Salvar Alteracoes' : 'Criar Meta'}
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
