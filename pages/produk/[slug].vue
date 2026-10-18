<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PRODUCTS, type Product } from '~/data/products'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'

definePageMeta({
  hideMainHeader: true,
  hideBottomNav: true
})

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://lautberkahabadi.com'

const slug = computed(() => String(route.params.slug || ''))

// Find product by slug or alias
const product = computed((): Product | null => {
  const found = PRODUCTS.find(p => p.slug === slug.value)
  if (found) return found
  if (slug.value.includes('tenggiri')) {
    return PRODUCTS.find(p => p.id === 'tenggiri-papan') || PRODUCTS[0]
  }
  if (!slug.value || slug.value.includes('baronang')) {
    return PRODUCTS.find(p => p.id === 'baronang-tulis') || PRODUCTS[0]
  }
  return PRODUCTS[0]
})

// Display title matching benchmark format
const displayName = computed(() => {
  if (!product.value) return 'Fillet Ikan Tenggiri'
  if (slug.value.includes('fillet') || product.value.id === 'tenggiri-papan') {
    return 'Fillet Ikan Tenggiri - Laut Berkah Abadi'
  }
  return `${product.value.name} - Laut Berkah Abadi`
})

// Gram variants matching seafoodsegarmalang.id benchmark
interface GramOption {
  grams: number
  price: number
  inStock: boolean
}

const gramVariants: GramOption[] = [
  { grams: 130, price: 19968, inStock: true },
  { grams: 140, price: 21504, inStock: true },
  { grams: 150, price: 23040, inStock: true },
  { grams: 160, price: 24576, inStock: true },
  { grams: 170, price: 26112, inStock: true },
  { grams: 180, price: 27648, inStock: true },
  { grams: 190, price: 29184, inStock: true },
  { grams: 200, price: 30720, inStock: true },
  { grams: 210, price: 32256, inStock: true },
  { grams: 220, price: 33792, inStock: true },
  { grams: 230, price: 35328, inStock: true },
  { grams: 240, price: 36864, inStock: true },
  { grams: 250, price: 38400, inStock: true },
  { grams: 260, price: 39936, inStock: true },
  { grams: 270, price: 41472, inStock: true },
  { grams: 100, price: 15360, inStock: true },
  { grams: 110, price: 16896, inStock: true },
  { grams: 120, price: 18432, inStock: true }
]

// Interactive States (default to 190 gr matching benchmark screenshot)
const selectedGrams = ref<number>(190)
const selectedPrice = ref<number>(29184)
const selectedSkin = ref<string>('Tanpa Kulit')
const quantity = ref<number>(1)
const activeTab = ref<'desc' | 'spec'>('desc')
const activeImageIndex = ref<number>(0)
const addedSuccess = ref<boolean>(false)
const showToast = ref<boolean>(false)
const toastText = ref<string>('')
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)

// User Likes / Wishlist state
const isLiked = computed(() => {
  return product.value ? wishlistStore.has(product.value.id) : false
})

const displayWishlistCount = computed(() => {
  if (!product.value) return 0
  const base = product.value.wishlistCount || 0
  return isLiked.value ? base + 1 : base
})

const triggerToast = (msg: string) => {
  toastText.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const toggleLike = () => {
  if (!product.value) return
  wishlistStore.toggle(product.value.id)
  if (isLiked.value) {
    triggerToast('Ditambahkan ke favorit')
  } else {
    triggerToast('Dihapus dari favorit')
  }
}

// Photo gallery list
const galleryImages = computed(() => {
  if (!product.value) return []
  const imgs: string[] = []
  if (product.value.images?.hero) imgs.push(product.value.images.hero)
  if (product.value.images?.texture) imgs.push(product.value.images.texture)
  if (product.value.images?.scaleSlip) imgs.push(product.value.images.scaleSlip)
  return imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80']
})

const currentHeroImage = computed(() => {
  return galleryImages.value[activeImageIndex.value] || galleryImages.value[0]
})

const maxStock = computed(() => {
  return product.value?.stockKg || 15
})

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
}

// Gram variant selector
const selectWeight = (option: GramOption) => {
  if (!option.inStock) return
  selectedGrams.value = option.grams
  selectedPrice.value = option.price
}

// Quantity Stepper
const changeQty = (delta: number) => {
  const newVal = quantity.value + delta
  if (newVal >= 1 && newVal <= maxStock.value) {
    quantity.value = newVal
  }
}

// Navigation helpers
const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const shareProduct = () => {
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({
      title: displayName.value,
      text: 'Pesan ikan segar berkualitas di Laut Berkah Abadi',
      url: window.location.href
    }).catch(() => {})
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    triggerToast('Tautan berhasil disalin')
  } else {
    triggerToast('Tautan siap dibagikan')
  }
}

// Add to Cart
const handleAddToCart = () => {
  if (!product.value) return

  cartStore.addItem(
    {
      id: `${product.value.id}-${selectedGrams.value}g`,
      name: `${displayName.value.replace(' - Laut Berkah Abadi', '')} (${selectedGrams.value}g)`,
      slug: product.value.slug,
      imageUrl: currentHeroImage.value,
      pricePerKg: selectedPrice.value,
      unit: 'pack'
    },
    'fillet_tanpa_kulit',
    false,
    quantity.value
  )

  addedSuccess.value = true
  triggerToast('Berhasil masuk keranjang')
  setTimeout(() => {
    addedSuccess.value = false
  }, 2000)
}

// Buy Now (Direct Checkout)
const handleBuyNow = () => {
  handleAddToCart()
  router.push('/checkout')
}

const handleRetry = () => {
  hasError.value = false
  isLoading.value = false
}

// Rekomendasi produk serupa/terkait
const recommendedProducts = computed(() => {
  if (!product.value) return []
  const current = product.value
  return PRODUCTS
    .filter(p => p.id !== current.id)
    .map(p => {
      let score = 0
      if (p.category === current.category) score += 5
      if (p.landingPort === current.landingPort) score += 2
      if (p.originZone === current.originZone) score += 2
      if (p.isFeatured) score += 1
      return { product: p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => item.product)
})

const goToProduct = (recSlug: string) => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  router.push(`/produk/${recSlug}`)
}

const handleQuickAdd = (recProduct: Product, event: Event) => {
  event.stopPropagation()
  const defaultCut = recProduct.availableCuts[0]?.type || 'utuh_bersih'
  cartStore.addItem(
    {
      id: recProduct.id,
      name: recProduct.name,
      slug: recProduct.slug,
      imageUrl: recProduct.images.hero,
      pricePerKg: recProduct.pricePerKg,
      unit: recProduct.unit
    },
    defaultCut,
    false,
    1
  )
  triggerToast(`${recProduct.name} masuk keranjang`)
}

// Initialize on mount
onMounted(() => {
  wishlistStore.initFromStorage()
})

// SEO
useHead(() => {
  const currentProd = product.value
  if (!currentProd) {
    return { title: 'Produk | Laut Berkah Abadi' }
  }

  const pageTitle = `${displayName.value}`
  const canonicalUrl = `${siteUrl}/produk/${currentProd.slug}`

  return {
    title: pageTitle,
    meta: [
      { name: 'description', content: currentProd.description },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: currentProd.description },
      { property: 'og:image', content: galleryImages.value[0] },
      { property: 'og:url', content: canonicalUrl }
    ]
  }
})
</script>

<template>
  <div class="bg-[#F8FAFC] text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center">
    <!-- Desktop breadcrumb (hidden mobile, aligns to max-w-6xl) -->
    <nav class="hidden md:flex w-full max-w-5xl lg:max-w-6xl px-6 pt-3 pb-1 items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="text-slate-300">/</span>
      <NuxtLink to="/katalog" class="hover:text-[#103860] transition-colors">Katalog</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-slate-900 font-medium truncate">{{ displayName }}</span>
    </nav>

    <!-- Viewport Shell: expanded on desktop md+ -->
    <div class="w-full max-w-md md:max-w-5xl lg:max-w-6xl bg-white min-h-screen flex flex-col border-x border-slate-200/80 shadow-none relative pb-28 md:pb-12 md:my-6 md:rounded-xl md:border">
      
      <!-- 1. Top Navigation & App Bar: mobile only (desktop uses global navbar from default.vue) -->
      <header class="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <button 
            type="button"
            aria-label="Kembali" 
            @click="goBack"
            class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-[#002242] active:scale-95 cursor-pointer"
          >
            <span class="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 class="text-base font-semibold text-[#002242]">Detail Produk</h1>
        </div>

        <div class="flex items-center gap-1">
          <!-- Love / Like Button -->
          <button 
            type="button"
            :aria-label="isLiked ? 'Hapus dari Disukai' : 'Sukai Produk'" 
            @click="toggleLike"
            class="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            :class="isLiked ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:bg-slate-100 hover:text-rose-500'"
            :title="isLiked ? 'Disukai' : 'Suka'"
          >
            <span 
              class="material-symbols-outlined text-[22px] transition-transform duration-200"
              :class="isLiked ? 'scale-110 text-rose-600' : ''"
              :style="isLiked ? { fontVariationSettings: `'FILL' 1` } : { fontVariationSettings: `'FILL' 0` }"
            >
              favorite
            </span>
          </button>

          <!-- Cart Icon Link -->
          <NuxtLink 
            to="/keranjang" 
            aria-label="Keranjang Belanja" 
            class="w-9 h-9 rounded-full relative flex items-center justify-center hover:bg-slate-100 transition-colors text-[#002242] active:scale-95 cursor-pointer"
          >
            <span class="material-symbols-outlined text-[22px]">shopping_cart</span>
            <span 
              v-if="cartStore.totalItemsCount > 0"
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#006c4a] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-white shadow-xs"
            >
              {{ cartStore.totalItemsCount }}
            </span>
          </NuxtLink>
        </div>
      </header>

      <!-- Toast Feedback -->
      <div 
        v-if="showToast" 
        class="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#002242] text-white text-xs py-2 px-4 rounded-full shadow-lg flex items-center gap-2 animate-bounce"
      >
        <span class="material-symbols-outlined text-[16px] text-rose-400">favorite</span>
        <span>{{ toastText }}</span>
      </div>

      <!-- State: Error State with Retry -->
      <div v-if="hasError" class="p-6">
        <CommonErrorRetry 
          title="Gagal Memuat Produk"
          message="Silakan coba lagi beberapa saat lagi."
          @retry="handleRetry" 
        />
      </div>

      <!-- State: Loading Skeleton -->
      <div v-else-if="isLoading" class="p-4 flex flex-col gap-4 animate-pulse">
        <div class="w-full aspect-[4/3] rounded-xl bg-slate-200"></div>
        <div class="h-6 w-3/4 rounded bg-slate-200"></div>
        <div class="h-4 w-1/2 rounded bg-slate-100"></div>
      </div>

      <!-- State: Main Product Detail View matching seafoodsegarmalang.id -->
      <main v-else-if="product" class="flex-1 flex flex-col">
        <!-- 2-Column Responsive Layout on Desktop (Left Gallery, Right Configuration) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-6 items-start">
          <!-- Left Column: Product Image Showcase -->
          <div class="w-full">
            <div class="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80">
              <img 
                id="main-product-img"
                :src="currentHeroImage" 
                :alt="displayName" 
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
            </div>

            <!-- Thumbnail Strip (only if multiple photos) -->
            <div v-if="galleryImages.length > 1" class="flex gap-2 mt-3 overflow-x-auto no-scrollbar py-0.5">
              <button 
                v-for="(imgSrc, idx) in galleryImages" 
                :key="idx"
                type="button"
                @click="activeImageIndex = idx"
                class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all focus:outline-none cursor-pointer"
                :class="activeImageIndex === idx ? 'border-2 border-[#002242]' : 'border border-slate-200 opacity-70 hover:opacity-100'"
                :aria-label="`Pilih Foto ${idx + 1}`"
              >
                <img :src="imgSrc" :alt="`Foto ${idx + 1}`" class="w-full h-full object-cover" @error="handleImageError" />
              </button>
            </div>
          </div>

          <!-- Right Column: Product Config & Actions -->
          <div class="flex flex-col">
            <!-- 3. Category Supertitle, Title & Price -->
            <div class="pb-2">
              <div class="text-xs text-slate-500 font-normal">Hasil Laut Segar</div>

              <h2 class="text-lg sm:text-2xl font-bold text-slate-900 leading-snug mt-1">
                {{ displayName }}
              </h2>

              <!-- Social Proof: Terjual & Difavoritkan -->
              <div class="flex items-center gap-1.5 mt-1.5 text-[11px]">
                <span class="flex items-center gap-0.5 font-semibold text-slate-700">
                  <span class="material-symbols-outlined text-[13px] text-emerald-700">sell</span>
                  <span>{{ product.soldCount || 0 }} terjual</span>
                </span>
                <span class="text-slate-300">•</span>
                <span class="flex items-center gap-0.5 font-medium" :class="isLiked ? 'text-rose-600' : 'text-slate-500'">
                  <span class="material-symbols-outlined text-[13px]" :class="{ 'text-rose-500 fill-1': isLiked }">favorite</span>
                  <span>{{ displayWishlistCount }} difavoritkan</span>
                </span>
              </div>

              <!-- Rekomendasi Olahan Dapur -->
              <div v-if="product.culinaryIdeas?.length" class="mt-2.5 flex items-center flex-wrap gap-1.5">
                <span class="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-amber-600">skillet</span>
                  Cocok dimasak:
                </span>
                <span
                  v-for="dish in product.culinaryIdeas"
                  :key="dish"
                  class="bg-amber-50 text-amber-900 border border-amber-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                >
                  {{ dish }}
                </span>
              </div>

              <div class="mt-2 text-xl font-bold text-slate-900" id="price-display">
                Rp{{ selectedPrice.toLocaleString('id-ID') }}
                <span class="text-xs text-slate-500 font-normal ml-1.5">(Rp19.968 - Rp36.306)</span>
              </div>

              <div class="border-b border-slate-200/80 my-3.5"></div>
            </div>

            <!-- 4. Berat: 190 Gr Section with Gram Chips Grid -->
            <div class="pb-4">
              <div class="text-xs text-slate-700 mb-2.5">
                Berat: <strong class="text-slate-900 font-bold" id="selected-weight-label">{{ selectedGrams }} Gr</strong>
              </div>

              <!-- Weight chips matching exact benchmark layout -->
              <div class="grid grid-cols-6 sm:grid-cols-7 gap-1.5 text-center text-xs">
                <template v-for="opt in gramVariants" :key="opt.grams">
                  <button 
                    v-if="opt.inStock"
                    type="button"
                    @click="selectWeight(opt)"
                    class="py-1.5 px-0.5 rounded-lg transition-all cursor-pointer font-medium text-center"
                    :class="selectedGrams === opt.grams 
                      ? 'border border-[#002242] bg-[#002242] text-white font-bold shadow-xs' 
                      : 'text-slate-800 hover:bg-slate-100 text-[11px] sm:text-xs'"
                    :aria-label="`Pilih berat ${opt.grams} gram`"
                  >
                    {{ opt.grams }} gr
                  </button>
                  <div 
                    v-else
                    class="diagonal-cross py-1.5 px-0.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 select-none cursor-not-allowed text-[11px]"
                    :title="`Varian ${opt.grams}gr sedang habis`"
                  >
                    {{ opt.grams }} gr
                  </div>
                </template>
              </div>
            </div>

            <!-- 5. Kulit: - Section matching benchmark screenshot -->
            <div class="pb-4">
              <div class="text-xs text-slate-700 mb-2.5">
                Kulit: <span class="text-slate-900 font-semibold">{{ selectedSkin }}</span>
              </div>

              <div class="flex items-center gap-2.5">
                <!-- Dengan Kulit (Crossed out with red diagonal X) -->
                <div 
                  class="diagonal-cross px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 select-none cursor-not-allowed text-xs"
                  title="Varian Dengan Kulit sedang habis"
                >
                  Dengan Kulit
                </div>

                <!-- Tanpa Kulit (Active) -->
                <button
                  type="button"
                  @click="selectedSkin = 'Tanpa Kulit'"
                  class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer"
                  :class="selectedSkin === 'Tanpa Kulit' 
                    ? 'border-[#002242] bg-[#002242] text-white font-semibold' 
                    : 'border-slate-200 text-slate-800 hover:bg-slate-50'"
                >
                  Tanpa Kulit
                </button>
              </div>
            </div>

            <!-- 6. Quantity & Share Section matching benchmark screenshot -->
            <div class="pb-5">
              <div class="text-xs font-semibold text-slate-800 mb-2">Quantity</div>

              <div class="flex items-center gap-2.5">
                <!-- Stepper Component -->
                <div class="inline-flex items-center border border-slate-300 rounded-lg bg-white h-10">
                  <button 
                    type="button"
                    aria-label="Kurang kuantitas" 
                    @click="changeQty(-1)"
                    :disabled="quantity <= 1"
                    class="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 rounded-l-lg transition-colors cursor-pointer text-lg leading-none"
                  >
                    -
                  </button>
                  <span id="quantity-input" class="w-10 text-center font-bold text-xs text-slate-900">
                    {{ quantity }}
                  </span>
                  <button 
                    type="button"
                    aria-label="Tambah kuantitas" 
                    @click="changeQty(1)"
                    :disabled="quantity >= maxStock"
                    class="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 rounded-r-lg transition-colors cursor-pointer text-lg leading-none"
                  >
                    +
                  </button>
                </div>

                <!-- Share Button -->
                <button 
                  type="button"
                  aria-label="Bagikan Produk" 
                  @click="shareProduct"
                  class="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[18px]">share</span>
                </button>
              </div>
            </div>

            <!-- Inline CTA Buttons for Desktop md+ -->
            <div class="hidden md:flex items-center gap-3 pt-2">
              <button 
                type="button"
                @click="handleAddToCart"
                class="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-[#103860] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>+ Keranjang</span>
              </button>

              <button 
                type="button"
                @click="handleBuyNow"
                class="flex-[1.2] h-11 bg-[#103860] hover:bg-[#002242] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Beli Sekarang</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 7. Tabs: Deskripsi & Spesifikasi -->
        <div class="px-4 py-4 border-t border-slate-100">
          <div class="flex border-b border-slate-200 text-xs">
            <button 
              type="button"
              @click="activeTab = 'desc'"
              class="pb-2 px-3 transition-all cursor-pointer"
              :class="activeTab === 'desc' ? 'font-bold text-[#103860] border-b-2 border-[#103860]' : 'text-slate-500 hover:text-slate-800'"
            >
              Deskripsi
            </button>
            <button 
              type="button"
              @click="activeTab = 'spec'"
              class="pb-2 px-3 transition-all cursor-pointer"
              :class="activeTab === 'spec' ? 'font-bold text-[#103860] border-b-2 border-[#103860]' : 'text-slate-500 hover:text-slate-800'"
            >
              Spesifikasi
            </button>
          </div>

          <!-- Tab Content 1: Deskripsi -->
          <div v-show="activeTab === 'desc'" class="py-3 text-xs leading-relaxed text-slate-600" id="tab-desc">
            <p>{{ product.description }}</p>
          </div>

          <!-- Tab Content 2: Spesifikasi -->
          <div v-show="activeTab === 'spec'" class="py-3 text-xs space-y-2 text-slate-600" id="tab-spec">
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-400">Jenis</span>
              <span class="font-medium text-slate-800">{{ product.name }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-400">Kondisi</span>
              <span class="font-medium text-slate-800">Fillet Segar (Tanpa Duri & Kulit)</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-400">Suhu Rantai Dingin</span>
              <span class="font-medium text-slate-800">0°C - 2°C (Cold Storage)</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-400">Kemasan</span>
              <span class="font-medium text-slate-800">Vacuum Seal Food Grade</span>
            </div>
          </div>
        </div>

        <!-- 8. Rekomendasi Produk Terkait (Stay & Cross-Sell) -->
        <section v-if="recommendedProducts.length > 0" class="px-4 py-5 border-t border-slate-100 bg-slate-50/50">
          <div class="flex items-center justify-between mb-3.5">
            <div>
              <h2 class="text-sm md:text-base font-bold text-slate-900 tracking-tight">Rekomendasi Pilihan untuk Anda</h2>
              <p class="text-[11px] text-slate-500">Hasil laut segar sejenis dengan standar mutu pendaratan harian</p>
            </div>
            <NuxtLink to="/katalog" class="text-xs font-semibold text-[#103860] hover:underline flex items-center gap-0.5">
              <span>Semua</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </NuxtLink>
          </div>

          <!-- Mobile: Horizontal Smooth Scroll; Desktop: 4-Column Grid -->
          <div class="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto no-scrollbar snap-x pb-2 pt-0.5">
            <div 
              v-for="rec in recommendedProducts"
              :key="rec.id"
              @click="goToProduct(rec.slug)"
              class="w-[170px] md:w-auto flex-shrink-0 snap-start bg-white rounded-xl border border-slate-200/90 hover:border-[#103860]/40 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between p-2.5 group"
            >
              <div>
                <!-- Image & Badge -->
                <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                  <img 
                    :src="rec.images.hero" 
                    :alt="rec.name" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    @error="handleImageError"
                  />
                  <span class="absolute top-1.5 left-1.5 bg-[#103860]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    {{ rec.unit === 'pack' ? `${rec.packWeightGrams}g` : 'Per Kg' }}
                  </span>
                </div>

                <!-- Info -->
                <h3 class="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#103860] transition-colors">
                  {{ rec.name }}
                </h3>
                <p class="text-[10px] text-slate-400 italic line-clamp-1 mb-1">
                  {{ rec.scientificName }}
                </p>

                <!-- Terjual (ringan) -->
                <div class="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                  <span class="text-slate-700 font-medium">{{ rec.soldCount || 0 }} terjual</span>
                </div>

                <div class="text-xs font-extrabold text-[#006c4a]">
                  Rp {{ rec.pricePerKg.toLocaleString('id-ID') }}
                </div>
              </div>

              <!-- Quick Add Button -->
              <button
                type="button"
                @click="handleQuickAdd(rec, $event)"
                class="mt-2.5 w-full h-8 bg-slate-100 hover:bg-[#103860] text-[#103860] hover:text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Tambah ke keranjang"
              >
                <span class="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                <span>+ Keranjang</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- State: Empty State -->
      <div v-else class="p-6">
        <CommonEmptyState 
          icon="search_off"
          title="Produk Tidak Ditemukan"
          description="Produk yang dicari sedang tidak tersedia."
          action-text="Kembali ke Katalog"
          action-to="/katalog"
          action-icon="arrow_back"
        />
      </div>

      <!-- 9. Polished Clean Bottom Action Bar (Mobile only, hidden md+) -->
      <footer 
        v-if="product" 
        class="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 flex items-center gap-2.5 z-50 shadow-lg"
      >
        <!-- WhatsApp Concierge Button -->
        <a 
          aria-label="Konsultasi WhatsApp" 
          :href="'https://wa.me/6281234567890?text=' + encodeURIComponent('Halo Laut Berkah Abadi, saya tertarik dengan ' + displayName)" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-emerald-50/60 hover:border-emerald-300 transition-colors shadow-2xs active:scale-95 cursor-pointer"
          title="Chat WhatsApp"
        >
          <svg class="w-6 h-6 fill-current text-[#25D366]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19-.09-1.1-.54-1.27-.6-.17-.06-.3-.09-.43.09-.13.19-.49.6-.6.73-.11.13-.23.15-.42.06-.19-.09-.81-.3-1.54-.95-.57-.51-.95-1.14-1.06-1.33-.11-.19-.01-.3.08-.39.09-.08.19-.23.29-.34.1-.11.13-.19.19-.32.06-.13.03-.24-.01-.34-.05-.09-.43-1.04-.6-1.42-.16-.37-.32-.32-.44-.33-.11-.01-.24-.01-.37-.01-.13 0-.34.05-.52.24-.18.19-.69.67-.69 1.64s.71 1.91.81 2.04c.1.13 1.4 2.14 3.39 3 .47.21.84.33 1.13.42.48.15.91.13 1.25.08.38-.06 1.1-.45 1.26-.89.15-.43.15-.81.11-.89-.05-.08-.18-.13-.37-.22" />
          </svg>
        </a>

        <!-- + Keranjang Button -->
        <button 
          type="button"
          @click="handleAddToCart"
          class="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-[#103860] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          <span>+ Keranjang</span>
        </button>

        <!-- Beli Sekarang Button -->
        <button 
          id="buy-now-btn"
          type="button"
          @click="handleBuyNow"
          class="flex-[1.2] h-11 bg-[#103860] hover:bg-[#002242] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
        >
          <span>Beli Sekarang</span>
        </button>
      </footer>
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

.diagonal-cross {
  position: relative;
  overflow: hidden;
}
.diagonal-cross::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 1.5px;
  background-color: #ef4444;
  transform: rotate(-22deg);
}
.diagonal-cross::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 1.5px;
  background-color: #ef4444;
  transform: rotate(22deg);
}
</style>
