import api from "../../lib/utils/apiConfig";

const basePath = "/global-content/faqs";

export const getFaqs = async (params) => {
  const res = await api.get(basePath, { params });
  return res.data;
};

export const getFaqById = async (id) => {
  const res = await api.get(`${basePath}/${id}`);
  return res.data;
};

export const createFaq = async (data) => {
  const res = await api.post(basePath, data);
  return res.data;
};

export const updateFaq = async (id, data) => {
  const res = await api.put(`${basePath}/${id}`, data);
  return res.data;
};

export const deleteFaq = async (id) => {
  const res = await api.delete(`${basePath}/${id}`);
  return res.data;
};
