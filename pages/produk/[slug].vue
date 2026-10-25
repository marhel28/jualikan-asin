<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PRODUCTS, type Product } from '~/data/products'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  hideMainHeader: true,
  hideBottomNav: true
})

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()
const siteUrl = (runtimeConfig.public?.siteUrl as string) || 'https://lautberkahabadi.com'

const slug = computed(() => String(route.params.slug || ''))

const liveProduct = ref<Product | null>(null)

onMounted(async () => {
  cartStore.initCart()
  try {
    const api = useApi()
    const bp = await api.get<any>(`/products/${slug.value}`)
    if (bp && (bp.id || bp.slug)) {
      const local = PRODUCTS.find(p => p.id === bp.id || p.slug === bp.slug)

      // Normalize available cuts from backend (supports camelCase and snake_case)
      const rawCuts = bp.availableCuts || bp.available_cuts || local?.availableCuts || []
      const normalizedCuts = rawCuts.map((c: any) => ({
        type: c.type || c.cut_type,
        label: c.label || (c.type === 'utuh_bersih' ? 'Utuh Bersih' : c.type === 'fillet_tanpa_kulit' ? 'Fillet Tanpa Kulit' : c.type === 'steak_melintang' ? 'Steak Melintang' : c.type),
        description: c.description || (c.type === 'utuh_bersih' ? 'Kerok sisik, buang insang & isi perut' : c.type === 'fillet_tanpa_kulit' ? 'Daging murni tanpa tulang & duri' : 'Potong bulat melintang tebal 2.5 cm'),
        yieldRatio: Number(c.yieldRatio ?? c.yield_percentage ?? 0.85),
        yieldBadge: c.yieldBadge || `~${Math.round(Number(c.yieldRatio ?? c.yield_percentage ?? 0.85) * 1000)}g/kg`
      }))

      // Normalize images
      const bpImages = bp.images || (bp.image_url ? { hero: bp.image_url, texture: bp.image_url, scaleSlip: bp.image_url } : null)

      liveProduct.value = {
        id: bp.id,
        name: bp.name,
        fishType: bp.fishType || bp.fish_type || bp.category || local?.fishType || 'Ikan Laut Segar',
        scientificName: bp.scientificName || bp.latin_name || local?.scientificName || '',
        slug: bp.slug,
        category: bp.category || local?.category || 'Ikan Karang',
        pricePerKg: Number(bp.pricePerKg ?? bp.price_per_kg) || local?.pricePerKg || 0,
        originalPricePerKg: local?.originalPricePerKg,
        rating: Number(bp.rating) || local?.rating || 4.9,
        reviewCount: bp.reviewCount || bp.review_count || local?.reviewCount || 100,
        freshnessScore: bp.freshnessScore || bp.freshness_score || local?.freshnessScore || 98,
        specWeight: bp.specWeight || bp.spec_weight || local?.specWeight || '100g - 270g per kemasan vakum',
        specDimensions: bp.specDimensions || bp.spec_dimensions || local?.specDimensions || 'P 25-35 cm, L 8-12 cm',
        catchMethod: bp.catchMethod || bp.catch_method || local?.catchMethod || 'Pancing Ulur Tradisional Muncar',
        landingPort: bp.landingPort || bp.landing_port || local?.landingPort || 'Pelabuhan Perikanan Pantai Muncar',
        originZone: bp.originZone || bp.origin_zone || local?.originZone || 'WPP-NRI 573 (Selat Bali)',
        landingTime: bp.landingTime || bp.landing_time || local?.landingTime || '05:30 WIB Subuh',
        storageTemp: bp.storageTemp || bp.storage_temp || local?.storageTemp || 'Chilled 1.5 C',
        exportGrade: bp.exportGrade || bp.export_grade || local?.exportGrade || undefined,
        images: bpImages || local?.images || { hero: 'https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp', texture: '', scaleSlip: '' },
        stockKg: Number(bp.stockKg ?? bp.stock_kg) || local?.stockKg || 50,
        minOrderKg: Number(bp.minOrderKg ?? bp.min_order_kg) || local?.minOrderKg || 1,
        description: bp.description || local?.description || '',
        qualityBadges: bp.qualityBadges || bp.quality_badges || local?.qualityBadges || ['Tangkapan Segar Subuh', 'Pancing Ulur', 'Bebas Formalin'],
        isFeatured: bp.isFeatured ?? bp.is_featured ?? local?.isFeatured ?? false,
        supportsSoupBones: bp.supportsSoupBones ?? bp.supports_soup_bones ?? local?.supportsSoupBones ?? true,
        availableCuts: normalizedCuts.length > 0 ? normalizedCuts : [
          { type: 'utuh_bersih', label: 'Utuh Bersih', yieldRatio: 0.85, description: 'Kerok sisik, buang insang & isi perut', yieldBadge: '~850g/kg' },
          { type: 'fillet_tanpa_kulit', label: 'Fillet Tanpa Kulit', yieldRatio: 0.52, description: 'Daging murni tanpa tulang & duri', yieldBadge: '~520g/kg' },
          { type: 'steak_melintang', label: 'Steak Melintang', yieldRatio: 0.80, description: 'Potong bulat melintang tebal 2.5 cm', yieldBadge: '~800g/kg' }
        ],
        customVariants: bp.customVariants || bp.custom_variants || local?.customVariants,
        unit: (bp.unit as any) || local?.unit || 'kg',
        soldCount: Number(bp.soldCount ?? bp.sold_count ?? local?.soldCount ?? 0),
        wishlistCount: Number(bp.wishlistCount ?? bp.wishlist_count ?? local?.wishlistCount ?? 0)
      } as Product
    }
  } catch {}
})

// Find product by slug or alias
const product = computed((): Product | null => {
  if (liveProduct.value) return liveProduct.value
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

// Tokopedia Style 2-Tier Customizable Variants
const customVariants = computed(() => {
  return product.value?.customVariants || null
})

const tier1Config = computed(() => {
  if (customVariants.value?.tier1 && customVariants.value.tier1.options && customVariants.value.tier1.options.length > 0) {
    return customVariants.value.tier1
  }
  const baseKgPrice = product.value?.pricePerKg || 85000
  const defaultGrams = [100, 150, 200, 250]
  return {
    name: 'Pilihan Berat',
    unit: 'gram' as const,
    options: defaultGrams.map(g => ({
      id: `opt-${g}`,
      label: String(g),
      weightValue: g / 1000,
      price: Math.max(5000, Math.round((baseKgPrice * (g / 1000)) / 500) * 500),
      stock: 10,
      inStock: true
    }))
  }
})

const tier1Unit = computed(() => tier1Config.value.unit || 'gram')
const tier1Name = computed(() => tier1Config.value.name || 'Pilihan Berat')
const tier1Options = computed(() => tier1Config.value.options || [])

const selectedTier1Id = ref<string>('')

watch(tier1Options, (opts) => {
  if (opts.length > 0) {
    const firstInStock = opts.find(o => o.inStock) || opts[0]
    if (!opts.some(o => o.id === selectedTier1Id.value)) {
      selectedTier1Id.value = firstInStock.id
    }
  }
}, { immediate: true })

const selectedTier1 = computed(() => {
  return tier1Options.value.find(o => o.id === selectedTier1Id.value) || tier1Options.value[0] || null
})

// Tier 2: Custom Variant (Default Disabled/Empty!)
const tier2Config = computed(() => {
  return customVariants.value?.tier2 || null
})

const tier2Enabled = computed(() => {
  return Boolean(tier2Config.value?.enabled && tier2Config.value?.options && tier2Config.value.options.length > 0)
})

const tier2Name = computed(() => tier2Config.value?.name || 'Pilihan Olahan')
const tier2Options = computed(() => tier2Config.value?.options || [])

const selectedTier2Id = ref<string>('')

watch(tier2Options, (opts) => {
  if (tier2Enabled.value && opts.length > 0) {
    const firstInStock = opts.find(o => o.inStock) || opts[0]
    if (!opts.some(o => o.id === selectedTier2Id.value)) {
      selectedTier2Id.value = firstInStock.id
    }
  }
}, { immediate: true })

const selectedTier2 = computed(() => {
  if (!tier2Enabled.value) return null
  return tier2Options.value.find(o => o.id === selectedTier2Id.value) || tier2Options.value[0] || null
})

// Interactive States & Prices
const currentUnitPrice = computed(() => {
  const p1 = selectedTier1.value?.price || product.value?.pricePerKg || 0
  const p2 = selectedTier2.value?.priceDelta || 0
  return p1 + p2
})

const currentVariantPrice = computed(() => currentUnitPrice.value)

const minVariantPrice = computed(() => {
  if (tier1Options.value.length === 0) return product.value?.pricePerKg || 0
  const prices = tier1Options.value.map(o => o.price)
  return Math.min(...prices)
})

const maxVariantPrice = computed(() => {
  if (tier1Options.value.length === 0) return product.value?.pricePerKg || 0
  const baseMax = Math.max(...tier1Options.value.map(o => o.price))
  const maxDelta = tier2Enabled.value && tier2Options.value.length > 0
    ? Math.max(...tier2Options.value.map(o => o.priceDelta || 0))
    : 0
  return baseMax + maxDelta
})

const selectedGrams = computed(() => {
  if (!selectedTier1.value) return 150
  return tier1Unit.value === 'kg' 
    ? Math.round(Number(selectedTier1.value.weightValue || selectedTier1.value.label) * 1000)
    : Math.round(Number(selectedTier1.value.label) || 150)
})

const selectedSkin = computed(() => {
  return selectedTier2.value?.label || 'Standar'
})
const quantity = ref<number>(1)
const activeTab = ref<'desc' | 'spec'>('desc')
const activeImageIndex = ref<number>(0)
const addedSuccess = ref<boolean>(false)
const showToast = ref<boolean>(false)
const toastText = ref<string>('')
const toastIcon = ref<string>('check_circle')
const toastIconClass = ref<string>('text-emerald-400')
let toastTimer: ReturnType<typeof setTimeout> | null = null
const isLoading = ref<boolean>(false)
const hasError = ref<boolean>(false)

// Effective display price
const currentTotalPrice = computed(() => {
  return currentVariantPrice.value * quantity.value
})

// User Likes / Wishlist state
const isLiked = computed(() => {
  return product.value ? wishlistStore.has(product.value.id) : false
})

const displayWishlistCount = computed(() => {
  if (!product.value) return 0
  const base = product.value.wishlistCount || 0
  return isLiked.value ? base + 1 : base
})

const triggerToast = (msg: string, icon = 'check_circle', iconClass = 'text-emerald-400') => {
  if (toastTimer) clearTimeout(toastTimer)
  toastText.value = msg
  toastIcon.value = icon
  toastIconClass.value = iconClass
  showToast.value = true
  toastTimer = setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const toggleLike = async () => {
  if (!product.value) return
  if (!authStore.isAuthenticated) {
    router.push(`/auth?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  await wishlistStore.toggle(product.value.id)
  if (isLiked.value) {
    triggerToast('Ditambahkan ke favorit', 'favorite', 'text-rose-400')
  } else {
    triggerToast('Dihapus dari favorit', 'favorite_border', 'text-slate-400')
  }
}

// Photo gallery list
const galleryImages = computed(() => {
  if (!product.value) return []
  const imgs: string[] = []
  if (product.value.images?.hero) imgs.push(product.value.images.hero)
  if (product.value.images?.texture) imgs.push(product.value.images.texture)
  if (product.value.images?.scaleSlip) imgs.push(product.value.images.scaleSlip)
  if (imgs.length === 0 && product.value.imageUrl) imgs.push(product.value.imageUrl)

  if (imgs.length === 1) {
    imgs.push(
      'https://cdn.ammarabufadhel.my.id/products/asset-1534482421-2f6abd98.webp',
      'https://cdn.ammarabufadhel.my.id/products/ikan-kerapu-macan-muncar-texture-668bae1c.webp'
    )
  }
  return imgs.length > 0 ? imgs : ['https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp']
})

const currentHeroImage = computed(() => {
  return galleryImages.value[activeImageIndex.value] || galleryImages.value[0]
})

const maxStock = computed(() => {
  return product.value?.stockKg || 15
})

const handleImageError = (event: Event) => {
  const target = (event?.target || event?.currentTarget) as HTMLImageElement | null
  const fallback = 'https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp'
  if (target && target.src !== fallback) {
    target.src = fallback
  }
}

// Gram variant selector
const selectWeight = (option: GramOption) => {
  if (!option.inStock) return
  selectedGrams.value = option.grams
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
    triggerToast('Tautan berhasil disalin', 'link', 'text-blue-300')
  } else {
    triggerToast('Tautan siap dibagikan', 'share', 'text-blue-300')
  }
}

const addItemToCart = () => {
  if (!product.value || !selectedTier1.value) return

  const t1Label = `${selectedTier1.value.label}${tier1Unit.value === 'kg' ? 'kg' : 'g'}`
  const t2Label = selectedTier2.value ? ` (${selectedTier2.value.label})` : ''
  const itemDisplayName = `${product.value.name} - ${t1Label}${t2Label}`

  cartStore.addItem(
    {
      id: `${product.value.id}-${selectedTier1.value.id}${selectedTier2.value ? '-' + selectedTier2.value.id : ''}`,
      name: itemDisplayName,
      slug: product.value.slug,
      imageUrl: currentHeroImage.value,
      pricePerKg: currentUnitPrice.value,
      unit: 'pack',
      netGrams: selectedGrams.value
    },
    'fillet_tanpa_kulit',
    false,
    quantity.value
  )
}

// Add to Cart
const handleAddToCart = () => {
  if (!product.value) return
  addItemToCart()
  addedSuccess.value = true
  triggerToast('Berhasil masuk keranjang', 'shopping_cart', 'text-emerald-400')
  setTimeout(() => {
    addedSuccess.value = false
  }, 2000)
}

// Buy Now (Direct Checkout)
const handleBuyNow = () => {
  if (toastTimer) clearTimeout(toastTimer)
  showToast.value = false
  addItemToCart()
  router.push('/checkout')
}

const handleRetry = () => {
  hasError.value = false
  isLoading.value = false
}

// Rekomendasi produk serupa/terkait via Typesense (dengan fallback lokal)
const liveRecommendations = ref<Product[]>([])
const isLoadingRecommendations = ref(false)

const fetchRecommendations = async () => {
  const currentSlug = slug.value || product.value?.slug
  if (!currentSlug) return

  isLoadingRecommendations.value = true
  try {
    const data = await $fetch<Product[]>(`http://localhost:8000/products/${currentSlug}/recommendations?limit=4`, {
      timeout: 3000
    })
    if (data && Array.isArray(data) && data.length > 0) {
      liveRecommendations.value = data
      return
    }
  } catch (err) {
    // Fallback handled below
  } finally {
    isLoadingRecommendations.value = false
  }

  // Graceful local fallback
  if (product.value) {
    const current = product.value
    liveRecommendations.value = PRODUCTS
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
  }
}

const recommendedProducts = computed(() => {
  if (liveRecommendations.value.length > 0) {
    return liveRecommendations.value
  }
  if (!product.value) return []
  const current = product.value
  return PRODUCTS
    .filter(p => p.id !== current.id)
    .slice(0, 4)
})

watch(() => slug.value, () => {
  fetchRecommendations()
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
  triggerToast(`${recProduct.name} masuk keranjang`, 'shopping_cart', 'text-emerald-400')
}

// Initialize on mount
onMounted(() => {
  wishlistStore.initFromStorage()
  fetchRecommendations()
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

// SEO & Rich Structured Data (Google Shopping / Rich Snippets)
useHead(() => {
  const currentProd = product.value
  if (!currentProd) {
    return { title: 'Produk | Laut Berkah Abadi' }
  }

  const pageTitle = `${displayName.value} | Laut Berkah Abadi Banyuwangi`
  const canonicalUrl = `${siteUrl}/produk/${currentProd.slug}`
  const heroImg = galleryImages.value[0] || `${siteUrl}/brand/logo.webp`
  const inStock = (currentProd.stockKg || 0) > 0

  return {
    title: pageTitle,
    meta: [
      { name: 'description', content: currentProd.description },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: currentProd.description },
      { property: 'og:image', content: heroImg },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: 'product' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: currentProd.description },
      { name: 'twitter:image', content: heroImg }
    ],
    link: [
      { rel: 'canonical', href: canonicalUrl }
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
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: currentProd.name,
                  item: canonicalUrl
                }
              ]
            },
            {
              '@type': 'Product',
              name: currentProd.name,
              image: galleryImages.value,
              description: currentProd.description,
              sku: currentProd.id,
              mpn: currentProd.id,
              brand: {
                '@type': 'Brand',
                name: 'Laut Berkah Abadi'
              },
              offers: {
                '@type': 'Offer',
                url: canonicalUrl,
                priceCurrency: 'IDR',
                price: currentProd.pricePerKg,
                priceValidUntil: '2026-12-31',
                itemCondition: 'https://schema.org/NewCondition',
                availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                seller: {
                  '@type': 'Organization',
                  name: 'Laut Berkah Abadi Banyuwangi'
                },
                hasMerchantReturnPolicy: {
                  '@type': 'MerchantReturnPolicy',
                  applicableCountry: 'ID',
                  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                  merchantReturnDays: 1,
                  returnMethod: 'https://schema.org/ReturnInStore',
                  returnFees: 'https://schema.org/FreeReturn'
                },
                shippingDetails: {
                  '@type': 'OfferShippingDetails',
                  shippingRate: {
                    '@type': 'MonetaryAmount',
                    value: 10000,
                    currency: 'IDR'
                  },
                  shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'ID',
                    addressRegion: 'Jawa Timur'
                  },
                  deliveryTime: {
                    '@type': 'ShippingDeliveryTime',
                    businessDays: {
                      '@type': 'OpeningHoursSpecification',
                      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                    },
                    cutoffTime: '20:00:00Z',
                    handlingTime: {
                      '@type': 'QuantitativeValue',
                      minValue: 0,
                      maxValue: 1,
                      unitCode: 'd'
                    },
                    transitTime: {
                      '@type': 'QuantitativeValue',
                      minValue: 0,
                      maxValue: 1,
                      unitCode: 'd'
                    }
                  }
                }
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '28',
                bestRating: '5',
                worstRating: '1'
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
        <span class="material-symbols-outlined text-[16px]" :class="toastIconClass">{{ toastIcon }}</span>
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
              <NuxtImg 
                id="main-product-img"
                :src="currentHeroImage" 
                :alt="displayName" 
                class="w-full h-full object-cover"
                width="800"
                height="600"
                format="webp"
                loading="eager"
                @error="handleImageError"
              />
              <!-- Photo gallery pill matching 1/3 Foto Riil -->
              <div class="absolute bottom-3 left-3 bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm select-none">
                <span class="material-symbols-outlined text-[13px] text-emerald-400">photo_camera</span>
                <span>{{ activeImageIndex + 1 }}/{{ galleryImages.length }} Foto Riil</span>
              </div>
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
                <NuxtImg :src="imgSrc" :alt="`Foto ${idx + 1}`" class="w-full h-full object-cover" width="56" height="56" format="webp" loading="lazy" @error="handleImageError" />
              </button>
            </div>
          </div>

          <!-- Right Column: Product Config & Actions -->
          <div class="flex flex-col">
            <!-- 3. Category Supertitle, Title, Scientific Name & Price -->
            <div class="pb-2">
              <div>
                <span class="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Hasil Laut Segar Muncar</span>
              </div>

              <h1 class="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mt-1">
                {{ product.name }}
              </h1>

              <div class="text-xs text-slate-500 font-medium mt-1">
                {{ product.category || 'Hasil Laut Segar' }}
              </div>

              <!-- Social Proof: Terjual, Difavoritkan & Stok -->
              <div class="flex items-center gap-2 mt-2 text-xs">
                <span class="flex items-center gap-1 font-semibold text-slate-700">
                  <span class="material-symbols-outlined text-[14px] text-emerald-700">sell</span>
                  <span>{{ (product?.soldCount ?? 0).toLocaleString('id-ID') }} terjual</span>
                </span>
                <span class="text-slate-300">•</span>
                <button 
                  type="button" 
                  @click="toggleLike"
                  class="flex items-center gap-1 font-medium transition-colors cursor-pointer" 
                  :class="isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-700'"
                >
                  <span class="material-symbols-outlined text-[14px]" :class="{ 'fill-1 text-rose-500': isLiked }">favorite</span>
                  <span>{{ displayWishlistCount }} difavoritkan</span>
                </button>
                <span class="text-slate-300">•</span>
                <span 
                  class="flex items-center gap-1 font-semibold"
                  :class="(product?.stockKg ?? 0) <= 0 ? 'text-rose-600' : 'text-emerald-700'"
                >
                  <span class="material-symbols-outlined text-[14px]">
                    {{ (product?.stockKg ?? 0) <= 0 ? 'cancel' : 'check_circle' }}
                  </span>
                  <span>
                    {{ (product?.stockKg ?? 0) <= 0 
                      ? 'Stok Habis' 
                      : (product?.unit === 'pack' ? `Sisa ${product.stockKg} pack` : `Sisa stok ${product.stockKg} kg`) 
                    }}
                  </span>
                </span>
              </div>

              <!-- Price Display Dynamic -->
              <div class="mt-3.5" id="price-display">
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl sm:text-3xl font-extrabold text-[#103860]">
                    Rp{{ currentUnitPrice.toLocaleString('id-ID') }}
                  </span>
                  <span class="text-xs text-slate-500 font-medium">
                    / Pack ({{ selectedTier1?.label }}{{ tier1Unit === 'kg' ? ' kg' : 'g' }})
                  </span>
                </div>
                <div class="text-[11px] text-slate-500 mt-1 font-medium">
                  Rentang harga: <strong class="text-slate-700">Rp{{ minVariantPrice.toLocaleString('id-ID') }} - Rp{{ maxVariantPrice.toLocaleString('id-ID') }}</strong>
                </div>
              </div>

              <div class="border-b border-slate-200/80 my-4"></div>
            </div>

            <!-- 4. Tokopedia Style Tier 1: Pilihan Berat (Gram / Kg) -->
            <div class="pb-4">
              <div class="text-xs text-slate-700 mb-2.5">
                {{ tier1Name }} ({{ tier1Unit === 'kg' ? 'kg' : 'Gram' }}): 
                <strong class="text-[#103860] font-bold" id="selected-weight-label">
                  [{{ selectedTier1?.label }}{{ tier1Unit === 'kg' ? ' kg' : 'g' }}]
                </strong>
              </div>

              <!-- Flexible Wrap Chips (Clean & Minimalist, disilang jika habis) -->
              <div class="flex flex-wrap gap-2">
                <template v-for="opt in tier1Options" :key="opt.id">
                  <button 
                    v-if="opt.inStock"
                    type="button"
                    @click="selectedTier1Id = opt.id"
                    class="h-10 sm:h-11 px-3.5 sm:px-4 rounded-lg sm:rounded-xl transition-all cursor-pointer font-bold flex items-center justify-center border text-xs sm:text-sm font-mono"
                    :class="selectedTier1Id === opt.id 
                      ? 'border-[#103860] bg-[#103860] text-white shadow-xs' 
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'"
                    :aria-label="`Pilih ukuran ${opt.label} ${tier1Unit === 'kg' ? 'kg' : 'gram'}`"
                  >
                    {{ opt.label }}{{ tier1Unit === 'kg' ? ' kg' : '' }}
                  </button>
                  <div 
                    v-else
                    class="diagonal-cross h-10 sm:h-11 px-3.5 sm:px-4 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50/70 text-slate-400 select-none cursor-not-allowed text-xs sm:text-sm flex items-center justify-center font-mono font-normal"
                    :title="`Ukuran ${opt.label}${tier1Unit === 'kg' ? 'kg' : 'g'} sedang habis`"
                  >
                    {{ opt.label }}{{ tier1Unit === 'kg' ? ' kg' : '' }}
                  </div>
                </template>
              </div>
            </div>

            <!-- 5. Tokopedia Style Tier 2: Varian Tambahan (Pilihan Kulit, Potongan, dll - DEFAULT KOSONG / HIDDEN) -->
            <div v-if="tier2Enabled && tier2Options.length > 0" class="pb-4">
              <div class="text-xs text-slate-700 mb-2">
                {{ tier2Name }}: <span class="text-[#103860] font-bold">[{{ selectedTier2?.label }}]</span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <template v-for="cOpt in tier2Options" :key="cOpt.id">
                  <button
                    v-if="cOpt.inStock"
                    type="button"
                    @click="selectedTier2Id = cOpt.id"
                    class="px-4 py-2 h-10 sm:h-11 rounded-lg sm:rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    :class="selectedTier2Id === cOpt.id 
                      ? 'border-[#103860] bg-[#103860] text-white shadow-xs' 
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'"
                  >
                    <span>{{ cOpt.label }}</span>
                    <span v-if="cOpt.priceDelta && cOpt.priceDelta > 0" class="text-[10px] opacity-80 font-mono">
                      (+Rp{{ cOpt.priceDelta.toLocaleString('id-ID') }})
                    </span>
                  </button>
                  <div
                    v-else
                    class="diagonal-cross px-4 py-2 h-10 sm:h-11 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50/70 text-slate-400 select-none cursor-not-allowed text-xs sm:text-sm flex items-center justify-center font-normal"
                    :title="`Varian ${cOpt.label} sedang habis`"
                  >
                    {{ cOpt.label }}
                  </div>
                </template>
              </div>
            </div>

            <!-- 6. Jumlah Pesanan (Pack) & Subtotal & Bagikan -->
            <div class="pb-5">
              <div class="text-xs font-semibold text-slate-800 mb-2">
                Jumlah Pesanan (Pack):
              </div>

              <div class="flex items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-3">
                  <!-- Stepper Component -->
                  <div class="inline-flex items-center border border-slate-300 rounded-lg bg-white h-10 shadow-2xs">
                    <button 
                      type="button"
                      aria-label="Kurang kuantitas" 
                      @click="changeQty(-1)"
                      :disabled="quantity <= 1"
                      class="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-l-lg transition-colors cursor-pointer text-lg font-bold leading-none select-none"
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
                      class="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 rounded-r-lg transition-colors cursor-pointer text-lg font-bold leading-none select-none"
                    >
                      +
                    </button>
                  </div>

                  <div class="text-xs text-slate-600 font-medium">
                    Subtotal: <strong class="text-slate-900 font-bold text-sm">Rp{{ currentTotalPrice.toLocaleString('id-ID') }}</strong>
                  </div>
                </div>

                <!-- Share Button -->
                <button 
                  type="button"
                  aria-label="Bagikan Produk" 
                  @click="shareProduct" 
                  class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Bagikan tautan produk ini"
                >
                  <span class="material-symbols-outlined text-[16px]">share</span>
                  <span>Bagikan</span>
                </button>
              </div>
            </div>

            <!-- Inline CTA Buttons for Desktop md+ -->
            <div class="hidden md:flex items-center gap-3 pt-2">
              <a 
                :href="'https://wa.me/6281234567890?text=' + encodeURIComponent('Halo Laut Berkah Abadi, saya tertarik dengan produk ' + product.name + ' varian ' + selectedGrams + 'g')" 
                target="_blank" 
                rel="noopener noreferrer"
                class="flex-1 h-11 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">chat</span>
                <span>Hubungi WhatsApp</span>
              </a>

              <button 
                type="button"
                id="btn-add-cart"
                @click="handleAddToCart"
                class="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-[#103860] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>{{ addedSuccess ? 'Ditambahkan!' : '+ Keranjang' }}</span>
              </button>

              <button 
                type="button"
                id="btn-buy-now"
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
              <span class="text-slate-400">Komoditas</span>
              <span class="font-medium text-slate-800">{{ product.name }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-400">Jenis Ikan</span>
              <span class="font-medium text-slate-800">{{ product.fishType || product.category || 'Ikan Laut Segar' }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-400">Berat</span>
              <span class="font-medium text-slate-800">{{ product.specWeight || (product.unit === 'pack' ? `${selectedGrams} gram / pack` : `${product.stockKg} kg ketersediaan timbangan basah`) }}</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-slate-400">Dimensi</span>
              <span class="font-medium text-slate-800">{{ product.specDimensions || 'Standar fillet / potongan utuh (kemasan vakum)' }}</span>
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
                  <NuxtImg 
                    :src="rec.images?.hero || rec.images?.primary || 'https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp'" 
                    :alt="rec.name" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width="200"
                    height="200"
                    format="webp"
                    loading="lazy"
                    @error="handleImageError"
                  />
                  <span class="absolute top-1.5 left-1.5 bg-[#103860]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    {{ rec.unit === 'pack' ? `${rec.packWeightGrams || 200}g` : 'Per Kg' }}
                  </span>
                </div>

                <!-- Info -->
                <h3 class="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#103860] transition-colors">
                  {{ rec.name }}
                </h3>
                <p class="text-[10px] text-slate-400 line-clamp-1 mb-1">
                  {{ rec.category || rec.fishType || 'Hasil Laut Muncar' }}
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
          <span>+ Keranjang (Rp{{ currentTotalPrice.toLocaleString('id-ID') }})</span>
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
.diagonal-cross::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cline x1='0' y1='0' x2='100' y2='100' stroke='%23ef4444' stroke-width='1' vector-effect='non-scaling-stroke' stroke-opacity='0.65'/%3E%3Cline x1='100' y1='0' x2='0' y2='100' stroke='%23ef4444' stroke-width='1' vector-effect='non-scaling-stroke' stroke-opacity='0.65'/%3E%3C/svg%3E");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
</style>
