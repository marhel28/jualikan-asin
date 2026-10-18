<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  description?: string
  actionText?: string
  actionTo?: string
  actionIcon?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'set_meal',
  title: 'Belum Ada Hasil Laut Tersedia',
  description: 'Stok ikan segar tangkapan baru sedang dalam perjalanan dari Pelabuhan Muncar ke fasilitas cold storage kami.',
  actionText: 'Lihat Semua Ikan Segar',
  actionTo: '/',
  actionIcon: 'arrow_forward'
})

const emit = defineEmits<{
  (e: 'action'): void
}>()

const handleClick = () => {
  emit('action')
}
</script>

<template>
  <div class="bg-white border border-slate-200/80 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-xs my-4">
    <!-- Maritime Brand Badge Icon -->
    <div class="w-16 h-16 rounded-xl bg-[#103860]/10 text-[#103860] flex items-center justify-center shadow-xs">
      <span class="material-symbols-outlined text-[36px]" style="font-variation-settings: 'FILL' 1;">
        {{ icon }}
      </span>
    </div>

    <!-- Text Group -->
    <div class="space-y-1.5 max-w-sm">
      <h3 class="text-base font-bold text-[#103860]">
        {{ title }}
      </h3>
      <p class="text-xs text-slate-500 leading-relaxed font-normal">
        {{ description }}
      </p>
    </div>

    <!-- Active Action CTA Button (Never a dead button) -->
    <div v-if="actionText" class="pt-2">
      <NuxtLink 
        v-if="actionTo" 
        :to="actionTo" 
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#103860] text-white text-xs font-semibold hover:bg-[#13446E] transition-all shadow-md active:scale-95 cursor-pointer"
        @click="handleClick"
      >
        <span>{{ actionText }}</span>
        <span class="material-symbols-outlined text-[16px]">{{ actionIcon }}</span>
      </NuxtLink>

      <button 
        v-else 
        type="button" 
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#103860] text-white text-xs font-semibold hover:bg-[#13446E] transition-all shadow-md active:scale-95 cursor-pointer"
        @click="handleClick"
      >
        <span>{{ actionText }}</span>
        <span class="material-symbols-outlined text-[16px]">{{ actionIcon }}</span>
      </button>
    </div>
  </div>
</template>

