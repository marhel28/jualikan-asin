<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore, type UserAddress } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  isOpen: boolean
  initialData?: UserAddress | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', address: UserAddress): void
}>()

const authStore = useAuthStore()
const api = useApi()

// Form states
const isEditing = computed(() => !!props.initialData?.id)
const isMaxReached = computed(() => !isEditing.value && (authStore.user?.addresses?.length || 0) >= 3)
const formLabel = ref('Rumah')
const customLabel = ref('')
const formRecipientName = ref('')
const formRecipientPhone = ref('')
const formStreet = ref('')
const formBenchmark = ref('')
const formIsDefault = ref(false)

// Region states
const provinsiList = ref<Array<{ kode: string; nama: string }>>([])
const kabupatenList = ref<Array<{ kode: string; nama: string }>>([])
const kecamatanList = ref<Array<{ kode: string; nama: string }>>([])
const desaList = ref<Array<{ kode: string; nama: string }>>([])

const selectedProvinsi = ref('35')
const selectedKabupaten = ref('35.10')
const selectedKecamatan = ref('35.10.10')
const selectedDesa = ref('35.10.10.2001')

// Map & GPS states
const currentLat = ref(-8.4328)
const currentLng = ref(114.3361)
const isDetectingGps = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const mapContainer = ref<HTMLElement | null>(null)
let mapInstance: any = null
let markerInstance: any = null

const labelOptions = ['Rumah', 'Kantor', 'Apartemen', 'Dapur Kuliner', 'Lainnya']

// Pre-fill form on open
watch(() => props.isOpen, async (open) => {
  if (open) {
    errorMessage.value = ''
    await loadProvinsi()

    if (props.initialData) {
      const data = props.initialData
      if (labelOptions.includes(data.label)) {
        formLabel.value = data.label
        customLabel.value = ''
      } else {
        formLabel.value = 'Lainnya'
        customLabel.value = data.label
      }
      formRecipientName.value = data.recipientName || ''
      formRecipientPhone.value = data.recipientPhone || ''
      formStreet.value = data.street || ''
      formBenchmark.value = data.benchmark || ''
      formIsDefault.value = Boolean(data.isDefault)

      if (data.provinsiKode) {
        selectedProvinsi.value = data.provinsiKode
        await loadKabupaten(data.provinsiKode)
      }
      if (data.kabupatenKode) {
        selectedKabupaten.value = data.kabupatenKode
        await loadKecamatan(data.kabupatenKode)
      }
      if (data.kecamatanKode) {
        selectedKecamatan.value = data.kecamatanKode
        await loadDesa(data.kecamatanKode)
      }
      if (data.desaKode) {
        selectedDesa.value = data.desaKode
      }
    } else {
      // New Address Mode
      formLabel.value = 'Rumah'
      customLabel.value = ''
      formRecipientName.value = authStore.user?.fullName || ''
      formRecipientPhone.value = authStore.user?.phoneWhatsApp || ''
      formStreet.value = ''
      formBenchmark.value = ''
      formIsDefault.value = (authStore.user?.addresses?.length || 0) === 0

      // Default Banyuwangi / Muncar
      selectedProvinsi.value = '35'
      await loadKabupaten('35')
      selectedKabupaten.value = '35.10'
      await loadKecamatan('35.10')
      selectedKecamatan.value = '35.10.10'
      await loadDesa('35.10.10')
      selectedDesa.value = '35.10.10.2001'
    }

    setTimeout(() => {
      setupLeafletMap()
    }, 150)
  } else {
    destroyMap()
  }
})

// Wilayah loaders
const loadProvinsi = async () => {
  try {
    const res = await api.get<any[]>('/wilayah/provinsi')
    provinsiList.value = res || []
  } catch {}
}

const loadKabupaten = async (provKode: string) => {
  if (!provKode) return
  try {
    const res = await api.get<any[]>(`/wilayah/${provKode}/children`)
    kabupatenList.value = res || []
  } catch {}
}

const loadKecamatan = async (kabKode: string) => {
  if (!kabKode) return
  try {
    const res = await api.get<any[]>(`/wilayah/${kabKode}/children`)
    kecamatanList.value = res || []
  } catch {}
}

const loadDesa = async (kecKode: string) => {
  if (!kecKode) return
  try {
    const res = await api.get<any[]>(`/wilayah/${kecKode}/children`)
    desaList.value = res || []
  } catch {}
}

// Watchers for cascading selects
watch(selectedProvinsi, async (newVal) => {
  if (newVal) {
    await loadKabupaten(newVal)
    if (kabupatenList.value.length > 0 && !kabupatenList.value.some(k => k.kode === selectedKabupaten.value)) {
      selectedKabupaten.value = kabupatenList.value[0].kode
    }
  }
})

watch(selectedKabupaten, async (newVal) => {
  if (newVal) {
    await loadKecamatan(newVal)
    if (kecamatanList.value.length > 0 && !kecamatanList.value.some(k => k.kode === selectedKecamatan.value)) {
      selectedKecamatan.value = kecamatanList.value[0].kode
    }
  }
})

watch(selectedKecamatan, async (newVal) => {
  if (newVal) {
    await loadDesa(newVal)
    if (desaList.value.length > 0 && !desaList.value.some(d => d.kode === selectedDesa.value)) {
      selectedDesa.value = desaList.value[0].kode
    }
  }
})

// Leaflet map setup
const destroyMap = () => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
  }
}

const setupLeafletMap = async () => {
  if (typeof window === 'undefined') return
  await nextTick()
  if (!mapContainer.value) return

  const L = await import('leaflet')
  destroyMap()

  const pinIcon = L.divIcon({
    className: 'lba-gps-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
        <div style="background-color:#103860; color:#FFFFFF; padding:2px 8px; border-radius:9999px; font-size:10px; font-weight:700; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.25); border:1px solid #ffffff; margin-bottom:2px;">
          Titik Rantai Dingin
        </div>
        <svg width="32" height="40" viewBox="0 0 24 24" fill="#103860" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="#FFFFFF" stroke-width="1.2"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40]
  })

  mapInstance = L.map(mapContainer.value, {
    center: [currentLat.value, currentLng.value],
    zoom: 15,
    zoomControl: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap kontributor'
  }).addTo(mapInstance)

  markerInstance = L.marker([currentLat.value, currentLng.value], {
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
    if (mapInstance) mapInstance.invalidateSize()
  }, 200)
}

const handleDetectGps = () => {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    alert('Peramban Anda tidak mendukung sensor GPS.')
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
    () => {
      isDetectingGps.value = false
      alert('Izin akses lokasi tidak diberikan. Anda tetap dapat menggeser pin peta secara manual.')
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const handleSubmit = async () => {
  if (isMaxReached.value) {
    errorMessage.value = 'Batas maksimal 3 alamat telah tercapai. Ubah atau hapus salah satu alamat terlebih dahulu.'
    return
  }
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

  const finalLabel = formLabel.value === 'Lainnya' ? (customLabel.value.trim() || 'Alamat') : formLabel.value
  const provObj = provinsiList.value.find(p => p.kode === selectedProvinsi.value)
  const kabObj = kabupatenList.value.find(k => k.kode === selectedKabupaten.value)
  const kecObj = kecamatanList.value.find(k => k.kode === selectedKecamatan.value)
  const desaObj = desaList.value.find(d => d.kode === selectedDesa.value)

  errorMessage.value = ''
  isSubmitting.value = true

  const payloadData = {
    label: finalLabel,
    recipientName: formRecipientName.value.trim(),
    recipientPhone: formRecipientPhone.value.trim(),
    street: formStreet.value.trim(),
    benchmark: formBenchmark.value.trim() || 'Banyuwangi',
    isGpsVerified: true,
    isDefault: formIsDefault.value,
    provinsiKode: selectedProvinsi.value,
    kabupatenKode: selectedKabupaten.value,
    kecamatanKode: selectedKecamatan.value,
    desaKode: selectedDesa.value,
    provinsiNama: provObj?.nama || 'JAWA TIMUR',
    kabupatenNama: kabObj?.nama || 'KABUPATEN BANYUWANGI',
    kecamatanNama: kecObj?.nama || 'Muncar',
    desaNama: desaObj?.nama || 'Tembokrejo',
  }

  try {
    let resultAddress: UserAddress | null = null
    if (isEditing.value && props.initialData?.id) {
      await authStore.updateAddress(props.initialData.id, payloadData)
      resultAddress = {
        ...props.initialData,
        ...payloadData
      }
    } else {
      resultAddress = await authStore.addAddress(payloadData)
    }

    if (resultAddress) {
      emit('saved', resultAddress)
      emit('close')
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Gagal menyimpan alamat. Silakan periksa koneksi.'
  } finally {
    isSubmitting.value = false
  }
}

onUnmounted(() => {
  destroyMap()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      @click.self="emit('close')"
    >
      <div
        class="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
      >
        <!-- Modal Header -->
        <div class="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-[20px] text-[#103860]">
              {{ isEditing ? 'edit_location_alt' : 'add_location_alt' }}
            </span>
            <div>
              <h2 class="text-xs font-bold leading-tight sm:text-sm text-slate-900">
                {{ isEditing ? 'Ubah Alamat Pengiriman' : 'Tambah Alamat Pengiriman Baru' }}
              </h2>
              <p class="text-[11px] text-slate-500">
                Lengkapi rincian alamat dan tentukan titik kurir pada peta rantai dingin
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="inline-flex items-center justify-center transition rounded-lg cursor-pointer h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            title="Tutup Form"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Form Body (Scrollable) -->
        <form @submit.prevent="handleSubmit" class="p-4 space-y-4 overflow-y-auto flex-1">
          <!-- Max 3 Warning -->
          <div v-if="isMaxReached" class="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center space-x-1.5">
            <span class="material-symbols-outlined text-[16px] text-amber-600">info</span>
            <span>Batas kuota maksimal 3 alamat tercapai. Silakan ubah atau hapus alamat yang ada terlebih dahulu.</span>
          </div>

          <!-- Error Notification -->
          <div v-if="errorMessage" class="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-1.5">
            <span class="material-symbols-outlined text-[16px]">error</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- 1. Label Alamat (Tokopedia-Style Pills) -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
              Label Alamat
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="lbl in labelOptions"
                :key="lbl"
                type="button"
                @click="formLabel = lbl"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border"
                :class="[
                  formLabel === lbl
                    ? 'bg-[#103860] text-white border-[#103860] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                ]"
              >
                {{ lbl }}
              </button>
            </div>
            <div v-if="formLabel === 'Lainnya'" class="pt-1">
              <input
                v-model="customLabel"
                type="text"
                placeholder="Contoh: Rumah Nenek, Kantor Cabang..."
                class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#103860] focus:ring-1 focus:ring-[#103860]/20"
              />
            </div>
          </div>

          <!-- 2. Penerima & WhatsApp -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-700 block">
                Nama Penerima <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="formRecipientName"
                type="text"
                placeholder="Nama lengkap penerima"
                required
                class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#103860] focus:ring-1 focus:ring-[#103860]/20"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-700 block">
                Nomor WhatsApp <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="formRecipientPhone"
                type="tel"
                placeholder="081234567890"
                required
                class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#103860] focus:ring-1 focus:ring-[#103860]/20 font-mono"
              />
            </div>
          </div>

          <!-- 3. Regional Cascader (/wilayah API) -->
          <div class="space-y-2 pt-1 border-t border-slate-100">
            <label class="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
              Wilayah Pengiriman
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <!-- Provinsi -->
              <div>
                <label class="text-[10px] text-slate-500 font-semibold block mb-0.5">Provinsi</label>
                <select
                  v-model="selectedProvinsi"
                  class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-[#103860]"
                >
                  <option v-for="p in provinsiList" :key="p.kode" :value="p.kode">{{ p.nama }}</option>
                </select>
              </div>

              <!-- Kabupaten / Kota -->
              <div>
                <label class="text-[10px] text-slate-500 font-semibold block mb-0.5">Kota / Kabupaten</label>
                <select
                  v-model="selectedKabupaten"
                  class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-[#103860]"
                >
                  <option v-for="k in kabupatenList" :key="k.kode" :value="k.kode">{{ k.nama }}</option>
                </select>
              </div>

              <!-- Kecamatan -->
              <div>
                <label class="text-[10px] text-slate-500 font-semibold block mb-0.5">Kecamatan</label>
                <select
                  v-model="selectedKecamatan"
                  class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-[#103860]"
                >
                  <option v-for="k in kecamatanList" :key="k.kode" :value="k.kode">{{ k.nama }}</option>
                </select>
              </div>

              <!-- Desa / Kelurahan -->
              <div>
                <label class="text-[10px] text-slate-500 font-semibold block mb-0.5">Desa / Kelurahan</label>
                <select
                  v-model="selectedDesa"
                  class="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-[#103860]"
                >
                  <option v-for="d in desaList" :key="d.kode" :value="d.kode">{{ d.nama }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 4. Alamat Jalan Lengkap & Patokan -->
          <div class="space-y-3 pt-1 border-t border-slate-100">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-700 block">
                Alamat Lengkap Jalan / Kompleks / RT RW <span class="text-rose-500">*</span>
              </label>
              <textarea
                v-model="formStreet"
                rows="2"
                placeholder="Nama jalan, nomor rumah, RT/RW, nomor gang/blok..."
                required
                class="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none focus:border-[#103860] focus:ring-1 focus:ring-[#103860]/20 resize-none"
              ></textarea>
            </div>

            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-700 block">
                Catatan Patokan untuk Kurir Rantai Dingin
              </label>
              <input
                v-model="formBenchmark"
                type="text"
                placeholder="Contoh: Pagar kayu putih seberang minimarket"
                class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#103860] focus:ring-1 focus:ring-[#103860]/20"
              />
            </div>
          </div>

          <!-- 5. Interactive Leaflet Map Box -->
          <div class="space-y-1.5 pt-1 border-t border-slate-100">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px] text-[#103860]">pin_drop</span>
                Pin Titik Pengantaran Peta
              </label>

              <!-- Geolocation Button -->
              <button
                type="button"
                @click="handleDetectGps"
                :disabled="isDetectingGps"
                class="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#103860] border border-blue-200 rounded-md text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-[14px]" :class="{ 'animate-spin': isDetectingGps }">
                  {{ isDetectingGps ? 'sync' : 'my_location' }}
                </span>
                <span>{{ isDetectingGps ? 'Mendeteksi...' : 'Lokasi Saat Ini' }}</span>
              </button>
            </div>

            <!-- Leaflet Container -->
            <div
              ref="mapContainer"
              class="w-full h-44 rounded-xl border border-slate-200 overflow-hidden shadow-inner relative z-0"
            ></div>

            <p class="text-[10px] text-slate-500">
              Geser pin merah maritim di peta agar kurir LBA tepat tiba di depan pintu atau gerbang Anda.
            </p>
          </div>

          <!-- 6. Checkbox Jadikan Utama -->
          <div class="pt-1 border-t border-slate-100">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                v-model="formIsDefault"
                type="checkbox"
                class="w-4 h-4 rounded text-[#103860] focus:ring-[#103860] border-slate-300"
              />
              <span class="text-xs font-semibold text-slate-700">Jadikan Alamat Utama</span>
            </label>
          </div>

          <!-- Submit Buttons -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || isMaxReached"
              class="px-5 py-2 text-xs font-bold text-white bg-[#103860] hover:bg-[#13446E] rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span v-if="isSubmitting" class="material-symbols-outlined text-[15px] animate-spin">sync</span>
              <span>{{ isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan Alamat Baru') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

