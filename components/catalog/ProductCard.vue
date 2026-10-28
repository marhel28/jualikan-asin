<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore, type CutType } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useWishlistStore } from '~/stores/wishlist'
import type { Product } from '~/data/products'
import { useLocale } from '~/composables/useLocale'

interface Props {
  product: Product
  rankBadge?: string
}

const props = defineProps<Props>()

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const { t } = useLocale()
const isAdding = ref(false)
const justAdded = ref(false)
const isImageLoaded = ref(false)
const isImageError = ref(false)

const isFavorited = computed(() => wishlistStore.has(props.product.id))

const formatPrice = (price: number): string => {
  return price.toLocaleString('id-ID')
}

// Dynamic Price Calculation (Rentang Penuh vs Per Pack vs Per Kg with Tier 1 & Tier 2 support)
const priceInfo = computed(() => {
  const p = props.product
  const cv = p.customVariants
  const tier1 = cv?.tier1
  const tier1Opts = (tier1?.options || []).filter(o => o.inStock !== false)
  const effectiveTier1 = tier1Opts.length > 0 ? tier1Opts : (tier1?.options || [])

  // Check if Tier 2 (e.g. Pilihan Kulit, Potongan) is enabled
  const tier2 = cv?.tier2
  const tier2Enabled = Boolean(tier2?.enabled && tier2.options && tier2.options.length > 0)
  const tier2Opts = tier2Enabled ? (tier2.options || []).filter(o => o.inStock !== false) : []
  const effectiveTier2 = tier2Opts.length > 0 ? tier2Opts : (tier2?.options || [])

  let minDelta = 0
  let maxDelta = 0
  if (tier2Enabled && effectiveTier2.length > 0) {
    const deltas = effectiveTier2.map(o => Number(o.priceDelta) || 0)
    minDelta = Math.min(0, ...deltas)
    maxDelta = Math.max(0, ...deltas)
  }

  // Case 1: Has multiple Tier 1 weight options (or Tier 2 additions)
  if (effectiveTier1.length > 0) {
    const tier1Prices = effectiveTier1.map(o => Number(o.price) || 0)
    const minTier1 = Math.min(...tier1Prices)
    const maxTier1 = Math.max(...tier1Prices)
    const minTotal = Math.max(1000, minTier1 + minDelta)
    const maxTotal = Math.max(1000, maxTier1 + maxDelta)

    if (minTotal !== maxTotal) {
      const unitName = tier1?.unit === 'kg' ? 'kg' : 'g'
      const firstLabel = effectiveTier1[0]?.label || ''
      const lastLabel = effectiveTier1[effectiveTier1.length - 1]?.label || ''
      const rangeLabel = firstLabel && lastLabel && firstLabel !== lastLabel
        ? `Pilihan ${firstLabel}${unitName} - ${lastLabel}${unitName}`
        : `${effectiveTier1.length} Pilihan Ukuran`

      return {
        isRange: true,
        displayPrice: `Rp ${minTotal.toLocaleString('id-ID')} - Rp ${maxTotal.toLocaleString('id-ID')}`,
        unitLabel: '',
        subtext: rangeLabel,
        hasVariants: true
      }
    } else {
      return {
        isRange: false,
        displayPrice: `Rp ${minTotal.toLocaleString('id-ID')}`,
        unitLabel: p.unit === 'pack' ? '/ pack' : '/ kg',
        subtext: tier2Enabled ? 'Pilihan Varian Tersedia' : undefined,
        hasVariants: tier2Enabled || effectiveTier1.length > 1
      }
    }
  }

  // Case 2: Fixed Price per Pack
  if (p.unit === 'pack') {
    return {
      isRange: false,
      displayPrice: `Rp ${formatPrice(p.pricePerKg)}`,
      unitLabel: '/ pack',
      subtext: p.packWeightGrams ? `${p.packWeightGrams}g per pack` : undefined,
      hasVariants: false
    }
  }

  // Case 3: Standard Catch-Weight per Kg
  return {
    isRange: false,
    displayPrice: `Rp ${formatPrice(p.pricePerKg)}`,
    unitLabel: '/ kg',
    subtext: undefined,
    hasVariants: false
  }
})

const goToDetail = () => {
  router.push('/produk/' + props.product.slug)
}

const toggleWishlist = async (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  if (!authStore.isAuthenticated) {
    router.push(`/auth?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  await wishlistStore.toggle(props.product.id)
}

const handleImageLoad = () => {
  isImageLoaded.value = true
}

const handleImageError = () => {
  isImageError.value = true
  isImageLoaded.value = true
}

const handleQuickAdd = () => {
  if (isAdding.value) return
  isAdding.value = true

  // Default cut to first available cut option or standard 'utuh_bersih'
  const defaultCut: CutType = (props.product.availableCuts?.[0]?.type as CutType) || 'utuh_bersih'
  const soupBones = props.product.supportsSoupBones ?? true

  cartStore.addItem(
    {
      id: props.product.id,
      name: props.product.name,
      slug: props.product.slug,
      imageUrl: props.product.images?.hero || '',
      pricePerKg: props.product.pricePerKg,
      unit: props.product.unit || 'kg'
    },
    defaultCut,
    soupBones,
    1
  )

  justAdded.value = true
  setTimeout(() => {
    justAdded.value = false
    isAdding.value = false
  }, 1200)
}
</script>

<template>
  <article 
    @click="goToDetail"
    class="bg-white border border-slate-200/90 rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#002242]/40 transition duration-150 shadow-2xs cursor-pointer group"
  >
    <div>
      <div class="block relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
        <!-- Skeleton pulse loader while image is loading or if no image provided yet -->
        <div 
          v-if="!isImageLoaded || !product.images?.hero" 
          class="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-0"
        >
          <span class="material-symbols-outlined text-3xl text-slate-300">set_meal</span>
        </div>

        <!-- Fallback only if network error occurred while loading image -->
        <div 
          v-if="isImageError" 
          class="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-4"
        >
          <span class="material-symbols-outlined text-3xl text-slate-300 mb-1">set_meal</span>
          <span class="text-[10px] text-slate-400 font-medium">Hasil Laut Muncar</span>
        </div>

        <NuxtImg
          v-else-if="product.images?.hero"
          :src="product.images.hero"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 relative z-10"
          :class="isImageLoaded ? 'opacity-100' : 'opacity-0'"
          loading="lazy"
          width="400"
          height="300"
          format="webp"
          @load="handleImageLoad"
          @error="handleImageError"
        />

        <!-- Badge: Rank Badge (jika ada) atau Quality Badge default -->
        <span 
          v-if="rankBadge"
          class="absolute top-2 left-2 z-20 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-[12px]">local_fire_department</span>
          <span>{{ rankBadge }}</span>
        </span>
        <span 
          v-else
          class="absolute top-2 left-2 z-20 bg-[#002242] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs"
        >
          {{ product.qualityBadges?.[0] || 'Tangkapan Hari Ini' }}
        </span>

        <button
          type="button"
          @click.stop="toggleWishlist"
          :aria-label="isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'"
          class="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-colors shadow-xs hover:bg-white cursor-pointer"
          :class="isFavorited ? 'text-rose-600' : 'text-slate-400 hover:text-slate-700'"
        >
          <span class="material-symbols-outlined text-[17px]" :class="{ 'fill-1': isFavorited }">
            {{ isFavorited ? 'favorite' : 'favorite' }}
          </span>
        </button>
      </div>

      <div class="p-2.5 pb-1">
        <h2 class="text-xs font-bold text-[#002242] line-clamp-2 leading-snug group-hover:text-[#103860] no-underline transition-colors">
          {{ product.name }}
        </h2>

        <!-- Terjual (ringan) -->
        <div class="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
          <span class="material-symbols-outlined text-[13px] text-emerald-700">sell</span>
          <span class="font-medium text-slate-700">{{ product.soldCount || 0 }} {{ t('terjual', 'sold') }}</span>
        </div>

        <div class="flex items-center gap-1.5 mt-1">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
          <span class="text-[11px] text-[#006c4a] font-medium">
            {{ product.unit === 'pack' 
              ? t(`Sisa ${product.stockKg} pack`, `${product.stockKg} packs left`) 
              : t(`Stok: ${product.stockKg} kg`, `Stock: ${product.stockKg} kg`) 
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="p-2.5 pt-0 mt-2">
      <div class="mb-2 min-h-[34px] flex flex-col justify-end">
        <div class="text-xs font-bold text-[#002242] leading-tight">
          {{ priceInfo.displayPrice }} 
          <span v-if="priceInfo.unitLabel" class="text-[11px] font-normal text-slate-500">{{ priceInfo.unitLabel }}</span>
        </div>
        <div v-if="priceInfo.subtext" class="text-[10px] text-slate-400 mt-0.5 font-medium truncate">
          {{ priceInfo.subtext }}
        </div>
      </div>

      <!-- Action Button: 'Pilih Ukuran' for variant products vs '+ Keranjang' for fixed single items -->
      <button 
        v-if="priceInfo.hasVariants"
        type="button" 
        @click.stop="goToDetail"
        class="w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-[#103860] text-[#103860] hover:text-white active:scale-95 transition py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
      >
        <span class="material-symbols-outlined text-[15px]">tune</span>
        <span>{{ t('Pilih Ukuran', 'Select Size') }}</span>
      </button>

      <button 
        v-else
        type="button" 
        :disabled="isAdding"
        @click.stop="handleQuickAdd"
        class="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-[#103860] text-[#103860] hover:text-white active:scale-95 transition py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60 shadow-2xs"
      >
        <span class="material-symbols-outlined text-[16px]">
          {{ justAdded ? 'check' : 'add_shopping_cart' }}
        </span>
        <span>{{ justAdded ? t('Ditambahkan', 'Added') : t('+ Keranjang', '+ Cart') }}</span>
      </button>
    </div>
  </article>
</template>
