<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useLocale } from '~/composables/useLocale'

const route = useRoute()
const { isEn, toggleLocale } = useLocale()
</script>

<template>
  <!-- Floating pill switcher positioned ergonomically above mobile bottom navigation -->
  <aside 
    aria-label="Language Selector"
    class="fixed z-30 transition-all duration-200 left-4 bottom-[4.75rem] md:bottom-6 select-none"
  >
    <button
      type="button"
      @click="toggleLocale"
      class="group flex items-center gap-2 bg-white/95 hover:bg-white text-slate-800 px-3 py-2 rounded-full shadow-md hover:shadow-lg border border-slate-200/90 backdrop-blur-md active:scale-95 transition-all text-xs font-bold cursor-pointer"
      :title="isEn ? 'Switch to Bahasa Indonesia' : 'Switch to English'"
    >
      <span class="text-sm leading-none">{{ isEn ? '🇬🇧' : '🇮🇩' }}</span>
      <span class="text-[11px] tracking-wide text-[#103860] uppercase">{{ isEn ? 'EN' : 'ID' }}</span>
      <span class="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-[#103860] transition-colors"></span>
      <span class="text-[10px] text-slate-500 font-medium">{{ isEn ? 'English' : 'Bahasa' }}</span>
    </button>
  </aside>
</template>
