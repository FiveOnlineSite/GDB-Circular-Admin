import api from "lib/utils/apiConfig";
import { AUTH } from "services/constant";

const userLogin = async (data) => {
  try {
    const response = await api.post(AUTH.LOGIN, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (data) => {
  try {
    const response = await api.post(AUTH.FORGOT_PASSWORD, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (data) => {
  try {
    const response = await api.post(AUTH.RESET_PASSWORD, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (data) => {
  try {
    const response = await api.post(AUTH.REFRESH_TOKEN, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { userLogin, forgotPassword, resetPassword, refreshToken };
