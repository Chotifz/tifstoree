// src/app/api/orders/status/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkVipaymentTrxStatus } from '@/services/provider/vippayment.service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const trxId = searchParams.get('trxId');
    
    if (!orderNumber && !trxId) {
      return NextResponse.json(
        { success: false, message: "Order number or transaction ID is required" },
        { status: 400 }
      );
    }

    // If we have an order number, get the transaction ID from our database
    let transactionId = trxId;
    let orderInfo = null;
    
    if (orderNumber) {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          transaction: true,
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
      
      orderInfo = order;
      
      if (order.transaction?.providerRef) {
        transactionId = order.transaction.providerRef;
      }
    }
    
    // If we don't have a transaction ID even after checking our database, 
    // we can't check the status with the provider
    if (!transactionId) {
      return NextResponse.json({
        success: true,
        message: "Order found but not yet processed with provider",
        data: {
          orderNumber: orderInfo.orderNumber,
          status: orderInfo.status,
          paymentStatus: orderInfo.payment?.status || 'PENDING',
          items: orderInfo.items,
          createdAt: orderInfo.createdAt
        }
      });
    }
    
    // Check status with the provider
    const providerStatus = await checkVipaymentTrxStatus({
      trxId: transactionId,
      endpoint: 'game-feature'
    });
    
    // Combine data from our database and provider response
    const responseData = {
      orderNumber: orderInfo?.orderNumber,
      trxId: transactionId,
      providerData: providerStatus,
      status: orderInfo?.status,
      paymentStatus: orderInfo?.payment?.status,
      transactionStatus: orderInfo?.transaction?.status,
      items: orderInfo?.items || [],
      createdAt: orderInfo?.createdAt
    };
    
    // Update our database with the latest status from provider if needed
    if (providerStatus && providerStatus[0] && orderInfo?.transaction) {
      const providerTrx = providerStatus[0];
      let newStatus = orderInfo.transaction.status;
      
      // Map provider status to our status
      if (providerTrx.status === 'success') {
        newStatus = 'SUCCESS';
      } else if (providerTrx.status === 'error' || providerTrx.status === 'failed') {
        newStatus = 'FAILED';
      } else if (providerTrx.status === 'processing') {
        newStatus = 'PROCESSING';
      }
      
      // Only update if status changed
      if (newStatus !== orderInfo.transaction.status) {
        await prisma.transaction.update({
          where: { id: orderInfo.transaction.id },
          data: {
            status: newStatus,
            responseData: providerTrx
          }
        });
        
        // If transaction successful, also update order status
        if (newStatus === 'SUCCESS') {
          await prisma.order.update({
            where: { id: orderInfo.id },
            data: { status: 'COMPLETED' }
          });
        } else if (newStatus === 'FAILED') {
          await prisma.order.update({
            where: { id: orderInfo.id },
            data: { status: 'FAILED' }
          });
        }
        
        responseData.transactionStatus = newStatus;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('Error checking order status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to check order status", 
      }, 
      { status: 500 }
    );
  }
}