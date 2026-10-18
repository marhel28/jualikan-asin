<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()

const formatRupiah = (val: number) => {
  return (val || 0).toLocaleString('id-ID')
}
</script>

<template>
  <Transition
    enter-active-class="transform transition ease-out duration-300"
    enter-from-class="translate-y-8 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transform transition ease-in duration-200"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-8 opacity-0"
  >
    <div
      v-if="cartStore.lastAddedItem"
      class="fixed z-40 right-4 left-4 md:left-auto md:right-6 bottom-[4.5rem] md:bottom-20 max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl p-3 flex items-center justify-between gap-3 text-slate-800"
      role="status"
      aria-live="polite"
    >
      <div class="flex items-center gap-2.5 overflow-hidden">
        <div class="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200/60">
          <img
            :src="cartStore.lastAddedItem.image"
            :alt="cartStore.lastAddedItem.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span class="text-[10px] font-bold text-emerald-700 tracking-tight">Berhasil Ditambahkan</span>
          </div>
          <span class="text-xs font-bold text-[#103860] truncate">{{ cartStore.lastAddedItem.name }}</span>
          <span class="text-[10px] text-slate-500">
            {{ cartStore.lastAddedItem.quantity }}x • Rp {{ formatRupiah(cartStore.lastAddedItem.price) }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <NuxtLink
          to="/keranjang"
          class="bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs active:scale-95"
        >
          Lihat
        </NuxtLink>
        <button
          type="button"
          @click="cartStore.clearToast"
          class="w-6 h-6 rounded-full text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  </Transition>
</template>
