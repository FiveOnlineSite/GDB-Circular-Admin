import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import { getBanners, updateBanner } from "../../../services/globalContent/banners";
import { usePermissionContext } from "../../../context/PermissionContext";
import { StatusActionButton, StatusBadge } from "../../../components/common/StatusControls";

export default function BannerList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleToggleStatus = async (row) => {
    try {
      const res = await updateBanner(row.id, {
        ...row,
        status: row.status === "active" ? "inactive" : "active",
      });
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
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
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: ({ row }) => <StatusBadge status={row.status} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission("globalContent", "banner.update") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700"
                onClick={() => navigate(`/global-content/banners/edit/${row.id}`)}
              >
                <Edit2 className="h-4 w-4 text-[#C3662D]" />
              </Button>
              <StatusActionButton row={row} entityName="banner" onConfirm={handleToggleStatus} />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Banner Management</h1>
          <p className="text-sm text-gray-500  mt-1">Manage page banners with images and videos</p>
        </div>
      </div>
      <ReusableDataTable columns={columns} rows={rows} loading={loading} emptyMessage="No banners found." />
    </div>
  );
}
