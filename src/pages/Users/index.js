import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { getUsers, deleteUser, updateUserStatus } from "../../services/user";
import { usePermissionContext } from "../../context/PermissionContext";

export default function UserManagement() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  // Filters and Sorting
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortConfig, setSortConfig] = useState({ sortBy: "id", sortOrder: "desc" });

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers({
        search,
        status,
        page: pagination.current_page,
        limit: pagination.per_page,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      if (res.success) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, status, pagination.current_page, pagination.per_page, sortConfig.sortBy, sortConfig.sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current_page: 1 }));
    fetchUsers();
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handlePerPageChange = (perPage) => {
    setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
  };

  const handleSortChange = (field, order) => {
    setSortConfig({ sortBy: field, sortOrder: order });
  };

  const handleOpenFormPage = (user = null) => {
    if (user) {
      navigate(`/users/edit/${user.id}`);
    } else {
      navigate("/users/create");
    }
  };

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteUser(selectedUser.id);
      if (res.success) {
        toast.success("User deleted successfully");
        setDeleteModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      const res = await updateUserStatus(user.id, newStatus);
      if (res.success) {
        toast.success(`User status changed to ${newStatus}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Status change failed");
    }
  };

  const columns = [
    { field: "name", headerName: "Name", sortable: true },
    { field: "email", headerName: "Email", sortable: true },
    { 
      field: "phone", 
      headerName: "Phone", 
      sortable: false,
      renderCell: (params) => params.value || "-"
    },
    { 
      field: "roles", 
      headerName: "Role", 
      sortable: false,
      renderCell: (params) => (
        <span className="text-slate-600 font-medium capitalize">
          {params.value && params.value.length > 0 ? params.value.join(", ") : "-"}
        </span>
      )
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      renderCell: (params) => {
        const user = params.row;
        const statusColors = {
          active: "bg-green-100 text-green-800",
          inactive: "bg-gray-100 text-gray-800",
          suspended: "bg-red-100 text-red-800"
        };
        return (
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusColors[params.value] || "bg-slate-100"}`}>
              {params.value}
            </span>
            {hasPermission("user.update") && (
              <button
                onClick={() => handleToggleStatus(user)}
                className="text-xs text-[#C3662D] hover:underline"
              >
                Toggle
              </button>
            )}
          </div>
        );
      }
    },
    {
      field: "created_at",
      headerName: "Created Date",
      sortable: true,
      renderCell: (params) => (
        <span className="text-slate-500">
          {params.value ? new Date(params.value).toLocaleDateString() : "-"}
        </span>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      align: "center",
      renderCell: (params) => {
        const userItem = params.row;
        return (
          <div className="flex items-center justify-center gap-2">
            {hasPermission("user.update") && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700"
                onClick={() => handleOpenFormPage(userItem)}
              >
                <Edit2 className="h-4 w-4 text-[#C3662D]" />
              </Button>
            )}
            {hasPermission("user.delete") && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
                onClick={() => handleOpenDeleteModal(userItem)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Users Management</h1>
          <p className="text-slate-500 text-sm">Create, edit, and audit system users and their assigned roles</p>
        </div>
        {hasPermission("user.create") && (
          <Button onClick={() => handleOpenFormPage()} className="shadow-sm">
            <Plus className="h-4 w-4 mr-1" /> Add User
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#981B1F] cursor-pointer transition-colors duration-200">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-sm font-semibold text-slate-600 shrink-0">Filter by Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-40 border border-[#E6E6E6] text-[#111111] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <ReusableDataTable
          columns={columns}
          rows={users}
          loading={loading}
          pagination={pagination}
          handlePageChange={handlePageChange}
          handlePerPageChange={handlePerPageChange}
          handleSortChange={handleSortChange}
          sortConfig={sortConfig}
        />
      </div>


      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
