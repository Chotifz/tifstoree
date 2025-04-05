'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, Hash, Shield, 
  CheckCircle, CreditCard, Clock, 
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { useGameById, useGameProducts } from '@/hooks/queries/useGames';
import SkeletonDetailGame from '@/components/SkeletonDetailGame';
import GameDetailError from '@/components/GameDetailError';
import HeaderGameDetail from '@/components/games-detail/HeaderGameDetail';
import { formatPrice } from '@/lib/utils';
import ProductList from '@/components/games-detail/ProductList';

export default function GameDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [gameFormFields, setGameFormFields] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [email, setEmail] = useState('');
 
  const { 
    data: gameData, 
    isLoading: isGameLoading, 
    isError: isGameError 
  } = useGameById(id, true);
  
  const game = gameData?.game;
  const categories = game?.categories || [];

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);
  
   const { 
    data: productsData, 
    isLoading: isProductsLoading, 
    isError: isProductsError 
  } = useGameProducts(id, { 
    categoryId: activeCategory,
    active: true
  }, {
    enabled: !!activeCategory // Only run the query if we have an active category
  });
  
  const products = productsData?.products || [];
  
  const handleFieldChange = (field, value) => {
    setGameFormFields(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if exists
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // Validate inputs before proceeding
  const validateInputs = useCallback(() => {
    const errors = {};
    
    // Check product selection
    if (!selectedProduct) {
      toast.error("Silakan pilih produk terlebih dahulu");
      return false;
    }
    
    // Check required fields
    const requiredFields = typeof selectedProduct.requiredFields === 'string' 
      ? JSON.parse(selectedProduct.requiredFields) 
      : selectedProduct.requiredFields;
    
    requiredFields.forEach(field => {
      if (!gameFormFields[field] || gameFormFields[field].trim() === '') {
        errors[field] = `${field} harus diisi`;
      }
    });
    
    // If email is provided, validate format
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Format email tidak valid";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedProduct, gameFormFields, email]);
  
  const handleCheckout = async () => {
    // if (!validateInputs()) return;
   

    try {
      const data = {
        id: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.discountPrice || selectedProduct.price,
        quantity: 1
      }

      toast.loading("Memproses pesanan...");
    
       const response = await fetch('/api/midtrans/token', {
        method: 'POST',
        body: JSON.stringify(data)
       })

       
       const requestData = await response.json();
      window.snap.pay(requestData)
      // Redirect to checkout/payment page
      // In a real app: router.push(`/checkout/${orderNumber}`);
      
      toast.dismiss();
      toast.success("Pesanan berhasil! Anda akan dialihkan ke halaman pembayaran");
      
      // Simulate redirect
      // setTimeout(() => {
      //   router.push('/');
      // }, 2000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Gagal memproses pesanan. Silakan coba lagi.");
    }
  };
  
  const getCategoryProducts = useCallback(() => {
    if (!products) return [];
    return products;
  }, [products]);
  
  
  
  if (isGameLoading) {
    return (
      <SkeletonDetailGame />
    );
  }
  
  if (isGameError || !game) {
    return (
      <GameDetailError />
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <HeaderGameDetail game={game} />      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* ID Input card */}
            <Card className="border-border/40">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-2">1. Masukkan ID Game</h2>
                
                <div className="space-y-4">
                  {Object.keys(gameFormFields).map(field => {
                    // Format field label for display
                    const formattedFieldName = field
                      .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
                      .replace(/^./, str => str.toUpperCase()) // Capitalize the first letter
                      .replace(/Id$|ID$/, ' ID'); // Replace Id or ID at the end with ' ID'
                    
                    // Icon based on field type
                    let FieldIcon = User;
                    if (field.toLowerCase().includes('server')) FieldIcon = Hash;
                    
                    return (
                      <div key={field} className="space-y-2">
                        <Label htmlFor={field} className="flex items-center text-sm">
                          <FieldIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formattedFieldName}
                        </Label>
                        
                        <Input 
                          id={field}
                          value={gameFormFields[field] || ''}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          placeholder={`Masukkan ${formattedFieldName}`}
                          className={formErrors[field] ? "border-destructive" : ""}
                        />
                        
                        {formErrors[field] && (
                          <p className="text-destructive text-xs">{formErrors[field]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Product Selection card */}
            <Card className="border-border/40">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">2. Pilih Nominal Top Up</h2>
                
                {/* Category tabs */}
                <Tabs
                  value={activeCategory}
                  onValueChange={setActiveCategory} 
                  className="w-full"
                >
                  <TabsList className="bg-muted/50 p-1 h-auto w-full mb-6">
                    {categories.map((category) => (
                      <TabsTrigger key={category.id} value={category.id} className="flex-1">
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {/* Products for each category */}
                  {categories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="m-0 p-0">
                      <ProductList
                        products={getCategoryProducts().filter(product => product.categoryId === category.id)}
                        selectedProduct={selectedProduct}
                        onSelect={setSelectedProduct}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Code Promo */}
            <Card className="border-border/40">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">3. Kode Promo</h2>
                <div className="space-y-2">
                  <Label htmlFor="promoCode" className="text-sm">Masukkan Kode Promo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCode"
                      type="text"
                      placeholder="Masukkan kode promo"
                      value={""}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        // Clear pesan error saat mengetik ulang
                        if (promoError) setPromoError('');
                      }}
                      // className={promoError ? "border-destructive" : ""}
                    />
                    <Button >Gunakan</Button>
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Checkout */}
          <div>
            <div className="sticky top-24">
              <Card className="border-border/40">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">4. Checkout</h2>
                  
                  {/* Game Overview */}
                  <div className="flex items-center mb-4 p-3 bg-muted/30 rounded-md">
                    <Avatar className="h-12 w-12 rounded-md mr-3">
                      <AvatarImage src={game.icon} alt={game.name} />
                      <AvatarFallback className="rounded-md">{game.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-medium">{game.name}</h3>
                      <p className="text-xs text-muted-foreground">{game.developerName}</p>
                    </div>
                  </div>
                  
                  {/* Selected product */}
                  {selectedProduct ? (
                    <div className="bg-muted/40 p-4 rounded-md mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{selectedProduct.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {categories.find(cat => cat.id === selectedProduct.categoryId)?.name}
                          </p>  
                        </div>
                        <div className="text-right">
                          {selectedProduct.discountPrice ? (
                            <>
                              <p className="font-semibold">{formatPrice(selectedProduct.discountPrice)}</p>
                              <div className="flex items-center text-xs">
                                <span className="line-through text-muted-foreground mr-1">
                                  {formatPrice(selectedProduct.price)}
                                </span>
                                <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-700/20 dark:text-rose-400 text-[10px]">
                                  {Math.round((1 - selectedProduct.discountPrice / selectedProduct.price) * 100)}%
                                </Badge>
                              </div>
                            </>
                          ) : (
                            <p className="font-semibold">{formatPrice(selectedProduct.price)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert className="mb-6 bg-muted/40 border-muted">
                      <AlertDescription>Silakan pilih produk terlebih dahulu</AlertDescription>
                    </Alert>  
                  )}
                  
                  {/* Email input */}
                  <div className="space-y-2 mb-6">
                    <Label htmlFor="email">Email (Opsional)</Label>
                    <Input
                      id="email"
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email Anda"
                      className={formErrors.email ? "border-destructive" : ""}
                    />
                    {formErrors.email ? (
                      <p className="text-destructive text-xs">{formErrors.email}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Email digunakan untuk mengirim bukti pembayaran
                      </p>
                    )}
                  </div>
                  
                  {/* Order summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Harga Produk</span>
                      <span>
                        {selectedProduct ? formatPrice(selectedProduct.price) : '-'}
                      </span>
                    </div>
                    
                    {selectedProduct && selectedProduct.discountPrice && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Diskon</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          - {formatPrice(selectedProduct.price - selectedProduct.discountPrice)}
                        </span>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between font-medium">
                      <span>Total Bayar</span>
                      <span>
                        {selectedProduct ? 
                          formatPrice(selectedProduct.discountPrice || selectedProduct.price) : 
                          '-'
                        }
                      </span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!selectedProduct }
                    onClick={handleCheckout}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Bayar Sekarang
                  </Button>
                  <div className="mt-4">
                    <div className="flex items-center justify-center text-muted-foreground text-xs mb-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Pembayaran aman &amp; terenkripsi
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
      </main>
    </div>
  );
}