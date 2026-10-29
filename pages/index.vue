<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PRODUCTS, normalizeProduct, type Product } from '~/data/products'
import CatalogProductCard from '~/components/catalog/ProductCard.vue'
import { useLocale } from '~/composables/useLocale'
import { useApi } from '~/composables/useApi'

const route = useRoute()
const router = useRouter()
const { t } = useLocale()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://lautberkahabadi.com'
const apiBase = (runtimeConfig.public?.apiBase as string) || 'https://api-muncar.ammarabufadhel.my.id'

useHead({
  title: computed(() => t(
    'Laut Berkah Abadi | D2C Cold Chain Seafood Muncar Banyuwangi',
    'Laut Berkah Abadi | Direct Fresh Seafood Muncar Banyuwangi Cold Chain'
  )),
  meta: [
    {
      name: 'description',
      content: computed(() => t(
        'Distribusi ikan segar Pelabuhan Muncar Banyuwangi langsung ke dapur Anda dengan rantai dingin presisi -20°C.',
        'Fresh fish from Muncar Port Banyuwangi delivered to your kitchen with precision -20°C cold chain.'
      ))
    },
    // Geo-Location Meta Tags: Pelabuhan Muncar Banyuwangi
    { name: 'geo.position', content: '-8.4328;114.3361' },
    { name: 'geo.placename', content: 'Pelabuhan Muncar, Kabupaten Banyuwangi, Jawa Timur, Indonesia' },
    { name: 'geo.region', content: 'ID-JI' },
    { name: 'ICBM', content: '-8.4328, 114.3361' },
    { property: 'og:title', content: computed(() => t('Laut Berkah Abadi | D2C Cold Chain Seafood Muncar Banyuwangi', 'Laut Berkah Abadi | Direct Fresh Seafood Muncar Banyuwangi Cold Chain')) },
    { property: 'og:description', content: computed(() => t('Distribusi ikan segar Pelabuhan Muncar Banyuwangi langsung ke dapur Anda dengan rantai dingin presisi -20°C.', 'Fresh fish from Muncar Port Banyuwangi delivered to your kitchen with precision -20°C cold chain.')) },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `${siteUrl}/` },
    { property: 'og:image', content: `${siteUrl}/brand/logo.webp` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Laut Berkah Abadi | D2C Cold Chain Seafood Muncar' },
    { name: 'twitter:description', content: 'Distribusi ikan segar Pelabuhan Muncar Banyuwangi langsung ke dapur Anda dengan rantai dingin presisi -20°C.' },
    { name: 'twitter:image', content: `${siteUrl}/brand/logo.webp` }
  ],
  link: [
    { rel: 'canonical', href: `${siteUrl}/` }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            name: 'Laut Berkah Abadi',
            alternateName: 'LBA Banyuwangi Seafood',
            url: siteUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteUrl}/katalog?q={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          },
          {
            '@type': 'FishStore',
            name: 'Laut Berkah Abadi Banyuwangi',
            image: `${siteUrl}/brand/logo.webp`,
            url: siteUrl,
            telephone: '+62-812-3456-7890',
            priceRange: 'Rp 25.000 - Rp 150.000',
            areaServed: ['Banyuwangi', 'Jember', 'Malang', 'Surabaya', 'Bali'],
            hasMap: 'https://maps.google.com/?q=-8.4328,114.3361',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Kawasan Pelabuhan Perikanan Pantai Muncar',
              addressLocality: 'Banyuwangi',
              addressRegion: 'Jawa Timur',
              postalCode: '68472',
              addressCountry: 'ID'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: -8.4328,
              longitude: 114.3361
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '05:00',
                closes: '21:00'
              }
            ]
          },
          {
            '@type': 'ItemList',
            name: 'Katalog Ikan Segar Cold Chain Muncar',
            itemListElement: PRODUCTS.map((p, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              url: `${siteUrl}/produk/${p.slug}`,
              item: {
                '@type': 'Product',
                name: p.name,
                url: `${siteUrl}/produk/${p.slug}`,
                description: p.description,
                image: p.images?.hero,
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
        ]
      })
    }
  ]
})

// Dynamic Banner Data with Fallback
export interface BannerItem {
  id: string
  type: 'text' | 'image'
  title: string
  subtitle: string
  imageUrl?: string
  badgeText?: string
  badgeIcon?: string
  tagText?: string
  ctaText?: string
  ctaAction?: 'link' | 'copy_voucher' | 'none'
  ctaLink?: string
  voucherCode?: string
  gradientPreset?: 'navy' | 'cyan' | 'ocean' | 'emerald' | string
  isActive?: boolean
  order?: number
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'banner-1',
    type: 'text',
    title: 'Ikan Segar Pilihan Hari Ini',
    subtitle: 'Hasil pancing harian nelayan Selat Bali dengan penanganan rantai dingin langsung di dermaga Muncar.',
    badgeText: 'Tangkapan Baru Mendarat',
    badgeIcon: 'verified',
    tagText: '05:30 WIB',
    ctaText: 'Lihat Produk',
    ctaAction: 'link',
    ctaLink: '/katalog',
    gradientPreset: 'navy',
    isActive: true,
    order: 1,
  },
  {
    id: 'banner-2',
    type: 'image',
    title: 'Promo Tangkapan Segar Pagi Hari',
    subtitle: 'Ikan laut segar langsung ditimbang dari perahu nelayan Muncar.',
    imageUrl: 'https://cdn.ammarabufadhel.my.id/products/asset-1534483509719-49b99676.webp',
    badgeText: 'Diskon s.d. 30%',
    badgeIcon: 'local_fire_department',
    tagText: 'Khusus Hari Ini',
    ctaText: 'Beli Sekarang',
    ctaAction: 'link',
    ctaLink: '/katalog',
    isActive: true,
    order: 2,
  },
  {
    id: 'banner-3',
    type: 'text',
    title: 'Armada Kurir Dingin LBA',
    subtitle: 'Bebas biaya kirim khusus pesanan area Banyuwangi & sekitarnya dengan kemasan thermal berpendingin.',
    badgeText: 'Gratis Ongkir Rantai Dingin',
    badgeIcon: 'local_shipping',
    tagText: 'DINGINBEBAS',
    ctaText: 'Salin Kode',
    ctaAction: 'copy_voucher',
    ctaLink: '',
    voucherCode: 'DINGINBEBAS',
    gradientPreset: 'cyan',
    isActive: true,
    order: 3,
  },
  {
    id: 'banner-4',
    type: 'image',
    title: 'Spesial Fillet & Steak Siap Masak',
    subtitle: 'Rendemen daging bersih presisi, tanpa duri dan sisik, siap masak.',
    imageUrl: 'https://cdn.ammarabufadhel.my.id/products/fillet-ikan-baronang-tulis-texture-bec184e3.webp',
    badgeText: 'Higienis & Bersih',
    badgeIcon: 'restaurant',
    tagText: 'Grade Ekspor',
    ctaText: 'Pilih Potongan',
    ctaAction: 'link',
    ctaLink: '/katalog',
    isActive: true,
    order: 4,
  },
]

const api = useApi()
const { data: fetchedBanners } = await useAsyncData<BannerItem[]>('home-banners', async () => {
  try {
    const res = await api.get<BannerItem[]>('/banners')
    if (res && Array.isArray(res) && res.length > 0) {
      return res.filter(b => b.isActive !== false)
    }
  } catch {
    // Graceful offline fallback
  }
  return DEFAULT_BANNERS
}, {
  default: () => DEFAULT_BANNERS,
})

const { data: fetchedProducts } = await useAsyncData<Product[]>('home-products', async () => {
  try {
    const res = await api.get<any[]>('/products')
    if (res && Array.isArray(res) && res.length > 0) {
      return res.map(normalizeProduct)
    }
  } catch {
    // Graceful offline fallback
  }
  return PRODUCTS
}, {
  default: () => PRODUCTS,
})

const banners = computed<BannerItem[]>(() => {
  const list = fetchedBanners.value && fetchedBanners.value.length > 0 ? fetchedBanners.value : DEFAULT_BANNERS
  return [...list].sort((a, b) => (a.order || 0) - (b.order || 0))
})

// Carousel Reactive Logic
const currentSlide = ref(0)
const totalSlides = computed(() => banners.value.length)
let slideInterval: any = null
const isHovered = ref(false)
const toastText = ref('')
const showToast = ref(false)

watch(totalSlides, (count) => {
  if (currentSlide.value >= count) {
    currentSlide.value = 0
  }
})

const triggerToast = (msg: string) => {
  toastText.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const updateCarousel = (index: number) => {
  if (totalSlides.value <= 0) {
    currentSlide.value = 0
    return
  }
  currentSlide.value = (index + totalSlides.value) % totalSlides.value
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

const getBannerGradient = (preset?: string) => {
  switch (preset) {
    case 'cyan':
      return 'from-[#102a4e] via-[#1a3c6e] to-[#004d61]'
    case 'emerald':
      return 'from-[#0c3756] via-[#005137] to-[#04281e]'
    case 'ocean':
      return 'from-[#0d2137] via-[#143b60] to-[#0f4c75]'
    case 'navy':
    default:
      return 'from-[#103860] via-[#0b2542] to-[#081a2e]'
  }
}

// Banner Call to Actions
const onBannerCta = (banner: BannerItem) => {
  if (banner.ctaAction === 'copy_voucher') {
    const code = banner.voucherCode || banner.tagText || 'DINGINBEBAS'
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
    }
    triggerToast(`Kode voucher ${code} berhasil disalin!`)
  } else if (banner.ctaAction === 'none') {
    // No action
  } else {
    const target = banner.ctaLink || '/katalog'
    if (target.startsWith('http')) {
      window.open(target, '_blank', 'noopener,noreferrer')
    } else {
      router.push(target)
    }
  }
}

// Backwards-compatible handlers
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

const CATEGORIES = computed<CategoryOption[]>(() => [
  { id: 'semua', label: t('Semua', 'All') },
  { id: 'ikan_utuh_bersih', label: t('Ikan Utuh Bersih', 'Whole Cleaned Fish') },
  { id: 'fillet', label: t('Fillet & Kupas', 'Fillet & Peeled') },
  { id: 'steak', label: t('Steak Melintang', 'Crosscut Steak') },
  { id: 'tulang_sup', label: t('Kepala & Tulang Sup', 'Head & Soup Bones') },
  { id: 'udang_cumi', label: t('Udang & Cumi', 'Shrimp & Squid') }
])

const products = ref<Product[]>(fetchedProducts.value && fetchedProducts.value.length > 0 ? fetchedProducts.value : PRODUCTS)
watch(fetchedProducts, (val) => {
  if (val && val.length > 0) products.value = val
})
const searchQuery = ref('')
const selectedCategory = ref('semua')
const isLoading = ref(false)
const hasError = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Smart Live Search & Suggestions State (Typesense + Redis)
const isSearchDropdownOpen = ref(false)
const isLoadingSuggestions = ref(false)
const isSearching = ref(false)
const typesenseMatchedSlugs = ref<string[]>([])
let debounceTimer: any = null

const searchSuggestData = ref<{
  suggestions: string[]
  products: Product[]
  is_trending?: boolean
}>({
  suggestions: ['Kakap Merah', 'Cumi Sero', 'Tenggiri Papan', 'Ikan Lemuru', 'Fillet Baronang', 'Tongkol Lisong'],
  products: [],
  is_trending: true
})

// In-memory client cache for 0ms keystroke & backspace response
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
      ? `${apiBase}/products/search/suggest?q=${encodeURIComponent(cleanTerm)}&limit=5`
      : `${apiBase}/products/search/suggest`
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
    if (!cleanTerm) {
      searchSuggestData.value = {
        suggestions: ['Kakap Merah', 'Cumi Sero', 'Tenggiri Papan', 'Ikan Lemuru', 'Fillet Baronang'],
        products: products.value.slice(0, 3),
        is_trending: true
      }
    }
  } finally {
    isLoadingSuggestions.value = false
  }
}

const performTypesenseSearch = async (term: string) => {
  if (!term || !term.trim()) {
    typesenseMatchedSlugs.value = []
    return
  }
  try {
    const res = await $fetch<any>(`${apiBase}/products/search/instant?q=${encodeURIComponent(term.trim())}`)
    if (res?.hits && Array.isArray(res.hits)) {
      typesenseMatchedSlugs.value = res.hits.map((h: any) => h.document.slug)
    }
  } catch (err) {
    typesenseMatchedSlugs.value = []
  }
}

const onSearchInput = (val: string) => {
  searchQuery.value = val
  isSearching.value = true
  isSearchDropdownOpen.value = true
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    isSearching.value = false
    const term = val.trim()
    performTypesenseSearch(term)
    fetchSearchSuggestions(term)
  }, 150)
}

const onSearchFocus = () => {
  isSearchDropdownOpen.value = true
  fetchSearchSuggestions(searchQuery.value)
}

const onSearchBlur = () => {
  setTimeout(() => {
    isSearchDropdownOpen.value = false
  }, 220)
}

const selectSuggestion = (keyword: string) => {
  searchQuery.value = keyword
  isSearchDropdownOpen.value = false
  performTypesenseSearch(keyword)
}

const navigateToProduct = (prodSlug: string) => {
  isSearchDropdownOpen.value = false
  router.push(`/produk/${prodSlug}`)
}

const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    isSearchDropdownOpen.value = false
    router.push(`/katalog?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  isSearching.value = false
  typesenseMatchedSlugs.value = []
  fetchSearchSuggestions('')
}

// ponytail: SSR hydration via useAsyncData renders instantly (0ms LCP); only re-fetch client-side if empty
onMounted(async () => {
  if (!products.value || products.value.length === 0) {
    try {
      const backendProducts = await api.get<any[]>('/products')
      if (backendProducts && Array.isArray(backendProducts) && backendProducts.length > 0) {
        products.value = backendProducts.map(normalizeProduct)
      } else {
        products.value = PRODUCTS
      }
    } catch {
      products.value = PRODUCTS
    }
  }
})

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

// Search matching logic (Typesense Synonyms & Typo-Tolerance + Local Fallback)
const isSearchMatch = (p: Product, query: string): boolean => {
  if (!query || !query.trim()) return true
  if (typesenseMatchedSlugs.value.includes(p.slug)) return true
  const q = query.trim().toLowerCase()
  const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false
  const typeMatch = p.fishType ? p.fishType.toLowerCase().includes(q) : false
  const catchMatch = p.catchMethod ? p.catchMethod.toLowerCase().includes(q) : false
  const descMatch = p.description ? p.description.toLowerCase().includes(q) : false
  return nameMatch || typeMatch || catchMatch || descMatch
}

// Filtered catalog results
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    return isCategoryMatch(p, selectedCategory.value) && isSearchMatch(p, searchQuery.value)
  })
})

// Produk Terlaris berdasarkan kuantitas terjual (soldCount tertinggi)
const topSellingProducts = computed(() => {
  return [...products.value]
    .filter(p => (p.soldCount || 0) > 0)
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 4)
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

let autoSlideTimeout: any = null

onMounted(() => {
  // Start carousel auto-slide after initial render settles (protects Core Web Vitals LCP)
  autoSlideTimeout = setTimeout(() => {
    startAutoSlide()
  }, 6500)

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
  if (autoSlideTimeout) {
    clearTimeout(autoSlideTimeout)
    autoSlideTimeout = null
  }
  stopAutoSlide()
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <h1 class="sr-only">Laut Berkah Abadi | D2C Cold Chain Seafood Muncar Banyuwangi</h1>
    <!-- Toast Notification -->
    <div v-if="showToast"
      class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#002242] text-white text-xs py-2 px-4 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
      <span class="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
      <span>{{ toastText }}</span>
    </div>

    <!-- Enhanced Interactive Hero Auto-Slider / Carousel (Stitch Code Implementation) -->
    <div id="hero-carousel" class="relative overflow-hidden shadow-md rounded-xl group" @mouseenter="isHovered = true"
      @mouseleave="isHovered = false" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <!-- Carousel Track -->
      <div id="carousel-track"
        class="flex transition-transform duration-500 ease-out carousel-track will-change-transform"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <!-- Dynamic Slides -->
        <div v-for="(banner, idx) in banners" :key="banner.id || idx"
          class="min-w-full min-h-[210px] sm:min-h-[240px] md:min-h-[260px] relative flex flex-col justify-between overflow-hidden select-none">
          <!-- Background Layer -->
          <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <template v-if="banner.type === 'image' && banner.imageUrl">
              <NuxtImg :src="banner.imageUrl" :alt="banner.title" class="object-cover w-full h-full"
                :loading="idx <= 1 ? 'eager' : 'lazy'"
                :fetchpriority="idx <= 1 ? 'high' : 'auto'"
                sizes="xs:100vw sm:100vw md:600px lg:1200px"
                width="1200" height="500" format="webp" />
              <div
                class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-950/30 sm:to-transparent">
              </div>
            </template>
            <template v-else>
              <div :class="['w-full h-full bg-gradient-to-br', getBannerGradient(banner.gradientPreset)]"></div>
              <div class="absolute rounded-full -right-8 -bottom-10 w-52 h-52 bg-cyan-500/10 blur-2xl"></div>
            </template>
          </div>

          <!-- Foreground Content Layer -->
          <div class="relative z-10 flex flex-col justify-between flex-1 h-full gap-3 p-5 text-white sm:p-6 md:p-7">
            <!-- Top Badges / Tag Bar -->
            <div class="flex items-center justify-between gap-2">
              <span v-if="banner.badgeText"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-xs shadow-2xs"
                :class="banner.type === 'image'
                  ? 'bg-white/20 border border-white/30 text-white'
                  : (banner.gradientPreset === 'cyan'
                    ? 'bg-cyan-400/15 border border-cyan-300/30 text-cyan-200'
                    : (banner.gradientPreset === 'emerald'
                      ? 'bg-amber-400/15 border border-amber-300/30 text-amber-200'
                      : 'bg-emerald-500/15 border border-emerald-400/30 text-[#85f8c4]'))">
                <span v-if="banner.badgeIcon" class="material-symbols-outlined text-[14px]">{{ banner.badgeIcon
                  }}</span>
                <span v-else class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{{ banner.badgeText }}</span>
              </span>

              <span v-if="banner.tagText" class="text-[11px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-md"
                :class="banner.type === 'image'
                  ? 'bg-black/50 text-amber-300 border border-amber-300/30'
                  : 'text-[#81a2d0] bg-white/10'">
                {{ banner.tagText }}
              </span>
            </div>

            <!-- Middle Headline & Subtitle -->
            <div class="flex flex-col gap-1.5 max-w-md my-auto">
              <h2
                class="text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl md:text-2xl line-clamp-2">
                {{ banner.title }}
              </h2>
              <p v-if="banner.subtitle" class="text-xs leading-relaxed sm:text-sm line-clamp-2"
                :class="banner.type === 'image' ? 'text-slate-200' : 'text-[#81a2d0]'">
                {{ banner.subtitle }}
              </p>
            </div>

            <!-- Bottom Action & Info Bar -->
            <div class="flex items-center justify-between pt-3 mt-1 border-t border-white/10">
              <span class="text-[11px] text-[#81a2d0] hidden sm:inline">
                {{ banner.voucherCode ? 'Gunakan saat checkout' : 'Rantai Dingin Terjamin -20°C' }}
              </span>
              <button v-if="banner.ctaAction !== 'none'" type="button" @click="onBannerCta(banner)"
                class="bg-white hover:bg-slate-100 text-[#002242] font-bold text-xs sm:text-sm px-4 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0">
                <span>{{ banner.ctaText || 'Lihat Produk' }}</span>
                <span class="material-symbols-outlined text-[16px]">
                  {{ banner.ctaAction === 'copy_voucher' ? 'content_copy' : 'arrow_forward' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Micro Prev / Next Controls -->
      <button id="carousel-prev" type="button" aria-label="Slide sebelumnya" @click="prevSlide"
        class="absolute z-20 flex items-center justify-center w-8 h-8 transition-opacity -translate-y-1/2 rounded-full opacity-0 cursor-pointer left-2 top-1/2 bg-black/30 hover:bg-black/55 text-white/90 backdrop-blur-xs group-hover:opacity-100 focus:opacity-100">
        <span class="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      <button id="carousel-next" type="button" aria-label="Slide berikutnya" @click="nextSlide"
        class="absolute z-20 flex items-center justify-center w-8 h-8 transition-opacity -translate-y-1/2 rounded-full opacity-0 cursor-pointer right-2 top-1/2 bg-black/30 hover:bg-black/55 text-white/90 backdrop-blur-xs group-hover:opacity-100 focus:opacity-100">
        <span class="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>

      <!-- Slide Indicators (Dots / Pills) -->
      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center z-20 pointer-events-auto">
        <button v-for="i in totalSlides" :key="i - 1" type="button" :aria-label="`Pindah ke slide ${i}`"
          @click="goToSlide(i - 1)" class="w-7 h-7 cursor-pointer flex items-center justify-center">
          <span class="carousel-dot h-1.5 rounded-full transition-all duration-300 block"
            :class="currentSlide === (i - 1) ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70 w-1.5'"></span>
        </button>
      </div>
    </div>

    <!-- Real-Time Search Bar with Typesense + Redis Smart Autocomplete Dropdown -->
    <div class="relative z-30 w-full">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
        <span class="material-symbols-outlined text-[20px]">search</span>
      </span>
      <input id="catalog-search-input" ref="searchInputRef" :value="searchQuery"
        @input="onSearchInput(($event.target as HTMLInputElement).value)" @focus="onSearchFocus" @blur="onSearchBlur"
        @keydown.esc="isSearchDropdownOpen = false" @keydown.enter="handleSearchSubmit" type="text"
        :placeholder="t('Cari ikan laut, fillet, cumi, pancing ulur...', 'Search seafood, fillet, squid, handline catch...')"
        class="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#103860] focus:border-transparent transition-all shadow-xs" />
      <!-- Spinner or Clear Button -->
      <span class="absolute inset-y-0 right-0 flex items-center pr-3">
        <span v-if="isSearching" class="material-symbols-outlined text-[18px] text-[#103860] animate-spin">
          progress_activity
        </span>
        <button v-else-if="searchQuery" type="button" @click="clearSearch"
          class="transition-colors cursor-pointer text-slate-400 hover:text-slate-600" aria-label="Bersihkan pencarian">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </span>

      <!-- Smart Autocomplete & Product Preview Dropdown (Redis + Typesense) -->
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="-translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-100 ease-in"
        leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-1 opacity-0">
        <div v-if="isSearchDropdownOpen"
          class="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200/90 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 text-left">
          <!-- Section A: Suggestions / Trending Pills -->
          <div class="p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
          <div v-if="searchSuggestData.products && searchSuggestData.products.length > 0" class="p-3 bg-slate-50/50">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-emerald-700">inventory_2</span>
              <span>{{ searchSuggestData.is_trending ? 'Tangkapan Pilihan Hari Ini' : 'Produk Terkait Langsung'
                }}</span>
            </div>

            <div class="space-y-1.5">
              <div v-for="p in searchSuggestData.products" :key="p.id" @mousedown.prevent="navigateToProduct(p.slug)"
                class="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-white border border-slate-200/70 hover:border-[#103860]/40 hover:shadow-2xs transition cursor-pointer group">
                <div class="flex items-center gap-2.5 min-w-0">
                  <img
                    v-if="p.images?.hero || p.images?.primary"
                    :src="p.images?.hero || p.images?.primary"
                    :alt="p.name"
                    class="object-cover w-10 h-10 border rounded-md border-slate-200 shrink-0 bg-slate-100" />
                  <div v-else class="w-10 h-10 border rounded-md border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center text-slate-300">
                    <span class="material-symbols-outlined text-[18px]">set_meal</span>
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-xs font-bold text-slate-800 group-hover:text-[#103860] truncate transition-colors">
                      {{ p.name }}
                    </h4>
                    <div class="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">{{ p.category
                        }}</span>
                      <span>•</span>
                      <span class="font-semibold" :class="(p.stockKg ?? 0) <= 0 ? 'text-rose-600' : 'text-emerald-700'">
                        {{ (p.stockKg ?? 0) <= 0 ? 'Stok Habis' : `Stok ${p.stockKg} ${p.unit || 'kg'}` }}
                      </span>
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

    <!-- Category Horizontal Chip Tabs -->
    <div class="flex gap-2 px-4 pb-1 -mx-4 overflow-x-auto no-scrollbar sm:mx-0 sm:px-0">
      <button v-for="cat in CATEGORIES" :key="cat.id" type="button" @click="selectedCategory = cat.id"
        class="flex-shrink-0 px-4 py-2 text-xs transition-all cursor-pointer rounded-xl" :class="selectedCategory === cat.id
          ? 'bg-[#002242] text-white font-bold shadow-xs'
          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'">
        {{ cat.label }}
      </button>
    </div>

    <!-- Section: Produk Terlaris (Flat & Clean) -->
    <section v-if="!searchQuery && selectedCategory === 'semua' && topSellingProducts.length > 0"
      class="pt-1 space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-[#002242] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-amber-600">local_fire_department</span>
            <span>{{ t('Produk Terlaris', 'Best Sellers') }}</span>
          </h3>
        </div>
        <NuxtLink to="/katalog"
          class="text-[#006c4a] hover:text-[#005137] text-xs font-bold flex items-center gap-0.5 transition-colors">
          <span>{{ t('Lihat Semua', 'View All') }}</span>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-4 sm:gap-4">
        <CatalogProductCard v-for="(product, idx) in topSellingProducts" :key="'top-' + product.id" :product="product"
          :rank-badge="`#${idx + 1} Terlaris`" />
      </div>
    </section>

    <!-- Subheader: Rekomendasi Pilihan & Link ke Katalog -->
    <div class="flex items-center justify-between pt-1">
      <div>
        <h3 class="text-sm font-bold text-[#002242]">{{ t('Rekomendasi Pilihan', 'Featured Recommendations') }}</h3>
      </div>
      <NuxtLink to="/katalog"
        class="text-[#006c4a] hover:text-[#005137] text-xs font-bold flex items-center gap-0.5 transition-colors">
        <span>{{ t('Lihat Semua', 'View All') }}</span>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      </NuxtLink>
    </div>

    <!-- State Handling (Loading, Error, Empty, Success Grid) -->
    <!-- State: Error Retry -->
    <CommonErrorRetry v-if="hasError" title="Terjadi Kendala Koneksi Data"
      message="Gagal memuat katalog hasil laut dari cold hub Muncar. Silakan coba lagi." retry-text="Coba Lagi"
      @retry="retryLoad" />

    <!-- State: Animated Skeleton Loading -->
    <CommonSkeletonLoader v-else-if="isLoading" type="card" :count="4" />

    <!-- State: Empty State with Reset Action -->
    <CommonEmptyState v-else-if="filteredProducts.length === 0" title="Hasil Laut Tidak Ditemukan"
      description="Tidak ada produk yang cocok dengan pencarian atau filter yang dipilih. Coba kata kunci lain atau tampilkan seluruh katalog."
      action-text="Tampilkan Semua Produk" action-icon="refresh" :action-to="''" @action="resetFilter" />

    <!-- State: Responsive Product Grid (2 col mobile, 3 col md, 4 col lg/xl) -->
    <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 md:gap-5">
      <CatalogProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
    </div>

    <!-- Cold chain delivery guarantee banner -->
    <div class="flex items-center gap-3 p-3 bg-white border shadow-xs border-slate-200/80 rounded-xl">
      <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#006c4a] flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-[18px]">ac_unit</span>
      </div>
      <p class="text-xs text-slate-600">
        <strong class="text-[#103860]">{{ t('Proteksi Rantai Dingin', 'Cold Chain Protection') }}:</strong>
        {{ t('Kemasan vacuum & ice gel beku di setiap paket.', 'Vacuum pack & frozen ice gel in every parcel.') }}
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
