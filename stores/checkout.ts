import { defineStore } from 'pinia'
import { useCartStore } from './cart'

export type CourierType = 'lba_cold_courier' | 'paxel_cold' | 'self_pickup'
export type DeliverySlot = 'subuh' | 'siang' | 'sore'

export interface CourierOption {
  id: CourierType
  name: string
  baseFee: number
  vehicleDescription: string
  guaranteeText: string
  eligibleForFreeShipping: boolean
}

export interface DeliverySlotOption {
  id: DeliverySlot
  title: string
  timeRange: string
  badge: string | null
  description: string
  tempGuarantee: string
}

export const COURIER_OPTIONS: CourierOption[] = [
  {
    id: 'lba_cold_courier',
    name: 'Armada Kurir Dingin LBA',
    baseFee: 12000,
    vehicleDescription: 'Motor Box Insulasi Chilled 0-4 C',
    guaranteeText: 'Garansi suhu stabil terjaga',
    eligibleForFreeShipping: true
  },
  {
    id: 'paxel_cold',
    name: 'Paxel Cold Express',
    baseFee: 25000,
    vehicleDescription: 'Luar Kota / Next Day Chilled',
    guaranteeText: 'Jangkauan Jawa Timur & Bali',
    eligibleForFreeShipping: false
  },
  {
    id: 'self_pickup',
    name: 'Ambil Mandiri Cold Storage Muncar',
    baseFee: 0,
    vehicleDescription: 'Bebas Biaya (Langsung dari Gudang Utama)',
    guaranteeText: 'Cold Storage Muncar dock',
    eligibleForFreeShipping: false
  }
]

export const DELIVERY_SLOTS: DeliverySlotOption[] = [
  {
    id: 'subuh',
    title: 'Slot Pagi Subuh',
    timeRange: '06:00 - 08:30 WIB',
    badge: 'Terbaik',
    description: 'Pilihan terbaik untuk langsung dimasak sarapan dan makan siang',
    tempGuarantee: 'Chilled 0 - 4°C'
  },
  {
    id: 'siang',
    title: 'Slot Siang',
    timeRange: '10:30 - 13:00 WIB',
    badge: null,
    description: 'Pengiriman reguler tengah hari',
    tempGuarantee: 'Chilled 0 - 4°C'
  },
  {
    id: 'sore',
    title: 'Slot Sore',
    timeRange: '16:00 - 18:30 WIB',
    badge: null,
    description: 'Cocok untuk persiapan makan malam keluarga',
    tempGuarantee: 'Chilled 0 - 4°C'
  }
]

export interface AddressInfo {
  recipientName: string
  recipientPhone: string
  label: string
  street: string
  benchmark: string
  isGpsVerified: boolean
  coordinates: {
    lat: number
    lng: number
  }
}

export interface CheckoutState {
  address: AddressInfo
  selectedCourier: CourierType
  selectedDeliverySlot: DeliverySlot
  unboxingNoticeAcknowledged: boolean
  defaultLongDistance: boolean
  longDistanceFee: number
  localFee: number
}

export const useCheckoutStore = defineStore('checkout', {
  state: (): CheckoutState => ({
    address: {
      recipientName: 'Ibu Ratna Dewi',
      recipientPhone: '0812-3456-7890',
      label: 'Rumah / Dapur Pribadi',
      street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
      benchmark: 'Patokan seberang Bank BCA',
      isGpsVerified: true,
      coordinates: {
        lat: -8.2192,
        lng: 114.3692
      }
    },
    selectedCourier: 'lba_cold_courier',
    selectedDeliverySlot: 'subuh',
    unboxingNoticeAcknowledged: true,
    defaultLongDistance: false,
    longDistanceFee: 25000,
    localFee: 12000
  }),

  getters: {
    courierDetails: (state): CourierOption => {
      const option = COURIER_OPTIONS.find(c => c.id === state.selectedCourier) || COURIER_OPTIONS[0]
      if (option.id === 'paxel_cold') {
        return { ...option, baseFee: state.longDistanceFee }
      }
      if (option.id === 'lba_cold_courier') {
        return { ...option, baseFee: state.localFee }
      }
      return option
    },
    slotDetails: (state): DeliverySlotOption => {
      return DELIVERY_SLOTS.find(s => s.id === state.selectedDeliverySlot) || DELIVERY_SLOTS[0]
    },
    shippingFee: (state): number => {
      const cartStore = useCartStore()
      if (state.selectedCourier === 'lba_cold_courier') {
        return cartStore.isFreeShipping ? 0 : state.localFee
      }
      if (state.selectedCourier === 'paxel_cold') {
        return state.longDistanceFee
      }
      return 0
    },
    totalBill(): number {
      const cartStore = useCartStore()
      return cartStore.productsSubtotal + cartStore.packagingFee + this.shippingFee
    }
  },

  actions: {
    setCourier(courier: CourierType) {
      this.selectedCourier = courier
    },
    setDeliverySlot(slot: DeliverySlot) {
      this.selectedDeliverySlot = slot
    },
    updateAddress(newAddress: Partial<AddressInfo>) {
      this.address = {
        ...this.address,
        ...newAddress
      }
    },
    updateAdminShippingSettings(settings: {
      defaultLongDistance?: boolean
      longDistanceFee?: number
      localFee?: number
    }) {
      if (settings.defaultLongDistance !== undefined) {
        this.defaultLongDistance = settings.defaultLongDistance
        if (settings.defaultLongDistance) {
          this.selectedCourier = 'paxel_cold'
        }
      }
      if (settings.longDistanceFee !== undefined) {
        this.longDistanceFee = settings.longDistanceFee
      }
      if (settings.localFee !== undefined) {
        this.localFee = settings.localFee
      }
    }
  }
})
