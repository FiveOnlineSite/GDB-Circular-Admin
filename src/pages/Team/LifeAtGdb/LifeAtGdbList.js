import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Video, Image as ImageIcon, Eye, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getLifeItems, deleteLifeItem, toggleLifeItemStatus } from "../../../services/team/lifeAtGdbService";
import { usePermissionContext } from "../../../context/PermissionContext";

const MEDIA_TYPES = ["image", "video"];
const STATUS_OPTIONS = ["active", "inactive"];

export default function LifeAtGdbList() {
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
  const [selectedMediaType, setSelectedMediaType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchLifeGallery = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const res = await getLifeItems({
        page: params.page || pagination.current_page,
        limit: params.limit || pagination.per_page,
        search: params.search !== undefined ? params.search : search,
        media_type: params.media_type !== undefined ? params.media_type : selectedMediaType,
        status: params.status !== undefined ? params.status : selectedStatus,
      });

      if (res.success) {
        setRows(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setRows([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load gallery items");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, search, selectedMediaType, selectedStatus]);

  useEffect(() => {
    fetchLifeGallery();
  }, [fetchLifeGallery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleMediaTypeFilterChange = (e) => {
    const type = e.target.value;
    setSelectedMediaType(type);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    setPagination((p) => ({ ...p, current_page: 1 }));
  };

  const handleToggleStatus = async (row) => {
    try {
      const res = await toggleLifeItemStatus(row.id);
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        fetchLifeGallery();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteLifeItem(selectedItem.id);
      if (res.success) {
        toast.success("Gallery item deleted successfully");
        fetchLifeGallery();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      field: "file_url",
      headerName: "Preview",
      sortable: false,
      renderCell: ({ row }) => {
        const fileSrc = row.file_url
          ? row.file_url.startsWith("http")
            ? row.file_url
            : `${process.env.REACT_APP_API_URL || ""}${row.file_url}`
          : "";

        if (!fileSrc) return <span className="text-slate-400">—</span>;

        if (row.media_type === "video") {
          return (
            <video
              src={fileSrc}
              className="w-16 h-10 object-cover rounded border bg-black"
              muted
            />
          );
        }

        return (
          <img
            src={fileSrc}
            alt={row.alt_text || row.section_title}
            className="w-16 h-10 object-cover rounded border border-slate-200 bg-white"
          />
        );
      },
    },
    { field: "section_title", headerName: "Title", sortable: true },
    {
      field: "description",
      headerName: "Description",
      sortable: false,
      renderCell: ({ row }) => (
        <span className="truncate max-w-[200px] block">
          {row.description || "—"}
        </span>
      ),
    },
    {
      field: "media_type",
      headerName: "Media Type",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="flex items-center gap-1.5 capitalize font-medium text-slate-700 text-sm">
          {row.media_type === "video" ? (
            <Video size={16} className="text-rose-500" />
          ) : (
            <ImageIcon size={16} className="text-sky-500" />
          )}
          {row.media_type}
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
          {hasPermission("team", "life.view") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/team/life-at-gdb/view/${row.id}`)}
              title="View Details"
            >
              <Eye className="h-4 w-4 text-[#981B1F]" />
            </Button>
          )}
          {hasPermission("team", "life.update") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700"
                onClick={() => navigate(`/team/life-at-gdb/edit/${row.id}`)}
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
          {hasPermission("team", "life.delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => handleDeleteClick(row)}
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Life at GDB Circular</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage gallery images, videos, and titles representing life at GDB Circular</p>
        </div>

        {hasPermission("team", "life.create") && (
          <Button
            onClick={() => navigate("/team/life-at-gdb/create")}
            className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Gallery Item
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
              placeholder="Search by title..."
              className="h-10 border-[#E6E6E6] bg-white pl-10 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Media Type Filter */}
          <select
            value={selectedMediaType}
            onChange={handleMediaTypeFilterChange}
            className="border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white text-slate-700 min-w-[150px] cursor-pointer"
          >
            <option value="">All Media Types</option>
            {MEDIA_TYPES.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}s
              </option>
            ))}
          </select>

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
        <ReusableDataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pagination={pagination}
          handlePageChange={(p) => setPagination((prev) => ({ ...prev, current_page: p }))}
          handlePerPageChange={(pp) =>
            setPagination((prev) => ({ ...prev, per_page: pp, current_page: 1 }))
          }
          emptyMessage="No gallery items found."
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Gallery Item"
        message={`Are you sure you want to delete the gallery item "${selectedItem?.section_title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
