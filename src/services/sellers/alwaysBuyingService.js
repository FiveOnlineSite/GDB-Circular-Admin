import api from "../../lib/utils/apiConfig";

const base = "/sellers/always-buying";

export const getAlwaysBuying = () => api.get(base).then(r => r.data);
export const updateAlwaysBuying = (data) => api.put(base, data).then(r => r.data);
