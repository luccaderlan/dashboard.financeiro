import { useRef, useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle.jsx';
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '../components/ui/index.js';
import { useDashboardContext } from '../context/DashboardContext.jsx';
import { CategoriesPage } from './CategoriesPage.jsx';
import { downloadDashboardBackup, importDashboardBackup } from '../services/backupService.js';

export function SettingsPage() {
  const fileInputRef = useRef(null);
  const {
    refreshLegacyDashboardData,
    refreshFinancialBudgets,
    refreshFinancialCategories,
    refreshFinancialGoals,
    refreshFinancialRecurrences
  } = useDashboardContext();
  const [message, setMessage] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const showToast = useToast();

  function handleExport() {
    try {
      downloadDashboardBackup();
      setMessage('Backup exportado.');
      showToast({ title: 'Backup exportado', description: 'Arquivo JSON gerado com os dados atuais.', tone: 'success' });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Falha ao exportar', description: error.message, tone: 'error' });
    }
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setIsImporting(true);

    try {
      const jsonText = await file.text();
      importDashboardBackup(jsonText);
      refreshLegacyDashboardData();
      refreshFinancialBudgets();
      refreshFinancialCategories();
      refreshFinancialGoals();
      refreshFinancialRecurrences();
      setMessage('Backup importado com sucesso.');
      showToast({ title: 'Backup importado', description: 'Os dados foram atualizados no dashboard.', tone: 'success' });
    } catch (error) {
      setMessage(error.message);
      showToast({ title: 'Falha ao importar', description: error.message, tone: 'error' });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-finance-muted">
            Escolha entre tema claro, escuro ou automático pelo sistema.
          </p>
          <ThemeToggle />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-2xl font-medium uppercase leading-none text-finance-muted">
            Categorias
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-finance-muted">
            Organize categorias usadas em lançamentos, dívidas e metas.
          </p>
        </div>
        <CategoriesPage />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Backup dos dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-finance-muted">
            Exporte ou importe um arquivo JSON com seus dados atuais do dashboard.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button className="w-full sm:w-auto" type="button" onClick={handleExport} disabled={isImporting}>
              Exportar JSON
            </Button>
            <Button
              className="w-full sm:w-auto"
              type="button"
              variant="secondary"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
            >
              {isImporting ? 'Importando...' : 'Importar JSON'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            accept="application/json,.json"
            className="hidden"
            type="file"
            onChange={handleImport}
          />

          {message ? (
            <div className="rounded-[10px] border border-finance-border bg-slate-50 px-4 py-3 text-sm font-medium text-finance-muted dark:bg-slate-950">
              {message}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados incluidos no backup</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-finance-muted">
            <li>meucontrole guarda os dados financeiros principais.</li>
            <li>meucontrole_metas guarda as metas financeiras.</li>
            <li>meucontrole_categorias guarda categorias personalizadas.</li>
            <li>meucontrole_recorrencias guarda automações mensais.</li>
            <li>meucontrole_orcamentos guarda limites mensais por categoria.</li>
            <li>meucontrole_nome guarda o nome do usuário.</li>
            <li>meucontrole_welcomed guarda o estado de boas-vindas.</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
