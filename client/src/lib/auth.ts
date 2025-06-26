import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  bio?: string;
  company?: string;
  title?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  industries?: string[];
  investmentRange?: string;
  fundingNeed?: string;
  portfolioSize?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const authAPI = {
  login: async (data: LoginData) => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },

  register: async (data: RegisterData) => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },

  logout: async () => {
    const response = await apiRequest("POST", "/api/auth/logout");
    return response.json();
  },

  getMe: async () => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  },
};
