import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { CreditCard, Check, AlertCircle, ArrowRight, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { processCheckout, getPaymentMethodDetails, formatCurrency } from '@/services/payment/checkout.service';

const CheckoutComponent = ({ product, gameData }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'bca', name: 'BCA Virtual Account', icon: '/images/method/bca.png', type: 'bank_transfer' },
    { id: 'bri', name: 'BRI Virtual Account', icon: '/images/method/qbri2.png', type: 'bank_transfer' },
    { id: 'mandiri', name: 'Mandiri Virtual Account', icon: '/images/method/mandiri.png', type: 'bank_transfer' },
    { id: 'gopay', name: 'GoPay', icon: '/images/method/gopay.png', type: 'ewallet' },
    { id: 'shopeepay', name: 'ShopeePay', icon: '/images/method/shopeepay.png', type: 'ewallet' },
    { id: 'qris', name: 'QRIS', icon: '/images/method/qqris.jpg', type: 'qris' }
  ]);
  
  // Admin fee based on payment method
  const getAdminFee = (method) => {
    if (!method) return 0;
    
    const methodType = paymentMethods.find(m => m.id === method)?.type;
    
    if (methodType === 'bank_transfer') return 4000;
    if (methodType === 'ewallet' || methodType === 'qris') return 2000;
    return 0;
  };
  
  // Calculate totals
  const productPrice = product.discountPrice || product.price;
  const adminFee = getAdminFee(selectedPaymentMethod);
  const totalAmount = productPrice + adminFee;
  
  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Silakan pilih metode pembayaran');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Prepare checkout data
      const checkoutData = {
        productId: product.id,
        gameData,
        quantity: 1,
        paymentMethod: selectedPaymentMethod,
        customerData: !session ? {
          name: gameData.username || 'Customer',
          email: gameData.email || '',
          phone: gameData.phone || ''
        } : undefined
      };
      
      // Process checkout
      const result = await processCheckout(checkoutData);
      
      toast.success('Checkout berhasil! Mengarahkan ke halaman pembayaran');
      
      // Redirect to payment page
      if (result.data.paymentUrl) {
        // For external payment URLs (like e-wallets)
        window.location.href = result.data.paymentUrl;
      } else {
        // For internal payment pages
        router.push(`/payment/${result.data.orderNumber}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Gagal memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Group payment methods by type
  const groupedPaymentMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.type]) {
      acc[method.type] = [];
    }
    acc[method.type].push(method);
    return acc;
  }, {});
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Payment Methods */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border/40">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Pilih Metode Pembayaran</h2>
            
            {/* Virtual Account Bank Transfer */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Transfer Bank (Virtual Account)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {groupedPaymentMethods['bank_transfer']?.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`cursor-pointer p-3 border rounded-md flex items-center h-14 ${
                      selectedPaymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="h-8 w-8 relative mr-2">
                      <Image
                        src={method.icon}
                        alt={method.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm">{method.name.split(' ')[0]}</span>
                    {selectedPaymentMethod === method.id && (
                      <Check className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* E-Wallets */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">E-Wallet</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {groupedPaymentMethods['ewallet']?.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`cursor-pointer p-3 border rounded-md flex items-center h-14 ${
                      selectedPaymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="h-8 w-8 relative mr-2">
                      <Image
                        src={method.icon}
                        alt={method.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm">{method.name}</span>
                    {selectedPaymentMethod === method.id && (
                      <Check className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* QRIS */}
            <div>
              <h3 className="text-sm font-medium mb-3">QRIS (Dana, OVO, LinkAja, dll)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {groupedPaymentMethods['qris']?.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={`cursor-pointer p-3 border rounded-md flex items-center h-14 ${
                      selectedPaymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="h-8 w-8 relative mr-2">
                      <Image
                        src={method.icon}
                        alt={method.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm">{method.name}</span>
                    {selectedPaymentMethod === method.id && (
                      <Check className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Checkout Notes */}
        <Alert className="bg-muted/40 border-muted">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <AlertDescription>
            Dengan melanjutkan, Anda menyetujui <span className="text-primary">Syarat & Ketentuan</span> serta <span className="text-primary">Kebijakan Privasi</span> kami.
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Right Column - Order Summary */}
      <div>
        <div className="sticky top-24">
          <Card className="border-border/40">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>
              
              {/* Product Info */}
              <div className="mb-6 p-4 bg-muted/40 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.category?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    {product.discountPrice ? (
                      <>
                        <p className="font-semibold">{formatCurrency(product.discountPrice)}</p>
                        <p className="text-xs line-through text-muted-foreground">
                          {formatCurrency(product.price)}
                        </p>
                      </>
                    ) : (
                      <p className="font-semibold">{formatCurrency(product.price)}</p>
                    )}
                  </div>
                </div>
                
                {/* Game Account Info */}
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-sm text-muted-foreground mb-1">Detail Akun Game:</p>
                  <div className="text-sm">
                    <p><span className="text-muted-foreground">User ID:</span> {gameData.userId}</p>
                    {gameData.serverId && (
                      <p><span className="text-muted-foreground">Server ID:</span> {gameData.serverId}</p>
                    )}
                    {gameData.username && (
                      <p><span className="text-muted-foreground">Username:</span> {gameData.username}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga Produk</span>
                  <span>{formatCurrency(productPrice)}</span>
                </div>
                
                {selectedPaymentMethod && adminFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya Admin</span>
                    <span>{formatCurrency(adminFee)}</span>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between font-medium">
                  <span>Total Bayar</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedPaymentMethod || isProcessing}
                onClick={handleCheckout}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Bayar Sekarang
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <div className="mt-4">
                <div className="flex items-center justify-center text-muted-foreground text-xs mb-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Pembayaran aman & terenkripsi
                </div>
                
                <div className="flex items-center justify-center text-muted-foreground text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Proses otomatis 24 jam
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutComponent;