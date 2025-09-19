import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="h3">Product not found</h1>
      <p className="text-secondary">Try one of our available products.</p>
      <Link href="/products" className="btn btn-primary mt-3">
        Back to Products
      </Link>
    </div>
  );
}