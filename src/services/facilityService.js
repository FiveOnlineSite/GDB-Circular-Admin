import api from "../lib/utils/apiConfig";

const base = "/facilities";

export const getFacilities = (params) => api.get(base, { params }).then(r => r.data);
export const getFacility = (id) => api.get(`${base}/${id}`).then(r => r.data);
export const createFacility = (data) => api.post(base, data).then(r => r.data);
export const updateFacility = (id, data) => api.put(`${base}/${id}`, data).then(r => r.data);
export const deleteFacility = (id) => api.delete(`${base}/${id}`).then(r => r.data);
export const toggleFacilityStatus = (id) => api.patch(`${base}/${id}/status`).then(r => r.data);
export const getFacilitiesWhatWeDo = () => api.get(`${base}/what-we-do`).then(r => r.data);
export const getFacilitiesWhatWeDoCardById = (id) => api.get(`${base}/what-we-do/cards/${id}`).then(r => r.data);
export const updateFacilitiesWhatWeDoSection = (data) => api.put(`${base}/what-we-do/section`, data).then(r => r.data);
export const createFacilitiesWhatWeDoCard = (data) => api.post(`${base}/what-we-do/cards`, data).then(r => r.data);
export const updateFacilitiesWhatWeDoCard = (id, data) => api.put(`${base}/what-we-do/cards/${id}`, data).then(r => r.data);
export const deleteFacilitiesWhatWeDoCard = (id) => api.delete(`${base}/what-we-do/cards/${id}`).then(r => r.data);
