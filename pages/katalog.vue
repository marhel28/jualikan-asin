<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PRODUCTS, type Product } from '~/data/products'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  hideMainHeader: false
})

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()

const handleToggleWishlist = async (productId: string, event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  if (!authStore.isAuthenticated) {
    router.push(`/auth?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  await wishlistStore.toggle(productId)
}
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://lautberkahabadi.com'

// State Management
const searchQueryInput = ref('')
const searchQuery = ref('')
const isSearching = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const selectedCategory = ref('semua')
const selectedSort = ref('paling_sesuai')
const selectedCut = ref<string | null>(null)
const selectedStorage = ref<string | null>(null)
const onlyInStock = ref(false)
const minPrice = ref(0)
const maxPrice = ref(500000)

// Infinite Scroll (Scroll Load) State
const displayLimit = ref(8)
const isLoadingMore = ref(false)
const scrollSentinel = ref<HTMLElement | null>(null)
let scrollObserver: IntersectionObserver | null = null

const isFilterOpen = ref(false)
const isLoading = ref(true)
const hasError = ref(false)
const addedToast = ref(false)
const toastProductName = ref('')

const productsList = ref<Product[]>([...PRODUCTS])

// Typesense Instant Search & Synonyms Integration
const typesenseMatchedSlugs = ref<string[]>([])

// Live Search Autocomplete & Smart Suggestions State (Redis + Typesense)
const isSearchDropdownOpen = ref(false)
const isLoadingSuggestions = ref(false)
const searchSuggestData = ref<{
  suggestions: string[]
  products: Product[]
  is_trending?: boolean
}>({
  suggestions: ['Kakap Merah', 'Cumi Sero', 'Tenggiri Papan', 'Ikan Lemuru', 'Fillet Baronang', 'Tongkol Lisong'],
  products: [],
  is_trending: true
})

// Client-side in-memory cache for instant 0ms backspace & repeat keystroke
const clientSuggestCache: Record<string, any> = {}

const fetchSearchSuggestions = async (term: string) => {
  if (!import.meta.client) return
  const cleanTerm = (term || '').trim().toLowerCase()
  if (clientSuggestCache[cleanTerm]) {
    searchSuggestData.value = clientSuggestCache[cleanTerm]
    return
  }
  isLoadingSuggestions.value = true
  try {
    const url = cleanTerm
      ? `http://localhost:8000/products/search/suggest?q=${encodeURIComponent(cleanTerm)}&limit=5`
      : 'http://localhost:8000/products/search/suggest'
    const res = await $fetch<any>(url, { timeout: 2500 })
    if (res) {
      searchSuggestData.value = {
        suggestions: res.suggestions || [],
        products: res.products || [],
        is_trending: res.is_trending ?? false
      }
      clientSuggestCache[cleanTerm] = searchSuggestData.value
    }
  } catch (err) {
    // Graceful fallback: filter local PRODUCTS
    if (!cleanTerm) {
      searchSuggestData.value = {
        suggestions: ['Kakap Merah', 'Cumi Sero', 'Tenggiri Papan', 'Ikan Lemuru', 'Fillet Baronang'],
        products: PRODUCTS.slice(0, 3),
        is_trending: true
      }
    }
  } finally {
    isLoadingSuggestions.value = false
  }
}

const onSearchFocus = () => {
  isSearchDropdownOpen.value = true
  fetchSearchSuggestions(searchQueryInput.value)
}

const onSearchBlur = () => {
  setTimeout(() => {
    isSearchDropdownOpen.value = false
  }, 220)
}

const selectSuggestion = (keyword: string) => {
  searchQueryInput.value = keyword
  searchQuery.value = keyword.trim()
  displayLimit.value = 8
  isSearchDropdownOpen.value = false
  performTypesenseSearch(keyword)
}

const navigateToProduct = (prodSlug: string) => {
  isSearchDropdownOpen.value = false
  router.push(`/produk/${prodSlug}`)
}

const performTypesenseSearch = async (term: string) => {
  if (!term || !term.trim()) {
    typesenseMatchedSlugs.value = []
    return
  }
  try {
    const res = await $fetch<any>(`http://localhost:8000/products/search/instant?q=${encodeURIComponent(term.trim())}`)
    if (res?.hits && Array.isArray(res.hits)) {
      typesenseMatchedSlugs.value = res.hits.map((h: any) => h.document.slug)
    }
  } catch (err) {
    typesenseMatchedSlugs.value = []
  }
}

// Semi-live debounced search handler
const onSearchInput = (val: string) => {
  searchQueryInput.value = val
  isSearching.value = true
  isSearchDropdownOpen.value = true
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchQuery.value = val.trim()
    isSearching.value = false
    displayLimit.value = 8
    performTypesenseSearch(searchQuery.value)
    fetchSearchSuggestions(searchQuery.value)
  }, 150)
}

const clearSearch = () => {
  searchQueryInput.value = ''
  searchQuery.value = ''
  isSearching.value = false
  displayLimit.value = 8
  typesenseMatchedSlugs.value = []
  fetchSearchSuggestions('')
}

// Fetch products directly from backend
const fetchProducts = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const api = useApi()
    const backendProducts = await api.get<any[]>('/products')
    if (backendProducts && Array.isArray(backendProducts) && backendProducts.length > 0) {
      productsList.value = backendProducts.map(bp => {
        const local = PRODUCTS.find(p => p.id === bp.id || p.slug === bp.slug)
        const bpHero = bp.images?.hero || bp.image_url || local?.images?.hero || 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp'
        return {
          id: bp.id,
          name: bp.name,
          fishType: bp.fishType || bp.fish_type || bp.category || local?.fishType || 'Hasil Laut Muncar',
          scientificName: bp.scientificName || bp.latin_name || local?.scientificName || '',
          slug: bp.slug,
          category: bp.category || local?.category || 'utuh',
          pricePerKg: Number(bp.pricePerKg ?? bp.price_per_kg) || local?.pricePerKg || 0,
          originalPricePerKg: local?.originalPricePerKg,
          rating: Number(bp.rating) || local?.rating || 4.9,
          reviewCount: bp.reviewCount || bp.review_count || local?.reviewCount || 100,
          freshnessScore: bp.freshnessScore || bp.freshness_score || local?.freshnessScore || 98,
          catchMethod: bp.catchMethod || bp.catch_method || local?.catchMethod || 'Pancing Nelayan Muncar',
          landingTime: bp.landingTime || bp.landing_time || local?.landingTime || '05:30 WIB Subuh',
          storageTemp: bp.storageTemp || bp.storage_temp || local?.storageTemp || 'Chilled 1.5 C',
          images: { hero: bpHero, gallery: [bpHero] },
          stockKg: Number(bp.stockKg ?? bp.stock_kg) ?? local?.stockKg ?? 50,
          minOrderKg: Number(bp.minOrderKg ?? bp.min_order_kg) || local?.minOrderKg || 1,
          description: bp.description || local?.description || '',
          isFeatured: bp.isFeatured ?? bp.is_featured ?? local?.isFeatured ?? false,
          availableCuts: bp.availableCuts || bp.available_cuts || local?.availableCuts || [],
          qualityBadges: bp.qualityBadges || bp.quality_badges || local?.qualityBadges || ['Tangkapan Segar Subuh', 'Cold Chain'],
          tags: local?.tags || ['Segar Muncar', 'Cold Chain'],
          unit: bp.unit || local?.unit || 'kg',
          soldCount: Number(bp.soldCount ?? bp.sold_count ?? local?.soldCount ?? 0),
          wishlistCount: Number(bp.wishlistCount ?? bp.wishlist_count ?? local?.wishlistCount ?? 0)
        } as Product
      })
    }
  } catch (err) {
    // Graceful fallback to static products
  } finally {
    isLoading.value = false
    nextTick(() => {
      setupScrollObserver()
    })
  }
}

onMounted(() => {
  // Sync URL query params if present
  if (route.query.q) {
    searchQueryInput.value = String(route.query.q)
    searchQuery.value = String(route.query.q)
  }
  if (route.query.kategori) {
    selectedCategory.value = String(route.query.kategori)
  }
  fetchProducts()
})

// Category options mapping (5 Standar Komoditas Hasil Laut Konsumen)
const quickCategories = [
  { id: 'semua', label: 'Semua', filterFn: () => true },
  { id: 'ikan_karang', label: 'Ikan Karang', filterFn: (p: Product) => p.category === 'Ikan Karang' },
  { id: 'ikan_pelagis', label: 'Ikan Pelagis', filterFn: (p: Product) => p.category === 'Ikan Pelagis' },
  { id: 'cumi_gurita', label: 'Cumi & Gurita', filterFn: (p: Product) => p.category === 'Cumi & Gurita' },
  { id: 'udang_krustasea', label: 'Udang & Krustasea', filterFn: (p: Product) => p.category === 'Udang & Krustasea' },
  { id: 'olahan_sup', label: 'Olahan & Sup', filterFn: (p: Product) => p.category === 'Olahan & Sup' }
]

// Calculate counts per quick category
const getCategoryCount = (catId: string) => {
  const cat = quickCategories.find(c => c.id === catId)
  if (!cat) return 0
  if (catId === 'semua') return productsList.value.length
  return productsList.value.filter(cat.filterFn).length
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
  let list = [...productsList.value]

  // 1. Semi-Live Search Query Filter (Typesense Synonyms & Typo-Tolerance + Local Fallback)
  if (searchQuery.value && searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(p =>
      typesenseMatchedSlugs.value.includes(p.slug) ||
      p.name.toLowerCase().includes(q) ||
      (p.fishType && p.fishType.toLowerCase().includes(q)) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.catchMethod && p.catchMethod.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
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

// Progressive Infinite Scroll Displayed Products
const displayedProducts = computed(() => {
  return filteredProducts.value.slice(0, displayLimit.value)
})

const hasMore = computed(() => {
  return displayLimit.value < filteredProducts.value.length
})

const loadMore = () => {
  if (isLoadingMore.value || !hasMore.value) return
  isLoadingMore.value = true
  setTimeout(() => {
    displayLimit.value = Math.min(displayLimit.value + 6, filteredProducts.value.length)
    isLoadingMore.value = false
  }, 180)
}

const setupScrollObserver = () => {
  if (typeof window === 'undefined') return
  if (scrollObserver) {
    scrollObserver.disconnect()
  }
  scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      loadMore()
    }
  }, {
    rootMargin: '250px'
  })

  if (scrollSentinel.value) {
    scrollObserver.observe(scrollSentinel.value)
  }
}

watch(scrollSentinel, (el) => {
  if (el && scrollObserver) {
    scrollObserver.observe(el)
  }
})

// Reset scroll limit whenever filters or search change
watch([selectedCategory, selectedSort, selectedCut, selectedStorage, onlyInStock, minPrice, maxPrice], () => {
  displayLimit.value = 8
})

onUnmounted(() => {
  if (scrollObserver) {
    scrollObserver.disconnect()
    scrollObserver = null
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// Quick Reset
const resetAllFilters = () => {
  searchQueryInput.value = ''
  searchQuery.value = ''
  isSearching.value = false
  selectedCategory.value = 'semua'
  selectedSort.value = 'paling_sesuai'
  selectedCut.value = null
  selectedStorage.value = null
  onlyInStock.value = false
  minPrice.value = 0
  maxPrice.value = 500000
  displayLimit.value = 8
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
  const target = (event?.target || event?.currentTarget) as HTMLImageElement | null
  const fallback = 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp'
  if (target && target.src !== fallback) {
    target.src = fallback
  }
}

// SEO & Schema.org JSON-LD
useHead(() => {
  return {
    title: 'Katalog Hasil Laut & Ikan Segar Muncar | Laut Berkah Abadi Banyuwangi',
    meta: [
      { name: 'description', content: 'Katalog lengkap ikan laut segar, fillet sashimi, udang vaname, cumi sero tangkapan pancing Selat Bali dan cold storage Muncar.' },
      { property: 'og:title', content: 'Katalog Hasil Laut & Ikan Segar Muncar | Laut Berkah Abadi' },
      { property: 'og:description', content: 'Beli ikan segar dengan garansi rantai dingin 0°C s/d -18°C langsung dari Pelabuhan Muncar Banyuwangi.' },
      { property: 'og:image', content: `${siteUrl}/brand/logo.png` },
      { property: 'og:url', content: `${siteUrl}/katalog` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Katalog Hasil Laut & Ikan Segar Muncar | Laut Berkah Abadi' },
      { name: 'twitter:description', content: 'Beli ikan segar dengan garansi rantai dingin 0°C s/d -18°C langsung dari Pelabuhan Muncar Banyuwangi.' }
    ],
    link: [
      { rel: 'canonical', href: `${siteUrl}/katalog` }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Beranda',
                  item: `${siteUrl}/`
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Katalog',
                  item: `${siteUrl}/katalog`
                }
              ]
            },
            {
              '@type': 'CollectionPage',
              name: 'Katalog Hasil Laut & Ikan Segar Muncar',
              description: 'Katalog lengkap ikan laut segar tangkapan pancing ulur Selat Bali dan fasilitas cold storage Muncar Banyuwangi.',
              url: `${siteUrl}/katalog`,
              mainEntity: {
                '@type': 'ItemList',
                name: 'Katalog Seafood Laut Berkah Abadi Banyuwangi',
                itemListElement: PRODUCTS.map((p, idx) => ({
                  '@type': 'ListItem',
                  position: idx + 1,
                  url: `${siteUrl}/produk/${p.slug}`,
                  item: {
                    '@type': 'Product',
                    name: p.name,
                    url: `${siteUrl}/produk/${p.slug}`,
                    description: p.description,
                    image: p.images.hero,
                    offers: {
                      '@type': 'Offer',
                      url: `${siteUrl}/produk/${p.slug}`,
                      price: p.pricePerKg,
                      priceCurrency: 'IDR',
                      availability: p.stockKg > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
                    }
                  }
                }))
              }
            }
          ]
        })
      }
    ]
  }
})
</script>

<template>
  <div class="bg-[#F7F9FB] text-[#191C1E] antialiased flex justify-center min-h-screen">
    <!-- Container Frame: full width with max-w-6xl on desktop md+ -->
    <div
      class="relative flex flex-col w-full max-w-md min-h-screen pb-24 bg-white shadow-xs md:max-w-6xl md:my-4 md:rounded-xl md:border md:border-slate-200/80">

      <!-- TopAppBar (Mobile only, hidden on md+) -->
      <header
        class="sticky top-0 z-40 flex items-center justify-between w-full h-16 max-w-md px-4 mx-auto border-b md:hidden bg-white/95 backdrop-blur-md border-slate-200">
        <button type="button" aria-label="Kembali" @click="goBack"
          class="flex items-center justify-center p-2 rounded-lg text-[#002242] hover:bg-slate-100 active:scale-95 transition-transform duration-150 cursor-pointer">
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
          <NuxtLink to="/keranjang" aria-label="Keranjang Belanja"
            class="flex items-center justify-center p-2 rounded-lg text-[#002242] hover:bg-slate-100 active:scale-95 transition-transform duration-150 cursor-pointer">
            <span class="material-symbols-outlined text-[22px]">shopping_cart</span>
            <span v-if="cartStore.totalItemCount > 0"
              class="absolute top-1 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#006c4a] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
              {{ cartStore.totalItemCount }}
            </span>
          </NuxtLink>
        </div>
      </header>

      <!-- Desktop Breadcrumb / Header Title Bar -->
      <div class="items-center justify-between hidden px-6 pt-5 pb-3 border-b md:flex border-slate-100">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="font-semibold text-[#103860]">Katalog Produk Muncar</span>
        </div>
      </div>

      <!-- Toast Feedback -->
      <div v-if="addedToast"
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#006c4a] text-white text-xs font-medium py-2 px-4 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
        <span class="material-symbols-outlined text-[16px]">check_circle</span>
        <span>{{ toastProductName }} masuk ke keranjang!</span>
      </div>

      <!-- Main Content Canvas -->
      <main class="flex flex-col flex-1">
        <!-- Sticky Search and Filter Controls -->
        <section
          class="sticky top-16 md:top-[65px] z-30 bg-white/95 backdrop-blur-md px-4 md:px-6 pt-3 pb-2 border-b border-slate-200/80 space-y-3">
          <!-- Search input & Filter CTA -->
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <span class="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input :value="searchQueryInput" @input="onSearchInput(($event.target as HTMLInputElement).value)"
                @focus="onSearchFocus" @blur="onSearchBlur" @keydown.esc="isSearchDropdownOpen = false" type="text"
                placeholder="Cari ikan laut, fillet, cumi, udang..."
                class="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#002242] focus:border-[#002242] transition shadow-2xs" />
              <!-- Semi-live Spinner or Clear Button -->
              <span class="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                <span v-if="isSearching" class="material-symbols-outlined text-[18px] text-[#103860] animate-spin">
                  progress_activity
                </span>
                <button v-else-if="searchQueryInput" type="button" @click="clearSearch"
                  class="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                  title="Hapus kata kunci">
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </span>

              <!-- Smart Autocomplete & Product Preview Dropdown (Redis + Typesense) -->
              <Transition enter-active-class="transition duration-150 ease-out"
                enter-from-class="-translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-100 ease-in" leave-from-class="translate-y-0 opacity-100"
                leave-to-class="-translate-y-1 opacity-0">
                <div v-if="isSearchDropdownOpen"
                  class="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200/90 shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                  <!-- Section A: Suggestions / Trending Pills -->
                  <div class="p-3">
                    <div class="flex items-center justify-between mb-2">
                      <div
                        class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <span class="material-symbols-outlined text-[15px]"
                          :class="searchSuggestData.is_trending ? 'text-emerald-700' : 'text-[#103860]'">
                          {{ searchSuggestData.is_trending ? 'trending_up' : 'search' }}
                        </span>
                        <span>{{ searchSuggestData.is_trending ? 'Pencarian Populer Muncar' : 'Saran Pencarian Terkait'
                          }}</span>
                      </div>
                      <span v-if="isLoadingSuggestions"
                        class="material-symbols-outlined text-[14px] text-slate-400 animate-spin">
                        progress_activity
                      </span>
                    </div>

                    <!-- Pills for trending or List for autocomplete -->
                    <div v-if="searchSuggestData.is_trending" class="flex flex-wrap gap-1.5">
                      <button v-for="kw in searchSuggestData.suggestions" :key="kw" type="button"
                        @mousedown.prevent="selectSuggestion(kw)"
                        class="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 hover:text-[#103860] text-slate-700 rounded-lg text-xs font-medium border border-slate-200/80 transition cursor-pointer flex items-center gap-1">
                        <span class="material-symbols-outlined text-[13px] text-slate-400">history</span>
                        <span>{{ kw }}</span>
                      </button>
                    </div>

                    <div v-else-if="searchSuggestData.suggestions && searchSuggestData.suggestions.length > 0"
                      class="space-y-0.5">
                      <button v-for="kw in searchSuggestData.suggestions" :key="kw" type="button"
                        @mousedown.prevent="selectSuggestion(kw)"
                        class="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 hover:text-[#103860] transition flex items-center justify-between cursor-pointer group">
                        <div class="flex items-center gap-2">
                          <span
                            class="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-[#103860]">search</span>
                          <span>{{ kw }}</span>
                        </div>
                        <span
                          class="material-symbols-outlined text-[14px] text-slate-300 group-hover:text-[#103860]">north_west</span>
                      </button>
                    </div>
                  </div>

                  <!-- Section B: Direct Product Cards Preview -->
                  <div v-if="searchSuggestData.products && searchSuggestData.products.length > 0"
                    class="p-3 bg-slate-50/50">
                    <div
                      class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[15px] text-emerald-700">inventory_2</span>
                      <span>{{ searchSuggestData.is_trending ? 'Tangkapan Pilihan Hari Ini' : 'Produk Terkait Langsung'
                        }}</span>
                    </div>

                    <div class="space-y-1.5">
                      <div v-for="p in searchSuggestData.products" :key="p.id"
                        @mousedown.prevent="navigateToProduct(p.slug)"
                        class="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-white border border-slate-200/70 hover:border-[#103860]/40 hover:shadow-2xs transition cursor-pointer group">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <img
                            :src="p.images?.hero || p.images?.primary || 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-c149b4dd.webp'"
                            :alt="p.name"
                            class="object-cover w-10 h-10 border rounded-md border-slate-200 shrink-0 bg-slate-100" />
                          <div class="min-w-0">
                            <h4
                              class="text-xs font-bold text-slate-800 group-hover:text-[#103860] truncate transition-colors">
                              {{ p.name }}
                            </h4>
                            <div class="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">{{ p.category
                                }}</span>
                              <span>•</span>
                              <span class="font-semibold text-emerald-700">Stok {{ p.stockKg }} kg</span>
                            </div>
                          </div>
                        </div>

                        <div class="text-right shrink-0">
                          <div class="text-xs font-bold font-mono text-[#103860]">
                            Rp{{ p.pricePerKg?.toLocaleString('id-ID') }}
                          </div>
                          <span class="text-[10px] text-slate-400">/ {{ p.unit || 'kg' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <button type="button" @click="isFilterOpen = true"
              class="flex items-center gap-1.5 bg-[#103860] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-95 active:scale-95 transition shadow-xs cursor-pointer shrink-0">
              <span class="material-symbols-outlined text-[18px]">tune</span>
              <span>Filter</span>
              <span v-if="activeFilterCount > 0"
                class="bg-[#82f5c1] text-[#005137] px-1.5 py-0.5 rounded text-[11px] font-bold leading-none">
                {{ activeFilterCount }}
              </span>
            </button>
          </div>

          <!-- Quick Filter Horizontal Scroll Chips -->
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 md:-mx-6 px-4 md:px-6">
            <button v-for="cat in quickCategories" :key="cat.id" type="button" @click="selectedCategory = cat.id"
              class="whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition cursor-pointer"
              :class="selectedCategory === cat.id ? 'bg-[#002242] text-white font-semibold shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'">
              {{ cat.label }} ({{ getCategoryCount(cat.id) }})
            </button>
          </div>
        </section>

        <!-- Active Filter Pills (Dismissible) -->
        <section v-if="activeFilterCount > 0" class="px-4 md:px-6 pt-2 pb-1 flex flex-wrap items-center gap-1.5">
          <span v-if="selectedCategory !== 'semua'"
            class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-700">
            <span>Kategori: {{quickCategories.find(c => c.id === selectedCategory)?.label}}</span>
            <button type="button" @click="selectedCategory = 'semua'" aria-label="Hapus filter kategori"
              class="flex items-center transition cursor-pointer hover:text-red-600">
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>

          <span v-if="selectedCut"
            class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-700">
            <span>Bentuk: {{ selectedCut === 'utuh_bersih' ? 'Utuh Bersih' : selectedCut }}</span>
            <button type="button" @click="selectedCut = null" aria-label="Hapus filter bentuk"
              class="flex items-center transition cursor-pointer hover:text-red-600">
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>

          <span v-if="onlyInStock"
            class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-700">
            <span>Stok Hari Ini</span>
            <button type="button" @click="onlyInStock = false" aria-label="Hapus filter stok"
              class="flex items-center transition cursor-pointer hover:text-red-600">
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>

          <button type="button" @click="resetAllFilters"
            class="text-xs text-[#002242] font-semibold hover:underline px-1 py-0.5 ml-auto cursor-pointer">
            Reset Filter
          </button>
        </section>

        <!-- State 1: Error Retry -->
        <div v-if="hasError" class="p-6">
          <CommonErrorRetry title="Gagal Memuat Katalog"
            message="Koneksi ke server pusat data mengalami gangguan. Silakan coba lagi." @retry="handleRetry" />
        </div>

        <!-- State 2: Loading Skeleton (8 High-Fidelity Cards with Shimmer) -->
        <section v-else-if="isLoading" class="flex-1 px-3 py-2">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
            <div v-for="i in 8" :key="i"
              class="flex flex-col justify-between overflow-hidden bg-white border border-slate-200 rounded-xl shadow-2xs animate-pulse">
              <div>
                <div class="relative w-full aspect-[4/3] bg-slate-200">
                  <div class="absolute w-24 h-4 rounded shadow-xs top-2 left-2 bg-slate-300"></div>
                </div>
                <div class="p-2.5 pb-1 space-y-2">
                  <div class="h-3.5 bg-slate-200 rounded w-5/6"></div>
                  <div class="w-3/5 h-3 rounded bg-slate-100"></div>
                  <div class="flex items-center gap-1.5 pt-1">
                    <div class="w-2 h-2 rounded-full bg-slate-200"></div>
                    <div class="h-2.5 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              <div class="p-2.5 pt-0 mt-2 space-y-2">
                <div class="w-2/3 h-4 rounded bg-slate-200"></div>
                <div class="w-full h-8 rounded-lg bg-slate-200"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- State 3: Empty State -->
        <div v-else-if="filteredProducts.length === 0" class="p-6">
          <CommonEmptyState icon="search_off" title="Tidak Ada Produk Ditemukan"
            description="Tidak ada hasil laut yang cocok dengan filter atau kata kunci pencarian Anda."
            action-text="Reset Semua Filter" action-to="#" @action="resetAllFilters" />
        </div>

        <!-- Two-Column Product Grid with Progressive Scroll Load (Infinite Scroll) -->
        <section v-else class="flex-1 px-3 py-2">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
            <article v-for="p in displayedProducts" :key="p.id" @click="router.push(`/produk/${p.slug}`)"
              class="bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#002242]/40 transition duration-150 shadow-2xs cursor-pointer group">
              <div>
                <div class="block relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                  <NuxtImg :src="p.images.hero" :alt="p.name" @error="handleImageError"
                    class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    width="400" height="300" format="webp" loading="lazy" />

                  <span
                    class="absolute top-2 left-2 bg-[#002242] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                    {{ p.qualityBadges[0] || 'Tangkapan Hari Ini' }}
                  </span>

                  <button
                    type="button"
                    @click.stop="handleToggleWishlist(p.id, $event)"
                    :aria-label="wishlistStore.has(p.id) ? 'Hapus dari favorit' : 'Tambah ke favorit'"
                    class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-colors shadow-xs hover:bg-white cursor-pointer z-10"
                    :class="wishlistStore.has(p.id) ? 'text-rose-600' : 'text-slate-400 hover:text-slate-700'"
                  >
                    <span class="material-symbols-outlined text-[17px]" :class="{ 'fill-1': wishlistStore.has(p.id) }">
                      favorite
                    </span>
                  </button>
                </div>

                <div class="p-2.5 pb-1">
                  <h2
                    class="text-xs font-bold text-[#002242] line-clamp-2 leading-snug group-hover:text-[#103860] no-underline transition-colors">
                    {{ p.name }}
                  </h2>
                  <div v-if="p.soldCount" class="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                    <span class="material-symbols-outlined text-[13px] text-emerald-700">sell</span>
                    <span class="font-medium text-slate-700">{{ p.soldCount }} terjual</span>
                  </div>
                  <div class="flex items-center gap-1.5 mt-1">
                    <span class="inline-block w-1.5 h-1.5 rounded-full"
                      :class="p.stockKg <= 0 ? 'bg-rose-500' : p.stockKg <= 10 ? 'bg-amber-500' : 'bg-[#006c4a]'"></span>
                    <span class="text-[11px] font-medium"
                      :class="p.stockKg <= 0 ? 'text-rose-600 font-semibold' : p.stockKg <= 10 ? 'text-amber-700' : 'text-[#006c4a]'">
                      {{ p.stockKg <= 0 ? 'Stok Habis' : p.unit === 'pack' ? `Sisa ${p.stockKg} pack` : `Stok:
                        ${p.stockKg} kg` }} </span>
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

                <button type="button"
                  @click.stop="p.stockKg > 0 ? handleAddToCart(p) : router.push(`/produk/${p.slug}`)"
                  :disabled="p.stockKg <= 0"
                  class="w-full flex items-center justify-center gap-1.5 transition py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer"
                  :class="p.stockKg <= 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-75' : 'bg-slate-100 hover:bg-[#103860] text-[#103860] hover:text-white active:scale-95 shadow-2xs'">
                  <span class="material-symbols-outlined text-[16px]">{{ p.stockKg <= 0 ? 'block' : 'add_shopping_cart'
                      }}</span>
                      <span>{{ p.stockKg <= 0 ? 'Stok Kosong' : '+ Keranjang' }}</span>
                </button>
              </div>
            </article>
          </div>

          <!-- Progressive Scroll Load Sentinel & Status -->
          <div ref="scrollSentinel" class="flex flex-col items-center justify-center py-6 text-center">
            <div v-if="hasMore"
              class="inline-flex items-center gap-2 text-xs font-semibold text-[#103860] bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-2xs">
              <span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              <span>Memuat lebih banyak hasil laut...</span>
            </div>
            <div v-else-if="filteredProducts.length > 0"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 py-2">
              <span class="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
              <span>Menampilkan seluruh {{ filteredProducts.length }} komoditas hasil laut Muncar</span>
            </div>
          </div>

          <!-- Port Logistic Assurance Callout -->
          <div class="flex items-center gap-3 p-3 mt-2 border bg-slate-50 border-slate-200 rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-[#103860] text-[#82f5c1] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[22px]">ac_unit</span>
            </div>
            <div class="flex-1">
              <div class="text-xs font-bold text-[#002242]">Jaminan Rantai Dingin Terpadu</div>
              <p class="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                Tangkapan nelayan langsung diproses higienis suhu terkontrol 0°C s/d -18°C sampai diantar ke pintu Anda.
              </p>
            </div>
          </div>
        </section>
      </main>

      <!-- ELEVATED BOTTOM SHEET OVERLAY (Stitch Filter & Urutkan) -->
      <Teleport to="body">
        <div v-if="isFilterOpen"
          class="fixed inset-0 z-[9999] flex flex-col justify-end transition-opacity bg-slate-950/70 backdrop-blur-md">
          <!-- Tap outside to dismiss area -->
          <div aria-label="Tutup Filter" class="flex-1 w-full" @click="isFilterOpen = false"></div>

          <!-- The Bottom Sheet Container -->
          <div
            class="relative w-full max-w-md mx-auto bg-white rounded-t-xl shadow-xl flex flex-col max-h-[88vh] overflow-hidden">
            <!-- Drag Handle Indicator -->
            <div class="flex items-center justify-center pt-3 pb-2 bg-white">
              <div class="w-12 h-1.5 bg-slate-300 rounded-full"></div>
            </div>

            <!-- Sheet Header -->
            <div class="flex items-center justify-between px-5 pb-3 bg-white border-b border-slate-200">
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base font-bold text-[#103860] tracking-tight">Filter & Urutkan</h2>
                  <span class="px-2 py-0.5 bg-[#d6e4ff] text-[#001b3e] text-[11px] font-bold rounded-full">
                    {{ activeFilterCount }} Aktif
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">Sesuaikan tangkapan laut pilihan Anda</p>
              </div>

              <button type="button" aria-label="Tutup" @click="isFilterOpen = false"
                class="flex items-center justify-center transition-all rounded-full cursor-pointer w-9 h-9 text-slate-500 hover:bg-slate-100 active:scale-95">
                <span class="text-xl material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Scrollable Filter Body -->
            <div class="px-5 py-4 space-y-5 overflow-y-auto sheet-scrollbar">
              <!-- SECTION 1: Urutkan Berdasarkan -->
              <div>
                <div class="flex items-center justify-between mb-2.5">
                  <label class="text-xs font-bold uppercase tracking-wider text-[#103860] flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[16px] text-[#198754]">sort</span>
                    Urutkan Berdasarkan
                  </label>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" @click="selectedSort = 'paling_sesuai'"
                    class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition text-left"
                    :class="selectedSort === 'paling_sesuai' ? 'border-[#103860] bg-[#103860]/5 text-[#103860] font-bold' : 'border-slate-200 bg-white text-slate-600'">
                    <span>Paling Sesuai</span>
                    <span class="text-sm material-symbols-outlined">recommend</span>
                  </button>

                  <button type="button" @click="selectedSort = 'tangkapan_terbaru'"
                    class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition text-left"
                    :class="selectedSort === 'tangkapan_terbaru' ? 'border-[#103860] bg-[#103860]/5 text-[#103860] font-bold' : 'border-slate-200 bg-white text-slate-600'">
                    <span>Tangkapan Terbaru</span>
                    <span class="text-sm material-symbols-outlined">schedule</span>
                  </button>

                  <button type="button" @click="selectedSort = 'harga_terendah'"
                    class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition text-left"
                    :class="selectedSort === 'harga_terendah' ? 'border-[#103860] bg-[#103860]/5 text-[#103860] font-bold' : 'border-slate-200 bg-white text-slate-600'">
                    <span>Harga Terendah</span>
                    <span class="text-sm material-symbols-outlined">arrow_downward</span>
                  </button>

                  <button type="button" @click="selectedSort = 'harga_tertinggi'"
                    class="flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition text-left"
                    :class="selectedSort === 'harga_tertinggi' ? 'border-[#103860] bg-[#103860]/5 text-[#103860] font-bold' : 'border-slate-200 bg-white text-slate-600'">
                    <span>Harga Tertinggi</span>
                    <span class="text-sm material-symbols-outlined">arrow_upward</span>
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
                  <span class="text-[11px] text-[#198754] font-medium">{{ selectedCategory !== 'semua' ? '1 Terpilih' :
                    'Semua' }}</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button v-for="cat in quickCategories" :key="cat.id" type="button" @click="selectedCategory = cat.id"
                    class="px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer"
                    :class="selectedCategory === cat.id ? 'bg-[#103860] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'">
                    {{ cat.label }}
                  </button>
                </div>
              </div>

              <hr class="border-slate-200" />

              <!-- SECTION 3: Bentuk Olahan & Potongan -->
              <div>
                <label
                  class="text-xs font-bold uppercase tracking-wider text-[#103860] flex items-center gap-1.5 mb-2.5">
                  <span class="material-symbols-outlined text-[16px] text-[#198754]">content_cut</span>
                  Bentuk Olahan & Potongan
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <div @click="selectedCut = selectedCut === 'utuh_bersih' ? null : 'utuh_bersih'"
                    class="p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center gap-2"
                    :class="selectedCut === 'utuh_bersih' ? 'border-[#198754] bg-[#c9f3d5]/30 text-[#00210f] font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'">
                    <div class="flex items-center justify-center w-4 h-4 rounded"
                      :class="selectedCut === 'utuh_bersih' ? 'bg-[#198754] text-white' : 'border border-slate-300'">
                      <span v-if="selectedCut === 'utuh_bersih'" class="text-xs material-symbols-outlined">check</span>
                    </div>
                    <span>Ikan Utuh Bersih</span>
                  </div>

                  <div @click="selectedCut = selectedCut === 'fillet' ? null : 'fillet'"
                    class="p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center gap-2"
                    :class="selectedCut === 'fillet' ? 'border-[#198754] bg-[#c9f3d5]/30 text-[#00210f] font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'">
                    <div class="flex items-center justify-center w-4 h-4 rounded"
                      :class="selectedCut === 'fillet' ? 'bg-[#198754] text-white' : 'border border-slate-300'">
                      <span v-if="selectedCut === 'fillet'" class="text-xs material-symbols-outlined">check</span>
                    </div>
                    <span>Fillet Skin-on</span>
                  </div>

                  <div @click="selectedCut = selectedCut === 'steak' ? null : 'steak'"
                    class="p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center gap-2"
                    :class="selectedCut === 'steak' ? 'border-[#198754] bg-[#c9f3d5]/30 text-[#00210f] font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'">
                    <div class="flex items-center justify-center w-4 h-4 rounded"
                      :class="selectedCut === 'steak' ? 'bg-[#198754] text-white' : 'border border-slate-300'">
                      <span v-if="selectedCut === 'steak'" class="text-xs material-symbols-outlined">check</span>
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
                  <span class="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">HACCP
                    Certified</span>
                </div>

                <div class="space-y-2">
                  <div @click="selectedStorage = 'chilled'"
                    class="flex items-center justify-between p-3 transition border cursor-pointer rounded-xl"
                    :class="selectedStorage === 'chilled' ? 'border-2 border-[#103860] bg-[#103860]/5' : 'border-slate-200 bg-white hover:bg-slate-50'">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-7 h-7 rounded-lg bg-[#d6e4ff] text-[#103860] flex items-center justify-center font-bold text-xs">
                        0°C
                      </div>
                      <div>
                        <p class="text-xs font-bold text-[#103860]">Segar Dingin / Chilled (0°-2°C)</p>
                        <p class="text-[10px] text-slate-500">Es curah segar pelabuhan, siap diolah hari ini</p>
                      </div>
                    </div>
                    <span v-if="selectedStorage === 'chilled'"
                      class="material-symbols-outlined text-[#103860] text-lg">check_circle</span>
                  </div>

                  <div @click="selectedStorage = 'frozen'"
                    class="flex items-center justify-between p-3 transition border cursor-pointer rounded-xl"
                    :class="selectedStorage === 'frozen' ? 'border-2 border-[#103860] bg-[#103860]/5' : 'border-slate-200 bg-white hover:bg-slate-50'">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="flex items-center justify-center text-xs font-bold rounded-lg w-7 h-7 bg-slate-100 text-slate-600">
                        -18
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-slate-800">Beku Kapal / Frozen (-18°C)</p>
                        <p class="text-[10px] text-slate-500">Air blast freezing langsung saat berlayar</p>
                      </div>
                    </div>
                    <span v-if="selectedStorage === 'frozen'"
                      class="material-symbols-outlined text-[#103860] text-lg">check_circle</span>
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

                  <button type="button" role="switch" :aria-checked="onlyInStock" @click="onlyInStock = !onlyInStock"
                    class="w-12 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center cursor-pointer"
                    :class="onlyInStock ? 'bg-[#198754]' : 'bg-slate-300'">
                    <span
                      class="flex items-center justify-center w-5 h-5 transition-transform duration-200 ease-in-out transform bg-white rounded-full shadow-md"
                      :class="onlyInStock ? 'translate-x-6' : 'translate-x-0'">
                      <span v-if="onlyInStock"
                        class="material-symbols-outlined text-[10px] text-[#198754] font-bold">check</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Sticky Bottom Action Bar inside Bottom Sheet -->
            <div class="flex items-center gap-3 p-4 bg-white border-t border-slate-200">
              <button type="button" @click="resetAllFilters"
                class="flex items-center justify-center flex-1 gap-1 px-4 py-3 text-xs font-bold tracking-wide text-center transition-all border cursor-pointer rounded-xl border-slate-300 hover:bg-slate-50 text-slate-700 active:scale-95">
                <span class="text-sm material-symbols-outlined">restart_alt</span>
                <span>Reset Semua</span>
              </button>

              <button type="button" @click="isFilterOpen = false"
                class="flex-[2] py-3 px-4 rounded-xl bg-[#103860] hover:bg-[#0c2b4c] text-white font-bold text-xs tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
                <span>Tampilkan {{ filteredProducts.length }} Produk</span>
                <span class="text-sm material-symbols-outlined">arrow_forward</span>
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
