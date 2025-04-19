import { prisma } from '@/lib/prisma';
import { generateOrderNumber, generateTransactionCode } from '@/lib/utils';
import { orderVipaymentProduct, checVipaymentkNickname, checkVipaymentTrxStatus } from '@/services/provider/vippayment.service';
import {createTransaction as createMidtransTransaction, createSnapToken, getMidtransClientKey } from '../payment/midtrans.service';


export async function processCheckout({
  productId,
  userId,
  customerEmail,
  customerName,
  customerPhone,
  gameData,
  }) {
  try {
    // 1. Validate product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.providerStatus !== 'available') {
      throw new Error('Product is currently not available');
    }

    // 2. Verify game account if required
    if (gameData?.userId) {
      try {
        const nicknameResult = await checVipaymentkNickname({
          gameCode: product.game.slug,
          userId: gameData.userId,
          zoneId: gameData.serverId,
        });

        if (!nicknameResult.success) {
          throw new Error('Failed to verify game account');
        }

        gameData.username = nicknameResult.nickname;
      } catch (error) {
        throw new Error(`Game account verification failed: ${error.message}`);
      }
    }

    // 3. Create order
    const orderNumber = generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerEmail,
        customerName,
        customerPhone,
        totalAmount: product.discountPrice || product.price,
        gameData,
        status: 'PENDING',
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            price: product.discountPrice || product.price,
            gameData,
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

     // 4. Create Midtrans Snap token
     const snapToken = await createSnapToken({
      orderNumber: order.orderNumber,
      productName: product.name,
      price: product.discountPrice || product.price,
      quantity: 1,
      gameData,
      email: customerEmail,
    });

    // 5. Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        status: 'PENDING',
        method: 'MIDTRANS',
        paymentProvider: 'MIDTRANS',
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

     // 6. Create initial transaction record
     const transaction = await prisma.transaction.create({
      data: {
        transactionCode: generateTransactionCode(),
        orderId: order.id,
        type: 'PURCHASE',
        amount: order.totalAmount,
        status: 'PENDING',
        gameData,
      }
    });
    
    return {
      success: true,
      order,
      payment,
      transaction,
      snapToken,
    };

  } catch (error) {
    console.error('Checkout process failed:', error);
    throw error;
  }
}

export async function processVipaymentOrder(orderId) {
  try {
    // 1. Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        payment: true,
        transaction: true,
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING' || order.payment?.status !== 'SUCCESS') {
      throw new Error('Order is not ready for processing');
    }

    // 2. Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' }
    });

    // 3. Process with VIPayment
    const orderItem = order.items[0]; // Assuming single item orders for now
    const providerResponse = await orderVipaymentProduct({
      providerCode: orderItem.product.providerCode,
      userId: order.gameData.userId,
      zoneId: order.gameData.serverId,
      endpoint: 'game-feature'
    });

    // 4. Update transaction with provider response
    const updatedTransaction = await prisma.transaction.update({
      where: { id: order.transaction.id },
      data: {
        status: 'PROCESSING',
        providerRef: providerResponse.trxid,
        providerData: providerResponse,
      }
    });

    // 5. Update order with provider data
    await prisma.order.update({
      where: { id: order.id },
      data: {
        providerOrderId: providerResponse.trxid,
        providerData: providerResponse,
      }
    });

    return {
      success: true,
      order,
      transaction: updatedTransaction,
      providerResponse,
    };

  } catch (error) {
    // Handle failure
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'FAILED',
        retryCount: {
          increment: 1
        }
      }
    });

    await prisma.transaction.update({
      where: { orderId },
      data: {
        status: 'FAILED',
        failedReason: error.message,
      }
    });

    throw error;
  }
}

export async function checkVipaymentOrderStatus(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      transaction: true,
    }
  });

  if (!order || !order.providerOrderId) {
    throw new Error('Order not found or no provider order ID');
  }

  try {
    const statusResponse = await checkVipaymentTrxStatus({
      trxId: order.providerOrderId,
      endpoint: 'game-feature'
    });

    // Update status based on provider response
    let orderStatus = order.status;
    let transactionStatus = order.transaction.status;

    if (statusResponse.status === 'success') {
      orderStatus = 'COMPLETED';
      transactionStatus = 'SUCCESS';
    } else if (statusResponse.status === 'failed') {
      orderStatus = 'FAILED';
      transactionStatus = 'FAILED';
    }

    // Update order and transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { 
          status: orderStatus,
          providerData: statusResponse
        }
      }),
      prisma.transaction.update({
        where: { orderId },
        data: {
          status: transactionStatus,
          responseData: statusResponse
        }
      })
    ]);

    return {
      success: true,
      orderStatus,
      transactionStatus,
      providerStatus: statusResponse
    };

  } catch (error) {
    console.error('Error checking order status:', error);
    throw error;
  }
}