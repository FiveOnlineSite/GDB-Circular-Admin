import api from "../../lib/utils/apiConfig";

const base = "/sellers/feedstock";

export const getFeedstocks = (params) => api.get(base, { params }).then(r => r.data);
export const getFeedstockById = (id) => api.get(`${base}/${id}`).then(r => r.data);
export const createFeedstock = (data) => api.post(base, data).then(r => r.data);
export const updateFeedstock = (id, data) => api.put(`${base}/${id}`, data).then(r => r.data);
export const deleteFeedstock = (id) => api.delete(`${base}/${id}`).then(r => r.data);
export const toggleFeedstockStatus = (id) => api.patch(`${base}/${id}/status`).then(r => r.data);
