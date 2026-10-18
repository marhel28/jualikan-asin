<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '~/stores/cart'
import { useLocale } from '~/composables/useLocale'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const { t } = useLocale()

const logoError = ref(false)
const cartCount = computed(() => cartStore?.totalItemCount ?? 0)

// Official WhatsApp concierge link with prefilled greetings
const waHelpUrl = 'https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi%2C%20saya%20butuh%20bantuan%20mengenai%20produk%20ikan%20segar%20Muncar.'

const isKatalogPage = computed(() => route.path === '/katalog')
const isKeranjangPage = computed(() => route.path === '/keranjang')
const isProdukPage = computed(() => route.path.startsWith('/produk'))

// Check whether to show the main brand header and top announcement bar
// /katalog, /keranjang, and /produk use responsive visibility: hidden on mobile (local header), visible on md+ (global navbar)
const showMainHeader = computed(() => {
  if (route.meta?.hideMainHeader && !isProdukPage.value) return false
  return true
})

// Check whether page uses its own container layout padding (full bleed)
// /katalog and /produk keep their own outer bg/centered card, so they stay full-bleed even though global header is visible on md+
const isFullBleedPage = computed(() => {
  if (isKatalogPage.value || isProdukPage.value) return true
  return Boolean(route.meta?.hideMainHeader)
})

// Hide bottom navbar on detail pages where there is a full-width dedicated action bar
const showBottomNav = computed(() => {
  if (route.meta?.hideBottomNav) return false
  if (route.path.startsWith('/produk')) return false
  if (route.path.startsWith('/keranjang')) return false
  if (route.path.startsWith('/pembayaran')) return false
  return true
})

const showFooter = computed(() => {
  if (route.meta?.hideFooter) return false
  if (route.path.startsWith('/pesanan')) return false
  if (isProdukPage.value) return true
  return showBottomNav.value
})

const handleSearchClick = () => {
  if (route.path === '/') {
    if (typeof document !== 'undefined') {
      const searchInput = document.getElementById('catalog-search-input')
      if (searchInput) {
        searchInput.focus()
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  } else {
    router.push({ path: '/', query: { focusSearch: '1' } })
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col pb-24 selection:bg-[#103860] selection:text-white">
    <!-- Top Announcement Bar (Cold Chain Coverage) -->
    <div 
      v-if="showMainHeader" 
      :class="(isKatalogPage || isKeranjangPage || isProdukPage) ? 'hidden md:flex' : 'flex'"
      class="bg-[#103860] text-white text-xs px-4 py-2 items-center justify-between text-center overflow-hidden z-30 shadow-xs"
    >
      <div class="flex items-center gap-2 mx-auto animate-pulse">
        <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">ac_unit</span>
        <span class="font-medium tracking-wide">
          {{ t('Pengiriman Khusus Rantai Dingin Area Banyuwangi, Jember, Malang, Surabaya, dan Bali', 'Special Cold-Chain Delivery for Banyuwangi, Jember, Malang, Surabaya, and Bali') }}
        </span>
      </div>
    </div>

    <!-- Sticky Brand Header -->
    <header 
      v-if="showMainHeader" 
      :class="(isKatalogPage || isKeranjangPage || isProdukPage) ? 'hidden md:block' : 'block'"
      class="bg-white sticky top-0 z-30 shadow-sm border-b border-slate-200/80 px-4 py-3"
    >
      <div class="max-w-6xl mx-auto flex justify-between items-center w-full gap-4">
        <!-- Brand Link & Anchor / Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group shrink-0">
          <div class="w-11 h-11 flex items-center justify-center flex-shrink-0">
            <img 
              v-if="!logoError"
              src="/brand/logo.png" 
              alt="Laut Berkah Abadi" 
              class="w-full h-full object-contain rounded-full"
              @error="logoError = true"
            />
            <div v-else class="w-full h-full rounded-full bg-[#103860] flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">anchor</span>
            </div>
          </div>
          <div class="flex flex-col">
            <h1 class="text-base font-bold text-[#103860] leading-tight group-hover:text-[#13446E] transition-colors">
              Laut Berkah Abadi
            </h1>
            <p class="text-xs text-slate-500 font-medium hidden sm:block">Banyuwangi Maritime Cold-Chain</p>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation Links (hidden on mobile) -->
        <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <NuxtLink to="/" class="hover:text-[#103860] transition-colors" exact-active-class="text-[#103860] font-bold">
            {{ t('Beranda', 'Home') }}
          </NuxtLink>
          <NuxtLink to="/katalog" class="hover:text-[#103860] transition-colors" active-class="text-[#103860] font-bold">
            {{ t('Katalog Ikan', 'Seafood Catalog') }}
          </NuxtLink>
          <NuxtLink to="/pesanan" class="hover:text-[#103860] transition-colors" active-class="text-[#103860] font-bold">
            {{ t('Pesanan', 'Orders') }}
          </NuxtLink>
          <NuxtLink to="/tentang" class="hover:text-[#103860] transition-colors" active-class="text-[#103860] font-bold">
            {{ t('Tentang Kami', 'About Us') }}
          </NuxtLink>
        </nav>

        <!-- Right Action Cluster: Language Switcher, Account, Cart Button with Reactive Counter -->
        <div class="relative flex items-center gap-2.5 sm:gap-3 shrink-0">
          <!-- Language Switcher in Header -->
          <CommonLanguageSwitcher />

          <NuxtLink
            to="/akun"
            class="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            active-class="bg-slate-100 text-[#103860]"
          >
            <span class="material-symbols-outlined text-[18px]">account_circle</span>
            <span>{{ t('Akun Saya', 'My Account') }}</span>
          </NuxtLink>

          <NuxtLink 
            to="/keranjang" 
            class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#103860] hover:bg-slate-200 transition-colors relative"
            aria-label="Keranjang Belanja Dingin"
          >
            <span class="material-symbols-outlined text-[22px]">shopping_cart</span>
            <span 
              v-if="cartCount > 0" 
              class="absolute -top-1 -right-1 bg-[#059669] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content Canvas -->
    <main :class="isFullBleedPage ? 'flex-1 w-full' : 'flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col gap-5'">
      <slot />
    </main>

    <!-- Clean Corporate Maritime Website Footer -->
    <CommonAppFooter v-if="showFooter" />

    <!-- Persistent 4-Item Bottom Navigation Bar (Mobile only, hidden on md+) -->
    <nav 
      v-if="showBottomNav" 
      class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md z-40 shadow-lg border-t border-slate-200 flex justify-around items-center h-16 px-2 max-w-md mx-auto"
    >
      <!-- 1. Beranda -->
      <NuxtLink 
        to="/" 
        class="flex flex-col items-center justify-center w-full py-1 text-slate-500 hover:text-[#002242] transition-colors"
        exact-active-class="text-[#002242] font-bold"
      >
        <span class="material-symbols-outlined text-[22px]">home</span>
        <span class="text-[10px] mt-0.5 font-medium">{{ t('Beranda', 'Home') }}</span>
      </NuxtLink>

      <!-- 2. Katalog (Pengganti Pencarian) -->
      <NuxtLink 
        to="/katalog" 
        class="flex flex-col items-center justify-center w-full py-1 text-slate-500 hover:text-[#002242] transition-colors"
        active-class="text-[#002242] font-bold"
      >
        <span class="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' 1;">storefront</span>
        <span class="text-[10px] mt-0.5 font-medium">{{ t('Katalog', 'Catalog') }}</span>
      </NuxtLink>

      <!-- 3. Pesanan -->
      <NuxtLink 
        to="/pesanan" 
        class="flex flex-col items-center justify-center w-full py-1 text-slate-500 hover:text-[#002242] transition-colors"
        active-class="text-[#002242] font-bold"
      >
        <span class="material-symbols-outlined text-[22px]">receipt_long</span>
        <span class="text-[10px] mt-0.5 font-medium">{{ t('Pesanan', 'Orders') }}</span>
      </NuxtLink>

      <!-- 4. Akun -->
      <NuxtLink 
        to="/akun" 
        class="flex flex-col items-center justify-center w-full py-1 text-slate-500 hover:text-[#002242] transition-colors"
        active-class="text-[#002242] font-bold"
      >
        <span class="material-symbols-outlined text-[22px]">person</span>
        <span class="text-[10px] mt-0.5 font-medium">{{ t('Akun', 'Account') }}</span>
      </NuxtLink>
    </nav>

    <!-- Floating Concierge WhatsApp -->
    <CommonFloatingWhatsApp />
  </div>
</template>

