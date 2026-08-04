import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, Download, Eye, X, CalendarDays } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import EditPageDeleteAction from "../../../components/common/EditPageDeleteAction";
import { getInquiries, deleteInquiry } from "../../../services/globalContent/inquiries";

const PAGE_URLS = ["", "/", "/about-us", "/products", "/seller", "/facilities", "/teams", "/news-events"];

function formatDisplayDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}-${month}-${year}`;
}

function exportToCSV(data) {
  if (!data.length) return;
  const headers = ["ID", "First Name", "Last Name", "Email", "Mobile", "Company", "What Brings You Here", "Message", "Page URL", "Submitted At"];
  const rows = data.map((r) => [
    r.id,
    r.first_name,
    r.last_name,
    r.email,
    r.mobile || "",
    r.company || "",
    r.what_brings_you_here || "",
    (r.message || "").replace(/\n/g, " "),
    r.page_url || "",
    r.created_at ? new Date(r.created_at).toLocaleString() : "",
  ]);

  const csvContent = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function InquiryList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [search, setSearch] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getInquiries({
        search,
        pageUrl,
        startDate,
        endDate,
        page: pagination.current_page,
        limit: pagination.per_page,
      });
      if (res.success) {
        setRows(Array.isArray(res.data) ? res.data : []);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setRows([]);
      }
    } catch {
      toast.error("Failed to load inquiries");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, pageUrl, startDate, endDate, pagination.current_page, pagination.per_page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await getInquiries({ search, pageUrl, startDate, endDate, page: 1, limit: 9999 });
      if (res.success) exportToCSV(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Export failed");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setPageUrl("");
    setStartDate("");
    setEndDate("");
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      renderCell: ({ row }) => <span className="font-medium">{row.first_name} {row.last_name}</span>,
    },
    { field: "email", headerName: "Email" },
    { field: "mobile", headerName: "Mobile", renderCell: ({ row }) => row.mobile || "-" },
    {
      field: "company",
      headerName: "Company",
      renderCell: ({ row }) => row.company || "-",
    },
    {
      field: "what_brings_you_here",
      headerName: "What Brings You Here",
      renderCell: ({ row }) => row.what_brings_you_here || "-",
    },
    {
      field: "page_url",
      headerName: "Page URL",
      renderCell: ({ row }) => <span className="text-xs text-slate-500 truncate max-w-[120px] block">{row.page_url || "-"}</span>,
    },
    {
      field: "created_at",
      headerName: "Submitted",
      sortable: true,
      renderCell: ({ row }) => row.created_at ? <span className="text-xs">{new Date(row.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span> : "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-700" onClick={() => { setViewItem(row); setViewModal(true); }}>
            <Eye className="h-4 w-4 text-[#981B1F]" />
          </Button>
        </div>
      ),
    },
  ];

  const hasActiveFilters = search || pageUrl || startDate || endDate;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Inquiry Form Submissions</h1>
          <p className="text-sm text-gray-500  mt-1">View and manage all contact form submissions</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="border-[#981B1F] text-[#981B1F] hover:bg-[#981B1F]/5">
          <Download className="w-4 h-4 mr-2" />Export CSV
        </Button>
      </div>

      <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-4 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-10 border-[#E6E6E6] bg-white pl-10 pr-3 text-sm" placeholder="Search name, email, mobile..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, current_page: 1 })); }} />
          </div>
          <select value={pageUrl} onChange={(e) => { setPageUrl(e.target.value); setPagination((p) => ({ ...p, current_page: 1 })); }} className="w-full cursor-pointer border border-[#E6E6E6] rounded-lg bg-white p-2.5 text-sm focus:border-[#981B1F] focus:outline-none">
            <option value="">All Pages</option>
            {PAGE_URLS.filter(Boolean).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="relative">
            <div className="flex h-10 w-full items-center rounded-md border border-[#E6E6E6] bg-white px-3 pr-11 text-sm text-[#111111]">
              <span className={startDate ? "text-[#111111]" : "text-slate-500"}>{startDate ? formatDisplayDate(startDate) : "DD-MM-YYYY"}</span>
            </div>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPagination((p) => ({ ...p, current_page: 1 })); }} aria-label="Start Date" className="inquiry-date-input absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
            <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
          <div className="relative">
            <div className="flex h-10 w-full items-center rounded-md border border-[#E6E6E6] bg-white px-3 pr-11 text-sm text-[#111111]">
              <span className={endDate ? "text-[#111111]" : "text-slate-500"}>{endDate ? formatDisplayDate(endDate) : "DD-MM-YYYY"}</span>
            </div>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPagination((p) => ({ ...p, current_page: 1 })); }} aria-label="End Date" className="inquiry-date-input absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" />
            <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
            <X className="w-3 h-3 mr-1" />Clear Filters
          </Button>
        )}
      </div>

      <ReusableDataTable columns={columns} rows={rows} loading={loading} pagination={pagination} handlePageChange={(page) => setPagination((p) => ({ ...p, current_page: page }))} handlePerPageChange={(perPage) => setPagination((p) => ({ ...p, per_page: perPage, current_page: 1 }))} emptyMessage="No inquiries found." />

      {viewModal && viewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewModal(false)}>
          <div className="bg-white  rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Inquiry Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-6 space-y-3">
              {[
                ["First Name", viewItem.first_name],
                ["Last Name", viewItem.last_name],
                ["Email", viewItem.email],
                ["Mobile", viewItem.mobile || "-"],
                ["Company", viewItem.company || "-"],
                ["What Brings You Here", viewItem.what_brings_you_here || "-"],
                ["Page URL", viewItem.page_url || "-"],
                ["Submitted At", viewItem.created_at ? new Date(viewItem.created_at).toLocaleString() : "-"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-sm font-semibold text-slate-500 w-32 shrink-0">{label}</span>
                  <span className="text-sm text-slate-800 ">{value}</span>
                </div>
              ))}
              {viewItem.message && (
                <div>
                  <span className="text-sm font-semibold text-slate-500 block mb-1">Message</span>
                  <p className="text-sm text-slate-800  bg-slate-50  rounded-lg p-3 whitespace-pre-wrap">{viewItem.message}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t p-6">
              <EditPageDeleteAction
                id={viewItem.id}
                permission="global.inquiries.delete"
                onDelete={() => deleteInquiry(viewItem.id)}
                onDeleted={() => {
                  setViewModal(false);
                  setViewItem(null);
                  fetchData();
                }}
                title="Delete Inquiry"
                message="Are you sure you want to permanently delete this inquiry?"
                successMessage="Inquiry deleted"
              />
              <Button type="button" variant="outline" onClick={() => setViewModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
