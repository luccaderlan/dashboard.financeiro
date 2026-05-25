import { createContext, useContext, useEffect, useMemo } from 'react';
import { useFinancialBudgets, refreshFinancialBudgets } from '../hooks/useFinancialBudgets.js';
import { useFinancialCategories, refreshFinancialCategories } from '../hooks/useFinancialCategories.js';
import { useFinancialGoals, refreshFinancialGoals } from '../hooks/useFinancialGoals.js';
import { useFinancialRecurrences, refreshFinancialRecurrences } from '../hooks/useFinancialRecurrences.js';
import { useLegacyDashboardData, refreshLegacyDashboardData } from '../hooks/useLegacyDashboardData.js';
import { applyDueRecurrences } from '../services/financialRecurrences.js';
import { calculateGoalsSummary } from '../services/financialGoals.js';
import { getLegacyCashFlowItems } from '../services/legacyCashFlow.js';
import { getLegacyDebts } from '../services/legacyDebts.js';
import { getLegacyKpis } from '../services/legacyKpis.js';
import { getLegacyLoans } from '../services/legacyLoans.js';
import { getLegacyUpcomingBills } from '../services/legacyUpcomingBills.js';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const snapshot = useLegacyDashboardData();
  const budgets = useFinancialBudgets();
  const categories = useFinancialCategories();
  const goalItems = useFinancialGoals();
  const recurrences = useFinancialRecurrences();

  const cashFlow = useMemo(() => getLegacyCashFlowItems(snapshot.fluxo), [snapshot.fluxo]);
  const debts = useMemo(() => getLegacyDebts(snapshot.dividas), [snapshot.dividas]);
  const kpis = useMemo(() => getLegacyKpis(snapshot), [snapshot]);
  const loans = useMemo(() => getLegacyLoans(snapshot.emprestimos), [snapshot.emprestimos]);
  const upcomingBills = useMemo(() => getLegacyUpcomingBills(snapshot.dividas), [snapshot.dividas]);
  const goals = useMemo(
    () => ({
      items: goalItems,
      summary: calculateGoalsSummary(goalItems)
    }),
    [goalItems]
  );

  useEffect(() => {
    const result = applyDueRecurrences();

    if (result.generatedCount > 0) {
      refreshLegacyDashboardData();
      refreshFinancialRecurrences();
    }
  }, [recurrences]);

  const value = useMemo(
    () => ({
      snapshot,
      rawState: snapshot.rawState,
      fluxo: snapshot.fluxo,
      dividas: snapshot.dividas,
      emprestimos: snapshot.emprestimos,
      nome: snapshot.nome,
      welcomed: snapshot.welcomed,
      cashFlow,
      debts,
      kpis,
      loans,
      upcomingBills,
      budgets,
      categories,
      recurrences,
      goals,
      // Central React refresh point after a compatible legacy write.
      refreshLegacyDashboardData,
      refreshFinancialBudgets,
      refreshFinancialCategories,
      refreshFinancialGoals,
      refreshFinancialRecurrences
    }),
    [snapshot, cashFlow, debts, kpis, loans, upcomingBills, budgets, categories, recurrences, goals]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboardContext must be used inside DashboardProvider.');
  }

  return context;
}

export function useDashboardRefresh() {
  return useDashboardContext().refreshLegacyDashboardData;
}
