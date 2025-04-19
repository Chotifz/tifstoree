"use client"

import { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import ProductList from '@/components/games-detail/ProductList';
import CheckUsername from '@/components/games-detail/CheckUsername';
import Checkout from './Checkout';

export default function GameDetailComp({ game, products }) {  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [gameFormFields, setGameFormFields] = useState({
    userId: '',
    serverId: ''
  });
 
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [accountVerified, setAccountVerified] = useState(false);
  const [username, setUsername] = useState('');
  
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

return  ( 
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">

      <CheckUsername game={game} gameFormFields={gameFormFields} setGameFormFields={setGameFormFields} setAccountVerified={setAccountVerified} setUsername={setUsername} username={username} accountVerified={accountVerified}/>
      
      <ProductList
        products={products} 
        selectedProduct={selectedProduct}
        onSelect={handleProductSelect}
      />
      
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
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  if (promoError) setPromoError('');
                }}
                className={promoError ? "border-destructive" : ""}
              />
              <Button>Gunakan</Button>
            </div>
            {promoError && (
              <p className="text-destructive text-xs">{promoError}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    
    {/* Right Column - Checkout */}
    <Checkout selectedProduct={selectedProduct} game={game} gameFormFields={gameFormFields} accountVerified={accountVerified}/>
    </div>
 )
}