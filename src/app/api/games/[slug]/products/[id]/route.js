// src/app/api/games/[slug]/products/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Admin access check
const checkAdminAccess = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { isAdmin: false, error: NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    )};
  }
  
  if (session.user.role !== 'ADMIN') {
    return { isAdmin: false, error: NextResponse.json(
      { success: false, message: "Forbidden: Admin access required" },
      { status: 403 }
    )};
  }
  
  return { isAdmin: true, session };
};

// Get product by ID
export async function GET(request, { params }) {
  try {
    const { slug, id } = params;
    
    // Find the game first to validate the slug
    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Find the product
    const product = await prisma.product.findUnique({
      where: { 
        id,
        gameId: game.id // Ensuring the product belongs to the game
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product,
    });
    
  } catch (error) {
    console.error('Error fetching product:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch product', 
        error: error.message,
      }, 
      { status: 500 }
    );
  }
}

// Update product by ID
export async function PATCH(request, { params }) {
  try {
    // Check admin access
    const { isAdmin, error } = await checkAdminAccess();
    if (!isAdmin) return error;
    
    const { slug, id } = params;
    const body = await request.json();
    
    // Check for special actions
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Find the game first to validate the slug
    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Check if the product exists and belongs to the game
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        gameId: game.id
      }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found for this game' },
        { status: 404 }
      );
    }
    
    // Handle special action: toggle active status
    if (action === 'toggleActive') {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: { isActive: !existingProduct.isActive },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });
      
      return NextResponse.json({
        success: true,
        message: `Product ${updatedProduct.isActive ? 'activated' : 'deactivated'} successfully`,
        product: updatedProduct,
      });
    }
    
    // Regular update
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: body,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to update product", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Delete product by ID
export async function DELETE(request, { params }) {
  try {
    // Check admin access
    const { isAdmin, error } = await checkAdminAccess();
    if (!isAdmin) return error;
    
    const { slug, id } = params;
    
    // Find the game first to validate the slug
    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Check if the product exists and belongs to the game
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        gameId: game.id
      }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found for this game' },
        { status: 404 }
      );
    }
    
    // Check if product is used in orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id },
    });
    
    if (orderCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete product that has been ordered' },
        { status: 400 }
      );
    }
    
    // Delete the product
    await prisma.product.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete product", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}