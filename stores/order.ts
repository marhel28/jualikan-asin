import { defineStore } from 'pinia'
import { useCartStore, type CartItem, type PackagingType } from './cart'
import { useCheckoutStore, type CourierType, type DeliverySlot, type AddressInfo } from './checkout'

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'COLD_ROOM_INTAKE'
  | 'BUTCHERING_PREP'
  | 'COLD_PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXPIRED'

export type PaymentMethod = 'qris_dynamic' | 'virtual_account' | 'credit_card'

export interface TrackingStage {
  stageIndex: number
  key: string
  title: string
  description: string
  timestamp: string | null
  isCompleted: boolean
  isActive: boolean
}

export interface Order {
  id: string
  createdAt: string
  status: OrderStatus
  items: CartItem[]
  packagingType: PackagingType
  packagingFee: number
  courierType: CourierType
  courierFee: number
  deliverySlot: DeliverySlot
  deliverySlotLabel: string
  kitchenNotes: string
  address: AddressInfo
  productsSubtotal: number
  totalAmount: number
  paymentMethod: PaymentMethod
  qrisPayloadString: string
  qrisImageUrl: string
  virtualAccountNumber?: string
  scaleSlipImageUrl: string
  qualityCertificateUrl: string
  scaleWeightGrossKg: number
  trackingStages: TrackingStage[]
}

export interface OrderState {
  currentOrder: Order | null
  ordersHistory: Order[]
  selectedPaymentMethod: PaymentMethod
  qrisRemainingSeconds: number
  isScaleSlipModalOpen: boolean
  qrisInterval: any
  isLoading: boolean
  error: string | null
}

const DEFAULT_STAGES: TrackingStage[] = [
  {
    stageIndex: 1,
    key: 'confirmed',
    title: 'Pesanan Terkonfirmasi',
    description: '16:40 WIB - Pembayaran diterima sistem',
    timestamp: '16:40 WIB',
    isCompleted: true,
    isActive: false
  },
  {
    stageIndex: 2,
    key: 'cold_room',
    title: 'Ikan Disiapkan di Cold Room Muncar',
    description: '16:45 WIB - Suhu terkontrol -18 derajat Celsius',
    timestamp: '16:45 WIB',
    isCompleted: true,
    isActive: false
  },
  {
    stageIndex: 3,
    key: 'butchering',
    title: 'Proses Bersih & Potong di Meja Preparasi',
    description: 'Sedang Berjalan (Estimasi selesai 5 menit)',
    timestamp: null,
    isCompleted: false,
    isActive: true
  },
  {
    stageIndex: 4,
    key: 'cold_packed',
    title: 'Kemas Rantai Dingin Thermal Bag & Ice Gel',
    description: 'Menunggu proses pemotongan selesai',
    timestamp: null,
    isCompleted: false,
    isActive: false
  },
  {
    stageIndex: 5,
    key: 'out_for_delivery',
    title: 'Pengantaran Kurir Box Chilled ke Rumah Anda',
    description: 'Estimasi tiba pukul 17:45 WIB',
    timestamp: null,
    isCompleted: false,
    isActive: false
  }
]

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    currentOrder: {
      id: 'LBA-202610-098',
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
      items: [
        {
          id: 'item-1',
          productId: 'tenggiri-papan',
          name: 'Ikan Tenggiri Papan Segar',
          slug: 'ikan-tenggiri-papan-segar',
          imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
          pricePerKg: 92000,
          quantityKg: 2,
          cutType: 'utuh_bersih',
          cutLabel: 'Utuh Bersih',
          yieldRatio: 0.85,
          estimatedNetWeightKg: 1.7,
          estimatedNetWeightGrams: 1700,
          separateSoupBones: true,
          itemSubtotal: 184000,
          unit: 'kg'
        },
        {
          id: 'item-2',
          productId: 'kerapu-macan',
          name: 'Ikan Kerapu Macan Muncar',
          slug: 'ikan-kerapu-macan-muncar',
          imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=600&q=80',
          pricePerKg: 85000,
          quantityKg: 1,
          cutType: 'fillet_tanpa_kulit',
          cutLabel: 'Fillet Tanpa Kulit',
          yieldRatio: 0.52,
          estimatedNetWeightKg: 0.52,
          estimatedNetWeightGrams: 520,
          separateSoupBones: true,
          itemSubtotal: 85000,
          unit: 'kg'
        }
      ],
      packagingType: 'thermal_bag',
      packagingFee: 7500,
      courierType: 'lba_cold_courier',
      courierFee: 12000,
      deliverySlot: 'subuh',
      deliverySlotLabel: 'Slot Pagi Subuh: 06:00 - 08:30 WIB (Terbaik)',
      kitchenNotes: 'Potong bersih, pisahkan kepala dan tulang untuk kuah sup',
      address: {
        recipientName: 'Ibu Ratna Dewi',
        recipientPhone: '0812-3456-7890',
        label: 'Rumah / Dapur Pribadi',
        street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
        benchmark: 'Patokan seberang Bank BCA',
        isGpsVerified: true,
        coordinates: { lat: -8.2192, lng: 114.3692 }
      },
      productsSubtotal: 269000,
      totalAmount: 288500,
      paymentMethod: 'qris_dynamic',
      qrisPayloadString: '00020101021226670016ID.CO.LBA.WWW011893600999000000000152045812530336054072855005802ID5919LAUT BERKAH ABADI6010BANYUWANGI61056841162070703A016304C92A',
      qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226670016ID.CO.LBA.WWW011893600999000000000152045812530336054072855005802ID5919LAUT%20BERKAH%20ABADI6010BANYUWANGI61056841162070703A016304C92A',
      virtualAccountNumber: '8801981234567890',
      scaleSlipImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      qualityCertificateUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      scaleWeightGrossKg: 4.0,
      trackingStages: JSON.parse(JSON.stringify(DEFAULT_STAGES))
    },
    ordersHistory: [],
    selectedPaymentMethod: 'qris_dynamic',
    qrisRemainingSeconds: 899,
    isScaleSlipModalOpen: false,
    qrisInterval: null,
    isLoading: false,
    error: null
  }),

  getters: {
    formattedRemainingTime: (state): string => {
      const minutes = Math.floor(state.qrisRemainingSeconds / 60)
      const seconds = state.qrisRemainingSeconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
    activeTrackingStage: (state): TrackingStage | undefined => {
      return state.currentOrder?.trackingStages.find(s => s.isActive)
    },
    isOrderExpired: (state): boolean => state.currentOrder?.status === 'EXPIRED'
  },

  actions: {
    createOrder() {
      const cartStore = useCartStore()
      const checkoutStore = useCheckoutStore()

      const orderNumber = `LBA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`
      const total = checkoutStore.totalBill

      const newOrder: Order = {
        id: orderNumber,
        createdAt: new Date().toISOString(),
        status: 'PENDING_PAYMENT',
        items: JSON.parse(JSON.stringify(cartStore.items)),
        packagingType: cartStore.packagingType,
        packagingFee: cartStore.packagingFee,
        courierType: checkoutStore.selectedCourier,
        courierFee: checkoutStore.shippingFee,
        deliverySlot: checkoutStore.selectedDeliverySlot,
        deliverySlotLabel: checkoutStore.slotDetails.title,
        kitchenNotes: cartStore.kitchenNotes,
        address: JSON.parse(JSON.stringify(checkoutStore.address)),
        productsSubtotal: cartStore.productsSubtotal,
        totalAmount: total,
        paymentMethod: this.selectedPaymentMethod,
        qrisPayloadString: `00020101021226670016ID.CO.LBA.WWW0118936009990000000001520458125303360540${total}5802ID5919LAUT BERKAH ABADI6010BANYUWANGI61056841162070703A016304C92A`,
        qrisImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021226670016ID.CO.LBA.WWW0118936009990000000001520458125303360540${total}5802ID5919LAUT%20BERKAH%20ABADI6010BANYUWANGI61056841162070703A016304C92A`,
        virtualAccountNumber: `8801${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        scaleSlipImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
        qualityCertificateUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
        scaleWeightGrossKg: cartStore.totalGrossWeightKg,
        trackingStages: JSON.parse(JSON.stringify(DEFAULT_STAGES))
      }

      this.currentOrder = newOrder
      this.ordersHistory.unshift(newOrder)
      this.startQrisTimer()

      return newOrder.id
    },

    setPaymentMethod(method: PaymentMethod) {
      this.selectedPaymentMethod = method
      if (this.currentOrder) {
        this.currentOrder.paymentMethod = method
      }
    },

    startQrisTimer() {
      if (this.qrisInterval) clearInterval(this.qrisInterval)
      this.qrisRemainingSeconds = 900

      this.qrisInterval = setInterval(() => {
        if (this.qrisRemainingSeconds > 0) {
          this.qrisRemainingSeconds--
        } else {
          clearInterval(this.qrisInterval)
          this.qrisInterval = null
          if (this.currentOrder && this.currentOrder.status === 'PENDING_PAYMENT') {
            this.currentOrder.status = 'EXPIRED'
          }
        }
      }, 1000)
    },

    simulatePayment() {
      if (!this.currentOrder) return
      if (this.currentOrder.status === 'EXPIRED') {
        throw new Error('Pesanan telah kedaluwarsa dan tidak dapat dibayar')
      }
      if (this.currentOrder.status !== 'PENDING_PAYMENT') {
        return
      }
      this.isLoading = true
      setTimeout(() => {
        this.isLoading = false
        if (this.currentOrder && this.currentOrder.status === 'PENDING_PAYMENT') {
          this.currentOrder.status = 'CONFIRMED'
          if (this.qrisInterval) {
            clearInterval(this.qrisInterval)
            this.qrisInterval = null
          }
          this.currentOrder.trackingStages[0].isCompleted = true
          this.currentOrder.trackingStages[0].isActive = false
          this.currentOrder.trackingStages[1].isCompleted = true
          this.currentOrder.trackingStages[1].isActive = false
          this.currentOrder.trackingStages[2].isCompleted = false
          this.currentOrder.trackingStages[2].isActive = true
        }
      }, 500)
    },

    advanceTrackingStage() {
      if (!this.currentOrder) return
      const stages = this.currentOrder.trackingStages
      const activeIndex = stages.findIndex(s => s.isActive)

      if (activeIndex > -1 && activeIndex < stages.length - 1) {
        stages[activeIndex].isActive = false
        stages[activeIndex].isCompleted = true
        stages[activeIndex + 1].isActive = true

        const statusMap: OrderStatus[] = [
          'CONFIRMED',
          'COLD_ROOM_INTAKE',
          'BUTCHERING_PREP',
          'COLD_PACKED',
          'OUT_FOR_DELIVERY',
          'DELIVERED'
        ]
        this.currentOrder.status = statusMap[activeIndex + 1] || 'OUT_FOR_DELIVERY'
      } else if (activeIndex === stages.length - 1) {
        stages[activeIndex].isActive = false
        stages[activeIndex].isCompleted = true
        this.currentOrder.status = 'DELIVERED'
      }
    },

    openScaleSlipModal() {
      this.isScaleSlipModalOpen = true
    },

    closeScaleSlipModal() {
      this.isScaleSlipModalOpen = false
    }
  }
})
