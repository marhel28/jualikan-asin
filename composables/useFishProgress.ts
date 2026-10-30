import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isLoading = ref(false)
const progress = ref(0)
const isBackward = ref(false)
let trickleTimer: any = null
let safetyTimer: any = null
let finishTimer: any = null

const TAB_INDEX_MAP: Record<string, number> = {
  '/': 0,
  '/katalog': 1,
  '/keranjang': 2,
  '/pesanan': 3,
  '/akun': 4,
  '/auth': 5,
  '/tentang': 6,
  '/syarat-ketentuan': 7,
  '/kebijakan-privasi': 8,
}

export function useFishProgress() {
  const router = useRouter()

  const start = (backward = false) => {
    isBackward.value = backward
    isLoading.value = true
    progress.value = 18

    if (trickleTimer) clearInterval(trickleTimer)
    if (safetyTimer) clearTimeout(safetyTimer)
    if (finishTimer) clearTimeout(finishTimer)

    // Trickle progress naturally toward 85%
    trickleTimer = setInterval(() => {
      if (progress.value < 55) {
        progress.value += Math.random() * 14 + 6
      } else if (progress.value < 78) {
        progress.value += Math.random() * 8 + 3
      } else if (progress.value < 88) {
        progress.value += Math.random() * 3 + 1
      }
    }, 120)

    // Safety timeout: auto finish if transition takes > 6s
    safetyTimer = setTimeout(() => {
      finish()
    }, 6000)
  }

  const finish = () => {
    if (trickleTimer) clearInterval(trickleTimer)
    if (safetyTimer) clearTimeout(safetyTimer)

    progress.value = 100

    // Allow fish to reach the border, then fade out
    finishTimer = setTimeout(() => {
      isLoading.value = false
      setTimeout(() => {
        progress.value = 0
        isBackward.value = false
      }, 200)
    }, 180)
  }

  return {
    isLoading,
    progress,
    isBackward,
    start,
    finish,
    TAB_INDEX_MAP
  }
}
