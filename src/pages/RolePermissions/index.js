import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Key, CheckSquare, Square } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { getRoles, createRole, updateRole, deleteRole, assignPermissionsToRole } from "../../services/role";
import { getPermissions } from "../../services/permission";
import { usePermissionContext } from "../../context/PermissionContext";

export default function RolePermissions() {
  const { hasPermission } = usePermissionContext();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modals state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  
  // Active/selected item states
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      if (res.success) {
        setRoles(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionsList = async () => {
    try {
      const res = await getPermissions();
      if (res.success) {
        setPermissions(res.data);
      }
    } catch (err) {
      console.error("Failed to load system permissions list", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissionsList();
  }, []);

  const handleOpenRoleModal = (role = null) => {
    setErrors({});
    if (role) {
      setSelectedRole(role);
      setRoleForm({ name: role.name, description: role.description || "" });
    } else {
      setSelectedRole(null);
      setRoleForm({ name: "", description: "" });
    }
    setRoleModalOpen(true);
  };

  const handleRoleFormChange = (field, value) => {
    setRoleForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!roleForm.name.trim()) {
      newErrors.name = "Role name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (selectedRole) {
        const res = await updateRole(selectedRole.id, roleForm);
        if (res.success) {
          toast.success("Role updated successfully");
          setRoleModalOpen(false);
          fetchRoles();
        }
      } else {
        const res = await createRole(roleForm);
        if (res.success) {
          toast.success("Role created successfully");
          setRoleModalOpen(false);
          fetchRoles();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Role submit failed");
    }
  };

  const handleOpenDeleteModal = (role) => {
    setSelectedRole(role);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteRole(selectedRole.id);
      if (res.success) {
        toast.success("Role deleted successfully");
        setDeleteModalOpen(false);
        fetchRoles();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleOpenPermissionsModal = (role) => {
    setSelectedRole(role);
    setSelectedPermissionIds(role.permissionIds || []);
    setPermissionModalOpen(true);
  };

  const handleTogglePermission = (id) => {
    setSelectedPermissionIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleToggleModule = (moduleName, isSelectAll) => {
    const modulePermIds = permissions
      .filter(p => p.module === moduleName)
      .map(p => p.id);

    if (isSelectAll) {
      setSelectedPermissionIds(prev => {
        const unique = new Set([...prev, ...modulePermIds]);
        return Array.from(unique);
      });
    } else {
      setSelectedPermissionIds(prev => prev.filter(pId => !modulePermIds.includes(pId)));
    }
  };

  const handleSelectAllPermissions = (selectAll) => {
    if (selectAll) {
      setSelectedPermissionIds(permissions.map(p => p.id));
    } else {
      setSelectedPermissionIds([]);
    }
  };

  const handleSavePermissions = async () => {
    try {
      const res = await assignPermissionsToRole(selectedRole.id, selectedPermissionIds);
      if (res.success) {
        toast.success("Permissions updated successfully");
        setPermissionModalOpen(false);
        fetchRoles();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Permission update failed");
    }
  };

  // Group permissions module-wise
  const groupedPermissions = permissions.reduce((acc, current) => {
    if (!acc[current.module]) {
      acc[current.module] = [];
    }
    acc[current.module].push(current);
    return acc;
  }, {});

  const columns = [
    { field: "name", headerName: "Role Name", sortable: true },
    { field: "description", headerName: "Description", sortable: false },
    { field: "usersCount", headerName: "Users Count", sortable: true },
    { field: "permissionsCount", headerName: "Permissions", sortable: true },
    {
      field: "status",
      headerName: "Status",
      renderCell: (params) => (
        <span className="bg-green-100 text-green-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {params.value || "Active"}
        </span>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      align: "center",
      renderCell: (params) => {
        const role = params.row;
        const isSuperAdmin = role.name === "Super Admin";
        return (
          <div className="flex items-center justify-center gap-2">
            {hasPermission("permission.manage") && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 border-slate-200 text-slate-700"
                onClick={() => handleOpenPermissionsModal(role)}
              >
                <Key className="h-4 w-4 mr-1 text-[#C3662D]" />
                Permissions
              </Button>
            )}
            {!isSuperAdmin && hasPermission("role.update") && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700"
                onClick={() => handleOpenRoleModal(role)}
              >
                <Edit2 className="h-4 w-4 text-[#C3662D]" />
              </Button>
            )}
            {!isSuperAdmin && hasPermission("role.delete") && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
                onClick={() => handleOpenDeleteModal(role)}
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Roles & Permissions</h1>
          <p className="text-slate-500 text-sm">Manage dynamic access levels and system permissions mappings</p>
        </div>
        {hasPermission("role.create") && (
          <Button onClick={() => handleOpenRoleModal()} className="shadow-sm">
            <Plus className="h-4 w-4 mr-1" /> Add Role
          </Button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <ReusableDataTable
          columns={columns}
          rows={roles}
          loading={loading}
          pagination={null}
        />
      </div>

      {/* Role Create/Edit Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedRole ? "Edit Role" : "Create New Role"}
              </h3>
            </div>
            <form onSubmit={handleRoleSubmit} noValidate>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Supervisor"
                    value={roleForm.name}
                    onChange={(e) => handleRoleFormChange("name", e.target.value)}
                    disabled={selectedRole?.name === "Super Admin"}
                    error={!!errors.name}
                    errorMessage={errors.name}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter role description..."
                    value={roleForm.description}
                    onChange={(e) => handleRoleFormChange("description", e.target.value)}
                    className={`w-full border ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-[#E6E6E6] focus:border-[#981B1F] focus:ring-[#981B1F]/15'} text-[#111111] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 transition`}
                  />
                  {errors.description && (
                    <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                      {errors.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setRoleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Permissions Modal */}
      {permissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Manage Permissions for "{selectedRole?.name}"
                </h3>
                <p className="text-xs text-slate-500">Configure what access this role has in the system</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectAllPermissions(true)}
                >
                  Select All
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSelectAllPermissions(false)}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {Object.keys(groupedPermissions).map(moduleName => {
                const modulePerms = groupedPermissions[moduleName];
                const allSelected = modulePerms.every(p => selectedPermissionIds.includes(p.id));
                return (
                  <div key={moduleName} className="border border-[#E6E6E6] rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-[#981B1F] uppercase tracking-wider text-xs">{moduleName} Management</h4>
                      <button 
                        type="button"
                        onClick={() => handleToggleModule(moduleName, !allSelected)}
                        className="text-xs font-semibold text-[#C3662D] hover:underline"
                      >
                        {allSelected ? "Deselect Module" : "Select Module"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {modulePerms.map(perm => {
                        const isChecked = selectedPermissionIds.includes(perm.id);
                        return (
                          <div 
                            key={perm.id} 
                            onClick={() => handleTogglePermission(perm.id)}
                            className="flex items-center gap-2 cursor-pointer select-none group"
                          >
                            <div className="shrink-0 text-[#981B1F]">
                              {isChecked ? (
                                <CheckSquare className="h-5 w-5 fill-[#981B1F] text-white" />
                              ) : (
                                <Square className="h-5 w-5 text-slate-300 group-hover:text-slate-400" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {(() => {
                                const parts = perm.name.split(".");
                                if (parts.length >= 3) {
                                  // e.g. "product.catalogue.view" -> "catalogue - view"
                                  return `${parts[1]} - ${parts.slice(2).join(" ")}`;
                                }
                                return parts[1] || perm.name;
                              })()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setPermissionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSavePermissions}>
                Save Permissions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
