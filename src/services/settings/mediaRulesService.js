import api from "../../lib/utils/apiConfig";

const base = "/settings/media-rules";

export const getMediaRules = () => api.get(base).then((r) => r.data);
export const updateMediaRules = (data) => api.put(base, data).then((r) => r.data);
export const getMediaRulesHistory = () => api.get(`${base}/history`).then((r) => r.data);
