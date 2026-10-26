<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useCheckoutStore } from '~/stores/checkout'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

const checkoutStore = useCheckoutStore()

// Form states
const formRecipientName = ref('')
const formRecipientPhone = ref('')
const formStreet = ref('')
const formBenchmark = ref('')
const currentLat = ref(-8.4328)
const currentLng = ref(114.3361)
const isDetectingGps = ref(false)
const errorMessage = ref('')

const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: any = null
let markerInstance: any = null

// Initialize or update form values from checkoutStore
const initFormValues = () => {
  const addr = checkoutStore.address
  formRecipientName.value = addr.recipientName || ''
  formRecipientPhone.value = addr.recipientPhone || ''
  formStreet.value = addr.street || ''
  formBenchmark.value = addr.benchmark || ''
  currentLat.value = addr.coordinates?.lat || -8.4328
  currentLng.value = addr.coordinates?.lng || 114.3361
}

const setupLeafletMap = async () => {
  if (typeof window === 'undefined') return
  await nextTick()

  if (!mapContainer.value) return

  // Dynamically import Leaflet to avoid SSR issues
  const L = await import('leaflet')

  // Destroy previous map instance if exists
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }

  // Create clean custom pin SVG icon in Navy #103860
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

  // Initialize Leaflet Map
  mapInstance = L.map(mapContainer.value, {
    center: [currentLat.value, currentLng.value],
    zoom: 15,
    zoomControl: true
  })

  // Add high-resolution crisp OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap kontributor'
  }).addTo(mapInstance)

  // Add draggable pin marker
  markerInstance = L.marker([currentLat.value, currentLng.value], {
    draggable: true,
    icon: pinIcon
  }).addTo(mapInstance)

  // Update lat/lng on drag end
  markerInstance.on('dragend', () => {
    const pos = markerInstance.getLatLng()
    currentLat.value = Number(pos.lat.toFixed(6))
    currentLng.value = Number(pos.lng.toFixed(6))
  })

  // Also allow clicking on map to reposition pin
  mapInstance.on('click', (e: any) => {
    markerInstance.setLatLng(e.latlng)
    currentLat.value = Number(e.latlng.lat.toFixed(6))
    currentLng.value = Number(e.latlng.lng.toFixed(6))
  })

  // Ensure map tiles calculate correct layout dimensions
  setTimeout(() => {
    if (mapInstance) {
      mapInstance.invalidateSize()
    }
  }, 250)
}

// Watch modal open to init form and map
watch(() => props.isOpen, (open) => {
  if (open) {
    initFormValues()
    setTimeout(() => {
      setupLeafletMap()
    }, 100)
  } else {
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
      markerInstance = null
    }
  }
})

// Trigger browser GPS geolocation
const handleDetectCurrentGps = () => {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    alert('Browser tidak mendukung pendeteksian lokasi GPS.')
    return
  }

  isDetectingGps.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isDetectingGps.value = false
      const lat = Number(pos.coords.latitude.toFixed(6))
      const lng = Number(pos.coords.longitude.toFixed(6))
      currentLat.value = lat
      currentLng.value = lng

      if (mapInstance && markerInstance) {
        mapInstance.setView([lat, lng], 17)
        markerInstance.setLatLng([lat, lng])
      }
    },
    (err) => {
      isDetectingGps.value = false
      alert('Izin akses lokasi ditolak atau tidak tersedia. Silakan geser pin di peta secara manual.')
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const handleSaveAddress = () => {
  if (!formRecipientName.value.trim()) {
    errorMessage.value = 'Nama penerima wajib diisi.'
    return
  }
  if (!formRecipientPhone.value.trim()) {
    errorMessage.value = 'Nomor WhatsApp wajib diisi.'
    return
  }
  if (!formStreet.value.trim()) {
    errorMessage.value = 'Alamat jalan lengkap wajib diisi.'
    return
  }

  errorMessage.value = ''
  checkoutStore.setAddress({
    recipientName: formRecipientName.value.trim(),
    recipientPhone: formRecipientPhone.value.trim(),
    street: formStreet.value.trim(),
    benchmark: formBenchmark.value.trim() || 'Banyuwangi',
    coordinates: {
      lat: currentLat.value,
      lng: currentLng.value
    },
    isGpsVerified: true
  })

  emit('save')
  emit('close')
}

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      @click.self="emit('close')">
      <div
        class="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        <!-- Modal Header -->
        <div class="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-[20px] text-[#103860]">edit_location_alt</span>
            <div>
              <h2 class="text-xs font-bold leading-tight sm:text-sm text-slate-900">Atur Alamat & Pin Lokasi GPS</h2>
              <p class="text-[11px] text-slate-500">Tentukan alamat penerima dan geser pin peta tepat di depan
                rumah/gerbang Anda.</p>
            </div>
          </div>
          <button type="button" @click="emit('close')"
            class="inline-flex items-center justify-center transition rounded-lg cursor-pointer h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-4 space-y-3.5 overflow-y-auto flex-1">
          <div v-if="errorMessage"
            class="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-1.5">
            <span class="material-symbols-outlined text-[16px]">error</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- 1. Interactive Leaflet Map Box -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-[#103860]">map</span>
                Titik Presisi Peta (Geser Pin)
              </label>

              <!-- Tombol GPS Geolocation -->
              <button type="button" @click="handleDetectCurrentGps" :disabled="isDetectingGps"
                class="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#103860] border border-blue-200 rounded-md text-[11px] font-semibold transition cursor-pointer disabled:opacity-50">
                <span class="material-symbols-outlined text-[14px]" :class="{ 'animate-spin': isDetectingGps }">
                  my_location
                </span>
                <span>{{ isDetectingGps ? 'Mencari Sinyal...' : 'Gunakan Lokasi GPS Saya' }}</span>
              </button>
            </div>

            <!-- Map Container -->
            <ClientOnly>
              <div ref="mapContainer"
                class="w-full overflow-hidden border shadow-inner h-52 sm:h-60 rounded-xl border-slate-200 bg-slate-100">
              </div>
            </ClientOnly>

            <!-- Coordinates Status Bar -->
            <div
              class="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px]">
              <div class="flex items-center space-x-1 text-[#059669] font-semibold">
                <span class="material-symbols-outlined text-[14px]">verified</span>
                <span>GPS Terverifikasi</span>
              </div>
              <div class="font-mono text-slate-600 text-[10px]">
                Lat: {{ currentLat.toFixed(5) }}, Lng: {{ currentLng.toFixed(5) }}
              </div>
            </div>
          </div>

          <!-- 2. Penerima & Kontak Form -->
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Nama Penerima</label>
              <input type="text" v-model="formRecipientName" placeholder="Contoh: Ibu Ratna Dewi"
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#103860]" />
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif</label>
              <input type="text" v-model="formRecipientPhone" placeholder="0812-3456-7890"
                class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#103860]" />
            </div>
          </div>

          <!-- 3. Detail Alamat Jalan -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Alamat Jalan, RT/RW, No. Rumah</label>
            <textarea rows="2" v-model="formStreet"
              placeholder="Contoh: Jl. Basuki Rahmat No. 42, RT 02 / RW 01, Banyuwangi Kota"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#103860] resize-none"></textarea>
          </div>

          <!-- 4. Patokan Lokasi (Benchmark) -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">Patokan Lokasi Kurir (Opsional)</label>
            <input type="text" v-model="formBenchmark"
              placeholder="Contoh: Seberang Bank BCA, pagar hitam rumah tingkat 2"
              class="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#103860]" />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-3.5 sm:p-4 border-t border-slate-100 flex items-center justify-end space-x-2 bg-slate-50/50">
          <button type="button" @click="emit('close')"
            class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer">
            Batal
          </button>
          <button type="button" @click="handleSaveAddress"
            class="px-5 py-2 bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold rounded-lg shadow-md transition cursor-pointer flex items-center space-x-1.5">
            <span class="material-symbols-outlined text-[16px]">check</span>
            <span>Gunakan Alamat Ini</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
/* Leaflet custom pin style fix */
.lba-gps-pin {
  background: transparent !important;
  border: none !important;
}
</style>
