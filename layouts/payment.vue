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
  <div class="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col items-center selection:bg-[#103860] selection:text-white">
    <!-- Focused Distraction-Free Frame -->
    <div class="w-full max-w-md md:max-w-4xl lg:max-w-5xl bg-white min-h-screen flex flex-col md:my-6 md:min-h-[88vh] md:rounded-2xl md:border md:border-slate-200/90 md:shadow-xs border-x border-slate-200/80 relative">
      <!-- Minimalist Focused Header -->
      <header class="bg-white/95 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between w-full px-4 sm:px-6 py-3.5 border-b border-slate-200">
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
          <div class="w-8 h-8 rounded-lg bg-[#103860] text-white flex items-center justify-center font-black text-sm tracking-tight shadow-xs">
            LBA
          </div>
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
      </header>

      <!-- Main Payment Content Slot -->
      <main class="flex-1 px-3 sm:px-6 py-5 flex flex-col">
        <slot />
      </main>

      <!-- Minimalist Trust & Regulatory Footer -->
      <footer class="mt-auto border-t border-slate-200/90 bg-slate-50/70 px-4 sm:px-6 py-6 text-center space-y-3.5 md:rounded-b-2xl">
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
      </footer>
    </div>
  </div>
</template>

