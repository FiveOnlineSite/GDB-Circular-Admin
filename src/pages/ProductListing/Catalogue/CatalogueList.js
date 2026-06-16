import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, X, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getProducts, deleteProduct, toggleProductStatus } from "../../../services/productListing";
import { usePermissionContext } from "../../../context/PermissionContext";

const CATEGORIES = ["LDPE", "HDPE", "PP"];
const API_URL = process.env.REACT_APP_API_URL || "";

export default function CatalogueList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProducts({ search, category, status: statusFilter, page: pagination.current_page, limit: pagination.per_page });
      if (res.success) {
        setRows(res.data?.data || []);
        if (res.data?.pagination) setPagination(res.data.pagination);
      }
    } catch { toast.error("Failed to load products"); setRows([]); }
    finally { setLoading(false); }
  }, [search, category, statusFilter, pagination.current_page, pagination.per_page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    try {
      const res = await deleteProduct(selectedItem.id);
      if (res.success) { toast.success("Product deleted"); fetchData(); }
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    finally { setDeleteModal(false); setSelectedItem(null); }
  };

  const handleToggle = async (row) => {
    try {
      const res = await toggleProductStatus(row.id);
      if (res.success) { toast.success(`Product marked as ${res.data.status}`); fetchData(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed to toggle status"); }
  };

  const clearFilters = () => { setSearch(""); setCategory(""); setStatusFilter(""); setPagination(p => ({ ...p, current_page: 1 })); };
  const hasFilters = search || category || statusFilter;

  const selectStyle = "border border-[#E6E6E6] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";

  const columns = [
    {
      field: "image_url", headerName: "Image", sortable: false,
      renderCell: ({ row }) => row.image_url
        ? <img src={`${API_URL}${row.image_url}`} alt={row.image_alt || row.product_name} className="h-10 w-14 object-cover rounded border" />
        : <div className="h-10 w-14 rounded border bg-slate-100 flex items-center justify-center text-xs text-slate-400">No img</div>,
    },
    { field: "product_name", headerName: "Product Name", sortable: true },
    {
      field: "product_category", headerName: "Category", sortable: true,
      renderCell: ({ row }) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#981B1F]/10 text-[#981B1F]">{row.product_category}</span>
      ),
    },
    {
      field: "short_description", headerName: "Description",
      renderCell: ({ row }) => <span className="text-xs text-slate-500 line-clamp-2 max-w-[180px]">{row.short_description || "—"}</span>,
    },
    {
      field: "show_on_homepage", headerName: "Homepage", sortable: false,
      renderCell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.show_on_homepage ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
          {row.show_on_homepage ? "Yes" : "No"}
        </span>
      ),
    },
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
      field: "actions", headerName: "Actions", sortable: false, sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-slate-200 text-slate-700"
            onClick={() => navigate(`/product-listing/catalogue/view/${row.id}`)}
            title="View Details"
          >
            <Eye className="h-4 w-4 text-[#981B1F]" />
          </Button>
          {hasPermission("product", "catalogue.update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/product-listing/catalogue/edit/${row.id}`)}
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {hasPermission("product", "catalogue.update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              title={row.status === "active" ? "Deactivate" : "Activate"}
              onClick={() => handleToggle(row)}
            >
              {row.status === "active" ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
            </Button>
          )}
          {hasPermission("product", "catalogue.delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => { setSelectedItem(row); setDeleteModal(true); }}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Catalogue</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage products by category — LDPE, HDPE, PP</p>
        </div>
        {hasPermission("product", "catalogue.create") && (
          <Button onClick={() => navigate("/product-listing/catalogue/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />Add Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search product name..." value={search} onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); }} />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); }} className={selectStyle}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); }} className={selectStyle}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
              <X className="w-3 h-3 mr-1" />Clear
            </Button>
          )}
        </div>
      </div>

      <ReusableDataTable
        columns={columns} rows={rows} loading={loading} pagination={pagination}
        handlePageChange={p => setPagination(prev => ({ ...prev, current_page: p }))}
        handlePerPageChange={pp => setPagination(prev => ({ ...prev, per_page: pp, current_page: 1 }))}
        emptyMessage="No products found. Click 'Add Product' to create one."
      />

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => { setDeleteModal(false); setSelectedItem(null); }}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedItem?.product_name}"?`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
