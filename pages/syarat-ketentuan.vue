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
  title: 'Syarat & Ketentuan | Laut Berkah Abadi Banyuwangi',
  meta: [
    {
      name: 'description',
      content: 'Syarat dan ketentuan pembelian hasil laut segar, standar penimbangan catch-weight, pengemasan rantai dingin, dan garansi kesegaran di Laut Berkah Abadi.'
    }
  ]
})
</script>

<template>
  <div class="bg-[#F8FAFC] text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center">
    <!-- Desktop Breadcrumb (hidden on mobile, aligned with max-w-6xl container) -->
    <nav class="hidden md:flex w-full max-w-5xl lg:max-w-6xl px-6 pt-4 pb-2 items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-slate-900 font-medium">Syarat & Ketentuan</span>
    </nav>

    <!-- Shell Container: mobile default, expanded responsive card on md+ -->
    <div class="w-full max-w-md md:max-w-5xl lg:max-w-6xl bg-white min-h-screen md:min-h-0 flex flex-col border-x border-slate-200/80 md:border md:rounded-xl md:my-6 shadow-none pb-24 md:pb-10">
      
      <!-- Top Navigation (Mobile only, hidden on md+ where global navbar handles header) -->
      <header class="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button 
            type="button"
            aria-label="Kembali" 
            @click="goBack"
            class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-[#002242] active:scale-95 cursor-pointer"
          >
            <span class="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 class="text-base font-semibold text-[#002242]">Syarat & Ketentuan</h1>
        </div>
      </header>

      <!-- Content -->
      <main class="p-4 md:p-8 lg:p-10 flex flex-col gap-8 text-xs text-slate-600 leading-relaxed">
        
        <!-- Header Banner -->
        <div class="p-6 md:p-8 rounded-xl bg-gradient-to-br from-[#103860] via-[#0d2f52] to-[#081a2e] text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div class="flex flex-col gap-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 self-start">
              <span class="px-2.5 py-1 rounded-md bg-white/10 text-white text-[10px] font-bold tracking-widest uppercase">
                Perlindungan Konsumen
              </span>
              <span class="text-[11px] text-slate-300">Pembaruan: Oktober 2026</span>
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white">Syarat & Ketentuan Transaksi</h2>
            <p class="text-slate-200 text-xs md:text-sm leading-relaxed">
              Panduan transparansi timbangan alami (catch-weight), standar penanganan rantai dingin Muncar, dan jaminan kesegaran 100% untuk setiap pesanan Anda.
            </p>
          </div>

          <div class="hidden lg:flex flex-col gap-2 p-3.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 text-right shrink-0">
            <span class="text-[11px] text-slate-300 font-medium">Garansi Mutu</span>
            <span class="text-sm font-bold text-white">100% Fresh Guaranteed</span>
            <span class="text-[10px] text-emerald-300 flex items-center justify-end gap-1 font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Klaim Instan dalam 2 Jam
            </span>
          </div>
        </div>

        <!-- 3 Quick Highlight Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
            <div class="w-8 h-8 rounded-lg bg-[#103860]/10 flex items-center justify-center text-[#103860]">
              <span class="material-symbols-outlined text-[20px]">scale</span>
            </div>
            <h3 class="text-xs font-bold text-slate-900">1. Timbangan Awal & Rendemen</h3>
            <p class="text-[11px] text-slate-600 leading-normal">
              Harga dihitung dari berat kotor basah saat pertama ditimbang. Susut akibat penyiangan/fillet disampaikan terbuka.
            </p>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
            <div class="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700">
              <span class="material-symbols-outlined text-[20px]">ac_unit</span>
            </div>
            <h3 class="text-xs font-bold text-slate-900">2. Standar Kemasan Dingin</h3>
            <p class="text-[11px] text-slate-600 leading-normal">
              Wajib menggunakan Thermal Bag (lokal) atau Box Styrofoam bersegel (luar kota) dengan ice gel beku suhu 0–4°C.
            </p>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
              <span class="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <h3 class="text-xs font-bold text-slate-900">3. Garansi Penggantian 100%</h3>
            <p class="text-[11px] text-slate-600 leading-normal">
              Jika ikan tidak segar atau kemasan rusak, sertakan video unboxing utuh tanpa jeda maksimal 2 jam setelah paket tiba.
            </p>
          </div>
        </div>

        <!-- Detailed Articles Grid (2 Columns on Desktop) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Pasal 1 -->
          <section class="bg-white border border-slate-200 rounded-xl p-5 md:p-6 flex flex-col gap-3">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span class="w-6 h-6 rounded-md bg-[#103860] text-white flex items-center justify-center text-xs font-bold">1</span>
              <h3 class="font-bold text-slate-900 text-sm">Sifat Produk & Timbangan Basah (Catch-Weight)</h3>
            </div>
            <p>
              Ikan dan biota laut merupakan hasil tangkapan alami nelayan dengan ukuran dan bobot yang bervariasi per ekornya.
            </p>
            <ul class="list-disc pl-4 space-y-1.5 text-slate-600">
              <li>
                <strong>Berat Pemesanan:</strong> Berat yang tertera di sistem adalah estimasi berat kotor awal saat ditimbang basah di Cold Hub Pelabuhan Muncar.
              </li>
              <li>
                <strong>Susut Penyiangan (Rendemen):</strong> Bila Anda memilih opsi penyiangan (buang insang, buang isi perut, kerok sisik) atau fillet, berat akhir yang diterima adalah berat bersih setelah pembersihan.
              </li>
              <li>
                <strong>Estimasi Rendemen Alami:</strong>
                <span class="block mt-1 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-slate-700">
                  • Ikan Utuh Siang (Sisik/Insang/Isi perut): tersisa ±80%–85% dari berat awal.<br>
                  • Fillet Murni Tanpa Kulit: tersisa ±50%–55% dari berat awal.<br>
                  • Steak / Potong Bulat: tersisa ±70%–75% dari berat awal.
                </span>
              </li>
            </ul>
          </section>

          <!-- Pasal 2 -->
          <section class="bg-white border border-slate-200 rounded-xl p-5 md:p-6 flex flex-col gap-3">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span class="w-6 h-6 rounded-md bg-[#103860] text-white flex items-center justify-center text-xs font-bold">2</span>
              <h3 class="font-bold text-slate-900 text-sm">Standar Pengemasan Rantai Dingin (Cold Chain)</h3>
            </div>
            <p>
              Untuk memastikan protein dan tekstur daging tetap prima tanpa pembusukan bakteri:
            </p>
            <ul class="list-disc pl-4 space-y-1.5 text-slate-600">
              <li>
                <strong>Kemasan Dalam:</strong> Seluruh produk dibungkus menggunakan kantong vakum nilon <em>food-grade</em> tebal yang kedap udara dan antibocor.
              </li>
              <li>
                <strong>Pengiriman Lokal Banyuwangi:</strong> Dikemas dengan Thermal Bag insulasi perak + minimal 2 Ice Gel beku khusus makanan.
              </li>
              <li>
                <strong>Pengiriman Antar-Kota / Luar Kota:</strong> Wajib menggunakan Box Styrofoam tebal bersegel lakban rapat + 4–6 Ice Gel pendingin beku pekat agar suhu 0°C–4°C bertahan hingga 24–30 jam perjalanan.
              </li>
            </ul>
          </section>

          <!-- Pasal 3 -->
          <section class="bg-white border border-slate-200 rounded-xl p-5 md:p-6 flex flex-col gap-3">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span class="w-6 h-6 rounded-md bg-[#103860] text-white flex items-center justify-center text-xs font-bold">3</span>
              <h3 class="font-bold text-slate-900 text-sm">Jadwal Pengiriman & Tanggung Jawab Penerima</h3>
            </div>
            <p>
              Kami mengutamakan kesegaran waktu konsumsi keluarga Anda:
            </p>
            <ul class="list-disc pl-4 space-y-1.5 text-slate-600">
              <li>
                <strong>Slot Pagi (06:00 - 08:30 WIB):</strong> Rekomendasi utama untuk kebutuhan olahan sarapan pagi atau katering makan siang.
              </li>
              <li>
                <strong>Slot Siang (10:00 – 12:30 WIB):</strong> Untuk pesanan yang masuk malam hari atau jadwal masak sore/malam.
              </li>
              <li>
                <strong>Kewajiban Penerima:</strong> Pelanggan wajib memastikan ada orang yang menerima paket di alamat tujuan pada rentang waktu slot pengiriman yang dipilih. Kami tidak bertanggung jawab atas penurunan kualitas akibat paket dibiarkan terlalu lama di luar ruangan/suhu ruang oleh penerima.
              </li>
            </ul>
          </section>

          <!-- Pasal 4 -->
          <section class="bg-white border border-slate-200 rounded-xl p-5 md:p-6 flex flex-col gap-3">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span class="w-6 h-6 rounded-md bg-[#103860] text-white flex items-center justify-center text-xs font-bold">4</span>
              <h3 class="font-bold text-slate-900 text-sm">Garansi Kesegaran 100% & Ketentuan Klaim</h3>
            </div>
            <p>
              Komitmen kami adalah kepuasan Anda saat membuka kemasan:
            </p>
            <ul class="list-disc pl-4 space-y-1.5 text-slate-600">
              <li>
                <strong>Kondisi yang Berhak Klaim:</strong> Ikan berbau busuk tidak wajar, daging lembek hancur saat diterima dingin, atau kemasan rusak/pecah akibat kurir.
              </li>
              <li>
                <strong>Syarat Validasi Wajib:</strong> Mengirimkan rekaman <em>video unboxing utuh tanpa jeda</em> (uninterrupted video) mulai dari segel dus dibuka hingga kondisi ikan terlihat jelas.
              </li>
              <li>
                <strong>Batas Waktu Klaim:</strong> Maksimal <strong>2 jam</strong> terhitung sejak paket ditandai terkirim oleh kurir di sistem.
              </li>
              <li>
                <strong>Solusi Penggantian:</strong> Pengiriman ulang produk baru pada slot berikutnya atau pengembalian dana penuh (100% refund) via transfer rekening/e-wallet Anda.
              </li>
            </ul>
          </section>

          <!-- Pasal 5 -->
          <section class="bg-white border border-slate-200 rounded-xl p-5 md:p-6 flex flex-col gap-3 lg:col-span-2">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span class="w-6 h-6 rounded-md bg-[#103860] text-white flex items-center justify-center text-xs font-bold">5</span>
              <h3 class="font-bold text-slate-900 text-sm">Ketersediaan Tangkapan Nelayan & Pembatalan</h3>
            </div>
            <p>
              Hasil laut segar bergantung pada cuaca, gelombang Selat Bali, dan musim tangkapan nelayan Muncar.
            </p>
            <p>
              Apabila jenis ikan yang Anda pesan tidak berhasil didapatkan nelayan pada subuh hari tersebut akibat cuaca buruk, tim Customer Service kami akan segera mengonfirmasi kepada Anda paling lambat pukul 06:30 WIB dengan pilihan:
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span class="font-semibold text-slate-800 text-xs block mb-1">Opsi A: Penggantian Produk Setara</span>
                <span class="text-[11px] text-slate-500">Mengganti dengan jenis ikan segar lain yang memiliki mutu dan harga setara atas persetujuan Anda.</span>
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span class="font-semibold text-slate-800 text-xs block mb-1">Opsi B: Pengembalian Dana 100%</span>
                <span class="text-[11px] text-slate-500">Pembatalan instan tanpa potongan biaya apa pun, dana dikembalikan langsung ke rekening pembeli.</span>
              </div>
            </div>
          </section>

        </div>

        <!-- Contact Box & Action Button -->
        <div class="p-5 md:p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#103860]/10 text-[#103860] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[22px]">support_agent</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-900">Ada pertanyaan seputar syarat & ketentuan?</span>
              <span class="text-[11px] text-slate-500">Tim kami siap membantu konfirmasi ketersediaan dan ketentuan pengiriman dingin.</span>
            </div>
          </div>

          <div class="flex items-center gap-3 w-full md:w-auto">
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noopener"
              class="w-full md:w-auto h-10 px-5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px] text-emerald-600">chat</span>
              <span>Hubungi CS WhatsApp</span>
            </a>
            <NuxtLink 
              to="/katalog" 
              class="w-full md:w-auto h-10 px-5 bg-[#103860] hover:bg-[#13446E] text-white font-bold text-xs rounded-lg inline-flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">storefront</span>
              <span>Mulai Belanja</span>
            </NuxtLink>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>
