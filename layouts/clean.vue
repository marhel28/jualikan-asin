<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCartStore } from '~/stores/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

// Dynamic title and subtitle based on route metadata or defaults
const pageTitle = computed(() => {
  if (route.meta.title) return String(route.meta.title)
  if (route.path.startsWith('/auth')) return 'Masuk & Daftar Akun'
  if (route.path.startsWith('/keranjang')) return 'Keranjang Belanja Dingin'
  if (route.path.startsWith('/checkout')) return 'Checkout Pengiriman Hasil Laut'
  if (route.path.startsWith('/pembayaran')) return 'Pembayaran & Status Pesanan'
  if (route.path.startsWith('/pesanan')) return 'Pelacakan Rantai Dingin'
  return 'Laut Berkah Abadi'
})

const pageSubtitle = computed(() => {
  if (route.meta.subtitle) return String(route.meta.subtitle)
  if (route.path.startsWith('/auth')) return 'Pusat Distribusi Muncar Sejak 1998'
  if (route.path.startsWith('/keranjang')) {
    const count = cartStore.items.length
    return `${count} Produk dalam keranjang`
  }
  if (route.path.startsWith('/checkout')) return 'Fasilitas Cold Storage Muncar'
  if (route.params.orderId) return `Order ID #${route.params.orderId}`
  return ''
})

const goBack = () => {
  if (route.path.startsWith('/auth')) {
    router.push('/')
    return
  }
  if (typeof window !== 'undefined' && window.history.length > 1) {
    const fromPath = String((router.options.history.state as any)?.back || '')
    if (fromPath && (fromPath.includes('/akun') || fromPath.includes('/auth'))) {
      router.push('/')
      return
    }
    router.back()
  } else {
    // Intelligent fallback
    if (route.path.startsWith('/checkout')) router.push('/keranjang')
    else if (route.path.startsWith('/pembayaran')) router.push('/')
    else router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col items-center selection:bg-[#103860] selection:text-white">
    <!-- Centered Container Frame: max-w-md on mobile, expands up to max-w-5xl on desktop -->
    <div class="w-full max-w-md md:max-w-4xl lg:max-w-5xl bg-white min-h-screen flex flex-col md:my-6 md:min-h-[85vh] md:rounded-xl md:border md:border-slate-200/90 md:shadow-xs border-x border-slate-200/80 relative pb-28 md:pb-12">
      <!-- Minimalist Sticky Header -->
      <header class="bg-white/95 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center w-full px-4 py-3 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <!-- Back Button: Direct to Home when on Auth page to prevent redirect bounce loops -->
          <NuxtLink 
            v-if="route.path.startsWith('/auth')"
            to="/"
            class="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 transition-colors text-[#103860] flex items-center justify-center cursor-pointer"
            aria-label="Kembali ke Beranda"
            title="Kembali ke Beranda"
          >
            <span class="material-symbols-outlined text-[24px]">arrow_back</span>
          </NuxtLink>
          <button 
            v-else
            type="button" 
            @click="goBack"
            class="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 transition-colors text-[#103860] flex items-center justify-center cursor-pointer"
            aria-label="Kembali"
            title="Kembali"
          >
            <span class="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>

          <!-- Contextual Title and Subtitle -->
          <div class="flex flex-col">
            <h1 class="text-base font-bold text-[#103860] leading-tight">
              {{ pageTitle }}
            </h1>
            <p v-if="pageSubtitle" class="text-xs text-slate-500 font-medium">
              {{ pageSubtitle }}
            </p>
          </div>
        </div>

        <!-- Right Anchor Brand Mark -->
        <NuxtLink to="/" class="flex items-center text-[#103860] hover:opacity-80 transition-opacity" aria-label="Beranda">
          <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">anchor</span>
        </NuxtLink>
      </header>

      <!-- Main Content Slot -->
      <main class="flex-1 px-4 py-4 flex flex-col gap-4">
        <slot />
      </main>
    </div>
  </div>
</template>

