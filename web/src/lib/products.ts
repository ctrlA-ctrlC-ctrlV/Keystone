export type Product = {
  slug: "garden-room" | "house-extension" | "house-build";
  title: string;
  leadPrice?: string;
  heroImage?: string; // path under /public
  summary: string;
  features: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "garden-room",
    title: "Garden Room",
    leadPrice: "from €12,000",
    heroImage: "/garden-room.jpg", // add real images later
    summary:
      "A standalone, insulated workspace or leisure room with fast installation.",
    features: ["Insulated panels", "Choice of cladding", "uPVC/Alu doors"],
  },
  {
    slug: "house-extension",
    title: "House Extension",
    leadPrice: "from €25,000",
    heroImage: "/house-extension.jpg",
    summary:
      "Single- or double-storey extensions designed for energy efficiency.",
    features: ["Building regs compliant", "Structural design", "Rapid build"],
  },
  {
    slug: "house-build",
    title: "House Build",
    leadPrice: "custom",
    heroImage: "/house-build.jpg",
    summary:
      "Full new-build projects with turnkey management from planning to handover.",
    features: ["Planning support", "Project management", "Warranty included"],
  },
];

export function getAllProducts() {
  return PRODUCTS;
}

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
} 