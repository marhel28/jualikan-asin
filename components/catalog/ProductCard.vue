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
        <!-- Skeleton pulse loader while image is loading -->
        <div 
          v-if="!isImageLoaded" 
          class="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-0"
        >
          <span class="material-symbols-outlined text-3xl text-slate-300">set_meal</span>
        </div>

        <!-- Fallback if error occurs or no image provided -->
        <div 
          v-if="isImageError || !product.images?.hero" 
          class="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-4"
        >
          <span class="material-symbols-outlined text-3xl text-slate-300 mb-1">set_meal</span>
          <span class="text-[10px] text-slate-400 font-medium">Hasil Laut Muncar</span>
        </div>

        <NuxtImg
          v-else
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
      <div class="mb-2">
        <div class="text-xs font-bold text-[#002242] leading-tight">
          Rp {{ formatPrice(product.pricePerKg) }} 
          <span class="text-[11px] font-normal text-slate-500">/ {{ product.unit || 'kg' }}</span>
        </div>
      </div>

      <button 
        type="button" 
        :disabled="isAdding"
        @click.stop="handleQuickAdd"
        class="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-[#103860] text-[#103860] hover:text-white active:scale-95 transition py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60"
      >
        <span class="material-symbols-outlined text-[16px]">
          {{ justAdded ? 'check' : 'add_shopping_cart' }}
        </span>
        <span>{{ justAdded ? t('Ditambahkan', 'Added') : t('+ Keranjang', '+ Cart') }}</span>
      </button>
    </div>
  </article>
</template>
