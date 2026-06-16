import api from "../../lib/utils/apiConfig";

const base = "/sellers/inquiries";

export const getInquiries = (params) => api.get(base, { params }).then(r => r.data);
export const getInquiryById = (id) => api.get(`${base}/${id}`).then(r => r.data);
export const deleteInquiry = (id) => api.delete(`${base}/${id}`).then(r => r.data);
export const exportInquiries = (params) => api.get(`${base}/export`, { params }).then(r => r.data);
