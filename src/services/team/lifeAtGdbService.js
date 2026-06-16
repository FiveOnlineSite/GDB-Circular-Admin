import api from "../../lib/utils/apiConfig";

const base = "/team/life-at-gdb";

export const getLifeItems = (params) => api.get(base, { params }).then(r => r.data);
export const getLifeItemById = (id) => api.get(`${base}/${id}`).then(r => r.data);
export const createLifeItem = (data) => api.post(base, data).then(r => r.data);
export const updateLifeItem = (id, data) => api.put(`${base}/${id}`, data).then(r => r.data);
export const deleteLifeItem = (id) => api.delete(`${base}/${id}`).then(r => r.data);
export const toggleLifeItemStatus = (id) => api.patch(`${base}/${id}/status`).then(r => r.data);
