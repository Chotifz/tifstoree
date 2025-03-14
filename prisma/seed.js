import { PrismaClient } from '@prisma/client';
import { 
  games, 
  categories, 
  products, 
  banners, 
  orders, 
  orderItems, 
  payments, 
  transactions 
} from '../src/config/dummy-data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create games
  console.log('Seeding games...');
  for (const game of games) {
    await prisma.game.upsert({
      where: { id: game.id },
      update: game,
      create: game,
    });
  }
  console.log('Games seeded successfully!');

  // Create categories
  console.log('Seeding categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
  }
  console.log('Categories seeded successfully!');

  // Create products
  console.log('Seeding products...');
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }
  console.log('Products seeded successfully!');

  // Create banners
  console.log('Seeding banners...');
  for (const banner of banners) {
    await prisma.banner.upsert({
      where: { id: banner.id },
      update: banner,
      create: banner,
    });
  }
  console.log('Banners seeded successfully!');

  // First create some users
  console.log('Seeding users...');
  const users = [
    {
      id: 'user_1',
      name: 'Ahmad Syafiq',
      email: 'ahmad@example.com',
      password: '$2a$10$a3vRw.R6lzN9GgZ1s8xY7.3HDJ.NWAlkBRB9mhyW0C6.5R5z6iNxO', // hashed 'password123'
      role: 'USER',
      isVerified: true,
      joinDate: new Date('2025-01-15'),
      image: '/images/users/default.png'
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log('Users seeded successfully!');

  // Create orders, order items, payments, and transactions
  console.log('Seeding orders and related data...');
  
  for (const order of orders) {
    // Skip orders with userId that doesn't match any of our created users
    if (order.userId && !users.some(user => user.id === order.userId)) {
      console.log(`Skipping order ${order.id} because userId ${order.userId} doesn't exist`);
      continue;
    }
    
    // Create order
    await prisma.order.upsert({
      where: { id: order.id },
      update: order,
      create: order,
    });
    
    // Get order items related to this order
    const items = orderItems.filter(item => item.orderId === order.id);
    
    // Create order items
    for (const item of items) {
      await prisma.orderItem.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
    }
    
    // Get payment related to this order
    const payment = payments.find(payment => payment.orderId === order.id);
    
    // Create payment if exists
    if (payment) {
      await prisma.payment.upsert({
        where: { id: payment.id },
        update: payment,
        create: payment,
      });
    }
    
    // Get transaction related to this order
    const transaction = transactions.find(transaction => transaction.orderId === order.id);
    
    // Create transaction if exists
    if (transaction) {
      await prisma.transaction.upsert({
        where: { id: transaction.id },
        update: transaction,
        create: transaction,
      });
    }
  }
  
  console.log('Orders and related data seeded successfully!');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });