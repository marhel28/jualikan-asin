<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PRODUCTS, type Product } from '~/data/products'
import CatalogProductCard from '~/components/catalog/ProductCard.vue'

const route = useRoute()
const router = useRouter()

useHead({
  title: 'Laut Berkah Abadi | D2C Cold Chain Seafood Muncar Banyuwangi',
  meta: [
    {
      name: 'description',
      content: 'Distribusi ikan segar Pelabuhan Muncar Banyuwangi langsung ke dapur Anda dengan rantai dingin presisi -20°C.'
    },
    { property: 'og:title', content: 'Laut Berkah Abadi | D2C Cold Chain Seafood Muncar Banyuwangi' },
    { property: 'og:description', content: 'Distribusi ikan segar Pelabuhan Muncar Banyuwangi langsung ke dapur Anda dengan rantai dingin presisi -20°C.' },
    { property: 'og:type', content: 'website' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Katalog Ikan Segar Cold Chain Muncar',
        itemListElement: PRODUCTS.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Product',
            name: p.name,
            description: p.description,
            image: p.images?.hero,
            offers: {
              '@type': 'Offer',
              price: p.pricePerKg,
              priceCurrency: 'IDR',
              availability: p.stockKg > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
            }
          }
        }))
      })
    }
  ]
})

// Carousel Reactive Logic
const currentSlide = ref(0)
const totalSlides = 3
let slideInterval: any = null
const isHovered = ref(false)
const toastText = ref('')
const showToast = ref(false)

const triggerToast = (msg: string) => {
  toastText.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const updateCarousel = (index: number) => {
  currentSlide.value = (index + totalSlides) % totalSlides
}

const prevSlide = () => {
  updateCarousel(currentSlide.value - 1)
}

const nextSlide = () => {
  updateCarousel(currentSlide.value + 1)
}

const goToSlide = (index: number) => {
  updateCarousel(index)
}

const startAutoSlide = () => {
  stopAutoSlide()
  slideInterval = setInterval(() => {
    if (!isHovered.value) {
      nextSlide()
    }
  }, 4500)
}

const stopAutoSlide = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

// Touch swipe variables
let touchStartX = 0
let touchEndX = 0

const onTouchStart = (e: TouchEvent) => {
  stopAutoSlide()
  touchStartX = e.changedTouches[0].screenX
}

const onTouchEnd = (e: TouchEvent) => {
  startAutoSlide()
  touchEndX = e.changedTouches[0].screenX
  if (touchStartX - touchEndX > 45) {
    nextSlide()
  } else if (touchEndX - touchStartX > 45) {
    prevSlide()
  }
}

// Slide Call to Actions
const onCheckTangkapan = () => {
  router.push('/katalog')
}

const onClaimPromo = () => {
  triggerToast('Promo otomatis aktif untuk pembelian di atas 3 kg!')
  router.push('/katalog')
}

const onUseVoucher = () => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText('DINGINBEBAS')
  }
  triggerToast('Kode voucher DINGINBEBAS berhasil disalin!')
}

interface CategoryOption {
  id: string
  label: string
}

const CATEGORIES: CategoryOption[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'ikan_utuh_bersih', label: 'Ikan Utuh Bersih' },
  { id: 'fillet', label: 'Fillet & Kupas' },
  { id: 'steak', label: 'Steak Melintang' },
  { id: 'tulang_sup', label: 'Kepala & Tulang Sup' },
  { id: 'udang_cumi', label: 'Udang & Cumi' }
]

const products = ref<Product[]>(PRODUCTS)
const searchQuery = ref('')
const selectedCategory = ref('semua')
const isLoading = ref(false)
const hasError = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Category matching logic
const isCategoryMatch = (p: Product, catId: string): boolean => {
  if (catId === 'semua') return true
  if (catId === 'ikan_utuh_bersih') {
    return p.category === 'utuh' || (p.category as string) === 'ikan_utuh_bersih'
  }
  if (catId === 'fillet') {
    return p.category === 'fillet' || p.availableCuts?.some(c => c.type === 'fillet_tanpa_kulit')
  }
  if (catId === 'steak') {
    return p.category === 'steak' || p.availableCuts?.some(c => c.type === 'steak_melintang')
  }
  if (catId === 'tulang_sup') {
    return p.category === 'sup' || (p.category as string) === 'tulang_sup' || p.supportsSoupBones
  }
  if (catId === 'udang_cumi') {
    return p.category === 'udang_cumi'
  }
  return (p.category as string) === catId
}

// Search matching logic
const isSearchMatch = (p: Product, query: string): boolean => {
  if (!query || !query.trim()) return true
  const q = query.trim().toLowerCase()
  const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false
  const latinMatch = p.scientificName ? p.scientificName.toLowerCase().includes(q) : false
  const catchMatch = p.catchMethod ? p.catchMethod.toLowerCase().includes(q) : false
  const descMatch = p.description ? p.description.toLowerCase().includes(q) : false
  return nameMatch || latinMatch || catchMatch || descMatch
}

// Filtered catalog results
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    return isCategoryMatch(p, selectedCategory.value) && isSearchMatch(p, searchQuery.value)
  })
})

const resetFilter = () => {
  searchQuery.value = ''
  selectedCategory.value = 'semua'
  if (searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

const retryLoad = () => {
  isLoading.value = true
  hasError.value = false
  setTimeout(() => {
    isLoading.value = false
  }, 400)
}

onMounted(() => {
  startAutoSlide()
  if (route.query.state === 'loading') {
    isLoading.value = true
  } else if (route.query.state === 'error') {
    hasError.value = true
  }

  if (route.query.focusSearch === '1' && searchInputRef.value) {
    searchInputRef.value.focus()
  }
})

onUnmounted(() => {
  stopAutoSlide()
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Toast Notification -->
    <div 
      v-if="showToast" 
      class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#002242] text-white text-xs py-2 px-4 rounded-full shadow-lg flex items-center gap-2 animate-bounce"
    >
      <span class="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
      <span>{{ toastText }}</span>
    </div>

    <!-- Enhanced Interactive Hero Auto-Slider / Carousel (Stitch Code Implementation) -->
    <div 
      id="hero-carousel"
      class="relative overflow-hidden rounded-xl shadow-md group"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <!-- Carousel Track -->
      <div 
        id="carousel-track"
        class="carousel-track flex transition-transform duration-500 ease-out will-change-transform"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <!-- Slide 1: Info Lelang Harian -->
        <!-- ponytail: mobile height increased ~1.4x (min-h-[210px] sm:min-h-[240px] md:min-h-[260px]) with larger spacing for promotion banner room -->
        <div class="min-w-full min-h-[210px] sm:min-h-[240px] md:min-h-[260px] bg-gradient-to-br from-[#103860] via-[#0b2542] to-[#081a2e] text-white p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-3 relative overflow-hidden select-none">
          <div class="absolute -right-8 -bottom-10 w-52 h-52 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none"></div>
          
          <div class="flex items-center justify-between z-10">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] sm:text-xs font-semibold text-[#85f8c4]">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Tangkapan Baru Mendarat
            </span>
            <span class="text-[11px] sm:text-xs text-[#81a2d0] font-mono">05:30 WIB</span>
          </div>

          <div class="flex flex-col gap-1.5 z-10 max-w-md my-auto">
            <h2 class="text-white text-lg sm:text-xl md:text-2xl leading-tight font-extrabold tracking-tight">Ikan Segar Pilihan Hari Ini</h2>
            <p class="text-[#81a2d0] text-xs sm:text-sm leading-relaxed">Hasil pancing harian nelayan Selat Bali dengan penanganan rantai dingin langsung di dermaga Muncar.</p>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-white/10 mt-1 z-10">
            <span class="text-[11px] text-[#81a2d0] hidden sm:inline">Rantai Dingin Terjamin -20°C</span>
            <button 
              type="button"
              @click="onCheckTangkapan"
              class="bg-white text-[#002242] font-bold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <span>Lihat Produk</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Slide 2: Promo & Diskon Tangkapan Grosir -->
        <div class="min-w-full min-h-[210px] sm:min-h-[240px] md:min-h-[260px] bg-gradient-to-br from-[#0c3756] via-[#005137] to-[#04281e] text-white p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-3 relative overflow-hidden select-none">
          <div class="absolute -right-6 -bottom-6 w-48 h-48 rounded-full bg-[#85f8c4]/15 blur-2xl pointer-events-none"></div>

          <div class="flex items-center justify-between z-10">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-[11px] sm:text-xs font-semibold text-amber-200">
              <span class="material-symbols-outlined text-[14px]">local_fire_department</span>
              Promo Spesial Tangkapan
            </span>
            <span class="text-[11px] sm:text-xs text-[#85f8c4] font-bold bg-[#85f8c4]/10 px-2 py-0.5 rounded-md">Hemat s.d. 30%</span>
          </div>

          <div class="flex flex-col gap-1.5 z-10 max-w-md my-auto">
            <h2 class="text-white text-lg sm:text-xl md:text-2xl leading-tight font-extrabold tracking-tight">Borong Ikan, Diskon Ekstra</h2>
            <p class="text-emerald-100 text-xs sm:text-sm leading-relaxed">Potongan harga otomatis untuk pesanan ikan di atas 3 kg. Bersih insang & sisik gratis.</p>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-white/10 mt-1 z-10">
            <span class="text-[11px] text-emerald-200/80 hidden sm:inline">Khusus Pengiriman Subuh & Siang</span>
            <button 
              type="button"
              @click="onClaimPromo"
              class="bg-amber-400 hover:bg-amber-300 text-[#002242] font-bold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <span>Klaim Promo</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Slide 3: Voucher Gratis Ongkir Cold Chain -->
        <div class="min-w-full min-h-[210px] sm:min-h-[240px] md:min-h-[260px] bg-gradient-to-br from-[#102a4e] via-[#1a3c6e] to-[#004d61] text-white p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-3 relative overflow-hidden select-none">
          <div class="absolute -right-6 -bottom-6 w-48 h-48 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none"></div>

          <div class="flex items-center justify-between z-10">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/15 border border-cyan-300/30 text-[11px] sm:text-xs font-semibold text-cyan-200">
              <span class="material-symbols-outlined text-[14px]">local_shipping</span>
              Gratis Ongkir Rantai Dingin
            </span>
            <span class="text-[11px] sm:text-xs text-cyan-100 font-mono font-bold bg-white/10 px-2 py-0.5 rounded-md">DINGINBEBAS</span>
          </div>

          <div class="flex flex-col gap-1.5 z-10 max-w-md my-auto">
            <h2 class="text-white text-lg sm:text-xl md:text-2xl leading-tight font-extrabold tracking-tight">Armada Kurir Dingin LBA</h2>
            <p class="text-cyan-100/90 text-xs sm:text-sm leading-relaxed">Bebas biaya kirim khusus pesanan area Banyuwangi & sekitarnya dengan kemasan thermal berpendingin.</p>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-white/10 mt-1 z-10">
            <span class="text-[11px] text-cyan-200/80 hidden sm:inline">Gunakan saat checkout</span>
            <button 
              type="button"
              @click="onUseVoucher"
              class="bg-white text-[#002242] font-bold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <span>Salin Kode</span>
              <span class="material-symbols-outlined text-[16px]">content_copy</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Micro Prev / Next Controls -->
      <button 
        id="carousel-prev"
        type="button"
        aria-label="Slide sebelumnya" 
        @click="prevSlide"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/55 text-white/90 flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      <button 
        id="carousel-next"
        type="button"
        aria-label="Slide berikutnya" 
        @click="nextSlide"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/55 text-white/90 flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>

      <!-- Slide Indicators (Dots / Pills) -->
      <div class="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-auto">
        <button 
          v-for="i in totalSlides" 
          :key="i - 1"
          type="button"
          :aria-label="`Pindah ke slide ${i}`" 
          @click="goToSlide(i - 1)"
          class="carousel-dot h-1.5 rounded-full transition-all duration-300 cursor-pointer"
          :class="currentSlide === (i - 1) ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70 w-1.5'"
        ></button>
      </div>
    </div>

    <!-- Real-Time Search Bar -->
    <div class="relative w-full">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
        <span class="material-symbols-outlined text-[20px]">search</span>
      </span>
      <input
        id="catalog-search-input"
        ref="searchInputRef"
        v-model="searchQuery"
        type="text"
        placeholder="Cari ikan laut, fillet, cumi, pancing ulur..."
        class="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#103860] focus:border-transparent transition-all shadow-xs"
      />
      <!-- Clear Search Button -->
      <button
        v-if="searchQuery"
        type="button"
        @click="searchQuery = ''"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        aria-label="Bersihkan pencarian"
      >
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>

    <!-- Category Horizontal Chip Tabs -->
    <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        v-for="cat in CATEGORIES"
        :key="cat.id"
        type="button"
        @click="selectedCategory = cat.id"
        class="px-4 py-2 rounded-xl text-xs flex-shrink-0 transition-all cursor-pointer"
        :class="selectedCategory === cat.id 
          ? 'bg-[#002242] text-white font-bold shadow-xs' 
          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Subheader: Rekomendasi Pilihan & Link ke Katalog -->
    <div class="flex items-center justify-between pt-1">
      <div>
        <h3 class="text-sm font-bold text-[#002242]">Rekomendasi Pilihan</h3>
      </div>
      <NuxtLink 
        to="/katalog" 
        class="text-[#006c4a] hover:text-[#005137] text-xs font-bold flex items-center gap-0.5 transition-colors"
      >
        <span>Lihat Semua</span>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      </NuxtLink>
    </div>

    <!-- State Handling (Loading, Error, Empty, Success Grid) -->
    <!-- State: Error Retry -->
    <CommonErrorRetry
      v-if="hasError"
      title="Terjadi Kendala Koneksi Data"
      message="Gagal memuat katalog hasil laut dari cold hub Muncar. Silakan coba lagi."
      retry-text="Coba Lagi"
      @retry="retryLoad"
    />

    <!-- State: Animated Skeleton Loading -->
    <CommonSkeletonLoader
      v-else-if="isLoading"
      type="card"
      :count="4"
    />

    <!-- State: Empty State with Reset Action -->
    <CommonEmptyState
      v-else-if="filteredProducts.length === 0"
      title="Hasil Laut Tidak Ditemukan"
      description="Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih. Coba kata kunci lain atau tampilkan seluruh katalog."
      action-text="Tampilkan Semua Produk"
      action-icon="refresh"
      :action-to="''"
      @action="resetFilter"
    />

    <!-- State: Responsive Product Grid (2 col mobile, 3 col md, 4 col lg/xl) -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      <CatalogProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- Cold chain delivery guarantee banner -->
    <div class="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 shadow-xs">
      <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#006c4a] flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-[18px]">ac_unit</span>
      </div>
      <p class="text-xs text-slate-600">
        <strong class="text-[#103860]">Proteksi Rantai Dingin:</strong> Kemasan vacuum & ice gel beku di setiap paket.
      </p>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@media (prefers-reduced-motion: reduce) {
  .carousel-track {
    transition: none !important;
  }
}
</style>
