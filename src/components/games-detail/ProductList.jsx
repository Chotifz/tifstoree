import ProductCard from "./ProductCard";

export default function ProductList({ products, selectedProduct, onSelect }) {
  return (
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
  );
}
