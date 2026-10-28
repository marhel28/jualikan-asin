import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from './auth'

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
  netGrams?: number
}

export interface ShippingPolicy {
  freeShippingBanyuwangi: boolean
  standardFee: number
  localFee: number
  longDistanceFee: number
  freeShippingThreshold: number
  distancePricingEnabled?: boolean
  pricePerKm?: number
  warehouseAddress?: string
}

export interface CartState {
  items: CartItem[]
  packagingType: PackagingType
  kitchenNotes: string
  shippingPolicy: ShippingPolicy
  isLoadingPolicy: boolean
  isSyncing: boolean
  isDbLoaded: boolean
}

let syncDebounceTimer: any = null

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    packagingType: 'thermal_bag',
    kitchenNotes: '',
    shippingPolicy: {
      freeShippingBanyuwangi: true,
      standardFee: 0,
      localFee: 12000,
      longDistanceFee: 25000,
      freeShippingThreshold: 300000,
      distancePricingEnabled: false,
      pricePerKm: 2500,
      warehouseAddress: 'Dermaga Pelabuhan Perikanan Pantai Muncar, Banyuwangi'
    },
    isLoadingPolicy: false,
    isSyncing: false,
    isDbLoaded: false
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
    freeShippingThreshold: (state): number => {
      return state.shippingPolicy?.freeShippingThreshold || FREE_SHIPPING_THRESHOLD
    },
    isFreeShipping: (state): boolean => {
      if (state.shippingPolicy?.freeShippingBanyuwangi) return true
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      const threshold = state.shippingPolicy?.freeShippingThreshold || FREE_SHIPPING_THRESHOLD
      return subtotal >= threshold
    },
    shippingFee: (state): number => {
      if (state.shippingPolicy?.freeShippingBanyuwangi) return 0
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      const threshold = state.shippingPolicy?.freeShippingThreshold || FREE_SHIPPING_THRESHOLD
      if (subtotal >= threshold) return 0
      return state.shippingPolicy?.standardFee ?? (state.shippingPolicy?.localFee || 12000)
    },
    freeShippingShortfall: (state): number => {
      if (state.shippingPolicy?.freeShippingBanyuwangi) return 0
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      const threshold = state.shippingPolicy?.freeShippingThreshold || FREE_SHIPPING_THRESHOLD
      return Math.max(0, threshold - subtotal)
    },
    freeShippingProgress: (state): number => {
      if (state.shippingPolicy?.freeShippingBanyuwangi) return 100
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      const threshold = state.shippingPolicy?.freeShippingThreshold || FREE_SHIPPING_THRESHOLD
      if (subtotal >= threshold) return 100
      return Math.min(99, Math.round((subtotal / threshold) * 100))
    },
    freeShippingMessage: (state): string => {
      if (state.shippingPolicy?.freeShippingBanyuwangi) {
        return 'Bebas Ongkir Armada Dingin LBA aktif untuk seluruh rute Banyuwangi.'
      }
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      const threshold = state.shippingPolicy?.freeShippingThreshold || FREE_SHIPPING_THRESHOLD
      if (subtotal >= threshold) {
        return 'Selamat! Anda Mendapatkan Bebas Ongkir Lokal Banyuwangi'
      }
      const shortfall = threshold - subtotal
      return `Tambah Rp ${shortfall.toLocaleString('id-ID')} lagi untuk mendapatkan Bebas Ongkir Lokal Banyuwangi.`
    },
    totalEstimatedBill: (state): number => {
      const subtotal = state.items.reduce((sum, item) => sum + item.itemSubtotal, 0)
      const packFee = PACKAGING_FEES[state.packagingType].fee
      const isFree = state.shippingPolicy?.freeShippingBanyuwangi || (subtotal >= (state.shippingPolicy?.freeShippingThreshold || FREE_SHIPPING_THRESHOLD))
      const shipFee = isFree ? 0 : (state.shippingPolicy?.standardFee ?? (state.shippingPolicy?.localFee || 12000))
      return subtotal + packFee + shipFee
    }
  },

  actions: {
    calcNetWeight(grossKg: number, cutType: CutType | string): number {
      return calcNetWeight(grossKg, cutType)
    },

    addItem(
      product: {
        id: string
        productId?: string
        name: string
        slug: string
        imageUrl: string
        pricePerKg: number
        unit?: 'kg' | 'pack'
        netGrams?: number
      },
      cutType: CutType,
      separateSoupBones: boolean,
      quantityKg: number
    ) {
      const numQty = typeof quantityKg === 'number' ? quantityKg : Number(quantityKg)
      const safeQty = !isNaN(numQty) && numQty > 0 ? numQty : 1
      const isPack = product.unit === 'pack'
      const yieldRatio = YIELD_RATIOS[cutType] || 0.85
      const itemSubtotal = Math.round(product.pricePerKg * safeQty)
      const packGrams = product.netGrams || 190
      const netKg = isPack ? Number(((packGrams * safeQty) / 1000).toFixed(2)) : Number((safeQty * yieldRatio).toFixed(2))
      const netGrams = isPack ? Math.round(packGrams * safeQty) : Math.round(safeQty * yieldRatio * 1000)
      const itemId = `${product.id}-${cutType}-${separateSoupBones ? 'bones' : 'nobones'}`

      const cleanProductId = product.productId || (product.id.includes('-opt-') ? product.id.split('-opt-')[0] : product.id)

      const existingIndex = this.items.findIndex(item => item.id === itemId)
      if (existingIndex > -1) {
        this.items[existingIndex].quantityKg = Number((this.items[existingIndex].quantityKg + safeQty).toFixed(3))
        this.items[existingIndex].productId = cleanProductId
        this.items[existingIndex].itemSubtotal = Math.round(this.items[existingIndex].quantityKg * product.pricePerKg)
        this.items[existingIndex].estimatedNetWeightKg = isPack 
          ? Number(((packGrams * this.items[existingIndex].quantityKg) / 1000).toFixed(2))
          : Number((this.items[existingIndex].quantityKg * yieldRatio).toFixed(2))
        this.items[existingIndex].estimatedNetWeightGrams = isPack
          ? Math.round(packGrams * this.items[existingIndex].quantityKg)
          : Math.round(this.items[existingIndex].quantityKg * yieldRatio * 1000)
      } else {
        this.items.push({
          id: itemId,
          productId: cleanProductId,
          name: product.name,
          slug: product.slug,
          imageUrl: product.imageUrl,
          pricePerKg: product.pricePerKg,
          quantityKg: safeQty,
          cutType,
          cutLabel: isPack ? `${packGrams}g / Pack` : (CUT_LABELS[cutType]?.label || 'Potongan Standar'),
          yieldRatio: isPack ? 1 : yieldRatio,
          estimatedNetWeightKg: netKg,
          estimatedNetWeightGrams: netGrams,
          separateSoupBones,
          itemSubtotal,
          unit: product.unit || 'kg',
          netGrams: isPack ? packGrams : undefined
        })
      }
      this.persist()
      this.debouncedSyncItem(cleanProductId, cutType, separateSoupBones, (existingIndex > -1 ? this.items[existingIndex].quantityKg : safeQty))
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
        if (item.unit === 'pack') {
          const packGrams = item.netGrams || 120
          item.estimatedNetWeightKg = Number(((packGrams * item.quantityKg) / 1000).toFixed(2))
          item.estimatedNetWeightGrams = Math.round(packGrams * item.quantityKg)
        } else {
          item.estimatedNetWeightKg = Number((item.quantityKg * item.yieldRatio).toFixed(2))
          item.estimatedNetWeightGrams = Math.round(item.quantityKg * item.yieldRatio * 1000)
        }
        this.persist()
        this.debouncedSyncItem(item.productId, item.cutType, item.separateSoupBones, newQty)
      }
    },

    removeItem(itemId: string) {
      const it = this.items.find(i => i.id === itemId)
      this.items = this.items.filter(i => i.id !== itemId)
      this.persist()
      if (it) {
        this.debouncedSyncItem(it.productId, it.cutType, it.separateSoupBones, 0)
      }
    },

    setPackagingType(type: PackagingType) {
      this.packagingType = type
      this.persist()
      this.syncPackagingToBackend(type)
    },

    setKitchenNotes(notes: string) {
      this.kitchenNotes = notes.slice(0, 250)
      this.persist()
      this.syncNotesToBackend(this.kitchenNotes)
    },

    async clearCart() {
      this.items = []
      this.kitchenNotes = ''
      this.persist()
      if (typeof window !== 'undefined') {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          try {
            const api = useApi()
            await api.delete('/cart')
          } catch {}
        }
      }
    },

    debouncedSyncItem(productId: string, cutType: CutType, separateSoupBones: boolean, quantityKg: number) {
      if (typeof window === 'undefined') return
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      if (syncDebounceTimer) clearTimeout(syncDebounceTimer)
      syncDebounceTimer = setTimeout(async () => {
        try {
          this.isSyncing = true
          const api = useApi()
          await api.put('/cart/items', {
            product_id: productId,
            cut_type: cutType,
            separate_soup_bones: separateSoupBones,
            quantity_kg: quantityKg
          })
        } catch (err) {
          console.error('Gagal menyinkronkan item keranjang ke DB:', err)
        } finally {
          this.isSyncing = false
        }
      }, 400)
    },

    async syncPackagingToBackend(type: PackagingType) {
      if (typeof window === 'undefined') return
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return
      try {
        const api = useApi()
        await api.put('/cart/packaging', { packaging_type: type })
      } catch (err) {
        console.error('Gagal menyinkronkan kemasan ke DB:', err)
      }
    },

    async syncNotesToBackend(notes: string) {
      if (typeof window === 'undefined') return
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return
      try {
        const api = useApi()
        await api.put('/cart/notes', { kitchen_notes: notes })
      } catch (err) {
        console.error('Gagal menyinkronkan catatan dapur ke DB:', err)
      }
    },

    async syncOnLogin() {
      if (typeof window === 'undefined') return
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      this.isSyncing = true
      try {
        const api = useApi()
        const guestItems = this.items.map(it => ({
          product_id: it.productId || it.id,
          cut_type: it.cutType,
          separate_soup_bones: it.separateSoupBones,
          quantity_kg: it.quantityKg
        }))

        const payload = {
          items: guestItems,
          packaging_type: this.packagingType,
          kitchen_notes: this.kitchenNotes
        }

        const data = await api.post<any>('/cart/sync', payload)
        if (data && Array.isArray(data.items)) {
          this.applyBackendCart(data)
        }
      } catch (err) {
        console.error('Gagal sinkronisasi keranjang login:', err)
      } finally {
        this.isSyncing = false
      }
    },

    async fetchCartFromDb() {
      if (typeof window === 'undefined') return
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return

      try {
        const api = useApi()
        const data = await api.get<any>('/cart')
        if (data && Array.isArray(data.items)) {
          this.applyBackendCart(data)
        }
      } catch (err) {
        console.error('Gagal mengambil keranjang DB:', err)
      }
    },

    applyBackendCart(data: any) {
      this.packagingType = (data.packaging_type as PackagingType) || 'thermal_bag'
      this.kitchenNotes = data.kitchen_notes || ''
      this.items = data.items.map((it: any) => ({
        id: it.id,
        productId: it.product_id,
        name: it.name,
        slug: it.slug,
        imageUrl: it.image_url,
        pricePerKg: it.price_per_kg,
        quantityKg: it.quantity_kg,
        cutType: it.cut_type,
        cutLabel: it.cut_label,
        yieldRatio: it.yield_ratio,
        estimatedNetWeightKg: it.estimated_net_weight_kg,
        estimatedNetWeightGrams: it.estimated_net_weight_grams,
        separateSoupBones: it.separate_soup_bones,
        itemSubtotal: it.item_subtotal,
        unit: it.unit || 'kg'
      }))
      this.isDbLoaded = true
      this.persist()
    },

    resetCartOnLogout() {
      this.items = []
      this.packagingType = 'thermal_bag'
      this.kitchenNotes = ''
      this.isDbLoaded = false
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('lba_cart_items')
          localStorage.removeItem('lba_cart_packaging')
          localStorage.removeItem('lba_cart_notes')
        } catch {}
      }
    },

    persist() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('lba_cart_items', JSON.stringify(this.items))
          localStorage.setItem('lba_cart_packaging', this.packagingType)
          localStorage.setItem('lba_cart_notes', this.kitchenNotes)
        } catch {}
      }
    },

    initCart() {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('lba_cart_items')
          if (stored !== null) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
              this.items = parsed.map((it: any) => {
                const rawPid = it.productId || it.id || ''
                const cleanPid = rawPid.includes('-opt-') ? rawPid.split('-opt-')[0] : rawPid
                return {
                  ...it,
                  productId: cleanPid
                }
              })
            }
          }
          const pack = localStorage.getItem('lba_cart_packaging') as PackagingType
          if (pack) this.packagingType = pack
          const notes = localStorage.getItem('lba_cart_notes')
          if (notes) this.kitchenNotes = notes

          const authStore = useAuthStore()
          if (authStore.isAuthenticated) {
            this.fetchCartFromDb()
          }
        } catch {}
      }
      this.fetchDeliveryConfig()
    },

    async fetchDeliveryConfig() {
      this.isLoadingPolicy = true
      try {
        const api = useApi()
        const data = await api.get<{
          deliverySlots?: any[]
          shippingPolicy?: ShippingPolicy
        }>('/settings/delivery-config')

        if (data?.shippingPolicy) {
          this.shippingPolicy = {
            ...this.shippingPolicy,
            ...data.shippingPolicy
          }
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        this.isLoadingPolicy = false
      }
    }
  }
})
