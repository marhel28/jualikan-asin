<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '~/stores/order'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Pelacakan Rantai Dingin 5 Tahap | Laut Berkah Abadi'
})

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = computed(() => String(route.params.orderId))
const order = computed(() => orderStore.currentOrder)

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/pesanan')
  }
}

const waConciergeUrl = computed(() => {
  return `https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi%2C%20saya%20ingin%20menanyakan%20status%20pesanan%20dengan%20ID%20${orderId.value}.`
})
</script>

<template>
  <div class="w-full flex flex-col gap-4 py-1">
    <!-- Desktop Breadcrumb -->
    <nav class="hidden md:flex items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <NuxtLink to="/pesanan" class="hover:text-[#103860] transition-colors">Pesanan Saya</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <span class="font-semibold text-[#103860]">#{{ orderId }}</span>
    </nav>

    <!-- Page Header with Mobile Back -->
    <div class="flex items-center gap-3 pb-2 border-b border-slate-200/80">
      <button
        type="button"
        @click="goBack"
        class="md:hidden p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-[#103860]"
        aria-label="Kembali"
      >
        <span class="material-symbols-outlined text-[24px]">arrow_back</span>
      </button>
      <h1 class="text-base md:text-lg font-bold text-[#103860]">Pelacakan Rantai Dingin</h1>
    </div>

    <!-- 2-Column Desktop Grid -->
    <div class="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] lg:grid-cols-[1.8fr_1fr] gap-4 md:gap-6 items-start">
      <!-- Left Column: Status Banner + 5-Stage Timeline -->
      <div class="flex flex-col gap-4">
        <!-- Active Status Card -->
        <div class="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-[#103860] flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-[20px]">ac_unit</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-[#103860]">Rantai Dingin Aktif</span>
              <span class="text-[11px] text-slate-500">ID Pesanan #{{ orderId }}</span>
            </div>
          </div>
          <span class="text-xs font-bold text-[#059669]">
            {{ order?.status === 'DELIVERED' ? 'Terkirim' : 'Diproses' }}
          </span>
        </div>

        <!-- 5-Stage Cold Chain Timeline Card -->
        <div class="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">timeline</span>
              5 Tahap Proteksi Mutu & Rantai Dingin
            </h2>
          </div>

          <div class="flex flex-col gap-4">
            <div 
              v-for="stage in (order?.trackingStages || [])" 
              :key="stage.stageIndex"
              class="flex items-start gap-3 relative"
            >
              <!-- Stage Indicator Icon Circle -->
              <div 
                class="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-all"
                :class="stage.isCompleted 
                  ? 'bg-[#059669] text-white shadow-xs' 
                  : (stage.isActive ? 'bg-[#103860] text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400')"
              >
                <span v-if="stage.isCompleted" class="material-symbols-outlined text-[14px]">check</span>
                <span v-else>{{ stage.stageIndex }}</span>
              </div>

              <!-- Stage Details -->
              <div class="flex-1 flex flex-col gap-0.5">
                <div class="flex justify-between items-center text-xs">
                  <span 
                    class="font-bold"
                    :class="stage.isActive ? 'text-[#103860]' : (stage.isCompleted ? 'text-slate-800' : 'text-slate-400')"
                  >
                    {{ stage.title }}
                  </span>
                  <span v-if="stage.timestamp" class="text-[10px] text-slate-400 font-mono">
                    {{ stage.timestamp }}
                  </span>
                </div>
                <p 
                  class="text-[11px] leading-relaxed"
                  :class="stage.isActive ? 'text-[#103860] font-medium' : 'text-slate-500'"
                >
                  {{ stage.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Stage Advance Simulation Button (For QA & Verification) -->
          <button 
            type="button"
            @click="orderStore.advanceTrackingStage"
            class="mt-2 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-[#103860] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span class="material-symbols-outlined text-[14px]">fast_forward</span>
            <span>Simulasikan Progres Tahap Berikutnya</span>
          </button>
        </div>
      </div>

      <!-- Right Column: Scale Slip, WhatsApp (Sticky Desktop) -->
      <div class="flex flex-col gap-4 md:sticky md:top-24">
        <!-- Digital Scale Slip & Quality Inspection -->
        <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px] text-[#103860]">scale</span>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-800">Foto Timbangan & Uji Formalin</span>
                <span class="text-[11px] text-slate-500">Timbangan basah bruto 4.0 kg terkalibrasi</span>
              </div>
            </div>
          </div>
          <button 
            type="button"
            @click="orderStore.openScaleSlipModal"
            class="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#103860] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-[16px]">photo_camera</span>
            <span>Lihat Slip Timbangan</span>
          </button>
        </div>

        <!-- Concierge WhatsApp Action -->
        <a 
          :href="waConciergeUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-full py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span class="material-symbols-outlined text-[18px]">support_agent</span>
          <span>Hubungi Concierge Cold Storage Muncar</span>
        </a>
      </div>
    </div>

    <!-- Scale Slip Modal -->
    <div 
      v-if="orderStore.isScaleSlipModalOpen"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 flex flex-col gap-3 shadow-2xl">
        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 class="text-xs sm:text-sm font-bold text-[#103860]">Slip Timbangan & Sertifikat Mutu</h3>
          <button 
            type="button" 
            @click="orderStore.closeScaleSlipModal"
            class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <img 
          :src="order?.scaleSlipImageUrl" 
          alt="Foto Slip Timbangan Digital" 
          class="w-full h-44 sm:h-52 object-cover rounded-xl bg-slate-100"
        />
        <div class="flex flex-col gap-1 text-xs text-slate-600">
          <div class="flex justify-between">
            <span>Timbangan Basah Bruto:</span>
            <span class="font-bold text-slate-800">{{ order?.scaleWeightGrossKg }} kg</span>
          </div>
          <div class="flex justify-between">
            <span>Uji Bebas Formalin:</span>
            <span class="font-bold text-[#059669]">Negatif (Lolos QC)</span>
          </div>
        </div>
        <button 
          type="button" 
          @click="orderStore.closeScaleSlipModal"
          class="w-full py-2.5 bg-[#103860] text-white rounded-xl text-xs font-bold mt-1 cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

