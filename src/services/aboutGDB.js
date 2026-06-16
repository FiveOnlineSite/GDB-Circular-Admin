import api from "../lib/utils/apiConfig";

const base = "/about-gdb";

// ==========================================
// OVERVIEW
// ==========================================
export const getOverview = () => api.get(`${base}/overview`).then(r => r.data);
export const updateOverview = (data) => api.put(`${base}/overview`, data).then(r => r.data);

// ==========================================
// JOURNEY TIMELINE
// ==========================================
export const getJourneyTimelineSection = () => api.get(`${base}/journey-timeline/section`).then(r => r.data);
export const updateJourneyTimelineSection = (data) => api.put(`${base}/journey-timeline/section`, data).then(r => r.data);
export const getJourneyTimelineItems = () => api.get(`${base}/journey-timeline/items`).then(r => r.data);
export const getJourneyTimelineItemById = (id) => api.get(`${base}/journey-timeline/items/${id}`).then(r => r.data);
export const createJourneyTimelineItem = (data) => api.post(`${base}/journey-timeline/items`, data).then(r => r.data);
export const updateJourneyTimelineItem = (id, data) => api.put(`${base}/journey-timeline/items/${id}`, data).then(r => r.data);
export const deleteJourneyTimelineItem = (id) => api.delete(`${base}/journey-timeline/items/${id}`).then(r => r.data);

// ==========================================
// WHY INDUSTRY CHOOSES GDB PCR
// ==========================================
export const getWhyIndustryChoosesSection = () => api.get(`${base}/why-industry-chooses/section`).then(r => r.data);
export const updateWhyIndustryChoosesSection = (data) => api.put(`${base}/why-industry-chooses/section`, data).then(r => r.data);
export const getWhyIndustryChoosesItems = () => api.get(`${base}/why-industry-chooses/items`).then(r => r.data);
export const getWhyIndustryChoosesItemById = (id) => api.get(`${base}/why-industry-chooses/items/${id}`).then(r => r.data);
export const createWhyIndustryChoosesItem = (data) => api.post(`${base}/why-industry-chooses/items`, data).then(r => r.data);
export const updateWhyIndustryChoosesItem = (id, data) => api.put(`${base}/why-industry-chooses/items/${id}`, data).then(r => r.data);
export const deleteWhyIndustryChoosesItem = (id) => api.delete(`${base}/why-industry-chooses/items/${id}`).then(r => r.data);
