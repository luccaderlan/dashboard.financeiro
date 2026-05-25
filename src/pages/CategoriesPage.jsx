import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Field, Input, Select, useToast } from '../components/ui/index.js';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import {
  CATEGORY_CONTEXTS,
  addFinancialCategory,
  deleteFinancialCategory,
  updateFinancialCategory
} from '../services/financialCategories.js';

const initialForm = {
  context: 'saida',
  label: ''
};

function contextLabel(context) {
  return CATEGORY_CONTEXTS.find(item => item.id === context)?.label || context;
}

function formFromCategory(category) {
  if (!category) return initialForm;

  return {
    context: category.context,
    label: category.label
  };
}

export function CategoriesPage() {
  const { categories, refreshFinancialCategories } = useDashboardContext();
  const [form, setForm] = useState(initialForm);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [openGroups, setOpenGroups] = useState({});
  const formRef = useRef(null);
  const showToast = useToast();

  function toggleGroup(groupId) {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  const groupedCategories = useMemo(() => {
    return CATEGORY_CONTEXTS.map(context => ({
      ...context,
      categories: categories.filter(category => category.context === context.id)
    }));
  }, [categories]);

  useEffect(() => {
    setForm(formFromCategory(editingCategory));
    setMessage('');
  }, [editingCategory]);

  function updateField(field, value) {
    setMessage('');
    setForm(current => ({ ...current, [field]: value }));
  }

  function scrollToForm() {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNewCategory() {
    setEditingCategory(null);
    setMessage('');
    setShowForm(true);
    scrollToForm();
  }

  function handleEditCategory(category) {
    setEditingCategory(category);
    setShowForm(true);
    scrollToForm();
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      if (editingCategory) {
        updateFinancialCategory(editingCategory.id, form);
        setEditingCategory(null);
        setShowForm(false);
        setMessage('Categoria atualizada.');
        showToast({ title: 'Categoria atualizada', description: 'Os formulários já usam a nova configuração.', tone: 'success' });
      } else {
        addFinancialCategory(form);
        setForm(initialForm);
        setShowForm(false);
        setMessage('Categoria criada.');
        showToast({ title: 'Categoria criada', description: 'Ela já está disponível nos formulários.', tone: 'success' });
      }

      refreshFinancialCategories();
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível salvar', description: error.message, tone: 'error' });
    }
  }

  function handleDelete(category) {
    const confirmed = window.confirm(`Excluir a categoria "${category.label}"? Os lançamentos antigos continuarão preservados.`);
    if (!confirmed) return;

    try {
      deleteFinancialCategory(category.id);

      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
        setShowForm(false);
      }

      refreshFinancialCategories();
      setMessage('Categoria excluída.');
      showToast({ title: 'Categoria excluída', description: 'Dados antigos foram preservados como fallback.', tone: 'success' });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Não foi possível excluir', description: error.message, tone: 'error' });
    }
  }

  return (
    <section className="space-y-4">
      <div ref={formRef}>
        {!showForm ? (
          <Button type="button" onClick={handleNewCategory}>Nova categoria</Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-[180px_1fr_auto]" onSubmit={handleSubmit}>
            <Field label="Modulo">
              <Select
                value={form.context}
                onChange={event => updateField('context', event.target.value)}
              >
                {CATEGORY_CONTEXTS.map(context => (
                  <option key={context.id} value={context.id}>{context.label}</option>
                ))}
              </Select>
            </Field>

            <Field label="Nome">
              <Input
                placeholder="Ex: Mercado, Viagem, Banco..."
                value={form.label}
                onChange={event => updateField('label', event.target.value)}
              />
            </Field>

            <div className="flex flex-wrap items-end gap-2">
              <Button className="w-full sm:w-auto" type="submit">
                {editingCategory ? 'Salvar' : 'Criar'}
              </Button>
              {editingCategory ? (
                <Button
                  className="w-full sm:w-auto"
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingCategory(null);
                    setShowForm(false);
                  }}
                >
                  Cancelar
                </Button>
              ) : null}
            </div>

            {message ? (
              <div className="text-sm font-medium text-finance-muted md:col-span-3">{message}</div>
            ) : null}
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groupedCategories.map(group => {
          const isOpen = !!openGroups[group.id];
          return (
            <Card key={group.id}>
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-t-[14px]"
              >
                <CardTitle className="pointer-events-none">{group.label}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge>{group.categories.length} item(s)</Badge>
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={['text-finance-muted transition-transform duration-200', isOpen ? 'rotate-180' : ''].join(' ')}
                  >
                    <polyline points="4 6 8 10 12 6" />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <CardContent>
                  {group.categories.length ? (
                    <div className="space-y-2">
                      {group.categories.map(category => (
                        <div
                          key={category.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-finance-border bg-slate-50 px-3 py-2 dark:bg-slate-950"
                        >
                          <div className="min-w-0">
                            <div className="break-words text-sm font-bold text-finance-text">{category.label}</div>
                            <div className="text-xs font-medium text-finance-muted">{contextLabel(category.context)}</div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="ghost" type="button" onClick={() => handleEditCategory(category)}>
                              Editar
                            </Button>
                            <Button size="sm" variant="danger" type="button" onClick={() => handleDelete(category)}>
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>Nenhuma categoria cadastrada para este módulo.</EmptyState>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
