import axiosClient from "../../shared/api/axiosClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  businessName: string;
  businessAddress: string;
  businessPermit?: string;
  description?: string;
  role: string;
  category?: string;
  type?: string;
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
  barangayCode?: string;
  streetAddress?: string;
}

export interface AuthResponse {
  userId: number;
  role: string;
  message: string;
}

export interface GoogleAuthResponse {
  userId?: number;
  role?: string;
  message: string;
  needsRole: boolean;
  email?: string;
  name?: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axiosClient.post("/api/auth/login", credentials);
  return response.data;
};

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await axiosClient.post("/api/auth/register", userData);
  return response.data;
};

export const googleLogin = async (idToken: string, role?: string): Promise<GoogleAuthResponse> => {
  const response = await axiosClient.post("/api/auth/google", { idToken, role });
  return response.data;
};

export const refreshAccessToken = async (): Promise<AuthResponse> => {
  const response = await axiosClient.post("/api/auth/refresh");
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await axiosClient.post("/api/auth/logout");
  } catch {
    // Even if the server call fails, clear local storage
  } finally {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
  }
};
