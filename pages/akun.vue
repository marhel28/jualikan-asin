<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, type UserAddress } from '~/stores/auth'
import { useOrderStore } from '~/stores/order'
import { useWishlistStore } from '~/stores/wishlist'
import { useCartStore } from '~/stores/cart'
import AddressFormModal from '~/components/address/AddressFormModal.vue'
import {
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
  getWilayahName,
  WILAYAH_DATA,
  type WilayahItem
} from '~/data/wilayah'

useHead({
  title: 'Akun Pelanggan | Laut Berkah Abadi'
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const activeTab = ref<'alamat' | 'pesanan' | 'keamanan' | 'wishlist'>('alamat')
const isLoadingOrders = ref(false)

onMounted(async () => {
  if (route.query.tab && ['alamat', 'pesanan', 'keamanan', 'wishlist'].includes(route.query.tab as string)) {
    activeTab.value = route.query.tab as any
  }
  wishlistStore.initFromStorage()
  if (authStore.isAuthenticated) {
    wishlistStore.fetchWishlist()
  }

  if (typeof window !== 'undefined') {
    if (!authStore.isAuthenticated) {
      const token = localStorage.getItem('lba_auth_token')
      if (token) {
        await authStore.initAuth()
      }
    }

    if (!authStore.isAuthenticated) {
      router.push('/auth?redirect=/akun')
      return
    }
    wishlistStore.fetchWishlist()

    try {
      isLoadingOrders.value = true
      await orderStore.fetchMyOrders()
    } catch {} finally {
      isLoadingOrders.value = false
    }

    try {
      await authStore.fetchAddresses()
    } catch {}
  }
})
type AccountTab = 'profil' | 'alamat' | 'pesanan' | 'keamanan' | 'wishlist'

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const triggerToast = (msg: string) => {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2200)
}

// User credentials & identity
const usernameComputed = computed(() => {
  if (authStore.user?.email) {
    return authStore.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')
  }
  return 'ratnadewi_muncar'
})

// Address Search & List
const searchQuery = ref('')
const addresses = computed<UserAddress[]>(() => {
  return authStore.user?.addresses || []
})

const defaultAddress = computed<UserAddress | undefined>(() => {
  return addresses.value.find(a => a.isDefault) || addresses.value[0]
})

const filteredAddresses = computed<UserAddress[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return addresses.value

  return addresses.value.filter(a =>
    (a.street || '').toLowerCase().includes(q) ||
    (a.recipientName || '').toLowerCase().includes(q) ||
    (a.recipientPhone || '').toLowerCase().includes(q) ||
    (a.label || '').toLowerCase().includes(q) ||
    (a.benchmark || '').toLowerCase().includes(q) ||
    (a.kabupatenNama || '').toLowerCase().includes(q) ||
    (a.kecamatanNama || '').toLowerCase().includes(q) ||
    (a.desaNama || '').toLowerCase().includes(q)
  )
})

// ================= ADDRESS MODAL STATE & ACTIONS =================
const isAddressFormOpen = ref(false)
const editingAddress = ref<UserAddress | null>(null)

const openAddModal = () => {
  editingAddress.value = null
  isAddressFormOpen.value = true
}

const openEditModal = (addr: UserAddress) => {
  editingAddress.value = addr
  isAddressFormOpen.value = true
}

const makeDefault = async (id: string) => {
  await authStore.setDefaultAddress(id)
  triggerToast('Alamat utama berhasil diperbarui')
}

const deleteAddress = async (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
    await authStore.deleteAddress(id)
    triggerToast('Alamat berhasil dihapus')
  }
}


const activeOrdersCount = computed(() => {
  return orderStore.ordersHistory.filter(o => o.status !== 'DELIVERED' && o.status !== 'EXPIRED').length
})

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return { label: 'Menunggu Bayar', class: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'CONFIRMED':
    case 'COLD_ROOM_INTAKE':
      return { label: 'Cold Room Intake', class: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'BUTCHERING_PREP':
      return { label: 'Penyiangan Bersih', class: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
    case 'COLD_PACKED':
      return { label: 'Dikemas Dingin', class: 'bg-teal-50 text-teal-700 border-teal-200' }
    case 'OUT_FOR_DELIVERY':
      return { label: 'Dalam Pengantaran', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
    case 'DELIVERED':
      return { label: 'Telah Diterima', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    default:
      return { label: status, class: 'bg-slate-50 text-slate-700 border-slate-200' }
  }
}

// Security & Credentials
const emailInput = ref(authStore.user?.email || '')
const phoneInput = ref(authStore.user?.phoneWhatsApp || '')
const currentPasswordInput = ref('')
const newPasswordInput = ref('')
const confirmPasswordInput = ref('')
const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)

const handleSaveProfile = async () => {
  if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
    triggerToast('Format email tidak valid.')
    return
  }
  isUpdatingProfile.value = true
  try {
    await authStore.updateEmail(emailInput.value.trim())
    if (authStore.user) {
      authStore.user.phoneWhatsApp = phoneInput.value.trim()
    }
    triggerToast('Data profil WhatsApp & Email berhasil disimpan.')
  } catch {
    triggerToast('Gagal memperbarui profil.')
  } finally {
    isUpdatingProfile.value = false
  }
}

const handleSavePassword = async () => {
  if (newPasswordInput.value.length < 6) {
    triggerToast('Password baru minimal 6 karakter.')
    return
  }
  if (newPasswordInput.value !== confirmPasswordInput.value) {
    triggerToast('Konfirmasi password tidak cocok.')
    return
  }
  isUpdatingPassword.value = true
  try {
    await authStore.updatePassword(newPasswordInput.value, currentPasswordInput.value)
    currentPasswordInput.value = ''
    newPasswordInput.value = ''
    confirmPasswordInput.value = ''
    triggerToast('Kata sandi berhasil diperbarui.')
  } catch {
    triggerToast('Gagal memperbarui kata sandi.')
  } finally {
    isUpdatingPassword.value = false
  }
}

// Wishlist
const addWishlistToCart = (prod: any) => {
  const item = typeof prod === 'object' ? prod : wishlistStore.items.find(i => i.id === prod)
  if (item) {
    cartStore.addItem({
      id: item.id,
      name: item.name,
      slug: item.slug || item.id,
      imageUrl: item.images?.hero || item.imageUrl || 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp',
      pricePerKg: item.pricePerKg || item.price || 50000,
      unit: item.unit || 'kg',
    }, 'utuh_bersih', false, 1)
    triggerToast('Produk berhasil ditambahkan ke keranjang belanja.')
  }
}

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="bg-[#F8FAFC] text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center">
    <!-- Desktop Breadcrumb (hidden on mobile, aligned with max-w-6xl container) -->
    <nav class="items-center hidden w-full max-w-5xl gap-2 px-6 pt-4 pb-1 text-xs md:flex lg:max-w-6xl text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="font-medium text-slate-900">Akun Pelanggan</span>
    </nav>

    <div class="flex flex-col w-full max-w-md gap-5 px-3 py-3 md:max-w-5xl lg:max-w-6xl md:px-6 md:py-5">
      
      <!-- User Profile Header & Identity Card -->
      <div class="flex flex-col justify-between gap-4 p-4 bg-white border border-slate-200/90 rounded-xl md:p-6 shadow-2xs md:flex-row md:items-center">
        <div class="flex items-start gap-3 md:items-center md:gap-4">
          <div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#103860] to-[#081a2e] text-white flex items-center justify-center font-bold text-base md:text-xl tracking-wider shrink-0 shadow-xs">
            {{ authStore.user?.fullName?.charAt(0) || 'U' }}
          </div>
          
          <div class="flex flex-col min-w-0 gap-1">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-sm font-bold leading-tight md:text-lg text-slate-900">
                {{ authStore.user?.fullName || 'Pelanggan Laut Berkah Abadi' }}
              </h1>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] md:text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                WhatsApp Terverifikasi
              </span>
            </div>

            <!-- Identity Badges: Username, WA, Email -->
            <div class="flex flex-wrap items-center text-xs gap-x-3 gap-y-1 text-slate-500">
              <span class="inline-flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-slate-400">badge</span>
                <span class="font-mono font-medium text-slate-700">@{{ usernameComputed }}</span>
              </span>
              <span class="text-slate-300">•</span>
              <span class="inline-flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-emerald-600">call</span>
                <span class="font-mono text-slate-700">{{ authStore.user?.phoneWhatsApp || '-' }}</span>
              </span>
              <span class="text-slate-300">•</span>
              <span class="inline-flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-sky-600">mail</span>
                <span class="text-slate-700 truncate max-w-[200px]">{{ authStore.user?.email || 'Belum ditambahkan' }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            v-if="authStore.user?.role === 'admin' || authStore.user?.role === 'courier'"
            to="/admin"
            class="px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Masuk ke Dashboard Operasional"
          >
            <span class="material-symbols-outlined text-[16px]">warehouse</span>
            <span>Dashboard Operasional</span>
          </NuxtLink>

          <button
            type="button"
            @click="handleLogout"
            class="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Keluar dari akun"
          >
            <span class="material-symbols-outlined text-[18px]">logout</span>
            <span>Keluar</span>
          </button>
        </div>
      </div>

      <!-- Quick Summary Card: Alamat Utama Saat Ini -->
      <div v-if="defaultAddress" class="bg-gradient-to-r from-slate-50 to-white border border-slate-200/90 rounded-xl p-3.5 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-2xs">
        <div class="flex items-start gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-[#103860]/10 text-[#103860] flex items-center justify-center shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[18px]">home_pin</span>
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900">Alamat Pengiriman Utama:</span>
              <span class="px-2 py-0.5 rounded-md bg-[#103860]/8 text-[#103860] font-semibold text-[10px]">
                {{ defaultAddress.label }}
              </span>
            </div>
            <p class="text-slate-600 text-[11px] truncate mt-0.5">
              {{ defaultAddress.street }}, Kec. {{ defaultAddress.kecamatanNama || 'Muncar' }}, {{ defaultAddress.kabupatenNama || 'Banyuwangi' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="activeTab = 'alamat'"
          class="text-xs font-semibold text-[#103860] hover:underline self-end md:self-center shrink-0 cursor-pointer"
        >
          Kelola Alamat →
        </button>
      </div>

      <!-- Desktop Grid Wrapper (Sidebar Nav + Active Content Panel) -->
      <div class="grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[250px_1fr] gap-5 items-start">
        
        <!-- Navigation: Horizontal bar on mobile, Sticky Sidebar on Desktop -->
        <aside class="bg-slate-100 p-1 md:p-2 rounded-xl flex md:flex-col gap-1 text-[11px] md:text-xs font-medium md:sticky md:top-24">
          <button
            type="button"
            @click="activeTab = 'alamat'"
            class="flex-1 md:flex-none py-2 md:py-2.5 px-1.5 md:px-3 rounded-lg transition-all text-center md:text-left cursor-pointer flex items-center justify-center md:justify-start gap-1 md:gap-2 min-w-0"
            :class="activeTab === 'alamat' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-500 hover:text-slate-900'"
          >
            <span class="material-symbols-outlined text-[15px] md:text-[18px] shrink-0">location_on</span>
            <span class="truncate">Alamat</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'pesanan'"
            class="flex-1 md:flex-none py-2 md:py-2.5 px-1.5 md:px-3 rounded-lg transition-all text-center md:text-left cursor-pointer flex items-center justify-center md:justify-between gap-1 md:gap-2 min-w-0"
            :class="activeTab === 'pesanan' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-500 hover:text-slate-900'"
          >
            <div class="flex items-center min-w-0 gap-1 md:gap-2">
              <span class="material-symbols-outlined text-[15px] md:text-[18px] shrink-0">receipt_long</span>
              <span class="truncate">Pesanan</span>
            </div>
            <span
              v-if="activeOrdersCount > 0"
              class="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-600 text-white font-bold shrink-0 leading-none"
            >
              {{ activeOrdersCount }}
            </span>
          </button>
          
          <button
            type="button"
            @click="activeTab = 'keamanan'"
            class="flex-1 md:flex-none py-2 md:py-2.5 px-1.5 md:px-3 rounded-lg transition-all text-center md:text-left cursor-pointer flex items-center justify-center md:justify-start gap-1 md:gap-2 min-w-0"
            :class="activeTab === 'keamanan' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-500 hover:text-slate-900'"
          >
            <span class="material-symbols-outlined text-[15px] md:text-[18px] shrink-0">security</span>
            <span class="truncate">Keamanan</span>
          </button>

          <button
            type="button"
            @click="activeTab = 'wishlist'"
            class="flex-1 md:flex-none py-2 md:py-2.5 px-1.5 md:px-3 rounded-lg transition-all text-center md:text-left cursor-pointer flex items-center justify-center md:justify-between gap-1 md:gap-2 min-w-0"
            :class="activeTab === 'wishlist' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-500 hover:text-slate-900'"
          >
            <div class="flex items-center min-w-0 gap-1 md:gap-2">
              <span class="material-symbols-outlined text-[15px] md:text-[18px] shrink-0">favorite</span>
              <span class="whitespace-nowrap">Wishlist</span>
            </div>
            <span
              v-if="wishlistStore.count > 0"
              class="px-1.5 py-0.5 rounded-full text-[9px] bg-slate-900 text-white font-bold shrink-0 leading-none"
            >
              {{ wishlistStore.count }}
            </span>
          </button>
        </aside>

        <!-- Main Content Panel per Tab -->
        <div class="flex flex-col min-w-0 gap-4">
          
          <!-- ================= TAB 1: ALAMAT PENGIRIMAN (TOKOPEDIA-STYLE) ================= -->
          <section v-if="activeTab === 'alamat'" class="flex flex-col gap-3">
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <!-- Tokopedia-Style Instant Address Search Bar -->
              <div class="relative flex-1">
                <div class="flex items-center w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs focus-within:border-[#103860] focus-within:ring-1 focus-within:ring-[#103860]/20 shadow-2xs transition-all">
                  <span class="material-symbols-outlined text-[18px] text-slate-400 mr-2 shrink-0 select-none">
                    search
                  </span>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Cari jalan, penerima, patokan, kecamatan..."
                    class="w-full p-0 text-xs font-normal bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 focus:ring-0"
                  />
                  <button
                    v-if="searchQuery"
                    type="button"
                    @click="searchQuery = ''"
                    class="ml-1 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-100 transition-colors shrink-0"
                    title="Hapus pencarian"
                  >
                    <span class="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>

              <!-- Button Add Address (Max 3 Limit) -->
              <button
                type="button"
                @click="openAddModal"
                :disabled="addresses.length >= 3"
                class="rounded-xl py-2 px-4 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs shrink-0"
                :class="[
                  addresses.length >= 3
                    ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed opacity-80'
                    : 'bg-[#103860] hover:bg-[#13446E] text-white cursor-pointer'
                ]"
                :title="addresses.length >= 3 ? 'Batas maksimal 3 alamat telah tercapai. Ubah atau hapus alamat untuk menambahkan yang baru.' : 'Tambah Alamat Baru'"
              >
                <span class="material-symbols-outlined text-[17px]">
                  {{ addresses.length >= 3 ? 'lock' : 'add_location_alt' }}
                </span>
                <span>{{ addresses.length >= 3 ? 'Maksimal 3 Alamat' : 'Tambah Alamat Baru' }}</span>
              </button>
            </div>

            <!-- Empty State -->
            <div v-if="filteredAddresses.length === 0" class="w-full">
              <div
                class="flex flex-col items-center justify-center w-full p-10 text-center transition-all bg-white border border-slate-200/90 rounded-2xl shadow-2xs"
              >
                <div class="flex items-center justify-center mb-3 rounded-full w-14 h-14 bg-slate-100 text-slate-400">
                  <span class="material-symbols-outlined text-[26px]">location_off</span>
                </div>
                <h3 class="text-sm font-bold tracking-tight text-slate-800">
                  {{ searchQuery ? 'Alamat Tidak Ditemukan' : 'Belum Ada Alamat Tersimpan' }}
                </h3>
                <p class="text-[11px] text-slate-500 mt-1 max-w-sm">
                  {{ searchQuery ? `Tidak ada alamat yang cocok dengan kata kunci "${searchQuery}".` : 'Tambahkan alamat pengiriman pertama Anda untuk memudahkan proses pesanan rantai dingin.' }}
                </p>
                <div class="flex items-center gap-2 mt-4">
                  <button
                    v-if="searchQuery"
                    type="button"
                    @click="searchQuery = ''"
                    class="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                  <button
                    type="button"
                    @click="openAddModal"
                    class="px-3.5 py-1.5 text-xs font-bold text-white bg-[#103860] hover:bg-[#13446E] rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[15px]">add</span>
                    <span>Tambah Alamat Baru</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Address Cards Grid (Tokopedia-Style Clean Maritime) -->
            <div v-else class="grid grid-cols-1 gap-3">
              <div
                v-for="addr in filteredAddresses"
                :key="addr.id"
                class="bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col gap-2.5 transition-all"
                :class="addr.isDefault ? 'border-[#103860] ring-1 ring-[#103860]/20 bg-blue-50/10' : 'border-slate-200/90 hover:border-slate-300'"
              >
                <!-- Card Header: Badges & Ubah/Hapus -->
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-2 flex-wrap min-w-0">
                    <span class="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700 tracking-wide">
                      {{ addr.label || 'Alamat' }}
                    </span>
                    <span
                      v-if="addr.isDefault"
                      class="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-0.5"
                    >
                      <span class="material-symbols-outlined text-[11px] text-[#059669]">check</span>
                      <span>Utama</span>
                    </span>
                    <span
                      v-if="addr.isGpsVerified"
                      class="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 inline-flex items-center gap-0.5"
                    >
                      <span class="material-symbols-outlined text-[11px]">verified</span>
                      <span>GPS</span>
                    </span>
                  </div>

                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      @click="openEditModal(addr)"
                      class="px-2.5 py-1 text-xs font-semibold transition-colors rounded-lg cursor-pointer text-[#103860] hover:bg-blue-50"
                    >
                      Ubah
                    </button>
                    <button
                      v-if="!addr.isDefault"
                      type="button"
                      @click="deleteAddress(addr.id)"
                      class="p-1 transition-colors rounded-lg cursor-pointer text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus Alamat"
                    >
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                <!-- Recipient & Phone -->
                <div class="text-xs text-slate-900 font-bold flex items-center gap-2">
                  <span>{{ addr.recipientName }}</span>
                  <span class="text-slate-400 font-normal">|</span>
                  <span class="font-mono text-slate-600 font-normal">{{ addr.recipientPhone }}</span>
                </div>

                <!-- Street & Hierarchy -->
                <div class="text-xs text-slate-600 leading-relaxed space-y-0.5">
                  <p class="font-medium text-slate-800">{{ addr.street }}</p>
                  <p v-if="addr.desaNama || addr.kecamatanNama || addr.kabupatenNama" class="text-[11px] text-slate-500">
                    {{ [addr.desaNama, addr.kecamatanNama ? 'Kec. ' + addr.kecamatanNama : null, addr.kabupatenNama, addr.provinsiNama].filter(Boolean).join(', ') }}
                  </p>
                  <p v-if="addr.benchmark" class="text-[11px] text-slate-400 italic">
                    Patokan: {{ addr.benchmark }}
                  </p>
                </div>

                <!-- Action: Set as Default -->
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div class="text-[11px] text-slate-500">
                    <span v-if="addr.isDefault" class="text-emerald-700 font-semibold flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">check_circle</span>
                      Alamat Utama untuk Checkout
                    </span>
                  </div>

                  <button
                    v-if="!addr.isDefault"
                    type="button"
                    @click="makeDefault(addr.id)"
                    class="text-[11px] font-bold text-[#103860] hover:text-[#13446E] flex items-center gap-1 cursor-pointer px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Jadikan Alamat Utama</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ================= TAB: RIWAYAT & STATUS PESANAN ================= -->
          <section v-else-if="activeTab === 'pesanan'" class="flex flex-col gap-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 class="text-xs font-bold text-slate-900">Pesanan Saya</h3>
                <p class="text-[11px] text-slate-500">Pantau status pesanan, pengemasan, dan pengiriman.</p>
              </div>
              <button
                type="button"
                @click="orderStore.fetchMyOrders()"
                class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span class="material-symbols-outlined text-[14px]">refresh</span>
                <span>Segarkan</span>
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingOrders" class="flex flex-col gap-3">
              <div v-for="i in 2" :key="i" class="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col gap-2.5 animate-pulse">
                <div class="w-1/4 h-4 rounded bg-slate-200"></div>
                <div class="w-1/3 h-3 rounded bg-slate-100"></div>
                <div class="h-12 rounded bg-slate-100"></div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="orderStore.ordersHistory.length === 0"
              class="flex flex-col items-center justify-center w-full p-10 text-center bg-white border border-slate-200/90 rounded-xl shadow-2xs"
            >
              <div class="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-slate-100 text-slate-400">
                <span class="material-symbols-outlined text-[24px]">receipt_long</span>
              </div>
              <h4 class="mb-1 text-xs font-bold text-slate-800">Belum Ada Transaksi Pesanan</h4>
              <p class="text-[11px] text-slate-500 max-w-xs mb-4">
                Pilih ikan segar tangkapan Muncar langsung dari nelayan untuk pengiriman subuh besok.
              </p>
              <NuxtLink
                to="/katalog"
                class="px-4 py-2 bg-[#103860] hover:bg-[#13446E] text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                Jelajahi Katalog Ikan
              </NuxtLink>
            </div>

            <!-- Orders List -->
            <div v-else class="flex flex-col gap-3">
              <div
                v-for="ord in orderStore.ordersHistory"
                :key="ord.id"
                class="flex flex-col gap-3 p-4 transition-colors bg-white border border-slate-200/90 rounded-xl shadow-2xs hover:border-slate-300"
              >
                <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div class="flex flex-col">
                    <span class="font-mono text-xs font-bold text-[#103860]">#{{ ord.id }}</span>
                    <span class="text-[10px] text-slate-400">{{ ord.deliverySlot }}</span>
                  </div>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    :class="getStatusBadge(ord.status).class"
                  >
                    {{ getStatusBadge(ord.status).label }}
                  </span>
                </div>

                <!-- Items list -->
                <div class="flex flex-col text-xs divide-y divide-slate-100">
                  <div
                    v-for="(itm, itmIdx) in ord.items"
                    :key="itmIdx"
                    class="py-1.5 flex items-center justify-between text-slate-700"
                  >
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-800">{{ itm.productName }}</span>
                      <span class="text-[10px] text-slate-400">
                        {{ itm.grossWeight }} kg bruto (Est. netto {{ itm.estimatedNetWeight }} kg) - {{ itm.cutTypeTitle }}
                      </span>
                    </div>
                    <span class="font-semibold text-slate-900 shrink-0">
                      Rp {{ (itm.subtotal || 0).toLocaleString('id-ID') }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                  <div class="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <span class="material-symbols-outlined text-[15px] text-blue-600">ac_unit</span>
                    <span class="truncate">{{ ord.packagingType === 'thermal_bag' ? 'Thermal Bag' : 'Styrofoam Box' }}</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="font-bold text-slate-900">Rp {{ (ord.totalAmount || 0).toLocaleString('id-ID') }}</span>
                    <NuxtLink
                      :to="`/pesanan`"
                      class="px-2.5 py-1.5 rounded-lg bg-[#103860] hover:bg-[#13446E] text-white font-semibold text-[11px] transition-colors"
                    >
                      Lacak
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section v-else-if="activeTab === 'keamanan'" class="flex flex-col gap-4">
            
            <!-- User Credentials & Contact Update -->
            <div class="flex flex-col gap-4 p-5 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span class="material-symbols-outlined text-[20px] text-[#103860]">person_pin</span>
                <div>
                  <h3 class="text-xs font-bold text-slate-900">Data Identitas Akun</h3>
                  <p class="text-[11px] text-slate-500">Nomor WhatsApp dan email aktif untuk notifikasi timbangan & resi pengiriman.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Username Akun</label>
                  <div class="flex items-center gap-2 px-3 py-2 font-mono text-xs border rounded-lg bg-slate-100 border-slate-200 text-slate-600">
                    <span>@{{ usernameComputed }}</span>
                    <span class="text-[10px] text-slate-400 ml-auto">Tetap</span>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Nomor WhatsApp Aktif</label>
                  <input
                    v-model="phoneInput"
                    type="tel"
                    placeholder="0812-3456-7890"
                    class="w-full px-3 py-2 font-mono text-xs transition-all border rounded-lg outline-none bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Alamat Email Transaksi</label>
                  <input
                    v-model="emailInput"
                    type="email"
                    placeholder="nama@email.com"
                    class="w-full px-3 py-2 text-xs transition-all border rounded-lg outline-none bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="button"
                :disabled="isUpdatingProfile"
                @click="handleSaveProfile"
                class="self-start px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                {{ isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan Kontak' }}
              </button>
            </div>

            <!-- Password Update Card -->
            <div class="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col gap-3.5">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span class="material-symbols-outlined text-[20px] text-slate-700">lock</span>
                <div>
                  <h3 class="text-xs font-bold text-slate-900">Ganti Kata Sandi</h3>
                  <p class="text-[11px] text-slate-500">Amankan akun Anda dengan kata sandi unik minimal 6 karakter.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Kata Sandi Saat Ini</label>
                  <input
                    v-model="currentPasswordInput"
                    type="password"
                    placeholder="••••••••"
                    class="w-full px-3 py-2 text-xs transition-all border rounded-lg outline-none bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-900"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Kata Sandi Baru</label>
                  <input
                    v-model="newPasswordInput"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    class="w-full px-3 py-2 text-xs transition-all border rounded-lg outline-none bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-900"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Konfirmasi Kata Sandi Baru</label>
                  <input
                    v-model="confirmPasswordInput"
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    class="w-full px-3 py-2 text-xs transition-all border rounded-lg outline-none bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="button"
                :disabled="isUpdatingPassword"
                @click="handleSavePassword"
                class="self-start px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                {{ isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi' }}
              </button>
            </div>
          </section>

          <!-- ================= TAB 3: RIWAYAT WISHLIST IKAN ================= -->
          <section v-else-if="activeTab === 'wishlist'" class="flex flex-col gap-3">
            <div class="flex items-center justify-between px-1">
              <div>
                <h3 class="text-xs font-bold text-slate-900">Riwayat Wishlist Hasil Laut</h3>
                <p class="text-[11px] text-slate-500 mt-0.5">Daftar simpanan ikan segar favorit untuk dipesan sewaktu-waktu</p>
              </div>
              <button
                v-if="wishlistStore.items.length > 0"
                type="button"
                @click="wishlistStore.clear()"
                class="text-[11px] text-red-500 hover:text-red-700 font-medium cursor-pointer"
              >
                Hapus Semua
              </button>
            </div>

            <!-- Empty Wishlist State -->
            <div v-if="wishlistStore.items.length === 0" class="flex flex-col items-center justify-center w-full p-10 text-center bg-white border border-slate-200/90 rounded-xl shadow-2xs">
              <div class="flex items-center justify-center mb-3 rounded-full w-14 h-14 bg-slate-100 text-slate-400">
                <span class="material-symbols-outlined text-[26px]">favorite</span>
              </div>
              <h4 class="text-xs font-bold text-slate-800">Wishlist Anda Masih Kosong</h4>
              <p class="text-[11px] text-slate-400 mt-1 max-w-xs">
                Simpan ikan tangkapan segar Muncar favorit Anda dengan menekan ikon hati pada katalog produk.
              </p>
              <NuxtLink
                to="/katalog"
                class="px-4 py-2 mt-4 text-xs font-semibold text-white transition-colors rounded-lg bg-slate-900 hover:bg-slate-800"
              >
                Jelajahi Katalog Segar
              </NuxtLink>
            </div>

            <!-- Wishlist Product Cards -->
            <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div
                v-for="product in wishlistStore.items"
                :key="product.id"
                class="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div class="flex items-center min-w-0 gap-3">
                  <NuxtImg
                    :src="product.images.hero"
                    :alt="product.name"
                    class="object-cover rounded-lg w-14 h-14 bg-slate-100 shrink-0"
                    width="56"
                    height="56"
                    format="webp"
                    loading="lazy"
                  />
                  <div class="flex flex-col min-w-0">
                    <NuxtLink
                      :to="`/produk/${product.slug}`"
                      class="text-xs font-bold text-slate-800 hover:text-[#103860] truncate"
                    >
                      {{ product.name }}
                    </NuxtLink>
                    <span class="text-[10px] text-slate-500 font-medium truncate">{{ product.fishType || 'Ikan Laut Segar' }}</span>
                    <div class="text-[10px] text-slate-500 mt-0.5 font-medium text-slate-700">{{ product.soldCount || 0 }} terjual</div>
                    <span class="mt-1 text-xs font-semibold text-slate-900">
                      Rp {{ product.pricePerKg.toLocaleString('id-ID') }}
                      <span class="text-[10px] text-slate-400 font-normal">/ {{ product.unit }}</span>
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    @click="addWishlistToCart(product)"
                    class="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1"
                    title="Tambah ke Keranjang"
                  >
                    <span class="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                    <span class="hidden sm:inline">Beli</span>
                  </button>
                  <button
                    type="button"
                    @click="wishlistStore.remove(product.id)"
                    class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus dari Wishlist"
                  >
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Quick Links (Pesanan & CS WhatsApp) -->
          <div class="overflow-hidden text-xs bg-white border divide-y border-slate-200/90 rounded-xl divide-slate-100 shadow-2xs">
            <NuxtLink
              to="/pesanan"
              class="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-3 font-medium text-slate-700">
                <span class="material-symbols-outlined text-[18px] text-slate-400">receipt_long</span>
                <span>Riwayat Pesanan & Resi Pengiriman</span>
              </div>
              <div class="flex items-center gap-1 text-slate-400">
                <span v-if="orderStore.currentOrder" class="text-[10px] font-semibold text-emerald-600">1 aktif</span>
                <span class="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </NuxtLink>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi%2C%20saya%20butuh%20bantuan%20mengenai%20pesanan%20ikan."
              target="_blank"
              rel="noopener noreferrer"
              class="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-3 font-medium text-slate-700">
                <span class="material-symbols-outlined text-[18px] text-emerald-600">support_agent</span>
                <span>Bantuan Pelanggan (WhatsApp Concierge)</span>
              </div>
              <span class="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
            </a>
          </div>

        </div>
      </div>

      <!-- ================= MODAL TAMBAH & EDIT ALAMAT (LEAFLET GPS MAP & WILAYAH API) ================= -->
      <AddressFormModal
        :is-open="isAddressFormOpen"
        :initial-data="editingAddress"
        @close="isAddressFormOpen = false"
        @saved="async () => { triggerToast('Alamat berhasil disimpan'); await authStore.fetchAddresses(); }"
      />

      <!-- Toast Notification -->
      <div
        v-if="showToast"
        class="fixed z-50 px-4 py-2 text-xs text-white transition-all -translate-x-1/2 rounded-lg shadow-lg bottom-20 left-1/2 bg-slate-900"
      >
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>
