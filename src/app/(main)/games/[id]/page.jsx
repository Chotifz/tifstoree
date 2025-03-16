'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeft, Info, AlertTriangle, User, Hash, Shield, 
  CheckCircle, CreditCard, Clock, TrendingUp
} from 'lucide-react';

// ShadCN Components
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

// React Query hooks
import { useGameBySlug, useCategoryProducts } from '@/hooks/queries/useGames';

// Fungsi bantuan untuk memformat harga
const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function GameDetail() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  
  // State
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [gameFormFields, setGameFormFields] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Fetch game data using React Query
  const { 
    data: gameData, 
    isLoading: isGameLoading, 
    isError: isGameError, 
    error: gameError 
  } = useGameBySlug(slug, true, {
    onError: (error) => {
      console.error('Error fetching game:', error);
      toast.error("Gagal memuat data game. Silakan coba lagi.");
    }
  });
  console.log(gameData);
console.log('Is loading:', isGameLoading);
console.log('Is error:', isGameError);
console.log('Error:', gameError);
console.log('Game data:', gameData);
  
  // Extract game and categories from query results
  const game = gameData?.game;
  const categories = game?.categories || [];
  
  // Set default active category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);
  
  // Fetch products for active category using React Query
  const {
    data: categoryData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError
  } = useCategoryProducts(
    game?.id, 
    activeCategory, 
    {
      enabled: !!game?.id && !!activeCategory,
      onError: (error) => {
        console.error('Error fetching products:', error);
        toast.error("Gagal memuat produk. Silakan coba lagi.");
      }
    }
  );
  
  // Extract products from query results
  const products = categoryData?.products || [];
  
  // Initialize form fields based on required fields from first product
  useEffect(() => {
    if (products.length > 0) {
      const firstProduct = products[0];
      const initialFields = {};
      
      if (firstProduct.requiredFields) {
        // Convert requiredFields from JSON if needed
        const fields = typeof firstProduct.requiredFields === 'string' 
          ? JSON.parse(firstProduct.requiredFields) 
          : firstProduct.requiredFields;
          
        fields.forEach(field => {
          // Only initialize if not already set
          if (!gameFormFields[field]) {
            initialFields[field] = '';
          }
        });
      }
      
      // Only update if we have new fields to add
      if (Object.keys(initialFields).length > 0) {
        setGameFormFields(prev => ({
          ...prev,
          ...initialFields
        }));
      }
    }
  }, [products, gameFormFields]);
  
  // Handle field changes
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
  
  // Payment methods
  const paymentMethods = [
    { id: 'dana', name: 'DANA', icon: '/images/method/dana.png' },
    { id: 'ovo', name: 'OVO', icon: '/images/method/ovo.png' },
    { id: 'gopay', name: 'GoPay', icon: '/images/method/gopay.png' },
    { id: 'qris', name: 'QRIS', icon: '/images/method/qqris.jpg' },
    { id: 'bca', name: 'BCA', icon: '/images/method/bca.png' },
    { id: 'bri', name: 'BRI', icon: '/images/method/qbri2.png' },
    { id: 'mandiri', name: 'Mandiri', icon: '/images/method/mandiri.png' },
    { id: 'shopeepay', name: 'ShopeePay', icon: '/images/method/shopeepay.png' },
  ];
  
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
    
    // Check payment method
    if (!paymentMethod) {
      toast.error("Silakan pilih metode pembayaran");
      return false;
    }
    
    // If email is provided, validate format
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Format email tidak valid";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedProduct, gameFormFields, paymentMethod, email]);
  
  // Proceed to payment
  const handleCheckout = async () => {
    if (!validateInputs()) return;
    
    try {
      // Show loading toast
      toast.loading("Memproses pesanan...");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to checkout/payment page
      // In a real app: router.push(`/checkout/${orderNumber}`);
      
      toast.dismiss();
      toast.success("Pesanan berhasil! Anda akan dialihkan ke halaman pembayaran");
      
      // Simulate redirect
      setTimeout(() => {
        router.push('/');
      }, 2000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Gagal memproses pesanan. Silakan coba lagi.");
    }
  };
  
  // Get instruction text for the selected product
  const getInstructionText = () => {
    if (!selectedProduct) return null;
    
    return selectedProduct.instructionText || "Silakan masukkan informasi yang diperlukan untuk melakukan top up.";
  };
  
  // Get products for the active category
  const getCategoryProducts = useCallback(() => {
    if (!products) return [];
    return products;
  }, [products]);
  
  // Determine if page is loading
  const isLoading = isGameLoading || (isProductsLoading && !!activeCategory);
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 rounded-full mr-2" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-full max-w-md mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Skeleton key={n} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  // Error state or game not found
  if (isGameError || !game) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 text-center">
        <Alert variant="destructive" className="mx-auto max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Game tidak ditemukan</AlertTitle>
          <AlertDescription>
            Game yang Anda cari tidak ditemukan atau telah dihapus.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
          className="mt-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali ke Beranda
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Game banner/hero section */}
      <div 
        className="w-full h-56 sm:h-64 md:h-80 relative bg-gradient-to-r from-primary/90 to-primary/30"
        style={{
          backgroundImage: `url(${game.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="max-w-7xl mx-auto h-full flex items-end px-4 sm:px-6 lg:px-8">
          <div className="pb-8 w-full">
            <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold">
              {game.bannerTitle || `Top Up ${game.name}`}
            </h1>
            <p className="text-white/90 mt-2">
              {game.bannerSubtitle || game.shortDescription}
            </p>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/">
              <ChevronLeft className="mr-1 h-4 w-4" /> Kembali ke beranda
            </Link>
          </Button>
        </div>
        
        {/* Game info header card */}
        <Card className="mb-8 overflow-hidden border-border/40">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Avatar className="h-16 w-16 rounded-lg border border-border shadow-sm">
                <AvatarImage src={game.icon} alt={game.name} />
                <AvatarFallback className="rounded-lg bg-primary/10">
                  {game.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold">{game.name}</h1>
                  
                  {game.isPopular && (
                    <Badge 
                      variant="secondary" 
                      className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" /> Populer
                    </Badge>
                  )}
                  
                  {game.isNew && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400">
                      Baru
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground">{game.shortDescription}</p>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="bg-muted px-2 py-1 rounded-md">
                    Developer: {game.developerName}
                  </div>
                  <div className="bg-muted px-2 py-1 rounded-md">
                    Publisher: {game.publisherName}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - How to top up, ID input, Product selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* How to top up */}
            <Card className="border-border/40">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  Cara Top Up {game.name}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-4">
                  <div className="flex">
                    <div className="bg-primary/10 rounded-full h-7 w-7 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 shrink-0">1</div>
                    <div>
                      <p className="font-medium">Masukkan ID</p>
                      <p className="text-sm text-muted-foreground">Masukkan User ID dan Server ID (jika diperlukan)</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-primary/10 rounded-full h-7 w-7 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 shrink-0">2</div>
                    <div>
                      <p className="font-medium">Pilih Nominal</p>
                      <p className="text-sm text-muted-foreground">Pilih nominal top up yang diinginkan</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-primary/10 rounded-full h-7 w-7 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 shrink-0">3</div>
                    <div>
                      <p className="font-medium">Pilih Pembayaran</p>
                      <p className="text-sm text-muted-foreground">Pilih metode pembayaran yang tersedia</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-primary/10 rounded-full h-7 w-7 flex items-center justify-center text-primary font-medium mr-3 mt-0.5 shrink-0">4</div>
                    <div>
                      <p className="font-medium">Selesaikan Pembayaran</p>
                      <p className="text-sm text-muted-foreground">Produk akan masuk otomatis ke akun</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* ID Input card */}
            <Card className="border-border/40">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-2">1. Masukkan ID Game</h2>
                
                {/* Instruction text if available */}
                {getInstructionText() && (
                  <Alert className="mb-4 bg-muted/50 border-primary/20">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm">
                      {getInstructionText()}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  {/* Dynamically generate form fields based on required fields */}
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
                      {isProductsLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <Skeleton key={n} className="h-32 w-full rounded-lg" />
                          ))}
                        </div>
                      ) : isProductsError ? (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            Gagal memuat produk untuk kategori ini. Silakan coba lagi.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {getCategoryProducts()
                            .filter(product => product.categoryId === category.id)
                            .map((product) => (
                              <div
                                key={product.id}
                                className="cursor-pointer relative"
                                onClick={() => setSelectedProduct(product)}
                              >
                                <Card
                                  className={`h-full border ${
                                    selectedProduct?.id === product.id
                                      ? "border-primary bg-primary/5"
                                      : "border-border/60 hover:border-primary/40"
                                  } transition-all hover:shadow-sm`}
                                >
                                  <CardContent className="p-4 flex flex-col items-center text-center">
                                    {/* Badges */}
                                    <div className="absolute -top-2 -right-2 flex space-x-1">
                                      {product.isPopular && (
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400 text-[10px] font-medium">
                                          Terlaris
                                        </Badge>
                                      )}
                                      {product.isNew && (
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400 text-[10px] font-medium">
                                          Baru
                                        </Badge>
                                      )}
                                      {product.discountPrice && (
                                        <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-700/20 dark:text-rose-400 text-[10px] font-medium">
                                          Promo
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <h3 className="font-medium mb-2">{product.name}</h3>
                                    
                                    {/* Price with discount */}
                                    <div className="mt-auto">
                                      {product.discountPrice && (
                                        <div className="text-sm line-through text-muted-foreground mb-1">
                                          {formatPrice(product.price)}
                                        </div>
                                      )}
                                      <div className="font-bold text-base">
                                        {formatPrice(product.discountPrice || product.price)}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {/* Selection indicator */}
                                {selectedProduct?.id === product.id && (
                                  <div className="absolute top-0 right-0 h-5 w-5 bg-primary rounded-full transform translate-x-1/4 -translate-y-1/4 flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Payment Method card */}
            <Card className="border-border/40">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">3. Pilih Metode Pembayaran</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id} 
                      onClick={() => setPaymentMethod(method.id)}
                      className={`cursor-pointer p-3 border rounded-md flex items-center justify-center h-14 ${
                        paymentMethod === method.id 
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="h-8 w-8 relative">
                        <Image 
                          src={method.icon} 
                          alt={method.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  ))}
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
                  
                  {/* Checkout button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!selectedProduct || !paymentMethod}
                    onClick={handleCheckout}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Bayar Sekarang
                  </Button>

                  {/* Security notice */}
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