function monthKeyFromDate(date) {
  return (date || '').slice(0, 7) || 'sem-data';
}

function monthLabelFromKey(key) {
  if (key === 'sem-data') return 'Sem data';

  const date = new Date(`${key}-01T12:00:00`);
  if (Number.isNaN(date.getTime())) return key;

  return date.toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit'
  });
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function getCashFlowComparisonData(cashFlow = []) {
  const totals = cashFlow.reduce(
    (summary, item) => {
      if (item.type === 'entrada') summary.income += Number(item.value) || 0;
      else summary.expenses += Number(item.value) || 0;
      return summary;
    },
    { income: 0, expenses: 0 }
  );

  return [
    { name: 'Entradas', value: roundMoney(totals.income), fill: '#16a34a' },
    { name: 'Saídas', value: roundMoney(totals.expenses), fill: '#dc2626' }
  ];
}

export function getMonthlyEvolutionData(cashFlow = []) {
  const months = new Map();

  cashFlow.forEach(item => {
    const key = monthKeyFromDate(item.date);
    const current = months.get(key) || {
      key,
      month: monthLabelFromKey(key),
      entradas: 0,
      saidas: 0,
      saldo: 0
    };

    if (item.type === 'entrada') current.entradas += Number(item.value) || 0;
    else current.saidas += Number(item.value) || 0;

    current.saldo = current.entradas - current.saidas;
    months.set(key, current);
  });

  return [...months.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(item => ({
      ...item,
      entradas: roundMoney(item.entradas),
      saidas: roundMoney(item.saidas),
      saldo: roundMoney(item.saldo)
    }));
}

export function getExpenseCategoryData(cashFlow = []) {
  const categories = new Map();

  cashFlow
    .filter(item => item.type !== 'entrada')
    .forEach(item => {
      const category = item.category || 'Sem categoria';
      categories.set(category, (categories.get(category) || 0) + (Number(item.value) || 0));
    });

  return [...categories.entries()]
    .map(([name, value]) => ({ name, value: roundMoney(value) }))
    .sort((a, b) => b.value - a.value);
}

export function getDebtBreakdownData({ activeDebts = [], paidDebts = [] } = {}) {
  const paidFromActive = activeDebts.reduce((total, debt) => total + (Number(debt.paidValue) || 0), 0);
  const paidFromClosed = paidDebts.reduce((total, debt) => total + (Number(debt.totalValue) || 0), 0);
  const remaining = activeDebts.reduce((total, debt) => total + (Number(debt.remainingValue) || 0), 0);

  return [
    { name: 'Pago', value: roundMoney(paidFromActive + paidFromClosed), fill: '#16a34a' },
    { name: 'Restante', value: roundMoney(remaining), fill: '#dc2626' }
  ];
}

export function hasChartData(data = []) {
  return data.some(item => (Number(item.value) || 0) > 0);
}
