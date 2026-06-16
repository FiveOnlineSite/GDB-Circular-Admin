import api from "../../lib/utils/apiConfig";

export const getPermissions = async () => {
  const res = await api.get("/permissions");
  return res.data;
};
