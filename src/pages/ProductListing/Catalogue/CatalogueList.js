import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, ToggleLeft, ToggleRight, Search, X, Eye, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import { getProducts, toggleProductHomepage, toggleProductStatus } from "../../../services/productListing";
import { usePermissionContext } from "../../../context/PermissionContext";

const CATEGORIES = ["LDPE", "HDPE", "PP"];
const API_URL = process.env.REACT_APP_API_URL || "";

const tabButtonClass = (active) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-[#981B1F] text-white shadow-sm"
      : "border border-slate-200 bg-white text-slate-600 hover:border-[#981B1F]/30 hover:bg-[#981B1F]/5 hover:text-[#981B1F]"
  }`;

export default function CatalogueList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 10, total: 0, last_page: 1 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [homepageToggleLoadingId, setHomepageToggleLoadingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const isCategorySequenceView = Boolean(category);
      const res = await getProducts({
        search,
        category,
        status: statusFilter,
        page: isCategorySequenceView ? 1 : pagination.current_page,
        limit: isCategorySequenceView ? 1000 : pagination.per_page,
      });
      if (res.success) {
        setRows(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination((prev) =>
            isCategorySequenceView
              ? { ...prev, current_page: 1, total: res.data.pagination.total, last_page: 1 }
              : res.data.pagination,
          );
        }
      }
    } catch { toast.error("Failed to load products"); setRows([]); }
    finally { setLoading(false); }
  }, [search, category, statusFilter, pagination.current_page, pagination.per_page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (row) => {
    try {
      const res = await toggleProductStatus(row.id);
      if (res.success) { toast.success(`Product marked as ${res.data.status}`); fetchData(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed to toggle status"); }
  };

  const handleHomepageToggle = async (row) => {
    try {
      setHomepageToggleLoadingId(row.id);
      const res = await toggleProductHomepage(row.id);
      if (res.success) {
        toast.success(res.message || "Homepage display updated");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Only 3 products can be shown on homepage.");
    } finally {
      setHomepageToggleLoadingId(null);
    }
  };

  const clearFilters = () => { setSearch(""); setCategory(""); setStatusFilter(""); setPagination(p => ({ ...p, current_page: 1 })); };
  const hasFilters = search || category || statusFilter;
  const canReorderSelectedCategory = Boolean(category);

  const handleCategoryTabChange = (nextCategory) => {
    setCategory(nextCategory);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const selectStyle = "border border-[#E6E6E6] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none bg-white   ";

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
    { field: "grade_no", headerName: "Grade No.", sortable: true, renderCell: ({ row }) => row.grade_no || "—" },
    { field: "color", headerName: "Color", sortable: true, renderCell: ({ row }) => row.color || "—" },
    {
      field: "short_description", headerName: "Description",
      renderCell: ({ row }) => <span className="text-xs text-slate-500 line-clamp-2 max-w-[180px]">{row.short_description || "—"}</span>,
    },
    {
      field: "fda_lno", headerName: "FDA LNO", sortable: false,
      renderCell: ({ row }) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${Number(row.fda_lno) === 1 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{Number(row.fda_lno) === 1 ? "Yes" : "No"}</span>,
    },
    {
      field: "pcr_content_percent", headerName: "PCR %",
      renderCell: ({ row }) => row.pcr_content_percent ?? "—",
    },
    {
      field: "show_on_homepage", headerName: "Homepage", sortable: false,
      renderCell: ({ row }) => {
        const isShown = Number(row.show_on_homepage) === 1;
        const isLoading = homepageToggleLoadingId === row.id;

        if (!hasPermission("product", "catalogue.update")) {
          return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isShown ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
              {isShown ? "Yes" : "No"}
            </span>
          );
        }

        return (
          <button
            type="button"
            onClick={() => handleHomepageToggle(row)}
            disabled={isLoading}
            className={`inline-flex min-w-[48px] items-center justify-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition disabled:cursor-wait disabled:opacity-70 ${isShown ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            title={isLoading ? "Updating homepage display" : isShown ? "Remove from homepage" : "Show on homepage"}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isShown ? (
              <ToggleRight className="h-3.5 w-3.5" />
            ) : (
              <ToggleLeft className="h-3.5 w-3.5" />
            )}
            {isLoading ? "..." : isShown ? "Yes" : "No"}
          </button>
        );
      },
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
        </div>
      ),
    },
  ];

  const tableColumns = category
    ? columns
    : columns.filter((column) => column.field !== "sequence");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Product Catalogue</h1>
          <p className="text-sm text-gray-500  mt-0.5">Manage products by category — LDPE, HDPE, PP</p>
        </div>
        {hasPermission("product", "catalogue.create") && (
          <Button onClick={() => navigate("/product-listing/catalogue/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />Add Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-10 border-[#E6E6E6] bg-white pl-10 pr-3 text-sm"
              placeholder="Search product name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, current_page: 1 })); }}
            />
          </div>
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

      <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => handleCategoryTabChange("")} className={tabButtonClass(!category)}>
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => handleCategoryTabChange(cat)} className={tabButtonClass(category === cat)}>
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs font-medium text-slate-500">
            {canReorderSelectedCategory ? "Drag rows to change this category sequence." : "Select a category tab to reorder sequence."}
          </span>
        </div>
      </div>

      <ReusableDataTable
        columns={tableColumns} rows={rows} loading={loading} pagination={pagination}
        handlePageChange={p => setPagination(prev => ({ ...prev, current_page: p }))}
        handlePerPageChange={pp => setPagination(prev => ({ ...prev, per_page: pp, current_page: 1 }))}
        sequenceReorderScope="product_catalogue"
        disableSequenceReorder={!canReorderSelectedCategory}
        emptyMessage="No products found. Click 'Add Product' to create one."
      />

    </div>
  );
}
