import { calculateBudgetUsage } from './financialBudgets.js';

function monthKeyFromDate(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function previousMonthKey(monthKey) {
  const date = new Date(`${monthKey}-01T12:00:00`);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}

function matchesMonth(date, monthKey) {
  return Boolean(date) && date.slice(0, 7) === monthKey;
}

function sum(items, getValue) {
  return items.reduce((total, item) => total + (Number(getValue(item)) || 0), 0);
}

function getMonthCashFlow(cashFlow = [], monthKey) {
  const items = cashFlow.filter(item => matchesMonth(item.date, monthKey));
  const income = sum(items.filter(item => item.type === 'entrada'), item => item.value);
  const expenses = sum(items.filter(item => item.type !== 'entrada'), item => item.value);

  return {
    items,
    income,
    expenses,
    balance: income - expenses
  };
}

function getExpenseCategories(items = []) {
  const categories = new Map();

  items
    .filter(item => item.type !== 'entrada')
    .forEach(item => {
      const category = item.category || 'Sem categoria';
      categories.set(category, (categories.get(category) || 0) + (Number(item.value) || 0));
    });

  return [...categories.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

function addInsight(insights, insight) {
  insights.push({
    id: insight.id,
    priority: insight.priority || 'info',
    title: insight.title,
    description: insight.description,
    metric: insight.metric || ''
  });
}

const priorityWeight = {
  critical: 0,
  warning: 1,
  info: 2
};

export function getFinancialInsights({
  budgets = [],
  cashFlow = [],
  debts = {},
  goals = {},
  recurrences = []
} = {}, date = new Date()) {
  const currentMonth = monthKeyFromDate(date);
  const previousMonth = previousMonthKey(currentMonth);
  const currentFlow = getMonthCashFlow(cashFlow, currentMonth);
  const previousFlow = getMonthCashFlow(cashFlow, previousMonth);
  const budgetUsage = calculateBudgetUsage(budgets, cashFlow, currentMonth);
  const insights = [];

  budgetUsage.items
    .filter(item => item.status === 'over')
    .slice(0, 2)
    .forEach(item => addInsight(insights, {
      id: `budget-over-${item.id}`,
      priority: 'critical',
      title: `Orçamento ultrapassado: ${item.category}`,
      description: `Esta categoria já passou do limite mensal em ${item.percent}%.`,
      metric: `${item.percent}%`
    }));

  budgetUsage.items
    .filter(item => item.status === 'near')
    .slice(0, 2)
    .forEach(item => addInsight(insights, {
      id: `budget-near-${item.id}`,
      priority: 'warning',
      title: `Orçamento perto do limite: ${item.category}`,
      description: `O consumo já chegou a ${item.percent}% do limite deste mês.`,
      metric: `${item.percent}%`
    }));

  const overdueDebts = (debts.activeDebts || []).filter(debt => debt.status === 'overdue');
  if (overdueDebts.length) {
    addInsight(insights, {
      id: 'debts-overdue',
      priority: 'critical',
      title: 'Dívidas em atraso',
      description: `${overdueDebts.length} dívida(s) precisam de atenção imediata.`,
      metric: overdueDebts.length
    });
  }

  const dueSoonDebts = (debts.activeDebts || []).filter(debt => debt.status === 'dueSoon');
  if (dueSoonDebts.length) {
    addInsight(insights, {
      id: 'debts-due-soon',
      priority: 'warning',
      title: 'Contas vencendo em breve',
      description: `${dueSoonDebts.length} conta(s) vencem nos proximos dias.`,
      metric: dueSoonDebts.length
    });
  }

  if (previousFlow.expenses > 0) {
    const expenseChange = Math.round(((currentFlow.expenses - previousFlow.expenses) / previousFlow.expenses) * 100);

    if (expenseChange >= 15) {
      addInsight(insights, {
        id: 'expenses-up',
        priority: 'warning',
        title: 'Gastos subiram em relação ao mês anterior',
        description: `Suas saídas estão ${expenseChange}% acima do mês passado.`,
        metric: `${expenseChange}%`
      });
    } else if (expenseChange <= -10) {
      addInsight(insights, {
        id: 'expenses-down',
        priority: 'info',
        title: 'Gastos reduziram',
        description: `Suas saídas estão ${Math.abs(expenseChange)}% menores que no mês anterior.`,
        metric: `${Math.abs(expenseChange)}%`
      });
    }
  }

  if (previousFlow.items.length > 0) {
    const balanceChange = currentFlow.balance - previousFlow.balance;

    if (balanceChange < 0) {
      addInsight(insights, {
        id: 'balance-worse',
        priority: 'warning',
        title: 'Saldo mensal piorou',
        description: 'O saldo deste mês está abaixo do mês anterior.',
        metric: ''
      });
    } else if (balanceChange > 0) {
      addInsight(insights, {
        id: 'balance-better',
        priority: 'info',
        title: 'Saldo mensal melhorou',
        description: 'O saldo deste mês está melhor que o mês anterior.',
        metric: ''
      });
    }
  }

  const [largestCategory] = getExpenseCategories(currentFlow.items);
  if (largestCategory && currentFlow.expenses > 0) {
    const share = Math.round((largestCategory.value / currentFlow.expenses) * 100);
    addInsight(insights, {
      id: 'largest-expense-category',
      priority: share >= 45 ? 'warning' : 'info',
      title: `Maior gasto do mês: ${largestCategory.category}`,
      description: `Essa categoria representa ${share}% das saídas do mês.`,
      metric: `${share}%`
    });
  }

  const nearGoals = (goals.items || [])
    .filter(goal => !goal.completed && goal.progress >= 80)
    .slice(0, 2);
  nearGoals.forEach(goal => addInsight(insights, {
    id: `goal-near-${goal.id}`,
    priority: 'info',
    title: `Meta quase concluida: ${goal.title}`,
    description: `A meta já chegou a ${goal.progress}% do progresso.`,
    metric: `${goal.progress}%`
  }));

  const activeRecurrences = recurrences.filter(recurrence => recurrence.active);
  if (activeRecurrences.length) {
    addInsight(insights, {
      id: 'active-recurrences',
      priority: 'info',
      title: 'Automacoes financeiras ativas',
      description: `${activeRecurrences.length} recorrência(s) ajudam a manter o controle em dia.`,
      metric: activeRecurrences.length
    });
  }

  if (!insights.length) {
    addInsight(insights, {
      id: 'healthy-baseline',
      priority: 'info',
      title: 'Nenhum alerta importante agora',
      description: 'Continue acompanhando seus lançamentos para receber insights mais precisos.',
      metric: ''
    });
  }

  return insights
    .sort((a, b) => (priorityWeight[a.priority] ?? 2) - (priorityWeight[b.priority] ?? 2));
}
