<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore, type PackagingType } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Keranjang Belanja Dingin | Laut Berkah Abadi Banyuwangi',
  meta: [
    {
      name: 'description',
      content: 'Keranjang belanja dingin hasil laut segar tangkapan Muncar dengan proteksi rantai dingin bersubsidi dan perhitungan rendemen netto transparan.'
    },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

onMounted(() => {
  cartStore.initCart()
})

const handleProceedToCheckout = () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth?redirect=/checkout')
  } else {
    router.push('/checkout')
  }
}

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/katalog')
  }
}

const goToProduct = (slugOrId?: string) => {
  if (!slugOrId) return
  router.push('/produk/' + slugOrId)
}

// State management for 3 UI states (Loading, Empty, Error)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Dynamic local chilled courier fee from backend policy
const standardShippingFee = computed(() => {
  return cartStore.shippingPolicy?.standardFee || cartStore.shippingPolicy?.localFee || 12000
})

// Dynamic effective shipping fee based on backend admin settings
const shippingFee = computed(() => {
  return cartStore.shippingFee
})

// Total estimated bill calculation from cartStore
const totalEstimatedBill = computed(() => {
  return cartStore.totalEstimatedBill
})

// Packaging selector helper with resilient store method handling
const handleSelectPackaging = (type: PackagingType) => {
  if (typeof (cartStore as any).setPackaging === 'function') {
    (cartStore as any).setPackaging(type)
  } else if (typeof cartStore.setPackagingType === 'function') {
    cartStore.setPackagingType(type)
  } else {
    cartStore.packagingType = type
  }
}

// Kitchen notes input handler with character limiting
const handleKitchenNotesInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  cartStore.setKitchenNotes(target.value)
}

// Retry handler for Error state
const handleRetry = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    // Simulate refreshing cart data and validating cold hub stock
    await new Promise(resolve => setTimeout(resolve, 500))
    errorMessage.value = null
  } catch (err: any) {
    errorMessage.value = 'Gagal memuat ulang data keranjang dingin. Silakan coba kembali.'
  } finally {
    isLoading.value = false
  }
}

// Image error fallback
const handleImageError = (_event: Event) => {}

onMounted(async () => {
  cartStore.initCart()
  // Reset any lingering transient errors
  errorMessage.value = null
  await cartStore.fetchDeliveryConfig()
})
</script>

<template>
  <div class="flex flex-col gap-4 py-1">
    <!-- Mobile-only local header (hidden on md+) -->
    <header class="md:hidden -mx-4 -mt-4 mb-1 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
      <button type="button" @click="goBack" class="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-[#103860]" aria-label="Kembali">
        <span class="material-symbols-outlined text-[24px]">arrow_back</span>
      </button>
      <div class="flex flex-col">
        <h1 class="text-base font-bold text-[#103860] leading-tight">Keranjang Belanja Dingin</h1>
        <p class="text-xs text-slate-500 font-medium">{{ cartStore.items.length }} Produk dalam keranjang</p>
      </div>
      <NuxtLink to="/" class="ml-auto flex items-center text-[#103860] hover:opacity-80">
        <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">anchor</span>
      </NuxtLink>
    </header>

    <!-- Desktop Breadcrumb -->
    <nav class="hidden md:flex items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <span class="font-semibold text-[#103860]">Keranjang Belanja Dingin</span>
    </nav>

    <!-- MANDATORY STATE 1: Error State Banner with Functional Retry -->
    <CommonErrorRetry
      v-if="errorMessage"
      title="Kendala Sinkronisasi Keranjang"
      :message="errorMessage"
      :loading="isLoading"
      retry-text="Coba Lagi"
      @retry="handleRetry"
    />

    <!-- MANDATORY STATE 2: Loading Skeleton State -->
    <div v-else-if="isLoading" class="flex flex-col gap-3">
      <CommonSkeletonLoader type="telemetry" :count="1" />
      <CommonSkeletonLoader type="row" :count="3" />
    </div>

    <!-- MANDATORY STATE 3: Empty State (when no items in cart) -->
    <div v-else-if="cartStore.items.length === 0" class="py-4">
      <CommonEmptyState
        icon="set_meal"
        title="Keranjang Belanja Dingin Kosong"
        description="Anda belum memilih hasil laut segar. Silakan jelajahi katalog ikan segar tangkapan harian Muncar dan Selat Bali."
        action-text="Mulai Belanja Ikan Segar"
        action-to="/"
        action-icon="arrow_forward"
      />
    </div>

    <!-- POPULATED CART STATE: 2-column on desktop (Left items list & options, Right order summary) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-[1.8fr_1fr] lg:grid-cols-[2fr_1fr] gap-4 md:gap-6 items-start pb-28 md:pb-10">
      <!-- Left Column: Free Shipping Progress + Items + Packaging + Notes -->
      <div class="flex flex-col gap-3.5">
        <!-- 1. Free Shipping Progress Bar Card -->
        <section class="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-2">
          <div class="flex items-center justify-between text-xs">
            <div class="font-bold text-[#103860] flex items-center gap-1.5 flex-wrap">
              <span class="material-symbols-outlined text-[18px] text-[#059669]">local_shipping</span>
              <span>Bebas Ongkir Armada Dingin LBA</span>
              <span 
                v-if="cartStore.shippingPolicy?.freeShippingBanyuwangi" 
                class="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
              >
                Seluruh Banyuwangi
              </span>
            </div>
            <span class="font-extrabold text-[#059669]">{{ cartStore.freeShippingProgress }}%</span>
          </div>

          <!-- Progress Track and Bar -->
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
            <div
              class="bg-[#059669] h-full rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${cartStore.freeShippingProgress}%` }"
            ></div>
          </div>

          <!-- Dynamic Shortfall / Congratulatory Notice -->
          <p class="text-xs text-slate-600 font-medium">
            <template v-if="cartStore.isFreeShipping">
              <span class="text-[#059669] font-bold">Selamat!</span> Anda mendapatkan <strong>Gratis Ongkir Armada Dingin LBA</strong> untuk rute lokal Banyuwangi.
            </template>
            <template v-else>
              Tambah <strong class="text-[#103860] font-bold">Rp {{ cartStore.freeShippingShortfall.toLocaleString('id-ID') }}</strong> lagi untuk <strong>Gratis Ongkir!</strong>
            </template>
          </p>
        </section>

        <!-- 2. Cart Items List Section (Clean & Simple like seafoodsegarmalang.id) -->
        <section class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider">
              Daftar Produk Segar
            </h2>
            <span class="text-[11px] text-slate-500 font-medium">
              Total {{ cartStore.totalGrossWeightKg }} kg
            </span>
          </div>

          <!-- Grouped Clean Items Container -->
          <div class="bg-white border border-slate-200/90 rounded-xl divide-y divide-slate-100 shadow-xs overflow-hidden">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              @click="goToProduct(item.slug || item.productId)"
              class="p-3.5 flex gap-3.5 items-center hover:bg-slate-50/80 transition-colors cursor-pointer group"
              :title="'Lihat detail ' + item.name"
            >
              <!-- Product Thumbnail -->
              <div
                class="relative w-16 h-16 min-w-16 min-h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200/60 block group-hover:opacity-90 transition-opacity"
              >
                <NuxtImg
                  :src="item.imageUrl"
                  :alt="item.name"
                  @error="handleImageError"
                  class="w-full h-full object-cover block"
                  width="64"
                  height="64"
                  format="webp"
                  loading="lazy"
                />
                <span class="absolute bottom-0 inset-x-0 bg-[#103860]/85 text-white text-[9px] font-bold text-center py-0.5">
                  {{ item.quantityKg }} {{ item.unit || 'kg' }}
                </span>
              </div>

              <!-- Product Details -->
              <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                <h3 class="text-xs font-bold text-[#0F172A] group-hover:text-[#103860] line-clamp-2 leading-snug transition-colors no-underline">
                  {{ item.name }}
                </h3>

                <div class="text-[11px] text-slate-500 font-medium">
                  {{ item.cutLabel }} &bull; Netto ~{{ item.estimatedNetWeightGrams }}g
                </div>

                <div v-if="item.separateSoupBones" class="text-[10px] text-[#059669] font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px] shrink-0">check</span>
                  <span>+ Kepala & tulang sup (+Rp 0)</span>
                </div>

                <div class="text-xs font-extrabold text-[#103860] mt-1">
                  Rp {{ item.itemSubtotal.toLocaleString('id-ID') }}
                </div>
              </div>

              <!-- Stepper and Remove Controls -->
              <div class="flex flex-col items-end justify-between self-stretch shrink-0 gap-2" @click.stop>
                <button
                  type="button"
                  @click.stop="cartStore.removeItem(item.id)"
                  class="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus produk dari keranjang"
                  aria-label="Hapus produk"
                >
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>

                <!-- Quantity Stepper -->
                <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs" @click.stop>
                  <button
                    type="button"
                    @click.stop="cartStore.updateQuantity(item.id, -1)"
                    class="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                    aria-label="Kurangi jumlah"
                  >
                    <span class="material-symbols-outlined text-[14px]">remove</span>
                  </button>
                  <span class="w-7 text-center text-xs font-bold text-[#103860] select-none">
                    {{ item.quantityKg }}
                  </span>
                  <button
                    type="button"
                    @click.stop="cartStore.updateQuantity(item.id, 1)"
                    class="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                    aria-label="Tambah jumlah"
                  >
                    <span class="material-symbols-outlined text-[14px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. Subsidized Cold Chain Packaging Selector -->
        <section class="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold text-[#103860] flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-[#059669]">local_shipping</span>
              <span>Pengiriman</span>
            </h2>
            <span class="text-[11px] text-[#059669] font-semibold">
              Wajib Standar Mutu
            </span>
          </div>

          <div class="grid grid-cols-1 gap-2">
            <label
              v-for="opt in cartStore.availablePackagingOptions"
              :key="opt.id"
              @click="handleSelectPackaging(opt.id)"
              class="flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all"
              :class="cartStore.packagingType === opt.id ? 'border-[#103860] bg-blue-50/40 shadow-xs' : 'border-slate-200 hover:bg-slate-50'"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <input
                  type="radio"
                  name="thermal_protection"
                  :value="opt.id"
                  class="sr-only"
                  :checked="cartStore.packagingType === opt.id"
                />
                <div
                  class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  :class="cartStore.packagingType === opt.id ? 'border-[#103860] bg-[#103860]' : 'border-slate-300 bg-white'"
                >
                  <div v-if="cartStore.packagingType === opt.id" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-[#0F172A] truncate">{{ opt.name }}</span>
                    <span v-if="opt.isDefault" class="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">Default</span>
                  </div>
                  <span class="text-[11px] text-slate-500">{{ opt.duration }}: {{ opt.note }}</span>
                </div>
              </div>
              <span class="text-xs font-extrabold text-[#103860] shrink-0 whitespace-nowrap">Rp {{ opt.fee.toLocaleString('id-ID') }}</span>
            </label>
          </div>
        </section>

        <!-- 4. Custom Kitchen Notes -->
        <section class="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-2">
          <label for="kitchen-notes" class="text-xs font-bold text-[#103860] flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Catatan Dapur Pengolahan</span>
            </span>
            <span class="text-[10px] text-slate-400 font-normal">
              {{ (cartStore.kitchenNotes || '').length }}/250
            </span>
          </label>
          <textarea
            id="kitchen-notes"
            :value="cartStore.kitchenNotes"
            @input="handleKitchenNotesInput"
            maxlength="250"
            rows="2"
            placeholder="Contoh: potong steak tebal, sisik bersih tuntas, kepala belah dua"
            class="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#103860] focus:ring-1 focus:ring-[#103860] focus:outline-none bg-slate-50/50 text-slate-900 placeholder:text-slate-400 resize-none transition-all"
          ></textarea>
        </section>
      </div>

      <!-- Right Column: Sticky Summary & Action on Desktop -->
      <div class="flex flex-col gap-3.5 md:sticky md:top-24">
        <!-- 5. Bill Summary Breakdown Card -->
        <section class="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-2.5">
          <h2 class="text-xs font-bold text-[#103860] border-b border-slate-100 pb-2">
            Rincian Pembayaran
          </h2>

          <div class="space-y-2 text-xs">
            <!-- Products Subtotal -->
            <div class="flex justify-between text-slate-600">
              <span>Total Produk ({{ cartStore.items.length }} jenis, {{ cartStore.totalGrossWeightKg }} kg)</span>
              <span class="font-bold text-slate-800">
                Rp {{ cartStore.productsSubtotal.toLocaleString('id-ID') }}
              </span>
            </div>

            <!-- Packaging Fee -->
            <div class="flex justify-between text-slate-600">
              <span>Biaya Pengiriman ({{ cartStore.packagingDetails?.name || 'Paket Pengiriman' }})</span>
              <span class="font-bold text-slate-800">
                Rp {{ cartStore.packagingFee.toLocaleString('id-ID') }}
              </span>
            </div>

            <!-- Estimated Chilled Courier Shipping -->
            <div class="flex justify-between text-slate-600">
              <span>Estimasi Ongkir Armada Dingin LBA</span>
              <div class="flex items-center gap-1.5">
                <span v-if="cartStore.isFreeShipping && standardShippingFee > 0" class="line-through text-slate-400 text-[11px]">
                  Rp {{ standardShippingFee.toLocaleString('id-ID') }}
                </span>
                <span class="font-bold" :class="cartStore.isFreeShipping ? 'text-[#059669]' : 'text-slate-800'">
                  {{ shippingFee === 0 ? 'Gratis' : 'Rp ' + shippingFee.toLocaleString('id-ID') }}
                </span>
              </div>
            </div>

            <!-- Free Shipping Discount Row -->
            <div v-if="cartStore.isFreeShipping && standardShippingFee > 0" class="flex justify-between text-[#059669] font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
              <span>Diskon Bebas Ongkir Lokal</span>
              <span>-Rp {{ standardShippingFee.toLocaleString('id-ID') }}</span>
            </div>

            <!-- Total Estimasi -->
            <div class="border-t border-slate-100 pt-2.5 flex justify-between items-baseline">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-[#103860]">Total Estimasi Tagihan</span>
                <span class="text-[10px] text-slate-400">Termasuk pajak & pengaman dingin</span>
              </div>
              <span class="text-base font-extrabold text-[#103860]">
                Rp {{ totalEstimatedBill.toLocaleString('id-ID') }}
              </span>
            </div>
          </div>

          <!-- Desktop & Mobile Inline Checkout Button -->
          <button
            type="button"
            @click="handleProceedToCheckout"
            class="flex w-full mt-3 py-3 px-4 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold transition-all shadow-md text-center items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lanjut ke Pengiriman</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </section>
      </div>

      <!-- 6. Sticky Bottom Checkout Bar (Mobile only, hidden md+) -->
      <footer class="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 z-50 shadow-lg">
        <div class="flex items-center justify-between gap-3">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-500 font-medium">Total Estimasi</span>
            <span class="text-sm font-extrabold text-[#103860]">
              Rp {{ totalEstimatedBill.toLocaleString('id-ID') }}
            </span>
          </div>

          <button
            type="button"
            @click="handleProceedToCheckout"
            class="flex-1 py-3 px-4 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold transition-all shadow-md active:scale-98 text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lanjut ke Pengiriman</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>
