<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PRODUCTS, type Product } from '~/data/products'
import { useCartStore } from '~/stores/cart'

definePageMeta({
  hideMainHeader: false
})

const router = useRouter()
const cartStore = useCartStore()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://lautberkahabadi.com'

// State Management
const searchQuery = ref('')
const selectedCategory = ref('semua')
const selectedSort = ref('paling_sesuai')
const selectedCut = ref<string | null>(null)
const selectedStorage = ref<string | null>('chilled')
const onlyInStock = ref(true)
const minPrice = ref(0)
const maxPrice = ref(200000)

const isFilterOpen = ref(false)
const isLoading = ref(false)
const hasError = ref(false)
const addedToast = ref(false)
const toastProductName = ref('')

// Category options mapping
const quickCategories = [
  { id: 'semua', label: 'Semua', filterFn: () => true },
  { id: 'ikan_segar', label: 'Ikan Segar', filterFn: (p: Product) => p.category === 'utuh' || p.category === 'fillet' },
  { id: 'udang_cumi', label: 'Udang & Cumi', filterFn: (p: Product) => p.category === 'udang_cumi' || p.id.includes('udang') || p.id.includes('cumi') },
  { id: 'kepiting_kerang', label: 'Kepiting & Kerang', filterFn: (p: Product) => p.id.includes('kepiting') || p.id.includes('kerang') },
  { id: 'fillet_olahan', label: 'Fillet & Olahan', filterFn: (p: Product) => p.category === 'fillet' || p.category === 'steak' }
]

// Calculate counts per quick category
const getCategoryCount = (catId: string) => {
  const cat = quickCategories.find(c => c.id === catId)
  if (!cat) return 0
  if (catId === 'semua') return PRODUCTS.length
  return PRODUCTS.filter(cat.filterFn).length
}

// Active filters count for badge
const activeFilterCount = computed(() => {
  let count = 0
  if (selectedCategory.value !== 'semua') count++
  if (selectedCut.value) count++
  if (selectedStorage.value) count++
  if (onlyInStock.value) count++
  if (selectedSort.value !== 'paling_sesuai') count++
  return count
})

// Filtered and Sorted Products
const filteredProducts = computed(() => {
  let list = [...PRODUCTS]

  // 1. Search Query Filter
  if (searchQuery.value && searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.catchMethod.toLowerCase().includes(q)
    )
  }

  // 2. Quick Category Filter
  if (selectedCategory.value !== 'semua') {
    const cat = quickCategories.find(c => c.id === selectedCategory.value)
    if (cat) {
      list = list.filter(cat.filterFn)
    }
  }

  // 3. Cut shape filter
  if (selectedCut.value) {
    if (selectedCut.value === 'utuh_bersih') {
      list = list.filter(p => p.availableCuts?.some(c => c.type === 'utuh_bersih'))
    } else if (selectedCut.value === 'fillet') {
      list = list.filter(p => p.category === 'fillet' || p.availableCuts?.some(c => c.type === 'fillet_tanpa_kulit'))
    } else if (selectedCut.value === 'steak') {
      list = list.filter(p => p.category === 'steak' || p.availableCuts?.some(c => c.type === 'steak_melintang'))
    }
  }

  // 4. In-stock filter
  if (onlyInStock.value) {
    list = list.filter(p => p.stockKg > 0)
  }

  // 5. Price range
  list = list.filter(p => p.pricePerKg >= minPrice.value && p.pricePerKg <= maxPrice.value)

  // 6. Sorting
  if (selectedSort.value === 'harga_terendah') {
    list.sort((a, b) => a.pricePerKg - b.pricePerKg)
  } else if (selectedSort.value === 'harga_tertinggi') {
    list.sort((a, b) => b.pricePerKg - a.pricePerKg)
  } else if (selectedSort.value === 'tangkapan_terbaru') {
    list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
  }

  return list
})

// Quick Reset
const resetAllFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'semua'
  selectedSort.value = 'paling_sesuai'
  selectedCut.value = null
  selectedStorage.value = 'chilled'
  onlyInStock.value = true
  minPrice.value = 0
  maxPrice.value = 200000
}

// Add product to cart directly from catalog
const handleAddToCart = (product: Product) => {
  cartStore.addItem(
    {
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.images.hero,
      pricePerKg: product.pricePerKg,
      unit: product.unit
    },
    product.availableCuts && product.availableCuts.length > 0 ? product.availableCuts[0].type : 'utuh_bersih',
    false,
    1
  )

  toastProductName.value = product.name
  addedToast.value = true
  setTimeout(() => {
    addedToast.value = false
  }, 2200)
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const handleRetry = () => {
  hasError.value = false
  isLoading.value = false
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
}

// SEO & Schema.org JSON-LD
useHead(() => {
  return {
    title: 'Katalog Hasil Laut & Ikan Segar Muncar | Laut Berkah Abadi Banyuwangi',
    meta: [
      { name: 'description', content: 'Katalog lengkap ikan laut segar, fillet sashimi, udang vaname, cumi sero tangkapan pancing Selat Bali dan cold storage Muncar.' },
      { property: 'og:title', content: 'Katalog Hasil Laut & Ikan Segar Muncar | Laut Berkah Abadi' },
      { property: 'og:description', content: 'Beli ikan segar dengan garansi rantai dingin 0°C s/d -18°C langsung dari Pelabuhan Muncar Banyuwangi.' },
      { property: 'og:image', content: `${siteUrl}/brand/logo.png` }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Katalog Seafood Laut Berkah Abadi Banyuwangi',
          itemListElement: PRODUCTS.map((p, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'Product',
              name: p.name,
              description: p.description,
              image: p.images.hero,
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
  }
})
</script>

<template>
  <div class="bg-[#F7F9FB] text-[#191C1E] antialiased flex justify-center min-h-screen">
    <!-- Container Frame: full width with max-w-6xl on desktop md+ -->
    <div class="w-full max-w-md md:max-w-6xl bg-white min-h-screen flex flex-col relative pb-24 shadow-xs md:my-4 md:rounded-xl md:border md:border-slate-200/80">
      
      <!-- TopAppBar (Mobile only, hidden on md+) -->
      <header class="md:hidden sticky top-0 z-40 flex justify-between items-center px-4 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full max-w-md mx-auto">
        <button 
          type="button" 
          aria-label="Kembali" 
          @click="goBack"
          class="flex items-center justify-center p-2 rounded-lg text-[#002242] hover:bg-slate-100 active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          <span class="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>

        <div class="flex flex-col items-center">
          <h1 class="text-lg font-bold text-[#002242] tracking-tight">Katalog Produk</h1>
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
            <span class="text-xs text-[#006c4a] font-medium">Banyuwangi Port Hub</span>
          </div>
        </div>

        <div class="relative flex items-center justify-center">
          <NuxtLink 
            to="/keranjang" 
            aria-label="Keranjang Belanja" 
            class="flex items-center justify-center p-2 rounded-lg text-[#002242] hover:bg-slate-100 active:scale-95 transition-transform duration-150 cursor-pointer"
          >
            <span class="material-symbols-outlined text-[22px]">shopping_cart</span>
            <span 
              v-if="cartStore.totalItemCount > 0"
              class="absolute top-1 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#006c4a] text-white rounded-full flex items-center justify-center text-[10px] font-bold"
            >
              {{ cartStore.totalItemCount }}
            </span>
          </NuxtLink>
        </div>
      </header>

      <!-- Desktop Breadcrumb / Header Title Bar -->
      <div class="hidden md:flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="font-semibold text-[#103860]">Katalog Produk Muncar</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
          <span class="text-xs text-[#006c4a] font-semibold">Tangkapan Segar Hari Ini • Banyuwangi Hub</span>
        </div>
      </div>

      <!-- Toast Feedback -->
      <div 
        v-if="addedToast" 
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#006c4a] text-white text-xs font-medium py-2 px-4 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce"
      >
        <span class="material-symbols-outlined text-[16px]">check_circle</span>
        <span>{{ toastProductName }} masuk ke keranjang!</span>
      </div>

      <!-- Main Content Canvas -->
      <main class="flex-1 flex flex-col">
        <!-- Sticky Search and Filter Controls -->
        <section class="sticky top-16 md:top-[65px] z-30 bg-white/95 backdrop-blur-md px-4 md:px-6 pt-3 pb-2 border-b border-slate-200/80 space-y-3">
          <!-- Search input & Filter CTA -->
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <span class="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Cari tenggiri, baronang, cumi..." 
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002242] focus:border-[#002242] transition"
              />
            </div>

            <button 
              type="button" 
              @click="isFilterOpen = true"
              class="flex items-center gap-1.5 bg-[#103860] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-95 active:scale-95 transition shadow-xs cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">tune</span>
              <span>Filter</span>
              <span 
                v-if="activeFilterCount > 0"
                class="bg-[#82f5c1] text-[#005137] px-1.5 py-0.5 rounded text-[11px] font-bold leading-none"
              >
                {{ activeFilterCount }}
              </span>
            </button>
          </div>

          <!-- Quick Filter Horizontal Scroll Chips -->
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 md:-mx-6 px-4 md:px-6">
            <button 
              v-for="cat in quickCategories" 
              :key="cat.id"
              type="button"
              @click="selectedCategory = cat.id"
              class="whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition cursor-pointer"
              :class="selectedCategory === cat.id ? 'bg-[#002242] text-white font-semibold shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'"
            >
              {{ cat.label }} ({{ getCategoryCount(cat.id) }})
            </button>
          </div>
        </section>

        <!-- Active Filter Pills (Dismissible) -->
        <section v-if="activeFilterCount > 0" class="px-4 md:px-6 pt-2 pb-1 flex flex-wrap items-center gap-1.5">
          <span 
            v-if="selectedCategory !== 'semua'"
            class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-700"
          >
            <span>Kategori: {{ quickCategories.find(c => c.id === selectedCategory)?.label }}</span>
            <button type="button" @click="selectedCategory = 'semua'" aria-label="Hapus filter kategori" class="hover:text-red-600 transition flex items-center cursor-pointer">
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>

          <span 
            v-if="selectedCut"
            class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-700"
          >
            <span>Bentuk: {{ selectedCut === 'utuh_bersih' ? 'Utuh Bersih' : selectedCut }}</span>
            <button type="button" @click="selectedCut = null" aria-label="Hapus filter bentuk" class="hover:text-red-600 transition flex items-center cursor-pointer">
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>

          <span 
            v-if="onlyInStock"
            class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-700"
          >
            <span>Stok Hari Ini</span>
            <button type="button" @click="onlyInStock = false" aria-label="Hapus filter stok" class="hover:text-red-600 transition flex items-center cursor-pointer">
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>

          <button 
            type="button" 
            @click="resetAllFilters"
            class="text-xs text-[#002242] font-semibold hover:underline px-1 py-0.5 ml-auto cursor-pointer"
          >
            Reset Filter
          </button>
        </section>

        <!-- State 1: Error Retry -->
        <div v-if="hasError" class="p-6">
          <CommonErrorRetry 
            title="Gagal Memuat Katalog"
            message="Koneksi ke fasilitas cold storage Muncar mengalami gangguan. Silakan coba lagi."
            @retry="handleRetry"
          />
        </div>

        <!-- State 2: Loading Skeleton -->
        <div v-else-if="isLoading" class="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4 animate-pulse">
          <div v-for="i in 6" :key="i" class="bg-white rounded-xl border border-slate-200 p-2 h-64 flex flex-col justify-between">
            <div class="w-full aspect-[4/3] bg-slate-200 rounded-lg"></div>
            <div class="h-4 w-3/4 bg-slate-200 rounded mt-2"></div>
            <div class="h-4 w-1/2 bg-slate-100 rounded"></div>
            <div class="h-8 bg-slate-200 rounded mt-2"></div>
          </div>
        </div>

        <!-- State 3: Empty State -->
        <div v-else-if="filteredProducts.length === 0" class="p-6">
          <CommonEmptyState 
            icon="search_off"
            title="Tidak Ada Produk Ditemukan"
            description="Tidak ada hasil laut yang cocok dengan filter atau kata kunci pencarian Anda."
            action-text="Reset Semua Filter"
            action-to="#"
            @action="resetAllFilters"
          />
        </div>

        <!-- Two-Column Product Grid (Responsive: 2 col mobile, 3 col md, 4 col lg/xl) -->
        <section v-else class="px-3 py-2 flex-1">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
            <article 
              v-for="p in filteredProducts" 
              :key="p.id"
              class="bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#002242]/40 transition duration-150 shadow-2xs"
            >
              <div>
                <NuxtLink :to="`/produk/${p.slug}`" class="block relative w-full aspect-[4/3] bg-slate-100 overflow-hidden group">
                  <img 
                    :src="p.images.hero" 
                    :alt="p.name" 
                    @error="handleImageError"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  
                  <span class="absolute top-2 left-2 bg-[#002242] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                    {{ p.qualityBadges[0] || 'Tangkapan Hari Ini' }}
                  </span>

                  <span class="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-200">
                    {{ p.exportGrade || 'Grade A' }}
                  </span>
                </NuxtLink>

                <div class="p-2.5 pb-1">
                  <NuxtLink :to="`/produk/${p.slug}`">
                    <h2 class="text-xs font-bold text-[#002242] line-clamp-2 leading-snug hover:underline">
                      {{ p.name }}
                    </h2>
                  </NuxtLink>
                  <div class="flex items-center gap-1.5 mt-1">
                    <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
                    <span class="text-[11px] text-[#006c4a] font-medium">
                      {{ p.unit === 'pack' ? `Sisa ${p.stockKg} pack` : `Stok: ${p.stockKg} kg` }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="p-2.5 pt-0 mt-2">
                <div class="mb-2">
                  <div class="text-xs font-bold text-[#002242] leading-tight">
                    Rp {{ p.pricePerKg.toLocaleString('id-ID') }} 
                    <span class="text-[11px] font-normal text-slate-500">/ {{ p.unit }}</span>
                  </div>
                </div>

                <button 
                  type="button" 
                  @click="handleAddToCart(p)"
                  class="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-[#103860] text-[#103860] hover:text-white active:scale-95 transition py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  <span>+ Keranjang</span>
                </button>
              </div>
            </article>
          </div>

          <!-- Port Logistic Assurance Callout -->
          <div class="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-[#103860] text-[#82f5c1] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[22px]">ac_unit</span>
            </div>
            <div class="flex-1">
              <div class="text-xs font-bold text-[#002242]">Jaminan Rantai Dingin Terpadu</div>
              <p class="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                Tangkapan nelayan langsung diproses di cold storage Muncar 0°C s/d -18°C sampai diantar ke pintu Anda.
              </p>
            </div>
          </div>
        </section>
      </main>

      <!-- ELEVATED BOTTOM SHEET OVERLAY (Stitch Filter & Urutkan) -->
      <Teleport to="body">
        <div 
          v-if="isFilterOpen" 
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity flex flex-col justify-end"
        >
          <!-- Tap outside to dismiss area -->
          <div aria-label="Tutup Filter" class="flex-1 w-full" @click="isFilterOpen = false"></div>

          <!-- The Bottom Sheet Container -->
          <div class="relative w-full max-w-md mx-auto bg-white rounded-t-xl shadow-xl flex flex-col max-h-[88vh] overflow-hidden">
            <!-- Drag Handle Indicator -->
            <div class="pt-3 pb-2 flex justify-center items-center bg-white">
              <div class="w-12 h-1.5 bg-slate-300 rounded-full"></div>
            </div>

            <!-- Sheet Header -->
            <div class="px-5 pb-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base font-bold text-[#103860] tracking-tight">Filter & Urutkan</h2>
                  <span class="px-2 py-0.5 bg-[#d6e4ff] text-[#001b3e] text-[11px] font-bold rounded-full">
                    {{ activeFilterCount }} Aktif
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">Sesuaikan tangkapan laut pilihan Anda</p>
              </div>

              <button 
                type="button"
                aria-label="Tutup" 
                @click="isFilterOpen = false"
                class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <!-- Scrollable Filter Body -->
            <div class="overflow-y-auto px-5 py-4 space-y-5 sheet-scrollbar">
              <!-- SECTION 1: Urutkan Berdasarkan -->
              <div>
                <div class="flex items-center justify-between mb-2.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-[#103860] flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-[#198754]">sort</span>
                    Urutkan Berdasarkan
                  </label>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    @click="selectedSort = 'paling_sesuai'"
                    class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition text-left"
                    :class="selectedSort === 'paling_sesuai' ? 'border-[#103860] bg-[#103860]/5 text-[#103860] font-bold' : 'border-slate-200 bg-white text-slate-600'"
                  >
                    <span>Paling Sesuai</span>
                    <span class="material-symbols-outlined text-sm">recommend</span>
                  </button>

                  <button 
                    type="button" 
                    @click="selectedSort = 'tangkapan_terbaru'"
                    class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition text-left"
                    :class="selectedSort === 'tangkapan_terbaru' ? 'border-[#103860] bg-[#103860]/5 text-[#103860] font-bold' : 'border-slate-200 bg-white text-slate-600'"
                  >
                    <span>Tangkapan Terbaru</span>
                    <span class="material-symbols-outlined text-sm">schedule</span>
                  </button>

                  <button 
                    type="button" 
                    @click="selectedSort = 'harga_terendah'"
                    class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition text-left"
                    :class="selectedSort === 'harga_terendah' ? 'border-[#103860] bg-[#103860]/5 text-[#103860] font-bold' : 'border-slate-200 bg-white text-slate-600'"
                  >
                    <span>Harga Terendah</span>
                    <span class="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>

                  <button 
                    type="button" 
                    @click="selectedSort = 'harga_tertinggi'"
                    class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition text-left"
                    :class="selectedSort === 'harga_tertinggi' ? 'border-[#103860] bg-[#103860]/5 text-[#103860] font-bold' : 'border-slate-200 bg-white text-slate-600'"
                  >
                    <span>Harga Tertinggi</span>
                    <span class="material-symbols-outlined text-sm">arrow_upward</span>
                  </button>
                </div>
              </div>

              <hr class="border-slate-200" />

              <!-- SECTION 2: Kategori Komoditas -->
              <div>
                <div class="flex items-center justify-between mb-2.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-[#103860] flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-[#198754]">set_meal</span>
                    Kategori Komoditas
                  </label>
                  <span class="text-[11px] text-[#198754] font-medium">{{ selectedCategory !== 'semua' ? '1 Terpilih' : 'Semua' }}</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="cat in quickCategories"
                    :key="cat.id"
                    type="button"
                    @click="selectedCategory = cat.id"
                    class="px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer"
                    :class="selectedCategory === cat.id ? 'bg-[#103860] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
                  >
                    {{ cat.label }}
                  </button>
                </div>
              </div>

              <hr class="border-slate-200" />

              <!-- SECTION 3: Bentuk Olahan & Potongan -->
              <div>
                <label class="text-xs font-bold uppercase tracking-wider text-[#103860] flex items-center gap-1.5 mb-2.5">
                  <span class="material-symbols-outlined text-[16px] text-[#198754]">content_cut</span>
                  Bentuk Olahan & Potongan
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <div 
                    @click="selectedCut = selectedCut === 'utuh_bersih' ? null : 'utuh_bersih'"
                    class="p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center gap-2"
                    :class="selectedCut === 'utuh_bersih' ? 'border-[#198754] bg-[#c9f3d5]/30 text-[#00210f] font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'"
                  >
                    <div class="w-4 h-4 rounded flex items-center justify-center" :class="selectedCut === 'utuh_bersih' ? 'bg-[#198754] text-white' : 'border border-slate-300'">
                      <span v-if="selectedCut === 'utuh_bersih'" class="material-symbols-outlined text-xs">check</span>
                    </div>
                    <span>Ikan Utuh Bersih</span>
                  </div>

                  <div 
                    @click="selectedCut = selectedCut === 'fillet' ? null : 'fillet'"
                    class="p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center gap-2"
                    :class="selectedCut === 'fillet' ? 'border-[#198754] bg-[#c9f3d5]/30 text-[#00210f] font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'"
                  >
                    <div class="w-4 h-4 rounded flex items-center justify-center" :class="selectedCut === 'fillet' ? 'bg-[#198754] text-white' : 'border border-slate-300'">
                      <span v-if="selectedCut === 'fillet'" class="material-symbols-outlined text-xs">check</span>
                    </div>
                    <span>Fillet Skin-on</span>
                  </div>

                  <div 
                    @click="selectedCut = selectedCut === 'steak' ? null : 'steak'"
                    class="p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center gap-2"
                    :class="selectedCut === 'steak' ? 'border-[#198754] bg-[#c9f3d5]/30 text-[#00210f] font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'"
                  >
                    <div class="w-4 h-4 rounded flex items-center justify-center" :class="selectedCut === 'steak' ? 'bg-[#198754] text-white' : 'border border-slate-300'">
                      <span v-if="selectedCut === 'steak'" class="material-symbols-outlined text-xs">check</span>
                    </div>
                    <span>Steak Melintang</span>
                  </div>
                </div>
              </div>

              <hr class="border-slate-200" />

              <!-- SECTION 4: Metode Simpan & Mutu Cold-Chain -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-bold uppercase tracking-wider text-[#103860] flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-[#198754]">ac_unit</span>
                    Metode Simpan & Mutu
                  </label>
                  <span class="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">HACCP Certified</span>
                </div>

                <div class="space-y-2">
                  <div 
                    @click="selectedStorage = 'chilled'"
                    class="p-3 rounded-xl border transition cursor-pointer flex items-center justify-between"
                    :class="selectedStorage === 'chilled' ? 'border-2 border-[#103860] bg-[#103860]/5' : 'border-slate-200 bg-white hover:bg-slate-50'"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-lg bg-[#d6e4ff] text-[#103860] flex items-center justify-center font-bold text-xs">
                        0°C
                      </div>
                      <div>
                        <p class="text-xs font-bold text-[#103860]">Segar Dingin / Chilled (0°-2°C)</p>
                        <p class="text-[10px] text-slate-500">Es curah segar pelabuhan, siap diolah hari ini</p>
                      </div>
                    </div>
                    <span v-if="selectedStorage === 'chilled'" class="material-symbols-outlined text-[#103860] text-lg">check_circle</span>
                  </div>

                  <div 
                    @click="selectedStorage = 'frozen'"
                    class="p-3 rounded-xl border transition cursor-pointer flex items-center justify-between"
                    :class="selectedStorage === 'frozen' ? 'border-2 border-[#103860] bg-[#103860]/5' : 'border-slate-200 bg-white hover:bg-slate-50'"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        -18
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-slate-800">Beku Kapal / Frozen (-18°C)</p>
                        <p class="text-[10px] text-slate-500">Air blast freezing langsung saat berlayar</p>
                      </div>
                    </div>
                    <span v-if="selectedStorage === 'frozen'" class="material-symbols-outlined text-[#103860] text-lg">check_circle</span>
                  </div>
                </div>
              </div>

              <hr class="border-slate-200" />

              <!-- SECTION 5: Ketersediaan -->
              <div class="pb-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#198754] text-lg">verified</span>
                    <div>
                      <p class="text-xs font-bold text-slate-800">Stok Tersedia Hari Ini</p>
                      <p class="text-[10px] text-slate-500">Hanya tampilkan komoditas yang siap kirim instan</p>
                    </div>
                  </div>
                  
                  <button 
                    type="button" 
                    role="switch"
                    :aria-checked="onlyInStock"
                    @click="onlyInStock = !onlyInStock"
                    class="w-12 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center cursor-pointer"
                    :class="onlyInStock ? 'bg-[#198754]' : 'bg-slate-300'"
                  >
                    <span 
                      class="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center"
                      :class="onlyInStock ? 'translate-x-6' : 'translate-x-0'"
                    >
                      <span v-if="onlyInStock" class="material-symbols-outlined text-[10px] text-[#198754] font-bold">check</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Sticky Bottom Action Bar inside Bottom Sheet -->
            <div class="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
              <button 
                type="button" 
                @click="resetAllFilters"
                class="flex-1 py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wide transition-all active:scale-95 text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <span class="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset Semua</span>
              </button>

              <button 
                type="button" 
                @click="isFilterOpen = false"
                class="flex-[2] py-3 px-4 rounded-xl bg-[#103860] hover:bg-[#0c2b4c] text-white font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Tampilkan {{ filteredProducts.length }} Produk</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </Teleport>

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
.sheet-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.sheet-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
}
.sheet-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
</style>

