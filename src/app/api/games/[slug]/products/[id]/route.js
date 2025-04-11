import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from '@/services/product/product.service';
import { z } from 'zod';

export async function GET(request, { params }) {
  try {
    const { slug, id } = params;
    
    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true }
    });
    
    if (!game) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }
    
    try {
      const product = await getProductById(id, game.id);
      
      return NextResponse.json({
        success: true,
        product,
        game: {
          id: game.id,
          name: game.name,
          slug: game.slug
        }
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return NextResponse.json(
          { success: false, message: 'Product not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
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

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }
    
    const { slug, id } = params;
    const body = await request.json();
    
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
    
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        gameId: game.id
      },
      select: { id: true }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found for this game' },
        { status: 404 }
      );
    }
    
      const productSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      basePrice: z.number().min(0).optional(),
      price: z.number().min(0).optional(),
      discountPrice: z.number().min(0).optional().nullable(),
      markupPercentage: z.number().min(0).optional(),
      providerCode: z.string().optional(),
      providerGame: z.string().optional(),
      providerServer: z.string().optional(),
      providerStatus: z.string().optional(),
      requiredFields: z.any().optional(),
      instructionText: z.string().optional(),
      sorting: z.number().optional(),
      stock: z.number().optional().nullable(),
      providerPrices: z.any().optional(),
      discountPercentage: z.number().min(0).max(100).optional(),
    });
    
    const result = productSchema.safeParse(body);
    
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
    
    const updatedProduct = await updateProduct(id, result.data);
    
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


export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }
    
    const { slug, id } = params;
    
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
    
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        gameId: game.id
      },
      select: { id: true }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found for this game' },
        { status: 404 }
      );
    }
    
    try {
      await deleteProduct(id);
      
      return NextResponse.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      if (error.message === 'Cannot delete product that has been ordered') {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
    
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