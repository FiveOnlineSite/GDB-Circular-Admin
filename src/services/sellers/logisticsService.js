import api from "../../lib/utils/apiConfig";

const base = "/sellers/logistics";

export const getSellerLogisticsSection = () => api.get(base).then((r) => r.data);
export const updateSellerLogisticsSection = (data) => api.put(`${base}/section`, data).then((r) => r.data);
export const getSellerLogisticsCards = () => api.get(`${base}/cards`).then((r) => r.data);
export const getSellerLogisticsCardById = (id) => api.get(`${base}/cards/${id}`).then((r) => r.data);
export const createSellerLogisticsCard = (data) => api.post(`${base}/cards`, data).then((r) => r.data);
export const updateSellerLogisticsCard = (id, data) => api.put(`${base}/cards/${id}`, data).then((r) => r.data);
export const deleteSellerLogisticsCard = (id) => api.delete(`${base}/cards/${id}`).then((r) => r.data);
