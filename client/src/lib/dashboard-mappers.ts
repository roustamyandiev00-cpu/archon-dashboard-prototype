import type { DashboardFactuur, DashboardProject, DashboardTransactie } from "@/hooks/useDashboardData";

export interface DashboardKpiSummary {
  totalRevenue: number;
  outstandingAmount: number;
  outstandingCount: number;
  costTotal: number;
  clientCount: number;
}

export const calculateDashboardKpis = (
  facturen: DashboardFactuur[],
  transacties: DashboardTransactie[],
  clientCount: number
): DashboardKpiSummary => {
  const paidRevenue = facturen
    .filter((factuur) => factuur.status === "betaald")
    .reduce((sum, factuur) => sum + (Number(factuur.bedrag) || 0), 0);

  const transactionRevenue = transacties
    .filter((transactie) => transactie.type === "inkomst")
    .reduce((sum, transactie) => sum + (Number(transactie.bedrag) || 0), 0);

  const totalRevenue = paidRevenue > 0 ? paidRevenue : transactionRevenue;

  const outstandingAmount = facturen
    .filter((factuur) => factuur.status !== "betaald")
    .reduce((sum, factuur) => sum + (Number(factuur.bedrag) || 0), 0);

  const outstandingCount = facturen.filter((factuur) => factuur.status !== "betaald").length;

  const costTotal = transacties
    .filter((transactie) => transactie.type === "uitgave")
    .reduce((sum, transactie) => sum + (Number(transactie.bedrag) || 0), 0);

  return {
    totalRevenue,
    outstandingAmount,
    outstandingCount,
    costTotal,
    clientCount,
  };
};

export const hasData = (value: number) => Number.isFinite(value) && value > 0;
