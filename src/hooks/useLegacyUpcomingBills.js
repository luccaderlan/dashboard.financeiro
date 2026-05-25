import { useDashboardContext } from '../context/DashboardContext.jsx';

export function useLegacyUpcomingBills() {
  return useDashboardContext().upcomingBills;
}
