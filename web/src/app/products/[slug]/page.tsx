import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LightboxClient from "./lightbox-client";

export const revalidate = 60;

/* --------- Types ------------ */
type ProductImage = {
  path: string;
  alt: string | null;
  sort_order: number | null;
};

type Product = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  lead_price: string | null;
  images: ProductImage[] | null;
};

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET_PRODUCTS || "products";

function publicUrl(path?: string | null) {
  if (!path) return undefined;
  const clean = path.replace(/^\/+/, "").replace(/^Products\/+/, '');
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(clean);
  return data.publicUrl;
}

async function getProducts(slug: string) {
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      id, slug, title, summary, lead_price,
      images:product_images(path, alt, sort_order)
    `)
    .eq("slug", slug)
    .single();

  if(error && error.code !== "PGRST116") throw error; // not found error
  return product as Product | null;
} 

/** Static generation for each product */
export async function generateStaticParams() {
  const {data, error } = await supabase.from("products").select("slug");
  if (error || !data) return [];
  return (data ?? []).map((p:{slug: string}) => ({ slug: p.slug }));
}

/** per-page SEO */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProducts(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.title} — Products`,
    description: product.summary ?? "",
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProducts(slug);
  if (!product) return notFound();

  /*const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publicBase = `${supaUrl.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}`;
  const imgs: ProductImage[]  = 
    (product.images ?? []).slice().sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));
  const hero = imgs[0];
  const heroUrl = hero ? publicUrl(hero.path) : undefined;*/
  //const heroUrl = hero ? buildImageUrl(publicBase, hero.path) : undefined;
  //const heroUrl = hero ? `${publicBase}/${hero.path}` : undefined;

  const imgs: ProductImage[] = (product.images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const hero = imgs[0];
  const heroUrl = publicUrl(hero?.path);

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
                       
              {heroUrl && (
                //eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroUrl}
                  alt={hero?.alt ?? product.title}
                  className="w-100 h-100 object-fit-cover rounded-top"
                  role="button"
                  data-bs-toggle="modal"
                  data-bs-target="#lightboxModal"
                />
              )}
            </div>
            <div className="card-body">
              <h2 className="h5">Overview</h2>
              <p className="mb-0">
                Replace with real content in the future.
              </p>
            </div>
          </div>

          {/* Thumbs */}
          <div className="row g-3">
            {imgs.map((img, i)=>{
              const url = publicUrl(img.path);
              //const url = `${publicBase}/${img.path}`;
              return (
                <div className="col-4 col-md-3" key={`${img.path}-${i}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={img.alt ?? product.title}
                    className="img-fluid rounded shadow-sm"
                    role="button"
                    data-bs-toggle="modal"
                    data-bs-target="#lightboxModal"
                    data-bs-image={url}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <aside className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-muted">Price guide</h2>
              <p className="display-6">
                {product.lead_price ?? "Contact us"}
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

      {/* Lightbox Modal */}
      <div className="modal fade" id="lightboxModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <button type="button" className="btn-close ms-auto me-2 mt-2" data-bs-dismiss="modal" aria-label="Close"></button>
            <div className="modal-body p-0">
              {/* The img src is dynamically set by a small script in a client component below */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img id="lightboxImage" src={heroUrl} alt={product.title} className="w-100 h-auto rounded-bottom"/>
            </div>
          </div>
        </div>
      </div>
      <LightboxClient />
    </>
  );
}