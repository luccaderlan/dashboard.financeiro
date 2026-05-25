import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { Badge, Button, Card } from '../ui/index.js';

function getProgressTone(progress) {
  if (progress >= 100) return 'bg-finance-green';
  if (progress >= 60) return 'bg-finance-blue';
  if (progress >= 30) return 'bg-finance-yellow';
  return 'bg-finance-red';
}

export function GoalCard({ goal, onEdit, onDelete, onAddValue }) {
  const [adding, setAdding] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addError, setAddError] = useState('');

  function handleAddSubmit(event) {
    event.preventDefault();
    const normalized = addAmount.replace(',', '.');
    const amount = parseFloat(normalized);

    if (!amount || amount <= 0) {
      setAddError('Informe um valor maior que zero.');
      return;
    }

    setAddError('');
    onAddValue?.(goal.id, amount);
    setAdding(false);
    setAddAmount('');
  }

  function handleCancelAdd() {
    setAdding(false);
    setAddAmount('');
    setAddError('');
  }

  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words text-base font-bold text-finance-text">{goal.title}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge tone={goal.completed ? 'green' : 'blue'}>{goal.completed ? 'Concluída' : goal.category}</Badge>
            {goal.deadline ? <Badge>{formatDate(goal.deadline)}</Badge> : null}
          </div>
        </div>
        <div className="break-all font-number text-2xl font-bold tabular-nums text-finance-blue">
          {goal.progress}%
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between gap-3 text-sm font-semibold text-finance-muted">
          <span>{formatCurrency(goal.currentValue)}</span>
          <span>{formatCurrency(goal.targetValue)}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={['h-3 rounded-full transition-all duration-300', getProgressTone(goal.progress)].join(' ')}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Formulário inline de adição de valor */}
      {adding && (
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Valor a adicionar (ex: 250,00)"
              value={addAmount}
              onChange={event => { setAddAmount(event.target.value); setAddError(''); }}
              autoFocus
              className="w-full min-w-0 rounded-[10px] border border-finance-border bg-white px-3 py-2 text-sm text-finance-text outline-none transition-colors placeholder:text-slate-400 focus:border-finance-blue focus:ring-4 focus:ring-blue-100 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50"
            />
            <Button size="sm" type="submit">
              Confirmar
            </Button>
            <Button size="sm" variant="secondary" type="button" onClick={handleCancelAdd}>
              Cancelar
            </Button>
          </div>
          {addError && (
            <p className="text-xs font-medium text-finance-red">{addError}</p>
          )}
        </form>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        {!goal.completed && !adding && (
          <Button size="sm" type="button" onClick={() => setAdding(true)}>
            Adicionar valor
          </Button>
        )}
        <Button size="sm" variant="secondary" type="button" onClick={() => onEdit(goal)}>
          Editar
        </Button>
        <Button size="sm" variant="danger" type="button" onClick={() => onDelete(goal.id)}>
          Excluir
        </Button>
      </div>
    </Card>
  );
}
