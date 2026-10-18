<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  retryText?: string
  icon?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Terjadi Kendala Koneksi Data',
  message: 'Gagal memuat data dari cold hub Muncar. Silakan periksa jaringan internet Anda dan coba lagi.',
  retryText: 'Coba Lagi',
  icon: 'error',
  loading: false
})

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div class="bg-red-50 border border-red-200/80 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-3.5 my-4 shadow-xs">
    <!-- Error Alert Icon Badge -->
    <div class="w-12 h-12 rounded-xl bg-red-100 text-[#ba1a1a] flex items-center justify-center shadow-xs">
      <span class="material-symbols-outlined text-[28px]">
        {{ icon }}
      </span>
    </div>

    <!-- Error Copy (Strictly Zero Em Dashes) -->
    <div class="space-y-1 max-w-sm">
      <h3 class="text-sm font-bold text-[#ba1a1a]">
        {{ title }}
      </h3>
      <p class="text-xs text-slate-600 leading-relaxed font-normal">
        {{ message }}
      </p>
    </div>

    <!-- Functional Retry Button -->
    <button 
      type="button" 
      :disabled="loading"
      class="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#103860] text-white text-xs font-semibold hover:bg-[#13446E] disabled:opacity-60 transition-all shadow-sm active:scale-95 cursor-pointer"
      @click="handleRetry"
    >
      <span 
        class="material-symbols-outlined text-[16px]"
        :class="{ 'animate-spin': loading }"
      >
        refresh
      </span>
      <span>{{ loading ? 'Menghubungkan...' : retryText }}</span>
    </button>
  </div>
</template>

