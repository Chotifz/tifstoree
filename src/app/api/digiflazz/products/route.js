// src/app/api/providers/digiflazz/products/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchDigiflazzProducts, syncWithDatabase } from '@/services/provider/digiflazz.service';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Dapatkan parameter dari query
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    
    // Ambil produk dari Digiflazz dan sinkronkan dengan database
    const products = await fetchDigiflazzProducts({ category, type });
    await syncWithDatabase(products);
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching Digiflazz products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}