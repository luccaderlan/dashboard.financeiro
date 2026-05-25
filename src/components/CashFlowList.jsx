import { useMemo, useState } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { Button, EmptyState } from './ui/index.js';

const filterOptions = [
  { id: 'todos', label: 'Todos' },
  { id: 'entrada', label: 'Entradas' },
  { id: 'saida', label: 'Saídas' }
];

export function CashFlowItem({ item, onDelete, onEdit }) {
  const isEntrada = item.type === 'entrada';

  return (
    <div className="flex flex-col gap-3 border-b border-finance-border px-4 py-4 transition-colors last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div
          className={[
            'flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-lg font-bold',
            isEntrada ? 'bg-green-100 text-finance-green dark:bg-green-950/60' : 'bg-red-100 text-finance-red dark:bg-red-950/60'
          ].join(' ')}
        >
          {isEntrada ? '+' : '-'}
        </div>
        <div className="min-w-0">
          <div className="break-words text-sm font-semibold text-finance-text">{item.description}</div>
          <div className="text-[0.82rem] text-finance-muted">
            {formatDate(item.date)} - {item.category}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span
          className={[
            'whitespace-nowrap font-number text-sm font-bold tabular-nums',
            isEntrada ? 'text-finance-green' : 'text-finance-red'
          ].join(' ')}
        >
          {isEntrada ? '+' : '-'} {formatCurrency(item.value)}
        </span>
        <Button size="sm" variant="secondary" type="button" onClick={() => onEdit?.(item)}>
          Editar
        </Button>
        <Button size="sm" variant="danger" type="button" onClick={() => onDelete?.(item)}>
          Excluir
        </Button>
      </div>
    </div>
  );
}

export function EmptyCashFlowState() {
  return (
    <EmptyState className="py-12">
      Nenhum lançamento para este filtro.
    </EmptyState>
  );
}

export function CashFlowList({
  items = [],
  onDelete,
  onEdit,
  title = 'Todos os lançamentos',
  showTypeFilters = true
}) {
  const [filter, setFilter] = useState('todos');

  const filteredItems = useMemo(() => {
    if (!showTypeFilters) return items;
    if (filter === 'todos') return items;
    return items.filter(item => item.type === filter);
  }, [filter, items, showTypeFilters]);

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-[14px] border border-finance-border bg-white dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-finance-border px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
        {showTypeFilters ? (
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => {
              const active = option.id === filter;
              return (
                <Button
                  key={option.id}
                  className="rounded-full px-4 py-2"
                  size="sm"
                  variant={active ? 'primary' : 'ghost'}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        ) : null}
      </div>

      {filteredItems.length ? (
        <div>
          {filteredItems.map(item => (
            <CashFlowItem key={item.id} item={item} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <EmptyCashFlowState />
      )}
    </section>
  );
}
