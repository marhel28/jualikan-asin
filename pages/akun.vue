<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type UserAddress } from '~/stores/auth'
import { useOrderStore } from '~/stores/order'
import { useWishlistStore } from '~/stores/wishlist'
import { useCartStore } from '~/stores/cart'
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
const authStore = useAuthStore()
const orderStore = useOrderStore()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

onMounted(() => {
  wishlistStore.initFromStorage()
  if (authStore.user && (!authStore.user.addresses || authStore.user.addresses.length === 0)) {
    authStore.user.addresses = [
      {
        id: 'addr_default_1',
        recipientName: authStore.user.fullName || 'Ibu Ratna Dewi',
        recipientPhone: authStore.user.phoneWhatsApp || '0812-3456-7890',
        label: 'Rumah',
        street: 'Jl. Basuki Rahmat No. 42, Kel. Tukangkayu',
        benchmark: 'Seberang Bank BCA Banyuwangi Kota',
        provinsiKode: '35',
        kabupatenKode: '35.10',
        kecamatanKode: '35.10.19',
        desaKode: '35.10.19.1004',
        provinsiNama: 'JAWA TIMUR',
        kabupatenNama: 'KAB. BANYUWANGI',
        kecamatanNama: 'BANYUWANGI',
        desaNama: 'TUKANGKAYU',
        isDefault: true
      }
    ]
  }
})

// Navigation tabs
type AccountTab = 'profil' | 'alamat' | 'keamanan' | 'wishlist'
const activeTab = ref<AccountTab>('alamat')

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

const filteredAddresses = computed(() => {
  if (!searchQuery.value.trim()) return addresses.value
  const q = searchQuery.value.toLowerCase()
  return addresses.value.filter(a =>
    a.street.toLowerCase().includes(q) ||
    a.recipientName.toLowerCase().includes(q) ||
    a.label.toLowerCase().includes(q) ||
    (a.kabupatenNama && a.kabupatenNama.toLowerCase().includes(q)) ||
    (a.kecamatanNama && a.kecamatanNama.toLowerCase().includes(q))
  )
})

// ================= ADDRESS MODAL & LIVE KECAMATAN SEARCH =================
const isModalOpen = ref(false)
const editingId = ref<string | null>(null)

// Form fields
const formLabel = ref('Rumah')
const formName = ref('')
const formPhone = ref('')
const formStreet = ref('')
const formBenchmark = ref('')

// Cascading region state
const selectedProv = ref('')
const selectedKab = ref('')
const selectedKec = ref('')
const selectedDesa = ref('')

// Live Kecamatan search query & dropdown control
const kecamatanSearchInput = ref('')
const isKecDropdownOpen = ref(false)

const provinceList = computed(() => getProvinces())
const cityList = computed(() => getCities(selectedProv.value))
const villageList = computed(() => getVillages(selectedKec.value))

// Fast in-memory live search for kecamatan (under 1ms)
const liveKecamatanResults = computed<WilayahItem[]>(() => {
  const query = kecamatanSearchInput.value.trim().toLowerCase()
  
  // Scoped to selectedKabupaten if already chosen
  if (selectedKab.value) {
    const list = getDistricts(selectedKab.value)
    if (!query) return list
    return list.filter(item => item.nama.toLowerCase().includes(query))
  }
  
  // Otherwise global search across all kecamatan in dataset (len 8)
  const allDistricts = WILAYAH_DATA.filter(w => w.kode.length === 8)
  if (!query) return allDistricts.slice(0, 20)
  return allDistricts.filter(item => item.nama.toLowerCase().includes(query)).slice(0, 30)
})

const selectKecamatan = (item: WilayahItem) => {
  selectedKec.value = item.kode
  kecamatanSearchInput.value = item.nama
  isKecDropdownOpen.value = false
  selectedDesa.value = ''
  
  // Auto-resolve parent Kab & Prov if not already chosen
  const parentKabKode = item.kode.substring(0, 5)
  const parentProvKode = item.kode.substring(0, 2)
  if (!selectedKab.value || selectedKab.value !== parentKabKode) {
    selectedProv.value = parentProvKode
    selectedKab.value = parentKabKode
  }
}

// Watch parent resets
watch(selectedProv, () => {
  selectedKab.value = ''
  selectedKec.value = ''
  kecamatanSearchInput.value = ''
  selectedDesa.value = ''
})

watch(selectedKab, (newKab) => {
  if (newKab && selectedKec.value && !selectedKec.value.startsWith(newKab)) {
    selectedKec.value = ''
    kecamatanSearchInput.value = ''
    selectedDesa.value = ''
  }
})

const openAddModal = () => {
  editingId.value = null
  formLabel.value = 'Rumah'
  formName.value = authStore.user?.fullName || ''
  formPhone.value = authStore.user?.phoneWhatsApp || ''
  formStreet.value = searchQuery.value.trim()
  formBenchmark.value = ''
  selectedProv.value = '35'
  selectedKab.value = '35.10'
  selectedKec.value = '35.10.10'
  kecamatanSearchInput.value = 'MUNCAR'
  selectedDesa.value = '35.10.10.2001'
  isModalOpen.value = true
}

const openEditModal = (addr: UserAddress) => {
  editingId.value = addr.id
  formLabel.value = addr.label
  formName.value = addr.recipientName
  formPhone.value = addr.recipientPhone
  formStreet.value = addr.street
  formBenchmark.value = addr.benchmark || ''
  selectedProv.value = addr.provinsiKode || '35'
  selectedKab.value = addr.kabupatenKode || '35.10'
  selectedKec.value = addr.kecamatanKode || ''
  kecamatanSearchInput.value = addr.kecamatanNama || (addr.kecamatanKode ? getWilayahName(addr.kecamatanKode) : '')
  selectedDesa.value = addr.desaKode || ''
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  isKecDropdownOpen.value = false
}

const saveAddress = () => {
  if (!formStreet.value.trim() || !formName.value.trim()) {
    triggerToast('Nama penerima dan alamat jalan wajib diisi.')
    return
  }

  const provNama = getWilayahName(selectedProv.value)
  const kabNama = getWilayahName(selectedKab.value)
  const kecNama = kecamatanSearchInput.value.trim() || getWilayahName(selectedKec.value)
  const desaNama = getWilayahName(selectedDesa.value)

  if (editingId.value) {
    authStore.updateAddress(editingId.value, {
      label: formLabel.value,
      recipientName: formName.value.trim(),
      recipientPhone: formPhone.value.trim() || authStore.user?.phoneWhatsApp,
      street: formStreet.value.trim(),
      benchmark: formBenchmark.value.trim(),
      provinsiKode: selectedProv.value,
      kabupatenKode: selectedKab.value,
      kecamatanKode: selectedKec.value,
      desaKode: selectedDesa.value,
      provinsiNama: provNama,
      kabupatenNama: kabNama,
      kecamatanNama: kecNama,
      desaNama: desaNama
    })
    triggerToast('Alamat berhasil diperbarui.')
  } else {
    authStore.addAddress({
      label: formLabel.value,
      recipientName: formName.value.trim(),
      recipientPhone: formPhone.value.trim() || authStore.user?.phoneWhatsApp || '0812-3456-7890',
      street: formStreet.value.trim(),
      benchmark: formBenchmark.value.trim(),
      provinsiKode: selectedProv.value,
      kabupatenKode: selectedKab.value,
      kecamatanKode: selectedKec.value,
      desaKode: selectedDesa.value,
      provinsiNama: provNama,
      kabupatenNama: kabNama,
      kecamatanNama: kecNama,
      desaNama: desaNama
    })
    searchQuery.value = ''
    triggerToast('Alamat pengiriman baru tersimpan.')
  }

  closeModal()
}

const deleteAddress = (id: string) => {
  authStore.deleteAddress(id)
  triggerToast('Alamat dihapus.')
}

const makeDefault = (id: string) => {
  authStore.setDefaultAddress(id)
  triggerToast('Alamat utama pengiriman diubah.')
}

// Security & Credentials
const emailInput = ref(authStore.user?.email || '')
const phoneInput = ref(authStore.user?.phoneWhatsApp || '')
const currentPasswordInput = ref('')
const newPasswordInput = ref('')
const confirmPasswordInput = ref('')
const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)

const handleSaveProfile = () => {
  if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
    triggerToast('Format email tidak valid.')
    return
  }
  isUpdatingProfile.value = true
  setTimeout(() => {
    authStore.updateEmail(emailInput.value.trim())
    if (authStore.user) {
      authStore.user.phoneWhatsApp = phoneInput.value.trim()
    }
    isUpdatingProfile.value = false
    triggerToast('Data profil WhatsApp & Email berhasil disimpan.')
  }, 350)
}

const handleSavePassword = () => {
  if (newPasswordInput.value.length < 6) {
    triggerToast('Password baru minimal 6 karakter.')
    return
  }
  if (newPasswordInput.value !== confirmPasswordInput.value) {
    triggerToast('Konfirmasi password tidak cocok.')
    return
  }
  isUpdatingPassword.value = true
  setTimeout(() => {
    authStore.updatePassword(newPasswordInput.value)
    currentPasswordInput.value = ''
    newPasswordInput.value = ''
    confirmPasswordInput.value = ''
    isUpdatingPassword.value = false
    triggerToast('Kata sandi berhasil diperbarui.')
  }, 400)
}

// Wishlist
const addWishlistToCart = (productId: string) => {
  cartStore.addItem(productId, 'utuh_bersih')
  triggerToast('Produk ditambahkan ke keranjang.')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
}
</script>

<template>
  <div class="bg-[#F8FAFC] text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center">
    <!-- Desktop Breadcrumb (hidden on mobile, aligned with max-w-6xl container) -->
    <nav class="hidden md:flex w-full max-w-5xl lg:max-w-6xl px-6 pt-4 pb-1 items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-slate-900 font-medium">Akun Pelanggan</span>
    </nav>

    <div class="w-full max-w-md md:max-w-5xl lg:max-w-6xl px-3 md:px-6 py-3 md:py-5 flex flex-col gap-5">
      
      <!-- User Profile Header & Identity Card -->
      <div class="bg-white border border-slate-200/90 rounded-xl p-4 md:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start md:items-center gap-3 md:gap-4">
          <div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#103860] to-[#081a2e] text-white flex items-center justify-center font-bold text-base md:text-xl tracking-wider shrink-0 shadow-xs">
            {{ authStore.user?.fullName?.charAt(0) || 'U' }}
          </div>
          
          <div class="flex flex-col gap-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-sm md:text-lg font-bold text-slate-900 leading-tight">
                {{ authStore.user?.fullName || 'Pelanggan Laut Berkah Abadi' }}
              </h1>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] md:text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                WhatsApp Terverifikasi
              </span>
            </div>

            <!-- Identity Badges: Username, WA, Email -->
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span class="inline-flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-slate-400">badge</span>
                <span class="font-mono text-slate-700 font-medium">@{{ usernameComputed }}</span>
              </span>
              <span class="text-slate-300">•</span>
              <span class="inline-flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-emerald-600">call</span>
                <span class="font-mono text-slate-700">{{ authStore.user?.phoneWhatsApp || '0812-3456-7890' }}</span>
              </span>
              <span class="text-slate-300">•</span>
              <span class="inline-flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-sky-600">mail</span>
                <span class="text-slate-700 truncate max-w-[200px]">{{ authStore.user?.email || 'ratna.dewi@gmail.com' }}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="handleLogout"
          class="self-end md:self-center text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Keluar dari akun"
        >
          <span class="material-symbols-outlined text-[18px]">logout</span>
          <span>Keluar</span>
        </button>
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
            <div class="flex items-center gap-1 md:gap-2 min-w-0">
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
        <div class="flex flex-col gap-4 min-w-0">
          
          <!-- ================= TAB 1: ALAMAT PENGIRIMAN ================= -->
          <section v-if="activeTab === 'alamat'" class="flex flex-col gap-3">
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <!-- Search Bar Alamat -->
              <div class="relative flex-1">
                <div class="flex items-center w-full bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-2xs hover:border-slate-300 transition-all">
                  <span class="material-symbols-outlined text-[18px] text-slate-400 mr-2 shrink-0 select-none">
                    search
                  </span>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Cari jalan / kecamatan / kota tujuan..."
                    class="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none border-none focus:ring-0 p-0 font-normal"
                  />
                  <button
                    v-if="searchQuery"
                    type="button"
                    @click="searchQuery = ''"
                    class="text-slate-400 hover:text-slate-600 text-xs ml-1 shrink-0 cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>

              <!-- Button Add Address -->
              <button
                type="button"
                @click="openAddModal"
                class="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <span class="material-symbols-outlined text-[18px]">add</span>
                <span>Tambah Alamat Baru</span>
              </button>
            </div>

            <!-- Empty State -->
            <div v-if="filteredAddresses.length === 0" class="w-full">
              <div
                @click="openAddModal"
                class="w-full bg-white border border-slate-200/90 rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-2xs cursor-pointer hover:border-slate-300 hover:bg-slate-50/40 transition-all group"
              >
                <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3 group-hover:scale-105 transition-transform">
                  <span class="material-symbols-outlined text-[26px]">location_on</span>
                </div>
                <h3 class="text-sm font-semibold text-slate-700 tracking-tight">
                  {{ searchQuery ? 'Alamat tidak ditemukan' : 'Belum ada alamat tersimpan' }}
                </h3>
                <p class="text-[11px] text-slate-400 mt-1">
                  {{ searchQuery ? 'Ketuk untuk menambahkan alamat baru dengan kata kunci ini' : 'Ketuk untuk menambahkan alamat pengiriman baru' }}
                </p>
              </div>
            </div>

            <!-- Address Cards Grid -->
            <div v-else class="grid grid-cols-1 gap-3">
              <div
                v-for="addr in filteredAddresses"
                :key="addr.id"
                class="bg-white border rounded-xl p-4 shadow-2xs flex flex-col gap-2.5 transition-all"
                :class="addr.isDefault ? 'border-slate-900 ring-1 ring-slate-900/10' : 'border-slate-200/90 hover:border-slate-300'"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-start gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <span class="material-symbols-outlined text-[18px]">location_on</span>
                    </div>
                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-xs font-bold text-slate-800">{{ addr.recipientName }}</span>
                        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
                          {{ addr.label }}
                        </span>
                        <span
                          v-if="addr.isDefault"
                          class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold"
                        >
                          Utama
                        </span>
                      </div>
                      <span class="text-[11px] text-slate-400 mt-0.5 font-mono">{{ addr.recipientPhone }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      @click="openEditModal(addr)"
                      class="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Ubah
                    </button>
                    <button
                      v-if="!addr.isDefault"
                      type="button"
                      @click="deleteAddress(addr.id)"
                      class="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                <!-- Street & Hierarchy -->
                <div class="text-xs text-slate-700 leading-relaxed pl-10.5">
                  <p class="font-medium text-slate-800">{{ addr.street }}</p>
                  <p v-if="addr.desaNama || addr.kecamatanNama || addr.kabupatenNama" class="text-[11px] text-slate-500 mt-0.5">
                    {{ [addr.desaNama, 'Kec. ' + (addr.kecamatanNama || ''), addr.kabupatenNama, addr.provinsiNama].filter(Boolean).join(', ') }}
                  </p>
                  <p v-if="addr.benchmark" class="text-[11px] text-slate-400 mt-0.5 italic">
                    Patokan: {{ addr.benchmark }}
                  </p>
                </div>

                <!-- Action: Set as Default -->
                <div v-if="!addr.isDefault" class="pl-10.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    @click="makeDefault(addr.id)"
                    class="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Jadikan Alamat Utama</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ================= TAB 2: KEAMANAN & DATA PENGGUNA ================= -->
          <section v-else-if="activeTab === 'keamanan'" class="flex flex-col gap-4">
            
            <!-- User Credentials & Contact Update -->
            <div class="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col gap-4">
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
                  <div class="flex items-center gap-2 px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono">
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
                    class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 transition-all font-mono"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Alamat Email Transaksi</label>
                  <input
                    v-model="emailInput"
                    type="email"
                    placeholder="nama@email.com"
                    class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 transition-all"
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

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Kata Sandi Saat Ini</label>
                  <input
                    v-model="currentPasswordInput"
                    type="password"
                    placeholder="••••••••"
                    class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Kata Sandi Baru</label>
                  <input
                    v-model="newPasswordInput"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Konfirmasi Kata Sandi Baru</label>
                  <input
                    v-model="confirmPasswordInput"
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 transition-all"
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
            <div v-if="wishlistStore.items.length === 0" class="w-full bg-white border border-slate-200/90 rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-2xs">
              <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <span class="material-symbols-outlined text-[26px]">favorite</span>
              </div>
              <h4 class="text-xs font-bold text-slate-800">Wishlist Anda Masih Kosong</h4>
              <p class="text-[11px] text-slate-400 mt-1 max-w-xs">
                Simpan ikan tangkapan segar Muncar favorit Anda dengan menekan ikon hati pada katalog produk.
              </p>
              <NuxtLink
                to="/katalog"
                class="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Jelajahi Katalog Segar
              </NuxtLink>
            </div>

            <!-- Wishlist Product Cards -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="product in wishlistStore.items"
                :key="product.id"
                class="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    :src="product.images.hero"
                    :alt="product.name"
                    class="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div class="flex flex-col min-w-0">
                    <NuxtLink
                      :to="`/produk/${product.slug}`"
                      class="text-xs font-bold text-slate-800 hover:text-[#103860] truncate"
                    >
                      {{ product.name }}
                    </NuxtLink>
                    <span class="text-[10px] text-slate-400 italic truncate">{{ product.scientificName }}</span>
                    <div class="text-[10px] text-slate-500 mt-0.5 font-medium text-slate-700">{{ product.soldCount || 0 }} terjual</div>
                    <span class="text-xs font-semibold text-slate-900 mt-1">
                      Rp {{ product.pricePerKg.toLocaleString('id-ID') }}
                      <span class="text-[10px] text-slate-400 font-normal">/ {{ product.unit }}</span>
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    @click="addWishlistToCart(product.id)"
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
          <div class="bg-white border border-slate-200/90 rounded-xl divide-y divide-slate-100 shadow-2xs text-xs overflow-hidden">
            <NuxtLink
              to="/pesanan"
              class="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-3 text-slate-700 font-medium">
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
              <div class="flex items-center gap-3 text-slate-700 font-medium">
                <span class="material-symbols-outlined text-[18px] text-emerald-600">support_agent</span>
                <span>Bantuan Pelanggan (WhatsApp Concierge)</span>
              </div>
              <span class="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
            </a>
          </div>

        </div>
      </div>

      <!-- ================= MODAL TAMBAH & EDIT ALAMAT DENGAN LIVE KECAMATAN SEARCH ================= -->
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto"
      >
        <div class="bg-white rounded-xl max-w-sm md:max-w-2xl w-full p-5 md:p-6 flex flex-col gap-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-150 my-auto">
          <div class="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 class="text-sm md:text-base font-bold text-slate-900">
              {{ editingId ? 'Ubah Alamat Pengiriman' : 'Tambah Alamat Baru' }}
            </h3>
            <button
              type="button"
              @click="closeModal"
              class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div class="flex flex-col gap-3.5">
            <!-- Label pilihan -->
            <div class="flex items-center gap-2">
              <button
                v-for="lbl in ['Rumah', 'Kantor', 'Resto / Dapur']"
                :key="lbl"
                type="button"
                @click="formLabel = lbl"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                :class="formLabel === lbl ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              >
                {{ lbl }}
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-1">Nama Penerima</label>
                <input
                  v-model="formName"
                  type="text"
                  placeholder="Contoh: Ibu Ratna Dewi"
                  class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 transition-all"
                />
              </div>

              <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-1">Nomor WhatsApp</label>
                <input
                  v-model="formPhone"
                  type="tel"
                  placeholder="Contoh: 0812-3456-7890"
                  class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 transition-all"
                />
              </div>
            </div>

            <!-- Regional Selection with Live Kecamatan Combobox -->
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Wilayah Tujuan (Live Search Kecamatan)
                </span>
                <span class="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200/50">
                  Cepat & Presisi
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <!-- 1. Provinsi -->
                <div>
                  <label class="block text-[10px] font-medium text-slate-500 mb-0.5">Provinsi</label>
                  <select
                    v-model="selectedProv"
                    class="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="" disabled>Pilih Provinsi</option>
                    <option v-for="p in provinceList" :key="p.kode" :value="p.kode">
                      {{ p.nama }}
                    </option>
                  </select>
                </div>

                <!-- 2. Kabupaten / Kota -->
                <div>
                  <label class="block text-[10px] font-medium text-slate-500 mb-0.5">Kabupaten / Kota</label>
                  <select
                    v-model="selectedKab"
                    :disabled="!selectedProv"
                    class="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-900 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="" disabled>Pilih Kab/Kota</option>
                    <option v-for="c in cityList" :key="c.kode" :value="c.kode">
                      {{ c.nama }}
                    </option>
                  </select>
                </div>

                <!-- 3. Kecamatan : LIVE SEARCH COMBOBOX -->
                <div class="relative md:col-span-2">
                  <label class="block text-[10px] font-medium text-slate-500 mb-0.5">
                    Kecamatan (Ketik untuk Live Search)
                  </label>
                  <div class="relative">
                    <input
                      v-model="kecamatanSearchInput"
                      type="text"
                      placeholder="Ketik nama kecamatan (contoh: Muncar, Genteng, Wonokromo)..."
                      class="w-full pl-8 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-900 transition-all font-medium"
                      @focus="isKecDropdownOpen = true"
                    />
                    <span class="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2.5 pointer-events-none">
                      search
                    </span>
                    <button
                      v-if="kecamatanSearchInput"
                      type="button"
                      @click="kecamatanSearchInput = ''; selectedKec = ''"
                      class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[16px]">cancel</span>
                    </button>
                  </div>

                  <!-- Live Dropdown Results -->
                  <div
                    v-if="isKecDropdownOpen && liveKecamatanResults.length > 0"
                    class="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100"
                  >
                    <button
                      v-for="k in liveKecamatanResults"
                      :key="k.kode"
                      type="button"
                      @click="selectKecamatan(k)"
                      class="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                      :class="selectedKec === k.kode ? 'bg-[#103860]/8 text-[#103860] font-bold' : 'text-slate-700'"
                    >
                      <span class="truncate">{{ k.nama }}</span>
                      <span class="text-[10px] text-slate-400 font-mono ml-2 shrink-0">Kode {{ k.kode }}</span>
                    </button>
                  </div>
                </div>

                <!-- 4. Desa / Kelurahan -->
                <div class="md:col-span-2">
                  <label class="block text-[10px] font-medium text-slate-500 mb-0.5">Desa / Kelurahan</label>
                  <select
                    v-model="selectedDesa"
                    :disabled="!selectedKec"
                    class="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-900 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="" disabled>{{ selectedKec ? 'Pilih Desa/Kelurahan' : 'Pilih Kecamatan terlebih dahulu' }}</option>
                    <option v-for="v in villageList" :key="v.kode" :value="v.kode">
                      {{ v.nama }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">Alamat Jalan, RT/RW, No. Rumah</label>
              <textarea
                v-model="formStreet"
                rows="2"
                placeholder="Contoh: Jl. Basuki Rahmat No. 42 RT 02 / RW 01"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 transition-all resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">Patokan Lokasi (Opsional)</label>
              <input
                v-model="formBenchmark"
                type="text"
                placeholder="Contoh: Pagar hitam seberang Bank BCA"
                class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button
              type="button"
              @click="saveAddress"
              class="flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            >
              Simpan Alamat
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div
        v-if="showToast"
        class="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-2 rounded-lg shadow-lg z-50 transition-all"
      >
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>
