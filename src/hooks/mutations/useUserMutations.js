import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Update user function
async function updateUser(userData) {
  const { id, ...data } = userData;
  
  try {
    const response = await axios.put(`/api/users/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to update user'
    );
  }
}

// Delete user function
async function deleteUser(userId) {
  try {
    const response = await axios.delete(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to delete user'
    );
  }
}

// Create user function
async function createUser(userData) {
  try {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Failed to create user'
    );
  }
}

// Mutation hooks
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables) => {
      // Invalidate the user query
      queryClient.invalidateQueries(['user', variables.id]);
      // Invalidate the users list
      queryClient.invalidateQueries(['users']);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate the users list
      queryClient.invalidateQueries(['users']);
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate the users list
      queryClient.invalidateQueries(['users']);
    },
  });
}