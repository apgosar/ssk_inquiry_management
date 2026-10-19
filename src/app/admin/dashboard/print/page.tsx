import { format, startOfMonth, subMonths } from "date-fns";
import { loadDashboardData } from "@/lib/dashboard";
import { KpiTile } from "@/components/KpiTile";
import { ChartCard } from "@/components/charts/ChartCard";
import { TrendChart } from "@/components/charts/TrendChart";
import { ConversionBarChart } from "@/components/charts/ConversionBarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { ReasonBarChart } from "@/components/charts/ReasonBarChart";
import { PrintButton } from "./PrintButton";

export default async function DashboardPrintPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    centreId?: string;
    coordinatorId?: string;
  }>;
}) {
  const params = await searchParams;
  const to = params.to ? new Date(params.to) : new Date();
  const from = params.from ? new Date(params.from) : startOfMonth(subMonths(new Date(), 5));

  const data = await loadDashboardData({
    from,
    to,
    centreId: params.centreId || undefined,
    coordinatorId: params.coordinatorId || undefined,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Sanskar Shakti — Lead Summary Report
          </h1>
          <p className="text-sm text-muted">
            {format(from, "d MMM yyyy")} – {format(to, "d MMM yyyy")}
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
        <KpiTile label="Total inquiries" value={String(data.total)} />
        <KpiTile label="Pending / On Hold" value={String(data.pendingCount)} tone="pending" />
        <KpiTile label="Enrolled" value={String(data.enrolledCount)} tone="enrolled" />
        <KpiTile label="Not joining" value={String(data.notJoiningCount)} tone="notJoining" />
        <KpiTile label="Conversion rate" value={`${data.conversionRate.toFixed(1)}%`} />
      </div>

      <div className="mb-6 break-inside-avoid">
        <ChartCard title="Leads converted — overall">
          <TrendChart data={data.monthlyTrend} />
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <div className="break-inside-avoid">
          <ChartCard title="Conversion by centre">
            <ConversionBarChart data={data.byCentre} height={Math.max(180, data.byCentre.length * 30)} />
          </ChartCard>
        </div>
        <div className="break-inside-avoid">
          <ChartCard title="Conversion by coordinator">
            <ConversionBarChart
              data={data.byCoordinator}
              height={Math.max(180, data.byCoordinator.length * 30)}
            />
          </ChartCard>
        </div>
      </div>

      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <div className="break-inside-avoid">
          <ChartCard title="Status distribution">
            <DonutChart data={data.statusDistribution} />
          </ChartCard>
        </div>
        <div className="break-inside-avoid">
          <ChartCard title="Reason for not joining">
            {data.reasonDistribution.length === 0 ? (
              <p className="flex h-40 items-center justify-center text-sm text-muted">
                No &ldquo;Not Joining&rdquo; leads in this period.
              </p>
            ) : (
              <ReasonBarChart data={data.reasonDistribution} />
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
