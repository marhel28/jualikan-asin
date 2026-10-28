<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '~/stores/order'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Detail & Riwayat Pesanan | Laut Berkah Abadi'
})

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = computed(() => String(route.params.orderId || ''))
const order = computed(() => orderStore.currentOrder)
const isRefreshing = ref(false)
const isLoading = ref(true)

let pollTimer: any = null

const refreshStatus = async () => {
  if (!orderId.value) return
  isRefreshing.value = true
  try {
    await orderStore.fetchOrderStatus(orderId.value)
  } finally {
    isRefreshing.value = false
    isLoading.value = false
  }
}

onMounted(async () => {
  if (orderId.value) {
    await refreshStatus()
    // Auto-polling status pesanan jika belum tiba
    pollTimer = setInterval(() => {
      if (order.value?.status !== 'DELIVERED') {
        orderStore.fetchOrderStatus(orderId.value)
      } else {
        if (pollTimer) clearInterval(pollTimer)
      }
    }, 10000)
  } else {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/pesanan')
  }
}

const resolvedOrderNumber = computed(() => {
  return order.value?.orderNumber || order.value?.id || orderId.value
})

const invoiceNumber = computed(() => {
  const ordNum = resolvedOrderNumber.value
  const datePart = order.value?.paidAt
    ? order.value.paidAt.slice(0, 10).replace(/-/g, '')
    : (order.value?.createdAt ? order.value.createdAt.slice(0, 10).replace(/-/g, '') : '20261028')
  return `INV/LBA/${datePart}/${ordNum}`
})

const resolvedPaymentMethodTitle = computed(() => {
  const bank = (order.value?.paymentBank || '').toUpperCase()
  const method = order.value?.paymentMethod
  if (bank) {
    if (bank.includes('BCA')) return 'BCA Virtual Account'
    if (bank.includes('BNI')) return 'BNI Virtual Account'
    if (bank.includes('BRI')) return 'BRI Virtual Account'
    if (bank.includes('MANDIRI')) return 'Mandiri Bill / E-Channel'
    if (bank.includes('PERMATA')) return 'Permata Virtual Account'
    if (bank.includes('QRIS')) return 'QRIS Dinamis Bank Indonesia'
    return `${bank} Virtual Account`
  }
  if (method === 'virtual_account') return 'Virtual Account Bank'
  if (method === 'qris_dynamic') return 'QRIS Dinamis Bank Indonesia'
  return 'QRIS Dinamis Terverifikasi'
})

const packagingLabel = computed(() => {
  const pack = order.value?.packagingType
  if (pack === 'styrofoam_box') {
    return 'Box Styrofoam Segel + 4 Ice Gel + Flake Ice (Suhu Stabil Hingga 24 Jam)'
  }
  return 'Thermal Bag Insulasi Tebal + 2 Ice Gel Food-Grade (Suhu Terjaga Hingga 8 Jam)'
})

const resolvedFullAddress = computed(() => {
  if (!order.value) return '-'
  const parts = [
    order.value.addressDetail || order.value.address?.streetAddress,
    order.value.subdistrictName ? `Kel. ${order.value.subdistrictName}` : '',
    order.value.districtName ? `Kec. ${order.value.districtName}` : (order.value.address?.district ? `Kec. ${order.value.address.district}` : ''),
    order.value.cityName || order.value.address?.city || 'Kabupaten Banyuwangi',
    order.value.provinceName || 'Jawa Timur'
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Muncar, Banyuwangi, Jawa Timur'
})

const waConciergeUrl = computed(() => {
  return `https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi%2C%20saya%20ingin%20menanyakan%20status%20pesanan%20dengan%20nomor%20${resolvedOrderNumber.value}.`
})

const formatRupiah = (val?: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

const formatDate = (isoString?: string | null) => {
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

const formatCutType = (cut?: string) => {
  if (!cut) return 'Utuh Bersih'
  const map: Record<string, string> = {
    utuh_bersih: 'Utuh Bersih Siang',
    fillet_tanpa_kulit: 'Fillet Tanpa Kulit',
    fillet_dengan_kulit: 'Fillet Skin-On',
    steak: 'Potong Steak',
    siang: 'Siang Bersih Sisik & Jeroan',
    frozen_utuh: 'Beku Utuh Suhu -20°C'
  }
  return map[cut] || cut.replace(/_/g, ' ')
}

const statusBadgeInfo = computed(() => {
  const status = order.value?.status
  const payStatus = order.value?.paymentStatus
  if (status === 'CANCELLED') {
    return { label: 'DIBATALKAN', class: 'bg-rose-50 text-rose-700 border-rose-200' }
  }
  if (status === 'EXPIRED') {
    return { label: 'KEDALUWARSA', class: 'bg-slate-100 text-slate-700 border-slate-300' }
  }
  if (status === 'PENDING_PAYMENT' || payStatus === 'PENDING') {
    return { label: 'MENUNGGU PEMBAYARAN', class: 'bg-amber-50 text-amber-800 border-amber-200' }
  }
  if (status === 'DELIVERED') {
    return { label: 'SELESAI DITERIMA', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }
  if (payStatus === 'PAID') {
    return { label: 'LUNAS', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }
  return { label: status || 'DIPROSES', class: 'bg-blue-50 text-blue-700 border-blue-200' }
})
</script>

<template>
  <div class="flex flex-col w-full gap-5 py-3">
    <!-- Desktop Breadcrumb -->
    <nav class="items-center hidden gap-2 text-xs md:flex text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <NuxtLink to="/pesanan" class="hover:text-[#103860] transition-colors">Pesanan Saya</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <span class="font-semibold text-[#103860]">Detail Pesanan #{{ resolvedOrderNumber }}</span>
    </nav>

    <!-- Top Bar: Header Tokopedia-Style dengan Tombol Download Invoice -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="goBack"
          class="md:hidden p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-[#103860]"
          aria-label="Kembali"
        >
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-bold text-[#103860]">Detail Pesanan</h1>
            <span
              class="px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase"
              :class="statusBadgeInfo.class"
            >
              {{ statusBadgeInfo.label }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
            <span class="font-mono font-bold text-slate-700">#{{ resolvedOrderNumber }}</span>
            <span>•</span>
            <span>Waktu Pesan: {{ formatDate(order?.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons Header: Download Invoice (PDF) & Segarkan -->
      <div class="flex items-center gap-2">
        <a
          :href="`/invoice/${resolvedOrderNumber}?download=1`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-[#103860] hover:bg-blue-50/50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          title="Unduh / Simpan Invoice dalam Format Dokumen PDF"
        >
          <span class="material-symbols-outlined text-[16px] text-emerald-600">download</span>
          <span>Download Invoice</span>
        </a>

        <NuxtLink
          :to="`/invoice/${resolvedOrderNumber}`"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          title="Buka Dokumen Faktur Resmi Standar A4"
        >
          <span class="material-symbols-outlined text-[16px]">visibility</span>
          <span class="hidden sm:inline">Lihat Faktur A4</span>
        </NuxtLink>

        <button
          type="button"
          @click="refreshStatus"
          :disabled="isRefreshing"
          class="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs cursor-pointer disabled:opacity-60"
          title="Segarkan Status Pesanan"
        >
          <span
            class="material-symbols-outlined text-[18px] text-[#103860]"
            :class="{ 'animate-spin': isRefreshing }"
          >sync</span>
        </button>
      </div>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="isLoading" class="w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-3">
      <div class="w-8 h-8 border-3 border-slate-200 border-t-[#103860] rounded-full animate-spin"></div>
      <span class="text-xs font-bold text-slate-600">Memuat rincian pesanan hasil laut...</span>
    </div>

    <!-- Error / Not Found State -->
    <div v-else-if="!order || orderStore.error" class="w-full bg-white rounded-2xl p-10 border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-3 text-center my-6">
      <div class="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-200">
        <span class="material-symbols-outlined text-[32px]">search_off</span>
      </div>
      <h2 class="text-sm font-bold text-slate-800">Pesanan Tidak Ditemukan</h2>
      <p class="text-xs text-slate-500 max-w-sm">
        Nomor pesanan <span class="font-mono font-bold text-slate-700">#{{ orderId }}</span> tidak terdaftar atau terjadi gangguan koneksi.
      </p>
      <div class="flex items-center gap-2 pt-2">
        <button
          type="button"
          @click="refreshStatus"
          class="px-4 py-2 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          Coba Lagi
        </button>
        <NuxtLink
          to="/pesanan"
          class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
        >
          Kembali ke Pesanan Saya
        </NuxtLink>
      </div>
    </div>

    <!-- 2-Column Tokopedia-Style Grid Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-[1.8fr_1.1fr] gap-5 items-start">
      
      <!-- KOLOM UTAMA (KIRI): Produk, Detail Pengiriman, Live Tracking -->
      <div class="flex flex-col gap-4">
        
        <!-- Status Banner: CANCELLED / EXPIRED -->
        <div v-if="order?.status === 'CANCELLED' || order?.status === 'EXPIRED'" class="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl shadow-xs flex flex-col gap-2.5">
          <div class="flex items-center justify-between pb-2 border-b border-rose-100">
            <div class="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider">
              <span class="material-symbols-outlined text-[18px] text-rose-600">cancel</span>
              <span>Status Transaksi</span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-rose-800 border border-rose-200">
              {{ order.status === 'EXPIRED' ? 'Kedaluwarsa' : 'Pesanan Dibatalkan' }}
            </span>
          </div>

          <div class="flex items-center gap-3 pt-1">
            <div class="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <span class="material-symbols-outlined text-[22px]">event_busy</span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-extrabold text-rose-950">
                {{ order.status === 'EXPIRED' ? 'Batas Waktu Pembayaran Telah Habis' : 'Pesanan Telah Dibatalkan' }}
              </span>
              <p class="text-xs text-rose-800 leading-snug mt-0.5">
                Stok komoditas ikan segar telah dikembalikan ke cold storage dermaga Muncar. Silakan buat pesanan baru melalui katalog.
              </p>
            </div>
          </div>
        </div>

        <!-- Status Banner: PENDING_PAYMENT -->
        <div v-else-if="order?.status === 'PENDING_PAYMENT' || order?.paymentStatus === 'PENDING'" class="p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[22px]">credit_card_clock</span>
            </div>
            <div>
              <span class="text-xs font-bold text-amber-950 block">Menunggu Pembayaran</span>
              <p class="text-[11px] text-amber-800 mt-0.5">Selesaikan pembayaran agar pesanan segar Anda segera diproses penyiapan.</p>
            </div>
          </div>
          <NuxtLink
            :to="`/pembayaran/${resolvedOrderNumber}`"
            class="px-4 py-2.5 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold shrink-0 text-center shadow-xs transition"
          >
            Bayar Sekarang
          </NuxtLink>
        </div>

        <!-- Status Card: Cold Room Intake & Rantai Dingin Active -->
        <div v-else class="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-2.5">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2 text-xs font-bold text-[#103860] uppercase tracking-wider">
              <span class="material-symbols-outlined text-[18px] text-emerald-600">ac_unit</span>
              <span>Status Rantai Dingin Muncar</span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Suhu Terkontrol Presisi
            </span>
          </div>

          <div class="flex items-center gap-3 pt-1">
            <div class="w-10 h-10 rounded-xl bg-[#103860] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <span class="material-symbols-outlined text-[22px]">inventory_2</span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-extrabold text-[#103860]">
                Tahap 1: Cold Room Intake Pelabuhan Muncar (-20°C)
              </span>
              <p class="text-xs text-slate-600 leading-snug mt-0.5">
                Ikan tangkapan hari ini siap dibekukan cepat untuk mengunci kesegaran alami daging. Armada berangkat jam subuh.
              </p>
            </div>
          </div>
        </div>

        <!-- Kartu 1: Daftar Komoditas Hasil Laut yang Dibeli (Tokopedia Items View) -->
        <div class="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-[#103860]">set_meal</span>
              <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider">
                Komoditas Hasil Laut Presisi
              </h2>
            </div>
            <span class="text-xs text-slate-500 font-medium">
              {{ order?.items?.length || 0 }} Komoditas
            </span>
          </div>

          <!-- List Komoditas -->
          <div v-if="order?.items && order.items.length > 0" class="flex flex-col divide-y divide-slate-100">
            <div
              v-for="(item, idx) in order.items"
              :key="idx"
              class="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div class="flex items-start gap-3.5">
                <img
                  :src="item.imageUrl || 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp'"
                  :alt="item.name || 'Ikan Laut Segar'"
                  class="w-14 h-14 object-cover rounded-xl border border-slate-200/80 shrink-0 bg-slate-50"
                />
                <div class="flex flex-col gap-1">
                  <span class="font-bold text-slate-900 text-sm">
                    {{ item.name }}
                  </span>
                  
                  <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                    <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium text-slate-700">
                      {{ formatCutType(item.selectedCut) }}
                    </span>
                    <span>•</span>
                    <span class="font-mono font-medium text-slate-700">
                      Timbang Basah: {{ item.grossWeightKg }} kg
                    </span>
                    <span>•</span>
                    <span class="text-slate-500">
                      @ {{ formatRupiah(item.price || item.pricePerKg) }}/kg
                    </span>
                  </div>

                  <!-- Catch-Weight Net Yield & Soup Bones Badges -->
                  <div class="flex flex-wrap items-center gap-2 pt-0.5">
                    <div class="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                      <span class="material-symbols-outlined text-[12px] text-emerald-600">scale</span>
                      <span>Estimasi Netto: {{ item.netWeightKg || item.grossWeightKg }} kg siap olah</span>
                    </div>

                    <div v-if="item.soupBonesSeparated" class="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                      <span class="material-symbols-outlined text-[12px] text-amber-600">soup_kitchen</span>
                      <span>Kepala & tulang dipisah untuk kaldu sup</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Price Subtotal per Item -->
              <div class="sm:text-right shrink-0 pt-1 sm:pt-0 pl-17 sm:pl-0">
                <span class="text-[10px] text-slate-400 block font-medium">Subtotal Produk</span>
                <span class="font-mono font-extrabold text-sm text-[#103860]">
                  {{ formatRupiah(item.subtotal) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="py-6 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <span class="material-symbols-outlined text-[24px] text-slate-400 block mb-1">inventory_2</span>
            <span>Tidak ada rincian komoditas spesifik untuk pesanan ini.</span>
          </div>
        </div>

        <!-- Kartu 2: Detail Pengiriman Lengkap (Tokopedia Shipping Section) -->
        <div class="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-[#103860]">local_shipping</span>
              <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider">
                Info Pengiriman Rantai Dingin
              </h2>
            </div>
            <span class="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              Resi: RESI-{{ resolvedOrderNumber }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <!-- Kurir & Jadwal Pengantaran -->
            <div class="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Armada & Jadwal:</span>
              <span class="font-bold text-[#103860]">
                Armada Berpendingin LBA (Suhu 0-4°C)
              </span>
              <span class="text-[11px] text-slate-600 font-medium">
                {{ order?.deliverySlotLabel || 'Slot Pagi (06:00 - 08:30 WIB)' }}
              </span>
              <span class="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                Pengantaran subuh untuk menjamin kualitas kesegaran maksimal saat tiba.
              </span>
            </div>

            <!-- Kemasan Insulasi -->
            <div class="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proteksi Insulasi:</span>
              <span class="font-bold text-slate-800">
                {{ order?.packagingType === 'styrofoam_box' ? 'Box Styrofoam Segel' : 'Thermal Bag Insulasi Tebal' }}
              </span>
              <span class="text-[11px] text-slate-600 leading-snug">
                {{ packagingLabel }}
              </span>
            </div>
          </div>

          <!-- Alamat Tujuan Penerima & GPS -->
          <div class="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Tujuan:</span>
              <span v-if="order?.latitude && order?.longitude" class="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                GPS: {{ order.latitude.toFixed(4) }}, {{ order.longitude.toFixed(4) }}
              </span>
            </div>

            <div class="flex flex-col gap-0.5 pl-1">
              <div class="font-bold text-slate-900 flex items-center gap-2">
                <span>{{ order?.recipientName || order?.address?.recipientName || 'Pelanggan LBA' }}</span>
                <span class="text-slate-400 font-normal">|</span>
                <span class="font-mono text-slate-700">{{ order?.recipientPhone || order?.address?.phoneNumber || '-' }}</span>
              </div>
              <p class="text-slate-600 leading-relaxed text-[11px] mt-0.5">
                {{ resolvedFullAddress }}
              </p>
              <div v-if="order?.courierNotes" class="mt-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900">
                <strong>Catatan Pengantaran:</strong> {{ order.courierNotes }}
              </div>
            </div>
          </div>
        </div>

        <!-- Kartu 3: Live Tracking Timeline Rantai Dingin Muncar -->
        <div class="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-[#103860]">timeline</span>
              <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider">
                Riwayat Pelacakan Rantai Dingin
              </h2>
            </div>
          </div>

          <div class="flex flex-col gap-1 pl-1">
            <div
              v-for="(stage, idx) in (order?.trackingStages || [])"
              :key="stage.stageIndex"
              class="flex items-start gap-3.5 relative"
            >
              <!-- Connector Line -->
              <div
                v-if="idx < (order?.trackingStages || []).length - 1"
                class="absolute left-[13px] top-7 bottom-0 w-0.5"
                :class="stage.isCompleted ? 'bg-emerald-600' : 'bg-slate-200'"
              ></div>

              <!-- Indicator Circle -->
              <div
                class="z-10 flex items-center justify-center text-xs font-bold transition-all rounded-full w-7 h-7 shrink-0"
                :class="stage.isCompleted
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : (stage.isActive ? 'bg-[#103860] text-white ring-4 ring-blue-100 animate-pulse' : 'bg-slate-100 text-slate-400')"
              >
                <span v-if="stage.isCompleted" class="material-symbols-outlined text-[15px]">check</span>
                <span v-else>{{ stage.stageIndex }}</span>
              </div>

              <!-- Stage Content -->
              <div class="flex-1 pb-5">
                <div class="flex items-center justify-between text-xs">
                  <span
                    class="font-bold"
                    :class="stage.isActive ? 'text-[#103860]' : (stage.isCompleted ? 'text-slate-800' : 'text-slate-400')"
                  >
                    {{ stage.title }}
                  </span>
                  <span v-if="stage.timestamp" class="text-[10px] text-slate-400 font-mono">
                    {{ stage.timestamp }}
                  </span>
                </div>
                <p
                  class="text-[11px] mt-0.5 leading-relaxed"
                  :class="stage.isActive ? 'text-slate-700 font-medium' : 'text-slate-500'"
                >
                  {{ stage.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- KOLOM SAMPING (KANAN - STICKY): Rincian Pembayaran & Aksi -->
      <div class="flex flex-col gap-4 lg:sticky lg:top-20">
        
        <!-- Kartu Rincian Pembayaran (Tokopedia Payment Breakdown) -->
        <div class="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">payments</span>
              <span>Rincian Pembayaran</span>
            </h2>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded border"
              :class="statusBadgeInfo.class"
            >
              {{ statusBadgeInfo.label }}
            </span>
          </div>

          <!-- Kanal Pembayaran & Waktu Lunas -->
          <div class="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metode Bayar:</span>
              <span class="font-extrabold text-[#103860]">{{ resolvedPaymentMethodTitle }}</span>
            </div>
            <div v-if="order?.paymentVaOrCode" class="flex items-center justify-between font-mono text-[11px]">
              <span class="text-slate-500">Nomor VA:</span>
              <span class="font-bold text-slate-800">{{ order.paymentVaOrCode }}</span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>Waktu Pelunasan:</span>
              <span class="font-medium text-slate-700">{{ formatDate(order?.paidAt || order?.createdAt) }}</span>
            </div>
          </div>

          <!-- Breakdown Finansial 5-Baris -->
          <div class="flex flex-col gap-2 text-xs text-slate-600">
            <div class="flex items-center justify-between">
              <span>Total Harga Komoditas:</span>
              <span class="font-mono font-bold text-slate-800">
                {{ formatRupiah(order?.productsSubtotal || order?.subtotalAmount) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span>Proteksi Rantai Dingin:</span>
                <span class="text-[10px] text-slate-400">Insulasi + Ice Gel Food Grade</span>
              </div>
              <span class="font-mono font-bold text-slate-800">
                {{ formatRupiah(order?.packagingFee) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span>Ongkos Kirim Cold-Chain:</span>
                <span class="text-[10px] text-slate-400">Armada Berpendingin Muncar</span>
              </div>
              <span class="font-mono font-bold text-slate-800">
                {{ formatRupiah(order?.courierFee || order?.shippingFee) }}
              </span>
            </div>

            <div class="flex items-center justify-between text-emerald-700 font-semibold text-[11px]">
              <span>Diskon Rute Lokal Banyuwangi:</span>
              <span class="font-mono">-{{ formatRupiah(order?.courierFee || order?.shippingFee) }}</span>
            </div>

            <!-- Grand Total -->
            <div class="pt-3 border-t border-slate-200 flex items-center justify-between text-slate-900">
              <div class="flex flex-col">
                <span class="text-xs font-extrabold uppercase tracking-wide">Total Pembayaran:</span>
                <span class="text-[10px] text-slate-400 font-normal">Bebas PPN Hasil Laut Segar</span>
              </div>
              <span class="font-mono font-black text-base text-emerald-700">
                {{ formatRupiah(order?.totalAmount || order?.grandTotal) }}
              </span>
            </div>
          </div>

          <!-- Tombol Download Invoice (PDF) Utama -->
          <div class="pt-2 flex flex-col gap-2">
            <a
              :href="`/invoice/${resolvedOrderNumber}?download=1`"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-3 px-4 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">download</span>
              <span>Download Invoice (PDF)</span>
            </a>

            <NuxtLink
              :to="`/invoice/${resolvedOrderNumber}`"
              class="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[16px]">print</span>
              <span>Buka Format Cetak A4</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Kartu Bantuan & Belanja Lagi -->
        <div class="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col gap-2.5">
          <a
            :href="waConciergeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center w-full gap-2 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-2xs"
          >
            <span class="material-symbols-outlined text-[18px]">support_agent</span>
            <span>Bantuan WhatsApp Admin Muncar</span>
          </a>

          <NuxtLink
            to="/katalog"
            class="flex items-center justify-center w-full gap-2 py-2.5 text-xs font-bold text-slate-700 hover:text-[#103860] hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[18px]">storefront</span>
            <span>Belanja Komoditas Lainnya</span>
          </NuxtLink>
        </div>

      </div>

    </div>
  </div>
</template>
