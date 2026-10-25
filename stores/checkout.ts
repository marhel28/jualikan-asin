import { defineStore } from 'pinia'
import { useCartStore } from './cart'
import { useApi } from '~/composables/useApi'

export type CourierType = 'lba_cold_courier'
export type DeliverySlot = string

export interface DeliverySlotOption {
  id: string
  title: string
  timeRange: string
  badge?: string | null
  description: string
  isActive?: boolean
  isRecommended?: boolean
}

export interface AddressInfo {
  id?: string
  recipientName: string
  recipientPhone: string
  label: string
  street: string
  benchmark: string
  isGpsVerified: boolean
  isDefault?: boolean
  provinsiKode?: string
  kabupatenKode?: string
  kecamatanKode?: string
  desaKode?: string
  provinsiNama?: string
  kabupatenNama?: string
  kecamatanNama?: string
  desaNama?: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface ShippingPolicy {
  freeShippingBanyuwangi: boolean
  onlyBanyuwangi?: boolean
  standardFee: number
  localFee?: number
  longDistanceFee?: number
  freeShippingThreshold?: number
  warehouseLat: number
  warehouseLng: number
  warehouseAddress: string
  distancePricingEnabled: boolean
  pricePerKm: number
}

export interface CheckoutState {
  address: AddressInfo
  selectedCourier: CourierType
  selectedDeliverySlot: DeliverySlot
  deliverySlots: DeliverySlotOption[]
  shippingPolicy: ShippingPolicy
  isLoadingSlots: boolean
}

const DEFAULT_SLOTS: DeliverySlotOption[] = [
  {
    id: 'subuh',
    title: 'Slot Pagi',
    timeRange: '06:00 - 08:30 WIB',
    badge: 'Rekomendasi',
    description: 'Tiba segar siap masak sarapan dan makan siang',
    isActive: true,
    isRecommended: true
  },
  {
    id: 'siang',
    title: 'Slot Siang',
    timeRange: '10:30 - 13:00 WIB',
    badge: null,
    description: 'Pengiriman reguler tengah hari',
    isActive: true,
    isRecommended: false
  },
  {
    id: 'sore',
    title: 'Slot Sore',
    timeRange: '16:00 - 18:30 WIB',
    badge: null,
    description: 'Persiapan santap malam keluarga',
    isActive: true,
    isRecommended: false
  }
]

export const useCheckoutStore = defineStore('checkout', {
  state: (): CheckoutState => ({
    address: {
      recipientName: 'Ibu Ratna Dewi',
      recipientPhone: '0812-3456-7890',
      label: 'Rumah / Dapur Pribadi',
      street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
      benchmark: 'Patokan seberang Bank BCA Banyuwangi',
      isGpsVerified: true,
      coordinates: {
        lat: -8.2192,
        lng: 114.3692
      }
    },
    selectedCourier: 'lba_cold_courier',
    selectedDeliverySlot: 'subuh',
    deliverySlots: DEFAULT_SLOTS,
    shippingPolicy: {
      onlyBanyuwangi: true,
      freeShippingBanyuwangi: true,
      standardFee: 0,
      warehouseLat: -8.4328,
      warehouseLng: 114.3361,
      warehouseAddress: 'Dermaga Pelabuhan Perikanan Pantai Muncar, Banyuwangi',
      distancePricingEnabled: false,
      pricePerKm: 2500
    },
    isLoadingSlots: false
  }),

  getters: {
    isAddressInBanyuwangi: (state): boolean => {
      const addr = state.address
      if (!addr) return false
      const kab = (addr.kabupatenNama || '').toLowerCase()
      const kec = (addr.kecamatanNama || '').toLowerCase()
      const street = (addr.street || '').toLowerCase()
      const kode = String(addr.kabupatenKode || '')
      return kab.includes('banyuwangi') || kec.includes('muncar') || street.includes('banyuwangi') || kode === '35.10'
    },
    isDeliveryAllowed: (state): boolean => {
      if (state.shippingPolicy.onlyBanyuwangi === false) return true
      const addr = state.address
      if (!addr) return false
      const kab = (addr.kabupatenNama || '').toLowerCase()
      const kec = (addr.kecamatanNama || '').toLowerCase()
      const street = (addr.street || '').toLowerCase()
      const kode = String(addr.kabupatenKode || '')
      return kab.includes('banyuwangi') || kec.includes('muncar') || street.includes('banyuwangi') || kode === '35.10'
    },
    activeSlots: (state): DeliverySlotOption[] => {
      const active = state.deliverySlots.filter(s => s.isActive !== false)
      return active.length > 0 ? active : DEFAULT_SLOTS
    },
    slotDetails: (state): DeliverySlotOption => {
      const found = state.deliverySlots.find(s => s.id === state.selectedDeliverySlot)
      return found || state.deliverySlots[0] || DEFAULT_SLOTS[0]
    },
    shippingFee: (state): number => {
      // Default: Bebas ongkos kirim seluruh area Banyuwangi
      if (state.shippingPolicy.freeShippingBanyuwangi) {
        return 0
      }
      const cartStore = useCartStore()
      if (cartStore.isFreeShipping) {
        return 0
      }
      return state.shippingPolicy.standardFee ?? (state.shippingPolicy.localFee || 12000)
    },
    totalBill(): number {
      const cartStore = useCartStore()
      return cartStore.productsSubtotal + cartStore.packagingFee + this.shippingFee
    }
  },

  actions: {
    setDeliverySlot(slotId: string) {
      this.selectedDeliverySlot = slotId
    },
    setAddress(newAddress: Partial<AddressInfo>) {
      this.address = {
        ...this.address,
        ...newAddress,
        coordinates: {
          lat: newAddress.coordinates?.lat ?? this.address.coordinates.lat,
          lng: newAddress.coordinates?.lng ?? this.address.coordinates.lng
        },
        isGpsVerified: true
      }
    },
    updateAddressCoordinates(lat: number, lng: number) {
      this.address.coordinates = { lat, lng }
      this.address.isGpsVerified = true
    },
    async fetchDeliveryConfig() {
      this.isLoadingSlots = true
      try {
        const api = useApi()
        const data = await api.get<{
          deliverySlots?: DeliverySlotOption[]
          shippingPolicy?: ShippingPolicy
        }>('/settings/delivery-config')

        if (data) {
          if (data.deliverySlots && Array.isArray(data.deliverySlots) && data.deliverySlots.length > 0) {
            this.deliverySlots = data.deliverySlots
            // If current selected slot is inactive, pick the first active slot
            const isCurrentActive = this.deliverySlots.some(s => s.id === this.selectedDeliverySlot && s.isActive !== false)
            if (!isCurrentActive) {
              const firstActive = this.deliverySlots.find(s => s.isActive !== false)
              if (firstActive) {
                this.selectedDeliverySlot = firstActive.id
              }
            }
          }
          if (data.shippingPolicy) {
            this.shippingPolicy = data.shippingPolicy
          }
        }
      } catch (err) {
        // Graceful fallback to default slots
      } finally {
        this.isLoadingSlots = false
      }
    }
  }
})
