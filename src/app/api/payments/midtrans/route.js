// src/app/api/payments/midtrans/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTransaction } from '@/services/payment/midtrans.service';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { orderId, paymentMethod } = await request.json();
    
    // Dapatkan order dari database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    // Buat transaksi Midtrans
    const transaction = await createTransaction(order, paymentMethod);
    
    // Update order dengan payment info
    await prisma.payment.create({
      data: {
        amount: order.totalAmount,
        method: paymentMethod,
        midtransId: transaction.transaction_id,
        paymentUrl: transaction.redirect_url,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
        orders: {
          connect: { id: orderId }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      redirectUrl: transaction.redirect_url,
      transactionId: transaction.transaction_id
    });
  } catch (error) {
    console.error('Error creating Midtrans transaction:', error);
    return NextResponse.json(
      { message: 'Failed to create transaction', error: error.message },
      { status: 500 }
    );
  }
}