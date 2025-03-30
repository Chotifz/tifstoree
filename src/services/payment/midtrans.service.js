// src/services/payment/midtrans.service.js
import axios from 'axios';
import crypto from 'crypto';

// Midtrans Configuration
const isSandbox = process.env.MIDTRANS_SANDBOX === 'true';
const baseUrl = isSandbox 
  ? 'https://api.sandbox.midtrans.com' 
  : 'https://api.midtrans.com';
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;
const merchantId = process.env.MIDTRANS_MERCHANT_ID;

// Base64 encoded authentication string
const authString = Buffer.from(`${serverKey}:`).toString('base64');

/**
 * Create transaction in Midtrans
 * @param {Object} order - Order object from database
 * @param {string} paymentMethod - Payment method type (bank_transfer, gopay, etc)
 * @returns {Promise<Object>} Midtrans transaction data
 */
export async function createTransaction(order, paymentMethod) {
  try {
    // Format payment type and bank/channel based on method
    const paymentType = getPaymentType(paymentMethod);
    const paymentDetails = getPaymentDetails(paymentMethod, paymentType);
    
    // Get customer details
    const customerDetails = {
      first_name: order.customerName || order.user?.name || 'Customer',
      email: order.customerEmail,
      phone: order.customerPhone || '',
    };
    
    // Format item details
    const itemDetails = order.items.map(item => ({
      id: item.productId,
      price: item.price,
      quantity: item.quantity,
      name: item.product.name,
    }));
    
    // Add admin fee if applicable
    if (order.adminFee > 0) {
      itemDetails.push({
        id: 'admin-fee',
        price: order.adminFee,
        quantity: 1,
        name: 'Biaya Admin',
      });
    }
    
    // Create transaction payload
    const transactionData = {
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: order.totalAmount,
      },
      customer_details: customerDetails,
      item_details: itemDetails,
      ...paymentDetails,
    };
    
    console.log('Creating Midtrans transaction with payload:', JSON.stringify(transactionData));
    
    // Call Midtrans API to create transaction
    const response = await axios.post(
      `${baseUrl}/v2/charge`,
      transactionData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
      }
    );
    
    console.log('Midtrans transaction created:', response.data);
    
    return {
      transaction_id: response.data.transaction_id,
      order_id: response.data.order_id,
      payment_type: response.data.payment_type,
      redirect_url: getRedirectUrl(response.data, paymentMethod),
      status_code: response.data.status_code,
      ...getAdditionalResponseData(response.data, paymentMethod),
    };
  } catch (error) {
    console.error('Error creating Midtrans transaction:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create transaction');
  }
}

/**
 * Get payment type for Midtrans
 * @param {string} method - Payment method selected by user
 * @returns {string} Midtrans payment type
 */
function getPaymentType(method) {
  const paymentTypes = {
    bca: 'bank_transfer',
    bni: 'bank_transfer',
    bri: 'bank_transfer',
    mandiri: 'bank_transfer',
    permata: 'bank_transfer',
    gopay: 'gopay',
    shopeepay: 'shopeepay',
    dana: 'qris',
    ovo: 'qris',
    qris: 'qris',
    alfamart: 'cstore',
    indomaret: 'cstore',
    cc: 'credit_card',
  };
  
  return paymentTypes[method.toLowerCase()] || 'bank_transfer';
}

/**
 * Get payment details based on payment type
 * @param {string} method - Payment method selected by user
 * @param {string} paymentType - Midtrans payment type
 * @returns {Object} Payment details for Midtrans payload
 */
function getPaymentDetails(method, paymentType) {
  // Default payment detail structure
  let paymentDetails = {
    payment_type: paymentType,
  };
  
  // Add specific details based on payment type
  switch (paymentType) {
    case 'bank_transfer':
      // Bank Transfer (Virtual Account)
      paymentDetails.bank_transfer = {
        bank: method.toLowerCase(),
      };
      break;
      
    case 'cstore':
      // Convenience Store
      paymentDetails.cstore = {
        store: method.toLowerCase(),
      };
      break;
      
    case 'gopay':
    case 'shopeepay':
      // E-wallets (GoPay, ShopeePay)
      paymentDetails[paymentType] = {
        enable_callback: true,
        callback_url: `${process.env.NEXTAUTH_URL}/payment/callback`,
      };
      break;
      
    case 'qris':
      // QRIS for DANA, OVO, etc
      paymentDetails.qris = {
        acquirer: 'gopay',
      };
      break;
      
    case 'credit_card':
      // Credit Card
      paymentDetails.credit_card = {
        secure: true,
      };
      break;
  }
  
  return paymentDetails;
}

/**
 * Get redirect URL from Midtrans response
 * @param {Object} responseData - Midtrans API response
 * @param {string} paymentMethod - Payment method
 * @returns {string} URL to redirect user for payment
 */
function getRedirectUrl(responseData, paymentMethod) {
  // For e-wallets, the redirect URL is in the actions array
  if (responseData.actions) {
    const redirectAction = responseData.actions.find(
      action => action.name === 'generate-qr-code' || action.name === 'deeplink-redirect'
    );
    
    if (redirectAction) {
      return redirectAction.url;
    }
  }
  
  // For most payment methods, direct to the Midtrans payment page
  return `${isSandbox ? 'https://app.sandbox.midtrans.com' : 'https://app.midtrans.com'}/snap/v2/vtweb/${responseData.token}`;
}

/**
 * Extract additional data from Midtrans response
 * @param {Object} responseData - Midtrans API response
 * @param {string} paymentMethod - Payment method
 * @returns {Object} Additional response data
 */
function getAdditionalResponseData(responseData, paymentMethod) {
  const additionalData = {};
  
  // Extract VA numbers for bank transfers
  if (responseData.va_numbers) {
    additionalData.va_number = responseData.va_numbers[0].va_number;
    additionalData.bank = responseData.va_numbers[0].bank;
  }
  
  // Extract payment code for convenience stores
  if (responseData.payment_code) {
    additionalData.payment_code = responseData.payment_code;
  }
  
  // Extract QR code URL for QRIS
  if (responseData.actions) {
    const qrAction = responseData.actions.find(action => action.name === 'generate-qr-code');
    if (qrAction) {
      additionalData.qr_code_url = qrAction.url;
    }
  }
  
  return additionalData;
}

/**
 * Verify notification from Midtrans
 * @param {Object} notificationBody - Notification payload from Midtrans
 * @returns {boolean} True if notification is valid
 */
export function verifyNotification(notificationBody) {
  // Extract necessary fields
  const { order_id, status_code, gross_amount, signature_key } = notificationBody;
  
  // Create signature key for verification
  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');
  
  // Verify signature
  return signature_key === expectedSignature;
}

/**
 * Get transaction status from Midtrans
 * @param {string} orderId - Order ID or transaction ID
 * @returns {Promise<Object>} Transaction status data
 */
export async function getTransactionStatus(orderId) {
  try {
    const response = await axios.get(
      `${baseUrl}/v2/${orderId}/status`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${authString}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error getting transaction status:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to get transaction status');
  }
}

/**
 * Handle status mapping between Midtrans and our system
 * @param {string} midtransStatus - Status from Midtrans
 * @returns {Object} Mapped status for our system
 */
export function mapTransactionStatus(midtransStatus) {
  const statusMapping = {
    'pending': { orderStatus: 'PENDING', paymentStatus: 'PENDING' },
    'capture': { orderStatus: 'PROCESSING', paymentStatus: 'SUCCESS' },
    'settlement': { orderStatus: 'PROCESSING', paymentStatus: 'SUCCESS' },
    'deny': { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' },
    'cancel': { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' },
    'expire': { orderStatus: 'CANCELLED', paymentStatus: 'EXPIRED' },
    'failure': { orderStatus: 'FAILED', paymentStatus: 'FAILED' },
    'refund': { orderStatus: 'REFUNDED', paymentStatus: 'REFUNDED' },
    'partial_refund': { orderStatus: 'REFUNDED', paymentStatus: 'REFUNDED' },
  };
  
  return statusMapping[midtransStatus] || { orderStatus: 'PENDING', paymentStatus: 'PENDING' };
}
export function getMidtransClientKey() {
  return clientKey;
}
export function isMidtransSandbox() {
  return isSandbox;
}