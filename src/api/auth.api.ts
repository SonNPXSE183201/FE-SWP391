import { axiosInstance } from './axios';

export interface RegisterAssistantRequest {
  userName: string;
  email: string;
  passwordHash: string;
  fullName: string;
  portfolioUrl: string;
  specialtyTags: string[];
}

export const authApi = {
  registerAssistant: (data: RegisterAssistantRequest) => 
    axiosInstance.post('/api/auth/register', data),
};
