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
  isDropship?: boolean
  senderName?: string
  senderPhone?: string
  hidePriceOnInvoice?: boolean
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
    key: 'created',
    title: 'Pesanan Dibuat',
    description: 'Pesanan tercatat dan pembayaran terverifikasi',
    timestamp: 'Tercatat',
    isCompleted: true,
    isActive: false
  },
  {
    stageIndex: 2,
    key: 'prep',
    title: 'Sedang Disiapkan',
    description: 'Ikan segar disiangi dan dikemas rantai dingin',
    timestamp: 'Proses',
    isCompleted: false,
    isActive: true
  },
  {
    stageIndex: 3,
    key: 'delivery',
    title: 'Dalam Pengiriman',
    description: 'Kurir dalam perjalanan menuju alamat tujuan',
    timestamp: null,
    isCompleted: false,
    isActive: false
  },
  {
    stageIndex: 4,
    key: 'delivered',
    title: 'Pesanan Tiba',
    description: 'Menunggu paket diterima di alamat tujuan',
    timestamp: null,
    isCompleted: false,
    isActive: false
  }
]

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    currentOrder: {
      id: 'LBA-20261022-15B9',
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
      items: [
        {
          id: 'item-1',
          productId: 'tenggiri-papan',
          name: 'Ikan Tenggiri Papan Segar',
          slug: 'ikan-tenggiri-papan-segar',
          imageUrl: 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp',
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
          imageUrl: 'https://cdn.ammarabufadhel.my.id/products/asset-1524704654690-8ae8d959.webp',
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
      deliverySlotLabel: 'Slot Pagi: 06:00 - 08:30 WIB (Terbaik)',
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
      scaleSlipImageUrl: 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp',
      qualityCertificateUrl: 'https://cdn.ammarabufadhel.my.id/products/asset-1519708227418-ea35d7d8.webp',
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
    async createOrder() {
      const cartStore = useCartStore()
      const checkoutStore = useCheckoutStore()

      let orderNumber = `LBA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`
      const total = checkoutStore.totalBill

      // Attempt to generate real order in backend first if logged in
      if (typeof window !== 'undefined') {
        try {
          const api = useApi()
          const isDropship = Boolean(checkoutStore.isDropship)
          const isTextFallback = Boolean(checkoutStore.isTextOnlyFallback)
          const backendPayload = {
            items: cartStore.items.map(it => ({
              product_id: it.productId,
              cut_type: it.cutType,
              gross_weight: it.quantityKg,
              estimated_net_weight: it.estimatedNetWeightKg,
              soup_bones_separated: it.separateSoupBones || false,
            })),
            delivery_slot: checkoutStore.slotDetails.title,
            packaging_type: cartStore.packagingType,
            shipping_courier: checkoutStore.selectedCourier,
            shipping_address: {
              ...checkoutStore.address,
              isDropship,
              senderName: isDropship ? checkoutStore.senderName : null,
              senderPhone: isDropship ? checkoutStore.senderPhone : null,
              isTextOnlyFallback: isTextFallback,
            },
            is_dropship: isDropship,
            sender_name: isDropship ? checkoutStore.senderName : null,
            sender_phone: isDropship ? checkoutStore.senderPhone : null,
            recipient_name: checkoutStore.address.recipientName,
            recipient_phone: checkoutStore.address.recipientPhone,
            province_name: checkoutStore.address.provinsiNama || 'Jawa Timur',
            city_name: checkoutStore.address.kabupatenNama || 'Banyuwangi',
            district_name: checkoutStore.address.kecamatanNama || '',
            subdistrict_name: checkoutStore.address.desaNama || '',
            address_detail: checkoutStore.address.street,
            latitude: !isTextFallback ? checkoutStore.address.coordinates?.lat : null,
            longitude: !isTextFallback ? checkoutStore.address.coordinates?.lng : null,
            hide_price_on_invoice: isDropship,
            payment_method: 'qris',
          }
          const res = await api.post<any>('/orders', backendPayload)
          if (res && (res.orderNumber || res.order_number || res.id)) {
            orderNumber = res.orderNumber || res.order_number || res.id
          }
        } catch {}
      }

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
        scaleSlipImageUrl: '',
        qualityCertificateUrl: '',
        scaleWeightGrossKg: cartStore.totalGrossWeightKg,
        isDropship: checkoutStore.isDropship,
        senderName: checkoutStore.isDropship ? checkoutStore.senderName : undefined,
        senderPhone: checkoutStore.isDropship ? checkoutStore.senderPhone : undefined,
        hidePriceOnInvoice: checkoutStore.isDropship,
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

      // Sync with backend if available
      if (typeof window !== 'undefined') {
        try {
          const api = useApi()
          api.post(`/orders/${this.currentOrder.id}/simulate-payment`).catch(() => {})
        } catch {}
      }

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

    async fetchOrderStatus(orderId: string) {
      if (typeof window === 'undefined') return null
      try {
        const api = useApi()
        const data = await api.get<any>(`/orders/track/${orderId}`)
        if (data && (data.id || data.order_number)) {
          const ordNum = data.order_number || data.id
          const status = data.cold_chain_status || 'PENDING_PAYMENT'

          // Build dynamic 4 simple tracking stages based on current backend status
          const stages: TrackingStage[] = [
            {
              stageIndex: 1,
              key: 'created',
              title: 'Pesanan Dibuat',
              description: data.payment_status === 'PAID' || status !== 'PENDING_PAYMENT'
                ? 'Pesanan tercatat dan pembayaran terverifikasi'
                : 'Menunggu penyelesaian pembayaran',
              timestamp: data.created_at ? new Date(data.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Tercatat',
              isCompleted: data.payment_status === 'PAID' || status !== 'PENDING_PAYMENT',
              isActive: status === 'PENDING_PAYMENT'
            },
            {
              stageIndex: 2,
              key: 'prep',
              title: 'Sedang Disiapkan',
              description: ['COLD_PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)
                ? 'Ikan segar telah disiangi dan dikemas rantai dingin'
                : (['CONFIRMED', 'COLD_ROOM_INTAKE', 'BUTCHERING_PREP'].includes(status)
                    ? 'Ikan sedang disiangi dan dikemas rapi'
                    : 'Menunggu giliran penyiapan'),
              timestamp: ['COLD_PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status) ? 'Selesai Dikemas' : null,
              isCompleted: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status),
              isActive: ['CONFIRMED', 'COLD_ROOM_INTAKE', 'BUTCHERING_PREP', 'COLD_PACKED'].includes(status)
            },
            {
              stageIndex: 3,
              key: 'delivery',
              title: 'Dalam Pengiriman',
              description: status === 'OUT_FOR_DELIVERY'
                ? (data.courier_notes ? data.courier_notes : 'Kurir LBA sedang mengantar paket ke alamat tujuan')
                : (status === 'DELIVERED' ? 'Kurir telah tiba di alamat tujuan' : 'Menunggu kurir berangkat'),
              timestamp: status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED' ? 'Dalam Perjalanan' : null,
              isCompleted: status === 'DELIVERED',
              isActive: status === 'OUT_FOR_DELIVERY'
            },
            {
              stageIndex: 4,
              key: 'delivered',
              title: 'Pesanan Tiba',
              description: status === 'DELIVERED'
                ? (data.received_by ? `Paket telah diterima oleh ${data.received_by}` : 'Paket hasil laut telah diterima dengan baik')
                : 'Menunggu paket diserahkan ke penerima',
              timestamp: status === 'DELIVERED' ? 'Terkirim' : null,
              isCompleted: status === 'DELIVERED',
              isActive: status === 'DELIVERED'
            }
          ]

          const mappedItems = (data.items || []).map((it: any, i: number) => ({
            id: `item-${i}`,
            productId: it.product_name,
            name: it.product_name,
            price: Number(it.price_per_kg) || 0,
            quantity: Number(it.gross_weight) || 1,
            selectedCut: it.cut_type || 'utuh_bersih',
            grossWeightKg: Number(it.gross_weight) || 1,
            netWeightKg: Number(it.estimated_net_weight) || Number(it.gross_weight) || 1,
            soupBonesSeparated: false,
            imageUrl: it.image_url || it.imageUrl || 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp',
            subtotal: Number(it.subtotal) || ((Number(it.price_per_kg) || 0) * (Number(it.gross_weight) || 1))
          }))

          this.currentOrder = {
            id: ordNum,
            createdAt: data.created_at || new Date().toISOString(),
            status: status,
            items: mappedItems,
            packagingType: data.packaging_type || 'thermal_bag',
            packagingFee: Number(data.packaging_fee || 0),
            courierType: data.shipping_courier || 'kurir_lba',
            courierFee: Number(data.shipping_fee || 0),
            deliverySlot: 'subuh_06_08',
            deliverySlotLabel: data.delivery_slot || 'Slot Pagi (06:00 - 08:30 WIB)',
            kitchenNotes: data.courier_notes ? `Catatan: ${data.courier_notes}` : '',
            address: {
              recipientName: data.received_by || 'Pelanggan LBA',
              phoneNumber: '',
              streetAddress: '',
              district: 'Banyuwangi',
              city: 'Banyuwangi'
            },
            productsSubtotal: Number(data.total_amount || 0),
            totalAmount: Number(data.total_amount || 0),
            paymentMethod: (data.payment_method || 'qris') as any,
            qrisPayloadString: '',
            qrisImageUrl: '',
            scaleSlipImageUrl: data.scale_slip_url || '',
            qualityCertificateUrl: '',
            scaleWeightGrossKg: Number(data.scale_weight_gross_kg || 0),
            trackingStages: stages
          }

          return data
        }
      } catch {}
      return null
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

    async fetchMyOrders() {
      if (typeof window === 'undefined') return []
      this.isLoading = true
      this.error = null
      try {
        const api = useApi()
        const data = await api.get<any[]>('/orders')
        if (data && Array.isArray(data)) {
          const mappedOrders: Order[] = data.map((o: any) => {
            const items = (o.items || []).map((it: any, idx: number) => ({
              id: `item-${idx}-${it.product_id || 'prod'}`,
              productId: it.product_id || it.product_name,
              name: it.product_name || 'Komoditas Segar',
              slug: it.product_id || '',
              imageUrl: it.image_url || 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp',
              pricePerKg: Number(it.price_per_kg) || 0,
              quantityKg: Number(it.gross_weight) || 1,
              cutType: it.cut_type || 'utuh_bersih',
              cutLabel: it.cut_type ? it.cut_type.replace(/_/g, ' ') : 'Utuh Bersih',
              yieldRatio: 0.85,
              estimatedNetWeightKg: Number(it.estimated_net_weight) || Number(it.gross_weight) || 1,
              estimatedNetWeightGrams: Math.round((Number(it.estimated_net_weight) || Number(it.gross_weight) || 1) * 1000),
              separateSoupBones: false,
              itemSubtotal: Number(it.subtotal) || ((Number(it.price_per_kg) || 0) * (Number(it.gross_weight) || 1)),
              unit: 'kg'
            }))

            const status = (o.cold_chain_status || o.payment_status || 'CONFIRMED') as OrderStatus
            const stages: TrackingStage[] = [
              {
                stageIndex: 1,
                key: 'created',
                title: 'Pesanan Dibuat',
                description: o.payment_status === 'PAID' || status !== 'PENDING_PAYMENT'
                  ? 'Pesanan tercatat dan pembayaran terverifikasi'
                  : 'Menunggu penyelesaian pembayaran',
                timestamp: o.created_at ? new Date(o.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Tercatat',
                isCompleted: o.payment_status === 'PAID' || status !== 'PENDING_PAYMENT',
                isActive: status === 'PENDING_PAYMENT'
              },
              {
                stageIndex: 2,
                key: 'prep',
                title: 'Sedang Disiapkan',
                description: ['COLD_PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)
                  ? 'Ikan segar telah disiangi dan dikemas rantai dingin'
                  : (['CONFIRMED', 'COLD_ROOM_INTAKE', 'BUTCHERING_PREP'].includes(status)
                      ? 'Ikan sedang disiangi dan dikemas rapi'
                      : 'Menunggu giliran penyiapan'),
                timestamp: ['COLD_PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status) ? 'Selesai Dikemas' : null,
                isCompleted: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status),
                isActive: ['CONFIRMED', 'COLD_ROOM_INTAKE', 'BUTCHERING_PREP', 'COLD_PACKED'].includes(status)
              },
              {
                stageIndex: 3,
                key: 'delivery',
                title: 'Dalam Pengiriman',
                description: status === 'OUT_FOR_DELIVERY'
                  ? 'Kurir LBA sedang mengantar paket ke alamat tujuan'
                  : (status === 'DELIVERED' ? 'Kurir telah tiba di alamat tujuan' : 'Menunggu kurir berangkat'),
                timestamp: status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED' ? 'Dalam Perjalanan' : null,
                isCompleted: status === 'DELIVERED',
                isActive: status === 'OUT_FOR_DELIVERY'
              },
              {
                stageIndex: 4,
                key: 'delivered',
                title: 'Pesanan Tiba',
                description: status === 'DELIVERED'
                  ? 'Paket hasil laut telah diterima dengan baik'
                  : 'Menunggu paket diserahkan ke penerima',
                timestamp: status === 'DELIVERED' ? 'Terkirim' : null,
                isCompleted: status === 'DELIVERED',
                isActive: status === 'DELIVERED'
              }
            ]

            return {
              id: o.order_number || o.id,
              createdAt: o.created_at || new Date().toISOString(),
              status,
              items,
              packagingType: o.packaging_type || 'thermal_bag',
              packagingFee: Number(o.packaging_fee || 0),
              courierType: o.shipping_courier || 'kurir_lba',
              courierFee: Number(o.shipping_fee || 0),
              deliverySlot: 'subuh_06_0830',
              deliverySlotLabel: o.delivery_slot || '06:00 - 08:30 WIB (Slot Pagi Siap Masak)',
              kitchenNotes: '',
              address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : (o.shipping_address || {}),
              productsSubtotal: Number(o.products_subtotal || 0),
              totalAmount: Number(o.total_amount || 0),
              paymentMethod: (o.payment_method || 'qris_dynamic') as PaymentMethod,
              qrisPayloadString: '',
              qrisImageUrl: '',
              scaleSlipImageUrl: o.scale_slip_url || 'https://cdn.ammarabufadhel.my.id/banners/banner-packing-thermal-aa77a0a0.webp',
              qualityCertificateUrl: '',
              scaleWeightGrossKg: Number(o.scale_weight_gross_kg || 0) || (items.reduce((s: number, it: any) => s + it.quantityKg, 0)) || 1.0,
              trackingStages: stages,
            }
          })

          this.ordersHistory = mappedOrders
          if (mappedOrders.length > 0) {
            const active = mappedOrders.find(o => o.status !== 'DELIVERED') || mappedOrders[0]
            if (active) {
              this.currentOrder = active
            }
          }
          this.isLoading = false
          return mappedOrders
        }
      } catch (err: any) {
        this.isLoading = false
        this.error = err?.detail || err?.message || 'Gagal memuat daftar pesanan Anda.'
      }
      this.isLoading = false
      return this.ordersHistory
    },

    openScaleSlipModal() {
      this.isScaleSlipModalOpen = true
    },

    closeScaleSlipModal() {
      this.isScaleSlipModalOpen = false
    }
  }
})
