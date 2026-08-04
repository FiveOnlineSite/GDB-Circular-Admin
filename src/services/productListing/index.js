import api from "../../lib/utils/apiConfig";

const base = "/product-listing";

// Product Catalogue
export const getProducts = (params) => api.get(`${base}/catalogue`, { params }).then(r => r.data);
export const getProductById = (id) => api.get(`${base}/catalogue/${id}`).then(r => r.data);
export const createProduct = (data) => api.post(`${base}/catalogue`, data).then(r => r.data);
export const updateProduct = (id, data) => api.put(`${base}/catalogue/${id}`, data).then(r => r.data);
export const deleteProduct = (id) => api.delete(`${base}/catalogue/${id}`).then(r => r.data);
export const toggleProductStatus = (id) => api.patch(`${base}/catalogue/${id}/toggle-status`).then(r => r.data);
export const toggleProductHomepage = (id) => api.patch(`${base}/catalogue/${id}/toggle-homepage`).then(r => r.data);

// Quality Assurance
export const getQualityAssuranceSection = () => api.get(`${base}/quality-assurance`).then(r => r.data);
export const updateQualityAssuranceSection = (data) => api.put(`${base}/quality-assurance/section`, data).then(r => r.data);
export const getQualityAssuranceCards = () => api.get(`${base}/quality-assurance/cards`).then(r => r.data);
export const getQualityAssuranceCardById = (id) => api.get(`${base}/quality-assurance/cards/${id}`).then(r => r.data);
export const createQualityAssuranceCard = (data) => api.post(`${base}/quality-assurance/cards`, data).then(r => r.data);
export const updateQualityAssuranceCard = (id, data) => api.put(`${base}/quality-assurance/cards/${id}`, data).then(r => r.data);
export const deleteQualityAssuranceCard = (id) => api.delete(`${base}/quality-assurance/cards/${id}`).then(r => r.data);

// Case Studies
export const getCaseStudies = (params) => api.get(`${base}/case-study`, { params }).then(r => r.data);
export const getCaseStudyById = (id) => api.get(`${base}/case-study/${id}`).then(r => r.data);
export const createCaseStudy = (data) => api.post(`${base}/case-study`, data).then(r => r.data);
export const updateCaseStudy = (id, data) => api.put(`${base}/case-study/${id}`, data).then(r => r.data);
export const deleteCaseStudy = (id) => api.delete(`${base}/case-study/${id}`).then(r => r.data);
