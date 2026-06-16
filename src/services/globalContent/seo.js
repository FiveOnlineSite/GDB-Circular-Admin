import api from "../../lib/utils/apiConfig";

const basePath = "/global-content/seo";

export const getSeoList = async (params) => {
  const res = await api.get(basePath, { params });
  return res.data;
};

export const getSeoById = async (id) => {
  const res = await api.get(`${basePath}/id/${id}`);
  return res.data;
};

export const createSeo = async (data) => {
  const res = await api.post(basePath, data);
  return res.data;
};

export const updateSeo = async (id, data) => {
  const res = await api.put(`${basePath}/${id}`, data);
  return res.data;
};

export const deleteSeo = async (id) => {
  const res = await api.delete(`${basePath}/${id}`);
  return res.data;
};
