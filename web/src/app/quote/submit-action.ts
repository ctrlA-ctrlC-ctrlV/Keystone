'use server';

import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendQuoteEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import type { QuoteResult, LineItem } from "@/lib/pricing";
import { generateUniqueQuoteId } from "@/lib/quote-id";

// Info needed from client
export type LeadFormValues = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  //customerAddress: string;
  notes?: string;
  deliveryKm: number;
  // You can include discount/extras if you want to persist them:
  // discountAmt?: number;
};

export async function submitLead(args: {
  productSlug: "garden-room" | "house-extension" | "house-build";
  // finishKey removed from calculator; keep it only if you still email/show it somewhere
  // finishKey?: "standard" | "premium-timber" | "aluminium-modern";
  values: LeadFormValues;
  estimate: QuoteResult; // { total: number; items: LineItem[] }
}) {
  const { productSlug, values, estimate } = args;

  // 0) Create a unique quote id (pre-check + retry inside helper)
  let quoteId = await generateUniqueQuoteId(supabaseAdmin);

  // 1) Insert lead (retry once if unique collision happens)
  let leadId: string | null = null;
  let lastErr: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .insert({
        quote_id: quoteId,
        product_slug: productSlug,
        customer_name: values.customerName,
        customer_email: values.customerEmail,
        customer_phone: values.customerPhone ?? null,
        notes: values.notes ?? null,
        delivery_km: values.deliveryKm,
        est_total: estimate.total,
      })
      .select("id, quote_id")
      .single();

    if (!error && lead) {
      leadId = lead.id;
      quoteId = lead.quote_id; // confirm actual value
      break;
    }

    lastErr = error;

    const isUnique =
      (error as { code?: string; message?: string })?.code === "23505" ||
      /duplicate key value/i.test((error as { message?: string })?.message ?? "");

    if (isUnique) {
      quoteId = await generateUniqueQuoteId(supabaseAdmin);
      continue;
    }
    break;
  }

  if (!leadId) {
    throw lastErr instanceof Error ? lastErr : new Error("Failed to create lead");
  }

  // 2) Insert line items
  const rows: {
    lead_id: string;
    key: string;
    label: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    meta: Record<string, unknown>;
  }[] = (estimate.items as LineItem[]).map((it) => ({
    lead_id: leadId as string,
    key: it.key,
    label: it.label,
    quantity: it.quantity,
    unit_price: it.unitPrice,
    line_total: it.lineTotal,
    meta: it.meta ? (it.meta as Record<string, unknown>) : {},
  }));

  const { error: itemsErr } = await supabaseAdmin.from("lead_items").insert(rows);
  if (itemsErr) throw itemsErr;

  // 3) Email the team
  await sendQuoteEmail({
    quoteId,
    productSlug,
    customer: {
      name: values.customerName,
      email: values.customerEmail,
      phone: values.customerPhone,
      notes: values.notes,
    },
    estimate,
  });

  // 4) Revalidate any pages that depend on leads (optional)
  revalidatePath("/");

  return { quoteId };
}
