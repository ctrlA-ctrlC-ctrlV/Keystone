import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  lead_price: string | null;
  images: { path: string; alt: string | null; sort_order: number | null} [];
};

async function getProducts(): Promise<ProductRow[]> {
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id, slug, title, summary, lead_price,
      images:product_images(path, alt, sort_order)  
    `)
    .order("title", { ascending: true});

    if (error) throw error;
    return (products ?? []) as ProductRow[];
}

export default async function ProductsPage() {
  const items = await getProducts();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET_PRODUCTS || "products";
  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}`;

  return (
    <>
      <h1 className="h2 fw-bold mb-4">Products</h1>

      <div className="row g-4">
        {items.map((p) => {
          const hero = p.images?.slice().sort((a, b)=>(a.sort_order??0)-(b.sort_order??0))[0];
          const heroUrl = hero ? `${publicBase}/${hero.path}` : undefined;

          return (
            <div className="col-md-6 col-lg-4" key={p.id}>
              <div className="card h-100 shadow-sm">
                <div className="ratio ratio-4x3 bg-light rounded-top">
                  {heroUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={heroUrl} alt={hero?.alt ?? p.title} className="w-100 h-100 object-fit-cover rounded-top" />
                  )}
                </div>
                <div className="card-body">
                  <h2 className="h5">{p.title}</h2>
                  {p.lead_price && <p className="text-secondary">{p.lead_price}</p>}
                  <p className="text-secondary">{p.summary}</p>
                  <div className="d-flex gap-2">
                    <Link href={`/products/${p.slug}`} className="btn btn-primary btn-sm">View details</Link>
                    <Link href={`/contact`} className="btn btn-outline-secondary btn-sm">Request a quote</Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  );
}