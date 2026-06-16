import api from "../../lib/utils/apiConfig";

const basePath = "/global-content/banners";

export const getBanners = async (params) => {
  const res = await api.get(basePath, { params });
  return res.data;
};

export const getBannerById = async (id) => {
  const res = await api.get(`${basePath}/${id}`);
  return res.data;
};

export const createBanner = async (data) => {
  const res = await api.post(basePath, data);
  return res.data;
};

export const updateBanner = async (id, data) => {
  const res = await api.put(`${basePath}/${id}`, data);
  return res.data;
};

export const deleteBanner = async (id) => {
  const res = await api.delete(`${basePath}/${id}`);
  return res.data;
};
