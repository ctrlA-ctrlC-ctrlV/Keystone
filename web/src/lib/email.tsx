import { Resend } from "resend";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY!);

export function QuoteEmail({
  quoteId,
  productSlug,
  customer,
  estimate,
}: {
  quoteId: string;
  productSlug: string;
  customer: { name?: string; email?: string; phone?: string; notes?: string };
  estimate: { total: number; items: { label: string; quantity: number; unitPrice: number; lineTotal: number }[] };
}) {
  return (
    <div>
      <h2>New Quote Request — {quoteId}</h2>
      <p><strong>Product:</strong> {productSlug}</p>
      <p>
        <strong>Customer:</strong> {customer.name || "—"} — {customer.email || "—"} — {customer.phone || "—"}
      </p>
      {customer.notes && <p><strong>Notes:</strong> {customer.notes}</p>}

      <h3>Estimate</h3>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr><th align="left">Item</th><th align="right">Qty</th><th align="right">Unit</th><th align="right">Total</th></tr>
        </thead>
        <tbody>
          {estimate.items.map((it, i) => (
            <tr key={i}>
              <td>{it.label}</td>
              <td align="right">{it.quantity}</td>
              <td align="right">€{it.unitPrice.toFixed(0)}</td>
              <td align="right">€{it.lineTotal.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={3}><strong>Total</strong></td><td align="right"><strong>€{estimate.total.toFixed(0)}</strong></td></tr>
        </tfoot>
      </table>
    </div>
  );
}

export async function sendQuoteEmail(args: Parameters<typeof QuoteEmail>[0]) {
  const to = process.env.SALES_INBOX!;
  const subject = `New Quote — ${args.quoteId} — ${args.productSlug}`;
  const { data, error } = await resend.emails.send({
    from: "SDeal Quotes <quotes@yourdomain.com>", // set up a domain in Resend
    to,
    subject,
    react: QuoteEmail(args),
  });
  if (error) throw error;
  return data;
}