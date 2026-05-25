import { readJsonStorage, STORAGE_KEYS, writeJsonStorage } from './storage.js';

export const CATEGORY_CONTEXTS = [
  { id: 'entrada', label: 'Entradas' },
  { id: 'saida', label: 'Saídas' },
  { id: 'divida', label: 'Dívidas' },
  { id: 'meta', label: 'Metas' }
];

const fallbackByContext = {
  entrada: 'Outro',
  saida: 'Outro',
  divida: 'outro',
  meta: 'Geral'
};

const defaultCategories = [
  { context: 'entrada', value: 'Salario', label: 'Salario' },
  { context: 'entrada', value: 'Venda / Servico', label: 'Venda / Servico' },
  { context: 'entrada', value: 'Emprestimo recebido', label: 'Emprestimo recebido' },
  { context: 'entrada', value: 'Outro', label: 'Outro' },
  { context: 'saida', value: 'Aluguel', label: 'Aluguel' },
  { context: 'saida', value: 'Alimentacao', label: 'Alimentação' },
  { context: 'saida', value: 'Conta / Luz / Agua', label: 'Conta / Luz / Água' },
  { context: 'saida', value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
  { context: 'saida', value: 'Fornecedor', label: 'Fornecedor' },
  { context: 'saida', value: 'Salario de funcionario', label: 'Salário de funcionário' },
  { context: 'saida', value: 'Imposto', label: 'Imposto' },
  { context: 'saida', value: 'Outro', label: 'Outro' },
  { context: 'divida', value: 'empresa', label: 'Empresa / Fornecedor' },
  { context: 'divida', value: 'cartao', label: 'Cartão de Crédito' },
  { context: 'divida', value: 'pessoal', label: 'Dívida Pessoal' },
  { context: 'divida', value: 'outro', label: 'Outro' },
  { context: 'meta', value: 'Geral', label: 'Geral' },
  { context: 'meta', value: 'Reserva', label: 'Reserva' },
  { context: 'meta', value: 'Viagem', label: 'Viagem' },
  { context: 'meta', value: 'Investimento', label: 'Investimento' }
];

function createCategoryId() {
  return `cat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeString(value, fallback = '') {
  return (value || fallback).toString().trim();
}

function normalizeContext(context) {
  return CATEGORY_CONTEXTS.some(item => item.id === context) ? context : 'saida';
}

function createDefaultCategories() {
  return defaultCategories.map((category, index) => ({
    id: `default-${category.context}-${index}`,
    context: category.context,
    value: category.value,
    label: category.label,
    system: true
  }));
}

function normalizeCategory(category) {
  const context = normalizeContext(category.context);
  const label = normalizeString(category.label || category.name || category.value, fallbackByContext[context]);
  const value = normalizeString(category.value || label, fallbackByContext[context]);

  return {
    id: category.id || createCategoryId(),
    context,
    value,
    label,
    system: Boolean(category.system),
    createdAt: category.createdAt || new Date().toISOString(),
    updatedAt: category.updatedAt || new Date().toISOString()
  };
}

function normalizeCategories(value) {
  if (!Array.isArray(value)) return createDefaultCategories().map(normalizeCategory);

  const seen = new Set();
  return value.map(normalizeCategory).filter(category => {
    const key = `${category.context}:${category.value.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function validateCategoryInput(input) {
  const context = normalizeContext(input.context);
  const label = normalizeString(input.label || input.name);

  if (!label) {
    throw new Error('Informe o nome da categoria.');
  }

  return {
    context,
    label,
    value: normalizeString(input.value || label, fallbackByContext[context])
  };
}

export function readFinancialCategories() {
  return normalizeCategories(readJsonStorage(STORAGE_KEYS.categories, null));
}

export function writeFinancialCategories(categories) {
  writeJsonStorage(STORAGE_KEYS.categories, normalizeCategories(categories));
}

export function addFinancialCategory(input) {
  const categories = readFinancialCategories();
  const categoryInput = validateCategoryInput(input);
  const duplicated = categories.some(category =>
    category.context === categoryInput.context
    && category.value.toLowerCase() === categoryInput.value.toLowerCase()
  );

  if (duplicated) {
    throw new Error('Essa categoria já existe.');
  }

  const category = normalizeCategory({
    ...categoryInput,
    id: createCategoryId()
  });

  writeFinancialCategories([...categories, category]);
  return category;
}

export function updateFinancialCategory(id, input) {
  const categories = readFinancialCategories();
  const index = categories.findIndex(category => category.id === id);

  if (index < 0) {
    throw new Error('Categoria não encontrada.');
  }

  const categoryInput = validateCategoryInput(input);
  const duplicated = categories.some(category =>
    category.id !== id
    && category.context === categoryInput.context
    && category.value.toLowerCase() === categoryInput.value.toLowerCase()
  );

  if (duplicated) {
    throw new Error('Essa categoria já existe.');
  }

  categories[index] = normalizeCategory({
    ...categories[index],
    ...categoryInput,
    updatedAt: new Date().toISOString()
  });

  writeFinancialCategories(categories);
  return categories[index];
}

export function deleteFinancialCategory(id) {
  const categories = readFinancialCategories();
  const nextCategories = categories.filter(category => category.id !== id);

  if (nextCategories.length === categories.length) {
    throw new Error('Categoria não encontrada.');
  }

  writeFinancialCategories(nextCategories);
}

export function getCategoryOptions(categories = [], context, currentValue = '') {
  const normalizedContext = normalizeContext(context);
  const options = categories
    .filter(category => category.context === normalizedContext)
    .map(category => ({
      id: category.id,
      value: category.value,
      label: category.label
    }));

  const hasCurrent = currentValue && options.some(option => option.value === currentValue);
  const withCurrent = hasCurrent || !currentValue
    ? options
    : [{ id: `legacy-${normalizedContext}-${currentValue}`, value: currentValue, label: currentValue }, ...options];

  return withCurrent.length
    ? withCurrent
    : [{ id: `fallback-${normalizedContext}`, value: fallbackByContext[normalizedContext], label: fallbackByContext[normalizedContext] }];
}

export function getCategoryLabel(categories = [], context, value) {
  const option = getCategoryOptions(categories, context, value).find(category => category.value === value);
  return option?.label || value || fallbackByContext[normalizeContext(context)];
}
