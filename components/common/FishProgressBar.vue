<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFishProgress } from '~/composables/useFishProgress'

const router = useRouter()
const { isLoading, progress, isBackward, start, finish, TAB_INDEX_MAP } = useFishProgress()

let unregisterBefore: (() => void) | null = null
let unregisterAfter: (() => void) | null = null
let currentHistoryPos = 0

onMounted(() => {
  if (typeof window !== 'undefined') {
    currentHistoryPos = window.history.state?.position ?? 0

    unregisterBefore = router.beforeEach((to, from) => {
      if (to.fullPath === from.fullPath) return

      const toPos = window.history.state?.position ?? 0
      let backward = false

      // Detect browser back button or router.back()
      if (toPos < currentHistoryPos) {
        backward = true
      } else {
        // Fallback: compare known main tab indices (e.g. Katalog -> Beranda)
        const fromIdx = TAB_INDEX_MAP[from.path]
        const toIdx = TAB_INDEX_MAP[to.path]
        if (typeof fromIdx === 'number' && typeof toIdx === 'number' && toIdx < fromIdx) {
          backward = true
        }
      }

      currentHistoryPos = toPos
      start(backward)
    })

    unregisterAfter = router.afterEach(() => {
      finish()
    })
  }
})

onUnmounted(() => {
  if (unregisterBefore) unregisterBefore()
  if (unregisterAfter) unregisterAfter()
})
</script>

<template>
  <div 
    class="pointer-events-none absolute bottom-0 left-0 right-0 h-[1.5px] overflow-visible z-50 transition-opacity duration-200"
    :class="isLoading ? 'opacity-100' : 'opacity-0'"
    aria-hidden="true"
  >
    <!-- Ultra-subtle, Non-glaring Progress Bar (Soft Muted Slate, Clean & Gentle) -->
    <div 
      class="absolute top-0 h-full transition-all duration-150 ease-out"
      :class="isBackward 
        ? 'right-0 bg-gradient-to-l from-transparent via-slate-300 to-slate-400' 
        : 'left-0 bg-gradient-to-r from-transparent via-slate-300 to-slate-400'"
      :style="{ width: `${progress}%` }"
    >
      <!-- Leading Fish Swimmer at the Front Tip -->
      <div 
        class="absolute top-1/2 flex items-center justify-center transition-transform"
        :class="isBackward 
          ? 'left-0 -translate-x-1/2 -translate-y-1/2 scale-x-[-1]' 
          : 'right-0 translate-x-1/2 -translate-y-1/2 scale-x-100'"
      >
        <!-- The Marine Fish Silhouette (Neutral Slate, Soft & Minimalist) -->
        <svg 
          viewBox="0 0 26 14" 
          class="w-3.5 h-2.5 text-slate-500 fish-wiggle"
          fill="currentColor"
        >
          <!-- Streamlined Fish Body -->
          <path d="M22 7 C18 2, 11 0.5, 4 4.5 C2.5 2, 0 1, 0 3.5 C1.5 5.5, 1.8 7, 0 10.5 C0 13, 2.5 12, 4 9.5 C11 13.5, 18 12, 22 7 Z" />
          <!-- Dorsal Fin -->
          <path d="M12 2 C13 0, 15 0.5, 16 2 Z" fill="#94A3B8" />
          <!-- Pectoral Fin -->
          <path d="M9 7 C11 7.5, 11 9, 8 8.5 Z" fill="#64748B" />
          <!-- Fish Eye Dot -->
          <circle cx="18" cy="6" r="1" fill="#FFFFFF" />
          <circle cx="18" cy="6" r="0.5" fill="#334155" />
        </svg>

        <!-- Subtle trailing wake dot -->
        <span 
          class="inline-block w-1 h-1 rounded-full bg-slate-300 pointer-events-none"
          :class="isBackward ? 'ml-0.5' : 'mr-0.5'"
        ></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fishWiggleAnimation {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg) translateY(-0.5px);
  }
  75% {
    transform: rotate(5deg) translateY(0.5px);
  }
}

.fish-wiggle {
  animation: fishWiggleAnimation 0.4s ease-in-out infinite;
  transform-origin: 30% 50%;
}
</style>
