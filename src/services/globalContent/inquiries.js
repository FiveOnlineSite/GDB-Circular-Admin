import api from "../../lib/utils/apiConfig";

const basePath = "/global-content/inquiries";

export const getInquiries = async (params) => {
  const res = await api.get(basePath, { params });
  return res.data;
};

export const deleteInquiry = async (id) => {
  const res = await api.delete(`${basePath}/${id}`);
  return res.data;
};
