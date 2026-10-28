<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '~/stores/order'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Pembayaran Berhasil | Laut Berkah Abadi'
})

const route = useRoute()
const orderStore = useOrderStore()

const orderNumber = computed(() => String(route.query.order_number || route.query.order_id || ''))
const orderData = ref<any>(null)
const isLoading = ref(true)

const fetchConfirmedOrder = async () => {
  if (!orderNumber.value) {
    if (orderStore.currentOrder) {
      orderData.value = {
        order_number: orderStore.currentOrder.id,
        grand_total: orderStore.currentOrder.totalAmount,
        delivery_slot: orderStore.currentOrder.deliverySlotLabel,
        payment_type: 'qris',
        cold_chain_status: 'COLD_ROOM_INTAKE',
        items: orderStore.currentOrder.items.map(it => ({
          product_name: it.name,
          cut_type: it.cutLabel,
          gross_weight: it.quantityKg,
          subtotal: it.itemSubtotal,
        })),
        shipping_address: orderStore.currentOrder.address,
      }
    }
    isLoading.value = false
    return
  }

  try {
    const api = useApi()
    const target = orderNumber.value
    const res = await api.get<any>(`/orders/track/${target}`).catch(async () => {
      return await api.get<any>(`/orders/${target}`).catch(() => null)
    })
    if (res) {
      orderData.value = res
    } else if (orderStore.currentOrder) {
      orderData.value = {
        order_number: orderStore.currentOrder.id,
        grand_total: orderStore.currentOrder.totalAmount,
        delivery_slot: orderStore.currentOrder.deliverySlotLabel,
        payment_type: 'qris',
        cold_chain_status: 'COLD_ROOM_INTAKE',
        items: orderStore.currentOrder.items.map(it => ({
          product_name: it.name,
          cut_type: it.cutLabel,
          gross_weight: it.quantityKg,
          subtotal: it.itemSubtotal,
        })),
        shipping_address: orderStore.currentOrder.address,
      }
    }
  } catch (err) {
    console.error('Failed to load confirmed order:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchConfirmedOrder()
  orderStore.fetchUnpaidOrders()
})
</script>

<template>
  <div class="w-full max-w-2xl mx-auto py-4 sm:py-6 flex flex-col gap-5">
    <!-- Breadcrumb Desktop -->
    <nav class="hidden md:flex items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <NuxtLink to="/pesanan" class="hover:text-[#103860] transition-colors">Pesanan</NuxtLink>
      <span class="material-symbols-outlined text-[14px]">chevron_right</span>
      <span class="font-semibold text-[#103860]">Pembayaran Berhasil</span>
    </nav>

    <!-- Connected Stepper Bar (Step 3: Dikemas Aktif) -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs">
      <div class="flex items-center justify-between relative px-2 sm:px-4">
        <!-- Connecting Line Background -->
        <div class="absolute left-8 right-8 top-3.5 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"></div>
        <!-- Active Connecting Line (Progress up to Step 3: Dikemas) -->
        <div class="absolute left-8 w-[66%] top-3.5 -translate-y-1/2 h-0.5 bg-emerald-500 -z-0"></div>

        <!-- Step 1: Keranjang (Selesai) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <span class="material-symbols-outlined text-[15px]">check</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-bold text-slate-700">Keranjang</span>
        </div>

        <!-- Step 2: Pembayaran (Selesai) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <span class="material-symbols-outlined text-[15px]">check</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-bold text-slate-700">Pembayaran</span>
        </div>

        <!-- Step 3: Dikemas (Aktif di Cold Room Intake) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-[#103860] text-white flex items-center justify-center text-xs font-bold shadow-xs ring-4 ring-blue-100 animate-pulse">
            <span class="text-[11px]">3</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-extrabold text-[#103860]">Dikemas</span>
        </div>

        <!-- Step 4: Pengiriman (Menunggu) -->
        <div class="flex flex-col items-center gap-1.5 z-10">
          <div class="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center text-xs font-semibold">
            <span class="text-[11px]">4</span>
          </div>
          <span class="text-[10px] sm:text-[11px] font-medium text-slate-400">Pengiriman</span>
        </div>
      </div>
    </div>

    <!-- Success Header Card -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col items-center text-center gap-4">
      <div class="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669]">
        <span class="material-symbols-outlined text-[36px]">check_circle</span>
      </div>

      <div class="flex flex-col gap-1.5 max-w-md">
        <h1 class="text-xl sm:text-2xl font-extrabold text-[#103860] tracking-tight">
          Pembayaran Berhasil Dikonfirmasi
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Pesanan hasil laut Anda telah diterima oleh Cold Hub Muncar dan langsung masuk proses penyiapan suhu beku terkontrol.
        </p>
      </div>

      <!-- Live Cold Chain Stage Pill -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
        <span class="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
        <span>Tahap 1: Cold Room Intake Muncar (-20°C)</span>
      </div>
    </div>

    <!-- Order Metadata Card -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div class="flex flex-col">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nomor Pesanan Resmi</span>
          <span class="text-base font-extrabold text-[#103860] font-mono">
            #{{ orderData?.order_number || orderNumber || 'LBA-PROSES' }}
          </span>
        </div>
        <div class="text-right">
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Lunas</span>
          <div class="text-base font-extrabold text-emerald-700">
            Rp {{ (orderData?.grand_total || orderData?.total_amount || 0).toLocaleString('id-ID') }}
          </div>
        </div>
      </div>

      <!-- Key Details Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
          <span class="text-[11px] text-slate-500 font-medium">Jadwal Tiba Pengiriman:</span>
          <span class="font-bold text-[#103860]">
            {{ orderData?.delivery_slot || 'Slot Pagi (06:00 - 08:30 WIB)' }}
          </span>
          <span class="text-[10px] text-slate-500">Armada pendingin berangkat jam subuh dari Muncar</span>
        </div>

        <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
          <span class="text-[11px] text-slate-500 font-medium">Metode Pembayaran:</span>
          <span class="font-bold text-[#103860] uppercase">
            {{ orderData?.payment_type ? `Midtrans ${orderData.payment_type}` : 'Midtrans QRIS Dinamis' }}
          </span>
          <span class="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">verified</span>
            Terverifikasi Otomatis
          </span>
        </div>
      </div>

      <!-- Product List Summary -->
      <div v-if="orderData?.items && orderData.items.length > 0" class="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <span class="text-xs font-bold text-[#103860]">Rincian Komoditas Laut:</span>
        <div class="flex flex-col divide-y divide-slate-100">
          <div
            v-for="(item, idx) in orderData.items"
            :key="idx"
            class="py-2 flex items-center justify-between text-xs"
          >
            <div class="flex flex-col">
              <span class="font-bold text-slate-800">{{ item.product_name }}</span>
              <span class="text-[11px] text-slate-500">
                Potongan: {{ item.cut_type }} ({{ item.gross_weight }} kg timbang basah)
              </span>
            </div>
            <span class="font-semibold text-slate-700 font-mono">
              Rp {{ (item.subtotal || 0).toLocaleString('id-ID') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Cold Chain Assurance Box -->
      <div class="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
        <span class="material-symbols-outlined text-[20px] text-[#059669] shrink-0 mt-0.5">ac_unit</span>
        <div class="flex flex-col gap-0.5 text-xs text-emerald-950">
          <span class="font-bold text-[#059669]">Jaminan Segar Rantai Dingin 100%</span>
          <p class="text-[11px] text-emerald-900 leading-relaxed">
            Ikan dibekukan cepat dan dikemas dengan ice pack gel food-grade di pelabuhan Muncar. Kurir akan mengirimkan foto timbangan basah dan foto serah terima saat tiba di lokasi Anda.
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation & Action Buttons -->
    <div class="flex flex-col sm:flex-row items-center gap-3">
      <NuxtLink
        :to="`/pesanan/${orderData?.order_number || orderNumber}`"
        class="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[18px]">local_shipping</span>
        <span>Lacak Perjalanan Rantai Dingin</span>
      </NuxtLink>

      <NuxtLink
        to="/katalog"
        class="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[18px]">storefront</span>
        <span>Belanja Ikan Lainnya</span>
      </NuxtLink>
    </div>
  </div>
</template>

