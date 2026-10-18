import { defineStore } from 'pinia'

export type CutType = 'utuh_bersih' | 'fillet_tanpa_kulit' | 'steak_melintang'
export type PackagingType = 'thermal_bag' | 'styrofoam_box'

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

export const PACKAGING_FEES: Record<PackagingType, { name: string; fee: number; duration: string; note: string }> = {
  thermal_bag: {
    name: 'Thermal Bag Insulasi Tebal + 2 Ice Gel',
    fee: 7500,
    duration: 'Tahan 8 Jam',
    note: 'Pengiriman Lokal / Kota Terdekat'
  },
  styrofoam_box: {
    name: 'Box Styrofoam Segel + 4 Ice Gel + Flake Ice',
    fee: 18000,
    duration: 'Tahan 24 Jam',
    note: 'Luar Kota / Antar Provinsi'
  }
}

export const FREE_SHIPPING_THRESHOLD = 300000

/**
 * Calculates net edible weight from gross weight and cut type.
 * Required interface contract from PROJECT.md:
 * calcNetWeight(grossKg: number, cutType: string): number
 */
export function calcNetWeight(grossKg: number, cutType: CutType | string): number {
  const ratio = (cutType in YIELD_RATIOS ? YIELD_RATIOS[cutType as CutType] : 0.85) || 0.85
  const parsedGross = typeof grossKg === 'number' ? grossKg : Number(grossKg)
  if (isNaN(parsedGross) || parsedGross <= 0) return 0
  return Number((parsedGross * ratio).toFixed(2))
}

export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  imageUrl: string
  pricePerKg: number
  quantityKg: number
  cutType: CutType
  cutLabel: string
  yieldRatio: number
  estimatedNetWeightKg: number
  estimatedNetWeightGrams: number
  separateSoupBones: boolean
  itemSubtotal: number
  unit: 'kg' | 'pack'
}

export interface CartToastInfo {
  name: string
  image: string
  price: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
  packagingType: PackagingType
  kitchenNotes: string
  lastAddedItem: CartToastInfo | null
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    lastAddedItem: null,
    items: [
      {
        id: 'mock-1',
        productId: 'tenggiri-papan',
        name: 'Ikan Tenggiri Papan Segar',
        slug: 'ikan-tenggiri-papan-segar',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
        pricePerKg: 92000,
        quantityKg: 1,
        cutType: 'utuh_bersih',
        cutLabel: 'Utuh Bersih',
        yieldRatio: 0.85,
        estimatedNetWeightKg: 0.85,
        estimatedNetWeightGrams: 850,
        separateSoupBones: true,
        itemSubtotal: 92000,
        unit: 'kg'
      },
      {
        id: 'mock-2',
        productId: 'kerapu-macan',
        name: 'Fillet Kerapu Cantang Muncar 500g',
        slug: 'fillet-kerapu-cantang-muncar',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
        pricePerKg: 70000,
        quantityKg: 2,
        cutType: 'fillet_tanpa_kulit',
        cutLabel: 'Fillet Tanpa Kulit',
        yieldRatio: 0.52,
        estimatedNetWeightKg: 1.04,
        estimatedNetWeightGrams: 1040,
        separateSoupBones: true,
        itemSubtotal: 140000,
        unit: 'pack'
      },
      {
        id: 'mock-3',
        productId: 'steak-tuna-yellowfin',
        name: 'Steak Tuna Yellowfin 200g (Grade A)',
        slug: 'steak-tuna-yellowfin-200g',
        imageUrl: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=600&q=80',
        pricePerKg: 34000,
        quantityKg: 1,
        cutType: 'steak_melintang',
        cutLabel: 'Steak Melintang',
        yieldRatio: 0.80,
        estimatedNetWeightKg: 0.20,
        estimatedNetWeightGrams: 200,
        separateSoupBones: false,
        itemSubtotal: 34000,
        unit: 'pack'
      }
    ],
    packagingType: 'thermal_bag',
    kitchenNotes: ''
  }),

  getters: {
    totalItemsCount: (state): number => state.items.length,
    totalItemCount: (state): number => state.items.reduce((sum, item) => sum + item.quantityKg, 0),
    totalItems: (state): number => state.items.reduce((sum, item) => sum + item.quantityKg, 0),
    totalGrossWeightKg: (state): number => Number(state.items.reduce((sum, item) => sum + item.quantityKg, 0).toFixed(2)),
    totalNetWeightKg: (state): number => Number(state.items.reduce((sum, item) => sum + item.estimatedNetWeightKg, 0).toFixed(2)),
    productsSubtotal: (state): number => state.items.reduce((sum, item) => sum + item.itemSubtotal, 0),
    packagingFee: (state): number => PACKAGING_FEES[state.packagingType].fee,
    packagingDetails: (state) => PACKAGING_FEES[state.packagingType],
    isFreeShipping: (state): boolean => {
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      return subtotal >= FREE_SHIPPING_THRESHOLD
    },
    freeShippingShortfall: (state): number => {
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
    },
    freeShippingProgress: (state): number => {
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      if (subtotal >= FREE_SHIPPING_THRESHOLD) return 100
      return Math.min(99, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))
    },
    freeShippingMessage: (state): string => {
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        return 'Selamat! Anda Mendapatkan Bebas Ongkir Lokal Banyuwangi'
      }
      const shortfall = FREE_SHIPPING_THRESHOLD - subtotal
      return `Tambah Rp ${shortfall.toLocaleString('id-ID')} lagi untuk mendapatkan Bebas Ongkir Lokal Banyuwangi.`
    }
  },

  actions: {
    calcNetWeight(grossKg: number, cutType: CutType | string): number {
      return calcNetWeight(grossKg, cutType)
    },

    addItem(product: { id: string; name: string; slug: string; imageUrl: string; pricePerKg: number; unit?: 'kg' | 'pack' }, cutType: CutType, separateSoupBones: boolean, quantityKg: number) {
      const numQty = typeof quantityKg === 'number' ? quantityKg : Number(quantityKg)
      const safeQty = !isNaN(numQty) && numQty > 0 ? numQty : 1
      const yieldRatio = YIELD_RATIOS[cutType] || 0.85
      const itemSubtotal = Math.round(product.pricePerKg * safeQty)
      const netKg = Number((safeQty * yieldRatio).toFixed(2))
      const netGrams = Math.round(safeQty * yieldRatio * 1000)
      const itemId = `${product.id}-${cutType}-${separateSoupBones ? 'bones' : 'nobones'}`

      const existingIndex = this.items.findIndex(item => item.id === itemId)
      if (existingIndex > -1) {
        this.items[existingIndex].quantityKg = Number((this.items[existingIndex].quantityKg + safeQty).toFixed(3))
        this.items[existingIndex].itemSubtotal = Math.round(this.items[existingIndex].quantityKg * product.pricePerKg)
        this.items[existingIndex].estimatedNetWeightKg = Number((this.items[existingIndex].quantityKg * yieldRatio).toFixed(2))
        this.items[existingIndex].estimatedNetWeightGrams = Math.round(this.items[existingIndex].quantityKg * yieldRatio * 1000)
      } else {
        this.items.push({
          id: itemId,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.imageUrl,
          pricePerKg: product.pricePerKg,
          quantityKg: safeQty,
          cutType,
          cutLabel: CUT_LABELS[cutType]?.label || 'Potongan Standar',
          yieldRatio,
          estimatedNetWeightKg: netKg,
          estimatedNetWeightGrams: netGrams,
          separateSoupBones,
          itemSubtotal,
          unit: product.unit || 'kg'
        })
      }

      this.lastAddedItem = {
        name: product.name,
        image: product.imageUrl,
        price: product.pricePerKg,
        quantity: safeQty
      }

      // Auto dismiss toast after 3.5s
      setTimeout(() => {
        if (this.lastAddedItem?.name === product.name) {
          this.lastAddedItem = null
        }
      }, 3500)
    },

    clearToast() {
      this.lastAddedItem = null
    },

    updateQuantity(itemId: string, delta: number) {
      const item = this.items.find(i => i.id === itemId)
      if (!item) return
      const newQty = Number((item.quantityKg + delta).toFixed(3))
      if (newQty <= 0) {
        this.removeItem(itemId)
      } else {
        item.quantityKg = newQty
        item.itemSubtotal = Math.round(item.quantityKg * item.pricePerKg)
        item.estimatedNetWeightKg = Number((item.quantityKg * item.yieldRatio).toFixed(2))
        item.estimatedNetWeightGrams = Math.round(item.quantityKg * item.yieldRatio * 1000)
      }
    },

    removeItem(itemId: string) {
      this.items = this.items.filter(i => i.id !== itemId)
    },

    setPackagingType(type: PackagingType) {
      this.packagingType = type
    },

    setKitchenNotes(notes: string) {
      this.kitchenNotes = notes.slice(0, 250)
    },

    clearCart() {
      this.items = []
      this.kitchenNotes = ''
    }
  }
})
