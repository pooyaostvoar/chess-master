import axios from "axios";

const API_URL = "http://localhost:3004";

export const signup = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/signup`, {
    username,
    password,
  });
  return response.data;
};

export const login = async (username: string, password: string) => {
  const response = await axios.post(
    `${API_URL}/login`,
    { username, password },
    { withCredentials: true }
  );
  return response.data;
};

export const getAuthUser = async () => {
  const response = await axios.get(`${API_URL}/auth-user`, {
    withCredentials: true,
    validateStatus: (status) => status < 500,
  });
  return response;
};

export const updateUser = async (id: number, data: any) => {
  const response = await axios.patch(`${API_URL}/users/${id}`, data, {
    withCredentials: true,
  });
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get(`${API_URL}/users/me`, {
    withCredentials: true,
  });
  return response.data;
};
