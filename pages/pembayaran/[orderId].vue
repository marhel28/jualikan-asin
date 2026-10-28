<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '~/stores/order'

definePageMeta({
  layout: 'payment'
})

useHead({
  title: 'Pembayaran Pesanan | Laut Berkah Abadi Banyuwangi'
})

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = computed(() => String(route.params.orderId || ''))
const orderNumber = ref<string>('')
const totalAmount = ref<number>(0)
const deliverySlot = ref<string>('')
const recipientName = ref<string>('')
const addressStreet = ref<string>('')
const paymentStatus = ref<string>('PENDING')
const paymentMethod = ref<string>('qris')
const paymentBank = ref<string>('qris')
const paymentPayload = ref<any>(null)
const expiredAt = ref<string | null>(null)

// Countdown Timer State (20 minutes = 1200 seconds)
const remainingSeconds = ref<number>(1200)
let timerInterval: any = null
let pollTimer: any = null

const isCheckingStatus = ref(false)
const errorMessage = ref<string | null>(null)
const toastMessage = ref<string | null>(null)
const activeVaTab = ref<'mbanking' | 'atm' | 'ibanking'>('mbanking')
const isSimulating = ref(false)

const formattedTimer = computed(() => {
  const m = Math.floor(Math.max(0, remainingSeconds.value) / 60)
  const s = Math.max(0, remainingSeconds.value) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const timerProgressPercentage = computed(() => {
  return Math.min(100, Math.max(0, (remainingSeconds.value / 1200) * 100))
})

const isExpired = computed(() => {
  return remainingSeconds.value <= 0 || paymentStatus.value === 'EXPIRED'
})

const isPaid = computed(() => {
  return paymentStatus.value === 'PAID'
})

const isQris = computed(() => {
  return (
    paymentBank.value === 'qris' ||
    paymentMethod.value === 'qris' ||
    paymentPayload.value?.payment_type === 'qris' ||
    Boolean(paymentPayload.value?.qr_code_url || paymentPayload.value?.qr_string)
  )
})

const isMandiri = computed(() => {
  return (
    paymentBank.value === 'mandiri' ||
    paymentPayload.value?.payment_type === 'echannel' ||
    Boolean(paymentPayload.value?.biller_code)
  )
})

const resolvedVaNumber = computed(() => {
  return (
    paymentPayload.value?.va_number ||
    paymentPayload.value?.permata_va_number ||
    orderStore.currentOrder?.virtualAccountNumber ||
    '-'
  )
})

const resolvedQrUrl = computed(() => {
  if (paymentPayload.value?.qr_code_url) {
    return paymentPayload.value.qr_code_url
  }
  if (paymentPayload.value?.qr_string) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentPayload.value.qr_string)}`
  }
  return 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=LAUT_BERKAH_ABADI_MUNCAR_QRIS'
})

const bankDisplayTitle = computed(() => {
  const b = (paymentBank.value || paymentPayload.value?.bank || '').toLowerCase()
  if (b === 'bca') return 'BCA Virtual Account'
  if (b === 'bni') return 'BNI Virtual Account'
  if (b === 'bri') return 'BRI Virtual Account'
  if (b === 'mandiri') return 'Mandiri Bill (E-Channel)'
  if (b === 'permata') return 'Permata Virtual Account'
  return 'Virtual Account Bank'
})

interface SwitchPaymentOption {
  key: string
  title: string
  channels: string
  logo: string
}

const switchPaymentMethods: SwitchPaymentOption[] = [
  {
    key: 'qris',
    title: 'QRIS Dinamis',
    channels: 'BCA, Mandiri, GoPay, OVO, ShopeePay',
    logo: '/images/payments/qris.svg',
  },
  {
    key: 'bca',
    title: 'BCA Virtual Account',
    channels: 'm-BCA, KlikBCA, myBCA, ATM BCA',
    logo: '/images/payments/bca.svg',
  },
  {
    key: 'bni',
    title: 'BNI Virtual Account',
    channels: 'BNI Mobile, ATM BNI, SMS Banking',
    logo: '/images/payments/bni.svg',
  },
  {
    key: 'bri',
    title: 'BRI Virtual Account',
    channels: 'BRImo, Internet Banking BRI, ATM BRI',
    logo: '/images/payments/bri.svg',
  },
  {
    key: 'mandiri',
    title: 'Mandiri Bill / E-Channel',
    channels: "Livin' by Mandiri & ATM Mandiri",
    logo: '/images/payments/mandiri.svg',
  },
  {
    key: 'permata',
    title: 'Permata Virtual Account',
    channels: 'PermataMobile X & ATM Permata',
    logo: '/images/payments/permata.svg',
  },
]

const isSwitchModalOpen = ref(false)
const selectedSwitchBank = ref<string>('qris')
const isSwitching = ref(false)

const currentPaymentLogo = computed(() => {
  const b = (paymentBank.value || '').toLowerCase()
  if (b === 'bca') return '/images/payments/bca.svg'
  if (b === 'bni') return '/images/payments/bni.svg'
  if (b === 'bri') return '/images/payments/bri.svg'
  if (b === 'mandiri') return '/images/payments/mandiri.svg'
  if (b === 'permata') return '/images/payments/permata.svg'
  return '/images/payments/qris.svg'
})

const openSwitchModal = () => {
  selectedSwitchBank.value = paymentBank.value || 'qris'
  isSwitchModalOpen.value = true
}

const closeSwitchModal = () => {
  if (isSwitching.value) return
  isSwitchModalOpen.value = false
}

const handleApplySwitchPayment = async () => {
  if (!selectedSwitchBank.value || selectedSwitchBank.value === paymentBank.value) {
    isSwitchModalOpen.value = false
    return
  }
  isSwitching.value = true
  try {
    const api = useApi()
    const target = orderNumber.value || orderId.value
    const res = await api.post<any>(`/orders/${target}/switch-payment-method`, {
      payment_bank: selectedSwitchBank.value,
    })
    if (res && res.success) {
      paymentBank.value = res.payment_bank
      paymentMethod.value = res.payment_method
      paymentPayload.value = res.payment_payload
      if (res.expires_in_seconds) {
        remainingSeconds.value = res.expires_in_seconds
      }
      isSwitchModalOpen.value = false
      showToast(`Metode pembayaran berhasil diubah ke ${bankDisplayTitle.value}!`)
    } else {
      showToast('Gagal mengubah metode pembayaran. Silakan coba kembali.')
    }
  } catch (err: any) {
    showToast(err?.detail || err?.message || 'Gagal mengubah metode pembayaran.')
  } finally {
    isSwitching.value = false
  }
}

const fallbackCopy = (text: string) => {
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  } catch {}
}

const copyToClipboard = (text: string, label: string) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text)
      })
    } else {
      fallbackCopy(text)
    }
  } catch {
    fallbackCopy(text)
  }
  showToast(`${label} berhasil disalin!`)
}

const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = null
    }
  }, 5000)
}

const downloadQrImage = () => {
  const url = resolvedQrUrl.value
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.download = `QRIS-LBA-${orderNumber.value || orderId.value}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  showToast('Memulai pengunduhan QRIS...')
}

const loadOrderData = async () => {
  try {
    const api = useApi()
    const target = orderId.value
    const res = await api.get<any>(`/orders/track/${target}`).catch(async () => {
      return await api.get<any>(`/orders/${target}`).catch(() => null)
    })

    if (res) {
      orderNumber.value = res.order_number || res.orderNumber || target
      totalAmount.value = Number(res.grand_total || res.total_amount || res.totalAmount || 0)
      deliverySlot.value = res.delivery_slot || res.deliverySlot || 'Slot Pagi Subuh (06:00 - 08:30 WIB)'
      recipientName.value = res.recipient_name || res.shipping_address?.recipientName || 'Pelanggan LBA'
      addressStreet.value = res.address_detail || res.shipping_address?.street || 'Banyuwangi'
      paymentStatus.value = res.payment_status || 'PENDING'
      paymentMethod.value = res.payment_method || 'qris'
      paymentBank.value = res.payment_bank || res.payment_type || 'qris'
      expiredAt.value = res.expired_at || null

      if (res.payment_payload) {
        paymentPayload.value = typeof res.payment_payload === 'string' ? JSON.parse(res.payment_payload) : res.payment_payload
      }

      if (res.payment_status === 'PAID' || res.cold_chain_status === 'COLD_ROOM_INTAKE') {
        if (pollTimer) clearInterval(pollTimer)
        if (timerInterval) clearInterval(timerInterval)
        router.replace(`/orders/success?order_number=${orderNumber.value}&order_id=${res.id || target}`)
        return
      }

      // Hitung sisa waktu 20 menit
      if (typeof res.expires_in_seconds === 'number') {
        remainingSeconds.value = Math.max(0, res.expires_in_seconds)
      } else if (res.expired_at) {
        const expTime = new Date(res.expired_at).getTime()
        const now = Date.now()
        remainingSeconds.value = Math.max(0, Math.floor((expTime - now) / 1000))
      }
    }
  } catch (err: any) {
    console.error('Error loading order data:', err)
  }
}

const startCountdown = () => {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      clearInterval(timerInterval)
      timerInterval = null
      paymentStatus.value = 'EXPIRED'
    }
  }, 1000)
}

const pollPaymentStatus = async () => {
  if (typeof window === 'undefined') return
  if (isPaid.value || isExpired.value) return
  try {
    const api = useApi()
    const target = orderNumber.value || orderId.value
    const data = await api.get<any>(`/orders/track/${target}`)
    if (data && (data.payment_status === 'PAID' || data.cold_chain_status === 'COLD_ROOM_INTAKE')) {
      paymentStatus.value = 'PAID'
      if (pollTimer) clearInterval(pollTimer)
      if (timerInterval) clearInterval(timerInterval)
      router.replace(`/orders/success?order_number=${data.order_number || target}&order_id=${data.id || orderId.value}`)
    } else if (data && data.payment_status === 'EXPIRED') {
      paymentStatus.value = 'EXPIRED'
      remainingSeconds.value = 0
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
      paymentStatus.value = 'PAID'
      router.replace(`/orders/success?order_number=${res.order_number || target}&order_id=${res.id || orderId.value}`)
    } else {
      errorMessage.value = 'Pembayaran belum terdeteksi masuk. Mohon selesaikan transfer atau scan QRIS sesuai nominal yang tertera.'
    }
  } catch (err: any) {
    errorMessage.value = 'Belum dapat memverifikasi status pembayaran. Silakan coba kembali.'
  } finally {
    isCheckingStatus.value = false
  }
}

const handleSimulatePayment = async () => {
  isSimulating.value = true
  errorMessage.value = null
  try {
    const api = useApi()
    const target = orderId.value
    await api.post(`/orders/${target}/simulate-payment`)
    paymentStatus.value = 'PAID'
    showToast('Simulasi sukses! Mengalihkan ke resi pesanan...')
    setTimeout(() => {
      router.replace(`/orders/success?order_number=${orderNumber.value || target}&order_id=${target}`)
    }, 1000)
  } catch (err: any) {
    errorMessage.value = err?.data?.detail || err?.message || 'Gagal menjalankan simulasi pembayaran.'
  } finally {
    isSimulating.value = false
  }
}

onMounted(async () => {
  await loadOrderData()
  startCountdown()
  // Polling aktif setiap 3.5 detik untuk konfirmasi otomatis dari Webhook Midtrans
  pollTimer = setInterval(pollPaymentStatus, 3500)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="w-full max-w-xl mx-auto flex flex-col gap-4 py-1 px-1 sm:px-2 relative">
    <!-- Connected Stepper Bar (4-Step Checkout Progress) -->
    <div class="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs">
      <div class="flex items-center justify-between relative px-2 sm:px-4">
        <!-- Connecting Line Background -->
        <div class="absolute left-8 right-8 top-3.5 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"></div>
        <!-- Active Connecting Line (Progress up to Step 2: Pembayaran) -->
        <div class="absolute left-8 w-[33%] top-3.5 -translate-y-1/2 h-0.5 bg-emerald-500 -z-0 transition-all duration-500"></div>

        <!-- Step 1: Keranjang (Selesai) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <span class="material-symbols-outlined text-[15px]">check</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-bold text-slate-700">Keranjang</span>
        </div>

        <!-- Step 2: Pembayaran (Aktif) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-[#103860] text-white flex items-center justify-center text-xs font-bold shadow-xs ring-4 ring-blue-100 animate-pulse">
            <span class="text-[11px]">2</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-extrabold text-[#103860]">Pembayaran</span>
        </div>

        <!-- Step 3: Dikemas (Menunggu) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-xs font-semibold">
            <span class="text-[11px]">3</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-medium text-slate-400">Dikemas</span>
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

    <!-- Header & Order Identifier Badge -->
    <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
      <div class="flex items-center gap-1.5 font-bold text-slate-800">
        <span class="material-symbols-outlined text-[16px] text-[#103860]">receipt</span>
        <span>Tagihan Pesanan Segar</span>
      </div>
      <span class="font-mono text-slate-600 font-bold text-[11px] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">#{{ orderNumber || orderId }}</span>
    </div>

    <!-- Card 1: Status Banner & 20-Minute Countdown Timer (Calm Monospace Clock, Anti-AI Slop) -->
    <div 
      class="border rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3 transition-colors bg-white"
      :class="isExpired ? 'bg-red-50/80 border-red-200' : (remainingSeconds < 300 ? 'bg-amber-50/70 border-amber-200' : 'border-slate-200/90')"
    >
      <div class="flex items-center gap-2.5">
        <div 
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          :class="isExpired ? 'bg-red-100 text-red-600' : (remainingSeconds < 300 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-[#103860]')"
        >
          <span class="material-symbols-outlined text-[20px]">
            {{ isExpired ? 'event_busy' : 'timer' }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-bold" :class="isExpired ? 'text-red-900' : 'text-slate-800'">
            {{ isExpired ? 'Batas Waktu Pembayaran Habis' : 'Selesaikan Pembayaran Dalam' }}
          </span>
          <span class="text-[11px] text-slate-500">
            {{ isExpired ? 'Stok ikan telah dilepas kembali ke etalase.' : 'Kunci stok tangkapan segar & slot pengiriman subuh.' }}
          </span>
        </div>
      </div>

      <!-- Timer Monospace Display -->
      <div 
        class="font-mono text-xl sm:text-2xl font-extrabold tracking-wider px-3.5 py-1.5 rounded-xl border tabular-nums shadow-2xs"
        :class="isExpired ? 'bg-red-100 text-red-700 border-red-300' : (remainingSeconds < 300 ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' : 'bg-slate-50 text-[#103860] border-slate-200/90')"
      >
        {{ formattedTimer }}
      </div>
    </div>

    <!-- Alert Jika Pesanan Expired -->
    <div v-if="isExpired" class="bg-white border border-red-200 rounded-2xl p-5 shadow-xs flex flex-col items-center text-center gap-3">
      <span class="material-symbols-outlined text-[44px] text-red-500">schedule_send</span>
      <h2 class="text-base font-bold text-slate-900">Pembayaran Melewati Batas 20 Menit</h2>
      <p class="text-xs text-slate-600 max-w-md leading-relaxed">
        Demi menjaga presisi rantai dingin (*cold chain*) dan keadilan ketersediaan stok bagi seluruh pelanggan, pesanan ini telah otomatis dibatalkan. Silakan pesan ulang untuk menjadwalkan pengiriman subuh berikutnya.
      </p>
      <NuxtLink 
        to="/katalog"
        class="mt-2 px-6 py-2.5 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all cursor-pointer shadow-xs"
      >
        Pesan Ulang di Katalog Ikan
      </NuxtLink>
    </div>

    <!-- Card 2: Rincian Tagihan & Informasi Nomor Rekening/QRIS (Hanya tampil jika belum expired) -->
    <div v-else class="flex flex-col gap-4">
      <!-- Tagihan Total Card (Clean Corporate Invoice Style, No AI-Slop) -->
      <div class="bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col overflow-hidden">
        <!-- Top Section: Total Tagihan & Salin Nominal -->
        <div class="p-4 sm:p-5 flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tagihan Pembayaran</span>
            <span class="text-2xl sm:text-3xl font-extrabold text-[#103860] tracking-tight">
              Rp {{ (totalAmount || 0).toLocaleString('id-ID') }}
            </span>
          </div>
          <button
            type="button"
            @click="copyToClipboard(String(totalAmount), 'Jumlah pembayaran')"
            class="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 bg-slate-50 text-xs font-bold text-[#103860] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <span class="material-symbols-outlined text-[16px]">content_copy</span>
            <span>Salin Jumlah</span>
          </button>
        </div>

        <!-- Inset Sub-Panel: Delivery Slot & Recipient -->
        <div class="px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col gap-2 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500">
          <div class="flex items-center justify-between">
            <span>Jadwal Pengantaran:</span>
            <span class="font-bold text-[#103860]">{{ deliverySlot }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Penerima:</span>
            <span class="font-medium text-slate-700 truncate max-w-[260px] sm:max-w-xs">{{ recipientName }} ({{ addressStreet }})</span>
          </div>
        </div>
      </div>

      <!-- SUB-VIEW 1: METODE QRIS DINAMIS -->
      <div v-if="isQris" class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col items-center gap-4 text-center">
        <!-- Brand Header QRIS with Switch Button -->
        <div class="w-full flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-12 sm:w-14 h-8 bg-white rounded-lg border border-slate-200/90 flex items-center justify-center p-1 shrink-0 shadow-3xs">
              <img src="/images/payments/qris.svg" alt="QRIS Dinamis" class="max-h-5 max-w-[42px] object-contain" />
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-bold text-slate-900">QRIS Dinamis Resmi</span>
              <span class="text-[10px] text-slate-500">Scan via m-Banking & E-Wallet</span>
            </div>
          </div>
          <button
            type="button"
            @click="openSwitchModal"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#103860] hover:text-[#103860] bg-slate-50 hover:bg-white text-[11px] font-bold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-3xs shrink-0"
          >
            <span class="material-symbols-outlined text-[15px] text-[#103860]">swap_horiz</span>
            <span>Ubah Metode</span>
          </button>
        </div>

        <!-- Brand Sub-Header QRIS -->
        <div class="flex flex-col items-center gap-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <span class="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>QRIS Dinamis Resmi Bank Indonesia</span>
          </div>
          <h3 class="text-sm font-bold text-slate-900 mt-1">Laut Berkah Abadi Banyuwangi</h3>
          <p class="text-[11px] text-slate-500">NMID: ID1026388116 • Seluruh Aplikasi E-Wallet & Mobile Banking</p>
        </div>

        <!-- QR Code Container -->
        <div class="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-xs relative group flex flex-col items-center justify-center">
          <img 
            :src="resolvedQrUrl" 
            alt="Kode QRIS Dinamis Laut Berkah Abadi"
            class="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
            loading="eager"
          />
          <div class="absolute bottom-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded-full font-medium">
            Scan untuk bayar Rp {{ (totalAmount || 0).toLocaleString('id-ID') }}
          </div>
        </div>

        <!-- Download QR Action -->
        <div class="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
          <button
            type="button"
            @click="downloadQrImage"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <span class="material-symbols-outlined text-[16px] text-[#103860]">download</span>
            <span>Unduh Gambar QR</span>
          </button>
        </div>

        <!-- Supported Apps Badges -->
        <div class="w-full pt-3 border-t border-slate-100 flex flex-col gap-2">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mendukung Pembayaran:</span>
          <div class="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600">
            <span class="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">GoPay</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">BCA Mobile</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">Livin' Mandiri</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">ShopeePay</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">OVO</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">DANA</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">BRImo</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">LinkAja</span>
          </div>
        </div>

        <!-- Langkah Pembayaran QRIS -->
        <div class="w-full text-left bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
          <span class="font-bold text-[#103860] block text-xs">Cara Membayar via QRIS:</span>
          <ol class="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
            <li>Buka aplikasi m-Banking (BCA Mobile, Livin, BRImo) atau E-Wallet (GoPay, OVO, Dana, ShopeePay).</li>
            <li>Pilih menu <strong>Scan / Bayar QRIS</strong>.</li>
            <li>Arahkan kamera ke kode QR di atas (atau unggah gambar QR yang telah diunduh).</li>
            <li>Periksa nama merchant <strong>Laut Berkah Abadi</strong> dan nominal <strong>Rp {{ (totalAmount || 0).toLocaleString('id-ID') }}</strong>, lalu konfirmasi pembayaran.</li>
          </ol>
        </div>
      </div>

      <!-- SUB-VIEW 2: METODE MANDIRI BILL (E-CHANNEL) -->
      <div v-else-if="isMandiri" class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-12 sm:w-14 h-8 bg-white rounded-lg border border-slate-200/90 flex items-center justify-center p-1 shrink-0 shadow-3xs">
              <img src="/images/payments/mandiri.svg" alt="Mandiri Bill" class="max-h-5 max-w-[42px] object-contain" />
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-bold text-slate-900">Mandiri Bill Payment (E-Channel)</span>
              <span class="text-[10px] text-slate-500">Pembayaran tagihan otomatis 24 jam</span>
            </div>
          </div>
          <button
            type="button"
            @click="openSwitchModal"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#103860] hover:text-[#103860] bg-slate-50 hover:bg-white text-[11px] font-bold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-3xs shrink-0"
          >
            <span class="material-symbols-outlined text-[15px] text-[#103860]">swap_horiz</span>
            <span>Ubah Metode</span>
          </button>
        </div>

        <!-- Kode Perusahaan & Nomor Tagihan -->
        <div class="space-y-3">
          <!-- Kode Perusahaan -->
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-500 font-semibold uppercase">Kode Perusahaan (Biller Code)</span>
              <span class="font-mono text-base font-extrabold text-[#103860]">
                {{ paymentPayload?.biller_code || '70012' }}
              </span>
              <span class="text-[10px] text-slate-400">Midtrans / Laut Berkah Abadi</span>
            </div>
            <button
              type="button"
              @click="copyToClipboard(paymentPayload?.biller_code || '70012', 'Kode Perusahaan')"
              class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#103860] hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[15px]">content_copy</span>
              <span>Salin</span>
            </button>
          </div>

          <!-- Nomor Tagihan / Bill Key -->
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-500 font-semibold uppercase">Nomor Pelanggan / Bill Key</span>
              <span class="font-mono text-base font-extrabold text-[#103860] tracking-wide">
                {{ paymentPayload?.bill_key || resolvedVaNumber }}
              </span>
            </div>
            <button
              type="button"
              @click="copyToClipboard(paymentPayload?.bill_key || resolvedVaNumber, 'Nomor Tagihan')"
              class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#103860] hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[15px]">content_copy</span>
              <span>Salin</span>
            </button>
          </div>
        </div>

        <!-- Panduan Pembayaran Mandiri -->
        <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
          <span class="font-bold text-[#103860] block text-xs">Cara Bayar via Livin' by Mandiri:</span>
          <ol class="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
            <li>Buka dan login aplikasi <strong>Livin' by Mandiri</strong>.</li>
            <li>Pilih menu <strong>Bayar</strong> > cari penyedia jasa <strong>70012 (Midtrans)</strong>.</li>
            <li>Masukkan Nomor Pelanggan / Bill Key: <strong>{{ paymentPayload?.bill_key || resolvedVaNumber }}</strong>.</li>
            <li>Periksa nominal <strong>Rp {{ (totalAmount || 0).toLocaleString('id-ID') }}</strong> dan selesaikan pembayaran.</li>
          </ol>
        </div>
      </div>

      <!-- SUB-VIEW 3: METODE VIRTUAL ACCOUNT (BCA, BNI, BRI, PERMATA) -->
      <div v-else class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-12 sm:w-14 h-8 bg-white rounded-lg border border-slate-200/90 flex items-center justify-center p-1 shrink-0 shadow-3xs">
              <img :src="currentPaymentLogo" :alt="bankDisplayTitle" class="max-h-5 max-w-[42px] object-contain" />
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-bold text-slate-900">{{ bankDisplayTitle }}</span>
              <span class="text-[10px] text-slate-500">Transfer otomatis tanpa konfirmasi manual</span>
            </div>
          </div>
          <button
            type="button"
            @click="openSwitchModal"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#103860] hover:text-[#103860] bg-slate-50 hover:bg-white text-[11px] font-bold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-3xs shrink-0"
          >
            <span class="material-symbols-outlined text-[15px] text-[#103860]">swap_horiz</span>
            <span>Ubah Metode</span>
          </button>
        </div>

        <!-- Card Nomor Virtual Account -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Virtual Account</span>
            <span class="font-mono text-lg sm:text-xl font-extrabold text-[#103860] tracking-wider">
              {{ resolvedVaNumber }}
            </span>
            <span class="text-[10px] text-slate-500">Atas nama: <strong>LAUT BERKAH ABADI / MIDTRANS</strong></span>
          </div>

          <button
            type="button"
            @click="copyToClipboard(resolvedVaNumber, 'Nomor Virtual Account')"
            class="px-3.5 py-2 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <span class="material-symbols-outlined text-[16px]">content_copy</span>
            <span>Salin Nomor VA</span>
          </button>
        </div>

        <!-- Tab Panduan Transfer -->
        <div class="space-y-3 pt-1">
          <div class="flex border-b border-slate-200 text-xs font-semibold">
            <button
              type="button"
              @click="activeVaTab = 'mbanking'"
              class="pb-2 px-3 transition-colors cursor-pointer"
              :class="activeVaTab === 'mbanking' ? 'text-[#103860] border-b-2 border-[#103860] font-bold' : 'text-slate-400 hover:text-slate-600'"
            >
              Mobile Banking
            </button>
            <button
              type="button"
              @click="activeVaTab = 'atm'"
              class="pb-2 px-3 transition-colors cursor-pointer"
              :class="activeVaTab === 'atm' ? 'text-[#103860] border-b-2 border-[#103860] font-bold' : 'text-slate-400 hover:text-slate-600'"
            >
              ATM
            </button>
            <button
              type="button"
              @click="activeVaTab = 'ibanking'"
              class="pb-2 px-3 transition-colors cursor-pointer"
              :class="activeVaTab === 'ibanking' ? 'text-[#103860] border-b-2 border-[#103860] font-bold' : 'text-slate-400 hover:text-slate-600'"
            >
              Internet Banking
            </button>
          </div>

          <!-- Petunjuk Tab Mobile Banking -->
          <div v-if="activeVaTab === 'mbanking'" class="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed">
            <ol class="list-decimal pl-4 space-y-1.5 text-[11px]">
              <li>Buka aplikasi Mobile Banking bank Anda (BCA Mobile, BRImo, BNI Mobile, PermataMobile X).</li>
              <li>Pilih menu <strong>Transfer</strong> > <strong>Virtual Account</strong>.</li>
              <li>Masukkan nomor VA: <strong>{{ resolvedVaNumber }}</strong>.</li>
              <li>Pastikan nominal transfer tepat sebesar <strong>Rp {{ (totalAmount || 0).toLocaleString('id-ID') }}</strong>.</li>
              <li>Konfirmasi pembayaran dengan memasukkan PIN m-Banking Anda.</li>
            </ol>
          </div>

          <!-- Petunjuk Tab ATM -->
          <div v-else-if="activeVaTab === 'atm'" class="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed">
            <ol class="list-decimal pl-4 space-y-1.5 text-[11px]">
              <li>Masukkan kartu ATM dan 6 digit PIN Anda di mesin ATM.</li>
              <li>Pilih menu <strong>Transaksi Lainnya</strong> > <strong>Transfer</strong> > <strong>Ke Rek Virtual Account</strong>.</li>
              <li>Masukkan nomor VA: <strong>{{ resolvedVaNumber }}</strong> lalu tekan Benar.</li>
              <li>Periksa informasi tagihan di layar, lalu pilih <strong>Ya</strong> untuk menyelesaikan transaksi.</li>
            </ol>
          </div>

          <!-- Petunjuk Tab Internet Banking -->
          <div v-else class="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed">
            <ol class="list-decimal pl-4 space-y-1.5 text-[11px]">
              <li>Login ke website Internet Banking resmi bank Anda.</li>
              <li>Pilih menu <strong>Pembayaran Tagihan</strong> > <strong>Virtual Account</strong>.</li>
              <li>Input nomor VA <strong>{{ resolvedVaNumber }}</strong> dan pastikan nama penerima Laut Berkah Abadi.</li>
              <li>Otorisasikan transaksi menggunakan Token / OTP Anda.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Cold Chain & Payment Trust Badges (3 Mini Feature Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
      <!-- Badge 1: Rantai Dingin -->
      <div class="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-3 shadow-2xs flex items-center sm:flex-col sm:text-center gap-2.5">
        <span class="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[18px]">ac_unit</span>
        </span>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-slate-900">Rantai Dingin 0-4°C</span>
          <span class="text-[10px] text-slate-500">Es & kemasan insulasi termal</span>
        </div>
      </div>

      <!-- Badge 2: Garansi Segar -->
      <div class="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-3 shadow-2xs flex items-center sm:flex-col sm:text-center gap-2.5">
        <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[18px]">verified</span>
        </span>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-slate-900">100% Tangkapan Segar</span>
          <span class="text-[10px] text-slate-500">Ikan diseleksi harian di Muncar</span>
        </div>
      </div>

      <!-- Badge 3: Verifikasi Otomatis -->
      <div class="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-3 shadow-2xs flex items-center sm:flex-col sm:text-center gap-2.5">
        <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[18px]">security</span>
        </span>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-slate-900">Verifikasi 24 Jam</span>
          <span class="text-[10px] text-slate-500">Didukung Midtrans & BI</span>
        </div>
      </div>
    </div>

    <!-- Error Alert jika verifikasi manual gagal -->
    <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-start gap-2 shadow-xs">
      <span class="material-symbols-outlined text-[16px] text-red-600 shrink-0 mt-0.5">error</span>
      <span class="flex-1">{{ errorMessage }}</span>
    </div>

    <!-- Card 3: Action Buttons (Cek Status, Simulasi Sandbox, Navigasi) -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
      <button
        type="button"
        @click="handleManualSync"
        :disabled="isCheckingStatus || isExpired"
        class="w-full py-3 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': isCheckingStatus }">sync</span>
        <span>{{ isCheckingStatus ? 'Mengecek Pembayaran ke Bank...' : 'Cek Status Pembayaran' }}</span>
      </button>

      <!-- Tombol Khusus Simulasi Sandbox (Mempermudah Testing Pengguna) -->
      <button
        type="button"
        @click="handleSimulatePayment"
        :disabled="isSimulating || isExpired"
        class="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <span class="material-symbols-outlined text-[16px] text-emerald-600" :class="{ 'animate-spin': isSimulating }">play_circle</span>
        <span>{{ isSimulating ? 'Memverifikasi...' : '⚡ Simulasikan Pembayaran Berhasil (Mode Sandbox)' }}</span>
      </button>

      <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <NuxtLink to="/pesanan" class="hover:text-[#103860] font-medium transition-colors">
          Lihat Daftar Pesanan Saya
        </NuxtLink>
        <NuxtLink to="/" class="hover:text-[#103860] font-medium transition-colors">
          Kembali ke Beranda
        </NuxtLink>
      </div>
    </div>

    <!-- Switch Payment Method Modal / Bottom Sheet -->
    <Teleport to="body">
      <div v-if="isSwitchModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="closeSwitchModal"></div>
        
        <!-- Dialog Container -->
        <div class="relative bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl z-10 flex flex-col gap-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-[#103860] flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <div class="flex flex-col">
                <h3 class="text-sm font-bold text-slate-900">Ubah Metode Pembayaran</h3>
                <p class="text-[11px] text-slate-500">Pilih Virtual Account Bank atau QRIS Dinamis</p>
              </div>
            </div>
            <button 
              type="button" 
              @click="closeSwitchModal" 
              class="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              aria-label="Tutup Dialog"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <!-- 6 Official Bank & QRIS Cards Grid -->
          <div class="grid grid-cols-1 gap-2.5">
            <button
              v-for="method in switchPaymentMethods"
              :key="method.key"
              type="button"
              @click="selectedSwitchBank = method.key"
              class="p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
              :class="selectedSwitchBank === method.key ? 'border-[#103860] bg-blue-50/60 ring-2 ring-[#103860]/20' : 'border-slate-200/90 hover:border-slate-300 bg-white'"
            >
              <div class="flex items-center gap-3 min-w-0">
                <!-- Official Logo Box -->
                <div class="w-14 sm:w-16 h-9 sm:h-10 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center p-1.5 shrink-0 shadow-3xs group-hover:border-slate-300">
                  <img :src="method.logo" :alt="method.title" class="max-h-6 sm:max-h-7 max-w-[48px] sm:max-w-[54px] object-contain" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold text-slate-900 group-hover:text-[#103860] truncate">{{ method.title }}</span>
                  <span class="text-[10px] text-slate-500 truncate">{{ method.channels }}</span>
                </div>
              </div>
              <!-- Selection Radio / Checkmark Indicator -->
              <div class="shrink-0">
                <span v-if="selectedSwitchBank === method.key" class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  <span class="material-symbols-outlined text-[14px]">check</span>
                </span>
                <span v-else class="w-5 h-5 rounded-full border-2 border-slate-300 block group-hover:border-slate-400"></span>
              </div>
            </button>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="closeSwitchModal"
              class="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              @click="handleApplySwitchPayment"
              :disabled="isSwitching || selectedSwitchBank === paymentBank"
              class="px-5 py-2.5 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSwitching" class="material-symbols-outlined text-[16px] animate-spin">sync</span>
              <span>{{ isSwitching ? 'Memproses...' : 'Terapkan Metode Pembayaran' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast Notification Floating (Teleport style at bottom of page) -->
    <Transition name="fade">
      <div 
        v-if="toastMessage" 
        class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-[#103860] text-white text-xs font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-blue-300/40 pointer-events-none whitespace-nowrap"
      >
        <span class="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
