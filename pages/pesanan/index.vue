<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore, type Order } from '~/stores/order'
import { useAuthStore } from '~/stores/auth'

useHead({
  title: 'Pesanan Saya | Laut Berkah Abadi',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()

const activeTab = ref<'aktif' | 'riwayat'>('aktif')
const isLoadingOrders = ref(false)
const quickOrderId = ref('')
const quickOrderError = ref('')

const fetchOrders = async () => {
  if (!authStore.isAuthenticated) return
  isLoadingOrders.value = true
  try {
    await Promise.all([
      orderStore.fetchMyOrders(),
      orderStore.fetchUnpaidOrders()
    ])
    if (activeOrders.value.length > 0 && activeOrders.value[0]?.id) {
      await orderStore.fetchOrderStatus(activeOrders.value[0].id)
    }
  } catch (err) {
    console.error('Failed to fetch orders:', err)
  } finally {
    isLoadingOrders.value = false
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

onMounted(async () => {
  if (typeof window !== 'undefined') {
    if (!authStore.isAuthenticated) {
      const token = localStorage.getItem('lba_auth_token')
      if (token) {
        await authStore.initAuth()
      }
    }

    if (!authStore.isAuthenticated) {
      router.replace('/auth?redirect=/pesanan')
      return
    }

    await fetchOrders()
  }
})

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const historyOrders = computed(() =>
  orderStore.ordersHistory.filter(o => o.status === 'DELIVERED' || o.status === 'EXPIRED' || o.status === 'CANCELLED')
)

const activeOrders = computed(() =>
  orderStore.ordersHistory.filter(o => o.status !== 'DELIVERED' && o.status !== 'EXPIRED' && o.status !== 'CANCELLED')
)

const getStatusLabel = (ord: Order) => {
  switch (ord.status) {
    case 'PENDING_PAYMENT':
      return 'Menunggu Pembayaran'
    case 'CONFIRMED':
    case 'COLD_ROOM_INTAKE':
    case 'BUTCHERING_PREP':
      return 'Sedang Disiapkan'
    case 'COLD_PACKED':
      return 'Siap Dikirim'
    case 'OUT_FOR_DELIVERY':
      return 'Dalam Pengantaran'
    case 'DELIVERED':
      return 'Selesai Diterima'
    case 'CANCELLED':
      return 'Dibatalkan'
    case 'EXPIRED':
      return 'Kedaluwarsa'
    default:
      return 'Diproses'
  }
}

const getStepIndex = (ord: Order) => {
  switch (ord.status) {
    case 'PENDING_PAYMENT':
      return 1
    case 'CONFIRMED':
    case 'COLD_ROOM_INTAKE':
    case 'BUTCHERING_PREP':
    case 'COLD_PACKED':
      return 2
    case 'OUT_FOR_DELIVERY':
      return 3
    case 'DELIVERED':
      return 4
    case 'CANCELLED':
    case 'EXPIRED':
      return 0
    default:
      return 2
  }
}

const getHistoryStatusBadge = (ord: Order) => {
  switch (ord.status) {
    case 'DELIVERED':
      return { label: 'Telah Diterima', class: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' }
    case 'CANCELLED':
      return { label: 'Dibatalkan', class: 'bg-rose-50 text-rose-700 border-rose-200/60' }
    case 'EXPIRED':
      return { label: 'Kedaluwarsa', class: 'bg-slate-100 text-slate-600 border-slate-200/60' }
    default:
      return { label: ord.status, class: 'bg-slate-50 text-slate-600 border-slate-200/60' }
  }
}

const getWaConciergeUrl = (ordId: string) => {
  return `https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi%2C%20saya%20ingin%20menanyakan%20status%20pesanan%20ID%20${ordId}.`
}

const formatCutType = (cut?: string) => {
  if (!cut) return 'Utuh Bersih'
  const map: Record<string, string> = {
    utuh_bersih: 'Utuh Bersih',
    fillet_tanpa_kulit: 'Fillet Tanpa Kulit',
    fillet_dengan_kulit: 'Fillet Kulit',
    steak: 'Potong Steak',
    steak_melintang: 'Potong Steak',
    bersih_siang: 'Utuh Bersih Siang',
    frozen_utuh: 'Beku Utuh',
  }
  return map[cut] || cut.replace(/_/g, ' ')
}

const handleQuickTrack = () => {
  quickOrderError.value = ''
  const cleanId = quickOrderId.value.trim().toUpperCase()
  if (!cleanId) {
    quickOrderError.value = 'Silakan masukkan nomor pesanan (contoh: LBA-20261022-5D35).'
    return
  }
  router.push(`/pesanan/${cleanId}`)
}
</script>

<template>
  <div class="flex flex-col w-full gap-4 py-1">
    <!-- Desktop Breadcrumb -->
    <nav class="items-center hidden gap-2 text-xs md:flex text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <span class="font-semibold text-[#103860]">Pesanan Saya</span>
    </nav>

    <!-- Page Title & Tab Navigation -->
    <div class="flex flex-col gap-3 pb-3 border-b sm:flex-row sm:items-center sm:justify-between border-slate-200/80">
      <div class="flex items-center gap-3">
        <button type="button" @click="goBack"
          class="md:hidden p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-[#103860]" aria-label="Kembali">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div>
          <h1 class="text-base md:text-lg font-bold text-[#103860]">Pesanan Saya</h1>
          <p class="text-xs text-slate-500">Pantau status penyiapan cold-chain dan riwayat pesanan hasil laut</p>
        </div>
      </div>

      <!-- Tab Buttons (Only shown when authenticated) -->
      <div v-if="authStore.isAuthenticated" class="flex items-center gap-6 text-xs md:text-sm">
        <button type="button" @click="activeTab = 'aktif'"
          class="font-bold pb-2 -mb-3 transition-colors relative cursor-pointer flex items-center gap-1.5"
          :class="activeTab === 'aktif' ? 'text-[#103860]' : 'text-slate-400 hover:text-slate-600 font-normal'">
          <span>Pesanan Aktif</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-[#059669] font-bold">
            {{ activeOrders.length }}
          </span>
          <span v-if="activeTab === 'aktif'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103860] rounded-full"></span>
        </button>

        <button type="button" @click="activeTab = 'riwayat'"
          class="relative pb-2 -mb-3 transition-colors cursor-pointer flex items-center gap-1.5"
          :class="activeTab === 'riwayat' ? 'text-[#103860] font-bold' : 'text-slate-400 hover:text-slate-600 font-normal'">
          <span>Riwayat Selesai</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">
            {{ historyOrders.length }}
          </span>
          <span v-if="activeTab === 'riwayat'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103860] rounded-full"></span>
        </button>
      </div>
    </div>

    <!-- 1. REDIRECTING SKELETON (When unauthenticated) -->
    <div v-if="!authStore.isAuthenticated" class="py-12 flex flex-col items-center justify-center gap-3 text-center">
      <div class="w-10 h-10 border-3 border-[#103860]/20 border-t-[#103860] rounded-full animate-spin"></div>
      <p class="text-xs text-slate-500 font-medium">Memeriksa sesi akun pelanggan...</p>
    </div>

    <!-- 2. AUTHENTICATED STATE -->
    <div v-else class="flex flex-col gap-4">

      <!-- Backend Error Alert -->
      <div v-if="orderStore.error" class="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-3 text-xs text-rose-800">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-rose-600">error</span>
          <span>Gagal memuat pesanan: {{ orderStore.error }}</span>
        </div>
        <button
          type="button"
          @click="fetchOrders"
          class="font-bold underline hover:text-rose-950 shrink-0 cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoadingOrders" class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div v-for="i in 2" :key="i"
          class="flex flex-col gap-3 p-5 bg-white border shadow-xs rounded-xl border-slate-200/80 animate-pulse">
          <div class="w-1/3 h-4 rounded bg-slate-200"></div>
          <div class="w-1/2 h-3 rounded bg-slate-100"></div>
          <div class="h-20 rounded bg-slate-100"></div>
        </div>
      </div>

      <!-- Active Orders Tab View -->
      <div v-else-if="activeTab === 'aktif'" class="flex flex-col gap-5">
        <!-- Unpaid Orders Alert Banner -->
        <div
          v-if="orderStore.unpaidOrders && orderStore.unpaidOrders.length > 0"
          class="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span class="material-symbols-outlined text-[24px] animate-pulse">credit_card_clock</span>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{{ orderStore.unpaidOrders.length }} Pesanan Menunggu Pembayaran</span>
                <span class="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-[10px] font-bold">Batas 20 Menit</span>
              </h3>
              <p class="text-xs text-slate-600 mt-0.5">
                Selesaikan pembayaran agar stok ikan segar Anda tidak dibatalkan otomatis oleh sistem.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <NuxtLink
              :to="`/pembayaran/${orderStore.unpaidOrders[0].order_number || orderStore.unpaidOrders[0].id}`"
              class="w-full sm:w-auto px-4 py-2.5 bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <span class="material-symbols-outlined text-[16px]">payments</span>
              <span>Bayar Sekarang ({{ formatCurrency(orderStore.unpaidOrders[0].grand_total) }})</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </NuxtLink>
          </div>
        </div>

        <div v-if="activeOrders.length > 0" class="flex flex-col gap-6">
          <div
            v-for="ord in activeOrders"
            :key="ord.id"
            class="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] lg:grid-cols-[1.8fr_1fr] gap-4 md:gap-6 items-start"
          >
            <!-- Left Column: Cold Chain Stages, ETA & Products List -->
            <div class="flex flex-col gap-4 p-4 bg-white border shadow-xs rounded-xl sm:p-5 border-slate-200/80">
              <!-- Order Header -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex flex-col">
                  <span class="font-mono text-sm md:text-base font-bold text-[#103860]">#{{ ord.id }}</span>
                  <span
                    class="text-[11px] font-medium"
                    :class="(ord.status === 'PENDING_PAYMENT' || ord.paymentStatus === 'PENDING') ? 'text-amber-600 font-semibold' : 'text-slate-400'"
                  >
                    {{ (ord.status === 'PENDING_PAYMENT' || ord.paymentStatus === 'PENDING') ? 'Menunggu Pembayaran' : ('Pembayaran Lunas via ' + (ord.paymentBank ? ord.paymentBank.toUpperCase() + ' VA' : 'QRIS')) }}
                  </span>
                </div>

                <div class="text-right">
                  <span class="text-xs md:text-sm font-bold text-[#059669] block">
                    {{ getStatusLabel(ord) }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium">Tahap {{ getStepIndex(ord) }} dari 4</span>
                </div>
              </div>

              <!-- Sleek Progress Indicator -->
              <div class="flex flex-col gap-1.5 py-0.5">
                <div class="w-full h-2 overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full bg-[#059669] rounded-full transition-all duration-500"
                    :style="{ width: ((getStepIndex(ord)) / 4) * 100 + '%' }"></div>
                </div>
                <div class="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span :class="getStepIndex(ord) >= 1 ? 'text-[#059669] font-semibold' : ''">Dipesan</span>
                  <span :class="getStepIndex(ord) >= 2 ? 'text-[#059669] font-semibold' : ''">Disiapkan</span>
                  <span :class="getStepIndex(ord) >= 3 ? 'text-[#059669] font-semibold' : ''">Dikirim</span>
                  <span :class="getStepIndex(ord) >= 4 ? 'text-[#059669] font-semibold' : ''">Selesai</span>
                </div>
              </div>

              <!-- Delivery ETA Row -->
              <div
                class="flex flex-wrap items-center gap-2 py-2.5 px-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
                <span class="material-symbols-outlined text-[18px] text-[#103860]">schedule</span>
                <span class="font-bold text-slate-800">
                  Slot: {{ ord.deliverySlotLabel || ord.deliverySlot || 'Pagi Subuh (06:00 - 08:30 WIB)' }}
                </span>
                <span class="hidden text-slate-300 sm:inline">•</span>
                <span class="text-slate-600">Pengantaran Terjadwal Rantai Dingin</span>
              </div>

              <!-- Ordered Products List -->
              <div class="flex flex-col gap-3 py-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-[#103860] uppercase tracking-wider">Daftar Komoditas Segar</span>
                  <span class="text-[11px] text-slate-500">{{ (ord.items || []).length }} item</span>
                </div>

                <div class="overflow-hidden border divide-y divide-slate-100 border-slate-100 rounded-xl">
                  <div v-for="item in (ord.items || [])" :key="item.id"
                    class="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-slate-50/50">
                    <div class="flex items-center min-w-0 gap-3">
                      <NuxtImg :src="item.imageUrl || 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp'" :alt="item.name"
                        class="flex-shrink-0 object-cover w-12 h-12 border rounded-lg bg-slate-100 border-slate-200/60"
                        width="48" height="48" format="webp" loading="lazy" />
                      <div class="flex flex-col min-w-0">
                        <span class="text-xs font-bold truncate text-slate-800">{{ item.name }}</span>
                        <span class="text-[11px] text-slate-500 truncate">
                          {{ item.grossWeightKg || item.quantityKg || 1 }} kg • {{ formatCutType(item.cutType || item.cutLabel) }}
                          <span v-if="item.separateSoupBones"> • Termasuk Kepala & Tulang</span>
                        </span>
                      </div>
                    </div>
                    <span class="text-xs font-bold text-[#103860] font-mono whitespace-nowrap shrink-0">
                      Rp {{ ((item.itemSubtotal ?? item.subtotal) || 0).toLocaleString('id-ID') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Shipping Destination & Bill Summary -->
            <div class="flex flex-col gap-4 md:sticky md:top-24">
              <!-- Delivery Address & Packaging Card -->
              <div class="flex flex-col gap-3 p-4 bg-white border shadow-xs rounded-xl sm:p-5 border-slate-200/80">
                <h2
                  class="text-xs font-bold text-[#103860] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <span class="material-symbols-outlined text-[16px]">local_shipping</span>
                  <span>Tujuan Pengantaran</span>
                </h2>

                <div class="flex flex-col gap-2 text-xs text-slate-600">
                  <div class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-[16px] text-[#103860] mt-0.5 shrink-0">location_on</span>
                    <div class="flex-1 leading-relaxed">
                      <div class="font-bold text-slate-800">{{ ord.address?.recipientName || 'Pelanggan LBA' }}</div>
                      <div class="text-[11px] text-slate-500">{{ ord.address?.phone || ord.address?.phoneNumber || '' }}</div>
                      <div class="mt-1 text-slate-700">{{ ord.address?.street || ord.address?.streetAddress || 'Banyuwangi Kota' }}</div>
                    </div>
                  </div>

                  <div class="pt-2 mt-1 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span class="material-symbols-outlined text-[16px] text-blue-600">ac_unit</span>
                    <span>Kemasan: <strong>{{ ord.packagingType === 'thermal_bag' ? 'Thermal Bag Food-Grade' : 'Box Styrofoam Cold Chain' }}</strong></span>
                  </div>

                  <div v-if="ord.kitchenNotes"
                    class="mt-1 pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-600">
                    <span class="material-symbols-outlined text-[15px] text-amber-600 shrink-0">edit_note</span>
                    <span><strong>Catatan:</strong> {{ ord.kitchenNotes }}</span>
                  </div>
                </div>
              </div>

              <!-- Total Bill & Actions Card -->
              <div class="flex flex-col gap-3 p-4 bg-white border shadow-xs rounded-xl sm:p-5 border-slate-200/80">
                <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider pb-2 border-b border-slate-100">
                  Rincian Pembayaran
                </h2>

                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500">Status Pembayaran:</span>
                  <span
                    class="font-bold"
                    :class="(ord.status === 'PENDING_PAYMENT' || ord.paymentStatus === 'PENDING') ? 'text-amber-600' : 'text-[#059669]'"
                  >
                    {{ (ord.status === 'PENDING_PAYMENT' || ord.paymentStatus === 'PENDING') ? 'Menunggu Pembayaran' : ('Lunas (' + (ord.paymentBank ? ord.paymentBank.toUpperCase() : 'QRIS') + ')') }}
                  </span>
                </div>

                <div class="flex items-baseline justify-between border-t border-slate-100 pt-2.5">
                  <span class="text-xs text-slate-500">Total Pembayaran:</span>
                  <span class="text-lg font-extrabold text-[#103860]">
                    Rp {{ (ord.totalAmount || 0).toLocaleString('id-ID') }}
                  </span>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row md:flex-col gap-2.5 pt-2">
                  <!-- Bayar Sekarang Button if Unpaid -->
                  <NuxtLink
                    v-if="ord.status === 'PENDING_PAYMENT' || ord.paymentStatus === 'PENDING'"
                    :to="`/pembayaran/${ord.orderNumber || ord.id}`"
                    class="w-full py-2.5 px-3 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs text-center cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-[16px]">payments</span>
                    <span>Bayar Sekarang</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </NuxtLink>

                  <NuxtLink :to="`/pesanan/${ord.orderNumber || ord.id}`"
                    class="w-full py-2.5 px-3 rounded-xl border border-[#103860]/20 bg-blue-50/50 hover:bg-blue-50 text-xs font-bold text-[#103860] flex items-center justify-center gap-1.5 transition-colors text-center">
                    <span class="material-symbols-outlined text-[16px]">local_shipping</span>
                    <span>Lacak Pesanan Live</span>
                  </NuxtLink>

                  <a :href="getWaConciergeUrl(ord.id)" target="_blank" rel="noopener noreferrer"
                    class="w-full py-2.5 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer text-center">
                    <span class="material-symbols-outlined text-[16px]">support_agent</span>
                    <span>Bantuan WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State Active -->
        <div v-else class="flex flex-col items-center gap-3 py-16 text-center bg-white border border-slate-200/80 rounded-2xl p-6">
          <div class="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200/60">
            <span class="material-symbols-outlined text-[32px]">receipt_long</span>
          </div>
          <span class="text-sm font-bold text-slate-800">Belum Ada Pesanan Aktif</span>
          <span class="text-xs text-slate-500 max-w-sm">
            Pesanan hasil laut segar yang sedang disiapkan atau dikirim kurir akan muncul secara otomatis di sini.
          </span>
          <NuxtLink to="/katalog"
            class="mt-2 px-5 py-2.5 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">storefront</span>
            <span>Mulai Belanja Ikan Segar</span>
          </NuxtLink>
        </div>
      </div>

      <!-- History Tab View -->
      <div v-else>
        <div v-if="historyOrders.length > 0" class="flex flex-col gap-4">
          <div v-for="hOrder in historyOrders" :key="hOrder.id"
            class="flex flex-col gap-3 p-4 bg-white border shadow-xs rounded-xl sm:p-5 border-slate-200/80">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex flex-col">
                <span class="font-mono text-sm font-bold text-[#103860]">#{{ hOrder.id }}</span>
                <span class="text-[11px] text-slate-400">{{ hOrder.deliverySlotLabel || hOrder.deliverySlot }}</span>
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                :class="getHistoryStatusBadge(hOrder).class">
                {{ getHistoryStatusBadge(hOrder).label }}
              </span>
            </div>

            <!-- Items preview -->
            <div class="flex flex-col text-xs divide-y divide-slate-100">
              <div v-for="(hItem, hIdx) in (hOrder.items || [])" :key="hIdx"
                class="py-2 flex items-center justify-between text-slate-700">
                <div class="flex items-center gap-2.5 min-w-0">
                  <NuxtImg :src="hItem.imageUrl || 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp'" :alt="hItem.name"
                    class="w-9 h-9 object-cover rounded-lg border border-slate-200/60 bg-slate-50 flex-shrink-0"
                    width="36" height="36" format="webp" loading="lazy" />
                  <div class="flex flex-col min-w-0">
                    <span class="font-bold text-slate-800 truncate">{{ hItem.name }}</span>
                    <span class="text-[11px] text-slate-500">
                      {{ hItem.grossWeightKg || hItem.quantityKg || 1 }} kg • {{ formatCutType(hItem.cutType || hItem.cutLabel) }}
                    </span>
                  </div>
                </div>
                <span class="font-bold text-slate-900 font-mono shrink-0">
                  Rp {{ ((hItem.itemSubtotal ?? hItem.subtotal) || 0).toLocaleString('id-ID') }}
                </span>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between pt-3 text-xs border-t border-slate-100 gap-2">
              <div class="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <span class="material-symbols-outlined text-[16px] text-blue-600">ac_unit</span>
                <span>Kemasan: {{ hOrder.packagingType === 'thermal_bag' ? 'Thermal Bag Food-Grade' : 'Box Styrofoam Cold Chain' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs text-slate-500">Total:</span>
                <span class="font-bold text-slate-900 font-mono text-sm">
                  Rp {{ (hOrder.totalAmount || 0).toLocaleString('id-ID') }}
                </span>
                <NuxtLink :to="`/pesanan/${hOrder.orderNumber || hOrder.id}`"
                  class="ml-2 px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#103860] font-bold text-xs transition-colors">
                  Detail & Lacak
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State History -->
        <div v-else class="flex flex-col items-center gap-3 py-16 text-center bg-white border border-slate-200/80 rounded-2xl p-6">
          <div class="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200/60">
            <span class="material-symbols-outlined text-[32px]">history</span>
          </div>
          <span class="text-sm font-bold text-slate-800">Belum Ada Riwayat Pesanan</span>
          <span class="text-xs text-slate-500 max-w-sm">
            Pesanan yang telah selesai diserahkan ke alamat Anda akan tersimpan di sini sebagai riwayat.
          </span>
          <NuxtLink to="/katalog"
            class="mt-2 px-5 py-2.5 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px]">storefront</span>
            <span>Mulai Belanja</span>
          </NuxtLink>
        </div>
      </div>

    </div>

  </div>
</template>
