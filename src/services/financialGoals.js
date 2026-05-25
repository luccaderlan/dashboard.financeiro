import { readJsonStorage, STORAGE_KEYS, writeJsonStorage } from './storage.js';

function parseAmount(value) {
  return Math.max(0, parseFloat(value) || 0);
}

function normalizeString(value, fallback = '') {
  return (value || fallback).toString().trim();
}

function createGoalId() {
  return `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeGoal(goal) {
  const targetValue = parseAmount(goal.targetValue);
  const currentValue = parseAmount(goal.currentValue);
  const progress = targetValue > 0 ? Math.min(100, Math.round((currentValue / targetValue) * 100)) : 0;

  return {
    id: goal.id || createGoalId(),
    title: normalizeString(goal.title, 'Meta financeira'),
    targetValue,
    currentValue,
    category: normalizeString(goal.category, 'Geral'),
    deadline: normalizeString(goal.deadline),
    createdAt: goal.createdAt || new Date().toISOString(),
    updatedAt: goal.updatedAt || new Date().toISOString(),
    progress,
    completed: currentValue >= targetValue && targetValue > 0
  };
}

function normalizeGoals(value) {
  return Array.isArray(value) ? value.map(normalizeGoal) : [];
}

function validateGoalInput(input) {
  const title = normalizeString(input.title);
  const targetValue = parseAmount(input.targetValue);

  if (!title) {
    throw new Error('Informe o titulo da meta.');
  }

  if (targetValue <= 0) {
    throw new Error('Informe um valor alvo maior que zero.');
  }

  return {
    title,
    targetValue,
    currentValue: parseAmount(input.currentValue),
    category: normalizeString(input.category, 'Geral'),
    deadline: normalizeString(input.deadline)
  };
}

export function readFinancialGoals() {
  return normalizeGoals(readJsonStorage(STORAGE_KEYS.goals, []));
}

export function writeFinancialGoals(goals) {
  writeJsonStorage(STORAGE_KEYS.goals, normalizeGoals(goals));
}

export function addFinancialGoal(input) {
  const goal = normalizeGoal({
    ...validateGoalInput(input),
    id: createGoalId()
  });
  const goals = readFinancialGoals();

  writeFinancialGoals([goal, ...goals]);
  return goal;
}

export function updateFinancialGoal(id, input) {
  const goals = readFinancialGoals();
  const index = goals.findIndex(goal => goal.id === id);

  if (index < 0) {
    throw new Error('Meta não encontrada.');
  }

  const updatedGoal = normalizeGoal({
    ...goals[index],
    ...validateGoalInput(input),
    updatedAt: new Date().toISOString()
  });

  goals[index] = updatedGoal;
  writeFinancialGoals(goals);
  return updatedGoal;
}

export function addValueToFinancialGoal(id, amount) {
  const parsedAmount = Math.max(0, parseFloat(amount) || 0);

  if (parsedAmount <= 0) {
    throw new Error('Informe um valor maior que zero.');
  }

  const goals = readFinancialGoals();
  const index = goals.findIndex(goal => goal.id === id);

  if (index < 0) {
    throw new Error('Meta não encontrada.');
  }

  const updatedGoal = normalizeGoal({
    ...goals[index],
    currentValue: goals[index].currentValue + parsedAmount,
    updatedAt: new Date().toISOString()
  });

  goals[index] = updatedGoal;
  writeFinancialGoals(goals);
  return updatedGoal;
}

export function deleteFinancialGoal(id) {
  const goals = readFinancialGoals();
  const nextGoals = goals.filter(goal => goal.id !== id);

  if (nextGoals.length === goals.length) {
    throw new Error('Meta não encontrada.');
  }

  writeFinancialGoals(nextGoals);
}

export function calculateGoalsSummary(goals = []) {
  const normalizedGoals = normalizeGoals(goals);
  const totals = normalizedGoals.reduce(
    (summary, goal) => {
      summary.targetValue += goal.targetValue;
      summary.currentValue += goal.currentValue;
      if (goal.completed) summary.completedCount++;
      return summary;
    },
    { targetValue: 0, currentValue: 0, completedCount: 0, count: normalizedGoals.length }
  );

  const averageProgress = totals.count
    ? Math.round(normalizedGoals.reduce((total, goal) => total + goal.progress, 0) / totals.count)
    : 0;

  return {
    ...totals,
    averageProgress
  };
}
