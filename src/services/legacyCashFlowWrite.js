import { readLegacyDashboardDataSnapshot, writeLegacyAppState } from './legacyDashboardData.js';

function today() {
  return new Date().toISOString().split('T')[0];
}

function parseAmount(value) {
  return parseFloat(value) || 0;
}

function normalizeCashFlowType(type) {
  return type === 'entrada' ? 'entrada' : 'saida';
}

function createCashFlowId(items = []) {
  const existingIds = new Set(items.map(item => String(item.id)));
  let id = Date.now();

  while (existingIds.has(String(id))) {
    id += 1;
  }

  return id;
}

function normalizeCashFlowInput(input, id = Date.now()) {
  const tipo = normalizeCashFlowType(input.tipo);
  const desc = (input.desc || '').trim();
  const valor = parseAmount(input.valor);

  if (!desc) {
    throw new Error('Informe a descrição.');
  }

  if (!valor) {
    throw new Error('Informe o valor.');
  }

  return {
    id,
    tipo,
    desc,
    valor,
    data: input.data || today(),
    cat: input.cat || 'Outro'
  };
}

export function addLegacyCashFlowItem(input) {
  const dashboardData = readLegacyDashboardDataSnapshot();
  const item = normalizeCashFlowInput(input, createCashFlowId(dashboardData.fluxo));

  // Writes the exact fluxo item shape consumed by the legacy saveFluxo() path.
  writeLegacyAppState({
    ...dashboardData.rawState,
    fluxo: [...dashboardData.fluxo, item],
    dividas: dashboardData.dividas,
    emprestimos: dashboardData.emprestimos
  });

  return item;
}

export function updateLegacyCashFlowItem(id, input) {
  const dashboardData = readLegacyDashboardDataSnapshot();
  const itemIndex = dashboardData.fluxo.findIndex(item => String(item.id) === String(id));

  if (itemIndex < 0) {
    throw new Error('Lançamento não encontrado.');
  }

  const currentItem = dashboardData.fluxo[itemIndex];
  const updatedItem = normalizeCashFlowInput(input, currentItem.id);
  const fluxo = [...dashboardData.fluxo];
  fluxo[itemIndex] = updatedItem;

  writeLegacyAppState({
    ...dashboardData.rawState,
    fluxo,
    dividas: dashboardData.dividas,
    emprestimos: dashboardData.emprestimos
  });

  return updatedItem;
}

export function deleteLegacyCashFlowItem(id) {
  const dashboardData = readLegacyDashboardDataSnapshot();
  const fluxo = dashboardData.fluxo.filter(item => String(item.id) !== String(id));

  if (fluxo.length === dashboardData.fluxo.length) {
    throw new Error('Lançamento não encontrado.');
  }

  writeLegacyAppState({
    ...dashboardData.rawState,
    fluxo,
    dividas: dashboardData.dividas,
    emprestimos: dashboardData.emprestimos
  });
}

export function deleteAllLegacyCashFlowItems() {
  const dashboardData = readLegacyDashboardDataSnapshot();

  writeLegacyAppState({
    ...dashboardData.rawState,
    fluxo: [],
    dividas: dashboardData.dividas,
    emprestimos: dashboardData.emprestimos
  });
}
