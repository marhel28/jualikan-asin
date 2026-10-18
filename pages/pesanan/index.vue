<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '~/stores/order'

useHead({
  title: 'Pesanan Saya | Laut Berkah Abadi'
})

const router = useRouter()
const orderStore = useOrderStore()
const activeTab = ref<'aktif' | 'riwayat'>('aktif')
const isDetailModalOpen = ref(false)

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const order = computed(() => orderStore.currentOrder)

const statusLabel = computed(() => {
  if (!order.value) return 'Diproses'
  switch (order.value.status) {
    case 'PENDING_PAYMENT':
      return 'Menunggu Pembayaran'
    case 'CONFIRMED':
    case 'COLD_ROOM_INTAKE':
    case 'BUTCHERING_PREP':
      return 'Sedang Disiapkan'
    case 'COLD_PACKED':
      return 'Siap Dikirim'
    case 'OUT_FOR_DELIVERY':
      return 'Dalam Pengantaran'
    case 'DELIVERED':
      return 'Selesai Diterima'
    default:
      return 'Diproses'
  }
})

const stepIndex = computed(() => {
  if (!order.value) return 1
  switch (order.value.status) {
    case 'PENDING_PAYMENT':
      return 1
    case 'CONFIRMED':
    case 'COLD_ROOM_INTAKE':
    case 'BUTCHERING_PREP':
      return 2
    case 'COLD_PACKED':
      return 3
    case 'OUT_FOR_DELIVERY':
    case 'DELIVERED':
      return 4
    default:
      return 2
  }
})

const waConciergeUrl = computed(() => {
  const orderId = order.value?.id || 'LBA'
  return `https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi%2C%20saya%20ingin%20menanyakan%20status%20pesanan%20ID%20${orderId}.`
})
</script>

<template>
  <div class="w-full flex flex-col gap-4 py-1">
    <!-- Desktop Breadcrumb -->
    <nav class="hidden md:flex items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <span class="font-semibold text-[#103860]">Pesanan Saya</span>
    </nav>

    <!-- Page Title & Minimalist Tab Navigation -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-3">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="goBack"
          class="md:hidden p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-[#103860]"
          aria-label="Kembali"
        >
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 class="text-base md:text-lg font-bold text-[#103860]">Pesanan Saya</h1>
      </div>

      <div class="flex items-center gap-6 text-xs md:text-sm">
        <button
          type="button"
          @click="activeTab = 'aktif'"
          class="font-bold pb-2 -mb-3 transition-colors relative cursor-pointer flex items-center gap-1.5"
          :class="activeTab === 'aktif' ? 'text-[#103860]' : 'text-slate-400 hover:text-slate-600 font-normal'"
        >
          <span>Pesanan Aktif</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-[#059669] font-bold">
            {{ order ? 1 : 0 }}
          </span>
          <span 
            v-if="activeTab === 'aktif'" 
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103860] rounded-full"
          ></span>
        </button>

        <button
          type="button"
          @click="activeTab = 'riwayat'"
          class="pb-2 -mb-3 transition-colors relative cursor-pointer"
          :class="activeTab === 'riwayat' ? 'text-[#103860] font-bold' : 'text-slate-400 hover:text-slate-600 font-normal'"
        >
          <span>Riwayat Selesai</span>
          <span 
            v-if="activeTab === 'riwayat'" 
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#103860] rounded-full"
          ></span>
        </button>
      </div>
    </div>

    <!-- Active Order View -->
    <div v-if="activeTab === 'aktif'">
      <div v-if="order" class="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] lg:grid-cols-[1.8fr_1fr] gap-4 md:gap-6 items-start">
        <!-- Left Column: Cold Chain Stages, ETA & Products List -->
        <div class="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
          <!-- Order Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex flex-col">
              <span class="font-mono text-sm md:text-base font-bold text-[#103860]">#{{ order.id }}</span>
              <span class="text-[11px] text-slate-400">Pembayaran Lunas via QRIS</span>
            </div>

            <div class="text-right">
              <span class="text-xs md:text-sm font-bold text-[#059669] block">
                {{ statusLabel }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium">Tahap {{ stepIndex }} dari 4</span>
            </div>
          </div>

          <!-- Sleek Progress Indicator -->
          <div class="flex flex-col gap-1.5 py-0.5">
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                class="h-full bg-[#059669] rounded-full transition-all duration-500" 
                :style="{ width: ((stepIndex) / 4) * 100 + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-[11px] text-slate-400 pt-0.5">
              <span :class="stepIndex >= 1 ? 'text-[#059669] font-medium' : ''">Dipesan</span>
              <span :class="stepIndex >= 2 ? 'text-[#103860] font-bold' : ''">Disiapkan</span>
              <span :class="stepIndex >= 3 ? 'text-[#059669] font-medium' : ''">Dikemas</span>
              <span :class="stepIndex >= 4 ? 'text-[#059669] font-medium' : ''">Diantar</span>
            </div>
          </div>

          <!-- Delivery ETA Row -->
          <div class="flex flex-wrap items-center gap-2 py-2.5 px-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
            <span class="material-symbols-outlined text-[18px] text-[#103860]">schedule</span>
            <span class="font-bold text-slate-800">Tiba: Besok Pagi, 06:00 - 08:30 WIB</span>
            <span class="text-slate-300 hidden sm:inline">•</span>
            <span class="text-slate-600">Slot Subuh Rantai Dingin (0 - 4°C)</span>
          </div>

          <!-- Ordered Products List -->
          <div class="flex flex-col gap-3 py-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#103860] uppercase tracking-wider">Daftar Produk Segar</span>
              <span class="text-[11px] text-slate-500">{{ (order.items || []).length }} item</span>
            </div>

            <div class="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              <div 
                v-for="item in (order.items || [])" 
                :key="item.id"
                class="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <img 
                    :src="item.imageUrl" 
                    :alt="item.name" 
                    class="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0 border border-slate-200/60"
                  />
                  <div class="flex flex-col min-w-0">
                    <span class="text-xs font-bold text-slate-800 truncate">{{ item.name }}</span>
                    <span class="text-[11px] text-slate-500 truncate">
                      {{ item.quantityKg }} kg • {{ item.cutLabel }}
                      <span v-if="item.separateSoupBones"> • Termasuk Kepala & Tulang</span>
                    </span>
                  </div>
                </div>
                <span class="text-xs font-bold text-[#103860] font-mono whitespace-nowrap shrink-0">
                  Rp {{ item.itemSubtotal.toLocaleString('id-ID') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Shipping Destination, Bill Summary & Actions (Sticky Desktop) -->
        <div class="flex flex-col gap-4 md:sticky md:top-24">
          <!-- Delivery Address & Kitchen Notes Card -->
          <div class="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <span class="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>Tujuan Pengantaran</span>
            </h2>

            <div class="flex flex-col gap-2 text-xs text-slate-600">
              <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-[16px] text-[#103860] mt-0.5 shrink-0">location_on</span>
                <div class="flex-1 leading-relaxed">
                  <div class="font-bold text-slate-800">{{ order.address.recipientName }}</div>
                  <div class="text-[11px] text-slate-500">{{ order.address.phone }}</div>
                  <div class="mt-1 text-slate-700">{{ order.address.street }}, {{ order.address.district }}, {{ order.address.city }}</div>
                </div>
              </div>

              <div v-if="order.kitchenNotes" class="mt-1 pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-600">
                <span class="material-symbols-outlined text-[15px] text-amber-600 shrink-0">edit_note</span>
                <span><strong>Catatan Dapur:</strong> {{ order.kitchenNotes }}</span>
              </div>
            </div>
          </div>

          <!-- Total Bill & Actions Card -->
          <div class="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <h2 class="text-xs font-bold text-[#103860] uppercase tracking-wider pb-2 border-b border-slate-100">
              Rincian Pembayaran
            </h2>

            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Status Pembayaran:</span>
              <span class="font-bold text-[#059669]">Lunas (QRIS)</span>
            </div>

            <div class="flex items-baseline justify-between border-t border-slate-100 pt-2.5">
              <span class="text-xs text-slate-500">Total Pembayaran:</span>
              <span class="text-lg font-extrabold text-[#103860]">
                Rp {{ order.totalAmount.toLocaleString('id-ID') }}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row md:flex-col gap-2.5 pt-2">
              <button
                type="button"
                @click="isDetailModalOpen = true"
                class="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#103860] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[16px]">scale</span>
                <span>Bukti Timbangan & QC</span>
              </button>

              <NuxtLink
                :to="`/pesanan/${order.id}`"
                class="w-full py-2.5 px-3 rounded-xl border border-[#103860]/20 bg-blue-50/50 hover:bg-blue-50 text-xs font-bold text-[#103860] flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <span class="material-symbols-outlined text-[16px]">timeline</span>
                <span>Pelacakan 5 Tahap Detail</span>
              </NuxtLink>

              <a
                :href="waConciergeUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-2.5 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer text-center"
              >
                <span class="material-symbols-outlined text-[16px]">support_agent</span>
                <span>Bantuan WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State Active -->
      <div v-else class="text-center py-12 flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-[36px] text-slate-300">receipt_long</span>
        <span class="text-xs font-bold text-slate-700">Belum Ada Pesanan Aktif</span>
        <span class="text-[11px] text-slate-400">Pesanan yang sedang diproses akan tampil di sini.</span>
        <NuxtLink
          to="/katalog"
          class="mt-2 px-4 py-2 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all"
        >
          Lihat Katalog
        </NuxtLink>
      </div>
    </div>

    <!-- History Tab View -->
    <div v-else class="text-center py-12 flex flex-col items-center gap-2">
      <span class="material-symbols-outlined text-[36px] text-slate-300">history</span>
      <span class="text-xs font-bold text-slate-700">Belum Ada Riwayat Pesanan</span>
      <span class="text-[11px] text-slate-400">Pesanan yang telah selesai akan tersimpan di sini.</span>
      <NuxtLink
        to="/katalog"
        class="mt-2 px-4 py-2 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all"
      >
        Mulai Belanja
      </NuxtLink>
    </div>

    <!-- Scale & QC Modal -->
    <div 
      v-if="isDetailModalOpen && order" 
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 flex flex-col gap-3 shadow-xl">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-xs sm:text-sm font-bold text-[#103860]">Bukti Timbangan & Uji Mutu</h3>
          <button 
            type="button" 
            @click="isDetailModalOpen = false" 
            class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <img 
          :src="order.scaleSlipImageUrl" 
          alt="Foto Slip Timbangan Digital" 
          class="w-full h-44 sm:h-52 object-cover rounded-xl bg-slate-100"
        />

        <div class="flex flex-col gap-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
          <div class="flex justify-between">
            <span class="text-slate-500">Timbangan Basah Bruto:</span>
            <span class="font-bold text-slate-800">{{ order.scaleWeightGrossKg }} kg</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Suhu Cold Room:</span>
            <span class="font-bold text-[#103860]">-18 derajat Celsius</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Uji Bebas Formalin:</span>
            <span class="font-bold text-[#059669]">Negatif (Lolos QC 100%)</span>
          </div>
        </div>

        <button 
          type="button" 
          @click="isDetailModalOpen = false"
          class="w-full py-2 bg-[#103860] text-white rounded-xl text-xs font-bold hover:bg-[#13446E] transition-all cursor-pointer mt-1"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>
