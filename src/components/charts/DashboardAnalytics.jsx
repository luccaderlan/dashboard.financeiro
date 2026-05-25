import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useDashboardContext } from '../../context/DashboardContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import {
  getCashFlowComparisonData,
  getDebtBreakdownData,
  getExpenseCategoryData,
  getMonthlyEvolutionData,
  hasChartData
} from '../../services/dashboardAnalytics.js';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters.js';
import { ChartCard } from './ChartCard.jsx';

const categoryColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];
const darkCategoryColors = ['#60a5fa', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#22d3ee'];

const chartTheme = {
  light: {
    grid: '#dcd9cf',
    text: '#71717a',
    tooltipBg: '#ffffff',
    tooltipText: '#18181b',
    tooltipBorder: '#dcd9cf',
    balance: '#2563eb',
    income: '#16a34a',
    expense: '#dc2626',
    balanceFill: '#2563eb',
    categories: categoryColors
  },
  dark: {
    grid: '#334155',
    text: '#94a3b8',
    tooltipBg: '#0f172a',
    tooltipText: '#e2e8f0',
    tooltipBorder: '#334155',
    balance: '#60a5fa',
    income: '#4ade80',
    expense: '#f87171',
    balanceFill: '#60a5fa',
    categories: darkCategoryColors
  }
};

function currencyTick(value) {
  return formatCompactCurrency(value);
}

function CurrencyTooltip({ active, payload, label, theme }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-[10px] border px-3 py-2 text-xs shadow-sm"
      style={{
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        color: theme.tooltipText
      }}
    >
      {label ? <div className="mb-1 font-semibold">{label}</div> : null}
      {payload.map(item => (
        <div key={item.name} className="font-medium" style={{ color: theme.text }}>
          {item.name}: <span className="font-number font-bold" style={{ color: theme.tooltipText }}>{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function DashboardAnalytics() {
  const { cashFlow, debts } = useDashboardContext();
  const { resolvedTheme } = useTheme();
  const colors = chartTheme[resolvedTheme] || chartTheme.light;
  const comparisonData = getCashFlowComparisonData(cashFlow);
  const evolutionData = getMonthlyEvolutionData(cashFlow);
  const categoryData = getExpenseCategoryData(cashFlow);
  const debtData = getDebtBreakdownData(debts);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-3xl leading-none text-slate-900 dark:text-white">Analytics financeiro</h2>
        <p className="mt-1 text-sm text-finance-muted">
          Leitura analitica dos dados atuais salvos no dashboard.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Entradas vs Saídas"
          subtitle="Comparativo total do fluxo financeiro cadastrado."
          empty={!hasChartData(comparisonData)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: colors.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: colors.text, fontSize: 11 }} tickFormatter={currencyTick} tickLine={false} axisLine={false} width={68} />
              <Tooltip content={<CurrencyTooltip theme={colors} />} />
              <Bar dataKey="value" name="Valor" minPointSize={4} radius={[8, 8, 0, 0]}>
                {comparisonData.map(item => (
                  <Cell key={item.name} fill={item.name === 'Entradas' ? colors.income : colors.expense} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Evolucao financeira"
          subtitle="Entradas, saídas e saldo agrupados por mês."
          empty={evolutionData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionData} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.balanceFill} stopOpacity={0.24} />
                  <stop offset="95%" stopColor={colors.balanceFill} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: colors.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: colors.text, fontSize: 11 }} tickFormatter={currencyTick} tickLine={false} axisLine={false} width={68} />
              <Tooltip content={<CurrencyTooltip theme={colors} />} />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Area type="monotone" dataKey="saldo" name="Saldo" stroke={colors.balance} fill="url(#saldoGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="entradas" name="Entradas" stroke={colors.income} fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="saidas" name="Saídas" stroke={colors.expense} fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Saídas por categoria"
          subtitle="Distribuicao das despesas por categoria cadastrada."
          empty={!hasChartData(categoryData)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CurrencyTooltip theme={colors} />} />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
              >
                {categoryData.map((item, index) => (
                  <Cell key={item.name} fill={colors.categories[index % colors.categories.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Dívidas: pago vs restante"
          subtitle="Visão consolidada entre valores pagos e saldo ainda aberto."
          empty={!hasChartData(debtData)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CurrencyTooltip theme={colors} />} />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Pie
                data={debtData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
              >
                {debtData.map(item => (
                  <Cell key={item.name} fill={item.name === 'Pago' ? colors.income : colors.expense} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
