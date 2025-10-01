'use client';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, type Resolver  } from "react-hook-form";
import { useMemo, useState } from "react";
import { calculateQuote, Prices } from "@/lib/pricing";
import { submitLead, type LeadFormValues } from "./submit-action";

const schema = z.object({
  productSlug: z.enum(["garden-room","house-extension","house-build"]),
  roomAreaM2: z.coerce.number().min(4).max(200),
  claddingAreaM2: z.coerce.number().min(0).max(800).default(0),

  bathroomType1Qty: z.coerce.number().min(0).max(10).default(0),
  bathroomType2Qty: z.coerce.number().min(0).max(10).default(0),

  switchesQty: z.coerce.number().min(0).max(50).default(0),
  doubleSocketsQty: z.coerce.number().min(0).max(50).default(0),

  internalDoorsQty: z.coerce.number().min(0).max(20).default(0),
  internalWallM: z.coerce.number().min(0).max(200).default(0),
  internalWallSlug: z.enum(["nonePerM","panelPerM","skimPerM"]).default("nonePerM"),

  windowsQty: z.coerce.number().min(0).max(20).default(0),
  windowSizeM2: z.coerce.number().min(0).max(10).default(0),

  exteriorDoorsQty: z.coerce.number().min(0).max(10).default(0),
  exteriorDoorSizeM2: z.coerce.number().min(0).max(10).default(0),

  skylightsQty: z.coerce.number().min(0).max(10).default(0),
  skylightSizeM2: z.coerce.number().min(0).max(10).default(0),

  flooringSlug: z.enum(["nonePerM2","woodenPerM2","tilePerM2"]).default("nonePerM2"),
  flooringAreaM2: z.coerce.number().min(0).max(300).default(0),

  deliveryKm: z.coerce.number().min(0).max(1000).default(0),
  discountAmt: z.coerce.number().min(0).max(1_000_000).default(0),

  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  //customerAddress: z.string(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function QuoteForm({ prices }: { prices: Prices }) {
    const [submitting, setSubmitting] = useState(false);

    const { 
            register, 
            handleSubmit, 
            watch, 
            formState: { errors } 
        } = useForm<FormValues>({
        resolver: zodResolver(schema) as Resolver<FormValues>,
        defaultValues: {
        productSlug: "garden-room",
        roomAreaM2: 12,
        claddingAreaM2: 0,

        bathroomType1Qty: 0,
        bathroomType2Qty: 0,

        switchesQty: 2,
        doubleSocketsQty: 4,

        internalDoorsQty: 0,
        internalWallM: 0,
        internalWallSlug: "nonePerM",

        windowsQty: 2,
        windowSizeM2: 1.2,

        exteriorDoorsQty: 1,
        exteriorDoorSizeM2: 2.0,

        skylightsQty: 0,
        skylightSizeM2: 0,

        flooringSlug: "nonePerM2",
        flooringAreaM2: 12,

        deliveryKm: 25,
        discountAmt: 0,
        },
    });

    const values = watch();

    const estimate = useMemo(
        () =>
        calculateQuote(
            {
            productSlug: values.productSlug,
            roomAreaM2: values.roomAreaM2,
            claddingAreaM2: values.claddingAreaM2,

            bathroomType1Qty: values.bathroomType1Qty,
            bathroomType2Qty: values.bathroomType2Qty,

            switchesQty: values.switchesQty,
            doubleSocketsQty: values.doubleSocketsQty,

            internalDoorsQty: values.internalDoorsQty,
            internalWallM: values.internalWallM,
            internalWallSlug: values.internalWallSlug,

            windows: { qty: values.windowsQty, sizeM2: values.windowSizeM2 },
            exteriorDoors: { qty: values.exteriorDoorsQty, sizeM2: values.exteriorDoorSizeM2 },
            skylights: { qty: values.skylightsQty, sizeM2: values.skylightSizeM2 },

            flooringSlug: values.flooringSlug,
            flooringAreaM2: values.flooringAreaM2,

            deliveryKm: values.deliveryKm,
            discountAmt: values.discountAmt,
            extrasNote: values.notes,
            },
            prices
        ),
        [values, prices]
    );

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitting(true);
    try {
        // pass only the fields your server action expects (LeadFormValues)
        const leadValues: LeadFormValues = {
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            //customerAddress: data.customerAddress,
            notes: data.notes,
            deliveryKm: data.deliveryKm,
        };

        const result = await submitLead({
            productSlug: data.productSlug,
            values: leadValues,
            estimate,
        });

        alert(`Thanks! Your quote ID is ${result.quoteId}. We’ll be in touch.`);
        } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to submit. Please try again.";
        alert(msg);
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="col-lg-8">
            {/* Product */}
            <div className="card shadow-sm mb-3">
            <div className="card-body row g-3">
                <div className="col-md-6">
                <label className="form-label">Product</label>
                <select className="form-select" {...register("productSlug")}>
                    <option value="garden-room">Garden Room</option>
                    <option value="house-extension">House Extension</option>
                    <option value="house-build">House Build</option>
                </select>
                </div>
            </div>
            </div>

            {/* Dimensions & Options */}
            <div className="card shadow-sm">
            <div className="card-body row g-3">
                <div className="col-md-4">
                <label className="form-label">Room area (m²)</label>
                <input type="number" step="0.1" className="form-control" {...register("roomAreaM2")} />
                {errors.roomAreaM2 && <small className="text-danger">{errors.roomAreaM2.message}</small>}
                </div>
                <div className="col-md-4">
                <label className="form-label">Cladding area (m²)</label>
                <input type="number" step="0.1" className="form-control" {...register("claddingAreaM2")} />
                </div>
                <div className="col-md-4">
                <label className="form-label">Delivery distance (km)</label>
                <input type="number" step="1" className="form-control" {...register("deliveryKm")} />
                </div>

                <div className="col-md-4">
                <label className="form-label">Bathrooms: toilet+sink</label>
                <input type="number" className="form-control" {...register("bathroomType1Qty")} />
                </div>
                <div className="col-md-4">
                <label className="form-label">Bathrooms: toilet+sink+shower</label>
                <input type="number" className="form-control" {...register("bathroomType2Qty")} />
                </div>

                <div className="col-md-4">
                <label className="form-label">Switches</label>
                <input type="number" className="form-control" {...register("switchesQty")} />
                </div>
                <div className="col-md-4">
                <label className="form-label">Double sockets</label>
                <input type="number" className="form-control" {...register("doubleSocketsQty")} />
                </div>

                <div className="col-md-4">
                <label className="form-label">Internal doors</label>
                <input type="number" className="form-control" {...register("internalDoorsQty")} />
                </div>

                <div className="col-md-4">
                <label className="form-label">Internal wall (m)</label>
                <input type="number" className="form-control" {...register("internalWallM")} />
                </div>
                <div className="col-md-4">
                <label className="form-label">Wall type</label>
                <select className="form-select" {...register("internalWallSlug")}>
                    <option value="nonePerM">None</option>
                    <option value="panelPerM">Panel</option>
                    <option value="skimPerM">Skim</option>
                </select>
                </div>

                <div className="col-md-4">
                <label className="form-label">Windows qty</label>
                <input type="number" className="form-control" {...register("windowsQty")} />
                </div>
                <div className="col-md-4">
                <label className="form-label">Window size (m²)</label>
                <input type="number" step="0.1" className="form-control" {...register("windowSizeM2")} />
                </div>

                <div className="col-md-4">
                <label className="form-label">Exterior doors qty</label>
                <input type="number" className="form-control" {...register("exteriorDoorsQty")} />
                </div>
                <div className="col-md-4">
                <label className="form-label">Exterior door size (m²)</label>
                <input type="number" step="0.1" className="form-control" {...register("exteriorDoorSizeM2")} />
                </div>

                <div className="col-md-4">
                <label className="form-label">Skylights qty</label>
                <input type="number" className="form-control" {...register("skylightsQty")} />
                </div>
                <div className="col-md-4">
                <label className="form-label">Skylight size (m²)</label>
                <input type="number" step="0.1" className="form-control" {...register("skylightSizeM2")} />
                </div>

                <div className="col-md-4">
                <label className="form-label">Flooring type</label>
                <select className="form-select" {...register("flooringSlug")}>
                    <option value="nonePerM2">None</option>
                    <option value="woodenPerM2">Wooden</option>
                    <option value="tilePerM2">Tile</option>
                </select>
                </div>
                <div className="col-md-4">
                <label className="form-label">Flooring area (m²)</label>
                <input type="number" step="0.1" className="form-control" {...register("flooringAreaM2")} />
                </div>

                <div className="col-md-4">
                <label className="form-label">Discount (€)</label>
                <input type="number" step="0.01" className="form-control" {...register("discountAmt")} />
                </div>

                <div className="col-12">
                <label className="form-label">Notes / extras</label>
                <textarea className="form-control" rows={3} {...register("notes")} />
                </div>
            </div>
            </div>

            <div className="mt-3">
            <button className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit quote"}
            </button>
            </div>
        </div>

        {/* Sidebar summary */}
        <aside className="col-lg-4">
            <div className="card shadow-sm">
            <div className="card-body">
                <h2 className="h6 text-uppercase text-muted">Estimate</h2>
                <ul className="list-unstyled small">
                {estimate.items.map((it, i) => (
                    <li key={i} className="d-flex justify-content-between">
                    <span>{it.label} × {it.quantity}</span>
                    <span>€{it.lineTotal.toFixed(0)}</span>
                    </li>
                ))}
                </ul>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                <strong>Total</strong>
                <strong>€{estimate.total.toFixed(0)}</strong>
                </div>
            </div>
            </div>

            <div className="card shadow-sm mt-3">
            <div className="card-body">
                <h2 className="h6 text-uppercase text-muted">Your details</h2>
                <div className="mb-2">
                <label className="form-label">Name</label>
                <input className="form-control" {...register("customerName")} />
                </div>
                <div className="mb-2">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" {...register("customerEmail")} />
                </div>
                <div className="mb-2">
                <label className="form-label">Phone (optional)</label>
                <input className="form-control" {...register("customerPhone")} />
                </div>
                {/** <div className="mb-2">
                <label className="form-label">Address</label>
                <input className="form-control" {...register("customerAddress")} />
                </div>*/}
            </div>
            </div>
        </aside>
        </form>
    );
}