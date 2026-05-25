export function formatCurrency(value) {
  return 'R$ ' + parseFloat(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatCompactCurrency(value) {
  const amount = parseFloat(value || 0);
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1000000000000) return `${sign}R$ ${(abs / 1000000000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} tri`;
  if (abs >= 1000000000) return `${sign}R$ ${(abs / 1000000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} bi`;
  if (abs >= 1000000) return `${sign}R$ ${(abs / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  if (abs >= 1000) return `${sign}R$ ${(abs / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;

  return `${sign}R$ ${abs.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
}

export function formatDate(date) {
  return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
}
