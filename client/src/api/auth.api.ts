import api from '../lib/api';

export async function registerApi(userData: any) {
  const response = await api.post('/auth/register', userData);
  return response.data;
}

export async function loginApi(credentials: any) {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}
