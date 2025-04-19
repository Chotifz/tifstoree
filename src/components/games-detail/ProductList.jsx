import { Card, CardContent } from "../ui/card";
import ProductCard from "./ProductCard";

export default function ProductList({ products, selectedProduct, onSelect }) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">2. Pilih Nominal Top Up</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {products.map((product) => (
            <ProductCard
            key={product.id}
            product={product}
            selectedProduct={selectedProduct}
            onSelect={onSelect}
            />
          ))}
         </div>
      </CardContent>
    </Card>
  );
}
