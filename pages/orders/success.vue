<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '~/stores/order'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Pembayaran Berhasil & Bukti Lunas | Laut Berkah Abadi',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const route = useRoute()
const orderStore = useOrderStore()

const orderNumber = computed(() => String(route.query.order_number || route.query.order_id || ''))
const orderData = ref<any>(null)
const isLoading = ref(true)

const formatRupiah = (val?: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

const formatDate = (isoString?: string) => {
  if (!isoString) return '-'
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(d)
  } catch {
    return isoString
  }
}

const resolvedOrderCode = computed(() => {
  return orderData.value?.order_number || orderNumber.value || 'LBA-PROSES'
})

const resolvedInvoiceCode = computed(() => {
  const ord = resolvedOrderCode.value
  const datePart = orderData.value?.paid_at 
    ? orderData.value.paid_at.slice(0, 10).replace(/-/g, '') 
    : (orderData.value?.created_at ? orderData.value.created_at.slice(0, 10).replace(/-/g, '') : '20261028')
  return `INV/LBA/${datePart}/${ord}`
})

const resolvedPaymentMethodTitle = computed(() => {
  const method = orderData.value?.payment_method
  const bank = orderData.value?.payment_bank
  if (bank) {
    return `${bank.toUpperCase()} Virtual Account`
  }
  if (method === 'bca_va') return 'BCA Virtual Account'
  if (method === 'bni_va') return 'BNI Virtual Account'
  if (method === 'bri_va') return 'BRI Virtual Account'
  if (method === 'mandiri_va') return 'Mandiri Bill / E-Channel'
  if (method === 'permata_va') return 'Permata Virtual Account'
  if (method === 'qris') return 'QRIS Dinamis (Semua E-Wallet & Bank)'
  return 'QRIS Dinamis Terverifikasi'
})

const packagingLabel = computed(() => {
  const pack = orderData.value?.packaging_type
  if (pack === 'styrofoam_box') {
    return 'Box Styrofoam Segel + 4 Ice Gel + Flake Ice (Suhu Stabil Hingga 24 Jam)'
  }
  return 'Thermal Bag Insulasi Tebal + 2 Ice Gel Food-Grade (Suhu Terjaga Hingga 8 Jam)'
})

const resolvedAddress = computed(() => {
  const raw = orderData.value?.shipping_address
  if (typeof raw === 'string') return raw
  if (raw && typeof raw === 'object') {
    return raw.address_detail || raw.address || raw.receiver_address || '-'
  }
  return orderData.value?.address_detail || '-'
})

const fetchConfirmedOrder = async () => {
  if (!orderNumber.value) {
    if (orderStore.currentOrder) {
      orderData.value = {
        order_number: orderStore.currentOrder.id,
        grand_total: orderStore.currentOrder.totalAmount,
        subtotal_amount: orderStore.currentOrder.totalAmount - (orderStore.currentOrder.shippingCost || 0) - (orderStore.currentOrder.packagingFee || 0),
        packaging_fee: orderStore.currentOrder.packagingFee || 0,
        shipping_fee: orderStore.currentOrder.shippingCost || 0,
        delivery_slot: orderStore.currentOrder.deliverySlotLabel,
        payment_method: 'qris',
        cold_chain_status: 'COLD_ROOM_INTAKE',
        paid_at: new Date().toISOString(),
        items: orderStore.currentOrder.items.map(it => ({
          product_name: it.name,
          cut_type: it.cutLabel,
          gross_weight: it.quantityKg,
          price_per_kg: it.pricePerKg,
          subtotal: it.itemSubtotal,
          estimated_net_weight: it.cutType === 'fillet' ? it.quantityKg * 0.5 : (it.cutType === 'siang' ? it.quantityKg * 0.85 : it.quantityKg),
          soup_bones_separated: false
        })),
        shipping_address: orderStore.currentOrder.address,
        recipient_name: 'Pelanggan LBA',
        recipient_phone: '0812-3456-7890'
      }
    }
    isLoading.value = false
    return
  }

  try {
    const api = useApi()
    const target = orderNumber.value
    const res = await api.get<any>(`/orders/track/${target}`).catch(async () => {
      return await api.get<any>(`/orders/${target}`).catch(() => null)
    })
    if (res) {
      orderData.value = res
    } else if (orderStore.currentOrder) {
      orderData.value = {
        order_number: orderStore.currentOrder.id,
        grand_total: orderStore.currentOrder.totalAmount,
        subtotal_amount: orderStore.currentOrder.totalAmount - (orderStore.currentOrder.shippingCost || 0) - (orderStore.currentOrder.packagingFee || 0),
        packaging_fee: orderStore.currentOrder.packagingFee || 0,
        shipping_fee: orderStore.currentOrder.shippingCost || 0,
        delivery_slot: orderStore.currentOrder.deliverySlotLabel,
        payment_method: 'qris',
        cold_chain_status: 'COLD_ROOM_INTAKE',
        paid_at: new Date().toISOString(),
        items: orderStore.currentOrder.items.map(it => ({
          product_name: it.name,
          cut_type: it.cutLabel,
          gross_weight: it.quantityKg,
          price_per_kg: it.pricePerKg,
          subtotal: it.itemSubtotal,
          estimated_net_weight: it.cutType === 'fillet' ? it.quantityKg * 0.5 : (it.cutType === 'siang' ? it.quantityKg * 0.85 : it.quantityKg),
          soup_bones_separated: false
        })),
        shipping_address: orderStore.currentOrder.address,
      }
    }
  } catch (err) {
    console.error('Failed to load confirmed order:', err)
  } finally {
    isLoading.value = false
  }
}

const handlePrintReceipt = () => {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

onMounted(() => {
  fetchConfirmedOrder()
  orderStore.fetchUnpaidOrders()
})
</script>

<template>
  <div class="w-full max-w-2xl mx-auto py-4 sm:py-6 flex flex-col gap-5">
    <!-- Breadcrumb Desktop -->
    <nav class="hidden md:flex items-center gap-2 text-xs text-slate-500 print:hidden">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <NuxtLink to="/pesanan" class="hover:text-[#103860] transition-colors">Pesanan</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <span class="font-semibold text-[#103860]">Pembayaran Selesai & Bukti Lunas</span>
    </nav>

    <!-- Connected Stepper Bar (Step 3: Dikemas Aktif) -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs print:hidden">
      <div class="flex items-center justify-between relative px-2 sm:px-4">
        <!-- Connecting Line Background -->
        <div class="absolute left-8 right-8 top-3.5 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"></div>
        <!-- Active Connecting Line (Progress up to Step 3: Dikemas) -->
        <div class="absolute left-8 w-[66%] top-3.5 -translate-y-1/2 h-0.5 bg-emerald-500 -z-0"></div>

        <!-- Step 1: Keranjang (Selesai) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <span class="material-symbols-outlined text-[15px]">check</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-bold text-slate-700">Keranjang</span>
        </div>

        <!-- Step 2: Pembayaran (Selesai) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <span class="material-symbols-outlined text-[15px]">check</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-bold text-slate-700">Pembayaran</span>
        </div>

        <!-- Step 3: Dikemas (Aktif di Cold Room Intake) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-[#103860] text-white flex items-center justify-center text-xs font-bold shadow-xs ring-4 ring-blue-100 animate-pulse">
            <span class="text-[11px]">3</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-extrabold text-[#103860]">Dikemas</span>
        </div>

        <!-- Step 4: Pengiriman (Menunggu) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-xs font-semibold">
            <span class="text-[11px]">4</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-medium text-slate-400">Pengiriman</span>
        </div>
      </div>
    </div>

    <!-- 1 Kartu Struk Tunggal Terpadu (Unified Official Receipt Slip) -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col gap-5">
      <!-- 1. Header Kuitansi: Konfirmasi Status (Kiri) & Aksi Faktur Resmi (Kanan) -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="w-11 h-11 min-w-[44px] min-h-[44px] aspect-square rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] shrink-0 self-start sm:self-center">
            <span class="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
          <div class="flex flex-col">
            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 class="text-base sm:text-lg font-extrabold text-[#103860] tracking-tight">
                Pembayaran Berhasil Dikonfirmasi
              </h1>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase shrink-0">
                LUNAS
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
              <span class="font-mono font-bold text-slate-700">#{{ resolvedOrderCode }}</span>
              <span>•</span>
              <span>{{ formatDate(orderData?.paid_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Aksi Akses Dokumen Faktur Resmi A4 (Pojok Kanan) -->
        <div class="flex items-center gap-2 w-full sm:w-auto print:hidden">
          <NuxtLink
            :to="`/invoice/${resolvedOrderCode}`"
            class="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#103860] text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span class="material-symbols-outlined text-[16px] text-emerald-600">description</span>
            <span>Buka Faktur Resmi A4</span>
          </NuxtLink>
          <button
            type="button"
            @click="handlePrintReceipt"
            class="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            title="Cetak Kuitansi Ringkas"
          >
            <span class="material-symbols-outlined text-[18px]">print</span>
          </button>
        </div>
      </div>

      <!-- 2. Integrated Cold Chain Status Strip (Bar Horizontal Rantai Dingin Terpadu) -->
      <div class="p-3 sm:p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <div class="flex flex-col min-w-0">
            <span class="font-bold text-[#103860] truncate">
              Tahap 1: Cold Room Intake Pelabuhan Muncar (-20°C)
            </span>
            <span class="text-[11px] text-slate-600 truncate">
              Ikan tangkapan hari ini siap dibekukan cepat untuk mengunci kesegaran alami daging.
            </span>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-blue-900 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200/60 shrink-0">
          <span class="material-symbols-outlined text-[13px] text-blue-700">ac_unit</span>
          <span>Suhu Terkontrol</span>
        </div>
      </div>

      <!-- 3. Key Logistics & Payment Detail Grid (2 Kolom) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <!-- Jadwal Tiba Pengiriman -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 text-slate-500">
            <span class="material-symbols-outlined text-[16px] text-[#103860]">schedule</span>
            <span class="text-[11px] font-bold text-slate-600">Jadwal Pengantaran Subuh:</span>
          </div>
          <span class="font-extrabold text-[#103860] text-sm">
            {{ orderData?.delivery_slot || 'Slot Pagi (06:00 - 08:30 WIB / 07:00 - 09:30 WITA)' }}
          </span>
          <span class="text-[11px] text-slate-600 leading-snug">
            Armada thermo-insulated berangkat jam subuh langsung dari fasilitas Muncar.
          </span>
        </div>

        <!-- Kanal Pembayaran -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 text-slate-500">
            <span class="material-symbols-outlined text-[16px] text-[#103860]">payments</span>
            <span class="text-[11px] font-bold text-slate-600">Metode & Kanal Bayar:</span>
          </div>
          <span class="font-extrabold text-[#103860] text-sm">
            {{ resolvedPaymentMethodTitle }}
          </span>
          <span class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">check_circle</span>
            Verifikasi Instan Otomatis (Settlement)
          </span>
        </div>
      </div>

      <!-- 4. Recipient & GPS Coordinate Block -->
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2 text-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-slate-600">
            <span class="material-symbols-outlined text-[16px] text-[#103860]">location_on</span>
            <span class="text-[11px] font-bold text-slate-700">Tujuan Pengiriman:</span>
          </div>
          <span v-if="orderData?.latitude && orderData?.longitude" class="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            GPS: {{ orderData.latitude.toFixed(4) }}, {{ orderData.longitude.toFixed(4) }}
          </span>
        </div>
        <div class="flex flex-col gap-0.5 pl-5">
          <div class="font-bold text-[#103860] flex items-center gap-2">
            <span>{{ orderData?.recipient_name || 'Pelanggan LBA' }}</span>
            <span class="text-slate-400 font-normal">|</span>
            <span class="font-mono text-slate-600">{{ orderData?.recipient_phone || '-' }}</span>
          </div>
          <p class="text-slate-600 leading-relaxed">
            {{ resolvedAddress }}
          </p>
          <div v-if="orderData?.district_name || orderData?.city_name" class="text-[11px] text-slate-500 mt-0.5">
            Kec. {{ orderData.district_name || '-' }}, {{ orderData.city_name || 'Banyuwangi' }}
          </div>
        </div>
      </div>

      <!-- 5. Itemized Catch-Weight Product Breakdown -->
      <div class="flex flex-col gap-3 pt-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#103860] uppercase tracking-wider">
            Rincian Komoditas Laut (Catch-Weight)
          </span>
          <span class="text-[11px] text-slate-500">
            {{ orderData?.items?.length || 0 }} Komoditas
          </span>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th class="py-2.5 px-3">Komoditas & Potongan</th>
                <th class="py-2.5 px-2 text-center">Timbang Basah</th>
                <th class="py-2.5 px-2 text-center">Estimasi Bersih</th>
                <th class="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr v-for="(item, idx) in orderData?.items" :key="idx" class="hover:bg-slate-50/50">
                <td class="py-2.5 px-3">
                  <div class="font-bold text-slate-800">{{ item.product_name }}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">
                    Potongan: <span class="font-semibold text-slate-700">{{ item.cut_type }}</span>
                  </div>
                  <div v-if="item.soup_bones_separated" class="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                    <span class="material-symbols-outlined text-[11px]">soup_kitchen</span>
                    Kepala & tulang dipisah rapi untuk kaldu sup
                  </div>
                </td>
                <td class="py-2.5 px-2 text-center font-mono font-medium">
                  {{ item.gross_weight }} kg
                  <div class="text-[10px] text-slate-400 font-sans">
                    @ {{ formatRupiah(item.price_per_kg) }}/kg
                  </div>
                </td>
                <td class="py-2.5 px-2 text-center font-mono text-slate-600">
                  {{ item.estimated_net_weight ? item.estimated_net_weight + ' kg' : '-' }}
                  <div class="text-[10px] text-emerald-600 font-sans font-medium">
                    Siap Olah
                  </div>
                </td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                  {{ formatRupiah(item.subtotal) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 6. Financial Reconciliation Summary -->
      <div class="flex flex-col gap-2 pt-3 border-t border-slate-100 text-xs">
        <div class="flex items-center justify-between text-slate-600">
          <span>Subtotal Komoditas Tangkapan:</span>
          <span class="font-mono font-semibold text-slate-800">
            {{ formatRupiah(orderData?.subtotal_amount || (orderData?.grand_total - (orderData?.packaging_fee || 0) - (orderData?.shipping_fee || 0))) }}
          </span>
        </div>

        <div class="flex items-center justify-between text-slate-600">
          <div class="flex flex-col">
            <span>Proteksi Rantai Dingin:</span>
            <span class="text-[10px] text-slate-500">{{ packagingLabel }}</span>
          </div>
          <span class="font-mono font-semibold text-slate-800">
            {{ formatRupiah(orderData?.packaging_fee) }}
          </span>
        </div>

        <div class="flex items-center justify-between text-slate-600">
          <div class="flex flex-col">
            <span>Ongkos Pengiriman Cold-Chain:</span>
            <span class="text-[10px] text-slate-500">Armada Berpendingin Khusus Area Banyuwangi</span>
          </div>
          <span class="font-mono font-semibold text-slate-800">
            {{ formatRupiah(orderData?.shipping_fee) }}
          </span>
        </div>

        <div class="flex items-center justify-between pt-2.5 border-t border-slate-200 text-sm font-extrabold text-[#103860]">
          <span>Total Pembayaran Lunas (PAID):</span>
          <span class="font-mono text-emerald-700 text-base">
            {{ formatRupiah(orderData?.grand_total || orderData?.total_amount) }}
          </span>
        </div>
      </div>

      <!-- 7. Cold Chain Assurance Box -->
      <div class="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
        <span class="material-symbols-outlined text-[20px] text-[#059669] shrink-0 mt-0.5">ac_unit</span>
        <div class="flex flex-col gap-0.5 text-xs text-emerald-950">
          <span class="font-bold text-[#059669]">Jaminan Segar Rantai Dingin 100%</span>
          <p class="text-[11px] text-emerald-900 leading-relaxed">
            Ikan dibekukan cepat dan dikemas dengan ice pack gel food-grade di pelabuhan Muncar. Kurir akan melampirkan foto timbangan basah dan foto serah terima saat tiba di lokasi Anda.
          </p>
        </div>
      </div>
    </div>

    <!-- Bilah 2 Tombol Aksi Bawah Seimbang (Primary Navy & Secondary Outline) -->
    <div class="flex flex-col sm:flex-row items-center gap-3 print:hidden">
      <NuxtLink
        :to="`/pesanan/${resolvedOrderCode}`"
        class="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[18px]">local_shipping</span>
        <span>Lacak Perjalanan Rantai Dingin</span>
      </NuxtLink>

      <NuxtLink
        to="/katalog"
        class="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[18px]">storefront</span>
        <span>Belanja Ikan Lainnya</span>
      </NuxtLink>
    </div>
  </div>
</template>
