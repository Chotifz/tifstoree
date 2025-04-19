"use client"

import { useCallback, useState } from "react";

import { 
 Shield, Clock, 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from "../ui/card";

import CheckoutForm from '../CheckoutForm';
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function Checkout({selectedProduct, gameFormFields, accountVerified, game}){
    const [formErrors, setFormErrors] = useState({});
    const [email, setEmail] = useState('');


    const validateInputs = useCallback(() => {
        const errors = {};
        
        if (!selectedProduct) {
          toast.error("Silakan pilih produk terlebih dahulu");
          return false;
        }
       
        if (!accountVerified) {
          toast.error("Silakan verifikasi akun game Anda terlebih dahulu");
          return false;
        }
        
        if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          errors.email = "Format email tidak valid";
          setFormErrors(prev => ({ ...prev, email: errors.email }));
          return false;
        }
        
        return true;
      }, [selectedProduct, accountVerified, email, gameFormFields]);

    return (

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
              
              <CheckoutForm product={selectedProduct} validateInputs={validateInputs} gameData={gameFormFields} email={email}/>
        
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
  
    )
}