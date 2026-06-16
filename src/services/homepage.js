import api from "../lib/utils/apiConfig";

const base = "/homepage";

// Stats
export const getStats = () => api.get(`${base}/stats`).then(r => r.data);
export const getStatById = (id) => api.get(`${base}/stats/${id}`).then(r => r.data);
export const createStat = (data) => api.post(`${base}/stats`, data).then(r => r.data);
export const updateStat = (id, data) => api.put(`${base}/stats/${id}`, data).then(r => r.data);
export const deleteStat = (id) => api.delete(`${base}/stats/${id}`).then(r => r.data);

// Process
export const getProcessSection = () => api.get(`${base}/process`).then(r => r.data);
export const updateProcessSection = (data) => api.put(`${base}/process/section`, data).then(r => r.data);
export const getProcessSteps = () => api.get(`${base}/process/steps`).then(r => r.data);
export const getProcessStepById = (id) => api.get(`${base}/process/steps/${id}`).then(r => r.data);
export const createProcessStep = (data) => api.post(`${base}/process/steps`, data).then(r => r.data);
export const updateProcessStep = (id, data) => api.put(`${base}/process/steps/${id}`, data).then(r => r.data);
export const deleteProcessStep = (id) => api.delete(`${base}/process/steps/${id}`).then(r => r.data);

// Why Choose
export const getWhyChooseSection = () => api.get(`${base}/whychoose`).then(r => r.data);
export const updateWhyChooseSection = (data) => api.put(`${base}/whychoose/section`, data).then(r => r.data);
export const getWhyChooseCards = () => api.get(`${base}/whychoose/cards`).then(r => r.data);
export const getWhyChooseCardById = (id) => api.get(`${base}/whychoose/cards/${id}`).then(r => r.data);
export const createWhyChooseCard = (data) => api.post(`${base}/whychoose/cards`, data).then(r => r.data);
export const updateWhyChooseCard = (id, data) => api.put(`${base}/whychoose/cards/${id}`, data).then(r => r.data);
export const deleteWhyChooseCard = (id) => api.delete(`${base}/whychoose/cards/${id}`).then(r => r.data);
