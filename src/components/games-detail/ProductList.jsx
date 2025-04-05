import ProductCard from "./ProductCard";

export default function ProductList({ products, selectedProduct, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          selectedProduct={selectedProduct}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
