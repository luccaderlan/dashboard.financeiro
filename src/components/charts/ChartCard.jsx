import { Card, CardContent, CardHeader, CardTitle, EmptyState } from '../ui/index.js';

export function ChartCard({ title, subtitle, children, empty = false }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-finance-muted">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        {empty ? (
          <EmptyState className="py-12">Ainda não há dados suficientes para este gráfico.</EmptyState>
        ) : (
          <div className="h-72 min-w-0 max-w-full overflow-visible transition-opacity duration-300">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
