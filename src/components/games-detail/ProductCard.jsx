// src/components/games-detail/ProductCard.jsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product, selectedProduct, onSelect }) {
  // Calculate discount percentage if discountPrice is available
  const discountPercentage = product.discountPrice 
    ? Math.round((1 - product.discountPrice / product.price) * 100) 
    : 0;

  // Determine product availability status
  const isAvailable = product.providerStatus === 'available';
  const isLimited = product.providerStatus === 'empty';

  return (
    <div
      className="cursor-pointer relative"
      onClick={() => onSelect(product)}
    >
      <Card
        className={`h-full border ${
          selectedProduct?.id === product.id
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:border-primary/40"
        } transition-all hover:shadow-sm`}
      >
        <CardContent className="p-4 flex flex-col items-center text-center">
          {/* Status badges */}
          <div className="absolute -top-2 -right-2 flex space-x-1">
            {/* Display discount badge */}
            {discountPercentage > 0 && (
              <Badge
                variant="secondary"
                className="bg-rose-100 text-rose-700 dark:bg-rose-700/20 dark:text-rose-400 text-[10px] font-medium"
              >
                {discountPercentage}% OFF
              </Badge>
            )}
            
            {/* Display availability badge */}
            {isAvailable && (
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400 text-[10px] font-medium"
              >
                Ready
              </Badge>
            )}
            
            {isLimited && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400 text-[10px] font-medium"
              >
                Limited
              </Badge>
            )}
          </div>

          {/* Product name */}
          <h3 className="font-medium mb-2">{product.name}</h3>

          {/* Price information with possible discount */}
          <div className="mt-auto">
            {product.discountPrice && (
              <div className="text-sm line-through text-muted-foreground mb-1">
                {formatPrice(product.price)}
              </div>
            )}
            <div className="font-bold text-base">
              {formatPrice(product.discountPrice || product.price)}
            </div>
            
            {/* Developer info - only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground mt-2">
                {product.basePrice && (
                  <div>Base: {formatPrice(product.basePrice)}</div>
                )}
                {product.markupPercentage && (
                  <div>Markup: {product.markupPercentage}%</div>
                )}
                {product.providerCode && (
                  <div className="truncate max-w-[120px]">
                    Code: {product.providerCode.substring(0, 10)}...
                  </div>
                )}
              </div>
            )}
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
  );
}