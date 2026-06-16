import api from "../lib/utils/apiConfig";

const base = "/facilities";

export const getFacilities = (params) => api.get(base, { params }).then(r => r.data);
export const getFacility = (id) => api.get(`${base}/${id}`).then(r => r.data);
export const createFacility = (data) => api.post(base, data).then(r => r.data);
export const updateFacility = (id, data) => api.put(`${base}/${id}`, data).then(r => r.data);
export const deleteFacility = (id) => api.delete(`${base}/${id}`).then(r => r.data);
export const toggleFacilityStatus = (id) => api.patch(`${base}/${id}/status`).then(r => r.data);
