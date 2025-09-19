import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, getProductBySlug } from "@/lib/products";

/** Static generation for each product */
export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

/** Optional: per-page SEO */
export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.title} — Products`,
    description: product.summary,
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) return notFound();

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/products">Products</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.title}
          </li>
        </ol>
      </nav>

      <header className="mb-4">
        <h1 className="h2 fw-bold">{product.title}</h1>
        <p className="text-secondary">{product.summary}</p>
      </header>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm mb-4">
            <div className="ratio ratio-16x9 bg-light rounded-top">
              {/* later: <Image src={product.heroImage!} alt={product.title} fill /> */}
            </div>
            <div className="card-body">
              <h2 className="h5">Overview</h2>
              <p className="mb-0">
                This is a placeholder overview. Replace with real content,
                gallery, and a spec sheet. You can also render related case
                studies here.
              </p>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5">Key features</h2>
              <ul className="mb-0">
                {product.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-muted">Price guide</h2>
              <p className="display-6">
                {product.leadPrice ? product.leadPrice : "Contact us"}
              </p>
              <p className="text-secondary">
                Prices vary by size, cladding, glazing, foundations, and services.
              </p>
              <div className="d-grid gap-2">
                <Link href="/contact" className="btn btn-primary">
                  Get a quote
                </Link>
                <Link href="/contact" className="btn btn-outline-secondary">
                  Ask a question
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}