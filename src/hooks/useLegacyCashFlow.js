import { useDashboardContext } from '../context/DashboardContext.jsx';

export function useLegacyCashFlow() {
  return useDashboardContext().cashFlow;
}
