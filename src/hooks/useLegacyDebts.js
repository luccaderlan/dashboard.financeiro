import { useDashboardContext } from '../context/DashboardContext.jsx';

export function useLegacyDebts() {
  return useDashboardContext().debts;
}
