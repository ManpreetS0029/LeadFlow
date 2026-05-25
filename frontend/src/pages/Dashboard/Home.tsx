import { useEffect, useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  GroupIcon,
  BoxCubeIcon,
  CheckCircleIcon,
  ErrorIcon,
  CalenderIcon,
  TimeIcon,
  DollarLineIcon,
  EyeIcon,
} from "../../icons";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/dashboard/stats`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiUrl, token]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ClipLoader size={35} color="#465fff" />
      </div>
    );
  }

  // Parse status chart data
  const statusLabels =
    stats?.charts?.status?.map(
      (item: any) => item.status.charAt(0).toUpperCase() + item.status.slice(1)
    ) || [];
  const statusSeries =
    stats?.charts?.status?.map((item: any) => Number(item.count)) || [];

  const statusChartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#3B82F6", "#F59E0B", "#10B981", "#6366F1", "#06B6D4", "#EF4444"],
    labels: statusLabels,
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Leads",
              formatter: () => stats?.metrics?.total_leads?.toString() || "0",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      theme: "light",
    },
  };

  // Parse source chart data
  const sourceLabels =
    stats?.charts?.source?.map((item: any) =>
      item.source
        ? item.source.charAt(0).toUpperCase() + item.source.slice(1)
        : "Unknown"
    ) || [];
  const sourceSeriesData =
    stats?.charts?.source?.map((item: any) => Number(item.count)) || [];

  const sourceChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: false,
      },
    },
    colors: ["#465fff"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: sourceLabels,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Leads Count",
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  const sourceSeries = [
    {
      name: "Leads",
      data: sourceSeriesData,
    },
  ];

  const metricsData = stats?.metrics || {
    total_leads: 0,
    new_leads: 0,
    converted_leads: 0,
    lost_leads: 0,
    today_follow_ups: 0,
    overdue_follow_ups: 0,
    pipeline_value: 0,
  };

  const cards = [
    {
      label: "Total Leads",
      value: metricsData.total_leads,
      icon: GroupIcon,
      bg: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "New Leads",
      value: metricsData.new_leads,
      icon: BoxCubeIcon,
      bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: "Converted Leads",
      value: metricsData.converted_leads,
      icon: CheckCircleIcon,
      bg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    },
    {
      label: "Lost Leads",
      value: metricsData.lost_leads,
      icon: ErrorIcon,
      bg: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    },
    {
      label: "Today Follow-ups",
      value: metricsData.today_follow_ups,
      icon: CalenderIcon,
      bg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
    {
      label: "Overdue Follow-ups",
      value: metricsData.overdue_follow_ups,
      icon: TimeIcon,
      bg: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      label: "Pipeline Value",
      value: `$${Number(metricsData.pipeline_value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarLineIcon,
      bg: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
  ];

  return (
    <>
      <PageMeta
        title="Dashboard | LeadFlow"
        description="Leads Management System Dashboard"
      />
      <PageBreadcrumb pageTitle="Dashboard" />

      {/* Row 1: Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl ${card.bg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-xl font-bold text-gray-850 dark:text-white/90">
                  {card.value}
                </h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left: Lead Status Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Lead Status Chart
          </h3>
          <div className="flex items-center justify-center min-h-[320px]">
            {statusSeries.length > 0 ? (
              <Chart
                options={statusChartOptions}
                series={statusSeries}
                type="donut"
                width="100%"
                height={320}
              />
            ) : (
              <div className="text-gray-500 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Right: Source Wise Leads */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Source Wise Leads
          </h3>
          <div className="min-h-[320px]">
            {sourceSeriesData.length > 0 ? (
              <Chart
                options={sourceChartOptions}
                series={sourceSeries}
                type="bar"
                width="100%"
                height={320}
              />
            ) : (
              <div className="flex items-center justify-center h-[320px] text-gray-500 text-sm">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Today's Follow-ups Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Today's Follow-ups
          </h3>
          {stats?.today_follow_ups?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Company
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Phone
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Follow-up Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      View
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {stats.today_follow_ups.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="px-4 py-3 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {lead.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {lead.company || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {lead.phone || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {lead.follow_up_date}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm">
                        <button
                          onClick={() => navigate(`/view-lead/${lead.id}`)}
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm">
              <CalenderIcon className="w-10 h-10 mb-2 text-gray-400" />
              No scheduled follow-ups for today.
            </div>
          )}
        </div>

        {/* Overdue Follow-ups Table (Optional/Additional) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Overdue Follow-ups
          </h3>
          {stats?.overdue_follow_ups?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Company
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Phone
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Follow-up Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      View
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {stats.overdue_follow_ups.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="px-4 py-3 text-start text-theme-sm font-medium text-gray-805 dark:text-white/90">
                        {lead.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {lead.company || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {lead.phone || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-rose-500 font-semibold">
                        {lead.follow_up_date}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm">
                        <button
                          onClick={() => navigate(`/view-lead/${lead.id}`)}
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm">
              <TimeIcon className="w-10 h-10 mb-2 text-gray-400" />
              No overdue follow-ups.
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Leads */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Recent Leads
          </h3>
          {stats?.recent_leads?.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Company
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Source
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Assigned To
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-4 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      View
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {stats.recent_leads.map((lead: any) => (
                    <TableRow key={lead.id}>
                      <TableCell className="px-4 py-3 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {lead.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {lead.company || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm">
                        <Badge
                          size="sm"
                          color={
                            lead.status === "new"
                              ? "success"
                              : lead.status === "contacted" ||
                                lead.status === "qualified"
                                ? "warning"
                                : lead.status === "converted"
                                  ? "info"
                                  : "error"
                          }
                        >
                          {lead.status.charAt(0).toUpperCase() +
                            lead.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {lead.source || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {userName || "Me"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm">
                        <button
                          onClick={() => navigate(`/view-lead/${lead.id}`)}
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm">
              No recent leads.
            </div>
          )}
        </div>

        {/* Recent Activities Feed */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Recent Activities
          </h3>
          {stats?.recent_activities?.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8 max-h-[350px] overflow-y-auto pr-1">
                {stats.recent_activities.map((activity: any, idx: number) => {
                  const isLast = idx === stats.recent_activities.length - 1;
                  let iconColor = "bg-blue-500";
                  let iconLabel = "📝";
                  if (activity.type === "lead_added") {
                    iconColor = "bg-green-500";
                    iconLabel = "➕";
                  } else if (activity.type === "lead_deleted") {
                    iconColor = "bg-red-500";
                    iconLabel = "🗑️";
                  } else if (activity.type === "status_changed") {
                    iconColor = "bg-purple-500";
                    iconLabel = "🔄";
                  } else if (activity.type === "note_added") {
                    iconColor = "bg-amber-500";
                    iconLabel = "💬";
                  }

                  return (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {!isLast && (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-white ring-8 ring-white dark:ring-gray-900 ${iconColor}`}
                            >
                              <span className="text-xs">{iconLabel}</span>
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {activity.description}{" "}
                                {activity.lead && (
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    for {activity.lead.name}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Logged by: {activity.user?.name || "System"}
                              </p>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {new Date(activity.created_at).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}{" "}
                              {new Date(activity.created_at).toLocaleDateString(
                                [],
                                { month: "short", day: "numeric" }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm">
              No recent activities.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
