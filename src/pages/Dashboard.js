import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Building2,
  Inbox,
  MessageSquare,
  Newspaper,
  Package,
  RefreshCw,
  UserCog,
  UsersRound,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { usePermissionContext } from "../context/PermissionContext";
import { getDashboardSummary } from "../services/dashboard";

const CARD_DEFINITIONS = [
  {
    key: "facilities",
    label: "Facilities",
    path: "/facilities/listing",
    permission: ["facilities", "view"],
    Icon: Building2,
    iconClass: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
    detail: (item) => `${item.active} active · ${item.listed} on facility page`,
  },
  {
    key: "products",
    label: "Products",
    path: "/product-listing/catalogue",
    permission: ["product", "catalogue.view"],
    Icon: Package,
    iconClass: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    detail: (item) => `${item.active} active · ${item.homepage} on homepage`,
  },
  {
    key: "teamMembers",
    label: "Team Members",
    path: "/team/members",
    permission: ["team", "members.view"],
    Icon: UsersRound,
    iconClass: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
    detail: (item) => `${item.active} active · ${item.homepage} on homepage`,
  },
  {
    key: "news",
    label: "News & Updates",
    path: "/news-updates",
    permission: ["news", "content.view"],
    Icon: Newspaper,
    iconClass: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    detail: (item) => `${item.published} published · ${item.featured} featured`,
  },
  {
    key: "caseStudies",
    label: "Case Studies",
    path: "/product-listing/case-study",
    permission: ["product", "casestudy.view"],
    Icon: BookOpen,
    iconClass: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100",
    detail: (item) => `${item.active} active`,
  },
  {
    key: "inquiries",
    label: "Contact Inquiries",
    path: "/global-content/inquiries",
    permission: ["globalContent", "inquiries.view"],
    Icon: MessageSquare,
    iconClass: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
    detail: (item) => `${item.recent} received in the last 30 days`,
  },
  {
    key: "supplierInquiries",
    label: "Supplier Inquiries",
    path: "/sellers/inquiries",
    permission: ["sellers", "inquiry.view"],
    Icon: Inbox,
    iconClass: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
    detail: (item) => `${item.recent} received in the last 30 days`,
  },
  {
    key: "users",
    label: "Admin Users",
    path: "/users",
    permission: ["users", "view"],
    Icon: UserCog,
    iconClass: "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
    detail: (item) => `${item.active} active`,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasPermission, loading: permissionsLoading } = usePermissionContext();
  const {
    data: summary,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
    select: (response) => response.data,
    staleTime: 30000,
  });

  const visibleCards = CARD_DEFINITIONS.filter(({ permission }) =>
    hasPermission(permission[0], permission[1]),
  );
  const loading = isPending || permissionsLoading;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live overview of the content managed across GDB Circular.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isFetching}
          onClick={() => refetch()}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
          Dashboard data could not be loaded. Please refresh and try again.
        </div>
      ) : null}

      {!isError && !loading && visibleCards.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          No dashboard metrics are available for your current permissions.
        </div>
      ) : null}

      {!isError && (loading || visibleCards.length > 0) ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {(loading ? CARD_DEFINITIONS.slice(0, 8) : visibleCards).map(
            ({ key, label, path, Icon, iconClass, detail }) => {
              const item = summary?.[key];

              return (
                <button
                  key={key}
                  type="button"
                  disabled={loading}
                  onClick={() => navigate(path)}
                  className="group min-h-[148px] rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {label}
                      </p>
                      {loading ? (
                        <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
                      ) : (
                        <p className="mt-2 text-3xl font-black text-slate-800">
                          {item?.total ?? 0}
                        </p>
                      )}
                    </div>
                    <span className={`rounded-2xl p-4 transition-colors ${iconClass}`}>
                      <Icon size={22} />
                    </span>
                  </div>
                  {loading ? (
                    <div className="mt-4 h-4 w-40 animate-pulse rounded bg-slate-100" />
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">{detail(item || {})}</p>
                  )}
                </button>
              );
            },
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
