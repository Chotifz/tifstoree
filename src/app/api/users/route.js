import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {  getUsers } from '@/services/user/user.service';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    
    const result = await getUsers({ page, limit, search, role });
    
    return NextResponse.json({
      success: true,
      users: result.users,
      pagination: result.pagination,
    });
    
  } catch (error) {
    console.error("Error fetching users:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch users", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

