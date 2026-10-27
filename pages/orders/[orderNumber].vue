<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  layout: 'clean'
})

const route = useRoute()
const router = useRouter()
const orderNumber = String(route.params.orderNumber || '')

onMounted(async () => {
  if (!orderNumber) {
    router.replace('/pesanan')
    return
  }

  try {
    const api = useApi()
    const res = await api.get<any>(`/orders/track/${orderNumber}`).catch(async () => {
      return await api.get<any>(`/orders/${orderNumber}`).catch(() => null)
    })

    if (res) {
      if (res.payment_status === 'PAID') {
        router.replace(`/pesanan/${orderNumber}`)
      } else {
        router.replace(`/pembayaran/${orderNumber}`)
      }
    } else {
      router.replace(`/pembayaran/${orderNumber}`)
    }
  } catch {
    router.replace(`/pembayaran/${orderNumber}`)
  }
})
</script>

<template>
  <div class="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center gap-3">
    <div class="w-8 h-8 border-3 border-[#103860]/20 border-t-[#103860] rounded-full animate-spin"></div>
    <p class="text-xs font-semibold text-[#103860]">Mengarahkan ke status pesanan...</p>
  </div>
</template>

