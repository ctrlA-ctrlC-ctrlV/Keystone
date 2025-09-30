// src/lib/pricing.ts
import { supabaseAdmin } from "@/lib/supabase";

/** What UI/engine expects to receive */
export type Prices = {
  basePerM2: Record<"garden-room" | "house-extension" | "house-build", number>;
  fixCharge: Record<"garden-room" | "house-extension" | "house-build", number>;
  claddingPerM2: number;
  bathroomType1: number;    //Bathroom (toilet+sink)
  bathroomType2: number;    //Bathroom (toilet+sink+shower)
  switchEach: number;
  doubleSocketEach: number;
  internalDoorEach: number;
  internalWall: Record<"nonePerM" | "panelPerM" | "skimPerM", number>;
  windowFixCharge: number;
  windowPerM2: number;
  extDoorFixCharge: number;
  extDoorPerM2: number;
  skylightFixCharge: number;
  skylightPerM2: number;
  flooringPerM2: Record<"nonePerM2"| "woodenPerM2" | "tilePerM2", number>;
  deliveryFreeKm: number;
  deliveryPerKm: number;
  vat: number;
};

/** Fallbacks used only if DB rows are missing */
const DEFAULTS: Prices = {
  basePerM2: {
    "garden-room": 1200,
    "house-extension": 1800,
    "house-build": 2000,
  },
  fixCharge: {
    "garden-room": 6000,
    "house-extension": 6000,
    "house-build": 6000,
  },
  claddingPerM2: 80,
  bathroomType1: 2500,    //Bathroom (toilet+sink)
  bathroomType2: 4500,    //Bathroom (toilet+sink+shower)
  switchEach: 50,
  doubleSocketEach: 60,
  internalDoorEach: 200,
  internalWall: { 
    "nonePerM": 0, 
    "panelPerM": 200, 
    "skimPerM": 300 
  },
  windowFixCharge: 500,
  windowPerM2: 400,
  extDoorFixCharge: 500,
  extDoorPerM2: 400,
  skylightFixCharge: 900,
  skylightPerM2: 750,
  flooringPerM2: {
    "nonePerM2": 0,
    "woodenPerM2": 40,
    "tilePerM2": 60
  },
  deliveryFreeKm: 30,
  deliveryPerKm: 2.2,
  vat: 13.5,
};

/** Load flat rows from pricing_rules and assemble into Prices */
export async function loadPrices(): Promise<Prices> {
  // RLS can be "deny all": service role bypasses it
  const { data, error } = await supabaseAdmin
    .from("pricing_rules")
    .select("key,value");

  if (error || !data) {
    // On error, use defaults
    return DEFAULTS;
  }

  // Start from defaults, overwrite with DB values that exist
  const p: Prices = JSON.parse(JSON.stringify(DEFAULTS)); // simple deep clone

  for (const row of data) {
    const k = String(row.key);
    const v = Number(row.value);

    switch (k) {
      case "claddingPerM2": p.claddingPerM2 = v; break;
      case "bathroomType1": p.bathroomType1 = v; break;
      case "bathroomType2": p.bathroomType2 = v; break;
      case "switchEach": p.switchEach = v; break;
      case "doubleSocketEach": p.doubleSocketEach = v; break;
      case "internalDoorEach": p.internalDoorEach = v; break;
      case "windowFixCharge": p.windowFixCharge = v; break;
      case "windowPerM2": p.windowPerM2 = v; break;
      case "extDoorFixCharge": p.extDoorFixCharge = v; break;
      case "extDoorPerM2": p.extDoorPerM2 = v; break;
      case "skylightFixCharge": p.skylightFixCharge = v; break;
      case "skylightPerM2": p.skylightPerM2 = v; break;
      case "deliveryFreeKm": p.deliveryFreeKm = v; break;
      case "deliveryPerKm": p.deliveryPerKm = v; break;
      case "vat": p.vat = v; break;

      case "flooringPerM2.none":p.flooringPerM2["nonePerM2"] = v; break;
      case "flooringPerM2.wooden":p.flooringPerM2["woodenPerM2"] = v; break;
      case "flooringPerM2.tile":p.flooringPerM2["woodenPerM2"] = v; break;

      case "internalWall.nonePerM": p.internalWall["nonePerM"] = v; break;
      case "internalWall.panelPerM": p.internalWall["panelPerM"] = v; break;
      case "internalWall.skimPerM": p.internalWall["skimPerM"] = v; break;

      case "fixCharge.garden-room": p.fixCharge["garden-room"] = v; break;
      case "fixCharge.house-extension": p.fixCharge["house-extension"] = v; break;
      case "fixCharge.house-build": p.fixCharge["house-build"] = v; break;

      case "basePerM2.garden-room": p.basePerM2["garden-room"] = v; break;
      case "basePerM2.house-extension": p.basePerM2["house-extension"] = v; break;
      case "basePerM2.house-build": p.basePerM2["house-build"] = v; break;

      default:
        // ignore unknown keys for now (future-proof)
        break;
    }
  }

  return p;
}

/** Your existing types for calculation */
export type QuoteInputs = {
  productSlug: "garden-room" | "house-extension" | "house-build";
  roomAreaM2: number;
  claddingAreaM2: number;
  bathroomType1Qty: number;
  bathroomType2Qty: number;
  switchesQty: number;
  doubleSocketsQty: number;
  internalDoorsQty: number;
  internalWallM: number;
  internalWallSlug: "nonePerM" | "panelPerM" | "skimPerM";
  windows: { qty: number; sizeM2: number };
  exteriorDoors: { qty: number; sizeM2: number };
  skylights: { qty: number; sizeM2: number };
  flooringSlug: "nonePerM2"| "woodenPerM2" | "tilePerM2";
  flooringAreaM2: number ;
  deliveryKm: number;
  discountAmt: number;
  extrasNote?: string;
};

export type LineItem = {
  key: string;
  label: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  meta?: Record <string, any>;
};

export type QuoteResult = { items: LineItem[]; total: number };

/** Calculate Quote Prices */
export function calculateQuote(input: QuoteInputs, PRICES: Prices): QuoteResult{
  const items: LineItem[] = [];

  // Room Size or Gross Floor Area Calculation
  const baseUnitPerM2 = PRICES.basePerM2[input.productSlug];
  const baseUnitFixCharge = PRICES.fixCharge[input.productSlug];
  const baseTotal = input.roomAreaM2 * baseUnitPerM2 + baseUnitFixCharge;
  items.push({
    key: "base_area",
    label: "Gross floor area (m²)",
    quantity: input.roomAreaM2,
    unitPrice: baseUnitPerM2,
    lineTotal: baseTotal,
  });

  // Cladding Calculation
  items.push({
    key: "cladding",
    label: "Cladding (m²)",
    quantity: input.claddingAreaM2,
    unitPrice: PRICES.claddingPerM2,
    lineTotal: input.claddingAreaM2 * PRICES.claddingPerM2,
  });

  // Bathroom Type 1 Calculation
  if (input.bathroomType1Qty > 0){
    items.push({
      key: "bathroom_t1",
      label: "Bathroom 1 (Toilet+Sink+Under Sink Heater)",
      quantity: input.bathroomType1Qty,
      unitPrice: PRICES.bathroomType1,
      lineTotal: input.bathroomType1Qty * PRICES.bathroomType1,
    });
  }

  // Bathroom Type 1 Calculation
  if (input.bathroomType2Qty > 0){
    items.push({
      key: "bathroom_t2",
      label: "Bathroom (Toilet+Sink+Shower+Electric Boiler 80L)",
      quantity: input.bathroomType2Qty,
      unitPrice: PRICES.bathroomType2,
      lineTotal: input.bathroomType2Qty * PRICES.bathroomType2,
    });
  }

  // Switch Calculation
  if (input.switchesQty > 0){
    items.push({
      key: "switches",
      label: "Switches",
      quantity: input.switchesQty,
      unitPrice: PRICES.switchEach,
      lineTotal: input.switchesQty * PRICES.switchEach,
    });
  }

  // Double Socket Calculation
  if (input.doubleSocketsQty > 0){
    items.push({
      key: "double_socket",
      label: "Double Sockets",
      quantity: input.doubleSocketsQty,
      unitPrice: PRICES.doubleSocketEach,
      lineTotal: input.doubleSocketsQty * PRICES.doubleSocketEach,
    });
  }

  // Internal Door Calculation
  if (input.internalDoorsQty > 0){
    items.push({
      key: "internal_doors",
      label: "Internal Doors",
      quantity: input.internalDoorsQty,
      unitPrice: PRICES.internalDoorEach,
      lineTotal: input.internalDoorsQty * PRICES.internalDoorEach,
    });
  }

  // Internal Wall Calculation
  if (input.internalWallM > 0){
    const internalWallTypePerM = PRICES.internalWall[input.internalWallSlug];
    const internalWallTotal = internalWallTypePerM * input.internalWallM;
    items.push({
      key: "internal_wall",
      label: `Internal wall (${input.internalWallSlug})`,
      quantity: input.internalDoorsQty,
      unitPrice: internalWallTypePerM,
      lineTotal: internalWallTotal,
    });
  }

  // Window Calculation
  if (input.windows.qty > 0 && input.windows.sizeM2 > 0) {
    const qtyArea = input.windows.qty * input.windows.sizeM2;
    items.push({
      key: "windows",
      label: "Windows (m²)",
      quantity: qtyArea,
      unitPrice: PRICES.windowPerM2,
      lineTotal: qtyArea * PRICES.windowPerM2,
      meta: input.windows as any,
    });
  }

  // Exterior Door Calculation
  if (input.exteriorDoors.qty > 0 && input.exteriorDoors.sizeM2 > 0) {
    const qtyArea = input.exteriorDoors.qty * input.exteriorDoors.sizeM2;
    items.push({
      key: "ext_doors",
      label: "Exterior doors (m²)",
      quantity: qtyArea,
      unitPrice: PRICES.extDoorPerM2,
      lineTotal: qtyArea * PRICES.extDoorPerM2,
      meta: input.exteriorDoors as any,
    });
  }

  // Skylight Calculation
  if (input.skylights.qty > 0 && input.skylights.sizeM2 > 0) {
    const qtyArea = input.skylights.qty * input.skylights.sizeM2;
    items.push({
      key: "skylights",
      label: "Exterior doors (m²)",
      quantity: qtyArea,
      unitPrice: PRICES.skylightPerM2,
      lineTotal: qtyArea * PRICES.skylightPerM2 + PRICES.skylightFixCharge,
      meta: input.exteriorDoors as any,
    });
  }

  // Fllor Calculation
  if (input.flooringAreaM2 > 0){
    const flooringTypePerM = PRICES.flooringPerM2[input.flooringSlug];
    const flooringTotal = flooringTypePerM * input.flooringAreaM2;
    items.push({
      key: "internal_wall",
      label: `Internal wall (${input.internalWallSlug})`,
      quantity: input.flooringAreaM2,
      unitPrice: flooringTypePerM,
      lineTotal: flooringTotal,
    });
  }

  const ExtraSubTotal = 0;
  const noneExtrasubTotal = items.reduce((s, it) => s + it.lineTotal, 0);
  const subtotal = noneExtrasubTotal + ExtraSubTotal;

  const discount = input.discountAmt;
  const net = subtotal - discount;
  const vat = PRICES.vat > 0 ? net * (PRICES.vat / 100) : 0;
  const total = net + vat;

  return { items, total };
}