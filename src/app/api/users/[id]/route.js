import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, updateUser, updateUserRole, isLastAdminUser, deleteUser } from '@/services/user/user.service';
import { z } from 'zod';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    const isAdmin = session.user.role === 'ADMIN';
    const isSelfRequest = session.user.id === id;
    
    if (!isAdmin && !isSelfRequest) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }
    
  
    const user = await getUserById(id, isAdmin);
    
    return NextResponse.json({
      success: true,
      user,
    });
    
  } catch (error) {
    console.error("Error fetching user:", error);
    
    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }
    
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

export async function PATCH(request, { params }) {
  try {
   
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const isAdmin = session.user.role === 'ADMIN';
    const isSelfUpdate = session.user.id === id;
    
    if (!isAdmin && !isSelfUpdate) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    
    const userUpdateSchema = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      image: z.string().optional(),
      role: z.enum(['USER', 'ADMIN', 'RESELLER']).optional(),
    });
    
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
    
    if (result.data.role && isAdmin) {
      if (id !== session.user.id && result.data.role !== 'ADMIN') {
        const wouldRemoveLastAdmin = await isLastAdminUser(id, result.data.role);
        
        if (wouldRemoveLastAdmin) {
          return NextResponse.json(
            { success: false, message: "Cannot remove the last admin" },
            { status: 400 }
          );
        }
      }
      
      updatedUser = await updateUserRole(id, result.data.role);
    } else {
      const { role, ...updateData } = result.data;
      updatedUser = await updateUser(id, updateData);
    }
    
    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
    
  } catch (error) {
    console.error("Error updating user:", error);
    
    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }
    
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
export async function DELETE(request, { params }) {
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
        { success: false, message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    if (session.user.id === id) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own account" },
        { status: 400 }
      );
    }
    
    const wouldRemoveLastAdmin = await isLastAdminUser(id, "USER");
    if (wouldRemoveLastAdmin) {
      return NextResponse.json(
        { success: false, message: "Cannot delete the last admin user" },
        { status: 400 }
      );
    }
    
    await deleteUser(id);
    
    return NextResponse.json({
      success: true,
      message: "User deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting user:", error);
    
    if (error.message === "User not found") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete user", 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}