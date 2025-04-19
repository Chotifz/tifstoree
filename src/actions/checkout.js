'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processCheckout, processVipaymentOrder } from '@/services/checkout/checkout.service';
import { z } from 'zod';
import { orderVipaymentProduct } from '@/services/provider/vippayment.service';

const checkoutSchema = z.object({
  productId: z.string().min(1),
  gameData: z.object({
    userId: z.string().min(1),
    serverId: z.string().optional(),
    username: z.string().optional(),
  }),
  customerEmail: z.union([
    z.string().email(),
    z.literal(""),
    z.undefined(),
  ]),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

export async function createCheckout(formData) {
  try {
    // 1. 
    const validatedData = checkoutSchema.parse(formData);

    // 2. if user is logged in
    const session = await getServerSession(authOptions);
    
    // 3. 
    const checkoutResult = await processCheckout({
      ...validatedData,
      userId: session?.user?.id,
    });

    return {
      success: checkoutResult.success,
      orderNumber: checkoutResult.order.orderNumber,
      payment: checkoutResult.payment,
      transaction: checkoutResult.transaction,
      token: checkoutResult.snapToken

    };

  } catch (error) {
    console.error('Checkout error:', error);
    
    return {
      success: false,
      message: error.message || 'Checkout failed',
    };
  }
}

export async function processGameOrder(orderNumber) {
  try {
    // 1. Get the order from database
    const order = await prisma.order.findUnique({
      where: { orderNumber },
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

      // 2. Verify payment status (you might want to verify with Midtrans here)
      if (order.payment?.status !== 'SUCCESS') {
        // Update payment status if needed
        await prisma.payment.update({
          where: { orderId: order.id },
          data: { status: 'SUCCESS', paidAt: new Date() }
        });
      }

    
        // 3. Update order status to PROCESSING
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PROCESSING' }
        });
    
         // 4. Get the order item (product) details
        const orderItem = order.items[0]; // Assuming single item orders for now
    
      // 5. Process with VIPayment directly
      const providerResponse = await orderVipaymentProduct({
        providerCode: orderItem.product.providerCode,
        userId: order.gameData.userId,
        zoneId: order.gameData.serverId,
        endpoint: 'game-feature'
      });

    // 6. Update or create transaction with provider response
    let transaction = order.transaction;
    
    if (transaction) {
      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'PROCESSING',
          providerRef: providerResponse.trxid || null,
          providerData: providerResponse
        }
      });
    } else {
      transaction = await prisma.transaction.create({
        data: {
          transactionCode: generateTransactionCode(),
          orderId: order.id,
          type: 'PURCHASE',
          amount: order.totalAmount,
          status: 'PROCESSING',
          providerRef: providerResponse.trxid || null,
          providerData: providerResponse,
          gameData: order.gameData
        }
      });
    }

    // 7. Update order with provider data
    await prisma.order.update({
      where: { id: order.id },
      data: {
        providerOrderId: providerResponse.trxid || null,
        providerData: providerResponse,
      }
    });
    // 8. Revalidate relevant paths
    revalidatePath(`/orders/${orderNumber}`);
    revalidatePath('/orders');

    return {
      success: true,
      order: result.order,
      transaction: result.transaction,
    };

  } catch (error) {
    console.error('Process order error:', error);
  
       if (orderNumber) {
        try {
          const order = await prisma.order.findUnique({
            where: { orderNumber },
            select: { id: true }
          });
          
          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'FAILED',
                retryCount: { increment: 1 }
              }
            });
            
            const transaction = await prisma.transaction.findUnique({
              where: { orderId: order.id }
            });
            
            if (transaction) {
              await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                  status: 'FAILED',
                  failedReason: error.message,
                }
              });
            }
          }
        } catch (updateError) {
          console.error('Error updating failed status:', updateError);
        }
      }
      
    return {
      success: false,
      message: error.message || 'Failed to process order',
    };
  }
}