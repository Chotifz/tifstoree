// src/services/payment/checkout.service.js
import axios from '@/lib/axios';

export async function processCheckout(checkoutData) {
  try {
    const response = await axios.post('/api/checkout', checkoutData);
    return response.data;
  } catch (error) {
    console.error('Checkout error:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to process checkout'
    );
  }
}
export async function getOrderDetails(orderId) {
  try {
    const response = await axios.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to fetch order details'
    );
  }
}
export async function checkPaymentStatus(orderNumber) {
  try {
    const response = await axios.get(`/api/payments/status/${orderNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error.response?.data || error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to check payment status'
    );
  }
}
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function getPaymentMethodDetails(method) {
  const paymentMethods = {
    'bca': { 
      name: 'BCA Virtual Account', 
      icon: '/images/method/bca.png', 
      type: 'bank_transfer' 
    },
    'bni': { 
      name: 'BNI Virtual Account', 
      icon: '/images/method/bni.png', 
      type: 'bank_transfer' 
    },
    'bri': { 
      name: 'BRI Virtual Account', 
      icon: '/images/method/qbri2.png', 
      type: 'bank_transfer' 
    },
    'mandiri': { 
      name: 'Mandiri Virtual Account', 
      icon: '/images/method/mandiri.png', 
      type: 'bank_transfer' 
    },
    'permata': { 
      name: 'Permata Virtual Account', 
      icon: '/images/method/permata.png', 
      type: 'bank_transfer' 
    },
    'gopay': { 
      name: 'GoPay', 
      icon: '/images/method/gopay.png', 
      type: 'ewallet' 
    },
    'shopeepay': { 
      name: 'ShopeePay', 
      icon: '/images/method/shopeepay.png', 
      type: 'ewallet' 
    },
    'dana': { 
      name: 'DANA', 
      icon: '/images/method/dana.png', 
      type: 'qris' 
    },
    'ovo': { 
      name: 'OVO', 
      icon: '/images/method/ovo.png', 
      type: 'qris' 
    },
    'qris': { 
      name: 'QRIS', 
      icon: '/images/method/qqris.jpg', 
      type: 'qris' 
    },
    'alfamart': { 
      name: 'Alfamart', 
      icon: '/images/method/alfamart.png', 
      type: 'cstore' 
    },
    'indomaret': { 
      name: 'Indomaret', 
      icon: '/images/method/indomaret.png', 
      type: 'cstore' 
    },
  }};