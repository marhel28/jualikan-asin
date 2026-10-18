<script setup lang="ts">
import { useLocale } from '~/composables/useLocale'

const { locale, toggleLocale, isEn } = useLocale()
</script>

<template>
  <button
    type="button"
    @click="toggleLocale"
    class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 hover:text-[#103860] shadow-sm hover:shadow transition-all text-xs font-semibold cursor-pointer select-none"
    :title="isEn ? 'Switch to Bahasa Indonesia' : 'Ganti ke English'"
    aria-label="Ubah Bahasa / Change Language"
  >
    <span class="text-sm leading-none">{{ isEn ? '🇬🇧' : '🇮🇩' }}</span>
    <span class="text-[11px] font-bold tracking-wide">{{ isEn ? 'EN' : 'ID' }}</span>
  </button>
</template>
