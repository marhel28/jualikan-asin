import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { Product } from '~/data/products'

export interface ResolvedTier1Option {
  id: string
  label: string
  weightValue: number // in kg
  price: number
  stock: number
  inStock: boolean
}

export interface ResolvedTier2Option {
  id: string
  label: string
  priceDelta: number
  inStock: boolean
}

export interface ResolvedPriceInfo {
  minPrice: number
  maxPrice: number
  isRange: boolean
  displayPrice: string
  unitLabel: string
  subtext?: string
  hasVariants: boolean
}

export interface ResolvedProductPrice {
  tier1Config: {
    name: string
    unit: 'gram' | 'kg' | 'pack'
    options: ResolvedTier1Option[]
  }
  tier2Config: {
    enabled: boolean
    name: string
    options: ResolvedTier2Option[]
  }
  priceInfo: ResolvedPriceInfo
}

// ponytail: single source of truth for variant resolution and price ranges between catalog cards and detail pages
export function resolveProductPricing(product: Product | null | undefined): ResolvedProductPrice {
  if (!product) {
    return {
      tier1Config: { name: 'Pilihan Ukuran', unit: 'gram', options: [] },
      tier2Config: { enabled: false, name: '', options: [] },
      priceInfo: {
        minPrice: 0,
        maxPrice: 0,
        isRange: false,
        displayPrice: 'Rp 0',
        unitLabel: '',
        hasVariants: false
      }
    }
  }

  const masterStockKg = product.stockKg ?? 0
  const isPack = product.unit === 'pack'
  const cv = product.customVariants
  const baseKgPrice = Number(product.pricePerKg) || 0

  // 1. Resolve Tier 1 Options
  let tier1Name = 'Pilihan Berat'
  let tier1Unit: 'gram' | 'kg' | 'pack' = 'gram'
  let tier1Options: ResolvedTier1Option[] = []

  if (cv?.tier1?.options && cv.tier1.options.length > 0) {
    tier1Name = cv.tier1.name || (cv.tier1.unit === 'pack' ? 'Pilihan Kemasan' : 'Pilihan Berat')
    tier1Unit = (cv.tier1.unit === 'kg' ? 'kg' : cv.tier1.unit === 'pack' ? 'pack' : 'gram')
    tier1Options = cv.tier1.options.map((opt: any, idx: number) => {
      const weightVal = Number(opt.weightValue) || (
        tier1Unit === 'kg' 
          ? (Number(opt.label) || 1) 
          : tier1Unit === 'pack' 
            ? ((product.packWeightGrams || 200) / 1000) 
            : ((Number(opt.label) || 100) / 1000)
      )

      let optStock = 0
      if (masterStockKg <= 0) {
        optStock = 0
      } else if (isPack || tier1Unit === 'pack') {
        optStock = Math.floor(masterStockKg)
      } else {
        optStock = Math.floor(masterStockKg / Math.max(0.01, weightVal))
      }

      const available = opt.inStock !== false && (opt.stock !== undefined ? opt.stock > 0 : optStock > 0)

      return {
        id: opt.id || `opt-${idx}`,
        label: String(opt.label),
        weightValue: weightVal,
        price: Number(opt.price) || 0,
        stock: optStock,
        inStock: available
      }
    })
  } else if (isPack) {
    // Pack products without custom variants: preserve exact single pack price
    const packGrams = product.packWeightGrams || 200
    const weightVal = packGrams / 1000
    const optStock = masterStockKg > 0 ? Math.floor(masterStockKg) : 0
    tier1Name = 'Pilihan Kemasan'
    tier1Unit = 'pack'
    tier1Options = [
      {
        id: 'opt-pack',
        label: `${packGrams}g`,
        weightValue: weightVal,
        price: baseKgPrice,
        stock: optStock,
        inStock: optStock > 0
      }
    ]
  } else {
    // Catch-weight fresh fish: default standard 4 portions matching cold-chain butchering
    tier1Name = 'Pilihan Berat'
    tier1Unit = 'gram'
    const defaultGrams = [100, 150, 200, 250]
    tier1Options = defaultGrams.map(g => {
      const weightVal = g / 1000
      const optStock = masterStockKg > 0 ? Math.floor(masterStockKg / weightVal) : 0
      return {
        id: `opt-${g}`,
        label: String(g),
        weightValue: weightVal,
        price: Math.max(5000, Math.round((baseKgPrice * weightVal) / 500) * 500),
        stock: optStock,
        inStock: optStock > 0
      }
    })
  }

  // 2. Resolve Tier 2 Options
  let tier2Enabled = false
  let tier2Name = 'Pilihan Olahan'
  let tier2Options: ResolvedTier2Option[] = []

  if (cv?.tier2?.enabled && cv.tier2.options && cv.tier2.options.length > 0) {
    tier2Enabled = true
    tier2Name = cv.tier2.name || 'Pilihan Olahan'
    tier2Options = cv.tier2.options.map((o: any, idx: number) => ({
      id: o.id || `cut-${idx}`,
      label: String(o.label),
      priceDelta: Number(o.priceDelta) || 0,
      inStock: masterStockKg > 0 && o.inStock !== false
    }))
  }

  // 3. Compute Synchronized Price Range and Display Text
  const inStockT1 = tier1Options.filter(o => o.inStock)
  const effectiveT1 = inStockT1.length > 0 ? inStockT1 : tier1Options

  let minDelta = 0
  let maxDelta = 0
  if (tier2Enabled && tier2Options.length > 0) {
    const inStockT2 = tier2Options.filter(o => o.inStock)
    const effectiveT2 = inStockT2.length > 0 ? inStockT2 : tier2Options
    const deltas = effectiveT2.map(o => o.priceDelta)
    minDelta = Math.min(0, ...deltas)
    maxDelta = Math.max(0, ...deltas)
  }

  let minPrice = baseKgPrice
  let maxPrice = baseKgPrice
  let isRange = false
  let displayPrice = `Rp ${baseKgPrice.toLocaleString('id-ID')}`
  let unitLabel = isPack ? '/ pack' : '/ kg'
  let subtext: string | undefined = undefined
  let hasVariants = false

  if (effectiveT1.length > 0) {
    const t1Prices = effectiveT1.map(o => o.price)
    const minT1 = Math.min(...t1Prices)
    const maxT1 = Math.max(...t1Prices)
    minPrice = Math.max(1000, minT1 + minDelta)
    maxPrice = Math.max(1000, maxT1 + maxDelta)

    if (minPrice !== maxPrice) {
      isRange = true
      displayPrice = `Rp ${minPrice.toLocaleString('id-ID')} - Rp ${maxPrice.toLocaleString('id-ID')}`
      unitLabel = ''
      hasVariants = true

      const unitSuffix = tier1Unit === 'kg' ? 'kg' : tier1Unit === 'pack' ? 'pack' : 'g'
      const firstLbl = effectiveT1[0]?.label || ''
      const lastLbl = effectiveT1[effectiveT1.length - 1]?.label || ''
      subtext = firstLbl && lastLbl && firstLbl !== lastLbl
        ? `Pilihan ${firstLbl}${unitSuffix} - ${lastLbl}${unitSuffix}`
        : `${effectiveT1.length} Pilihan Ukuran`
    } else {
      isRange = false
      displayPrice = `Rp ${minPrice.toLocaleString('id-ID')}`
      unitLabel = isPack || tier1Unit === 'pack' ? '/ pack' : '/ kg'
      hasVariants = tier2Enabled || effectiveT1.length > 1
      subtext = isPack && product.packWeightGrams 
        ? `${product.packWeightGrams}g per pack` 
        : tier2Enabled 
          ? 'Pilihan Varian Tersedia' 
          : undefined
    }
  }

  return {
    tier1Config: {
      name: tier1Name,
      unit: tier1Unit,
      options: tier1Options
    },
    tier2Config: {
      enabled: tier2Enabled,
      name: tier2Name,
      options: tier2Options
    },
    priceInfo: {
      minPrice,
      maxPrice,
      isRange,
      displayPrice,
      unitLabel,
      subtext,
      hasVariants
    }
  }
}

export function useProductPrice(productRef: MaybeRefOrGetter<Product | null | undefined>) {
  const resolved = computed(() => resolveProductPricing(toValue(productRef)))

  const tier1Config = computed(() => resolved.value.tier1Config)
  const tier2Config = computed(() => resolved.value.tier2Config)
  const priceInfo = computed(() => resolved.value.priceInfo)

  return {
    resolved,
    tier1Config,
    tier2Config,
    priceInfo
  }
}
