import { useEffect, useState } from 'react';
import { cn } from './utils.js';

const numberTypes = new Set(['number']);

export function Field({ label, children, className = '' }) {
  return (
    <label className={cn('grid min-w-0 gap-2 text-sm font-semibold text-finance-text', className)}>
      {label}
      {children}
    </label>
  );
}

export function Input({ className = '', type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'w-full min-w-0 max-w-full rounded-[10px] border border-finance-border bg-white px-3 py-2 text-sm text-finance-text outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-finance-blue focus:ring-4 focus:ring-blue-100 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50',
        numberTypes.has(type) ? 'font-number' : '',
        className
      )}
      {...props}
    />
  );
}

export function formatMoneyInputValue(value) {
  if (value === '' || value == null) return '';

  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';

  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function parseMoneyInputValue(value) {
  const text = String(value || '').trim();
  if (!text) return '';

  const hasDecimalComma = text.includes(',');
  const hasOnlyDecimalDot = !hasDecimalComma && /^\d+\.\d{1,2}$/.test(text);
  const normalized = hasDecimalComma
    ? text.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.')
    : hasOnlyDecimalDot
      ? text
    : text.replace(/[^\d]/g, '');

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return '';

  return String(parsed);
}

export function MoneyInput({ value, onChange, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(() => formatMoneyInputValue(value));

  useEffect(() => {
    if (!focused) {
      setDisplayValue(formatMoneyInputValue(value));
    }
  }, [focused, value]);

  function rawValueForEditing(currentValue) {
    if (currentValue === '' || currentValue == null) return '';
    return String(currentValue).replace('.', ',');
  }

  return (
    <Input
      inputMode="decimal"
      type="text"
      value={focused ? displayValue : formatMoneyInputValue(value)}
      onChange={event => {
        const nextDisplayValue = event.target.value;
        const nextValue = parseMoneyInputValue(nextDisplayValue);

        setDisplayValue(nextDisplayValue);
        onChange?.({ target: { value: nextValue } });
      }}
      onFocus={event => {
        setFocused(true);
        setDisplayValue(rawValueForEditing(value));
        onFocus?.(event);
      }}
      onBlur={event => {
        setFocused(false);
        setDisplayValue(formatMoneyInputValue(value));
        onBlur?.(event);
      }}
      {...props}
    />
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={cn(
        'min-h-[76px] w-full min-w-0 max-w-full rounded-[10px] border border-finance-border bg-white px-3 py-2 text-sm text-finance-text outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-finance-blue focus:ring-4 focus:ring-blue-100 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50',
        className
      )}
      {...props}
    />
  );
}
