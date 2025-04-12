'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { 
  Package, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  ArrowRight,
  ShoppingCart,
  Loader2,
  CalendarIcon
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { useUserOrders, getOrderStatusDisplay, getPaymentStatusDisplay } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';

export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Redirect to login if not authenticated
  if (sessionStatus === 'unauthenticated') {
    router.push('/sign-in?callbackUrl=/orders');
    return null;
  }
  
  // Fetch user orders
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useUserOrders({
    page,
    limit: 5,
    status: orderStatus !== 'all' ? orderStatus : undefined
  });
  
  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || {};
  
  // Filter orders by search term
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.items.some(item => 
        item.product.name.toLowerCase().includes(searchLower) ||
        item.product.game.name.toLowerCase().includes(searchLower)
      )
    );
  });
  
  // Handle page change
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled client-side via the filteredOrders variable
  };
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
          />
        </div>
        <Select 
          value={orderStatus}
          onValueChange={setOrderStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border-border/40">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : isError ? (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Error Loading Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error?.message || 'Failed to load your orders. Please try again.'}</p>
              <Button className="mt-4" onClick={() => location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="border-border/40 py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? "No orders match your search criteria" 
                  : orderStatus !== 'all' 
                    ? `You don't have any ${orderStatus.toLowerCase()} orders` 
                    : "You haven't placed any orders yet"}
              </p>
              <Button asChild>
                <Link href="/games">Browse Games</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusDisplay = getOrderStatusDisplay(order.status);
            const paymentStatusDisplay = order.payment ? getPaymentStatusDisplay(order.payment.status) : null;
            const firstItem = order.items[0];
            const game = firstItem?.product?.game;
            
            return (
              <Card key={order.id} className="border-border/40 hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold">{order.orderNumber}</span>
                      <Badge 
                        className={`${statusDisplay.bgColor} ${statusDisplay.color} ${statusDisplay.darkBgColor}`}
                      >
                        {statusDisplay.label}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Game icon */}
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                      {game?.icon ? (
                        <Image
                          src={game.icon}
                          alt={game.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 m-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Order details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {order.items.map(item => item.product.name).join(', ')}
                      </h3>
                      
                      <div className="text-sm text-muted-foreground mt-1">
                        {game?.name || 'Unknown Game'}
                        {order.gameData?.userId && (
                          <span> • ID: {order.gameData.userId}</span>
                        )}
                        {order.gameData?.serverId && (
                          <span> • Server: {order.gameData.serverId}</span>
                        )}
                      </div>
                      
                      {paymentStatusDisplay && (
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={`${paymentStatusDisplay.color} text-xs`}
                          >
                            Payment: {paymentStatusDisplay.label}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Price and view button */}
                    <div className="flex flex-col items-end gap-2 self-end sm:self-center">
                      <div className="font-bold whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                        asChild
                      >
                        <Link href={`/orders/${order.orderNumber}`}>
                          View Details
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Pagination */}
      {!isLoading && !isError && pagination.total > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {
              Math.min(pagination.page * pagination.limit, pagination.total)
            } of {pagination.total} orders
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}