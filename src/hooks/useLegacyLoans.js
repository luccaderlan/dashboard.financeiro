import { useDashboardContext } from '../context/DashboardContext.jsx';

export function useLegacyLoans() {
  return useDashboardContext().loans;
}
