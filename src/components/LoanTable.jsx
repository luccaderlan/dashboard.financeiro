import { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { Badge, Button, EmptyState, Table, TableCell, TableHeaderCell, TableRow, TableShell } from './ui/index.js';

function getProgressTone(progress) {
  if (progress > 66) return 'bg-finance-green';
  if (progress > 33) return 'bg-finance-yellow';
  return 'bg-finance-red';
}

// ─── Linha da tabela desktop ──────────────────────────────────────────────────

function LoanRow({ loan, onEdit, onDelete, onPayInstallment }) {
  const isFullyPaid = loan.remainingInstallments <= 0;

  return (
    <TableRow>
      <TableCell className="font-semibold">
        {loan.description}
        <div className="mt-1 text-xs font-medium text-finance-muted">
          Inicio: {formatDate(loan.startDate)}
        </div>
      </TableCell>
      <TableCell className="font-number font-bold tabular-nums text-finance-red">
        {formatCurrency(loan.value)}
      </TableCell>
      <TableCell>
        <Badge tone="yellow">{loan.interest}% a.m.</Badge>
      </TableCell>
      <TableCell className="font-number font-bold tabular-nums text-finance-blue">
        {formatCurrency(loan.installmentValue)}
      </TableCell>
      <TableCell>
        {loan.paidInstallments} pagas — {loan.remainingInstallments} restantes
      </TableCell>
      <TableCell className="min-w-[170px]">
        <div className="mb-2 flex justify-between text-xs font-semibold text-finance-muted">
          <span>{loan.progress}% pago</span>
          <span>{loan.paidInstallments}/{loan.installments}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={['h-2 rounded-full', getProgressTone(loan.progress)].join(' ')}
            style={{ width: loan.progress + '%' }}
          />
        </div>
        {isFullyPaid && (
          <p className="mt-1 text-[0.68rem] font-semibold text-finance-green">Quitado</p>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          {!isFullyPaid && (
            <Button size="sm" variant="ghost" onClick={() => onPayInstallment?.(loan)}>
              Pagar parcela
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => onEdit(loan)}>
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(loan)}>
            Excluir
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Card accordion para mobile ───────────────────────────────────────────────

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

function MobileInfoRow({ label, value, valueClass }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 border-b border-finance-border/50 last:border-0">
      <span className="text-xs text-finance-muted shrink-0">{label}</span>
      <span className={['text-xs font-semibold text-right break-all', valueClass || ''].join(' ')}>{value}</span>
    </div>
  );
}

function LoanCard({ loan, onEdit, onDelete, onPayInstallment }) {
  const [open, setOpen] = useState(false);
  const isFullyPaid = loan.remainingInstallments <= 0;

  return (
    <div className="overflow-hidden rounded-[12px] border border-finance-border bg-white dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-finance-text">{loan.description}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-number text-xs tabular-nums text-finance-blue font-semibold">
              Parcela: {formatCurrency(loan.installmentValue)}
            </span>
            {isFullyPaid && (
              <span className="text-[0.68rem] font-semibold text-finance-green">Quitado</span>
            )}
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={['h-1.5 rounded-full', getProgressTone(loan.progress)].join(' ')}
              style={{ width: loan.progress + '%' }}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          <span className="font-number text-sm font-bold tabular-nums text-finance-red">
            {formatCurrency(loan.value)}
          </span>
          <ChevronIcon open={open} />
        </div>
      </button>

      {open && (
        <div className="border-t border-finance-border px-4 pb-4 pt-3">
          <div className="space-y-0">
            <MobileInfoRow label="Valor total" value={formatCurrency(loan.value)} valueClass="text-finance-red" />
            <MobileInfoRow label="Juros" value={`${loan.interest}% a.m.`} />
            <MobileInfoRow label="Parcela" value={formatCurrency(loan.installmentValue)} valueClass="text-finance-blue" />
            <MobileInfoRow label="Parcelas pagas" value={`${loan.paidInstallments} de ${loan.installments}`} />
            <MobileInfoRow label="Parcelas restantes" value={String(loan.remainingInstallments)} />
            <MobileInfoRow
              label="Progresso"
              value={`${loan.progress}%`}
              valueClass={loan.progress > 66 ? 'text-finance-green' : loan.progress > 33 ? 'text-finance-yellow' : 'text-finance-red'}
            />
            {loan.startDate && (
              <MobileInfoRow label="Data de inicio" value={formatDate(loan.startDate)} />
            )}
          </div>
          <div className="mt-3">
            <div className="mb-1.5 flex justify-between text-[0.68rem] font-semibold text-finance-muted">
              <span>{loan.progress}% pago</span>
              <span>{loan.paidInstallments}/{loan.installments}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className={['h-2 rounded-full', getProgressTone(loan.progress)].join(' ')}
                style={{ width: loan.progress + '%' }}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {!isFullyPaid && (
              <Button size="sm" variant="ghost" onClick={() => onPayInstallment?.(loan)}>
                Pagar parcela
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onEdit(loan)}>
              Editar
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(loan)}>
              Excluir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componentes publicos ─────────────────────────────────────────────────────

export function EmptyLoanState() {
  return <EmptyState>Nenhum empréstimo cadastrado.</EmptyState>;
}

export function LoanTable({ loans, onEdit, onDelete, onPayInstallment }) {
  return (
    <>
      <div className="md:hidden space-y-2">
        <div className="rounded-[14px] border border-finance-border bg-finance-surface px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Empréstimos e financiamentos</h3>
        </div>
        {loans.length ? (
          loans.map(loan => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onEdit={onEdit}
              onDelete={onDelete}
              onPayInstallment={onPayInstallment}
            />
          ))
        ) : (
          <EmptyLoanState />
        )}
      </div>

      <div className="hidden md:block">
        <TableShell title="Empréstimos e financiamentos">
          <Table>
            <thead>
              <tr>
                {['Descrição', 'Valor Total', 'Juros (a.m.)', 'Parcela', 'Parcelas', 'Progresso', 'Ação'].map(header => (
                  <TableHeaderCell key={header}>{header}</TableHeaderCell>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.length ? (
                loans.map(loan => (
                  <LoanRow
                    key={loan.id}
                    loan={loan}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPayInstallment={onPayInstallment}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <EmptyLoanState />
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
