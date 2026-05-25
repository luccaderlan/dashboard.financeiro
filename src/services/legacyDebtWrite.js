import { readLegacyDashboardDataSnapshot, writeLegacyAppState } from './legacyDashboardData.js';

function today() {
  return new Date().toISOString().split('T')[0];
}

function parseAmount(value) {
  return parseFloat(value) || 0;
}

function normalizeDebtCategory(category) {
  return (category || 'outro').toString().trim() || 'outro';
}

function createDebtId(existingDebts) {
  const ids = existingDebts.map(debt => Number(debt.id)).filter(Number.isFinite);
  const timestamp = Date.now();

  return ids.includes(timestamp) ? Math.max(timestamp, ...ids) + 1 : timestamp;
}

function normalizeDebtInput(input) {
  const desc = (input.desc || '').trim();
  const valor = parseAmount(input.valor);

  if (!desc) {
    throw new Error('Informe o nome da dívida.');
  }

  if (!valor) {
    throw new Error('Informe o valor da dívida.');
  }

  return {
    desc,
    valor,
    cat: normalizeDebtCategory(input.cat),
    venc: input.venc || today(),
    obs: input.obs || ''
  };
}

export function addLegacyDebt(input) {
  const normalizedInput = normalizeDebtInput(input);
  const dashboardData = readLegacyDashboardDataSnapshot();
  const debt = {
    id: createDebtId(dashboardData.dividas),
    desc: normalizedInput.desc,
    valor: normalizedInput.valor,
    pago: 0,
    cat: normalizedInput.cat,
    parcelas: 1,
    venc: normalizedInput.venc,
    obs: normalizedInput.obs
  };

  // Writes the same new-debt shape produced by the legacy saveDívida() flow.
  writeLegacyAppState({
    ...dashboardData.rawState,
    dividas: [...dashboardData.dividas, debt],
    fluxo: dashboardData.fluxo,
    emprestimos: dashboardData.emprestimos
  });

  return debt;
}

export function updateLegacyDebt(id, input) {
  const normalizedInput = normalizeDebtInput(input);
  const dashboardData = readLegacyDashboardDataSnapshot();
  let updatedDebt;

  const dividas = dashboardData.dividas.map(debt => {
    if (debt.id !== id) return debt;

    // Editing updates only user-editable fields and preserves payment/history fields.
    updatedDebt = {
      id: debt.id,
      desc: normalizedInput.desc,
      valor: normalizedInput.valor,
      pago: parseAmount(debt.pago),
      cat: normalizedInput.cat,
      parcelas: debt.parcelas ?? 1,
      venc: normalizedInput.venc,
      obs: normalizedInput.obs
    };

    if (debt.pagaEm) {
      updatedDebt.pagaEm = debt.pagaEm;
    }

    return updatedDebt;
  });

  if (!updatedDebt) {
    throw new Error('Dívida não encontrada.');
  }

  writeLegacyAppState({
    ...dashboardData.rawState,
    dividas,
    fluxo: dashboardData.fluxo,
    emprestimos: dashboardData.emprestimos
  });

  return updatedDebt;
}

export function deleteLegacyDebt(id) {
  const dashboardData = readLegacyDashboardDataSnapshot();
  const dividas = dashboardData.dividas.filter(debt => debt.id !== id);

  if (dividas.length === dashboardData.dividas.length) {
    throw new Error('Dívida não encontrada.');
  }

  writeLegacyAppState({
    ...dashboardData.rawState,
    dividas,
    fluxo: dashboardData.fluxo,
    emprestimos: dashboardData.emprestimos
  });
}

export function markLegacyDebtAsPaid(id) {
  const dashboardData = readLegacyDashboardDataSnapshot();
  let updatedDebt;

  const dividas = dashboardData.dividas.map(debt => {
    if (debt.id !== id) return debt;

    updatedDebt = {
      ...debt,
      pago: debt.valor,
      pagaEm: today()
    };

    return updatedDebt;
  });

  if (!updatedDebt) {
    throw new Error('Dívida não encontrada.');
  }

  // Mirrors marcarDívidaPaga(): preserve fields, set pago to valor and pagaEm to today.
  writeLegacyAppState({
    ...dashboardData.rawState,
    dividas,
    fluxo: dashboardData.fluxo,
    emprestimos: dashboardData.emprestimos
  });

  return updatedDebt;
}
