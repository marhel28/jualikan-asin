<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '~/stores/order'

definePageMeta({
  layout: 'clean'
})

useHead({
  title: 'Pembayaran QRIS Dinamis | Laut Berkah Abadi Banyuwangi'
})

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = computed(() => String(route.params.orderId))

const handleSimulatePayment = () => {
  orderStore.simulatePayment()
  setTimeout(() => {
    router.push(`/pesanan/${orderId.value}`)
  }, 600)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- QRIS Countdown Timer Card -->
    <div class="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-amber-700 animate-spin">timelapse</span>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-amber-900">Batas Waktu Pembayaran</span>
          <span class="text-[11px] text-amber-700">Selesaikan transaksi sebelum kode kedaluwarsa</span>
        </div>
      </div>
      <div class="text-base font-extrabold text-amber-900 font-mono">
        {{ orderStore.formattedRemainingTime }}
      </div>
    </div>

    <!-- QRIS QR Code Card -->
    <div class="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs flex flex-col items-center gap-4 text-center">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-[#103860]">QRIS Standar Bank Indonesia</span>
        <span class="text-[11px] font-semibold text-[#059669]">
          Dinamis
        </span>
      </div>

      <!-- QR Code Image -->
      <div class="p-3 border border-slate-200 rounded-xl bg-white shadow-xs">
        <img 
          :src="orderStore.currentOrder?.qrisImageUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=LAUT_BERKAH_ABADI'" 
          alt="Kode QRIS Dinamis Laut Berkah Abadi" 
          class="w-52 h-52 object-contain rounded-lg"
        />
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs text-slate-500">Total Nominal Pembayaran:</span>
        <span class="text-xl font-extrabold text-[#103860]">
          Rp {{ (orderStore.currentOrder?.totalAmount || 285500).toLocaleString('id-ID') }}
        </span>
        <span class="text-[11px] text-slate-400 mt-1">ID Pesanan: #{{ orderId }}</span>
      </div>

      <!-- Payment Simulator Button -->
      <button 
        type="button"
        @click="handleSimulatePayment"
        :disabled="orderStore.isLoading"
        class="w-full py-3 rounded-xl bg-[#059669] text-white text-xs font-bold hover:bg-[#047857] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <span class="material-symbols-outlined text-[18px]">verified</span>
        <span>{{ orderStore.isLoading ? 'Memverifikasi Pembayaran...' : 'Cek Status Pembayaran Otomatis' }}</span>
      </button>

      <!-- Alternative Payment Rails Notice -->
      <p class="text-[11px] text-slate-400">
        Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, BNI & seluruh mobile banking.
      </p>
    </div>
  </div>
</template>

