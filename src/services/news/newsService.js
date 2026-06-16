import api from "../../lib/utils/apiConfig";

const base = "/news";

export const getNews = (params) => api.get(base, { params }).then(r => r.data);
export const getNewsById = (id) => api.get(`${base}/${id}`).then(r => r.data);
export const createNews = (data) => api.post(base, data).then(r => r.data);
export const updateNews = (id, data) => api.put(`${base}/${id}`, data).then(r => r.data);
export const deleteNews = (id) => api.delete(`${base}/${id}`).then(r => r.data);
export const toggleNewsPublish = (id) => api.patch(`${base}/${id}/publish`).then(r => r.data);
