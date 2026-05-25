import { formatCurrency, formatDate } from '../utils/formatters.js';
import { Badge, EmptyState, Table, TableCell, TableHeaderCell, TableRow, TableShell } from './ui/index.js';

const statusTones = {
  open: 'blue',
  dueSoon: 'yellow',
  overdue: 'red',
  paid: 'green'
};

const statusLabels = {
  open: 'Em aberto',
  dueSoon: 'Vence em breve',
  overdue: 'Atrasado',
  paid: 'Pago'
};

export function UpcomingBillRow({ bill }) {
  return (
    <TableRow>
      <TableCell className="px-6 font-semibold">{bill.description}</TableCell>
      <TableCell className="px-6">{bill.type}</TableCell>
      <TableCell className="px-6 font-number font-bold tabular-nums text-finance-red">
        {formatCurrency(bill.value)}
      </TableCell>
      <TableCell className="px-6">{formatDate(bill.dueDate)}</TableCell>
      <TableCell className="px-6">
        <Badge tone={statusTones[bill.status] || statusTones.open}>
          {statusLabels[bill.status] || statusLabels.open}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function UpcomingBillCard({ bill }) {
  return (
    <div className="rounded-[12px] border border-finance-border bg-white p-4 dark:bg-slate-900">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="break-words text-sm font-bold text-finance-text">{bill.description}</div>
          <div className="mt-1 text-xs font-medium text-finance-muted">{bill.type}</div>
        </div>
        <Badge tone={statusTones[bill.status] || statusTones.open}>
          {statusLabels[bill.status] || statusLabels.open}
        </Badge>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div className="font-number font-bold tabular-nums text-finance-red">
          {formatCurrency(bill.value)}
        </div>
        <div className="font-medium text-finance-muted">
          Vence em {formatDate(bill.dueDate)}
        </div>
      </div>
    </div>
  );
}

export function UpcomingBillsTable({ bills = [], title = 'Proximas contas a vencer' }) {
  return (
    <>
      <section className="rounded-[14px] border border-finance-border bg-white dark:bg-slate-900 md:hidden">
        <div className="border-b border-finance-border px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="grid gap-3 p-3">
          {bills.length ? (
            bills.map(bill => <UpcomingBillCard key={bill.id} bill={bill} />)
          ) : (
            <EmptyState>Nenhuma conta pendente.</EmptyState>
          )}
        </div>
      </section>

      <div className="hidden md:block">
        <TableShell title={title}>
          <Table>
            <thead>
              <tr>
                {['Descrição', 'Tipo', 'Valor', 'Vencimento', 'Situação'].map(header => (
                  <TableHeaderCell key={header} className="px-6">
                    {header}
                  </TableHeaderCell>
                ))}
              </tr>
            </thead>
            <tbody>
              {bills.length ? (
                bills.map(bill => <UpcomingBillRow key={bill.id} bill={bill} />)
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState>Nenhuma conta pendente.</EmptyState>
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
