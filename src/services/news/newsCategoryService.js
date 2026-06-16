import api from "../../lib/utils/apiConfig";

const base = "/news/categories";

export const getCategories = (params) => api.get(base, { params }).then(r => r.data);
export const getCategoryById = (id) => api.get(`${base}/${id}`).then(r => r.data);
export const createCategory = (data) => api.post(base, data).then(r => r.data);
export const updateCategory = (id, data) => api.put(`${base}/${id}`, data).then(r => r.data);
export const deleteCategory = (id) => api.delete(`${base}/${id}`).then(r => r.data);
export const toggleCategoryStatus = (id) => api.patch(`${base}/${id}/status`).then(r => r.data);
