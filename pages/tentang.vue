<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ScrollyStory from '~/components/tentang/ScrollyStory.vue'

const router = useRouter()
const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) router.back()
  else router.push('/')
}

// State untuk tab panduan seleksi ikan (Adopsi Seafood Watch Decision Guide)
const activeGuideTab = ref<'best' | 'good' | 'avoid'>('best')

useHead({
  title: 'Tentang Kami: Standar Mutu & Rantai Dingin | Laut Berkah Abadi',
  meta: [
    { name: 'description', content: 'Perjalanan Laut Berkah Abadi dari dermaga Muncar Banyuwangi, rantai dingin 0-2°C konstan, timbangan jujur, bebas formalin, dan komitmen hasil laut berkelanjutan.' },
    { name: 'geo.position', content: '-8.4328;114.3361' },
    { name: 'geo.placename', content: 'Pelabuhan Muncar, Kabupaten Banyuwangi, Jawa Timur, Indonesia' },
    { name: 'geo.region', content: 'ID-JI' },
    { name: 'ICBM', content: '-8.4328, 114.3361' },
    { property: 'og:title', content: 'Tentang Kami: Standar Mutu & Rantai Dingin | Laut Berkah Abadi' },
    { property: 'og:description', content: 'Integritas rantai dingin perikanan Muncar dari kapal pancing ulur hingga dapur keluarga. Timbangan transparan, tanpa formalin, dan bergaransi dingin.' },
    { property: 'og:image', content: 'https://cdn.ammarabufadhel.my.id/banners/banner-laut-selatbali-09d4359b.webp' },
    { property: 'og:url', content: 'https://lautberkahabadi.com/tentang' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  link: [
    { rel: 'canonical', href: 'https://lautberkahabadi.com/tentang' }
  ]
})
</script>

<template>
  <div class="bg-[#F8FAFC] text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center w-full">
    <!-- Desktop Breadcrumb Header -->
    <nav class="hidden md:flex w-full max-w-7xl px-6 lg:px-12 pt-6 pb-3 items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-slate-900 font-semibold">Tentang Kami</span>
    </nav>

    <!-- Mobile Header Bar -->
    <header class="md:hidden sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          type="button"
          aria-label="Kembali"
          class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-[#002242] active:scale-95 cursor-pointer"
          @click="goBack"
        >
          <span class="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <span class="text-base font-bold text-[#002242]">Tentang Kami</span>
      </div>
      <NuxtLink to="/katalog" class="text-xs font-bold text-[#103860] px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
        Katalog
      </NuxtLink>
    </header>

    <!-- MAIN FULL-BLEED WRAPPER -->
    <main class="w-full flex flex-col">

      <!-- 1. FULL-SCREEN SCROLLABLE PINNED VIDEO PARALLAX (Persis Seafood Watch) -->
      <ScrollyStory />

      <!-- 2. PARALLAX CURTAIN TRANSITION SHEET (Mengadopsi Seafood Watch .homepage-section-top) -->
      <div class="relative z-20 bg-[#F8FAFC] -mt-16 sm:-mt-24 rounded-t-[32px] sm:rounded-t-[48px] shadow-2xl border-t border-slate-200/80 overflow-hidden">

        <!-- 3. PILAR UTAMA: SIAPA KAMI (Format Kotak-Kotak Mist Persis Foto Seafood Watch) -->
        <section id="siapa-kami" class="relative w-full bg-[#002242] py-20 sm:py-28 lg:py-32 overflow-hidden border-b border-slate-800">
          <!-- Scenic Background Pelabuhan Muncar dengan overlay maritim -->
          <div class="absolute inset-0 z-0 pointer-events-none">
            <img 
              src="https://cdn.ammarabufadhel.my.id/banners/banner-dermaga-muncar-2a28a9c6.webp" 
              alt="Dermaga Nelayan Tradisional Muncar" 
              class="w-full h-full object-cover opacity-35"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#002242] via-[#002242]/80 to-[#002242]/90" />
          </div>

          <div class="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
            <!-- Header Luar Kartu: Label Biru Terang & Judul Putih Tegas -->
            <header class="max-w-2xl mb-6">
              <span class="text-[11px] font-bold tracking-widest uppercase text-sky-400 drop-shadow-sm">
                PILAR 01 DARI 04 • SIAPA KAMI
              </span>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight mt-1.5 drop-shadow-md">
                Pusat pengolahan dan distribusi rantai dingin Pelabuhan Muncar.
              </h2>
            </header>

            <!-- KOTAK KARTU MIST (Persis Foto Seafood Watch) -->
            <div class="w-full lg:max-w-2xl bg-[#F5F5F5] text-slate-900 rounded-[4px] p-8 sm:p-10 md:p-12 shadow-2xl border border-white/80">
              <!-- Judul di Dalam Kotak -->
              <h3 class="text-xl sm:text-2xl md:text-[24px] font-bold text-slate-900 leading-snug tracking-tight mb-4">
                Menghubungkan nelayan pancing ulur Muncar langsung ke dapur Anda.
              </h3>

              <!-- Paragraf Deskripsi Bersih Tanpa Klise -->
              <p class="text-sm sm:text-base text-slate-700 leading-relaxed font-normal mb-8">
                Laut Berkah Abadi lahir dari pesisir Pelabuhan Muncar Banyuwangi, salah satu sentra pendaratan ikan terpenting di Selat Bali. Kami memangkas rantai tengkulak tradisional agar nelayan pancing ulur memperoleh kepastian harga timbangan yang adil, sementara keluarga dan mitra kuliner mendapatkan hasil laut segar berkualitas prima bebas formalin dengan transparansi penuh.
              </p>

              <!-- DUA TOMBOL AKSI SEAFOOD WATCH (1 Outline + 1 Filled Solid) -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <NuxtLink
                  to="/katalog"
                  class="h-11 px-5 rounded-[2px] bg-white hover:bg-slate-50 border border-[#00629B] text-[#00629B] font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[18px]">sailing</span>
                  <span>Standar pendaratan Selat Bali</span>
                </NuxtLink>

                <NuxtLink
                  to="/katalog"
                  class="h-11 px-5 rounded-[2px] bg-[#00629B] hover:bg-[#004d7a] text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                  <span>Telusuri katalog ikan segar</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. HARMONISASI PILAR 02, 03, & 04 (Grid Kotak-Kotak Seragam Persis Sistem Kartu Seafood Watch) -->
        <section class="w-full bg-white py-16 md:py-24 border-b border-slate-200/80">
          <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col gap-10">
            <div class="flex flex-col gap-2 max-w-2xl">
              <span class="text-[11px] font-bold tracking-[0.14em] uppercase text-[#103860]">
                KOMITMEN MUTU DARI DERMAGA KE DAPUR
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[#002242]">
                Tiga pilar integritas operasional Laut Berkah Abadi.
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <!-- Kartu Pilar 02: Apa yang Kami Lakukan -->
              <div class="bg-[#F5F5F5] rounded-[4px] p-6 sm:p-8 flex flex-col justify-between border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex flex-col gap-3">
                  <span class="text-[10px] font-bold tracking-widest uppercase text-[#00629B]">
                    PILAR 02 • KURASI SUBUH
                  </span>
                  <h3 class="text-lg font-bold text-slate-900 leading-snug">
                    Seleksi organoleptik & ruang dingin 0–2°C.
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Setiap subuh pukul 05:00 WIB, tim kami memeriksa kejernihan mata, insang merah segar, dan kekenyalan daging. Ikan disiangi di atas meja baja tahan karat dan langsung masuk palka bersuhu terkendali.
                  </p>
                </div>
                <div class="pt-5 mt-5 border-t border-slate-200/80">
                  <a
                    href="#panduan-mutu"
                    class="text-xs font-bold text-[#00629B] hover:text-[#004d7a] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Standar seleksi mutu</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </div>

              <!-- Kartu Pilar 03: Mengapa Ini Penting -->
              <div class="bg-[#F5F5F5] rounded-[4px] p-6 sm:p-8 flex flex-col justify-between border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex flex-col gap-3">
                  <span class="text-[10px] font-bold tracking-widest uppercase text-[#00629B]">
                    PILAR 03 • INTEGRITAS GIZI
                  </span>
                  <h3 class="text-lg font-bold text-slate-900 leading-snug">
                    Protein murni & Omega-3 tanpa bahan kimia.
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Ikan laut kaya EPA dan DHA untuk pertumbuhan otak anak dan kesehatan jantung. Kami menjamin 100% tanpa formalin dan tanpa zat pemutih sintetis agar nutrisi alami ikan tetap utuh terjaga.
                  </p>
                </div>
                <div class="pt-5 mt-5 border-t border-slate-200/80">
                  <NuxtLink
                    to="/katalog"
                    class="text-xs font-bold text-[#00629B] hover:text-[#004d7a] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Pilihan ikan sehat keluarga</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </NuxtLink>
                </div>
              </div>

              <!-- Kartu Pilar 04: Strategi Distribusi -->
              <div class="bg-[#F5F5F5] rounded-[4px] p-6 sm:p-8 flex flex-col justify-between border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex flex-col gap-3">
                  <span class="text-[10px] font-bold tracking-widest uppercase text-[#00629B]">
                    PILAR 04 • DISTRIBUSI PRESISI
                  </span>
                  <h3 class="text-lg font-bold text-slate-900 leading-snug">
                    Pengiriman jadwal subuh & pasokan kuliner.
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Kurir termal meluncur pukul 06:00 sampai 08:30 WIB untuk area lokal Banyuwangi. Kemasan styrofoam tebal berlapis es gel untuk luar kota Jawa Timur dan Bali menjamin kondisi beku hingga di tangan Anda.
                  </p>
                </div>
                <div class="pt-5 mt-5 border-t border-slate-200/80">
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi,%20saya%20ingin%20konsultasi%20pasokan%20ikan%20restoran/katering"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xs font-bold text-[#00629B] hover:text-[#004d7a] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Konsultasi pasokan kuliner</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      <!-- 4. PANDUAN KLASIFIKASI MUTU IKAN (Mengadopsi Seafood Watch Decision Guide) -->
      <section id="panduan-mutu" class="w-full bg-white py-16 md:py-24 border-b border-slate-200/80">
        <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col gap-8">
          <div class="flex flex-col gap-2 max-w-3xl">
            <span class="text-[11px] font-bold tracking-[0.14em] uppercase text-[#103860]">
              STANDAR KEPUTUSAN KONSUMEN
            </span>
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#002242]">
              Panduan Memilih Ikan Segar: Kenali Pilihan Terbaik.
            </h2>
            <p class="text-xs sm:text-sm md:text-base text-slate-500 leading-relaxed">
              Diadaptasi dari standar Seafood Watch internasional, kami membagi penanganan hasil laut ke dalam tiga kategori transparansi untuk keamanan konsumsi Anda.
            </p>
          </div>

          <!-- Selector Tabs -->
          <div class="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold max-w-xl">
            <button
              type="button"
              @click="activeGuideTab = 'best'"
              class="py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="activeGuideTab === 'best' ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200' : 'text-slate-600 hover:text-slate-900'"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span class="hidden sm:inline">Pilihan Utama</span>
              <span class="sm:hidden">Utama</span>
            </button>

            <button
              type="button"
              @click="activeGuideTab = 'good'"
              class="py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="activeGuideTab === 'good' ? 'bg-white text-amber-800 shadow-sm border border-amber-200' : 'text-slate-600 hover:text-slate-900'"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span class="hidden sm:inline">Pilihan Harian</span>
              <span class="sm:hidden">Harian</span>
            </button>

            <button
              type="button"
              @click="activeGuideTab = 'avoid'"
              class="py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              :class="activeGuideTab === 'avoid' ? 'bg-white text-rose-800 shadow-sm border border-rose-200' : 'text-slate-600 hover:text-slate-900'"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span class="hidden sm:inline">Wajib Dihindari</span>
              <span class="sm:hidden">Hindari</span>
            </button>
          </div>

          <!-- Tab Content Panel -->
          <div
            class="border rounded-3xl p-6 sm:p-8 md:p-10 transition-all max-w-5xl"
            :class="activeGuideTab === 'best' ? 'bg-emerald-50/40 border-emerald-200' : activeGuideTab === 'good' ? 'bg-amber-50/40 border-amber-200' : 'bg-rose-50/40 border-rose-200'"
          >
            <!-- TAB 1: BEST CHOICE (Hijau) -->
            <div v-if="activeGuideTab === 'best'" class="flex flex-col gap-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold inline-flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">verified</span>
                  Kategori Hijau: Standar Mutu Utama & Pancing Ramah Karang
                </span>
                <span class="text-xs sm:text-sm font-bold text-emerald-800">100% Tersedia di LBA Muncar</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2.5 bg-white rounded-2xl p-5 border border-emerald-100 shadow-2xs">
                  <span class="text-xs sm:text-sm font-bold text-slate-900">Metode Penangkapan Selektif</span>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Pancing ulur karang tradisional dan bubu nelayan pesisir. Tidak merusak karang, minim luka fisik pada ikan, dan ikan ditarik satu per satu dalam kondisi prima.
                  </p>
                </div>

                <div class="flex flex-col gap-2.5 bg-white rounded-2xl p-5 border border-emerald-100 shadow-2xs">
                  <span class="text-xs sm:text-sm font-bold text-slate-900">Karakteristik Fisik Organoleptik</span>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Mata cembung bening berkilau, insang merah segar beraroma laut bersih, tekstur daging kenyal padat membal saat ditekan, dan sisik mengilap melekat kuat.
                  </p>
                </div>
              </div>

              <div class="text-xs sm:text-sm text-slate-700 bg-emerald-100/60 p-4 rounded-xl">
                <strong>Contoh Produk Pilihan:</strong> Kerapu Cantang Muncar, Kakap Merah Karang, Tenggiri Papan Segar, Steak Tuna Yellowfin Selat Bali.
              </div>
            </div>

            <!-- TAB 2: GOOD ALTERNATIVE (Kuning) -->
            <div v-else-if="activeGuideTab === 'good'" class="flex flex-col gap-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs sm:text-sm font-bold inline-flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">recommend</span>
                  Kategori Kuning: Pilihan Sehat Bernutrisi Tinggi & Musiman Subuh
                </span>
                <span class="text-xs sm:text-sm font-bold text-amber-900">Tangkapan Segar Harian</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2.5 bg-white rounded-2xl p-5 border border-amber-100 shadow-2xs">
                  <span class="text-xs sm:text-sm font-bold text-slate-900">Metode Penangkapan Tradisional</span>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Jaring payang tradisional dan jaring insang hanyut nelayan Selat Bali. Diangkat subuh dan langsung dipacking di atas es curah steril tanpa fermentasi.
                  </p>
                </div>

                <div class="flex flex-col gap-2.5 bg-white rounded-2xl p-5 border border-amber-100 shadow-2xs">
                  <span class="text-xs sm:text-sm font-bold text-slate-900">Karakteristik Fisik & Nutrisi</span>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Kaya minyak ikan Omega-3 (EPA dan DHA) alami, daging merah gurih padat, sangat lezat diolah kuah sarden segar, balado pedas, atau goreng renyah.
                  </p>
                </div>
              </div>

              <div class="text-xs sm:text-sm text-slate-700 bg-amber-100/60 p-4 rounded-xl">
                <strong>Contoh Produk Pilihan:</strong> Ikan Lemuru Segar Muncar, Ikan Tongkol Lisong Selat Bali, Bandeng Cabut Duri Higienis.
              </div>
            </div>

            <!-- TAB 3: AVOID (Merah) -->
            <div v-else class="flex flex-col gap-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 text-xs sm:text-sm font-bold inline-flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">cancel</span>
                  Kategori Merah: Ditolak 100% Dari Standar Laut Berkah Abadi
                </span>
                <span class="text-xs sm:text-sm font-bold text-rose-700">Bahaya & Tidak Higienis</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2.5 bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs">
                  <span class="text-xs sm:text-sm font-bold text-rose-900">Praktik Destruktif yang Ditolak</span>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Penggunaan formalin, pengawet kimia berbahaya, perendaman air tawar berlebih (suntik air pembesar bobot), atau penangkapan pukat harimau (trawl) perusak ekosistem dasar.
                  </p>
                </div>

                <div class="flex flex-col gap-2.5 bg-white rounded-2xl p-5 border border-rose-100 shadow-2xs">
                  <span class="text-xs sm:text-sm font-bold text-rose-900">Tanda Bahaya Fisik</span>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Mata cekung keruh berdarah, insang pucat kelabu berlendir asam, daging lembek berongga, dan bau amonia menyengat akibat putus rantai dingin lebih dari 4 jam.
                  </p>
                </div>
              </div>

              <div class="text-xs sm:text-sm text-rose-900 font-semibold bg-rose-100/70 p-4 rounded-xl">
                Komitmen LBA: Fasilitas kami melakukan uji mutu organoleptik harian. Setiap ikan yang tidak lolos standar suhu dan uji mutu langsung ditolak di bibir dermaga.
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- 5. EDITORIAL PESISIR & CERITA DERMAGA MUNCAR (Latar Deep Navy #002242) -->
      <section class="w-full bg-[#002242] text-white py-16 md:py-24">
        <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col gap-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div class="flex flex-col gap-2">
              <span class="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-400">
                DOKUMENTASI & EDUKASI PESISIR
              </span>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
                Kisah di Balik Dinginnya Tangkapan Muncar.
              </h2>
            </div>
            <p class="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              Artikel dan catatan lapangan yang kami susun untuk transparansi belanja dan edukasi nutrisi keluarga Anda.
            </p>
          </div>

          <!-- 3-Column Story Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <!-- Card 1 -->
            <article class="bg-white text-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:-translate-y-1.5 transition-all duration-300">
              <div class="aspect-[16/10] overflow-hidden bg-slate-100">
                <NuxtImg
                  src="https://cdn.ammarabufadhel.my.id/banners/banner-dermaga-muncar-2a28a9c6.webp"
                  alt="Suasana bongkar pagi di dermaga Muncar"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width="600"
                  height="375"
                  format="webp"
                />
              </div>
              <div class="p-6 flex flex-col gap-3 flex-1 justify-between">
                <div class="flex flex-col gap-2">
                  <span class="text-[10px] font-extrabold tracking-widest uppercase text-[#103860]">
                    CERITA DERMAGA
                  </span>
                  <h3 class="text-base font-bold text-slate-900 leading-snug">
                    Menelisik Subuh di Dermaga Muncar: Dari Perahu Tradisional ke Palka Es
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Bagaimana para nelayan pancing ulur Selat Bali mempertahankan cara melaut ramah lingkungan tanpa merusak ekosistem terumbu karang alami.
                  </p>
                </div>
                <div class="pt-3 border-t border-slate-100">
                  <NuxtLink to="/katalog" class="text-xs font-bold text-[#103860] hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <span>Lihat ikan segar subuh</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </NuxtLink>
                </div>
              </div>
            </article>

            <!-- Card 2 -->
            <article class="bg-white text-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:-translate-y-1.5 transition-all duration-300">
              <div class="aspect-[16/10] overflow-hidden bg-slate-100">
                <NuxtImg
                  src="https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp"
                  alt="Foto slip timbangan digital transparan"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width="600"
                  height="375"
                  format="webp"
                />
              </div>
              <div class="p-6 flex flex-col gap-3 flex-1 justify-between">
                <div class="flex flex-col gap-2">
                  <span class="text-[10px] font-extrabold tracking-widest uppercase text-[#103860]">
                    EDUKASI TIMBANGAN
                  </span>
                  <h3 class="text-base font-bold text-slate-900 leading-snug">
                    Memahami Rumus Berat Kotor vs Rendemen Netto Ikan Laut
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Mengapa susut potong (85% utuh siang dan 52% fillet murni) harus dijelaskan di awal agar pembeli tidak tertipu timbangan palsu.
                  </p>
                </div>
                <div class="pt-3 border-t border-slate-100">
                  <NuxtLink to="/katalog" class="text-xs font-bold text-[#103860] hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <span>Cek kalkulasi timbang</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </NuxtLink>
                </div>
              </div>
            </article>

            <!-- Card 3 -->
            <article class="bg-white text-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:-translate-y-1.5 transition-all duration-300">
              <div class="aspect-[16/10] overflow-hidden bg-slate-100">
                <NuxtImg
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80&auto=format&fit=crop"
                  alt="Kemitraan pasokan ikan restoran dan kuliner"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width="600"
                  height="375"
                  format="webp"
                />
              </div>
              <div class="p-6 flex flex-col gap-3 flex-1 justify-between">
                <div class="flex flex-col gap-2">
                  <span class="text-[10px] font-extrabold tracking-widest uppercase text-[#103860]">
                    KEMITRAAN KULINER
                  </span>
                  <h3 class="text-base font-bold text-slate-900 leading-snug">
                    Pasokan Ikan Rantai Dingin Untuk Restoran, Hotel & Katering
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Program kemitraan pasokan berkala dengan spesifikasi gramasi dan potongan terstandarisasi untuk chef dan pengusaha kuliner di Jawa Timur dan Bali.
                  </p>
                </div>
                <div class="pt-3 border-t border-slate-100">
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi,%20saya%20ingin%20konsultasi%20pasokan%20ikan%20restoran/katering"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-xs font-bold text-[#103860] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Konsultasi pasokan Horeca</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- 6. KEMITRAAN & LOKASI HUB PELABUHAN MUNCAR (Action Bar) -->
      <section class="w-full bg-[#F8FAFC] py-16 md:py-20 border-t border-slate-200/80">
        <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div class="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
            <div class="flex flex-col gap-2.5 max-w-2xl">
              <div class="inline-flex items-center gap-2 text-emerald-700 text-xs sm:text-sm font-bold">
                <span class="material-symbols-outlined text-[20px]">pin_drop</span>
                <span>Fasilitas Cold Storage Pelabuhan Muncar</span>
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#002242]">
                Kunjungi atau hubungi tim operasional kami di Muncar.
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pelabuhan Perikanan Pantai Muncar, Kabupaten Banyuwangi, Jawa Timur. Melayani pemesanan rumah tangga harian, suplai restoran berkala, dan pengiriman armada dingin terjadwal.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3.5 shrink-0">
              <NuxtLink
                to="/katalog"
                class="h-12 px-7 bg-[#103860] hover:bg-[#002242] text-white font-bold text-xs sm:text-sm rounded-xl inline-flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
                <span>Pesan Ikan Segar</span>
              </NuxtLink>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi,%20saya%20ingin%20tanya%20stok%20ikan%20dan%20pengiriman%20rantai%20dingin"
                target="_blank"
                rel="noopener noreferrer"
                class="h-12 px-7 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#002242] font-semibold text-xs sm:text-sm rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[20px] text-emerald-700">chat</span>
                <span>Hotline WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      </div>
    </main>
  </div>
</template>
