import { prisma } from '@/lib/prisma';

// Reusable select objects
const baseUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
};

const secureUserSelect = {
  ...baseUserSelect,
  address: true,
  emailVerified: true,
  image: true,
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total count of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
function getPaginationMetadata(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Create search filter for user queries
 * @param {string} search - Search term
 * @returns {Object} Prisma compatible search filter
 */
function createUserSearchFilter(search) {
  if (!search) return {};
  
  return {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  };
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @param {boolean} [includeSecure=false] - Whether to include secure fields
 * @returns {Promise<Object>} User object
 */
export async function getUserById(id, includeSecure = false) {
  const select = includeSecure ? secureUserSelect : baseUserSelect;
  
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
  const where = createUserSearchFilter(search);
  
  // Add role filter
  if (role) {
    where.role = role;
  }
  
  // Get users from database with pagination
  const users = await prisma.user.findMany({
    where,
    select: secureUserSelect,
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  // Get total count for pagination
  const total = await prisma.user.count({ where });
  
  // Return data with pagination metadata
  return {
    users,
    pagination: getPaginationMetadata(total, page, limit),
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
    select: secureUserSelect,
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
    select: baseUserSelect,
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
  
  // Return results with pagination metadata
  return {
    orders,
    pagination: getPaginationMetadata(total, page, limit),
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

/**
 * Check if this is the last admin user
 * @param {string} userId - The user ID to check
 * @param {string} newRole - The new role being assigned
 * @returns {Promise<boolean>} True if operation would remove last admin
 */
export async function isLastAdminUser(userId, newRole) {
  // If the new role is still ADMIN, no need to check
  if (newRole === 'ADMIN') {
    return false;
  }
  
  // Get the user to check their current role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  
  // If user is not an admin, this change doesn't affect admin count
  if (!user || user.role !== 'ADMIN') {
    return false;
  }
  
  // Count the total admins
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' },
  });
  
  // If there's only one admin and we're changing their role,
  // this would remove the last admin
  return adminCount <= 1;
}