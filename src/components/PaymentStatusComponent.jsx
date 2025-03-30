import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Copy, 
  RefreshCw, 
  ChevronLeft, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { checkPaymentStatus, formatCurrency, getPaymentMethodDetails, getPaymentInstructions } from '@/services/payment/checkout.service';

const PaymentStatusComponent = ({ orderNumber }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState(null);

  // Fetch payment status
  const fetchPaymentStatus = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const result = await checkPaymentStatus(orderNumber);
      setPaymentData(result.data);
      
      // Calculate time left if payment has expiration
      if (result.data.expiresAt) {
        const expiry = new Date(result.data.expiresAt);
        const now = new Date();
        const diffMs = expiry - now;
        if (diffMs > 0) {
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft({ hours: diffHrs, minutes: diffMins });
        } else {
          setTimeLeft(null);
        }
      }
    } catch (err) {
      console.error('Error fetching payment status:', err);
      setError(err.message || 'Failed to fetch payment status');
    } finally {
      setIsLoading(false);
      if (showRefreshing) {
        setIsRefreshing(false);
        toast.success('Status pembayaran diperbarui');
      }
    }
  };

  // Initialize data
  useEffect(() => {
    if (orderNumber) {
      fetchPaymentStatus();
    }
  }, [orderNumber]);

  // Set up auto-refresh every 30 seconds if payment is pending
  useEffect(() => {
    if (paymentData && paymentData.paymentStatus === 'PENDING' && !paymentData.isExpired) {
      const interval = setInterval(() => {
        fetchPaymentStatus();
      }, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [paymentData]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchPaymentStatus(true);
  };

  // Handle copy to clipboard
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} disalin ke clipboard`))
      .catch(err => toast.error('Gagal menyalin teks'));
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h3 className="text-lg font-medium">Memuat detail pembayaran...</h3>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Data pembayaran tidak ditemukan
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get payment method details
  const paymentMethodDetails = getPaymentMethodDetails(paymentData.paymentMethod);
  
  // Get payment instructions
  const instructions = getPaymentInstructions(
    paymentData.paymentMethod, 
    paymentData.paymentDetails
  );

  // Determine payment status color and icon
  const getPaymentStatusDisplay = () => {
    if (paymentData.paymentStatus === 'SUCCESS' || paymentData.orderStatus === 'COMPLETED') {
      return {
        icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
        color: 'text-emerald-500',
        text: 'Pembayaran Berhasil'
      };
    }
    
    if (paymentData.paymentStatus === 'FAILED' || paymentData.orderStatus === 'CANCELLED') {
      return {
        icon: <XCircle className="h-6 w-6 text-destructive" />,
        color: 'text-destructive',
        text: 'Pembayaran Gagal'
      };
    }
    
    if (paymentData.isExpired) {
      return {
        icon: <XCircle className="h-6 w-6 text-destructive" />,
        color: 'text-destructive',
        text: 'Pembayaran Kedaluwarsa'
      };
    }
    
    return {
      icon: <Clock className="h-6 w-6 text-amber-500" />,
      color: 'text-amber-500',
      text: 'Menunggu Pembayaran'
    };
  };
  
  const statusDisplay = getPaymentStatusDisplay();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Kembali ke beranda
          </Link>
        </Button>
      </div>
      
      {/* Payment Status Card */}
      <Card className="mb-6 overflow-hidden">
        <div className={`py-4 px-6 ${statusDisplay.color === 'text-emerald-500' ? 'bg-emerald-50 dark:bg-emerald-950/20' : statusDisplay.color === 'text-destructive' ? 'bg-red-50 dark:bg-red-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}`}>
          <div className="flex items-center">
            {statusDisplay.icon}
            <div className="ml-2">
              <h2 className={`font-semibold ${statusDisplay.color}`}>{statusDisplay.text}</h2>
              <p className="text-sm text-muted-foreground">
                Order ID: {paymentData.orderNumber}
              </p>
            </div>
            <div className="ml-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={statusDisplay.color === 'text-emerald-500' ? 'text-emerald-600 hover:text-emerald-700' : ''}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Show expiry timer for pending payments */}
          {paymentData.paymentStatus === 'PENDING' && timeLeft && (
            <div className="mb-4 p-3 bg-muted/40 rounded-md flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm">
                Bayar dalam <span className="font-semibold">{timeLeft.hours} jam {timeLeft.minutes} menit</span> sebelum pesanan kedaluwarsa
              </span>
            </div>
          )}
          
          {/* Product information */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Detail Produk</h3>
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex justify-between">
                <span className="text-sm">{paymentData.product?.name}</span>
                <span className="text-sm font-semibold">{formatCurrency(paymentData.product?.price)}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <div>
                  User ID: {paymentData.gameData?.userId}
                  {paymentData.gameData?.serverId && ` (Server: ${paymentData.gameData.serverId})`}
                </div>
                {paymentData.gameData?.username && <div>Username: {paymentData.gameData.username}</div>}
              </div>
            </div>
          </div>
          
          {/* Payment method information */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Metode Pembayaran</h3>
            <div className="bg-muted/30 p-3 rounded-md flex items-center">
              {paymentMethodDetails?.icon && (
                <div className="h-8 w-8 relative mr-3">
                  <Image
                    src={paymentMethodDetails.icon}
                    alt={paymentMethodDetails.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <div className="text-sm font-medium">{paymentMethodDetails?.name || paymentData.paymentMethod}</div>
                <div className="text-xs text-muted-foreground">Total: {formatCurrency(paymentData.amount)}</div>
              </div>
            </div>
          </div>
          
          {/* Payment details for pending payments */}
          {paymentData.paymentStatus === 'PENDING' && !paymentData.isExpired && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Detail Pembayaran</h3>
              <div className="bg-muted/30 p-3 rounded-md">
                {/* Virtual Account Number */}
                {paymentData.paymentDetails?.paymentCode && (
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {paymentMethodDetails?.type === 'bank_transfer' ? 'Nomor Virtual Account' : 'Kode Pembayaran'}
                      </div>
                      <div className="font-mono text-sm font-semibold">{paymentData.paymentDetails.paymentCode}</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopy(
                        paymentData.paymentDetails.paymentCode, 
                        paymentMethodDetails?.type === 'bank_transfer' ? 'Nomor VA' : 'Kode pembayaran'
                      )}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                
                {/* Total Amount */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Pembayaran</div>
                    <div className="font-mono text-sm font-semibold">{formatCurrency(paymentData.amount)}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy(
                      paymentData.amount.toString(), 
                      'Jumlah pembayaran'
                    )}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {/* Payment URL if available */}
                {paymentData.paymentDetails?.paymentUrl && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <Button 
                      className="w-full"
                      onClick={() => window.open(paymentData.paymentDetails.paymentUrl, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Lanjutkan Pembayaran
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Payment instructions */}
          {paymentData.paymentStatus === 'PENDING' && !paymentData.isExpired && instructions && (
            <div>
              <h3 className="text-sm font-medium mb-2">{instructions.title}</h3>
              <div className="bg-muted/30 p-3 rounded-md">
                <ol className="list-decimal pl-5 space-y-1">
                  {instructions.steps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
          
          {/* Transaction status for successful payments */}
          {(paymentData.paymentStatus === 'SUCCESS' || paymentData.orderStatus === 'COMPLETED') && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-md">
              <h3 className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Transaksi Berhasil
              </h3>
              <p className="text-sm mt-1">
                Produk telah diproses dan dikirim ke akun game Anda. 
                Terima kasih telah berbelanja di TIF Store!
              </p>
            </div>
          )}
          
          {/* Actions for failed or expired payments */}
          {(paymentData.paymentStatus === 'FAILED' || paymentData.paymentStatus === 'EXPIRED' || paymentData.isExpired) && (
            <div className="mt-4 flex justify-center">
              <Button asChild>
                <Link href={`/games/${paymentData.product?.gameSlug}`}>
                  Coba Lagi
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Help section */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Butuh bantuan? <Link href="/help" className="text-primary hover:underline">Hubungi customer service</Link>
        </p>
      </div>
    </div>
  );
};

export default PaymentStatusComponent;