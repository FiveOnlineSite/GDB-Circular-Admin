import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getSeoList, deleteSeo } from "../../../services/globalContent/seo";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function SeoList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();

  const [seoItems, setSeoItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSeoList({
        page: pagination.current_page,
        limit: pagination.per_page,
      });
      if (res.success) {
        setSeoItems(Array.isArray(res.data) ? res.data : []);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setSeoItems([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load SEO entries");
      setSeoItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteSeo(selectedItem.id);
      if (res.success) {
        toast.success("SEO entry deleted successfully");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete SEO entry");
    } finally {
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      field: "page",
      headerName: "Page",
      sortable: true,
    },
    {
      field: "meta_title",
      headerName: "Meta Title",
      sortable: true,
      renderCell: ({ row }) => row.meta_title || "-",
    },
    {
      field: "canonical_url",
      headerName: "Canonical URL",
      renderCell: ({ row }) => row.canonical_url || "-",
    },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
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
          {hasPermission("globalContent", "seo.update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/global-content/seo/edit/${row.id}`)}
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {hasPermission("globalContent", "seo.delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => {
                setSelectedItem(row);
                setDeleteModalOpen(true);
              }}
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            SEO &amp; AIEO Content
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage meta tags and SEO settings for each page
          </p>
        </div>
        {hasPermission("globalContent", "seo.create") && (
          <Button onClick={() => navigate("/global-content/seo/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        )}
      </div>

      {/* Table */}
      <ReusableDataTable
        columns={columns}
        rows={seoItems}
        loading={loading}
        pagination={pagination}
        handlePageChange={(page) =>
          setPagination((prev) => ({ ...prev, current_page: page }))
        }
        handlePerPageChange={(perPage) =>
          setPagination((prev) => ({
            ...prev,
            per_page: perPage,
            current_page: 1,
          }))
        }
        emptyMessage="No SEO entries found. Click 'Add New' to create one."
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete SEO Entry"
        message={`Are you sure you want to delete the SEO entry for "${selectedItem?.page}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
