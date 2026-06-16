import api from "../../lib/utils/apiConfig";

export const getRoles = async () => {
  const res = await api.get("/roles");
  return res.data;
};

export const createRole = async (data) => {
  const res = await api.post("/roles", data);
  return res.data;
};

export const updateRole = async (id, data) => {
  const res = await api.put(`/roles/${id}`, data);
  return res.data;
};

export const deleteRole = async (id) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
};

export const assignPermissionsToRole = async (roleId, permissionIds) => {
  const res = await api.post(`/roles/${roleId}/permissions`, { permissionIds });
  return res.data;
};

export const getRolePermissions = async (roleId) => {
  // Returns all permissions with their assigned status for a given role
  const res = await api.get(`/roles/${roleId}`);
  return res.data;
};
