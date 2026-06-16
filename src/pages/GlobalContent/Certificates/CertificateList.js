import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getCertificates, deleteCertificate } from "../../../services/globalContent/certificates";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function CertificateList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getCertificates();
      if (res.success) setRows(Array.isArray(res.data) ? res.data : []);
      else setRows([]);
    } catch (err) {
      toast.error("Failed to load certificates");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteCertificate(selectedItem.id);
      if (res.success) { toast.success("Certificate deleted"); fetchData(); }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteModalOpen(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      field: "title",
      headerName: "Certificate Title",
      sortable: true,
    },
    {
      field: "image_url",
      headerName: "Image",
      sortable: false,
      renderCell: ({ row }) =>
        row.image_url ? (
          <img
            src={row.image_url.startsWith("data:") ? row.image_url : `${process.env.REACT_APP_API_URL || ""}${row.image_url}`}
            alt={row.image_alt || row.title}
            className="h-10 w-16 object-contain rounded border"
          />
        ) : <span className="text-slate-400 text-xs">No image</span>,
    },
    {
      field: "link",
      headerName: "Link",
      renderCell: ({ row }) =>
        row.link ? (
          <a href={row.link} target="_blank" rel="noreferrer" className="text-blue-600 text-xs underline truncate max-w-[160px] block">
            {row.link}
          </a>
        ) : <span className="text-slate-400 text-xs">-</span>,
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
          {hasPermission("globalContent", "certificates.update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/global-content/certificates/edit/${row.id}`)}
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {hasPermission("globalContent", "certificates.delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => { setSelectedItem(row); setDeleteModalOpen(true); }}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates / Trust Logos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage trust badges and certifications shown on the site</p>
        </div>
        {hasPermission("globalContent", "certificates.create") && (
          <Button onClick={() => navigate("/global-content/certificates/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />Add Certificate
          </Button>
        )}
      </div>
      <ReusableDataTable columns={columns} rows={rows} loading={loading} emptyMessage="No certificates found. Click 'Add Certificate' to create one." />
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedItem(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Certificate"
        message={`Are you sure you want to delete "${selectedItem?.title}"?`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
