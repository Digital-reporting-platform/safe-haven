import { api } from './api/client';
// Note: In a REST API, TABLES.USERS usually refers to the endpoint string like '/users'
import { TABLES } from './api/endpoints'; 

export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: string;
  status?: string;
}
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get(TABLES.USERS);
  return response.data; 
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`${TABLES.USERS}/${id}`);
  return response.data;
};


export const getCurrentUserProfile = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error("Could not fetch profile", error);
    return null;
  }
};


export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
  const response = await api.put(`${TABLES.USERS}/${id}`, updates);
  return response.data;
};

/**
 * Delete a user
 * Hits DELETE /users/:id
 */
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`${TABLES.USERS}/${id}`);
};