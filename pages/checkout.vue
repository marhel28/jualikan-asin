<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '~/stores/cart'
import { useCheckoutStore, type DeliverySlot } from '~/stores/checkout'
import { useOrderStore } from '~/stores/order'
import { useAuthStore } from '~/stores/auth'
import AddressSelectModal from '~/components/address/AddressSelectModal.vue'
import AddressFormModal from '~/components/address/AddressFormModal.vue'
import ShippingAddressForm from '~/components/checkout/ShippingAddressForm.vue'
import type { UserAddress } from '~/stores/auth'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Checkout Pengiriman Hasil Laut | Laut Berkah Abadi',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const router = useRouter()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const orderStore = useOrderStore()
const authStore = useAuthStore()

const isSelectAddressOpen = ref(false)
const isFormAddressOpen = ref(false)
const isShippingFormOpen = ref(false)
const isSubmitting = ref(false)
const editingAddress = ref<UserAddress | null>(null)

interface PaymentOption {
  key: string
  title: string
  channels: string
  logo: string
  badge?: string
}

const availablePaymentMethods: PaymentOption[] = [
  {
    key: 'qris',
    title: 'QRIS Dinamis',
    channels: 'BCA, Mandiri, GoPay, OVO, ShopeePay',
    logo: '/images/payments/qris.svg',
    badge: 'Instan'
  },
  {
    key: 'bca',
    title: 'BCA Virtual Account',
    channels: 'm-BCA, KlikBCA, myBCA, ATM BCA',
    logo: '/images/payments/bca.svg',
    badge: 'Otomatis'
  },
  {
    key: 'bni',
    title: 'BNI Virtual Account',
    channels: 'BNI Mobile, ATM BNI, SMS Banking',
    logo: '/images/payments/bni.svg',
    badge: 'Otomatis'
  },
  {
    key: 'bri',
    title: 'BRI Virtual Account',
    channels: 'BRImo, Internet Banking BRI, ATM BRI',
    logo: '/images/payments/bri.svg',
    badge: 'Otomatis'
  },
  {
    key: 'mandiri',
    title: 'Mandiri Bill / E-Channel',
    channels: "Livin' by Mandiri & ATM Mandiri",
    logo: '/images/payments/mandiri.svg',
    badge: 'Otomatis'
  },
  {
    key: 'permata',
    title: 'Permata Virtual Account',
    channels: 'PermataMobile X & ATM Permata',
    logo: '/images/payments/permata.svg',
    badge: 'Otomatis'
  }
]

const handleSelectAddress = (addr: UserAddress) => {
  const lat = addr.latitude != null ? Number(addr.latitude) : null
  const lng = addr.longitude != null ? Number(addr.longitude) : null
  checkoutStore.setAddress({
    id: addr.id,
    recipientName: addr.recipientName,
    recipientPhone: addr.recipientPhone,
    label: addr.label,
    street: addr.street,
    benchmark: addr.benchmark || '',
    isDefault: addr.isDefault,
    isGpsVerified: addr.isGpsVerified ?? (lat != null && lng != null),
    provinsiKode: addr.provinsiKode,
    kabupatenKode: addr.kabupatenKode,
    kecamatanKode: addr.kecamatanKode,
    desaKode: addr.desaKode,
    provinsiNama: addr.provinsiNama,
    kabupatenNama: addr.kabupatenNama,
    kecamatanNama: addr.kecamatanNama,
    desaNama: addr.desaNama,
    coordinates: (lat != null && lng != null) ? { lat, lng } : { lat: -8.4328, lng: 114.3361 },
    latitude: lat,
    longitude: lng
  })
}

const handleOpenAddAddress = () => {
  editingAddress.value = null
  isFormAddressOpen.value = true
}

const handleOpenEditAddress = (addr: UserAddress) => {
  editingAddress.value = addr
  isFormAddressOpen.value = true
}

const handleAddressSaved = (addr: UserAddress) => {
  handleSelectAddress(addr)
}

onMounted(async () => {
  if (typeof window !== 'undefined') {
    cartStore.initCart()
    if (!authStore.isAuthenticated) {
      const token = localStorage.getItem('lba_auth_token')
      if (token) {
        await authStore.initAuth()
      }
    }
    if (!authStore.isAuthenticated) {
      router.replace('/auth?redirect=/checkout')
      return
    }
    if (cartStore.items.length === 0) {
      router.replace('/keranjang')
      return
    }

    // Load user addresses from backend
    const addresses = await authStore.fetchAddresses()
    const def = addresses.find(a => a.isDefault) || addresses[0]
    if (def) {
      handleSelectAddress(def)
    } else if (authStore.user?.defaultAddress && authStore.user.defaultAddress.street) {
      const da = authStore.user.defaultAddress
      checkoutStore.setAddress({
        id: da.id,
        recipientName: da.recipientName || authStore.user.fullName,
        recipientPhone: da.recipientPhone || authStore.user.phoneWhatsApp,
        label: da.label || 'Rumah',
        street: da.street,
        benchmark: da.benchmark || '',
        isGpsVerified: da.isGpsVerified ?? false,
        coordinates: { lat: -8.4328, lng: 114.3361 },
        latitude: null,
        longitude: null
      })
    }
  }

  // Load dynamic arrival slots and delivery policy from backend
  await checkoutStore.fetchDeliveryConfig()
})

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/keranjang')
  }
}

const handleProceedToPayment = async () => {
  if (!checkoutStore.isDeliveryAllowed) {
    alert('Mohon maaf, saat ini pengiriman rantai dingin Laut Berkah Abadi hanya melayani area Kabupaten Banyuwangi. Silakan pilih atau tambahkan alamat di wilayah Banyuwangi.')
    return
  }
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    const newOrderId = await orderStore.createOrder()
    router.push(`/pembayaran/${newOrderId}`)
  } catch (err: any) {
    alert(err?.message || 'Gagal membuat pesanan. Silakan periksa kembali keranjang Anda.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 py-1">
    <!-- Mobile-only local header with Back navigation (hidden on md+) -->
    <header class="flex items-center gap-3 px-4 py-3 mb-1 -mx-4 -mt-4 bg-white border-b md:hidden border-slate-200">
      <button type="button" @click="goBack" class="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-[#103860] cursor-pointer" aria-label="Kembali ke Keranjang">
        <span class="material-symbols-outlined text-[24px]">arrow_back</span>
      </button>
      <div class="flex flex-col">
        <h1 class="text-base font-bold text-[#103860] leading-tight">Checkout Pengiriman</h1>
        <p class="text-xs font-medium text-slate-500">Pusat Distribusi Dingin Muncar</p>
      </div>
    </header>

    <!-- Desktop Breadcrumb & Back action -->
    <nav class="items-center justify-between hidden mb-1 text-xs md:flex text-slate-500">
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <NuxtLink to="/keranjang" class="hover:text-[#103860] transition-colors">Keranjang Belanja</NuxtLink>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span class="font-semibold text-[#103860]">Checkout Pengiriman</span>
      </div>
      <button 
        type="button" 
        @click="goBack" 
        class="inline-flex items-center gap-1 text-slate-600 hover:text-[#103860] font-medium transition-colors cursor-pointer"
      >
        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Kembali</span>
      </button>
    </nav>

    <!-- Responsive Checkout: 1 col on mobile, 2 col on desktop md+ -->
    <div class="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 md:gap-6 items-start pb-24 md:pb-8">
    <!-- Left Column: Address, Courier, and Delivery Slot Selection -->
    <div class="flex flex-col gap-4">
      <!-- Recipient Address Card with Tokopedia-Style 'Pilih Alamat Lain' Button -->
      <div class="flex flex-col gap-3 p-4 bg-white border shadow-xs border-slate-200/90 rounded-2xl sm:p-5">
        <!-- Top Row: Title, Label Pill, Default Badge, and GPS Badge -->
        <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-[#103860] flex items-center gap-1.5 uppercase tracking-wide">
              <span class="material-symbols-outlined text-[18px]">location_on</span>
              Alamat Pengiriman
            </span>
            <span v-if="checkoutStore.address.label" class="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
              {{ checkoutStore.address.label }}
            </span>
            <span
              v-if="checkoutStore.address.isDefault"
              class="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-0.5"
            >
              <span class="material-symbols-outlined text-[11px] text-[#059669]">check</span>
              <span>Utama</span>
            </span>
          </div>

          <!-- Out of Service Area Badge -->
          <span
            v-if="!checkoutStore.isDeliveryAllowed"
            class="text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200"
          >
            <span class="material-symbols-outlined text-[14px] text-red-600">fmd_bad</span>
            <span>Di Luar Jangkauan</span>
          </span>

          <!-- GPS / Accuracy Chip -->
          <span 
            v-if="!checkoutStore.isTextOnlyFallback"
            class="text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[#059669] border border-emerald-200"
          >
            <span class="material-symbols-outlined text-[14px]">verified</span>
            <span>Pin Peta Terkunci</span>
          </span>
          <span 
            v-else
            class="text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200"
          >
            <span class="material-symbols-outlined text-[14px] text-amber-600">edit_note</span>
            <span>Alamat Teks Tanpa Pin</span>
          </span>
        </div>

        <!-- Dropship Mode Notice Banner -->
        <div v-if="checkoutStore.isDropship" class="p-2.5 bg-blue-50 border border-blue-200/90 rounded-xl text-xs flex items-center justify-between gap-2">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-[20px] text-[#103860]">inventory</span>
            <div>
              <div class="font-bold text-[#103860] leading-tight">Pesanan Mode Dropship</div>
              <div class="text-[11px] text-slate-600">
                Pengirim: <strong>{{ checkoutStore.senderName || 'Toko Dropshipper' }}</strong> ({{ checkoutStore.senderPhone || '-' }})
              </div>
            </div>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 bg-white border border-blue-200 text-[#103860] rounded-md shrink-0">
            Resi Tanpa Harga
          </span>
        </div>

        <!-- Recipient & Phone -->
        <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
          <span>{{ checkoutStore.address.recipientName }}</span>
          <span class="font-normal text-slate-400">|</span>
          <span class="font-mono font-normal text-slate-700">{{ checkoutStore.address.recipientPhone }}</span>
        </div>

        <!-- Full Street & Administrative Region -->
        <div class="space-y-1 text-xs leading-relaxed text-slate-600">
          <p class="font-medium text-slate-800">{{ checkoutStore.address.street }}</p>
          <p v-if="checkoutStore.address.desaNama || checkoutStore.address.kecamatanNama || checkoutStore.address.kabupatenNama" class="text-[11px] text-slate-500">
            {{ [checkoutStore.address.desaNama, checkoutStore.address.kecamatanNama ? 'Kec. ' + checkoutStore.address.kecamatanNama : null, checkoutStore.address.kabupatenNama, checkoutStore.address.provinsiNama].filter(Boolean).join(', ') }}
          </p>
          <p v-if="checkoutStore.address.benchmark" class="text-[11px] text-slate-400 italic">
            Patokan: {{ checkoutStore.address.benchmark }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
          <div class="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg">
            <span class="material-symbols-outlined text-[14px] text-[#103860]">pin_drop</span>
            <span v-if="!checkoutStore.isTextOnlyFallback && checkoutStore.address.latitude != null" class="font-mono text-slate-700">
              {{ checkoutStore.address.latitude?.toFixed(4) }}, {{ checkoutStore.address.longitude?.toFixed(4) }}
            </span>
            <span v-else class="italic text-slate-500">
              Titik GPS tidak diset
            </span>
            <span v-if="checkoutStore.deliveryDistanceKm !== null" class="ml-1 pl-1.5 border-l border-slate-200 font-semibold"
              :class="checkoutStore.isDeliveryAllowed ? 'text-[#059669]' : 'text-rose-600'">
              {{ checkoutStore.deliveryDistanceKm }} km dari Muncar
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="isShippingFormOpen = true"
              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#103860] bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-xl transition cursor-pointer"
            >
              <span class="material-symbols-outlined text-[15px]">edit_location_alt</span>
              <span>Atur Peta & Dropship</span>
            </button>
            <button
              type="button"
              @click="isSelectAddressOpen = true"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <span class="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>Buku Alamat</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Warning Box: Delivery Restricted to Banyuwangi Only -->
      <div
        v-if="!checkoutStore.isDeliveryAllowed"
        class="flex items-start gap-3 p-4 text-xs border border-red-200 shadow-xs bg-red-50/95 rounded-xl text-red-950"
      >
        <span class="material-symbols-outlined text-[22px] text-red-600 shrink-0 mt-0.5">fmd_bad</span>
        <div class="space-y-1">
          <span class="block text-xs font-bold text-red-950">Pengiriman Belum Tersedia ke Lokasi Ini</span>
          <p class="text-[11px] leading-relaxed text-red-800">
            Saat ini pengiriman rantai dingin Laut Berkah Abadi hanya melayani alamat di seluruh wilayah <b>Kabupaten Banyuwangi</b> (maksimal 100 km dari Cold Storage Muncar) untuk menjamin kualitas kesegaran 0-2°C.
            <span v-if="checkoutStore.deliveryDistanceKm !== null" class="block mt-1 font-bold text-red-900">
              Jarak terdeteksi: {{ checkoutStore.deliveryDistanceKm }} km (di luar jangkauan operasional).
            </span>
          </p>
          <div class="pt-1.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              @click="isSelectAddressOpen = true"
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-red-300 hover:bg-red-100/60 text-red-900 font-bold text-[11px] rounded-lg transition cursor-pointer shadow-2xs"
            >
              <span class="material-symbols-outlined text-[14px]">swap_horiz</span>
              <span>Pilih Alamat Banyuwangi</span>
            </button>
            <button
              type="button"
              @click="isShippingFormOpen = true"
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-red-300 hover:bg-red-100/60 text-red-900 font-bold text-[11px] rounded-lg transition cursor-pointer shadow-2xs"
            >
              <span class="material-symbols-outlined text-[14px]">edit_location</span>
              <span>Atur Ulang Pin Peta</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Dynamic Delivery Arrival Slot Selector -->
      <div class="flex flex-col gap-3 p-4 bg-white border shadow-xs border-slate-200/80 rounded-xl">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#103860] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">schedule</span>
            Pilihan Slot Kedatangan Kurir
          </span>
          <span v-if="checkoutStore.isLoadingSlots" class="text-[11px] text-slate-400 flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px] animate-spin">sync</span>
            Memuat slot...
          </span>
        </div>

        <div class="grid grid-cols-1 gap-2">
          <label 
            v-for="slot in checkoutStore.activeSlots"
            :key="slot.id"
            class="flex items-start gap-3 p-3 transition-all border cursor-pointer rounded-xl"
            :class="checkoutStore.selectedDeliverySlot === slot.id ? 'border-[#103860] bg-blue-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300'"
          >
            <input 
              type="radio" 
              name="slot" 
              :value="slot.id" 
              :checked="checkoutStore.selectedDeliverySlot === slot.id"
              @change="checkoutStore.setDeliverySlot(slot.id)"
              class="mt-1 text-[#103860]"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2 text-xs flex-wrap">
                <span class="font-bold text-[#0F172A]">{{ slot.title }}</span>
                <span class="text-[11px] font-semibold text-slate-600">({{ slot.timeRange }})</span>
                <span v-if="slot.timeRangeWita" class="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {{ slot.timeRangeWita }}
                </span>
                <span v-if="slot.badge || slot.isRecommended" class="text-[#059669] text-[10px] font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Rekomendasi
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">{{ slot.description }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Catatan untuk Penjual / Dapur Preparasi -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-2.5">
        <label for="kitchen-notes" class="text-xs font-bold text-[#103860] flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">edit_note</span>
          Catatan untuk Penjual
          <span class="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">Opsional</span>
        </label>
        <p class="text-[11px] text-slate-500 leading-relaxed">
          Instruksi pemotongan, pemisahan kepala/tulang untuk sup, atau penanganan kemasan dingin.
        </p>
        <textarea
          id="kitchen-notes"
          v-model="cartStore.kitchenNotes"
          rows="3"
          maxlength="200"
          placeholder="Contoh: Pisahkan kepala & tulang untuk kuah, fillet bagi dua, tambah es gel lebih banyak."
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#103860] focus:ring-2 focus:ring-[#103860]/10 focus:outline-none resize-none transition-colors"
        ></textarea>
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-slate-400">{{ cartStore.kitchenNotes.length }}/200 karakter</span>
          <span v-if="cartStore.kitchenNotes.length > 0" class="text-[#059669] font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">check_circle</span>
            Akan diteruskan ke dapur
          </span>
        </div>
      </div>
    </div>

    <!-- Right Column: Guarantee Notice + Bill Breakdown + CTA -->
    <div class="flex flex-col gap-4 md:sticky md:top-20">
      <!-- Mini Cart Items Summary (Clean Desktop & Mobile Preview) -->
      <div class="flex flex-col gap-3 p-4 bg-white border shadow-xs border-slate-200/80 rounded-xl">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <span class="text-xs font-bold text-[#103860] uppercase tracking-wider flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">set_meal</span>
            Ringkasan Ikan Segar ({{ cartStore.items.length }})
          </span>
          <NuxtLink to="/keranjang" class="text-[11px] font-semibold text-[#103860] hover:underline">
            Ubah
          </NuxtLink>
        </div>

        <div class="pr-1 overflow-y-auto divide-y divide-slate-100 max-h-56">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id" 
            class="flex items-center justify-between gap-3 py-2 text-xs"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <NuxtImg 
                :src="item.imageUrl" 
                :alt="item.name" 
                class="object-cover w-10 h-10 border rounded-lg bg-slate-100 shrink-0 border-slate-100"
                width="40"
                height="40"
                format="webp"
                loading="lazy"
              />
              <div class="flex flex-col min-w-0">
                <span class="font-bold truncate text-slate-800">{{ item.name }}</span>
                <span class="text-[11px] text-slate-500">
                  {{ item.quantityKg }} kg • {{ item.cutLabel }}
                </span>
              </div>
            </div>
            <span class="font-bold text-[#103860] font-mono shrink-0">
              Rp {{ item.itemSubtotal.toLocaleString('id-ID') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Order Final Bill Card -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-2.5">
        <span class="text-xs font-bold text-[#103860] uppercase tracking-wider pb-1 border-b border-slate-100">
          Rincian Biaya
        </span>
        <div class="flex justify-between text-xs text-slate-600">
          <span>Subtotal Produk</span>
          <span class="font-mono font-semibold text-slate-800">Rp {{ cartStore.productsSubtotal.toLocaleString('id-ID') }}</span>
        </div>
        <div class="flex justify-between text-xs text-slate-600">
          <span>Biaya Pengiriman ({{ cartStore.packagingDetails?.name || 'Paket Pengiriman' }})</span>
          <span class="font-mono font-semibold text-slate-800">Rp {{ cartStore.packagingFee.toLocaleString('id-ID') }}</span>
        </div>
        <div class="flex justify-between text-xs text-slate-600">
          <span>Ongkos Kirim Dingin LBA</span>
          <span class="font-semibold text-[#059669] font-mono">
            {{ checkoutStore.shippingFee === 0 ? 'Gratis (Area Banyuwangi)' : `Rp ${checkoutStore.shippingFee.toLocaleString('id-ID')}` }}
          </span>
        </div>
        <div class="pt-2 border-t border-slate-100 flex justify-between items-baseline text-sm font-bold text-[#103860]">
          <span>Total Pembayaran</span>
          <span class="text-base md:text-lg font-extrabold font-mono text-[#103860]">
            Rp {{ checkoutStore.totalBill.toLocaleString('id-ID') }}
          </span>
        </div>
      </div>

      <!-- Metode Pembayaran Pilihan (In-App Bank & QRIS Cards) -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <span class="text-xs font-bold text-[#103860] uppercase tracking-wider flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            Metode Pembayaran
          </span>
          <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">verified</span>
            Verifikasi Otomatis
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            v-for="method in availablePaymentMethods"
            :key="method.key"
            type="button"
            @click="orderStore.setPaymentBank(method.key)"
            class="p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
            :class="orderStore.selectedPaymentBank === method.key ? 'border-[#103860] bg-blue-50/60 ring-2 ring-[#103860]/20' : 'border-slate-200/90 hover:border-slate-300 bg-white'"
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
            <!-- Checkmark Indicator -->
            <div class="shrink-0">
              <span v-if="orderStore.selectedPaymentBank === method.key" class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                <span class="material-symbols-outlined text-[14px]">check</span>
              </span>
              <span v-else class="w-5 h-5 rounded-full border-2 border-slate-300 block group-hover:border-slate-400"></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Payment CTA -->
      <button 
        type="button"
        @click="handleProceedToPayment"
        :disabled="!checkoutStore.isDeliveryAllowed || isSubmitting"
        class="w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :class="!checkoutStore.isDeliveryAllowed ? 'bg-slate-300 text-slate-500 hover:bg-slate-300 shadow-none' : 'bg-[#103860] hover:bg-[#13446E] text-white active:scale-95'"
      >
        <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': isSubmitting }">
          {{ isSubmitting ? 'sync' : (!checkoutStore.isDeliveryAllowed ? 'block' : (orderStore.selectedPaymentBank === 'qris' ? 'qr_code_2' : 'account_balance')) }}
        </span>
        <span>
          {{ isSubmitting ? 'Menyiapkan Pembayaran...' : (!checkoutStore.isDeliveryAllowed ? 'Alamat di Luar Wilayah Pengantaran (Khusus Banyuwangi)' : (orderStore.selectedPaymentBank === 'qris' ? 'Bayar Sekarang via QRIS Dinamis' : (orderStore.selectedPaymentBank === 'mandiri' ? 'Bayar via Mandiri Bill / E-Channel' : `Bayar via ${orderStore.selectedPaymentBank.toUpperCase()} Virtual Account`))) }}
        </span>
      </button>

      <!-- Clean Guarantee Notice Card (Secondary footer in right column) -->
      <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600">
        <span class="material-symbols-outlined text-[18px] text-[#059669] shrink-0 mt-0.5">verified_user</span>
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-800 text-[11px]">Garansi Rantai Dingin Terjamin</span>
          <p class="text-[10px] leading-relaxed text-slate-500">
            Suhu 0 - 4°C terjaga sampai depan pintu. Rekam unboxing untuk kemudahan klaim penggantian bila mutu berkurang.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Tokopedia-Style Address Selection Modal (Search & Radio Select) -->
  <AddressSelectModal
    :is-open="isSelectAddressOpen"
    :selected-id="checkoutStore.address.id"
    @close="isSelectAddressOpen = false"
    @select="handleSelectAddress"
    @add-new="handleOpenAddAddress"
    @edit="handleOpenEditAddress"
  />

  <!-- Address Add / Edit Form Modal with Leaflet GPS Pin Map -->
  <AddressFormModal
    :is-open="isFormAddressOpen"
    :initial-data="editingAddress"
    @close="isFormAddressOpen = false"
    @saved="handleAddressSaved"
  />

  <!-- Dedicated Shipping & Dropship Mapping Modal -->
  <Teleport to="body">
    <div
      v-if="isShippingFormOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      @click.self="isShippingFormOpen = false"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        <div class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-[20px] text-[#103860]">edit_location_alt</span>
            <div>
              <h2 class="text-xs font-bold leading-tight sm:text-sm text-slate-900">Pengaturan Alamat & Dropship</h2>
              <p class="text-[11px] text-slate-500">Kunci titik peta kurir, tempel shareloc, atau aktifkan mode dropship.</p>
            </div>
          </div>
          <button
            type="button"
            @click="isShippingFormOpen = false"
            class="p-1 transition rounded-lg cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div class="flex-1 p-4 overflow-y-auto">
          <ShippingAddressForm
            :show-as-modal="true"
            @close="isShippingFormOpen = false"
            @save="isShippingFormOpen = false"
          />
        </div>
      </div>
    </div>
  </Teleport>
  </div>
</template>

