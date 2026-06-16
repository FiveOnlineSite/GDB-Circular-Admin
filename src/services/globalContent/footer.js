import api from "../../lib/utils/apiConfig";

const basePath = "/global-content/footer";

export const getFooter = async () => {
  const res = await api.get(basePath);
  return res.data;
};

export const updateFooter = async (data) => {
  const res = await api.put(basePath, data);
  return res.data;
};
