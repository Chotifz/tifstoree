// src/app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateUser, updateUserRole } from '@/services/user/user.service';
import { z } from 'zod';

export async function GET(request, { params }) {
  try {
    // Get session from NextAuth
    // const session = await getServerSession(authOptions);
    
    // if (!session || !session.user) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }
    
    const { id } = params;
    
    // Check if requesting user is admin or requesting their own data
    const isAdmin = session.user.role === 'ADMIN';
    const isSelfRequest = session.user.id === id;
    
    if (!isAdmin && !isSelfRequest) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }
    
    // Define which fields to select based on user role
    let select = {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    };
    
    // Add more fields for admins
    if (isAdmin) {
      select = {
        ...select,
        address: true,
        emailVerified: true,
        image: true,
      };
    }
    
    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id },
      select,
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Return user data
    return NextResponse.json({
      success: true,
      user,
    });
    
  } catch (error) {
    console.error("Error fetching user:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch user", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
    try {
      // Get session from NextAuth
      const session = await getServerSession(authOptions);
      
      if (!session || !session.user) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }
      
      const { id } = params;
      
      // Check if requesting user is admin or updating their own data
      const isAdmin = session.user.role === 'ADMIN';
      const isSelfUpdate = session.user.id === id;
      
      if (!isAdmin && !isSelfUpdate) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }
      
      // Parse request body
      const body = await request.json();
      
      // Define validation schema
      const userUpdateSchema = z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        image: z.string().optional(),
        role: z.enum(['USER', 'ADMIN', 'RESELLER']).optional(),
      });
      
      // Validate request data
      const result = userUpdateSchema.safeParse(body);
      
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
      
      let updatedUser;
      
      // Handle role update separately (admin only)
      if (result.data.role && isAdmin) {
        // Check if trying to update the role of the last admin
        if (id !== session.user.id && result.data.role !== 'ADMIN') {
          const user = await prisma.user.findUnique({
            where: { id },
            select: { role: true },
          });
          
          if (user.role === 'ADMIN') {
            // Count remaining admins
            const adminCount = await prisma.user.count({
              where: { role: 'ADMIN' },
            });
            
            if (adminCount <= 1) {
              return NextResponse.json(
                { success: false, message: "Cannot remove the last admin" },
                { status: 400 }
              );
            }
          }
        }
        
        updatedUser = await updateUserRole(id, result.data.role);
      } else {
        // Remove role from data if it exists and user is not admin
        const { role, ...updateData } = result.data;
        updatedUser = await updateUser(id, updateData);
      }
      
      // Return updated user
      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
      
    } catch (error) {
      console.error("Error updating user:", error);
      
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to update user", 
          error: error.message 
        }, 
        { status: 500 }
      );
    }
  }