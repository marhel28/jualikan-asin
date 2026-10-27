<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOrderStore } from '~/stores/order'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const authStore = useAuthStore()

const isExpanded = ref(true)
const selectedOrderIndex = ref(0)
const localTimers = ref<Record<string, number>>({})
let timerInterval: any = null

const activeOrders = computed(() => orderStore.unpaidOrders || [])
const currentOrder = computed(() => {
  if (activeOrders.value.length === 0) return null
  const idx = Math.min(selectedOrderIndex.value, activeOrders.value.length - 1)
  return activeOrders.value[idx] || activeOrders.value[0]
})

// Hide drawer when already on the exact payment page of this order
const isOnCurrentPaymentPage = computed(() => {
  if (!currentOrder.value) return false
  return route.path === `/pembayaran/${currentOrder.value.order_number}` || route.path === `/pembayaran/${currentOrder.value.id}`
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

const getRemainingSeconds = (order: any): number => {
  const orderNum = order.order_number || order.id
  if (localTimers.value[orderNum] !== undefined) {
    return localTimers.value[orderNum]
  }
  return order.expires_in_seconds !== undefined ? order.expires_in_seconds : 1200
}

const formatMinutesSeconds = (seconds: number): string => {
  const m = Math.floor(Math.max(0, seconds) / 60)
  const s = Math.max(0, seconds) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const getPaymentMethodLabel = (order: any): string => {
  const bank = (order.payment_bank || '').toUpperCase()
  if (bank) {
    if (bank === 'MANDIRI') return 'Mandiri Bill Payment'
    return `${bank} Virtual Account`
  }
  if (order.payment_method === 'qris_dynamic') return 'QRIS Dinamis'
  return 'Transfer Bank'
}

const getCutLabel = (cutType: string) => {
  const map: Record<string, string> = {
    utuh_bersih: 'Utuh Bersih',
    fillet_tanpa_kulit: 'Fillet Tanpa Kulit',
    fillet_dengan_kulit: 'Fillet Kulit',
    steak_potong: 'Steak Potong',
    potong_sup: 'Potong Sup',
    giling_halus: 'Giling Halus'
  }
  return map[cutType] || cutType || 'Utuh Bersih'
}

// Timer loop
const startTimerLoop = () => {
  if (timerInterval) clearInterval(timerInterval)

  // Initialize timers
  for (const ord of activeOrders.value) {
    const num = ord.order_number || ord.id
    if (localTimers.value[num] === undefined) {
      localTimers.value[num] = ord.expires_in_seconds !== undefined ? ord.expires_in_seconds : 1200
    }
  }

  timerInterval = setInterval(() => {
    let hasExpired = false
    for (const num of Object.keys(localTimers.value)) {
      if (localTimers.value[num] > 0) {
        localTimers.value[num]--
      } else if (localTimers.value[num] === 0) {
        hasExpired = true
        delete localTimers.value[num]
      }
    }
    if (hasExpired && authStore.isAuthenticated) {
      orderStore.fetchUnpaidOrders()
    }
  }, 1000)
}

watch(
  () => activeOrders.value,
  (newVal) => {
    for (const ord of newVal) {
      const num = ord.order_number || ord.id
      localTimers.value[num] = ord.expires_in_seconds !== undefined ? ord.expires_in_seconds : 1200
    }
    if (selectedOrderIndex.value >= newVal.length) {
      selectedOrderIndex.value = Math.max(0, newVal.length - 1)
    }
  },
  { immediate: true, deep: true }
)

const goToPayment = (order: any) => {
  const orderNum = order.order_number || order.id
  router.push(`/pembayaran/${orderNum}`)
}

onMounted(() => {
  startTimerLoop()
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div
    v-if="activeOrders.length > 0 && !isOnCurrentPaymentPage"
    class="fixed z-50 hidden font-sans transition-all duration-300 md:block bottom-6 right-6"
  >
    <!-- MINIMIZED PILL MODE -->
    <div
      v-if="!isExpanded"
      @click="isExpanded = true"
      class="flex items-center gap-3 px-4 py-3 bg-[#103860] hover:bg-[#13446E] text-white rounded-2xl shadow-xl cursor-pointer border border-blue-400/30 transition-transform hover:scale-102 select-none group"
    >
      <div class="relative flex items-center justify-center">
        <span class="material-symbols-outlined text-amber-400 text-[22px] group-hover:rotate-12 transition-transform">schedule</span>
        <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
        <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
      </div>

      <div class="text-left">
        <div class="text-xs font-bold flex items-center gap-1.5 text-white">
          <span>{{ activeOrders.length }} Pesanan Belum Dibayar</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
            Sisa {{ formatMinutesSeconds(getRemainingSeconds(currentOrder)) }}
          </span>
        </div>
        <div class="text-[11px] text-blue-200">
          Klik untuk buka rincian & selesaikan
        </div>
      </div>

      <span class="material-symbols-outlined text-[18px] text-blue-200 group-hover:translate-y-[-2px] transition-transform ml-1">
        expand_less
      </span>
    </div>

    <!-- EXPANDED CARD MODE -->
    <div
      v-else
      class="w-[370px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <!-- Header -->
      <div class="bg-[#103860] text-white px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex items-center justify-center w-8 h-8 border rounded-lg bg-amber-400/20 border-amber-400/40 text-amber-300">
            <span class="material-symbols-outlined text-[18px]">credit_card_clock</span>
          </div>
          <div>
            <div class="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Menunggu Pembayaran</span>
              <span v-if="activeOrders.length > 1" class="px-1.5 py-0.2 bg-white/20 text-[10px] rounded font-mono">
                {{ selectedOrderIndex + 1 }}/{{ activeOrders.length }}
              </span>
            </div>
            <div class="text-[11px] text-blue-200 font-mono">
              Batas waktu 20 menit
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <!-- Multi-order Switcher -->
          <div v-if="activeOrders.length > 1" class="flex items-center gap-0.5 mr-1">
            <button
              type="button"
              @click.stop="selectedOrderIndex = (selectedOrderIndex - 1 + activeOrders.length) % activeOrders.length"
              class="flex items-center justify-center w-6 h-6 text-xs text-white rounded cursor-pointer bg-white/10 hover:bg-white/20"
              title="Pesanan Sebelumnya"
            >
              <span class="material-symbols-outlined text-[14px]">chevron_left</span>
            </button>
            <button
              type="button"
              @click.stop="selectedOrderIndex = (selectedOrderIndex + 1) % activeOrders.length"
              class="flex items-center justify-center w-6 h-6 text-xs text-white rounded cursor-pointer bg-white/10 hover:bg-white/20"
              title="Pesanan Berikutnya"
            >
              <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>

          <!-- Minimize button -->
          <button
            type="button"
            @click="isExpanded = false"
            class="flex items-center justify-center text-blue-200 transition rounded-lg cursor-pointer w-7 h-7 hover:bg-white/10 hover:text-white"
            title="Kecilkan Popup"
          >
            <span class="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </button>
        </div>
      </div>

      <!-- Live Countdown Alert Strip -->
      <div class="flex items-center justify-between px-4 py-2 text-xs border-b bg-amber-50 border-amber-100">
        <div class="flex items-center gap-1.5 text-amber-900 font-medium">
          <span class="material-symbols-outlined text-amber-600 text-[16px] animate-pulse">timer</span>
          <span>Sisa waktu pembayaran:</span>
        </div>
        <div class="font-mono font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded text-[11px]">
          {{ formatMinutesSeconds(getRemainingSeconds(currentOrder)) }}
        </div>
      </div>

      <!-- Order Details Body -->
      <div v-if="currentOrder" class="p-4 space-y-3 max-h-[360px] overflow-y-auto">
        <!-- Order Meta -->
        <div class="flex items-center justify-between text-xs">
          <span class="font-mono text-slate-500 font-semibold text-[11px]">
            #{{ currentOrder.order_number || currentOrder.id }}
          </span>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#103860] border border-blue-200">
            {{ getPaymentMethodLabel(currentOrder) }}
          </span>
        </div>

        <!-- Items Preview List -->
        <div class="space-y-2">
          <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Rincian Ikan Segar
          </div>

          <div
            v-for="(item, idx) in (currentOrder.items || []).slice(0, 3)"
            :key="idx"
            class="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100"
          >
            <img
              :src="item.image_url || 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp'"
              :alt="item.product_name"
              class="object-cover bg-white border rounded-lg w-11 h-11 border-slate-200 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold truncate text-slate-900">
                {{ item.product_name }}
              </div>
              <div class="text-[11px] text-slate-500 truncate">
                {{ item.gross_weight }} kg • {{ getCutLabel(item.cut_type) }}
              </div>
            </div>
            <div class="font-mono text-xs font-semibold text-slate-800 shrink-0">
              {{ formatCurrency(item.subtotal) }}
            </div>
          </div>

          <div
            v-if="(currentOrder.items || []).length > 3"
            class="text-[11px] text-slate-400 text-center italic"
          >
            + {{ (currentOrder.items || []).length - 3 }} produk lainnya
          </div>
        </div>

        <!-- Total Bill -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div class="text-[11px] text-slate-500">Total Tagihan</div>
            <div class="text-sm font-bold text-[#103860] font-mono">
              {{ formatCurrency(currentOrder.grand_total || currentOrder.total_amount) }}
            </div>
          </div>
          <div class="text-right text-[10px] text-slate-500">
            Pengiriman: {{ currentOrder.delivery_slot || 'Subuh 06:00 - 08:30 WIB' }}
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex items-center gap-2 p-3 border-t bg-slate-50 border-slate-100">
        <button
          type="button"
          @click="goToPayment(currentOrder)"
          class="flex-1 py-2.5 px-4 bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span class="material-symbols-outlined text-[16px]">payments</span>
          <span>Lanjutkan Pembayaran</span>
          <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
</template>

