// src/hooks/useOrders.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

// Fetch user's orders
export function useUserOrders(params = {}, queryOptions = {}) {
  const { page = 1, limit = 10, status } = params;
  
  return useQuery({
    queryKey: ['userOrders', { page, limit, status }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      if (status) queryParams.append('status', status);
      
      const response = await axios.get(`/api/user/orders?${queryParams.toString()}`);
      return response.data;
    },
    ...queryOptions
  });
}

// Fetch a specific order
export function useOrderDetails(orderNumber, queryOptions = {}) {
  return useQuery({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;
      
      const response = await axios.get(`/api/orders/${orderNumber}`);
      return response.data;
    },
    enabled: !!orderNumber,
    ...queryOptions
  });
}

// Check order status
export function useOrderStatus(params = {}, queryOptions = {}) {
  const { orderNumber, trxId, refetchInterval = 5000 } = params;
  
  return useQuery({
    queryKey: ['orderStatus', { orderNumber, trxId }],
    queryFn: async () => {
      if (!orderNumber && !trxId) return null;
      
      const queryParams = new URLSearchParams();
      if (orderNumber) queryParams.append('orderNumber', orderNumber);
      if (trxId) queryParams.append('trxId', trxId);
      
      const response = await axios.get(`/api/orders/status?${queryParams.toString()}`);
      return response.data;
    },
    enabled: !!(orderNumber || trxId),
    refetchInterval: (data) => {
      // Only continue polling if order is not completed or failed
      if (data?.data?.status === 'COMPLETED' || 
          data?.data?.status === 'FAILED' ||
          data?.data?.transactionStatus === 'SUCCESS' || 
          data?.data?.transactionStatus === 'FAILED') {
        return false;
      }
      return refetchInterval;
    },
    ...queryOptions
  });
}

// Process an order
export function useProcessOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await axios.post('/api/orders/process', orderData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Order is being processed');
      // Invalidate relevant queries
      queryClient.invalidateQueries(['order', variables.orderNumber]);
      queryClient.invalidateQueries(['orderStatus', { orderNumber: variables.orderNumber }]);
      queryClient.invalidateQueries(['userOrders']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process order');
    }
  });
}

// Helpful order status functions
export function getOrderStatusDisplay(status) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending',
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        darkBgColor: 'dark:bg-amber-950/20'
      };
    case 'PROCESSING':
      return {
        label: 'Processing',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        darkBgColor: 'dark:bg-blue-950/20'
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        darkBgColor: 'dark:bg-emerald-950/20'
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        color: 'text-rose-500',
        bgColor: 'bg-rose-50',
        darkBgColor: 'dark:bg-rose-950/20'
      };
    case 'FAILED':
      return {
        label: 'Failed',
        color: 'text-rose-500',
        bgColor: 'bg-rose-50',
        darkBgColor: 'dark:bg-rose-950/20'
      };
    default:
      return {
        label: status || 'Unknown',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        darkBgColor: 'dark:bg-gray-950/20'
      };
  }
}

export function getPaymentStatusDisplay(status) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending',
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        darkBgColor: 'dark:bg-amber-950/20'
      };
    case 'SUCCESS':
      return {
        label: 'Success',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        darkBgColor: 'dark:bg-emerald-950/20'
      };
    case 'EXPIRED':
      return {
        label: 'Expired',
        color: 'text-rose-500',
        bgColor: 'bg-rose-50',
        darkBgColor: 'dark:bg-rose-950/20'
      };
    case 'FAILED':
      return {
        label: 'Failed',
        color: 'text-rose-500',
        bgColor: 'bg-rose-50',
        darkBgColor: 'dark:bg-rose-950/20'
      };
    case 'REFUNDED':
      return {
        label: 'Refunded',
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        darkBgColor: 'dark:bg-purple-950/20'
      };
    default:
      return {
        label: status || 'Unknown',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        darkBgColor: 'dark:bg-gray-950/20'
      };
  }
}

// Return transaction status display
export function getTransactionStatusDisplay(status) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending',
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        darkBgColor: 'dark:bg-amber-950/20'
      };
    case 'PROCESSING':
      return {
        label: 'Processing',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50', 
        darkBgColor: 'dark:bg-blue-950/20'
      };
    case 'SUCCESS':
      return {
        label: 'Success',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        darkBgColor: 'dark:bg-emerald-950/20'
      };
    case 'FAILED':
      return {
        label: 'Failed',
        color: 'text-rose-500',
        bgColor: 'bg-rose-50',
        darkBgColor: 'dark:bg-rose-950/20'
      };
    default:
      return {
        label: status || 'Unknown',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        darkBgColor: 'dark:bg-gray-950/20'
      };
  }
}

// Convert provider status to display
export function getProviderStatusDisplay(status) {
  switch (status?.toLowerCase()) {
    case 'success':
      return {
        label: 'Success',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        darkBgColor: 'dark:bg-emerald-950/20'
      };
    case 'error':
    case 'failed':
      return {
        label: 'Failed',
        color: 'text-rose-500',
        bgColor: 'bg-rose-50',
        darkBgColor: 'dark:bg-rose-950/20'
      };
    case 'processing':
      return {
        label: 'Processing',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        darkBgColor: 'dark:bg-blue-950/20'
      };
    case 'pending':
      return {
        label: 'Pending',
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        darkBgColor: 'dark:bg-amber-950/20'
      };
    default:
      return {
        label: status || 'Unknown',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        darkBgColor: 'dark:bg-gray-950/20'
      };
  }
}