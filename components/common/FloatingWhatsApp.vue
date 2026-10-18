<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLocale } from '~/composables/useLocale'

const route = useRoute()
const { t, isEn } = useLocale()

// Sembunyikan floating button di halaman checkout, pembayaran, dan detail produk
// (detail produk sudah punya tombol WA inline terdedikasi)
const isVisible = computed(() => {
  const path = route.path
  if (path === '/checkout') return false
  if (path.startsWith('/pembayaran')) return false
  if (path.startsWith('/produk/')) return false
  return true
})

const waMessage = computed(() => {
  return isEn.value
    ? 'Hello Laut Berkah Abadi Muncar, I would like to consult about today fresh fish catch.'
    : 'Halo Laut Berkah Abadi Muncar, saya ingin konsultasi tangkapan ikan segar hari ini.'
})

const waUrl = computed(() => `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage.value)}`)
</script>

<template>
  <aside
    v-if="isVisible"
    :aria-label="t('Layanan Pelanggan WhatsApp', 'WhatsApp Customer Service')"
    class="fixed z-30 transition-all duration-200 right-4 md:right-6 bottom-[4.75rem] md:bottom-6"
  >
    <a
      :href="waUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="group flex items-center gap-2.5 bg-[#059669] hover:bg-[#047857] text-white p-3 md:px-4 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
      :title="t('Konsultasi Produk dan Pesanan via WhatsApp', 'Product & Order Consultation via WhatsApp')"
    >
      <!-- WhatsApp / Chat Icon -->
      <div class="relative flex items-center justify-center shrink-0">
        <svg
          class="w-6 h-6 fill-current text-white"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19-.09-1.1-.54-1.27-.6-.17-.06-.3-.09-.43.09-.13.19-.49.6-.6.73-.11.13-.23.15-.42.06-.19-.09-.81-.3-1.54-.95-.57-.51-.95-1.14-1.06-1.33-.11-.19-.01-.3.08-.39.09-.08.19-.23.29-.34.1-.11.13-.19.19-.32.06-.13.03-.24-.01-.34-.05-.09-.43-1.04-.6-1.42-.16-.37-.32-.32-.44-.33-.11-.01-.24-.01-.37-.01-.13 0-.34.05-.52.24-.18.19-.69.67-.69 1.64s.71 1.91.81 2.04c.1.13 1.4 2.14 3.39 3 .47.21.84.33 1.13.42.48.15.91.13 1.25.08.38-.06 1.1-.45 1.26-.89.15-.43.15-.81.11-.89-.05-.08-.18-.13-.37-.22"
          />
        </svg>
        <!-- Real-time Online Indicator -->
        <span
          class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-[#059669]"
          :title="t('Admin Siap Bantu', 'Support Ready')"
        ></span>
      </div>

      <!-- Text Label (Desktop only, minimal on mobile) -->
      <div class="hidden md:flex flex-col text-left leading-tight">
        <span class="text-[12px] font-bold tracking-tight text-white">{{ t('Chat Admin', 'Chat Support') }}</span>
        <span class="text-[10px] text-emerald-100 font-medium">{{ t('Tanya stok & pesanan', 'Ask stock & orders') }}</span>
      </div>
    </a>
  </aside>
</template>
