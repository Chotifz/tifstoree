'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processCheckout, processVipaymentOrder } from '@/services/checkout/checkout.service';
import { z } from 'zod';

const checkoutSchema = z.object({
  productId: z.string().min(1),
  gameData: z.object({
    userId: z.string().min(1),
    serverId: z.string().optional(),
    username: z.string().optional(),
  }),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

export async function createCheckout(formData) {
  try {
    // 1. Validate input
    const validatedData = checkoutSchema.parse(formData);

    // 2. Get session if user is logged in
    const session = await getServerSession(authOptions);
    
    // 3. Process checkout
    const checkoutResult = await processCheckout({
      ...validatedData,
      userId: session?.user?.id,
    });

    return {
      success: checkoutResult.success,
      orderNumber: checkoutResult.order,
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
    // 1. Get session and check authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    // 2. Process order with VIPayment
    const result = await processVipaymentOrder(orderNumber);

    // 3. Revalidate paths
    revalidatePath(`/orders/${orderNumber}`);
    revalidatePath('/orders');

    return {
      success: true,
      order: result.order,
      transaction: result.transaction,
    };

  } catch (error) {
    console.error('Process order error:', error);
    
    return {
      success: false,
      message: error.message || 'Failed to process order',
    };
  }
}