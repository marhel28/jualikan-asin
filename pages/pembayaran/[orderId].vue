<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '~/stores/order'

definePageMeta({
  layout: 'clean'
})

useHead({
  title: 'Pembayaran Pesanan | Laut Berkah Abadi Banyuwangi'
})

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = computed(() => String(route.params.orderId || ''))
const orderNumber = ref<string>('')
const snapToken = ref<string>('')
const totalAmount = ref<number>(0)
const deliverySlot = ref<string>('')
const recipientName = ref<string>('')
const addressStreet = ref<string>('')

const isSnapLoading = ref(true)
const isCheckingStatus = ref(false)
const errorMessage = ref<string | null>(null)
let pollTimer: any = null

const ensureSnapScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve()
    if ((window as any).snap) return resolve()

    const existingScript = document.getElementById('midtrans-snap-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      setTimeout(() => resolve(), 2000)
      return
    }

    const script = document.createElement('script')
    script.id = 'midtrans-snap-script'
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', 'Mid-client-vE8vECZNYD2RyXbI')
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap JS script')
      resolve()
    }
    document.head.appendChild(script)
  })
}

const loadOrderData = async () => {
  try {
    const api = useApi()
    const target = orderId.value
    // Cek detail pesanan dari backend
    const res = await api.get<any>(`/orders/track/${target}`).catch(async () => {
      return await api.get<any>(`/orders/${target}`).catch(() => null)
    })

    if (res) {
      orderNumber.value = res.order_number || res.orderNumber || target
      totalAmount.value = Number(res.grand_total || res.total_amount || res.totalAmount || 0)
      deliverySlot.value = res.delivery_slot || res.deliverySlot || 'Slot Pagi (06:00 - 08:30 WIB)'
      recipientName.value = res.recipient_name || (res.shipping_address?.recipientName) || 'Pelanggan'
      addressStreet.value = res.address_detail || (res.shipping_address?.street) || 'Banyuwangi'

      if (res.payment_status === 'PAID' || res.cold_chain_status === 'COLD_ROOM_INTAKE') {
        router.replace(`/orders/success?order_number=${orderNumber.value}&order_id=${res.id || target}`)
        return
      }

      if (res.snap_token || res.snapToken) {
        snapToken.value = res.snap_token || res.snapToken
      }
    } else if (orderStore.currentOrder) {
      const co = orderStore.currentOrder
      orderNumber.value = co.id
      totalAmount.value = co.totalAmount
      deliverySlot.value = co.deliverySlotLabel || 'Slot Pagi (06:00 - 08:30 WIB)'
      recipientName.value = co.address?.recipientName || 'Pelanggan'
      addressStreet.value = co.address?.street || 'Banyuwangi'
      if (co.snapToken) {
        snapToken.value = co.snapToken
      }
    }
  } catch (err: any) {
    console.error('Error loading order data:', err)
  }
}

const embedSnap = () => {
  if (typeof window === 'undefined') return
  if (!snapToken.value) {
    isSnapLoading.value = false
    return
  }

  const snap = (window as any).snap
  if (snap && typeof snap.embed === 'function') {
    isSnapLoading.value = false
    try {
      snap.embed(snapToken.value, {
        embedId: 'snap-container',
        onSuccess: function (result: any) {
          console.log('Payment success callback from Midtrans Snap:', result)
          router.replace(`/orders/success?order_number=${orderNumber.value || orderId.value}&order_id=${orderId.value}`)
        },
        onPending: function (result: any) {
          console.log('Payment pending callback from Midtrans Snap:', result)
        },
        onError: function (result: any) {
          console.error('Payment error callback from Midtrans Snap:', result)
          errorMessage.value = 'Pembayaran mengalami kendala. Silakan coba kembali atau gunakan metode lain.'
        },
        onClose: function () {
          console.log('Midtrans Snap widget closed')
        }
      })
    } catch (err: any) {
      console.error('Failed to embed Midtrans Snap:', err)
      errorMessage.value = 'Gagal memuat antarmuka pembayaran. Silakan muat ulang halaman.'
    }
  } else {
    setTimeout(embedSnap, 300)
  }
}

const pollPaymentStatus = async () => {
  if (typeof window === 'undefined') return
  try {
    const api = useApi()
    const target = orderNumber.value || orderId.value
    const data = await api.get<any>(`/orders/track/${target}`)
    if (data && (data.payment_status === 'PAID' || data.cold_chain_status === 'COLD_ROOM_INTAKE')) {
      if (pollTimer) clearInterval(pollTimer)
      router.replace(`/orders/success?order_number=${data.order_number || target}&order_id=${data.id || orderId.value}`)
    }
  } catch {}
}

const handleManualSync = async () => {
  isCheckingStatus.value = true
  errorMessage.value = null
  try {
    const api = useApi()
    const target = orderNumber.value || orderId.value
    const res = await api.get<any>(`/orders/${target}/sync-payment`).catch(async () => {
      return await api.get<any>(`/orders/track/${target}`)
    })

    if (res && (res.payment_status === 'PAID' || res.cold_chain_status === 'COLD_ROOM_INTAKE')) {
      router.replace(`/orders/success?order_number=${res.order_number || target}&order_id=${res.id || orderId.value}`)
    } else {
      errorMessage.value = 'Pembayaran belum terdeteksi masuk. Jika sudah transfer, mohon tunggu beberapa saat hingga bank mengonfirmasi.'
    }
  } catch (err: any) {
    errorMessage.value = 'Belum dapat memverifikasi status pembayaran ke Midtrans. Mohon coba beberapa saat lagi.'
  } finally {
    isCheckingStatus.value = false
  }
}

onMounted(async () => {
  await ensureSnapScript()
  await loadOrderData()

  if (snapToken.value) {
    embedSnap()
  } else {
    isSnapLoading.value = false
  }

  // Polling aktif setiap 4 detik untuk menangkap konfirmasi webhook otomatis
  pollTimer = setInterval(pollPaymentStatus, 4000)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>

<template>
  <div class="w-full max-w-xl mx-auto flex flex-col gap-4 py-2">
    <!-- Notice Banner Sandbox & Keamanan -->
    <div class="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3 sm:p-4 flex items-start gap-3 shadow-xs">
      <span class="material-symbols-outlined text-[20px] text-[#103860] shrink-0 mt-0.5">verified_user</span>
      <div class="flex flex-col gap-0.5 text-xs text-slate-700">
        <span class="font-bold text-[#103860]">Gerbang Pembayaran Resmi Midtrans (Mode Sandbox)</span>
        <span class="text-[11px] text-slate-600 leading-relaxed">
          Pilih QRIS Dinamis (GoPay, OVO, BCA, Mandiri) atau Virtual Account resmi di bawah. Sistem otomatis mendeteksi pembayaran tanpa upload bukti transfer.
        </span>
      </div>
    </div>

    <!-- Ringkasan Tagihan & Resi Pesanan -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div class="flex flex-col">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nomor Pesanan</span>
          <span class="text-sm font-bold text-[#103860] font-mono">#{{ orderNumber || orderId }}</span>
        </div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Menunggu Pembayaran</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="flex flex-col">
          <span class="text-[11px] text-slate-500">Jadwal Kirim Dingin:</span>
          <span class="font-bold text-[#103860]">{{ deliverySlot }}</span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-[11px] text-slate-500">Total Pembayaran:</span>
          <span class="text-base font-extrabold text-[#103860]">
            Rp {{ (totalAmount || 0).toLocaleString('id-ID') }}
          </span>
        </div>
      </div>

      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span class="truncate max-w-[280px]">Penerima: <strong class="text-slate-700">{{ recipientName }}</strong> ({{ addressStreet }})</span>
        <span class="font-medium text-emerald-700">Rantai Dingin Terjamin</span>
      </div>
    </div>

    <!-- Container Flat Snap Embed (Proporsional, Flat, Non-Popup) -->
    <div class="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      <!-- Header Flat Card -->
      <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px] text-[#103860]">credit_card</span>
          <span class="text-xs font-bold text-[#103860]">Pilihan Pembayaran</span>
        </div>
        <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Enkripsi SSL 256-Bit
        </span>
      </div>

      <!-- Error State -->
      <div v-if="errorMessage" class="p-4 bg-red-50 border-b border-red-100 text-xs text-red-800 flex items-start gap-2">
        <span class="material-symbols-outlined text-[16px] text-red-600 shrink-0 mt-0.5">error</span>
        <div class="flex-1">
          <span>{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isSnapLoading" class="min-h-[480px] flex flex-col items-center justify-center p-8 text-center gap-3 bg-white">
        <div class="w-10 h-10 border-3 border-[#103860]/20 border-t-[#103860] rounded-full animate-spin"></div>
        <p class="text-xs font-bold text-[#103860]">Menghubungkan ke Gerbang Pembayaran...</p>
        <p class="text-[11px] text-slate-500 max-w-xs">
          Menyiapkan QRIS Dinamis dan Virtual Account resmi untuk pesanan Anda.
        </p>
      </div>

      <!-- Midtrans Snap Flat Iframe Target Container -->
      <div
        id="snap-container"
        class="w-full min-h-[540px] bg-white transition-opacity duration-300"
        :class="{ 'opacity-0 h-0 overflow-hidden': isSnapLoading, 'opacity-100': !isSnapLoading }"
      ></div>

      <!-- Fallback Token Tidak Ditemukan -->
      <div v-if="!isSnapLoading && !snapToken" class="p-8 text-center flex flex-col items-center gap-3">
        <span class="material-symbols-outlined text-[40px] text-amber-600">receipt_long</span>
        <h3 class="text-sm font-bold text-slate-800">Sesi Pembayaran Perlu Diperbarui</h3>
        <p class="text-xs text-slate-500 max-w-sm">
          Token pembayaran belum tersedia pada peramban ini. Anda dapat menyegarkan halaman atau memeriksa status pesanan di dashboard.
        </p>
        <button
          type="button"
          @click="loadOrderData"
          class="px-4 py-2 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all cursor-pointer"
        >
          Muat Ulang Sesi
        </button>
      </div>
    </div>

    <!-- Tombol Bantuan & Verifikasi Manual -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
      <div class="flex items-center justify-between text-xs text-slate-600">
        <span>Sudah menyelesaikan transfer atau scan QRIS?</span>
        <span class="font-medium text-emerald-600">Verifikasi Real-time</span>
      </div>

      <button
        type="button"
        @click="handleManualSync"
        :disabled="isCheckingStatus"
        class="w-full py-3 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': isCheckingStatus }">sync</span>
        <span>{{ isCheckingStatus ? 'Mengecek Status ke Midtrans...' : 'Cek Status Pembayaran Sekarang' }}</span>
      </button>

      <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <NuxtLink to="/pesanan" class="hover:text-[#103860] transition-colors">
          Lihat Daftar Pesanan Saya
        </NuxtLink>
        <NuxtLink to="/" class="hover:text-[#103860] transition-colors">
          Kembali ke Beranda
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
