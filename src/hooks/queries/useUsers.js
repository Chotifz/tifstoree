import { useQuery } from '@tanstack/react-query';

async function fetchUserById(id) {
  if (!id) return null;
  
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

export function useUsers(filters = {}) {
  const { searchQuery, statusFilter, roleFilter } = filters;
  
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append('search', searchQuery);
  if (statusFilter && statusFilter !== 'all') queryParams.append('status', statusFilter);
  if (roleFilter && roleFilter !== 'all') queryParams.append('role', roleFilter);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/api/users?${queryString}` : '/api/users';
  
  return useQuery({
    queryKey: ['users', searchQuery, statusFilter, roleFilter],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    }
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    enabled: !!id, 
  });
}