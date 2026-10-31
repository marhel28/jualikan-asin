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
      <!-- Official WhatsApp Vector Icon (Solid, Crisp & Symmetrical) -->
      <div class="relative flex items-center justify-center shrink-0">
        <svg
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
          <span class="text-[12px] font-bold tracking-tight text-white">{{ t('Chat Admin', 'Chat Support') }}</span>
          <span
            class="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"
            :title="t('Admin Siap Bantu', 'Support Ready')"
          ></span>
        </div>
        <span class="text-[10px] text-emerald-100 font-medium">{{ t('Tanya stok & pesanan', 'Ask stock & orders') }}</span>
      </div>
    </a>
  </aside>
</template>
