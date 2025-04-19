// src/app/api/orders/[orderNumber]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { orderNumber } = await params;
    const session = await getServerSession(authOptions);
    
    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                game: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    icon: true
                  }
                }
              }
            }
          }
        },
        payment: true,
        transaction: true,
        user: session ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : false
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this order
    // If session exists and user is not admin, check if order belongs to user
    if (session && session.user && session.user.role !== 'ADMIN') {
      if (order.userId && order.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 403 }
        );
      }
      
      // For non-logged-in orders, check if email matches
      if (!order.userId && order.customerEmail !== session.user.email) {
        // Allow if they can provide the correct customer email
        const { searchParams } = new URL(request.url);
        const verifyEmail = searchParams.get('email');
        
        if (!verifyEmail || verifyEmail !== order.customerEmail) {
          return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 403 }
          );
        }
      }
    }
    
    // Prepare response data
    const responseData = {
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      gameData: order.gameData,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        game: item.product.game
      })),
      payment: order.payment ? {
        status: order.payment.status,
        method: order.payment.method,
        amount: order.payment.amount,
        paymentUrl: order.payment.paymentUrl,
        paymentCode: order.payment.paymentCode,
        paymentData: order.payment.paymentData,
        paidAt: order.payment.paidAt,
        expiredAt: order.payment.expiredAt
      } : null,
      transaction: order.transaction ? {
        transactionCode: order.transaction.transactionCode,
        status: order.transaction.status,
        providerRef: order.transaction.providerRef,
        responseData: order.transaction.responseData,
        createdAt: order.transaction.createdAt,
        updatedAt: order.transaction.updatedAt
      } : null
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch order details" 
      }, 
      { status: 500 }
    );
  }
}