import QuoteForm from "./quote-form";
import { loadPrices } from "@/lib/pricing-server";

export const metadata = { title: "Get a Quote — SDeal Construction" };
export default async function QuotePage() {
  const prices = await loadPrices();
  return (<section className="container py-4">
      <h1 className="h2 fw-bold mb-3">Get a Quote</h1>
      <p className="text-secondary">Fill in details to see an instant estimate.</p>
      <QuoteForm prices={prices} />
    </section>
    );//<QuoteForm prices={prices} />;
}