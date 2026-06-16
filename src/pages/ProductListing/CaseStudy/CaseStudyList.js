import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, X, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getCaseStudies, deleteCaseStudy } from "../../../services/productListing";
import { usePermissionContext } from "../../../context/PermissionContext";

const API_URL = process.env.REACT_APP_API_URL || "";

export default function CaseStudyList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCaseStudies({ search, status: statusFilter, page: pagination.current_page, limit: pagination.per_page });
      if (res.success) {
        setRows(res.data?.data || []);
        if (res.data?.pagination) setPagination(res.data.pagination);
      }
    } catch { toast.error("Failed to load case studies"); setRows([]); }
    finally { setLoading(false); }
  }, [search, statusFilter, pagination.current_page, pagination.per_page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    try {
      const res = await deleteCaseStudy(selected.id);
      if (res.success) { toast.success("Case study deleted"); fetchData(); }
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    finally { setDeleteModal(false); setSelected(null); }
  };

  const selectStyle = "border border-[#E6E6E6] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";

  const columns = [
    {
      field: "image_url", headerName: "Image", sortable: false,
      renderCell: ({ row }) => row.image_url
        ? <img src={`${API_URL}${row.image_url}`} alt={row.image_alt || ""} className="h-10 w-16 object-cover rounded border" />
        : <div className="h-10 w-16 rounded border bg-slate-100 flex items-center justify-center text-xs text-slate-400">No img</div>,
    },
    { field: "title", headerName: "Title", sortable: true },
    { field: "short_description", headerName: "Short Description", renderCell: ({ row }) => <span className="text-xs text-slate-500 line-clamp-2 max-w-[200px]">{row.short_description || "—"}</span> },
    { field: "sequence", headerName: "Seq", sortable: true },
    {
      field: "status", headerName: "Status", sortable: false,
      renderCell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "created_at", headerName: "Created", sortable: true,
      renderCell: ({ row }) => <span className="text-xs">{row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "—"}</span>,
    },
    {
      field: "actions", headerName: "Actions", sortable: false, sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-slate-200 text-slate-700"
            onClick={() => navigate(`/product-listing/case-study/view/${row.id}`)}
            title="View Details"
          >
            <Eye className="h-4 w-4 text-[#981B1F]" />
          </Button>
          {hasPermission("product", "update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/product-listing/case-study/edit/${row.id}`)}
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {hasPermission("product", "delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => { setSelected(row); setDeleteModal(true); }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Case Studies</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage customer case studies and success stories</p>
        </div>
        {hasPermission("product", "create") && (
          <Button onClick={() => navigate("/product-listing/case-study/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />Add Case Study
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search title or description..." value={search} onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); }} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); }} className={selectStyle}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(search || statusFilter) && (
            <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setStatusFilter(""); setPagination(p => ({ ...p, current_page: 1 })); }}>
              <X className="w-3 h-3 mr-1" />Clear
            </Button>
          )}
        </div>
      </div>

      <ReusableDataTable
        columns={columns} rows={rows} loading={loading} pagination={pagination}
        handlePageChange={p => setPagination(prev => ({ ...prev, current_page: p }))}
        handlePerPageChange={pp => setPagination(prev => ({ ...prev, per_page: pp, current_page: 1 }))}
        emptyMessage="No case studies found. Click 'Add Case Study' to create one."
      />

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => { setDeleteModal(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Case Study"
        message={`Delete "${selected?.title}"?`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
