import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Search, Trash2, Download, Eye, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getInquiries, deleteInquiry } from "../../../services/globalContent/inquiries";
import { usePermissionContext } from "../../../context/PermissionContext";

const PAGE_URLS = ["", "/", "/about", "/contact", "/services", "/products", "/faq"];

function exportToCSV(data) {
  if (!data.length) return;
  const headers = ["ID", "First Name", "Last Name", "Email", "Mobile", "Company", "WhatsApp", "Message", "Page URL", "Submitted At"];
  const rows = data.map((r) => [
    r.id,
    r.first_name,
    r.last_name,
    r.email,
    r.mobile,
    r.company || "",
    r.whatsapp_number || "",
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
  const { hasPermission } = usePermissionContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [search, setSearch] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
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
      } else setRows([]);
    } catch {
      toast.error("Failed to load inquiries");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, pageUrl, startDate, endDate, pagination.current_page, pagination.per_page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteInquiry(selectedItem.id);
      if (res.success) { toast.success("Inquiry deleted"); fetchData(); }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteModal(false);
      setSelectedItem(null);
    }
  };

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
      renderCell: ({ row }) => (
        <span className="font-medium">{row.first_name} {row.last_name}</span>
      ),
    },
    { field: "email", headerName: "Email" },
    { field: "mobile", headerName: "Mobile" },
    {
      field: "company",
      headerName: "Company",
      renderCell: ({ row }) => row.company || "-",
    },
    {
      field: "page_url",
      headerName: "Page URL",
      renderCell: ({ row }) => (
        <span className="text-xs text-slate-500 truncate max-w-[120px] block">{row.page_url || "-"}</span>
      ),
    },
    {
      field: "created_at",
      headerName: "Submitted",
      sortable: true,
      renderCell: ({ row }) =>
        row.created_at ? (
          <span className="text-xs">{new Date(row.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
        ) : "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-slate-200 text-slate-700"
            onClick={() => { setViewItem(row); setViewModal(true); }}
          >
            <Eye className="h-4 w-4 text-[#981B1F]" />
          </Button>
          {hasPermission("globalContent", "inquiries.delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => { setSelectedItem(row); setDeleteModal(true); }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const hasActiveFilters = search || pageUrl || startDate || endDate;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inquiry Form Submissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage all contact form submissions</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="border-[#981B1F] text-[#981B1F] hover:bg-[#981B1F]/5">
          <Download className="w-4 h-4 mr-2" />Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-4 mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search name, email, mobile..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, current_page: 1 })); }} />
          </div>
          <select
            value={pageUrl}
            onChange={(e) => { setPageUrl(e.target.value); setPagination((p) => ({ ...p, current_page: 1 })); }}
            className="w-full border border-[#E6E6E6] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none"
          >
            <option value="">All Pages</option>
            {PAGE_URLS.filter(Boolean).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPagination((p) => ({ ...p, current_page: 1 })); }} placeholder="Start Date" />
          <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPagination((p) => ({ ...p, current_page: 1 })); }} placeholder="End Date" />
        </div>
        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
            <X className="w-3 h-3 mr-1" />Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <ReusableDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        pagination={pagination}
        handlePageChange={(page) => setPagination((p) => ({ ...p, current_page: page }))}
        handlePerPageChange={(perPage) => setPagination((p) => ({ ...p, per_page: perPage, current_page: 1 }))}
        emptyMessage="No inquiries found."
      />

      {/* View Modal */}
      {viewModal && viewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Inquiry Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-3">
              {[
                ["First Name", viewItem.first_name],
                ["Last Name", viewItem.last_name],
                ["Email", viewItem.email],
                ["Mobile", viewItem.mobile],
                ["Company", viewItem.company || "-"],
                ["WhatsApp", viewItem.whatsapp_number || "-"],
                ["Page URL", viewItem.page_url || "-"],
                ["Submitted At", viewItem.created_at ? new Date(viewItem.created_at).toLocaleString() : "-"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-sm font-semibold text-slate-500 w-32 shrink-0">{label}</span>
                  <span className="text-sm text-slate-800 dark:text-gray-200">{value}</span>
                </div>
              ))}
              {viewItem.message && (
                <div>
                  <span className="text-sm font-semibold text-slate-500 block mb-1">Message</span>
                  <p className="text-sm text-slate-800 dark:text-gray-200 bg-slate-50 dark:bg-gray-800 rounded-lg p-3 whitespace-pre-wrap">
                    {viewItem.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => { setDeleteModal(false); setSelectedItem(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Inquiry"
        message="Are you sure you want to permanently delete this inquiry?"
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
