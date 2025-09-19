import Link from "next/link";
import { getAllProducts } from "@/lib/products";

export default function ProductsPage() {
  const items = getAllProducts();

  return (
    <>
      <h1 className="h2 fw-bold mb-4">Products</h1>

      <div className="row g-4">
        {items.map((p) => (
          <div className="col-md-6 col-lg-4" key={p.slug}>
            <div className="card h-100 shadow-sm">
              <div className="ratio ratio-4x3 bg-light rounded-top">
                {/* optional: next/image later */}
              </div>
              <div className="card-body">
                <h2 className="h5">{p.title}</h2>
                {p.leadPrice && (
                  <p className="text-secondary mb-3">{p.leadPrice}</p>
                )}
                <div className="d-flex gap-2">
                  <Link
                    href={`/products/${p.slug}`}
                    className="btn btn-primary btn-sm"
                  >
                    View details
                  </Link>
                  <Link href="/contact" className="btn btn-outline-secondary btn-sm">
                    Request a quote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}