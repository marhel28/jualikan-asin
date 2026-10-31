<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '~/composables/useLocale'

const route = useRoute()
const { t, isEn } = useLocale()

// State popover chat concierge
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// Sembunyikan floating button di halaman checkout, pembayaran, dan detail produk
const isVisible = computed(() => {
  const path = route.path
  if (path === '/checkout') return false
  if (path.startsWith('/pembayaran')) return false
  if (path.startsWith('/produk/')) return false
  return true
})

// Pesan default kontekstual per halaman
const defaultWaMessage = computed(() => {
  const path = route.path
  if (path === '/katalog') {
    return isEn.value
      ? 'Halo Laut Berkah Abadi, saya sedang melihat katalog dan ingin tanya stok ikan lelang segar hari ini.'
      : 'Halo Laut Berkah Abadi, saya sedang melihat katalog dan ingin tanya stok ikan lelang segar hari ini.'
  }
  return isEn.value
    ? 'Hello Laut Berkah Abadi Muncar, I would like to consult about today fresh fish catch.'
    : 'Halo Laut Berkah Abadi Muncar, saya ingin konsultasi tangkapan ikan segar hari ini.'
})

// Pertanyaan cepat
const quickQueries = computed(() => [
  {
    icon: '🐟',
    label: t('Tangkapan Segar Lelang Hari Ini', "Today's Fresh Auction Catch"),
    desc: t('Cek ikan mendarat pagi di dermaga Muncar', 'Check morning fish landing at Muncar port'),
    message: isEn.value
      ? 'Hello LBA Admin, which fish species just arrived at the dawn auction today?'
      : 'Halo Admin LBA, mau tanya jenis ikan apa saja yang baru mendarat lelang subuh hari ini?'
  },
  {
    icon: '🔪',
    label: t('Konsultasi Potongan & Rendemen', 'Butcher Cut & Yield Guide'),
    desc: t('Fillet murni, steak melintang, atau utuh bersih', 'Clean whole, skinless fillet, or cutlet steak'),
    message: isEn.value
      ? 'Hello LBA Admin, I would like recommendation for fish cut options and clean meat yield.'
      : 'Halo Admin LBA, saya mau tanya rekomendasi potongan fillet/steak dan rendemen bersihnya.'
  },
  {
    icon: '❄️',
    label: t('Rute Kirim & Proteksi Es Gel', 'Cold Chain Delivery & Ice Packs'),
    desc: t('Garansi suhu 0-2 C sampai dapur Anda', '0-2 C temperature guaranteed to your kitchen'),
    message: isEn.value
      ? 'Hello LBA Admin, please check cold-chain delivery availability and shipping fee to my address.'
      : 'Halo Admin LBA, mau cek pengiriman rantai dingin dan ongkos kirim ke alamat saya.'
  }
])

function buildWaUrl(msg: string) {
  return `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`
}

function togglePopover() {
  isOpen.value = !isOpen.value
}

function closePopover() {
  isOpen.value = false
}

// Tutup popover jika user klik di luar atau tekan Escape
function handleDocumentClick(e: MouseEvent) {
  if (isOpen.value && containerRef.value && !containerRef.value.contains(e.target as Node)) {
    closePopover()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    closePopover()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <aside
    v-if="isVisible"
    ref="containerRef"
    :aria-label="t('Layanan Pelanggan WhatsApp', 'WhatsApp Customer Service')"
    class="fixed z-40 right-4 md:right-6 bottom-[4.75rem] md:bottom-6 flex flex-col items-end gap-2.5"
  >
    <!-- Popover Concierge Card (Modern & Delightful UI/UX) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="isOpen"
        class="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden w-[19.5rem] sm:w-[22rem] text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        <!-- Card Header: Navy Maritime -->
        <div class="bg-[#103860] p-4 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-inner tracking-wider">
                LBA
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#103860] rounded-full animate-pulse"></span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold leading-tight tracking-tight">Admin Laut Berkah Abadi</span>
              <span class="text-[10px] text-emerald-300 font-medium">Cold Hub Muncar (06:00 - 21:00 WIB)</span>
            </div>
          </div>
          <button
            type="button"
            @click="closePopover"
            class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-lg leading-none"
            aria-label="Tutup"
          >
            &times;
          </button>
        </div>

        <!-- Card Body -->
        <div class="p-3.5 bg-slate-50/70 flex flex-col gap-2.5">
          <!-- Chat Greeting Bubble -->
          <div class="bg-white p-3 rounded-xl rounded-tl-xs border border-slate-200/80 shadow-2xs text-xs text-slate-700 leading-relaxed">
            <p class="font-medium text-slate-900 mb-0.5">
              {{ t('Halo! Ada yang bisa kami bantu?', 'Hello! How can we assist you?') }} 👋
            </p>
            <p class="text-[11px] text-slate-500">
              {{ t('Konsultasi jenis ikan tangkapan segar, request potongan fillet/steak, atau cek jadwal armada rantai dingin Muncar.', 'Consult fresh catch species, request custom butchering, or check cold-chain schedules.') }}
            </p>
          </div>

          <!-- Quick Topic Chips -->
          <div class="flex flex-col gap-1.5 pt-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              {{ t('Pilihan Pertanyaan Cepat', 'Quick Questions') }}:
            </span>
            
            <a
              v-for="(item, idx) in quickQueries"
              :key="idx"
              :href="buildWaUrl(item.message)"
              target="_blank"
              rel="noopener noreferrer"
              @click="closePopover"
              class="flex items-center gap-2.5 p-2.5 bg-white hover:bg-emerald-50/80 border border-slate-200/90 hover:border-emerald-300 rounded-xl text-left transition-all duration-150 shadow-2xs group cursor-pointer active:scale-[0.99]"
            >
              <span class="text-base shrink-0">{{ item.icon }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-[11px] font-bold text-slate-800 group-hover:text-emerald-800 truncate">
                  {{ item.label }}
                </div>
                <div class="text-[10px] text-slate-500 truncate">
                  {{ item.desc }}
                </div>
              </div>
              <span class="text-slate-300 group-hover:text-emerald-600 text-xs shrink-0">&rarr;</span>
            </a>
          </div>

          <!-- Direct Chat Action -->
          <a
            :href="buildWaUrl(defaultWaMessage)"
            target="_blank"
            rel="noopener noreferrer"
            @click="closePopover"
            class="mt-1 flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <svg class="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.01 2.002c-5.502 0-9.967 4.464-9.967 9.968 0 1.76.46 3.475 1.332 4.989L2 22l5.228-1.371a9.92 9.92 0 0 0 4.782 1.223h.004c5.501 0 9.966-4.465 9.966-9.97 0-2.664-1.037-5.166-2.922-7.054A9.897 9.897 0 0 0 12.01 2.002zm5.82 14.398c-.24.675-1.397 1.29-1.928 1.373-.496.078-1.127.11-3.238-.764-2.698-1.118-4.437-3.864-4.571-4.043-.135-.178-1.089-1.45-1.089-2.766 0-1.316.689-1.961.933-2.228.244-.267.534-.334.712-.334.178 0 .356.002.512.01.167.008.389-.063.609.467.222.534.757 1.848.823 1.982.067.134.112.29.023.468-.09.178-.134.29-.267.445-.134.156-.282.348-.403.468-.134.133-.274.279-.118.547.156.267.693 1.144 1.488 1.852 1.023.912 1.884 1.194 2.152 1.328.267.133.423.111.579-.067.156-.178.668-.779.846-1.046.178-.267.356-.223.6-.134.245.09 1.558.735 1.826.869.267.134.445.2.512.312.067.112.067.646-.173 1.321z"/>
            </svg>
            <span>{{ t('Mulai Chat di WhatsApp', 'Start Chat on WhatsApp') }}</span>
          </a>
        </div>
      </div>
    </Transition>

    <!-- Floating Trigger Button -->
    <button
      type="button"
      @click="togglePopover"
      :class="[
        isOpen
          ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-xl'
          : 'bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46] text-white shadow-[0_4px_20px_rgba(5,150,105,0.35)] hover:shadow-[0_8px_25px_rgba(5,150,105,0.45)]'
      ]"
      class="group flex items-center gap-2.5 p-3 md:px-4 md:py-3 rounded-full border border-white/20 transition-all duration-200 active:scale-95 cursor-pointer select-none"
      :title="t('Konsultasi Produk dan Pesanan via WhatsApp', 'Product & Order Consultation via WhatsApp')"
      :aria-expanded="isOpen"
    >
      <!-- Icon Container (Smooth Morphing between WhatsApp & Close) -->
      <div class="relative flex items-center justify-center shrink-0">
        <!-- Close icon when open -->
        <span v-if="isOpen" class="text-xl font-bold leading-none w-6 h-6 flex items-center justify-center">
          &times;
        </span>
        <!-- WhatsApp Icon when closed -->
        <svg
          v-else
          class="w-6 h-6 fill-white"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12.01 2.002c-5.502 0-9.967 4.464-9.967 9.968 0 1.76.46 3.475 1.332 4.989L2 22l5.228-1.371a9.92 9.92 0 0 0 4.782 1.223h.004c5.501 0 9.966-4.465 9.966-9.97 0-2.664-1.037-5.166-2.922-7.054A9.897 9.897 0 0 0 12.01 2.002zm5.82 14.398c-.24.675-1.397 1.29-1.928 1.373-.496.078-1.127.11-3.238-.764-2.698-1.118-4.437-3.864-4.571-4.043-.135-.178-1.089-1.45-1.089-2.766 0-1.316.689-1.961.933-2.228.244-.267.534-.334.712-.334.178 0 .356.002.512.01.167.008.389-.063.609.467.222.534.757 1.848.823 1.982.067.134.112.29.023.468-.09.178-.134.29-.267.445-.134.156-.282.348-.403.468-.134.133-.274.279-.118.547.156.267.693 1.144 1.488 1.852 1.023.912 1.884 1.194 2.152 1.328.267.133.423.111.579-.067.156-.178.668-.779.846-1.046.178-.267.356-.223.6-.134.245.09 1.558.735 1.826.869.267.134.445.2.512.312.067.112.067.646-.173 1.321z"
          />
        </svg>
      </div>

      <!-- Text Label (Desktop only, minimal on mobile) -->
      <div class="hidden md:flex flex-col text-left leading-tight">
        <div class="flex items-center gap-1.5">
          <span class="text-[12px] font-bold tracking-tight text-white">
            {{ isOpen ? t('Tutup Menu', 'Close Menu') : t('Chat Admin', 'Chat Support') }}
          </span>
          <span
            v-if="!isOpen"
            class="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"
            :title="t('Admin Siap Bantu', 'Support Ready')"
          ></span>
        </div>
        <span class="text-[10px] text-emerald-100 font-medium">
          {{ isOpen ? t('Klik untuk menyembunyikan', 'Click to hide') : t('Tanya stok & pesanan', 'Ask stock & orders') }}
        </span>
      </div>
    </button>
  </aside>
</template>
