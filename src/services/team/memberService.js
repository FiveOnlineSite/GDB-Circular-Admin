import api from "../../lib/utils/apiConfig";

const base = "/team/members";

export const getMembers = (params) => api.get(base, { params }).then(r => r.data);
export const getMemberById = (id) => api.get(`${base}/${id}`).then(r => r.data);
export const createMember = (data) => api.post(base, data).then(r => r.data);
export const updateMember = (id, data) => api.put(`${base}/${id}`, data).then(r => r.data);
export const deleteMember = (id) => api.delete(`${base}/${id}`).then(r => r.data);
export const toggleMemberStatus = (id) => api.patch(`${base}/${id}/status`).then(r => r.data);
