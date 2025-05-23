import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  getProductsByGame, 
  createProduct 
} from '@/services/product/product.service';
import { z } from 'zod';

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);

    const options = {
      categoryId: searchParams.get('categoryId'),
      page: searchParams.get('page') ? parseInt(searchParams.get('page'), 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : 60,
      search: searchParams.get('search') || '',
      sortBy: searchParams.get('sortBy') || 'price',
      sortOrder: searchParams.get('sortOrder') || 'asc',
    };

    const { products, pagination, game } = await getProductsByGame(slug, options);

    return NextResponse.json({
      success: true,
      products,
      pagination,
      game,
    });

  } catch (error) {
    console.error('Error fetching game products:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      },
      { status: 500 }
    );
  }
}


export async function POST(request, { params }) {
  try {

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }
    
    const { slug } = params;
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
    
      const productSchema = z.object({
      name: z.string().min(1, { message: "Name is required" }),
      description: z.string().optional(),
      basePrice: z.number().min(0).optional(),
      price: z.number().min(0),
      discountPrice: z.number().min(0).optional().nullable(),
      markupPercentage: z.number().min(0).optional().default(10),
      providerCode: z.string().optional(),
      providerGame: z.string().optional(),
      providerServer: z.string().optional(),
      providerStatus: z.string().optional(),
      requiredFields: z.any().optional(),
      instructionText: z.string().optional(),
      sorting: z.number().optional(),
      stock: z.number().optional().nullable(),
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
    
    const product = await createProduct({
      ...result.data,
      gameId: game.id,
    });
    
    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating product:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create product", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}