import { defineStore } from 'pinia'
import { useCartStore } from './cart'
import { useApi } from '~/composables/useApi'

export type CourierType = 'lba_cold_courier'
export type DeliverySlot = string

export interface DeliverySlotOption {
  id: string
  title: string
  timeRange: string
  timeRangeWita?: string
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
  addressDetail?: string
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
  postalCode?: string
  fullAddressText?: string
  latitude?: number | null
  longitude?: number | null
  coordinates: {
    lat: number
    lng: number
  }
}

import type { ShippingPolicy } from './cart'

export interface CheckoutState {
  address: AddressInfo
  isDropship: boolean
  senderName: string
  senderPhone: string
  isTextOnlyFallback: boolean
  selectedCourier: CourierType
  selectedDeliverySlot: DeliverySlot
  deliverySlots: DeliverySlotOption[]
  shippingPolicy: ShippingPolicy
  isLoadingSlots: boolean
}

// Bounding box & parameter geofencing Kabupaten Banyuwangi
export const BANYUWANGI_BOUNDS = {
  minLat: -8.8500,
  maxLat: -7.7000,
  minLng: 113.8000,
  maxLng: 114.6500,
  storeLat: -8.4328,
  storeLng: 114.3361,
  maxDistanceKm: 100.0,
}

// Kalkulasi jarak Haversine jalan darat (faktor belokan 1.3x)
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number = BANYUWANGI_BOUNDS.storeLat,
  lon2: number = BANYUWANGI_BOUNDS.storeLng
): number {
  const R = 6371.0
  const dLat = (lat2 - lat1) * Math.PI / 180.0
  const dLon = (lon2 - lon1) * Math.PI / 180.0
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180.0) * Math.cos(lat2 * Math.PI / 180.0) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c * 1.3).toFixed(1))
}

const DEFAULT_SLOTS: DeliverySlotOption[] = [
  {
    id: 'subuh',
    title: 'Slot Pagi',
    timeRange: '06:00 - 08:30 WIB',
    timeRangeWita: '07:00 - 09:30 WITA',
    badge: 'Rekomendasi',
    description: 'Tiba segar siap masak sarapan dan makan siang',
    isActive: true,
    isRecommended: true
  },
  {
    id: 'siang',
    title: 'Slot Siang',
    timeRange: '10:30 - 13:00 WIB',
    timeRangeWita: '11:30 - 14:00 WITA',
    badge: null,
    description: 'Pengiriman reguler tengah hari',
    isActive: true,
    isRecommended: false
  },
  {
    id: 'sore',
    title: 'Slot Sore',
    timeRange: '16:00 - 18:30 WIB',
    timeRangeWita: '17:00 - 19:30 WITA',
    badge: null,
    description: 'Persiapan santap malam keluarga',
    isActive: true,
    isRecommended: false
  }
]

export const useCheckoutStore = defineStore('checkout', {
  state: (): CheckoutState => ({
    address: {
      recipientName: '',
      recipientPhone: '',
      label: 'Rumah / Dapur Pribadi',
      street: '',
      benchmark: '',
      isGpsVerified: false,
      latitude: null,
      longitude: null,
      coordinates: {
        lat: BANYUWANGI_BOUNDS.storeLat,
        lng: BANYUWANGI_BOUNDS.storeLng
      }
    },
    selectedCourier: 'lba_cold_courier',
    selectedDeliverySlot: 'subuh',
    isDropship: false,
    senderName: '',
    senderPhone: '',
    isTextOnlyFallback: false,
    deliverySlots: DEFAULT_SLOTS,
    shippingPolicy: {
      onlyBanyuwangi: true,
      freeShippingBanyuwangi: true,
      standardFee: 0,
      warehouseLat: BANYUWANGI_BOUNDS.storeLat,
      warehouseLng: BANYUWANGI_BOUNDS.storeLng,
      warehouseAddress: 'Dermaga Pelabuhan Perikanan Pantai Muncar, Banyuwangi',
      distancePricingEnabled: false,
      pricePerKm: 2500
    },
    isLoadingSlots: false
  }),

  getters: {
    deliveryDistanceKm: (state): number | null => {
      const addr = state.address
      if (!addr) return null
      const lat = addr.latitude ?? (addr.isGpsVerified ? addr.coordinates?.lat : null)
      const lng = addr.longitude ?? (addr.isGpsVerified ? addr.coordinates?.lng : null)
      if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
        return calculateDistanceKm(lat, lng)
      }
      return null
    },

    isAddressInBanyuwangi: (state): boolean => {
      const addr = state.address
      if (!addr) return false

      // 1. Validasi koordinat jika ada (GPS browser atau pin Leaflet)
      const lat = addr.latitude ?? (addr.isGpsVerified ? addr.coordinates?.lat : null)
      const lng = addr.longitude ?? (addr.isGpsVerified ? addr.coordinates?.lng : null)
      if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
        const inBounds =
          lat >= BANYUWANGI_BOUNDS.minLat && lat <= BANYUWANGI_BOUNDS.maxLat &&
          lng >= BANYUWANGI_BOUNDS.minLng && lng <= BANYUWANGI_BOUNDS.maxLng
        const distance = calculateDistanceKm(lat, lng)
        return inBounds && distance <= BANYUWANGI_BOUNDS.maxDistanceKm
      }

      // 2. Mode fallback teks tanpa pin GPS
      const street = (addr.street || '').toLowerCase()
      if (street.trim().length < 5) {
        return false
      }

      const kab = (addr.kabupatenNama || '').toLowerCase()
      const kec = (addr.kecamatanNama || '').toLowerCase()
      const kode = String(addr.kabupatenKode || '')

      // Tolak tegas jika ada nama kota lain di luar Banyuwangi
      const forbiddenCities = [
        'jakarta', 'surabaya', 'malang', 'bandung', 'semarang',
        'denpasar', 'badung', 'jembrana', 'tabanan', 'sidoarjo',
        'jember', 'kediri', 'pasuruan', 'probolinggo', 'situbondo',
        'bondowoso', 'lumajang', 'yogyakarta', 'solo', 'surakarta',
        'bogor', 'bekasi', 'tangerang', 'depok'
      ]
      if (forbiddenCities.some(fc => kab.includes(fc) || street.includes(fc))) {
        return false
      }

      return kab.includes('banyuwangi') || kec.includes('muncar') || street.includes('banyuwangi') || kode === '35.10'
    },

    isDeliveryAllowed(): boolean {
      if (this.shippingPolicy.onlyBanyuwangi === false) return true
      return this.isAddressInBanyuwangi
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
    setIsDropship(val: boolean) {
      this.isDropship = val
    },
    setDropshipSender(name: string, phone: string) {
      this.senderName = name
      this.senderPhone = phone
    },
    setTextOnlyFallback(val: boolean) {
      this.isTextOnlyFallback = val
    },
    setAddress(newAddress: Partial<AddressInfo>) {
      const hasCoords = newAddress.latitude != null && newAddress.longitude != null
      const lat = hasCoords ? Number(newAddress.latitude) : (newAddress.coordinates?.lat ?? this.address.latitude)
      const lng = hasCoords ? Number(newAddress.longitude) : (newAddress.coordinates?.lng ?? this.address.longitude)

      this.address = {
        ...this.address,
        ...newAddress,
        coordinates: (lat != null && lng != null) ? { lat, lng } : this.address.coordinates,
        latitude: lat,
        longitude: lng,
        isGpsVerified: !this.isTextOnlyFallback && (lat != null && lng != null)
      }
    },
    updateAddressCoordinates(lat: number, lng: number) {
      this.address.coordinates = { lat, lng }
      this.address.latitude = lat
      this.address.longitude = lng
      this.address.isGpsVerified = true
      this.isTextOnlyFallback = false
    },
    async fetchDeliveryConfig() {
      this.isLoadingSlots = true
      try {
        const api = useApi()
        const data = await api.get<{
          deliverySlots?: DeliverySlotOption[]
          shippingPolicy?: ShippingPolicy
          packagingOptions?: any[]
        }>('/settings/delivery-config')

        if (data) {
          if (data.deliverySlots && Array.isArray(data.deliverySlots) && data.deliverySlots.length > 0) {
            this.deliverySlots = data.deliverySlots
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
          if (data.packagingOptions && Array.isArray(data.packagingOptions) && data.packagingOptions.length > 0) {
            const cartStore = useCartStore()
            cartStore.packagingOptions = data.packagingOptions
          }
        }
      } catch (err) {
        // Fallback default slots
      } finally {
        this.isLoadingSlots = false
      }
    }
  }
})
