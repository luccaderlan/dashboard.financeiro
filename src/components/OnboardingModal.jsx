import { useState } from 'react';
import { Button, Field, Input } from './ui/index.js';
import { Modal } from './Modal.jsx';
import { saveLegacyOnboarding } from '../services/legacyOnboardingWrite.js';

export function OnboardingModal({ open, initialName = '', onComplete }) {
  const [nome, setNome] = useState(initialName);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    try {
      saveLegacyOnboarding({ nome });
      setError('');
      onComplete?.();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <Modal title="Bem-vindo ao MeuControle" open={open} className="max-w-md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <p className="text-sm leading-relaxed text-finance-muted">
          Vamos preparar seu primeiro acesso. Seu nome será salvo no mesmo cadastro local usado pelo dashboard atual.
        </p>

        <Field label="Seu nome">
          <Input
            autoFocus
            value={nome}
            onChange={event => setNome(event.target.value)}
            placeholder="Digite seu nome"
          />
        </Field>

        {error ? (
          <div className="rounded-[10px] border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-finance-red dark:border-red-900 dark:bg-red-950/40">
            {error}
          </div>
        ) : null}

        <Button className="w-full" type="submit">
          Comecar
        </Button>
      </form>
    </Modal>
  );
}
