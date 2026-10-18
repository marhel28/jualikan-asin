<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from '~/stores/cart'
import { useCheckoutStore, type CourierType, type DeliverySlot } from '~/stores/checkout'
import { useOrderStore } from '~/stores/order'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Checkout Pengiriman Hasil Laut | Laut Berkah Abadi'
})

const router = useRouter()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const orderStore = useOrderStore()

const handleProceedToPayment = () => {
  const newOrderId = orderStore.createOrder()
  router.push(`/pembayaran/${newOrderId}`)
}
</script>

<template>
  <!-- Responsive Checkout: 1 col on mobile, 2 col on desktop md+ -->
  <div class="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 md:gap-6 items-start pb-24 md:pb-8">
    <!-- Left Column: Address, Courier, and Delivery Slot Selection -->
    <div class="flex flex-col gap-4">
      <!-- Recipient Address Card -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#103860] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">location_on</span>
            Alamat Tujuan Pengiriman
          </span>
          <span class="text-[11px] font-semibold text-[#059669] flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">verified</span>
            GPS Terverifikasi
          </span>
        </div>

        <div class="text-xs text-slate-800 font-semibold mt-1">
          {{ checkoutStore.address.recipientName }} ({{ checkoutStore.address.recipientPhone }})
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          {{ checkoutStore.address.street }}
        </p>
        <p class="text-[11px] text-slate-500 italic">
          {{ checkoutStore.address.benchmark }}
        </p>
      </div>

      <!-- Courier Selector Card -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-3">
        <span class="text-xs font-bold text-[#103860] flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">local_shipping</span>
          Pilihan Layanan Armada Dingin
        </span>

        <div class="grid grid-cols-1 gap-2">
          <label 
            v-for="courier in [
              { id: 'lba_cold_courier', name: 'Armada Kurir Dingin LBA', fee: cartStore.isFreeShipping ? 0 : 12000, desc: 'Motor Box Insulasi Chilled 0-4 C' },
              { id: 'paxel_cold', name: 'Paxel Cold Express', fee: 25000, desc: 'Luar Kota / Next Day Chilled' },
              { id: 'self_pickup', name: 'Ambil Mandiri Cold Storage Muncar', fee: 0, desc: 'Bebas Biaya (Langsung dari Gudang Utama)' }
            ]"
            :key="courier.id"
            class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
            :class="checkoutStore.selectedCourier === courier.id ? 'border-[#103860] bg-blue-50/40 shadow-xs' : 'border-slate-200'"
          >
            <input 
              type="radio" 
              name="courier" 
              :value="courier.id" 
              :checked="checkoutStore.selectedCourier === courier.id"
              @change="checkoutStore.setCourier(courier.id as CourierType)"
              class="mt-1 text-[#103860]"
            />
            <div class="flex-1">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-[#0F172A]">{{ courier.name }}</span>
                <span class="font-extrabold text-[#103860]">
                  {{ courier.fee === 0 ? 'Gratis' : `Rp ${courier.fee.toLocaleString('id-ID')}` }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">{{ courier.desc }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Subuh Delivery Slot Selector -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-3">
        <span class="text-xs font-bold text-[#103860] flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">schedule</span>
          Pilihan Slot Kedatangan Kurir
        </span>

        <div class="grid grid-cols-1 gap-2">
          <label 
            v-for="slot in [
              { id: 'subuh', title: 'Slot Pagi Subuh (06:00 - 08:30 WIB)', badge: 'Terbaik', desc: 'Pilihan terbaik untuk langsung dimasak sarapan dan makan siang' },
              { id: 'siang', title: 'Slot Siang (10:30 - 13:00 WIB)', badge: null, desc: 'Pengiriman reguler tengah hari' },
              { id: 'sore', title: 'Slot Sore (16:00 - 18:30 WIB)', badge: null, desc: 'Cocok untuk persiapan santap malam keluarga' }
            ]"
            :key="slot.id"
            class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
            :class="checkoutStore.selectedDeliverySlot === slot.id ? 'border-[#103860] bg-blue-50/40 shadow-xs' : 'border-slate-200'"
          >
            <input 
              type="radio" 
              name="slot" 
              :value="slot.id" 
              :checked="checkoutStore.selectedDeliverySlot === slot.id"
              @change="checkoutStore.setDeliverySlot(slot.id as DeliverySlot)"
              class="mt-1 text-[#103860]"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2 text-xs">
                <span class="font-bold text-[#0F172A]">{{ slot.title }}</span>
                <span v-if="slot.badge" class="text-[#059669] text-[11px] font-semibold">
                  (Rekomendasi)
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">{{ slot.desc }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Catatan untuk Penjual / Dapur Preparasi -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-2.5">
        <label for="kitchen-notes" class="text-xs font-bold text-[#103860] flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">edit_note</span>
          Catatan untuk Penjual
          <span class="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">Opsional</span>
        </label>
        <p class="text-[11px] text-slate-500 leading-relaxed">
          Instruksi pemotongan, pemisahan kepala/tulang untuk sup, atau penanganan kemasan dingin.
        </p>
        <textarea
          id="kitchen-notes"
          v-model="cartStore.kitchenNotes"
          rows="3"
          maxlength="200"
          placeholder="Contoh: Pisahkan kepala & tulang untuk kuah, fillet bagi dua, tambah es gel lebih banyak."
          class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#103860] focus:ring-2 focus:ring-[#103860]/10 focus:outline-none resize-none transition-colors"
        ></textarea>
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-slate-400">{{ cartStore.kitchenNotes.length }}/200 karakter</span>
          <span v-if="cartStore.kitchenNotes.length > 0" class="text-[#059669] font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">check_circle</span>
            Akan diteruskan ke dapur
          </span>
        </div>
      </div>
    </div>

    <!-- Right Column: Guarantee Notice + Bill Breakdown + CTA -->
    <div class="flex flex-col gap-4 md:sticky md:top-20">
      <!-- Mini Cart Items Summary (Clean Desktop & Mobile Preview) -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-3">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <span class="text-xs font-bold text-[#103860] uppercase tracking-wider flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">set_meal</span>
            Ringkasan Ikan Segar ({{ cartStore.items.length }})
          </span>
          <NuxtLink to="/keranjang" class="text-[11px] font-semibold text-[#103860] hover:underline">
            Ubah
          </NuxtLink>
        </div>

        <div class="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id" 
            class="py-2 flex items-center justify-between gap-3 text-xs"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <img 
                :src="item.imageUrl" 
                :alt="item.name" 
                class="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
              />
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-slate-800 truncate">{{ item.name }}</span>
                <span class="text-[11px] text-slate-500">
                  {{ item.quantityKg }} kg • {{ item.cutLabel }}
                </span>
              </div>
            </div>
            <span class="font-bold text-[#103860] font-mono shrink-0">
              Rp {{ item.itemSubtotal.toLocaleString('id-ID') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Order Final Bill Card -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-2.5">
        <span class="text-xs font-bold text-[#103860] uppercase tracking-wider pb-1 border-b border-slate-100">
          Rincian Biaya
        </span>
        <div class="flex justify-between text-xs text-slate-600">
          <span>Subtotal Produk</span>
          <span class="font-semibold text-slate-800 font-mono">Rp {{ cartStore.productsSubtotal.toLocaleString('id-ID') }}</span>
        </div>
        <div class="flex justify-between text-xs text-slate-600">
          <span>Proteksi Rantai Dingin</span>
          <span class="font-semibold text-slate-800 font-mono">Rp {{ cartStore.packagingFee.toLocaleString('id-ID') }}</span>
        </div>
        <div class="flex justify-between text-xs text-slate-600">
          <span>Ongkos Kirim Kurir Dingin</span>
          <span class="font-semibold text-slate-800 font-mono">
            {{ checkoutStore.shippingFee === 0 ? 'Gratis' : `Rp ${checkoutStore.shippingFee.toLocaleString('id-ID')}` }}
          </span>
        </div>
        <div class="pt-2 border-t border-slate-100 flex justify-between items-baseline text-sm font-bold text-[#103860]">
          <span>Total Pembayaran</span>
          <span class="text-base md:text-lg font-extrabold font-mono text-[#103860]">
            Rp {{ checkoutStore.totalBill.toLocaleString('id-ID') }}
          </span>
        </div>
      </div>

      <!-- Metode Pembayaran Pilihan -->
      <div class="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col gap-2.5">
        <span class="text-xs font-bold text-[#103860] uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
          Metode Pembayaran
        </span>

        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="orderStore.setPaymentMethod('qris_dynamic')"
            class="p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer"
            :class="orderStore.selectedPaymentMethod === 'qris_dynamic' ? 'border-[#103860] bg-blue-50/50 ring-1 ring-[#103860]/20' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#103860]">QRIS Instan</span>
              <span v-if="orderStore.selectedPaymentMethod === 'qris_dynamic'" class="material-symbols-outlined text-[16px] text-[#059669]">check_circle</span>
            </div>
            <span class="text-[10px] text-slate-500">BCA, Mandiri, GoPay, OVO</span>
          </button>

          <button
            type="button"
            @click="orderStore.setPaymentMethod('bank_transfer')"
            class="p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer"
            :class="orderStore.selectedPaymentMethod === 'bank_transfer' ? 'border-[#103860] bg-blue-50/50 ring-1 ring-[#103860]/20' : 'border-slate-200 hover:border-slate-300'"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#103860]">Virtual Account</span>
              <span v-if="orderStore.selectedPaymentMethod === 'bank_transfer'" class="material-symbols-outlined text-[16px] text-[#059669]">check_circle</span>
            </div>
            <span class="text-[10px] text-slate-500">Transfer Otomatis 24 Jam</span>
          </button>
        </div>
      </div>

      <!-- Payment CTA -->
      <button 
        type="button"
        @click="handleProceedToPayment"
        class="w-full py-3.5 rounded-xl bg-[#103860] text-white text-xs font-bold hover:bg-[#13446E] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span class="material-symbols-outlined text-[18px]">
          {{ orderStore.selectedPaymentMethod === 'qris_dynamic' ? 'qr_code_2' : 'lock' }}
        </span>
        <span>
          {{ orderStore.selectedPaymentMethod === 'qris_dynamic' ? 'Lanjut ke QRIS Dinamis' : 'Lanjut ke Virtual Account' }}
        </span>
      </button>

      <!-- Clean Guarantee Notice Card (Secondary footer in right column) -->
      <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600">
        <span class="material-symbols-outlined text-[18px] text-[#059669] shrink-0 mt-0.5">verified_user</span>
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-slate-800 text-[11px]">Garansi Rantai Dingin Terjamin</span>
          <p class="text-[10px] leading-relaxed text-slate-500">
            Suhu 0 - 4°C terjaga sampai depan pintu. Rekam unboxing untuk kemudahan klaim penggantian bila mutu berkurang.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

