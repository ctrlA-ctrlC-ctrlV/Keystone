import { supabaseAdmin, supabase } from "@/lib/supabase";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic"; // run on request only

/* ---------- Types ---------- */
type Product = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  lead_price: string | null;
};

type ProductImage = {
  id: string;
  product_id: string;
  path: string;
  alt: string | null;
  sort_order: number | null;
};

/* ---------- Read data for the page ---------- */
async function getData() {
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, slug, title, summary, lead_price")
    .order("title", { ascending: true });

  if (pErr) throw pErr;

  // get first few images per product (optional display)
  const { data: images, error: iErr } = await supabase
    .from("product_images")
    .select("id, product_id, path, alt, sort_order")
    .order("product_id", { ascending: true })
    .order("sort_order", { ascending: true });

  if (iErr) throw iErr;

  return {
    products: (products ?? []) as Product[],
    imagesByProduct: (images ?? []).reduce<Record<string, ProductImage[]>>((acc, img) => {
      (acc[img.product_id] ||= []).push(img);
      return acc;
    }, {}),
  };
}

/* ---------- Actions (server) ---------- */
async function createProduct(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const lead_price = String(formData.get("lead_price") || "").trim();

  if (!slug || !title) throw new Error("slug and title are required");

  const { error } = await supabaseAdmin
    .from("products")
    .insert({ slug, title, summary: summary || null, lead_price: lead_price || null });

  if (error) throw error;

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
}
async function addImage(formData: FormData) {
  "use server";
  const product_id = String(formData.get("product_id") || "");
  const path = String(formData.get("path") || "").replace(/^\/+/, ""); // no leading slash
  const alt = String(formData.get("alt") || "");
  const sort_order = Number(formData.get("sort_order") || 0);

  if (!product_id || !path) throw new Error("product and path are required");

  const { error } = await supabaseAdmin
    .from("product_images")
    .insert({ product_id, path, alt: alt || null, sort_order });

  if (error) throw error;

  // Find slug to revalidate its detail page
  const { data: prod } = await supabase.from("products").select("slug").eq("id", product_id).single();
  revalidatePath("/products");
  if (prod?.slug) revalidatePath(`/products/${prod.slug}`);
}

async function deleteProduct(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("id required");

  // get slug first for revalidate
  const { data: prod } = await supabase.from("products").select("slug").eq("id", id).single();

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/products");
  if (prod?.slug) revalidatePath(`/products/${prod.slug}`);
}

async function deleteImage(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("id required");
  const { error } = await supabaseAdmin.from("product_images").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/products");
}

/* Clear admin cookie to "log out" */
import { cookies } from "next/headers";
async function logout() {
  "use server";
  
  const cookieStore = await cookies();

  cookieStore.set({
        name:"admin", 
        value:"", 
        path: "/", 
        maxAge: 0 
    });
}

/* ---------- Page ---------- */
export default async function AdminPage() {
  const { products, imagesByProduct } = await getData();

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h4 fw-bold mb-0">Admin</h1>
        <form action={logout}>
          <button className="btn btn-outline-secondary btn-sm">Log out</button>
        </form>
      </div>

      {/* Create product */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h6 text-uppercase text-muted">Create product</h2>
          <form action={createProduct} className="row g-3 mt-1">
            <div className="col-md-4">
              <label className="form-label">Slug</label>
              <input name="slug" className="form-control" placeholder="garden-room" required />
            </div>
            <div className="col-md-8">
              <label className="form-label">Title</label>
              <input name="title" className="form-control" placeholder="Garden Room" required />
            </div>
            <div className="col-12">
              <label className="form-label">Summary</label>
              <textarea name="summary" className="form-control" rows={3} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Lead price</label>
              <input name="lead_price" className="form-control" placeholder="from €12,000" />
            </div>
            <div className="col-12">
              <button className="btn btn-primary">Create</button>
            </div>
          </form>
          <p className="text-secondary small mt-3 mb-0">
            Upload images in <strong>Supabase → Storage → {process.env.SUPABASE_STORAGE_BUCKET || "Products"}</strong>,
            then use the form below to attach them to a product.
          </p>
        </div>
      </div>

      {/* Add image to product */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h6 text-uppercase text-muted">Add image to product</h2>
          <form action={addImage} className="row g-3 mt-1">
            <div className="col-md-5">
              <label className="form-label">Product</label>
              <select name="product_id" className="form-select" required>
                <option value="">Choose…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.slug})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label">Storage path (relative)</label>
              <input
                name="path"
                className="form-control"
                placeholder="garden-room/hero_placeholder.png"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Sort order</label>
              <input name="sort_order" type="number" className="form-control" defaultValue={0} />
            </div>
            <div className="col-12">
              <label className="form-label">Alt text (optional)</label>
              <input name="alt" className="form-control" placeholder="Garden Room — exterior" />
            </div>
            <div className="col-12">
              <button className="btn btn-primary">Add image</button>
            </div>
          </form>
        </div>
      </div>

      {/* Products list */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h6 text-uppercase text-muted">Products</h2>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Lead price</th>
                  <th>Images</th>
                  <th style={{ width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td><code>{p.slug}</code></td>
                    <td>{p.lead_price ?? "–"}</td>
                    <td className="small">
                      {(imagesByProduct[p.id] ?? []).map((img) => (
                        <div key={img.id} className="d-flex align-items-center gap-2">
                          <code className="text-truncate" style={{ maxWidth: 280 }}>{img.path}</code>
                          <form action={deleteImage}>
                            <input type="hidden" name="id" value={img.id} />
                            <button className="btn btn-sm btn-outline-danger">Delete</button>
                          </form>
                        </div>
                      ))}
                      {!(imagesByProduct[p.id]?.length) && <span className="text-secondary">No images</span>}
                    </td>
                    <td>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="btn btn-sm btn-outline-danger">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {!products.length && (
                  <tr>
                    <td colSpan={5} className="text-secondary">No products yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <Link href="/products" className="btn btn-outline-secondary btn-sm">View site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}