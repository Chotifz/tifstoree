// src/services/user/user.service.js
import { prisma } from '@/lib/prisma';

/**
 * Get user by ID
 * @param {string} id - User ID
 * @param {boolean} [includeSecure=false] - Whether to include secure fields
 * @returns {Promise<Object>} User object
 */
export async function getUserById(id, includeSecure = false) {
  const select = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    isVerified: true,
    createdAt: true,
    updatedAt: true,
  };
  
  // Include secure fields if requested
  if (includeSecure) {
    select.address = true;
    select.emailVerified = true;
    select.image = true;
  }
  
  const user = await prisma.user.findUnique({
    where: { id },
    select,
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

/**
 * Get users with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Number of items per page
 * @param {string} [options.search] - Search term for name, email, or phone
 * @param {string} [options.role] - Filter by role
 * @returns {Promise<Object>} Object containing users array and pagination info
 */
export async function getUsers({ 
  page = 1, 
  limit = 10, 
  search = '', 
  role = null 
} = {}) {
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Create where clause for filtering
  const where = {};
  
  // Add search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  // Add role filter
  if (role) {
    where.role = role;
  }
  
  // Get users from database with pagination
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      address: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  // Get total count for pagination
  const total = await prisma.user.count({ where });
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} data - User data to update
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUser(id, data) {
  // Create update object with only allowed fields
  const updateData = {};
  
  // Only include fields that are provided and allowed to be updated
  const allowedFields = ['name', 'phone', 'address', 'image'];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }
  
  // Update user in database
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      address: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return user;
}

/**
 * Update user role (admin only)
 * @param {string} id - User ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUserRole(id, role) {
  if (!['USER', 'ADMIN', 'RESELLER'].includes(role)) {
    throw new Error("Invalid role");
  }
  
  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return user;
}

/**
 * Get user orders with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=10] - Number of items per page
 * @returns {Promise<Object>} Object containing orders array and pagination info
 */
export async function getUserOrders(userId, { page = 1, limit = 10 } = {}) {
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get orders from database with pagination
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payment: true,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  // Get total count for pagination
  const total = await prisma.order.count({ where: { userId } });
  
  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

/**
 * Count users by role
 * @returns {Promise<Object>} Object containing count of users by role
 */
export async function countUsersByRole() {
  const counts = await prisma.$transaction([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'RESELLER' } }),
    prisma.user.count(),
  ]);
  
  return {
    USER: counts[0],
    ADMIN: counts[1],
    RESELLER: counts[2],
    TOTAL: counts[3],
  };
}