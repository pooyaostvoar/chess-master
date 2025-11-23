import axios from 'axios';
import { API_URL } from '../config';
import { User } from './user.api';

export interface LoginResponse {
  user: User;
}

/**
 * Sign up a new user
 */
export const signup = async (
  username: string,
  password: string
): Promise<any> => {
  const response = await axios.post(`${API_URL}/signup`, {
    username,
    password,
  });
  return response.data;
};

/**
 * Log in a user
 */
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axios.post(
    `${API_URL}/login`,
    { username, password },
    { withCredentials: true }
  );
  return response.data;
};

/**
 * Log out the current user
 */
export const logout = async (): Promise<void> => {
  await axios.post(
    `${API_URL}/logout`,
    {},
    { withCredentials: true }
  );
};

/**
 * Get authenticated user (legacy endpoint)
 */
export const getAuthUser = async () => {
  const response = await axios.get(`${API_URL}/auth-user`, {
    withCredentials: true,
    validateStatus: (status) => status < 500,
  });
  return response;
};

