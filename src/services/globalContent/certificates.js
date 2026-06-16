import api from "../../lib/utils/apiConfig";

const basePath = "/global-content/certificates";

export const getCertificates = async () => {
  const res = await api.get(basePath);
  return res.data;
};

export const getCertificateById = async (id) => {
  const res = await api.get(`${basePath}/${id}`);
  return res.data;
};

export const createCertificate = async (data) => {
  const res = await api.post(basePath, data);
  return res.data;
};

export const updateCertificate = async (id, data) => {
  const res = await api.put(`${basePath}/${id}`, data);
  return res.data;
};

export const deleteCertificate = async (id) => {
  const res = await api.delete(`${basePath}/${id}`);
  return res.data;
};
