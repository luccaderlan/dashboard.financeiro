import { readLegacyDashboardDataSnapshot, writeLegacyAppState } from './legacyDashboardData.js';
import { readJsonStorage, STORAGE_KEYS, writeJsonStorage } from './storage.js';

export const RECURRENCE_TYPES = [
  { id: 'entrada', label: 'Entrada', categoryContext: 'entrada' },
  { id: 'saida', label: 'Saída', categoryContext: 'saida' },
  { id: 'divida', label: 'Dívida', categoryContext: 'divida' }
];

function parseAmount(value) {
  return Math.max(0, parseFloat(value) || 0);
}

function normalizeString(value, fallback = '') {
  return (value || fallback).toString().trim();
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function currentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function normalizeType(type) {
  return RECURRENCE_TYPES.some(item => item.id === type) ? type : 'saida';
}

function createRecurrenceId() {
  return `rec-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createNumericId(items = []) {
  const ids = new Set(items.map(item => String(item.id)));
  let id = Date.now();

  while (ids.has(String(id))) {
    id += 1;
  }

  return id;
}

function monthFromDate(date) {
  return (date || '').slice(0, 7);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function dateForMonth(baseDate, monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const baseDay = Number((baseDate || '').slice(8, 10)) || 1;
  const monthIndex = month - 1;
  const day = Math.min(baseDay, daysInMonth(year, monthIndex));

  return `${monthKey}-${String(day).padStart(2, '0')}`;
}

function normalizeRecurrence(recurrence) {
  const type = normalizeType(recurrence.type || recurrence.tipo);
  const active = recurrence.active === undefined ? true : Boolean(recurrence.active);

  return {
    id: recurrence.id || createRecurrenceId(),
    type,
    desc: normalizeString(recurrence.desc || recurrence.description, 'Recorrência'),
    valor: parseAmount(recurrence.valor || recurrence.value),
    cat: normalizeString(recurrence.cat || recurrence.category, type === 'divida' ? 'outro' : 'Outro'),
    frequency: 'mensal',
    baseDate: normalizeString(recurrence.baseDate || recurrence.dataBase, today()),
    active,
    appliedMonths: Array.isArray(recurrence.appliedMonths) ? recurrence.appliedMonths : [],
    createdAt: recurrence.createdAt || new Date().toISOString(),
    updatedAt: recurrence.updatedAt || new Date().toISOString()
  };
}

function normalizeRecurrences(value) {
  return Array.isArray(value) ? value.map(normalizeRecurrence) : [];
}

function validateRecurrenceInput(input) {
  const type = normalizeType(input.type);
  const desc = normalizeString(input.desc);
  const valor = parseAmount(input.valor);

  if (!desc) {
    throw new Error('Informe a descrição da recorrência.');
  }

  if (valor <= 0) {
    throw new Error('Informe um valor maior que zero.');
  }

  return {
    type,
    desc,
    valor,
    cat: normalizeString(input.cat, type === 'divida' ? 'outro' : 'Outro'),
    frequency: 'mensal',
    baseDate: normalizeString(input.baseDate, today()),
    active: input.active === undefined ? true : Boolean(input.active)
  };
}

export function readFinancialRecurrences() {
  return normalizeRecurrences(readJsonStorage(STORAGE_KEYS.recurrences, []));
}

export function writeFinancialRecurrences(recurrences) {
  writeJsonStorage(STORAGE_KEYS.recurrences, normalizeRecurrences(recurrences));
}

export function addFinancialRecurrence(input) {
  const recurrence = normalizeRecurrence({
    ...validateRecurrenceInput(input),
    id: createRecurrenceId()
  });
  const recurrences = readFinancialRecurrences();

  writeFinancialRecurrences([recurrence, ...recurrences]);
  return recurrence;
}

export function updateFinancialRecurrence(id, input) {
  const recurrences = readFinancialRecurrences();
  const index = recurrences.findIndex(recurrence => recurrence.id === id);

  if (index < 0) {
    throw new Error('Recorrência não encontrada.');
  }

  const current = recurrences[index];
  const next = normalizeRecurrence({
    ...current,
    ...validateRecurrenceInput(input),
    appliedMonths: current.appliedMonths,
    updatedAt: new Date().toISOString()
  });

  recurrences[index] = next;
  writeFinancialRecurrences(recurrences);
  return next;
}

export function deleteFinancialRecurrence(id) {
  const recurrences = readFinancialRecurrences();
  const nextRecurrences = recurrences.filter(recurrence => recurrence.id !== id);

  if (nextRecurrences.length === recurrences.length) {
    throw new Error('Recorrência não encontrada.');
  }

  writeFinancialRecurrences(nextRecurrences);
}

function shouldApplyRecurrence(recurrence, monthKey) {
  if (!recurrence.active) return false;
  if (recurrence.frequency !== 'mensal') return false;
  if (monthFromDate(recurrence.baseDate) > monthKey) return false;
  return !recurrence.appliedMonths.includes(monthKey);
}

function createCashFlowFromRecurrence(recurrence, monthKey, existingItems) {
  return {
    id: createNumericId(existingItems),
    tipo: recurrence.type,
    desc: recurrence.desc,
    valor: recurrence.valor,
    data: dateForMonth(recurrence.baseDate, monthKey),
    cat: recurrence.cat,
    autoGenerated: true,
    recurrenceId: recurrence.id,
    recurrenceMonth: monthKey
  };
}

function createDebtFromRecurrence(recurrence, monthKey, existingDebts) {
  return {
    id: createNumericId(existingDebts),
    desc: recurrence.desc,
    valor: recurrence.valor,
    pago: 0,
    cat: recurrence.cat,
    parcelas: 1,
    venc: dateForMonth(recurrence.baseDate, monthKey),
    obs: 'Gerada automaticamente por recorrência.',
    autoGenerated: true,
    recurrenceId: recurrence.id,
    recurrenceMonth: monthKey
  };
}

export function applyDueRecurrences(date = new Date()) {
  const monthKey = currentMonthKey(date);
  const recurrences = readFinancialRecurrences();
  const dashboardData = readLegacyDashboardDataSnapshot();
  let fluxo = [...dashboardData.fluxo];
  let dividas = [...dashboardData.dividas];
  let generatedCount = 0;

  const nextRecurrences = recurrences.map(recurrence => {
    if (!shouldApplyRecurrence(recurrence, monthKey)) return recurrence;

    if (recurrence.type === 'divida') {
      const debt = createDebtFromRecurrence(recurrence, monthKey, dividas);
      dividas = [...dividas, debt];
    } else {
      const item = createCashFlowFromRecurrence(recurrence, monthKey, fluxo);
      fluxo = [...fluxo, item];
    }

    generatedCount++;
    return {
      ...recurrence,
      appliedMonths: [...recurrence.appliedMonths, monthKey],
      updatedAt: new Date().toISOString()
    };
  });

  if (!generatedCount) {
    return { generatedCount: 0, monthKey };
  }

  writeLegacyAppState({
    ...dashboardData.rawState,
    fluxo,
    dividas,
    emprestimos: dashboardData.emprestimos
  });
  writeFinancialRecurrences(nextRecurrences);

  return { generatedCount, monthKey };
}
