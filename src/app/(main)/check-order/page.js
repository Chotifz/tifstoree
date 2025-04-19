'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  PackageSearch,
  Loader2,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useOrderDetails, getOrderStatusDisplay, getPaymentStatusDisplay } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';

export default function CheckOrderPage() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get('order_id');

  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (order_id) {
      setOrderNumber(order_id); 
      setSearchedOrder(order_id);
    }
  }, [order_id]);

  // Only fetch when a search is performed
  const { 
    data: orderData, 
    isLoading: isOrderLoading, 
    isError: isOrderError,
    error: orderError,
    refetch
  } = useOrderDetails(searchedOrder, {
    enabled: !!searchedOrder,
    retry: false
  });
  
  const order = orderData?.data;
  
  // Handle search submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderNumber) {
      toast.error('Please enter an order number');
      return;
    }
    
    setIsLoading(true);
    setSearchedOrder(orderNumber);
    
    try {
      await refetch();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle view details
  const handleViewDetails = () => {
    if (order) {
      router.push(`/orders/${order.orderNumber}`);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle>Check Order Status</CardTitle>
          <CardDescription>
            Enter your order number to check the status of your order
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter order number (e.g., TIF2505050505123)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Check Status
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Your order number was provided in your confirmation email and receipt
            </p>
          </form>
          
          <Separator className="my-6" />
          
          {/* Results Section */}
          {isOrderLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p>Checking order status...</p>
            </div>
          ) : isOrderError ? (
            <div className="py-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  {orderError?.message === 'Order not found' 
                    ? `No order found with number ${searchedOrder}. Please check and try again.`
                    : 'Error checking order status. Please try again later.'
                  }
                </AlertDescription>
              </Alert>
            </div>
          ) : order ? (
            <div className="space-y-4">
              {/* Order Found */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">Order #{order.orderNumber}</h3>
                
                {/* Status Badge */}
                {order.status && (
                  <Badge 
                    className={`${
                      order.status === 'COMPLETED' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                        : order.status === 'FAILED' || order.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                          : order.status === 'PROCESSING'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                    }`}
                  >
                    {order.status === 'COMPLETED' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                    ) : order.status === 'FAILED' || order.status === 'CANCELLED' ? (
                      <><XCircle className="h-3 w-3 mr-1" /> {order.status === 'FAILED' ? 'Failed' : 'Cancelled'}</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" /> {order.status === 'PROCESSING' ? 'Processing' : 'Pending'}</>
                    )}
                  </Badge>
                )}
              </div>
              
              {/* Order Details */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                {/* Products */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Products</p>
                  <p className="text-sm font-medium">
                    {order.items.map(item => item.productName).join(', ')}
                  </p>
                </div>
                
                {/* Game Info */}
                {order.gameData && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Game Info</p>
                    <p className="text-sm">
                      {order.gameData.userId && `ID: ${order.gameData.userId}`}
                      {order.gameData.serverId && ` • Server: ${order.gameData.serverId}`}
                      {order.gameData.username && ` • Username: ${order.gameData.username}`}
                    </p>
                  </div>
                )}
                
                {/* Amount */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-sm font-semibold">{formatPrice(order.totalAmount)}</p>
                </div>
                
                {/* Payment Status */}
                {order.payment && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                    <div className="flex items-center">
                      <Badge 
                        variant="outline"
                        className={`
                          ${order.payment.status === 'SUCCESS' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : order.payment.status === 'FAILED' || order.payment.status === 'EXPIRED'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          } text-xs
                        `}
                      >
                        {order.payment.status === 'SUCCESS' 
                          ? 'Paid' 
                          : order.payment.status === 'FAILED' 
                            ? 'Failed' 
                            : order.payment.status === 'EXPIRED' 
                              ? 'Expired' 
                              : 'Pending'
                        }
                      </Badge>
                      
                      {order.payment.method && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          via {order.payment.method}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Transaction Status */}
                {order.transaction && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Transaction Status</p>
                    <Badge 
                      variant="outline"
                      className={`
                        ${order.transaction.status === 'SUCCESS' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : order.transaction.status === 'FAILED'
                            ? 'text-rose-600 dark:text-rose-400'
                            : order.transaction.status === 'PROCESSING'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-amber-600 dark:text-amber-400'
                        } text-xs
                      `}
                    >
                      {order.transaction.status}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                {order.payment?.status === 'PENDING' && order.payment?.paymentUrl && (
                  <Button onClick={() => window.open(order.payment.paymentUrl, '_blank')}>
                    Complete Payment
                  </Button>
                )}
                
                <Button variant="outline" onClick={handleViewDetails}>
                  View Full Details
                </Button>
              </div>
            </div>
          ) : searchedOrder ? (
            <div className="flex flex-col items-center justify-center py-8">
              <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Enter an order number to check its status</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You will be able to see the status of your order, payment details, and transaction information.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Enter your order number</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You can find your order number in the confirmation email you received after placing your order.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}