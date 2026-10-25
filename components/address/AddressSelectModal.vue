<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore, type UserAddress } from '~/stores/auth'
import { useCheckoutStore } from '~/stores/checkout'

const props = defineProps<{
  isOpen: boolean
  selectedId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', address: UserAddress): void
  (e: 'add-new'): void
  (e: 'edit', address: UserAddress): void
}>()

const authStore = useAuthStore()
const checkoutStore = useCheckoutStore()

const isBanyuwangi = (addr: UserAddress): boolean => {
  if (!addr) return false
  const kab = (addr.kabupatenNama || '').toLowerCase()
  const kec = (addr.kecamatanNama || '').toLowerCase()
  const street = (addr.street || '').toLowerCase()
  const kode = String(addr.kabupatenKode || '')
  return kab.includes('banyuwangi') || kec.includes('muncar') || street.includes('banyuwangi') || kode === '35.10'
}
const searchQuery = ref('')
const isLoading = ref(false)

// Refresh addresses on open
watch(() => props.isOpen, async (open) => {
  if (open) {
    searchQuery.value = ''
    if (authStore.isAuthenticated) {
      isLoading.value = true
      try {
        await authStore.fetchAddresses()
      } finally {
        isLoading.value = false
      }
    }
  }
})

const addressList = computed<UserAddress[]>(() => {
  return authStore.user?.addresses || []
})

// Instant live search across all address fields
const filteredAddresses = computed<UserAddress[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return addressList.value

  return addressList.value.filter((addr) => {
    const labelMatch = (addr.label || '').toLowerCase().includes(query)
    const nameMatch = (addr.recipientName || '').toLowerCase().includes(query)
    const phoneMatch = (addr.recipientPhone || '').toLowerCase().includes(query)
    const streetMatch = (addr.street || '').toLowerCase().includes(query)
    const benchmarkMatch = (addr.benchmark || '').toLowerCase().includes(query)
    const kecMatch = (addr.kecamatanNama || '').toLowerCase().includes(query)
    const kabMatch = (addr.kabupatenNama || '').toLowerCase().includes(query)
    const desaMatch = (addr.desaNama || '').toLowerCase().includes(query)
    return labelMatch || nameMatch || phoneMatch || streetMatch || benchmarkMatch || kecMatch || kabMatch || desaMatch
  })
})

const handleSelect = (addr: UserAddress) => {
  emit('select', addr)
  emit('close')
}

const handleEdit = (addr: UserAddress) => {
  emit('edit', addr)
}

const handleAddNew = () => {
  emit('add-new')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      @click.self="emit('close')"
    >
      <div
        class="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        <!-- Modal Header -->
        <div class="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div class="flex items-center space-x-2">
            <span class="material-symbols-outlined text-[22px] text-[#103860]">location_on</span>
            <div>
              <h2 class="text-xs font-bold leading-tight sm:text-sm text-slate-900">Pilih Alamat Pengiriman</h2>
              <p class="text-[11px] text-slate-500">Pilih alamat tujuan atau cari dari daftar alamat tersimpan Anda</p>
            </div>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="inline-flex items-center justify-center transition rounded-lg cursor-pointer h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            title="Tutup Modal"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Search & Action Bar (Tokopedia-Style) -->
        <div class="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-2.5 bg-white shrink-0">
          <!-- Search Input -->
          <div class="relative flex-1">
            <div class="flex items-center w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-xs focus-within:border-[#103860] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#103860]/20 transition-all">
              <span class="material-symbols-outlined text-[18px] text-slate-400 mr-2 shrink-0 select-none">
                search
              </span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari jalan, penerima, kecamatan..."
                class="w-full p-0 text-xs font-normal bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 focus:ring-0"
              />
              <button
                v-if="searchQuery"
                type="button"
                @click="searchQuery = ''"
                class="ml-1 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-200/50 transition-colors"
                title="Hapus pencarian"
              >
                <span class="material-symbols-outlined text-[15px]">close</span>
              </button>
            </div>
          </div>

          <!-- Add Address Button (Enforce Max 3 Limit) -->
          <button
            type="button"
            @click="handleAddNew"
            :disabled="addressList.length >= 3"
            class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0"
            :class="[
              addressList.length >= 3
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-75'
                : 'bg-blue-50/60 hover:bg-blue-100/70 text-[#103860] border border-[#103860]/20 cursor-pointer'
            ]"
            :title="addressList.length >= 3 ? 'Batas maksimal 3 alamat tersimpan tercapai' : 'Tambah Alamat Baru'"
          >
            <span class="material-symbols-outlined text-[17px]">
              {{ addressList.length >= 3 ? 'lock' : 'add_location_alt' }}
            </span>
            <span>{{ addressList.length >= 3 ? 'Maksimal 3 Alamat' : 'Tambah Alamat Baru' }}</span>
          </button>
        </div>

        <!-- Scrollable Address List Container -->
        <div class="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1 divide-y divide-slate-100">
          <!-- Loading State -->
          <div v-if="isLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 animate-pulse space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-16 h-4 bg-slate-200 rounded"></div>
                <div class="w-12 h-4 bg-slate-200 rounded"></div>
              </div>
              <div class="w-32 h-3.5 bg-slate-200 rounded"></div>
              <div class="w-full h-3 bg-slate-200 rounded"></div>
            </div>
          </div>

          <!-- Empty State: No search results -->
          <div
            v-else-if="filteredAddresses.length === 0"
            class="flex flex-col items-center justify-center py-10 px-4 text-center"
          >
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
              <span class="material-symbols-outlined text-[24px]">location_off</span>
            </div>
            <h4 class="text-xs font-bold text-slate-800">
              {{ searchQuery ? 'Alamat Tidak Ditemukan' : 'Belum Ada Alamat Tersimpan' }}
            </h4>
            <p class="text-[11px] text-slate-500 mt-1 max-w-xs">
              {{ searchQuery ? `Tidak ada alamat yang cocok dengan kata kunci "${searchQuery}".` : 'Tambahkan alamat pengiriman pertama Anda untuk pengantaran rantai dingin.' }}
            </p>
            <div class="flex items-center gap-2 mt-4">
              <button
                v-if="searchQuery"
                type="button"
                @click="searchQuery = ''"
                class="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition cursor-pointer"
              >
                Reset Pencarian
              </button>
              <button
                type="button"
                @click="handleAddNew"
                class="px-3 py-1.5 text-xs font-semibold text-white bg-[#103860] hover:bg-[#13446E] rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span class="material-symbols-outlined text-[15px]">add</span>
                <span>Tambah Alamat</span>
              </button>
            </div>
          </div>

          <!-- Address Cards -->
          <div
            v-else
            v-for="addr in filteredAddresses"
            :key="addr.id"
            @click="handleSelect(addr)"
            class="pt-3 first:pt-0"
          >
            <div
              class="border rounded-xl p-3.5 sm:p-4 transition-all cursor-pointer relative flex flex-col gap-2"
              :class="[
                selectedId === addr.id
                  ? 'border-[#103860] bg-blue-50/30 ring-1 ring-[#103860]/30 shadow-xs'
                  : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
              ]"
            >
              <!-- Card Top Row: Radio, Label, Default Badge, and Ubah Button -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap min-w-0">
                  <!-- Radio Icon -->
                  <div
                    class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors"
                    :class="selectedId === addr.id ? 'border-[#103860] bg-[#103860]' : 'border-slate-300 bg-white'"
                  >
                    <div v-if="selectedId === addr.id" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>

                  <!-- Label Badge -->
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700 tracking-wide">
                    {{ addr.label || 'Alamat' }}
                  </span>

                  <!-- Utama Badge -->
                  <span
                    v-if="addr.isDefault"
                    class="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-0.5"
                  >
                    <span class="material-symbols-outlined text-[11px] text-[#059669]">check</span>
                    <span>Utama</span>
                  </span>

                  <!-- Out of Banyuwangi Area Badge -->
                  <span
                    v-if="checkoutStore.shippingPolicy.onlyBanyuwangi && !isBanyuwangi(addr)"
                    class="px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-[10px] font-bold inline-flex items-center gap-0.5"
                  >
                    <span class="material-symbols-outlined text-[11px] text-red-600">fmd_bad</span>
                    <span>Luar Banyuwangi</span>
                  </span>

                  <!-- GPS Badge -->
                  <span
                    v-if="addr.isGpsVerified"
                    class="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 inline-flex items-center gap-0.5"
                  >
                    <span class="material-symbols-outlined text-[11px]">verified</span>
                    <span>GPS</span>
                  </span>
                </div>

                <!-- Ubah Button (stops bubbling to avoid immediate selection) -->
                <button
                  type="button"
                  @click.stop="handleEdit(addr)"
                  class="text-xs font-semibold text-[#103860] hover:text-[#13446E] hover:underline px-2 py-1 rounded-md transition cursor-pointer shrink-0"
                >
                  Ubah
                </button>
              </div>

              <!-- Recipient Info -->
              <div class="text-xs text-slate-800 font-bold flex items-center gap-2 mt-0.5">
                <span>{{ addr.recipientName }}</span>
                <span class="text-slate-400 font-normal">|</span>
                <span class="font-mono text-slate-600 font-normal text-[11px]">{{ addr.recipientPhone }}</span>
              </div>

              <!-- Street Address & Administrative Region -->
              <div class="text-xs text-slate-600 leading-relaxed space-y-0.5">
                <p class="font-medium text-slate-700">{{ addr.street }}</p>
                <p v-if="addr.desaNama || addr.kecamatanNama || addr.kabupatenNama" class="text-[11px] text-slate-500">
                  {{ [addr.desaNama, addr.kecamatanNama ? 'Kec. ' + addr.kecamatanNama : null, addr.kabupatenNama, addr.provinsiNama].filter(Boolean).join(', ') }}
                </p>
                <p v-if="addr.benchmark" class="text-[11px] text-slate-400 italic">
                  Patokan: {{ addr.benchmark }}
                </p>
              </div>

              <!-- Action: Pilih Alamat Ini Button -->
              <div class="pt-2 border-t border-slate-100/80 flex items-center justify-between">
                <div class="text-[11px] text-slate-400">
                  <span v-if="selectedId === addr.id" class="text-[#103860] font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    Alamat Dipilih
                  </span>
                  <span v-else class="text-slate-400 text-[10px]">Ketuk untuk memilih alamat ini</span>
                </div>

                <button
                  type="button"
                  @click.stop="handleSelect(addr)"
                  class="px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                  :class="[
                    selectedId === addr.id
                      ? 'bg-[#103860] text-white shadow-xs'
                      : 'bg-white hover:bg-blue-50 text-[#103860] border border-[#103860]/30 hover:border-[#103860]'
                  ]"
                >
                  <span class="material-symbols-outlined text-[15px]">
                    {{ selectedId === addr.id ? 'check' : 'near_me' }}
                  </span>
                  <span>{{ selectedId === addr.id ? 'Terpilih' : 'Pilih Alamat Ini' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-3 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end shrink-0">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

