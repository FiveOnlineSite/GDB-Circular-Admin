import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Eye, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import { getFeedstocks, toggleFeedstockStatus } from "../../../services/sellers/feedstockService";
import { usePermissionContext } from "../../../context/PermissionContext";

const CATEGORIES = ["LDPE", "HDPE", "PP", "Other"];
const STATUS_OPTIONS = ["active", "inactive"];

const tabButtonClass = (active) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-[#981B1F] text-white shadow-sm"
      : "border border-slate-200 bg-white text-slate-600 hover:border-[#981B1F]/30 hover:bg-[#981B1F]/5 hover:text-[#981B1F]"
  }`;

export default function FeedstockList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");


  const fetchFeedstocks = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const nextCategory = params.category !== undefined ? params.category : selectedCategory;
      const isCategorySequenceView = Boolean(nextCategory);
      const res = await getFeedstocks({
        page: isCategorySequenceView ? 1 : params.page || pagination.current_page,
        limit: isCategorySequenceView ? 1000 : params.limit || pagination.per_page,
        material_name: params.search !== undefined ? params.search : search,
        feedstock_category: nextCategory,
        status: params.status !== undefined ? params.status : selectedStatus,
      });

      if (res.success) {
        setRows(res.data || []);
        if (res.pagination) {
          setPagination((prev) =>
            isCategorySequenceView
              ? { ...prev, current_page: 1, total: res.pagination.total, last_page: 1 }
              : res.pagination,
          );
        }
      } else {
        setRows([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load feedstock materials");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, search, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchFeedstocks();
  }, [fetchFeedstocks]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleCategoryTabChange = (cat) => {
    setSelectedCategory(cat);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleToggleStatus = async (row) => {
    try {
      const res = await toggleFeedstockStatus(row.id);
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        fetchFeedstocks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const columns = [
    {
      field: "image_url",
      headerName: "Image",
      sortable: false,
      renderCell: ({ row }) => {
        const fileSrc = row.image_url
          ? row.image_url.startsWith("http")
            ? row.image_url
            : `${process.env.REACT_APP_API_URL || ""}${row.image_url}`
          : "";

        if (!fileSrc) return <span className="text-slate-400">—</span>;

        return (
          <img
            src={fileSrc}
            alt={row.image_alt || row.material_name}
            className="w-16 h-10 object-cover rounded border border-slate-200 bg-white"
          />
        );
      },
    },
    { field: "material_name", headerName: "Material Name", sortable: true },
    {
      field: "feedstock_category",
      headerName: "Category",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800   border border-slate-200 ">
          {row.feedstock_category}
        </span>
      ),
    },
    {
      field: "short_description",
      headerName: "Description",
      sortable: false,
      renderCell: ({ row }) => (
        <span className="truncate max-w-[220px] block text-slate-500">
          {row.short_description || "—"}
        </span>
      ),
    },
    { field: "sequence", headerName: "Sequence", sortable: true },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: ({ row }) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.status === "active"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission("sellers", "feedstock.view") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/sellers/feedstock-catalogue/view/${row.id}`)}
              title="View Details"
            >
              <Eye className="h-4 w-4 text-[#981B1F]" />
            </Button>
          )}
          {hasPermission("sellers", "feedstock.update") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700"
                onClick={() => navigate(`/sellers/feedstock-catalogue/edit/${row.id}`)}
                title="Edit"
              >
                <Edit2 className="h-4 w-4 text-[#C3662D]" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-[#C3662D] hover:bg-[#C3662D]/10 h-8"
                onClick={() => handleToggleStatus(row)}
              >
                {row.status === "active" ? "Deactivate" : "Activate"}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const tableColumns = selectedCategory
    ? columns
    : columns.filter((column) => column.field !== "sequence");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Feedstock Catalogue</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage polymer feedstock categories, descriptions, and images</p>
        </div>

        {hasPermission("sellers", "feedstock.create") && (
          <Button
            onClick={() => navigate("/sellers/feedstock-catalogue/create")}
            className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Feedstock Material
          </Button>
        )}
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-fit">
          <div className="relative w-full md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by material name..."
              className="h-10 border-[#E6E6E6] bg-white pl-10 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={handleStatusFilterChange}
            className="border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white text-slate-700 min-w-[130px] cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
          <button type="button" onClick={() => handleCategoryTabChange("")} className={tabButtonClass(!selectedCategory)}>
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => handleCategoryTabChange(cat)} className={tabButtonClass(selectedCategory === cat)}>
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs font-medium text-slate-500">
            {selectedCategory ? "Drag rows to change this category sequence." : "Select a category tab to reorder sequence."}
          </span>
        </div>
        <ReusableDataTable
          columns={tableColumns}
          rows={rows}
          loading={loading}
          pagination={pagination}
          handlePageChange={(p) => setPagination((prev) => ({ ...prev, current_page: p }))}
          handlePerPageChange={(pp) =>
            setPagination((prev) => ({ ...prev, per_page: pp, current_page: 1 }))
          }
          sequenceReorderScope="seller_feedstock"
          disableSequenceReorder={!selectedCategory}
          emptyMessage="No feedstock catalogue items found."
        />
      </div>

    </div>
  );
}
