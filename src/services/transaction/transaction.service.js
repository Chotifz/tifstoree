// src/services/transaction/transaction.service.js
import { prisma } from '@/lib/prisma';
import { generateTransactionCode } from '@/lib/utils';


export async function processGameTransaction(order) {
  try {
    console.log(`Processing game transaction for order: ${order.orderNumber}`);
    
    // Only process if order status is correct
    if (order.status !== 'PROCESSING' && order.payment.status !== 'SUCCESS') {
      throw new Error('Order is not ready for processing');
    }
    
    // Check for existing transaction
    const existingTransaction = await prisma.transaction.findUnique({
      where: { orderId: order.id }
    });
    
    if (existingTransaction) {
      console.log(`Transaction already exists for order: ${order.orderNumber}`);
      return existingTransaction;
    }
    
    // Generate transaction code
    const transactionCode = generateTransactionCode();
    
    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        transactionCode,
        orderId: order.id,
        type: 'PURCHASE',
        amount: order.totalAmount,
        status: 'PENDING',
        gameData: order.gameData,
      }
    });
    
    // In a real application, this is where you would call the game API
    // to process the transaction (e.g., send diamonds, credits, etc.)
    const gameProductResult = await processGameProduct(order, transaction);
    
    // Update transaction with result
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'SUCCESS',
        responseData: gameProductResult,
        providerData: {
          processed: true,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    // Update order status to COMPLETED
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED' }
    });
    
    return updatedTransaction;
  } catch (error) {
    console.error('Error processing game transaction:', error);
    
    // If transaction record exists, update it with failure
    if (error.transactionId) {
      await prisma.transaction.update({
        where: { id: error.transactionId },
        data: {
          status: 'FAILED',
          failedReason: error.message
        }
      });
    }
    
    throw error;
  }
}

/**
 * Process game product (mock implementation)
 * This would actually call the game API in a real implementation
 * @param {Object} order - Order data
 * @param {Object} transaction - Transaction record
 * @returns {Promise<Object>} Game API response
 */
async function processGameProduct(order, transaction) {
  // In a real application, this would make API calls to the game provider
  // For this example, we'll simulate a successful response
  
  console.log(`Simulating game API call for order: ${order.orderNumber}`);
  
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get game details
  const gameItem = order.items[0]; // Assuming one item per order for simplicity
  const gameData = order.gameData;
  
  // Mock successful response
  return {
    success: true,
    productDelivered: true,
    productDetails: {
      name: gameItem.product.name,
      quantity: gameItem.quantity,
      gameId: gameData.userId,
      serverId: gameData.serverId,
      deliveryTime: new Date().toISOString()
    },
    message: 'Product successfully delivered to account'
  };
}
export async function getTransactionStatus(orderNumber) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      transaction: true,
      payment: true
    }
  });
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  return {
    orderStatus: order.status,
    paymentStatus: order.payment?.status || 'PENDING',
    transactionStatus: order.transaction?.status || null,
    isComplete: order.status === 'COMPLETED'
  };
}
export async function getTransactionByCode(transactionCode) {
  const transaction = await prisma.transaction.findUnique({
    where: { transactionCode },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true
            }
          },
          payment: true
        }
      }
    }
  });
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  return transaction;
}