import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input, MoneyInput, useToast } from './ui/index.js';
import { useDashboardRefresh } from '../context/DashboardContext.jsx';
import { addLegacyLoan, calculateLegacyLoanPayment, MAX_LEGACY_INSTALLMENTS, updateLegacyLoan } from '../services/legacyLoanWrite.js';
import { formatCurrency } from '../utils/formatters.js';

function today() {
  return new Date().toISOString().split('T')[0];
}

function createInitialFormState() {
  return {
    desc: '',
    valor: '',
    juros: '',
    parcelas: '',
    pagas: '0',
    inicio: today()
  };
}

function createFormStateFromLoan(loan) {
  if (!loan) return createInitialFormState();

  return {
    desc: loan.description || '',
    valor: loan.value ?? '',
    juros: loan.interest ?? '',
    parcelas: loan.installments ?? '',
    pagas: loan.paidInstallments ?? '0',
    inicio: loan.startDate || today()
  };
}

export function LoanEntryForm({ editingLoan = null, onCancelEdit, onSaved }) {
  const [form, setForm] = useState(createInitialFormState);
  const [message, setMessage] = useState('');
  const refreshDashboardData = useDashboardRefresh();
  const showToast = useToast();
  const isEditing = Boolean(editingLoan);

  const paymentPreview = useMemo(() => calculateLegacyLoanPayment(form), [form]);

  useEffect(() => {
    setMessage('');
    setForm(createFormStateFromLoan(editingLoan));
  }, [editingLoan]);

  function updateField(field, value) {
    setMessage('');
    setForm(current => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      if (isEditing) {
        updateLegacyLoan(editingLoan.id, form);
      } else {
        addLegacyLoan(form);
      }

      refreshDashboardData();
      setForm(createInitialFormState());
      setMessage(isEditing ? 'Empréstimo atualizado.' : 'Empréstimo adicionado.');
      onSaved?.(isEditing ? 'edit' : 'create');
      showToast({
        title: isEditing ? 'Empréstimo atualizado' : 'Empréstimo criado',
        description: 'O resumo de empréstimos foi atualizado.',
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
        <CardTitle>{isEditing ? 'Editar empréstimo' : 'Novo empréstimo'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Descrição" className="md:col-span-2">
            <Input
              placeholder="Ex: Empréstimo Caixa"
              value={form.desc}
              onChange={event => updateField('desc', event.target.value)}
            />
          </Field>

          <Field label="Valor total">
            <MoneyInput
              min="0"
              placeholder="0,00"
              value={form.valor}
              onChange={event => updateField('valor', event.target.value)}
            />
          </Field>

          <Field label="Juros ao mês (%)">
            <Input
              min="0"
              placeholder="1,5"
              step="0.1"
              type="number"
              value={form.juros}
              onChange={event => updateField('juros', event.target.value)}
            />
          </Field>

          <Field label="Total de parcelas">
            <Input
              min="1"
              max={MAX_LEGACY_INSTALLMENTS}
              placeholder="12"
              type="number"
              value={form.parcelas}
              onChange={event => updateField('parcelas', event.target.value)}
            />
          </Field>

          <Field label="Parcelas já pagas">
            <Input
              min="0"
              max={form.parcelas || MAX_LEGACY_INSTALLMENTS}
              placeholder="0"
              type="number"
              value={form.pagas}
              onChange={event => updateField('pagas', event.target.value)}
            />
          </Field>

          <Field label="Data da primeira parcela">
            <Input
              type="date"
              value={form.inicio}
              onChange={event => updateField('inicio', event.target.value)}
            />
          </Field>

          <div className="grid gap-2 rounded-[10px] border border-finance-border bg-slate-50 px-3 py-2 text-sm font-semibold text-finance-text dark:bg-slate-950">
            Parcela mensal calculada
            <span className="font-number text-base font-bold tabular-nums text-finance-blue">
              {formatCurrency(paymentPreview)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button className="w-full sm:w-auto" type="submit">
              {isEditing ? 'Salvar alterações' : 'Adicionar empréstimo'}
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
