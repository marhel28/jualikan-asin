export type CutType = 'utuh_bersih' | 'fillet_tanpa_kulit' | 'steak_melintang'
export type PackagingType = 'thermal_bag' | 'styrofoam_box' | 'insulated_pouch' | string

export interface DeliveryPackagingOption {
  id: string
  name: string
  duration: string
  note: string
  fee: number
  isActive: boolean
  isDefault?: boolean
  sortOrder?: number
}

export const DEFAULT_PACKAGING_OPTIONS: DeliveryPackagingOption[] = [
  {
    id: 'thermal_bag',
    name: 'Thermal Bag + 2 Ice Gel',
    duration: 'Tahan 8 Jam',
    note: 'Rute lokal & kota terdekat',
    fee: 7500,
    isActive: true,
    isDefault: true,
    sortOrder: 1
  },
  {
    id: 'styrofoam_box',
    name: 'Box Styrofoam + Ice Gel',
    duration: 'Tahan 24 Jam',
    note: 'Rute luar kota & provinsi',
    fee: 18000,
    isActive: true,
    isDefault: false,
    sortOrder: 2
  },
  {
    id: 'insulated_pouch',
    name: 'Insulated Pouch Ringan',
    duration: 'Tahan 4 Jam',
    note: 'Khusus rute instan radius 10 km',
    fee: 4000,
    isActive: true,
    isDefault: false,
    sortOrder: 3
  }
]

export const YIELD_RATIOS: Record<CutType, number> = {
  utuh_bersih: 0.85,
  fillet_tanpa_kulit: 0.52,
  steak_melintang: 0.80
}

export const CUT_LABELS: Record<CutType, { label: string; desc: string; yieldBadge: string }> = {
  utuh_bersih: {
    label: 'Utuh Bersih',
    desc: 'Kerok sisik, buang insang & isi perut',
    yieldBadge: '~850g/kg (Rendemen 85%)'
  },
  fillet_tanpa_kulit: {
    label: 'Fillet Tanpa Kulit',
    desc: 'Daging murni tanpa tulang & duri',
    yieldBadge: '~520g/kg (Rendemen 52%)'
  },
  steak_melintang: {
    label: 'Steak Melintang',
    desc: 'Potong bulat tebal 2.5 cm siap masak',
    yieldBadge: '~800g/kg (Rendemen 80%)'
  }
}

export const PACKAGING_FEES: Record<string, { name: string; fee: number; duration: string; note: string }> = {
  thermal_bag: {
    name: 'Thermal Bag + 2 Ice Gel',
    fee: 7500,
    duration: 'Tahan 8 Jam',
    note: 'Pengiriman Lokal / Kota Terdekat'
  },
  styrofoam_box: {
    name: 'Box Styrofoam + Ice Gel',
    fee: 18000,
    duration: 'Tahan 24 Jam',
    note: 'Luar Kota / Antar Provinsi'
  },
  insulated_pouch: {
    name: 'Insulated Pouch Ringan',
    fee: 4000,
    duration: 'Tahan 4 Jam',
    note: 'Khusus rute instan radius 10 km'
  }
}

export const FREE_SHIPPING_THRESHOLD = 300000

/**
 * Calculates net edible weight from gross weight and cut type.
 */
export function calcNetWeight(grossKg: number, cutType: CutType | string): number {
  const ratio = (cutType in YIELD_RATIOS ? YIELD_RATIOS[cutType as CutType] : 0.85) || 0.85
  const parsedGross = typeof grossKg === 'number' ? grossKg : Number(grossKg)
  if (isNaN(parsedGross) || parsedGross <= 0) return 0
  return Number((parsedGross * ratio).toFixed(2))
}
