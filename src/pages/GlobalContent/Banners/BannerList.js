import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getBanners, deleteBanner } from "../../../services/globalContent/banners";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function BannerList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getBanners();
      if (res.success) setRows(Array.isArray(res.data) ? res.data : []);
      else setRows([]);
    } catch {
      toast.error("Failed to load banners");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteBanner(selectedItem.id);
      if (res.success) { toast.success("Banner deleted"); fetchData(); }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    { field: "page", headerName: "Page", sortable: true },
    { field: "title", headerName: "Title", sortable: true },
    {
      field: "file_url",
      headerName: "Preview",
      sortable: false,
      renderCell: ({ row }) => {
        if (!row.file_url) return <span className="text-slate-400 text-xs">No file</span>;
        const src = row.file_url.startsWith("data:") ? row.file_url : `${process.env.REACT_APP_API_URL || ""}${row.file_url}`;
        const isVideo = row.file_url.includes(".mp4") || row.file_url.includes("video");
        return isVideo ? (
          <video src={src} className="h-10 w-20 object-cover rounded" muted />
        ) : (
          <img src={src} alt={row.alt_text || row.title} className="h-10 w-20 object-cover rounded border" />
        );
      },
    },
    {
      field: "cta_button_name",
      headerName: "CTA",
      renderCell: ({ row }) => row.cta_button_name || "-",
    },
    { field: "sequence", headerName: "Seq", sortable: true },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
          {hasPermission("globalContent", "update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/global-content/banners/edit/${row.id}`)}
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {hasPermission("globalContent", "delete") && (
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banner Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage page banners with images, videos, and CTA buttons</p>
        </div>
        {hasPermission("globalContent", "create") && (
          <Button onClick={() => navigate("/global-content/banners/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />Add Banner
          </Button>
        )}
      </div>
      <ReusableDataTable columns={columns} rows={rows} loading={loading} emptyMessage="No banners found. Click 'Add Banner' to create one." />
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => { setDeleteModal(false); setSelectedItem(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Banner"
        message={`Are you sure you want to delete "${selectedItem?.title}"?`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
