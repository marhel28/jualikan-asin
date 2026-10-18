<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

useHead({
  title: 'Kebijakan Privasi | Laut Berkah Abadi Banyuwangi',
  meta: [
    {
      name: 'description',
      content: 'Kebijakan perlindungan data dan privasi pelanggan Laut Berkah Abadi Banyuwangi.'
    }
  ]
})
</script>

<template>
  <div class="bg-[#F8FAFC] text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center">
    <div class="w-full max-w-md bg-white min-h-screen flex flex-col border-x border-slate-200/80 shadow-none pb-24">
      
      <!-- Top Navigation -->
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button 
            type="button"
            aria-label="Kembali" 
            @click="goBack"
            class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-[#002242] active:scale-95 cursor-pointer"
          >
            <span class="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 class="text-base font-semibold text-[#002242]">Kebijakan Privasi</h1>
        </div>
      </header>

      <!-- Content -->
      <main class="p-4 flex flex-col gap-4 text-xs text-slate-600 leading-relaxed">
        <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
          <span class="material-symbols-outlined text-[20px] text-[#103860] mt-0.5">security</span>
          <p class="text-slate-700">
            Laut Berkah Abadi berkomitmen menjaga kerahasiaan dan keamanan informasi pribadi setiap pelanggan sesuai peraturan perundang-undangan Republik Indonesia.
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-bold text-slate-900 text-sm">1. Data yang Dikumpulkan</h2>
          <p>
            Informasi yang kami minta saat Anda melakukan transaksi terbatas pada keperluan pengiriman pesanan hasil laut segar, mencakup nama lengkap, nomor WhatsApp aktif, alamat penerima, serta catatan khusus dapur.
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-bold text-slate-900 text-sm">2. Penggunaan Informasi</h2>
          <p>
            Data pribadi digunakan secara eksklusif untuk:
          </p>
          <ul class="list-disc pl-4 space-y-1">
            <li>Memproses pesanan dan mengonfirmasi pembayaran instan (QRIS / Virtual Account).</li>
            <li>Mengirimkan foto bukti nota timbangan digital melalui WhatsApp sebelum paket berangkat.</li>
            <li>Memandu kurir armada dingin menuju lokasi pengantaran Anda.</li>
          </ul>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-bold text-slate-900 text-sm">3. Keamanan Transaksi</h2>
          <p>
            Pembayaran diproses melalui gateway resmi Bank Indonesia dengan QRIS Dinamis dan Virtual Account terenkripsi. Kami tidak pernah menyimpan data rahasia perbankan atau PIN Anda.
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-bold text-slate-900 text-sm">4. Hak Akses dan Pembaruan Data</h2>
          <p>
            Anda berhak memperbarui alamat pengiriman atau meminta penghapusan riwayat akun kapan saja dengan menghubungi Customer Service WhatsApp resmi kami.
          </p>
        </div>

        <div class="pt-2">
          <NuxtLink 
            to="/" 
            class="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Kembali ke Beranda</span>
          </NuxtLink>
        </div>
      </main>

      <CommonAppFooter />
    </div>
  </div>
</template>
