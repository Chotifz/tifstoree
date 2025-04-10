// src/components/games-detail/ProductCard.jsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product, selectedProduct, onSelect }) {
  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  const isSelected = selectedProduct?.id === product.id;

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => onSelect(product)}
    >
      <Card
        className={`h-full rounded-xl border-2 transition-all duration-200 ease-in-out ${
          isSelected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border/50 hover:border-primary/40 hover:shadow-sm"
        }`}
      >
        <CardContent className="p-2 flex flex-col items-center text-center space-y-2">
          {/* Status badges */}
          <div className="absolute top-3 right-3 flex flex-col space-y-1 items-end z-10">
            {discountPercentage > 0 && (
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-700/20 dark:text-rose-400 text-[11px] font-semibold px-2 py-1 rounded-md">
                {discountPercentage}% OFF
              </Badge>
            )}

          </div>

          {/* Product Name */}
          <span className="font-semibold text-xs text-foreground/90 line-clamp-2 leading-snug">
            {product.name}
          </span>

          {/* Price */}
          <div className="mt-2 text-center">
            {product.discountPrice && (
              <div className="text-xs text-muted-foreground line-through mb-0.5">
                {formatPrice(product.price)}
              </div>
            )}
            <div className="text-sm font-bold text-primary">
              {formatPrice(product.discountPrice || product.price)}
            </div>
          </div>

          {/* Dev info */}
         
        </CardContent>
      </Card>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 h-5 w-5 bg-primary rounded-full transform translate-x-1/3 -translate-y-1/3 flex items-center justify-center shadow-md">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
