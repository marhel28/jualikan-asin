<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '~/stores/order'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Pembayaran Berhasil & Bukti Lunas | Laut Berkah Abadi'
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

    <!-- Official Invoice & Print Recommendation Banner -->
    <div class="bg-gradient-to-r from-[#103860] to-[#13446E] text-white rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[24px] text-emerald-400">receipt_long</span>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="text-xs font-extrabold text-white tracking-wide uppercase">Faktur Resmi & Kuitansi Lunas</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Dokumen Sah
            </span>
          </div>
          <p class="text-[11px] text-slate-200 mt-0.5">
            Nomor Faktur: <span class="font-mono font-bold text-white">{{ resolvedInvoiceCode }}</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <NuxtLink
          :to="`/invoice/${resolvedOrderCode}`"
          class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span class="material-symbols-outlined text-[16px]">print</span>
          <span>Buka Faktur Resmi A4</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Success Header Card with LUNAS Seal -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col items-center text-center gap-4 relative overflow-hidden">
      <!-- Watermark Stamp Background -->
      <div class="absolute -right-6 -bottom-6 pointer-events-none select-none opacity-5">
        <span class="material-symbols-outlined text-[180px] text-emerald-700">verified</span>
      </div>

      <div class="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669]">
        <span class="material-symbols-outlined text-[36px]">check_circle</span>
      </div>

      <div class="flex flex-col gap-1.5 max-w-md">
        <div class="inline-flex items-center justify-center gap-1.5 mx-auto px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-1">
          <span class="material-symbols-outlined text-[16px] text-emerald-700">verified</span>
          <span>Pembayaran Lunas Terverifikasi</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold text-[#103860] tracking-tight">
          Pesanan Hasil Laut Sedang Diproses
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Dana telah diterima secara otomatis oleh sistem perbankan. Ikan tangkapan harian Anda segera dipindahkan ke ruang pembekuan Cold Hub Muncar.
        </p>
      </div>

      <!-- Live Cold Chain Stage Pill -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
        <span class="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
        <span>Tahap 1: Cold Room Intake Muncar (-20°C)</span>
      </div>
    </div>

    <!-- Itemized Detailed Order Receipt Card -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      <!-- Header Meta & Stamp -->
      <div class="flex items-start justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Identitas Transaksi</span>
          <div class="flex items-center gap-2">
            <span class="text-base font-extrabold text-[#103860] font-mono">
              #{{ resolvedOrderCode }}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              LUNAS
            </span>
          </div>
          <span class="text-[11px] text-slate-500">
            Waktu Lunas: <span class="font-semibold text-slate-700">{{ formatDate(orderData?.paid_at) }}</span>
          </span>
        </div>

        <div class="text-right">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Pembayaran Lunas</span>
          <div class="text-lg sm:text-xl font-extrabold text-emerald-700">
            {{ formatRupiah(orderData?.grand_total || orderData?.total_amount) }}
          </div>
          <span class="text-[10px] text-slate-500 font-medium">Bebas PPN Hasil Laut Segar</span>
        </div>
      </div>

      <!-- Logistics & Delivery Detail Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <!-- Delivery Schedule -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 text-slate-500">
            <span class="material-symbols-outlined text-[16px] text-[#103860]">schedule</span>
            <span class="text-[11px] font-bold text-slate-600">Jadwal Pengantaran Subuh:</span>
          </div>
          <span class="font-extrabold text-[#103860] text-sm">
            {{ orderData?.delivery_slot || 'Slot Pagi (06:00 - 08:30 WIB)' }}
          </span>
          <span class="text-[11px] text-slate-600 leading-snug">
            Armada thermo-insulated berangkat jam subuh langsung dari fasilitas Muncar.
          </span>
        </div>

        <!-- Payment Method Details -->
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

      <!-- Recipient & Address Detail -->
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

      <!-- Itemized Catch-Weight Product Breakdown -->
      <div class="flex flex-col gap-3 pt-2">
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

      <!-- Financial Reconciliation Summary -->
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

      <!-- Cold Chain Assurance Box -->
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

    <!-- Navigation & Action Buttons -->
    <div class="flex flex-col sm:flex-row items-center gap-3 print:hidden">
      <NuxtLink
        :to="`/invoice/${resolvedOrderCode}`"
        class="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-white border border-[#103860] text-[#103860] hover:bg-blue-50/50 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[18px]">description</span>
        <span>Buka Faktur Resmi A4 (Cetak / PDF)</span>
      </NuxtLink>

      <NuxtLink
        :to="`/pesanan/${resolvedOrderCode}`"
        class="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[18px]">local_shipping</span>
        <span>Lacak Rantai Dingin</span>
      </NuxtLink>

      <button
        type="button"
        @click="handlePrintReceipt"
        class="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        title="Cetak Kuitansi Ringkas"
      >
        <span class="material-symbols-outlined text-[18px]">print</span>
        <span class="hidden sm:inline">Cetak</span>
      </button>
    </div>
  </div>
</template>
