import 'server-only';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Prices } from './pricing';

type PricingRow = { key: string; value: number };

/** Load flat rows from pricing_rules and assemble into Prices (server-only) */
export async function loadPrices(): Promise<Prices> {
  const { data, error } = await supabaseAdmin
    .from('pricing_rules')
    .select('key,value')
    .returns<PricingRow[]>();

  if (error || !data) {
    const { DEFAULTS } = await import('./pricing');
    return DEFAULTS as Prices;
  }

  const { DEFAULTS } = await import('./pricing');
  const p: Prices = {
    ...DEFAULTS,
    basePerM2: { ...DEFAULTS.basePerM2 },
    fixCharge: { ...DEFAULTS.fixCharge },
    internalWall: { ...DEFAULTS.internalWall },
    flooringPerM2: { ...DEFAULTS.flooringPerM2 },
  };

  for (const row of data) {
    const k = String(row.key);
    const v = Number(row.value);
    switch (k) {
      case 'claddingPerM2': p.claddingPerM2 = v; break;
      case 'bathroomType1': p.bathroomType1 = v; break;
      case 'bathroomType2': p.bathroomType2 = v; break;
      case 'switchEach': p.switchEach = v; break;
      case 'doubleSocketEach': p.doubleSocketEach = v; break;
      case 'internalDoorEach': p.internalDoorEach = v; break;
      case 'windowFixCharge': p.windowFixCharge = v; break;
      case 'windowPerM2': p.windowPerM2 = v; break;
      case 'extDoorFixCharge': p.extDoorFixCharge = v; break;
      case 'extDoorPerM2': p.extDoorPerM2 = v; break;
      case 'skylightFixCharge': p.skylightFixCharge = v; break;
      case 'skylightPerM2': p.skylightPerM2 = v; break;
      case 'deliveryFreeKm': p.deliveryFreeKm = v; break;
      case 'deliveryPerKm': p.deliveryPerKm = v; break;
      case 'vat': p.vat = v; break;
      case 'flooringPerM2.none': p.flooringPerM2['nonePerM2'] = v; break;
      case 'flooringPerM2.wooden': p.flooringPerM2['woodenPerM2'] = v; break;
      case 'flooringPerM2.tile': p.flooringPerM2['tilePerM2'] = v; break;
      case 'internalWall.nonePerM': p.internalWall['nonePerM'] = v; break;
      case 'internalWall.panelPerM': p.internalWall['panelPerM'] = v; break;
      case 'internalWall.skimPerM': p.internalWall['skimPerM'] = v; break;
      case 'fixCharge.garden-room': p.fixCharge['garden-room'] = v; break;
      case 'fixCharge.house-extension': p.fixCharge['house-extension'] = v; break;
      case 'fixCharge.house-build': p.fixCharge['house-build'] = v; break;
      case 'basePerM2.garden-room': p.basePerM2['garden-room'] = v; break;
      case 'basePerM2.house-extension': p.basePerM2['house-extension'] = v; break;
      case 'basePerM2.house-build': p.basePerM2['house-build'] = v; break;
      default: break;
    }
  }

  return p;
}
