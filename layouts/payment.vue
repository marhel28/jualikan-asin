<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const orderId = computed(() => {
  return String(route.params.orderId || '')
})

// Official WhatsApp concierge link with dynamic order ID context
const waHelpUrl = computed(() => {
  const ord = orderId.value ? ` untuk pesanan #${orderId.value}` : ''
  const msg = encodeURIComponent(`Halo Tim Operasional Laut Berkah Abadi, saya butuh bantuan konfirmasi pembayaran${ord}.`)
  return `https://wa.me/6281234567890?text=${msg}`
})

// Bank and payment partner logos stored locally in public/images/payments/
const paymentPartners = [
  { name: 'QRIS', src: '/images/payments/qris.svg' },
  { name: 'GPN', src: '/images/payments/gpn.svg' },
  { name: 'BCA', src: '/images/payments/bca.svg' },
  { name: 'Mandiri', src: '/images/payments/mandiri.svg' },
  { name: 'BNI', src: '/images/payments/bni.svg' },
  { name: 'BRI', src: '/images/payments/bri.svg' },
  { name: 'Permata', src: '/images/payments/permata.svg' },
  { name: 'Midtrans', src: '/images/payments/midtrans.svg' }
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-[#0F172A] font-sans antialiased flex flex-col relative overflow-hidden selection:bg-[#103860] selection:text-white">
    <!-- 1. Background Atmosphere: Soft Ocean Gradient + Subtle Wave SVG -->
    <div class="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-sky-100/70 via-sky-50/40 to-transparent -z-10 pointer-events-none">
      <svg class="absolute bottom-0 w-full h-12 sm:h-16 text-slate-50 fill-current opacity-90" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,160L80,170.7C160,181,320,203,480,192C640,181,800,139,960,128C1120,117,1280,139,1360,149.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
      </svg>
    </div>

    <!-- 2. Ambient Glow Blurs on Left & Right Canvas -->
    <div class="absolute top-28 -left-32 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    <div class="absolute top-96 -right-32 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

    <!-- Minimalist Focused Header -->
    <header class="bg-white/95 backdrop-blur-md sticky top-0 z-40 w-full border-b border-slate-200/90 shadow-2xs">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <!-- Left: Back to Home Button -->
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer group shadow-2xs"
          title="Kembali ke Beranda (Tagihan tersimpan di Laci Pesanan Belum Bayar)"
        >
          <span class="material-symbols-outlined text-[18px] text-slate-500 group-hover:text-[#103860] transition-colors">arrow_back</span>
          <span class="hidden sm:inline">Beranda</span>
        </NuxtLink>

        <!-- Center: Brand Logo + Security Trust Badge -->
        <div class="flex items-center gap-2.5">
          <img
            src="/brand/logo.webp"
            alt="Laut Berkah Abadi"
            class="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-full shadow-2xs shrink-0"
          />
          <div class="flex flex-col items-start">
            <span class="text-xs sm:text-sm font-extrabold text-[#103860] tracking-tight leading-tight">
              LAUT BERKAH ABADI
            </span>
            <div class="flex items-center gap-1 mt-0.5">
              <span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70 leading-none">
                <span class="material-symbols-outlined text-[12px] text-emerald-600">lock</span>
                <span>Enkripsi SSL 256-Bit</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Official WhatsApp CS Concierge -->
        <a
          :href="waHelpUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          title="Hubungi Layanan Bantuan Operasional LBA di WhatsApp"
        >
          <span class="material-symbols-outlined text-[18px]">chat</span>
          <span class="hidden sm:inline">Bantuan CS</span>
        </a>
      </div>
    </header>

    <!-- Main Payment Content Slot -->
    <main class="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 flex flex-col items-center relative">
      <slot />
    </main>

    <!-- Minimalist Trust & Regulatory Footer -->
    <footer class="mt-auto border-t border-slate-200/80 bg-white/80 backdrop-blur-xs w-full py-6 px-4 sm:px-6 text-center space-y-3.5 relative z-10">
      <div class="max-w-5xl mx-auto space-y-3.5">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Metode Pembayaran Resmi & Terverifikasi
        </div>

        <!-- Local Vector Payment Logos (Official Brand SVGs) -->
        <div class="flex items-center justify-center flex-wrap gap-2 sm:gap-3">
          <div
            v-for="logo in paymentPartners"
            :key="logo.name"
            class="h-8 sm:h-9 px-3 py-1 bg-white border border-slate-200/90 rounded-md shadow-2xs flex items-center justify-center hover:border-slate-300 transition-all"
            :title="logo.name"
          >
            <img
              :src="logo.src"
              :alt="logo.name"
              class="max-h-5 sm:max-h-6 max-w-[65px] sm:max-w-[75px] object-contain"
              loading="lazy"
            />
          </div>
        </div>

        <!-- Regulatory & Encryption Guarantee -->
        <p class="text-[11px] text-slate-600 max-w-xl mx-auto leading-relaxed">
          Seluruh proses transaksi diverifikasi otomatis secara real-time dan dilindungi enkripsi standar perbankan Bank Indonesia melalui payment gateway Midtrans.
        </p>

        <div class="pt-2 border-t border-slate-200/70 text-[10px] text-slate-500 font-medium">
          © 2026 Laut Berkah Abadi Banyuwangi. Pusat Pengolahan & Cold Chain Ikan Segar Muncar.
        </div>
      </div>
    </footer>
  </div>
</template>

