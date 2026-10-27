<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useCheckoutStore } from '~/stores/checkout'
import { useApi } from '~/composables/useApi'
import 'leaflet/dist/leaflet.css'

const props = withDefaults(defineProps<{
  isOpen?: boolean
  showAsModal?: boolean
}>(), {
  isOpen: true,
  showAsModal: false,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

const checkoutStore = useCheckoutStore()
const api = useApi()

// Mode Dropshipper Toggle
const isDropship = ref(checkoutStore.isDropship)
const senderName = ref(checkoutStore.senderName || '')
const senderPhone = ref(checkoutStore.senderPhone || '')

// Alamat Penerima Form States
const recipientName = ref(checkoutStore.address.recipientName || '')
const recipientPhone = ref(checkoutStore.address.recipientPhone || '')
const addressDetail = ref(checkoutStore.address.street || checkoutStore.address.addressDetail || '')
const benchmark = ref(checkoutStore.address.benchmark || '')

// Coordinates & Fallback State
const currentLat = ref<number | null>(checkoutStore.address.coordinates?.lat ?? -8.4328)
const currentLng = ref<number | null>(checkoutStore.address.coordinates?.lng ?? 114.3361)
const isTextOnlyFallback = ref(checkoutStore.isTextOnlyFallback || false)

// Google Maps Shareloc Resolver State
const sharelocUrl = ref('')
const isResolvingLink = ref(false)
const sharelocFeedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)

// Nominatim Search State
const searchQuery = ref('')
const searchResults = ref<Array<{ display_name: string; lat: string; lon: string }>>([])
const isSearching = ref(false)
let searchDebounceTimeout: any = null

// Geolocation Loading State
const isDetectingGps = ref(false)
const validationError = ref('')

// Leaflet Map Refs
const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: any = null
let markerInstance: any = null

const initFormValues = () => {
  isDropship.value = checkoutStore.isDropship
  senderName.value = checkoutStore.senderName || ''
  senderPhone.value = checkoutStore.senderPhone || ''
  recipientName.value = checkoutStore.address.recipientName || ''
  recipientPhone.value = checkoutStore.address.recipientPhone || ''
  addressDetail.value = checkoutStore.address.street || checkoutStore.address.addressDetail || ''
  benchmark.value = checkoutStore.address.benchmark || ''
  isTextOnlyFallback.value = checkoutStore.isTextOnlyFallback || false
  currentLat.value = checkoutStore.address.coordinates?.lat ?? -8.4328
  currentLng.value = checkoutStore.address.coordinates?.lng ?? 114.3361
}

const setupLeafletMap = async () => {
  if (typeof window === 'undefined' || isTextOnlyFallback.value) return
  await nextTick()

  if (!mapContainer.value) return

  const L = await import('leaflet')

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }

  const pinIcon = L.divIcon({
    className: 'lba-gps-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background-color:#103860; color:#FFFFFF; padding:2px 8px; border-radius:9999px; font-size:10px; font-weight:700; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.25); border:1px solid #ffffff; margin-bottom:2px;">
          Titik Pengantaran
        </div>
        <svg width="32" height="40" viewBox="0 0 24 24" fill="#103860" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="#FFFFFF" stroke-width="1.2"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40]
  })

  const initialLat = currentLat.value ?? -8.4328
  const initialLng = currentLng.value ?? 114.3361

  mapInstance = L.map(mapContainer.value, {
    center: [initialLat, initialLng],
    zoom: 15,
    zoomControl: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap kontributor'
  }).addTo(mapInstance)

  markerInstance = L.marker([initialLat, initialLng], {
    draggable: true,
    icon: pinIcon
  }).addTo(mapInstance)

  markerInstance.on('dragend', () => {
    const pos = markerInstance.getLatLng()
    currentLat.value = Number(pos.lat.toFixed(6))
    currentLng.value = Number(pos.lng.toFixed(6))
  })

  mapInstance.on('click', (e: any) => {
    markerInstance.setLatLng(e.latlng)
    currentLat.value = Number(e.latlng.lat.toFixed(6))
    currentLng.value = Number(e.latlng.lng.toFixed(6))
  })

  setTimeout(() => {
    if (mapInstance) {
      mapInstance.invalidateSize()
    }
  }, 250)
}

const updatePinLocation = (lat: number, lng: number, zoomLevel: number = 16) => {
  currentLat.value = Number(lat.toFixed(6))
  currentLng.value = Number(lng.toFixed(6))
  isTextOnlyFallback.value = false

  if (mapInstance && markerInstance) {
    mapInstance.flyTo([lat, lng], zoomLevel)
    markerInstance.setLatLng([lat, lng])
  } else {
    setupLeafletMap()
  }
}

// Handler: Resolving Google Maps Shareloc Link via Backend
const handleResolveGmapsLink = async () => {
  const url = sharelocUrl.value.trim()
  if (!url) {
    sharelocFeedback.value = { type: 'error', message: 'Silakan tempelkan link Google Maps terlebih dahulu.' }
    return
  }

  isResolvingLink.value = true
  sharelocFeedback.value = null

  try {
    const res = await api.post<{
      success: boolean
      latitude?: number
      longitude?: number
      distance_km?: number
      message?: string
    }>('/utils/resolve-gmaps-link', { url })

    if (res?.success && res.latitude && res.longitude) {
      updatePinLocation(res.latitude, res.longitude, 16)
      sharelocFeedback.value = {
        type: 'success',
        message: `Titik koordinat berhasil dikunci: ${res.latitude.toFixed(5)}, ${res.longitude.toFixed(5)} (Jarak: ${res.distance_km || 0} km)`
      }
    } else {
      sharelocFeedback.value = {
        type: 'error',
        message: res?.message || 'Gagal mengekstrak koordinat dari link. Silakan gunakan pencarian daerah atau geser pin peta.'
      }
    }
  } catch (err: any) {
    sharelocFeedback.value = {
      type: 'error',
      message: err?.data?.detail || err?.message || 'Terjadi kesalahan saat memeriksa tautan.'
    }
  } finally {
    isResolvingLink.value = false
  }
}

// Handler: Free Nominatim OpenStreetMap Search
const handleSearchLocationInput = () => {
  if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout)
  const q = searchQuery.value.trim()
  if (q.length < 3) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  isSearching.value = true
  searchDebounceTimeout = setTimeout(async () => {
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&limit=5&q=${encodeURIComponent(q)}`
      const res = await fetch(endpoint, {
        headers: {
          'Accept-Language': 'id-ID,id;q=0.9',
          'User-Agent': 'LautBerkahAbadi-Marketplace/1.0'
        }
      })
      if (res.ok) {
        const data = await res.json()
        searchResults.value = Array.isArray(data) ? data : []
      }
    } catch {
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 500)
}

const handleSelectSearchResult = (result: { lat: string; lon: string; display_name: string }) => {
  const lat = parseFloat(result.lat)
  const lon = parseFloat(result.lon)
  if (!isNaN(lat) && !isNaN(lon)) {
    updatePinLocation(lat, lon, 16)
    searchQuery.value = result.display_name.split(',').slice(0, 3).join(', ')
    searchResults.value = []
  }
}

// Handler: GPS Geolocation for Direct Buyer
const handleDetectCurrentGps = () => {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    alert('Browser tidak mendukung pendeteksian lokasi GPS.')
    return
  }

  isDetectingGps.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isDetectingGps.value = false
      updatePinLocation(pos.coords.latitude, pos.coords.longitude, 17)
    },
    (err) => {
      isDetectingGps.value = false
      alert('Izin akses lokasi ditolak atau tidak tersedia. Silakan geser pin di peta secara manual.')
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

// Watchers
watch(isTextOnlyFallback, (val) => {
  if (val) {
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
      markerInstance = null
    }
  } else {
    setTimeout(() => {
      setupLeafletMap()
    }, 150)
  }
})

watch(() => props.isOpen, (open) => {
  if (open) {
    initFormValues()
    if (!isTextOnlyFallback.value) {
      setTimeout(() => {
        setupLeafletMap()
      }, 150)
    }
  } else if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }
})

onMounted(() => {
  initFormValues()
  if (!isTextOnlyFallback.value) {
    setupLeafletMap()
  }
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }
})

// Save Form to Pinia Checkout Store
const handleSave = () => {
  validationError.value = ''

  if (isDropship.value) {
    if (!senderName.value.trim()) {
      validationError.value = 'Nama Toko / Pengirim Dropship wajib diisi.'
      return
    }
    if (!senderPhone.value.trim()) {
      validationError.value = 'Nomor HP Toko / Pengirim Dropship wajib diisi.'
      return
    }
  }

  if (!recipientName.value.trim()) {
    validationError.value = 'Nama penerima paket wajib diisi.'
    return
  }
  if (!recipientPhone.value.trim()) {
    validationError.value = 'Nomor WhatsApp penerima wajib diisi.'
    return
  }
  if (!addressDetail.value.trim()) {
    validationError.value = 'Alamat jalan lengkap wajib diisi.'
    return
  }

  // Validasi koordinat jika bukan fallback teks
  if (!isTextOnlyFallback.value && (currentLat.value === null || currentLng.value === null)) {
    validationError.value = 'Silakan tentukan titik pin peta atau centang opsi alamat teks saja.'
    return
  }

  checkoutStore.setIsDropship(isDropship.value)
  if (isDropship.value) {
    checkoutStore.setDropshipSender(senderName.value.trim(), senderPhone.value.trim())
  } else {
    checkoutStore.setDropshipSender('', '')
  }
  checkoutStore.setTextOnlyFallback(isTextOnlyFallback.value)

  checkoutStore.setAddress({
    recipientName: recipientName.value.trim(),
    recipientPhone: recipientPhone.value.trim(),
    street: addressDetail.value.trim(),
    addressDetail: addressDetail.value.trim(),
    benchmark: benchmark.value.trim() || 'Kabupaten Banyuwangi',
    coordinates: isTextOnlyFallback.value
      ? { lat: -8.4328, lng: 114.3361 }
      : { lat: currentLat.value || -8.4328, lng: currentLng.value || 114.3361 },
    latitude: isTextOnlyFallback.value ? null : currentLat.value,
    longitude: isTextOnlyFallback.value ? null : currentLng.value,
    isGpsVerified: !isTextOnlyFallback.value
  })

  emit('save')
  if (props.showAsModal) {
    emit('close')
  }
}
</script>

<template>
  <div class="space-y-4 text-slate-800">
    <!-- Error Feedback -->
    <div v-if="validationError" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
      <span class="material-symbols-outlined text-[18px]">error</span>
      <span class="font-medium">{{ validationError }}</span>
    </div>

    <!-- 1. MODE SELECTION: DIRECT BUYER vs DROPSHIPPER -->
    <div class="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="material-symbols-outlined text-[20px] text-[#103860]">swap_horiz</span>
          <div>
            <div class="text-xs font-bold text-slate-900">Kirim sebagai Dropshipper?</div>
            <div class="text-[11px] text-slate-500">Kirim langsung ke pelanggan Anda tanpa mencantumkan logo dan harga LBA.</div>
          </div>
        </div>
        <!-- Toggle Switch -->
        <label class="relative inline-flex items-center cursor-pointer select-none">
          <input type="checkbox" v-model="isDropship" class="sr-only peer">
          <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#103860]"></div>
        </label>
      </div>

      <!-- Mode Dropshipper Specific Inputs -->
      <div v-if="isDropship" class="pt-3 border-t border-slate-200/80 space-y-3 animate-in fade-in duration-150">
        <div class="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start space-x-2">
          <span class="material-symbols-outlined text-[16px] text-amber-700 mt-0.5">verified_user</span>
          <div>
            <strong>Mode Dropship Aktif:</strong> Seluruh nominal harga ikan dan nota tagihan akan disembunyikan pada resi fisik. Nama toko Anda akan dicantumkan sebagai pengirim.
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1">Nama Toko Pengirim (Dropshipper) *</label>
            <input
              type="text"
              v-model="senderName"
              placeholder="Contoh: Toko Berkah Frozen Food"
              class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#103860]"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1">Nomor WhatsApp Pengirim *</label>
            <input
              type="text"
              v-model="senderPhone"
              placeholder="0812-xxxx-xxxx"
              class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#103860]"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 2. DATA PENERIMA PAKET -->
    <div class="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-3">
      <div class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
        <span class="material-symbols-outlined text-[16px] text-[#103860]">person_pin</span>
        <span>Data Penerima Ikan Segar</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">Nama Penerima *</label>
          <input
            type="text"
            v-model="recipientName"
            placeholder="Contoh: Ibu Hj. Nurul"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#103860]"
          />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">Nomor WhatsApp Penerima *</label>
          <input
            type="text"
            v-model="recipientPhone"
            placeholder="08xxxxxxxxxx"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#103860]"
          />
        </div>
      </div>

      <div>
        <label class="block text-[11px] font-bold text-slate-700 mb-1">Alamat Lengkap (Jalan, RT/RW, No. Rumah) *</label>
        <textarea
          rows="2"
          v-model="addressDetail"
          placeholder="Contoh: Jl. Ikan Gurami No. 12, RT 03 / RW 02, Muncar, Banyuwangi"
          class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#103860] resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-[11px] font-bold text-slate-700 mb-1">Patokan Lokasi Kurir (Opsional)</label>
        <input
          type="text"
          v-model="benchmark"
          placeholder="Contoh: Seberang musholla, pagar warna hijau"
          class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#103860]"
        />
      </div>
    </div>

    <!-- 3. PEMETAAN KOORDINAT & LEAFLET MAP -->
    <div class="p-3.5 bg-white border border-slate-200/90 rounded-2xl space-y-3">
      <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2">
        <div class="flex items-center space-x-1.5">
          <span class="material-symbols-outlined text-[18px] text-[#103860]">pin_drop</span>
          <span class="text-xs font-bold text-slate-900 uppercase tracking-wide">Titik Lokasi Navigasi Kurir</span>
        </div>

        <!-- Tombol GPS Geolocation (Hanya untuk Direct Buyer) -->
        <button
          v-if="!isDropship && !isTextOnlyFallback"
          type="button"
          @click="handleDetectCurrentGps"
          :disabled="isDetectingGps"
          class="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#103860] border border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-[14px]" :class="{ 'animate-spin': isDetectingGps }">my_location</span>
          <span>{{ isDetectingGps ? 'Mencari Lokasi...' : '📍 Gunakan Lokasi GPS Saya' }}</span>
        </button>
      </div>

      <!-- Dropshipper Shareloc URL Resolver Input -->
      <div v-if="isDropship && !isTextOnlyFallback" class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
        <label class="block text-[11px] font-bold text-[#103860]">
          Tempel Link Google Maps / Shareloc dari Pembeli (Opsional):
        </label>
        <div class="flex items-center space-x-2">
          <input
            type="text"
            v-model="sharelocUrl"
            placeholder="https://maps.app.goo.gl/... atau link rute"
            class="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#103860]"
            @keydown.enter.prevent="handleResolveGmapsLink"
          />
          <button
            type="button"
            @click="handleResolveGmapsLink"
            :disabled="isResolvingLink || !sharelocUrl.trim()"
            class="px-3.5 py-1.5 bg-[#103860] hover:bg-[#13446E] text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50 shrink-0 flex items-center space-x-1"
          >
            <span class="material-symbols-outlined text-[14px]" :class="{ 'animate-spin': isResolvingLink }">
              {{ isResolvingLink ? 'sync' : 'search' }}
            </span>
            <span>Kunci Titik</span>
          </button>
        </div>
        <div v-if="sharelocFeedback" class="text-[11px]" :class="sharelocFeedback.type === 'success' ? 'text-emerald-700 font-semibold' : 'text-rose-600'">
          {{ sharelocFeedback.message }}
        </div>
      </div>

      <!-- Free Nominatim Location Search Bar -->
      <div v-if="!isTextOnlyFallback" class="relative">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            @input="handleSearchLocationInput"
            placeholder="Cari kelurahan, kecamatan, jalan, atau gedung di Banyuwangi..."
            class="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#103860]"
          />
          <span class="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">search</span>
          <span v-if="isSearching" class="material-symbols-outlined absolute right-2.5 top-2.5 text-[#103860] text-[18px] animate-spin">sync</span>
        </div>

        <!-- Search Results Dropdown -->
        <div v-if="searchResults.length > 0" class="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          <button
            type="button"
            v-for="(item, idx) in searchResults"
            :key="idx"
            @click="handleSelectSearchResult(item)"
            class="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-slate-100 last:border-0 flex items-start space-x-2 transition"
          >
            <span class="material-symbols-outlined text-slate-400 text-[16px] mt-0.5 shrink-0">location_on</span>
            <span class="text-slate-700 line-clamp-2">{{ item.display_name }}</span>
          </button>
        </div>
      </div>

      <!-- Interactive Leaflet Map Box -->
      <div v-if="!isTextOnlyFallback" class="space-y-2">
        <ClientOnly>
          <div
            ref="mapContainer"
            class="w-full overflow-hidden border shadow-inner h-56 sm:h-64 rounded-xl border-slate-200 bg-slate-100"
          ></div>
        </ClientOnly>

        <div class="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
          <div class="flex items-center space-x-1.5 text-emerald-700 font-semibold">
            <span class="material-symbols-outlined text-[15px] text-[#059669]">verified</span>
            <span>Pin Peta Terkunci</span>
          </div>
          <div class="font-mono text-slate-600 text-[11px]">
            {{ currentLat ? currentLat.toFixed(5) : '-' }}, {{ currentLng ? currentLng.toFixed(5) : '-' }}
          </div>
        </div>
      </div>

      <!-- Text Only Fallback Checkbox (Especially for Dropshippers) -->
      <div class="pt-2 border-t border-slate-100">
        <label class="inline-flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="isTextOnlyFallback"
            class="rounded border-slate-300 text-[#103860] focus:ring-[#103860]"
          />
          <span class="text-xs text-slate-600">
            Saya tidak tahu titik koordinat rumah pembeli (Gunakan alamat teks saja)
          </span>
        </label>
        <p v-if="isTextOnlyFallback" class="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
          Kurir akan menggunakan rute penelusuran nama jalan dan wilayah administratif. Pastikan rincian alamat ditulis selengkap mungkin.
        </p>
      </div>
    </div>

    <!-- Action Save Button -->
    <div class="flex items-center justify-end space-x-2 pt-2">
      <button
        v-if="showAsModal"
        type="button"
        @click="emit('close')"
        class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
      >
        Batal
      </button>
      <button
        type="button"
        @click="handleSave"
        class="w-full sm:w-auto px-6 py-2.5 bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-1.5"
      >
        <span class="material-symbols-outlined text-[16px]">check</span>
        <span>Simpan & Terapkan Alamat</span>
      </button>
    </div>
  </div>
</template>

<style>
.lba-gps-pin {
  background: transparent !important;
  border: none !important;
}
</style>

