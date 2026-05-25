import { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { Badge, Button, EmptyState, Table, TableCell, TableHeaderCell, TableRow, TableShell } from './ui/index.js';

const categoryLabels = {
  empresa: 'Empresa',
  cartao: 'Cartão',
  pessoal: 'Pessoal',
  outro: 'Outro'
};

const statusLabels = {
  open: 'Em aberto',
  dueSoon: 'Vence em breve',
  overdue: 'Atrasado',
  paid: 'Pago'
};

const statusTones = {
  open: 'blue',
  dueSoon: 'yellow',
  overdue: 'red',
  paid: 'green'
};

export function EmptyDebtState({ message }) {
  return <EmptyState>{message}</EmptyState>;
}

function StatusBadge({ status }) {
  return (
    <Badge tone={statusTones[status] || statusTones.open}>
      {statusLabels[status] || statusLabels.open}
    </Badge>
  );
}

function CategoryBadge({ category }) {
  return (
    <Badge tone="blue">
      {categoryLabels[category] || category}
    </Badge>
  );
}

// ─── Linhas da tabela desktop ─────────────────────────────────────────────────

function ActiveDebtRow({ debt, onPay, onEdit, onDelete }) {
  return (
    <TableRow>
      <TableCell className="font-semibold">
        {debt.description}
        {debt.notes ? <div className="mt-1 text-xs font-medium text-finance-muted">{debt.notes}</div> : null}
      </TableCell>
      <TableCell>
        <CategoryBadge category={debt.category} />
      </TableCell>
      <TableCell className="font-number font-bold tabular-nums text-finance-text">
        {formatCurrency(debt.totalValue)}
      </TableCell>
      <TableCell className="font-number font-bold tabular-nums text-finance-green">
        {formatCurrency(debt.paidValue)}
      </TableCell>
      <TableCell className="font-number font-bold tabular-nums text-finance-red">
        {formatCurrency(debt.remainingValue)}
      </TableCell>
      <TableCell>{formatDate(debt.dueDate)}</TableCell>
      <TableCell>
        <StatusBadge status={debt.status} />
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="success" onClick={() => onPay(debt.id)}>
            Marcar paga
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEdit(debt)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(debt)}>
            Excluir
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function PaidDebtRow({ debt, onEdit, onDelete }) {
  return (
    <TableRow>
      <TableCell className="font-semibold">
        {debt.description}
        {debt.notes ? <div className="mt-1 text-xs font-medium text-finance-muted">{debt.notes}</div> : null}
      </TableCell>
      <TableCell>
        <CategoryBadge category={debt.category} />
      </TableCell>
      <TableCell className="font-number font-bold tabular-nums text-finance-green">
        {formatCurrency(debt.totalValue)}
      </TableCell>
      <TableCell>{formatDate(debt.dueDate)}</TableCell>
      <TableCell>{formatDate(debt.paidAt || debt.dueDate)}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(debt)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(debt)}>
            Excluir
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Cards accordion para mobile ─────────────────────────────────────────────

function ChevronIcon({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['shrink-0 transition-transform duration-200 text-finance-muted', open ? 'rotate-180' : ''].join(' ')}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MobileInfoRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-finance-border/50 last:border-0">
      <span className="text-xs text-finance-muted shrink-0">{label}</span>
      <span className={['text-xs font-semibold text-right break-all', valueClass].join(' ')}>{value}</span>
    </div>
  );
}

function ActiveDebtCard({ debt, onPay, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-[12px] border border-finance-border bg-white dark:bg-slate-900">
      {/* Cabeçalho — sempre visível, clicável */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-finance-text">{debt.description}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={debt.status} />
            <CategoryBadge category={debt.category} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-number text-sm font-bold tabular-nums text-finance-red">
            {formatCurrency(debt.remainingValue)}
          </span>
          <ChevronIcon open={open} />
        </div>
      </button>

      {/* Detalhes expandidos */}
      {open && (
        <div className="border-t border-finance-border px-4 pb-4 pt-3">
          <div className="space-y-0">
            <MobileInfoRow label="Valor total" value={formatCurrency(debt.totalValue)} />
            <MobileInfoRow label="Já paguei" value={formatCurrency(debt.paidValue)} valueClass="text-finance-green" />
            <MobileInfoRow label="Ainda devo" value={formatCurrency(debt.remainingValue)} valueClass="text-finance-red" />
            {debt.dueDate && (
              <MobileInfoRow label="Vencimento" value={formatDate(debt.dueDate)} />
            )}
            {debt.notes && (
              <MobileInfoRow label="Observações" value={debt.notes} />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="success" onClick={() => onPay(debt.id)}>
              Marcar paga
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(debt)}>
              Editar
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(debt)}>
              Excluir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaidDebtCard({ debt, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-[12px] border border-finance-border bg-white dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-finance-text">{debt.description}</p>
          <div className="mt-1">
            <CategoryBadge category={debt.category} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-number text-sm font-bold tabular-nums text-finance-green">
            {formatCurrency(debt.totalValue)}
          </span>
          <ChevronIcon open={open} />
        </div>
      </button>

      {open && (
        <div className="border-t border-finance-border px-4 pb-4 pt-3">
          <div className="space-y-0">
            <MobileInfoRow label="Valor" value={formatCurrency(debt.totalValue)} valueClass="text-finance-green" />
            {debt.dueDate && (
              <MobileInfoRow label="Vencimento" value={formatDate(debt.dueDate)} />
            )}
            <MobileInfoRow label="Quitada em" value={formatDate(debt.paidAt || debt.dueDate)} />
            {debt.notes && (
              <MobileInfoRow label="Observações" value={debt.notes} />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(debt)}>
              Editar
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(debt)}>
              Excluir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componentes públicos ─────────────────────────────────────────────────────

export function ActiveDebtTable({ debts, onPay, onEdit, onDelete }) {
  return (
    <>
      {/* Mobile: accordion/gavetas */}
      <div className="md:hidden space-y-2">
        <div className="rounded-[14px] border border-finance-border bg-finance-surface px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Dívidas em aberto</h3>
        </div>
        {debts.length ? (
          debts.map(debt => (
            <ActiveDebtCard
              key={debt.id}
              debt={debt}
              onPay={onPay}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <EmptyDebtState message="Nenhuma dívida em aberto." />
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block">
        <TableShell title="Dívidas em aberto">
          <Table>
            <thead>
              <tr>
                {['Descrição', 'Tipo', 'Valor Total', 'Já paguei', 'Ainda Devo', 'Vencimento', 'Situação', 'Ação'].map(header => (
                  <TableHeaderCell key={header}>{header}</TableHeaderCell>
                ))}
              </tr>
            </thead>
            <tbody>
              {debts.length ? (
                debts.map(debt => (
                  <ActiveDebtRow
                    key={debt.id}
                    debt={debt}
                    onPay={onPay}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <EmptyDebtState message="Nenhuma dívida em aberto." />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableShell>
      </div>
    </>
  );
}

export function PaidDebtTable({ debts, onEdit, onDelete }) {
  return (
    <>
      {/* Mobile: accordion/gavetas */}
      <div className="md:hidden space-y-2">
        <div className="rounded-[14px] border border-finance-border bg-finance-surface px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Dívidas pagas</h3>
        </div>
        {debts.length ? (
          debts.map(debt => (
            <PaidDebtCard
              key={debt.id}
              debt={debt}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <EmptyDebtState message="Nenhuma dívida paga ainda." />
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block">
        <TableShell title="Dívidas pagas">
          <Table>
            <thead>
              <tr>
                {['Descrição', 'Tipo', 'Valor', 'Vencimento', 'Quitada em', 'Ação'].map(header => (
                  <TableHeaderCell key={header}>{header}</TableHeaderCell>
                ))}
              </tr>
            </thead>
            <tbody>
              {debts.length ? (
                debts.map(debt => (
                  <PaidDebtRow
                    key={debt.id}
                    debt={debt}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <EmptyDebtState message="Nenhuma dívida paga ainda." />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableShell>
      </div>
    </>
  );
}
