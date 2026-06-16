import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, BarChart3 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getStats, deleteStat } from "../../../services/homepage";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function StatsList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getStats();
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load stats");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteStat(selectedItem.id);
      if (res.success) { toast.success("Stat deleted"); fetchData(); }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      field: "icon_url",
      headerName: "Icon",
      sortable: false,
      renderCell: ({ row }) =>
        row.icon_url ? (
          <img
            src={
              row.icon_url.startsWith("data:")
                ? row.icon_url
                : (row.icon_url.startsWith("http")
                    ? row.icon_url
                    : `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${row.icon_url}`)
            }
            alt={row.icon_alt || row.title}
            className="h-9 w-9 object-contain rounded border p-1"
          />
        ) : <span className="text-slate-400 text-xs">—</span>,
    },
    { field: "title", headerName: "Title", sortable: true },
    { field: "value_text", headerName: "Value / Number", sortable: true },
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
          {hasPermission("homepage", "update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/homepage-management/stats/edit/${row.id}`)}
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {hasPermission("homepage", "delete") && (
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#981B1F" }}>
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stats / Value Strip</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage homepage statistics and value highlights</p>
          </div>
        </div>
        {hasPermission("homepage", "create") && (
          <Button onClick={() => navigate("/homepage-management/stats/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />Add Stat
          </Button>
        )}
      </div>
      <ReusableDataTable columns={columns} rows={rows} loading={loading} emptyMessage="No stats added yet. Click 'Add Stat' to create one." />
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => { setDeleteModal(false); setSelectedItem(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Stat"
        message={`Are you sure you want to delete "${selectedItem?.title}"?`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
