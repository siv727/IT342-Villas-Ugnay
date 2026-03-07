import axiosClient from "./axiosClient";

export interface UserProfile {
  userId: number;
  email: string;
  businessName: string;
  businessAddress: string;
  businessPermit?: string;
  description?: string;
}

export const getUserProfile = async (id: number): Promise<UserProfile> => {
  const response = await axiosClient.get(`/api/user/${id}`);
  return response.data;
};

export const updateUserProfile = async (id: number, userData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await axiosClient.put(`/api/user/${id}`, userData);
  return response.data;
};
