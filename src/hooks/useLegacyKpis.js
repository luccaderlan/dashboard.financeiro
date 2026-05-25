import { useDashboardContext } from '../context/DashboardContext.jsx';

export function useLegacyKpis() {
  return useDashboardContext().kpis;
}
