<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore, type CutType } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import type { Product } from '~/data/products'
import { useLocale } from '~/composables/useLocale'

interface Props {
  product: Product
}

const props = defineProps<Props>()

const router = useRouter()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const { t } = useLocale()
const isAdding = ref(false)
const justAdded = ref(false)

const isFavorited = computed(() => wishlistStore.has(props.product.id))

const formatPrice = (price: number): string => {
  return price.toLocaleString('id-ID')
}

const goToDetail = () => {
  router.push('/produk/' + props.product.slug)
}

const toggleWishlist = (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  wishlistStore.toggle(props.product.id)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
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
        <img
          :src="product.images?.hero || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          @error="handleImageError"
        />

        <span class="absolute top-2 left-2 bg-[#002242] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
          {{ product.qualityBadges?.[0] || 'Tangkapan Hari Ini' }}
        </span>

        <button
          type="button"
          @click.stop="toggleWishlist"
          :aria-label="isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'"
          class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-colors shadow-xs hover:bg-white cursor-pointer"
          :class="isFavorited ? 'text-rose-600' : 'text-slate-400 hover:text-slate-700'"
        >
          <span class="material-symbols-outlined text-[17px]" :class="{ 'fill-1': isFavorited }">
            {{ isFavorited ? 'favorite' : 'favorite' }}
          </span>
        </button>

        <span class="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-medium px-1.5 py-0.5 rounded border border-slate-200">
          {{ product.exportGrade || 'Grade A' }}
        </span>
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

        <!-- Ide Olahan Dapur -->
        <div v-if="product.culinaryIdeas?.length" class="mt-2 flex items-center gap-1 overflow-hidden text-[10px] text-slate-600 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
          <span class="material-symbols-outlined text-[13px] text-amber-600 shrink-0">skillet</span>
          <span class="truncate font-medium text-slate-700">{{ t('Cocok:', 'Ideas:') }} {{ product.culinaryIdeas.slice(0, 2).join(', ') }}</span>
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
