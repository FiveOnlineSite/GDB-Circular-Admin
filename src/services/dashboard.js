import api from "../lib/utils/apiConfig";

export const getDashboardSummary = async () => {
  const res = await api.get("/dashboard/summary");
  return res.data;
};
