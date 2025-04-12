// src/app/api/orders/process/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { orderVipaymentProduct } from '@/services/provider/vippayment.service';
import { generateTransactionCode } from '@/lib/utils';
import { z } from 'zod';

export async function POST(request) {
  try {
    // Get session if user is logged in
    const session = await getServerSession(authOptions);
    
    const body = await request.json();
    
    // Validate request body
    const orderSchema = z.object({
      orderNumber: z.string().min(1, { message: "Order number is required" }),
      productId: z.string().min(1, { message: "Product ID is required" }),
      gameData: z.object({
        userId: z.string().min(1, { message: "User ID is required" }),
        serverId: z.string().optional(),
        username: z.string().optional(),
      }).strict(),
    });
    
    const result = orderSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed", 
          errors: result.error.errors 
        }, 
        { status: 400 }
      );
    }
    
    const { orderNumber, productId, gameData } = result.data;
    
    // Check if order exists and is ready for processing
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        payment: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    
    // Check if payment status is successful
    if (!order.payment || order.payment.status !== 'SUCCESS') {
      return NextResponse.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }
    
    // Check if order is already being processed or completed
    if (order.status === 'PROCESSING' || order.status === 'COMPLETED') {
      // Check if there's already a transaction
      const existingTransaction = await prisma.transaction.findUnique({
        where: { orderId: order.id }
      });
      
      if (existingTransaction) {
        return NextResponse.json({
          success: true,
          message: "Order is already being processed",
          data: {
            orderNumber,
            transactionCode: existingTransaction.transactionCode,
            status: order.status,
            providerRef: existingTransaction.providerRef
          }
        });
      }
    }
    
    // Find the product in order items
    const orderItem = order.items.find(item => item.productId === productId);
    
    if (!orderItem) {
      return NextResponse.json(
        { success: false, message: "Product not found in order" },
        { status: 400 }
      );
    }
    
    // Update order status to PROCESSING
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'PROCESSING',
        gameData: gameData
      }
    });
    
    // Generate transaction code
    const transactionCode = generateTransactionCode();
    
    // Create transaction record in PENDING state
    const transaction = await prisma.transaction.create({
      data: {
        transactionCode,
        orderId: order.id,
        type: 'PURCHASE',
        amount: order.totalAmount,
        status: 'PENDING',
        gameData: gameData,
      }
    });
    
    // Process order with provider
    const providerResponse = await orderVipaymentProduct({
      providerCode: orderItem.product.providerCode,
      userId: gameData.userId,
      zoneId: gameData.serverId,
      endpoint: 'game-feature'
    });
    
    // Update transaction with provider response
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'PROCESSING',
        providerRef: providerResponse.trxid || null,
        providerData: providerResponse
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Order processing initiated",
      data: {
        orderNumber,
        transactionCode,
        status: 'PROCESSING',
        providerRef: updatedTransaction.providerRef,
        providerData: providerResponse
      }
    });
    
  } catch (error) {
    console.error('Error processing order:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to process order", 
      }, 
      { status: 500 }
    );
  }
}