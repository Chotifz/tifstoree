// src/app/api/checkout/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTransaction } from '@/services/payment/midtrans.service';
import { generateOrderNumber } from '@/lib/utils';

/**
 * Create a checkout session and payment link
 */
export async function POST(request) {
  try {
    // Get user session (optional, can checkout as guest)
    const session = await getServerSession(authOptions);
    
    // Parse request body
    const body = await request.json();
    const { 
      productId, 
      gameData, 
      quantity = 1, 
      paymentMethod,
      customerData
    } = body;
    
    // Validate required fields
    if (!productId || !paymentMethod || !gameData) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get product details from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        game: {
          select: { id: true, name: true, slug: true }
        },
        category: {
          select: { id: true, name: true }
        }
      }
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    
    // Check if product is active
    if (!product.isActive) {
      return NextResponse.json(
        { success: false, message: "Product is not available" },
        { status: 400 }
      );
    }
    
    // Calculate order amount
    const productPrice = product.discountPrice || product.price;
    let totalAmount = productPrice * quantity;
    
    // Add admin fee based on payment method (if applicable)
    const adminFee = getAdminFee(paymentMethod);
    if (adminFee > 0) {
      totalAmount += adminFee;
    }
    
    // Generate unique order number
    const orderNumber = generateOrderNumber();
    
    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        customerName: customerData?.name || session?.user?.name || null,
        customerEmail: customerData?.email || session?.user?.email || '',
        customerPhone: customerData?.phone || null,
        totalAmount,
        status: 'PENDING',
        gameData: gameData,
        items: {
          create: {
            productId: product.id,
            quantity,
            price: productPrice,
            gameData: gameData
          }
        },
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    // Create transaction in Midtrans
    const transaction = await createTransaction(order, paymentMethod);
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        status: 'PENDING',
        method: paymentMethod,
        paymentProvider: 'MIDTRANS',
        transactionId: transaction.transaction_id,
        paymentUrl: transaction.redirect_url,
        paymentCode: transaction.va_number || transaction.payment_code || null,
        paymentData: transaction,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });
    
    // Return success response with payment information
    return NextResponse.json({
      success: true,
      message: "Checkout successful",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentUrl: transaction.redirect_url,
        paymentDetails: {
          paymentMethod,
          ...getPaymentInstructions(transaction, paymentMethod)
        },
        expiresAt: payment.expiredAt
      }
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to process checkout", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

/**
 * Get admin fee based on payment method
 * @param {string} paymentMethod 
 * @returns {number} Admin fee amount
 */
function getAdminFee(paymentMethod) {
  // Different payment methods may have different admin fees
  const adminFees = {
    'bca': 4000,
    'bni': 4000,
    'bri': 4000,
    'mandiri': 4000,
    'permata': 4000,
    'gopay': 2000,
    'shopeepay': 2000,
    'dana': 2000,
    'ovo': 2000,
    'qris': 2000,
    'alfamart': 5000,
    'indomaret': 5000,
    'cc': 0, // Credit card handled differently
  };
  
  return adminFees[paymentMethod.toLowerCase()] || 0;
}

/**
 * Get payment instructions based on payment method and transaction data
 * @param {Object} transaction - Transaction data from Midtrans
 * @param {string} paymentMethod - Payment method
 * @returns {Object} Payment instructions
 */
function getPaymentInstructions(transaction, paymentMethod) {
  const instructions = {};
  
  switch (paymentMethod.toLowerCase()) {
    case 'bca':
    case 'bni':
    case 'bri':
    case 'mandiri':
    case 'permata':
      instructions.type = 'va';
      instructions.bankName = paymentMethod.toUpperCase();
      instructions.vaNumber = transaction.va_number;
      break;
    
    case 'gopay':
    case 'shopeepay':
      instructions.type = 'ewallet';
      instructions.qrCodeUrl = transaction.qr_code_url;
      break;
    
    case 'dana':
    case 'ovo':
    case 'qris':
      instructions.type = 'qris';
      instructions.qrCodeUrl = transaction.qr_code_url;
      break;
    
    case 'alfamart':
    case 'indomaret':
      instructions.type = 'cstore';
      instructions.storeName = paymentMethod.toUpperCase();
      instructions.paymentCode = transaction.payment_code;
      break;
  }
  
  return instructions;
}