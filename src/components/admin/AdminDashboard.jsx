'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  GamepadIcon, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { formatDistance } from 'date-fns';

// Simulated stats for dashboard
const stats = [
  {
    name: 'Total Users',
    value: 2358,
    change: +14.5,
    icon: <Users className="h-5 w-5 text-muted-foreground" />,
  },
  {
    name: 'Active Games',
    value: 34,
    change: +2.5,
    icon: <GamepadIcon className="h-5 w-5 text-muted-foreground" />,
  },
  {
    name: 'Total Orders',
    value: 852,
    change: +18.2,
    icon: <ShoppingCart className="h-5 w-5 text-muted-foreground" />,
  },
  {
    name: 'Revenue',
    value: 'Rp85,624,580',
    change: -4.5,
    icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
  },
];

// Simulated recent orders
const recentOrders = [
  {
    id: 'ORD-2023-4587',
    customer: 'Ahmad Syafiq',
    product: 'Mobile Legends: 250 Diamonds',
    amount: 'Rp75,000',
    status: 'completed',
    date: new Date(2025, 2, 15, 10, 23)
  },
  {
    id: 'ORD-2023-4586',
    customer: 'Dina Rahmawati',
    product: 'PUBG Mobile: 420 UC',
    amount: 'Rp95,000',
    status: 'processing',
    date: new Date(2025, 2, 15, 9, 45)
  },
  {
    id: 'ORD-2023-4585',
    customer: 'Budi Santoso',
    product: 'Free Fire: 720 Diamonds',
    amount: 'Rp150,000',
    status: 'completed',
    date: new Date(2025, 2, 15, 8, 12)
  },
  {
    id: 'ORD-2023-4584',
    customer: 'Lina Marlina',
    product: 'Genshin Impact: 1980 Genesis Crystals',
    amount: 'Rp479,000',
    status: 'pending',
    date: new Date(2025, 2, 14, 22, 55)
  },
  {
    id: 'ORD-2023-4583',
    customer: 'Rizki Pratama',
    product: 'Valorant: 1000 Points',
    amount: 'Rp149,000',
    status: 'failed',
    date: new Date(2025, 2, 14, 20, 30)
  },
];

// Simulated popular games
const popularGames = [
  {
    name: 'Mobile Legends',
    orders: 345,
    revenue: 'Rp28,750,000',
    growth: '+12.4%'
  },
  {
    name: 'Free Fire',
    orders: 287,
    revenue: 'Rp18,320,000',
    growth: '+8.7%'
  },
  {
    name: 'PUBG Mobile',
    orders: 176,
    revenue: 'Rp12,980,000',
    growth: '+5.2%'
  },
  {
    name: 'Genshin Impact',
    orders: 112,
    revenue: 'Rp9,650,000',
    growth: '+18.9%'
  },
];

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'processing':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'pending':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'failed':
        return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          March 2025
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className={`flex items-center text-xs mt-1 ${
                    stat.change > 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {stat.change > 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    <span>{Math.abs(stat.change)}% from last month</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {/* Recent Orders Table */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex gap-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.product}</TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistance(order.date, new Date(), { addSuffix: true })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 flex justify-center">
              <Button variant="outline">View All Orders</Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Games */}
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Popular Games</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-3">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularGames.map((game) => (
                    <TableRow key={game.name}>
                      <TableCell className="font-medium">{game.name}</TableCell>
                      <TableCell className="text-right">{game.orders}</TableCell>
                      <TableCell className="text-right">{game.revenue}</TableCell>
                      <TableCell className="text-right text-emerald-500">{game.growth}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 flex justify-center">
              <Button variant="outline">View All Games</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}