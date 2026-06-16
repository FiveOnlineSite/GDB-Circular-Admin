import api from "../../lib/utils/apiConfig";

const base = "/product-listing";

// Product Catalogue
export const getProducts = (params) => api.get(`${base}/catalogue`, { params }).then(r => r.data);
export const getProductById = (id) => api.get(`${base}/catalogue/${id}`).then(r => r.data);
export const createProduct = (data) => api.post(`${base}/catalogue`, data).then(r => r.data);
export const updateProduct = (id, data) => api.put(`${base}/catalogue/${id}`, data).then(r => r.data);
export const deleteProduct = (id) => api.delete(`${base}/catalogue/${id}`).then(r => r.data);
export const toggleProductStatus = (id) => api.patch(`${base}/catalogue/${id}/toggle-status`).then(r => r.data);

// Logistics Support
export const getLogisticsSection = () => api.get(`${base}/logistics-support`).then(r => r.data);
export const updateLogisticsSection = (data) => api.put(`${base}/logistics-support/section`, data).then(r => r.data);
export const getLogisticsCards = () => api.get(`${base}/logistics-support/cards`).then(r => r.data);
export const getLogisticsCardById = (id) => api.get(`${base}/logistics-support/cards/${id}`).then(r => r.data);
export const createLogisticsCard = (data) => api.post(`${base}/logistics-support/cards`, data).then(r => r.data);
export const updateLogisticsCard = (id, data) => api.put(`${base}/logistics-support/cards/${id}`, data).then(r => r.data);
export const deleteLogisticsCard = (id) => api.delete(`${base}/logistics-support/cards/${id}`).then(r => r.data);

// Case Studies
export const getCaseStudies = (params) => api.get(`${base}/case-study`, { params }).then(r => r.data);
export const getCaseStudyById = (id) => api.get(`${base}/case-study/${id}`).then(r => r.data);
export const createCaseStudy = (data) => api.post(`${base}/case-study`, data).then(r => r.data);
export const updateCaseStudy = (id, data) => api.put(`${base}/case-study/${id}`, data).then(r => r.data);
export const deleteCaseStudy = (id) => api.delete(`${base}/case-study/${id}`).then(r => r.data);
