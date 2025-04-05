"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product, selectedProduct, onSelect }) {
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
          {/* Badges */}
          <div className="absolute -top-2 -right-2 flex space-x-1">
            {product.isPopular && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-400 text-[10px] font-medium"
              >
                Terlaris
              </Badge>
            )}
            {product.isNew && (
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400 text-[10px] font-medium"
              >
                Baru
              </Badge>
            )}
            {product.discountPrice && (
              <Badge
                variant="secondary"
                className="bg-rose-100 text-rose-700 dark:bg-rose-700/20 dark:text-rose-400 text-[10px] font-medium"
              >
                Promo
              </Badge>
            )}
          </div>

          <h3 className="font-medium mb-2">{product.name}</h3>

          {/* Price dengan discount */}
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
  );
}
