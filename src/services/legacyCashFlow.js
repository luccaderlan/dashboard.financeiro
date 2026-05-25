function adaptLegacyCashFlowItem(item) {
  return {
    id: item.id,
    type: item.tipo,
    description: item.desc || '',
    value: Number(item.valor) || 0,
    date: item.data || '',
    category: item.cat || 'Sem categoria'
  };
}

export function getLegacyCashFlowItems(cashFlow = []) {
  // Mirrors renderFluxo(): newest releases appear first in the legacy list.
  return [...cashFlow]
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .map(adaptLegacyCashFlowItem);
}
