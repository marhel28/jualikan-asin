<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '~/stores/order'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Lacak Pesanan | Laut Berkah Abadi'
})

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = computed(() => String(route.params.orderId || ''))
const order = computed(() => orderStore.currentOrder)
const isRefreshing = ref(false)

let pollTimer: any = null

const refreshStatus = async () => {
  if (!orderId.value) return
  isRefreshing.value = true
  try {
    await orderStore.fetchOrderStatus(orderId.value)
  } finally {
    isRefreshing.value = false
  }
}

onMounted(() => {
  if (orderId.value) {
    refreshStatus()
    // Auto-polling every 10 seconds while page is active
    pollTimer = setInterval(() => {
      if (order.value?.status !== 'DELIVERED') {
        orderStore.fetchOrderStatus(orderId.value)
      } else {
        if (pollTimer) clearInterval(pollTimer)
      }
    }, 10000)
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

const waConciergeUrl = computed(() => {
  return `https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi%2C%20saya%20ingin%20menanyakan%20status%20pesanan%20dengan%20nomor%20${orderId.value}.`
})

const activeStatusLabel = computed(() => {
  if (order.value?.status === 'DELIVERED') return 'Pesanan Telah Tiba'
  if (order.value?.status === 'OUT_FOR_DELIVERY') return 'Kurir Sedang Menuju Lokasi'
  return 'Pesanan Sedang Diproses'
})

const activeStatusIcon = computed(() => {
  if (order.value?.status === 'DELIVERED') return 'task_alt'
  if (order.value?.status === 'OUT_FOR_DELIVERY') return 'local_shipping'
  return 'inventory_2'
})

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0)
}

const formatCutType = (cut?: string) => {
  if (!cut) return 'Utuh Bersih'
  const map: Record<string, string> = {
    utuh_bersih: 'Utuh Bersih',
    fillet_tanpa_kulit: 'Fillet Tanpa Kulit',
    fillet_dengan_kulit: 'Fillet Kulit',
    steak: 'Potong Steak',
    bersih_siang: 'Utuh Bersih Siang',
    frozen_utuh: 'Beku Utuh',
  }
  return map[cut] || cut.replace(/_/g, ' ')
}
</script>

<template>
  <div class="flex flex-col w-full gap-4 py-2">
    <!-- Desktop Breadcrumb -->
    <nav class="items-center hidden gap-2 text-xs md:flex text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <NuxtLink to="/pesanan" class="hover:text-[#103860] transition-colors">Pesanan Saya</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <span class="font-semibold text-[#103860]">#{{ orderId }}</span>
    </nav>

    <!-- Page Header with Mobile Back & Refresh Button -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <div class="flex items-center gap-3">
        <button type="button" @click="goBack"
          class="md:hidden p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-[#103860]" aria-label="Kembali">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div>
          <h1 class="text-base md:text-lg font-bold text-[#103860]">Lacak Pesanan</h1>
          <p class="font-mono text-xs text-slate-500">No. Order: {{ orderId }}</p>
        </div>
      </div>

      <button type="button" @click="refreshStatus" :disabled="isRefreshing"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer disabled:opacity-60">
        <span class="material-symbols-outlined text-[15px] text-[#103860]"
          :class="{ 'animate-spin': isRefreshing }">sync</span>
        <span>{{ isRefreshing ? 'Menyinkronkan...' : 'Segarkan Status' }}</span>
      </button>
    </div>

    <!-- 2-Column Desktop Grid -->
    <div class="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] lg:grid-cols-[1.8fr_1fr] gap-5 items-start">

      <!-- Left Column: Status Banner + 4-Stage Timeline -->
      <div class="flex flex-col gap-4">
        <!-- Active Status Card -->
        <div
          class="flex items-center justify-between p-4 border bg-blue-50/70 border-blue-200/80 rounded-xl shadow-2xs">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#103860] flex items-center justify-center text-white shrink-0">
              <span class="material-symbols-outlined text-[20px]">
                {{ activeStatusIcon }}
              </span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-[#103860]">
                {{ activeStatusLabel }}
              </span>
              <span class="text-[11px] text-slate-600">
                Slot Pengantaran: {{ order?.deliverySlotLabel || 'Pagi Subuh (06:00 - 08:30 WIB)' }}
              </span>
            </div>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full border"
            :class="order?.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'">
            {{ order?.status === 'DELIVERED' ? 'Selesai' : 'Aktif' }}
          </span>
        </div>

        <!-- 4-Stage Clean Timeline Card -->
        <div class="flex flex-col gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>Tahapan Pesanan</span>
            </h2>
          </div>

          <div class="flex flex-col gap-1">
            <div v-for="(stage, idx) in (order?.trackingStages || [])" :key="stage.stageIndex"
              class="flex items-start gap-3.5 relative">
              <!-- Connector Line -->
              <div v-if="idx < (order?.trackingStages || []).length - 1"
                class="absolute left-[13px] top-7 bottom-0 w-0.5"
                :class="stage.isCompleted ? 'bg-emerald-600' : 'bg-slate-200'">
              </div>

              <!-- Indicator Circle -->
              <div
                class="z-10 flex items-center justify-center text-xs font-bold transition-all rounded-full w-7 h-7 shrink-0"
                :class="stage.isCompleted
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : (stage.isActive ? 'bg-[#103860] text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400')">
                <span v-if="stage.isCompleted" class="material-symbols-outlined text-[15px]">check</span>
                <span v-else>{{ stage.stageIndex }}</span>
              </div>

              <!-- Stage Content -->
              <div class="flex-1 pb-5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold"
                    :class="stage.isActive ? 'text-[#103860]' : (stage.isCompleted ? 'text-slate-800' : 'text-slate-400')">
                    {{ stage.title }}
                  </span>
                  <span v-if="stage.timestamp" class="text-[10px] text-slate-400 font-mono">
                    {{ stage.timestamp }}
                  </span>
                </div>
                <p class="text-[11px] mt-0.5 leading-relaxed"
                  :class="stage.isActive ? 'text-slate-700 font-medium' : 'text-slate-500'">
                  {{ stage.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Order Items & Concierge WhatsApp -->
      <div class="flex flex-col gap-4 md:sticky md:top-24">

        <!-- Ordered Items Summary -->
        <div class="p-4 space-y-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div
            class="flex items-center justify-between pb-2 text-xs font-bold tracking-wider uppercase border-b text-slate-900 border-slate-100">
            <span>Rincian Hasil Laut</span>
            <span class="text-[11px] text-slate-500 font-sans normal-case">{{ order?.items?.length || 0 }}
              Komoditas</span>
          </div>

          <div class="text-xs divide-y divide-slate-100">
            <div v-for="(item, idx) in (order?.items || [])" :key="idx"
              class="py-2.5 flex items-center justify-between">
              <div class="min-w-0 pr-2">
                <div class="font-bold text-slate-900">{{ item.name || item.productId }}</div>
                <div class="text-[11px] text-slate-500">
                  Potongan: {{ formatCutType(item.selectedCut) }} • {{ item.grossWeightKg }} kg
                </div>
              </div>
              <div class="font-mono font-bold text-slate-800 shrink-0">
                {{ formatRupiah(item.subtotal || 0) }}
              </div>
            </div>
          </div>

          <div
            class="flex items-center justify-between pt-2 text-xs font-bold border-t border-slate-100 text-slate-900">
            <span>Total Pembayaran</span>
            <span class="font-mono text-sm text-[#103860]">{{ formatRupiah(order?.totalAmount || 0) }}</span>
          </div>
        </div>

        <!-- WhatsApp Support Action -->
        <a :href="waConciergeUrl" target="_blank" rel="noopener noreferrer"
          class="flex items-center justify-center w-full gap-2 py-3 text-xs font-bold text-white transition-colors cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-2xs">
          <span class="material-symbols-outlined text-[18px]">support_agent</span>
          <span>Bantuan Admin Muncar (WhatsApp)</span>
        </a>
      </div>
    </div>
  </div>
</template>
