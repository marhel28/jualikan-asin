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
    <main class="w-full flex flex-col pb-20 md:pb-28">

      <!-- 1. HERO SECTION: Full-Bleed Atmospheric Maritime Hero (Adopsi Seafood Watch Hero) -->
      <section class="relative w-full bg-[#002242] text-white overflow-hidden">
        <!-- Background Imagery -->
        <div class="absolute inset-0">
          <NuxtImg
            src="https://cdn.ammarabufadhel.my.id/banners/banner-laut-selatbali-09d4359b.webp"
            alt="Perahu nelayan tradisional Selat Bali Muncar"
            class="w-full h-full object-cover opacity-30"
            loading="eager"
            width="1920"
            height="800"
            format="webp"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-[#002242] via-[#002242]/90 to-transparent" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#002242] via-transparent to-transparent md:hidden" />
        </div>

        <div class="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-28 lg:py-36 flex flex-col justify-center min-h-[480px] lg:min-h-[580px]">
          <div class="max-w-3xl flex flex-col gap-5">
            <div class="inline-flex items-center gap-2 self-start flex-wrap">
              <span class="px-3 py-1 rounded-md bg-white/10 border border-white/20 text-sky-200 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
                PANDUAN MUTU & RANTAI DINGIN • LAUT BERKAH ABADI MUNCAR
              </span>
              <span class="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Palka Es 0°C Terjaga
              </span>
            </div>

            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
              Pilihan hasil laut Anda menentukan masa depan nelayan Selat Bali dan kesehatan keluarga.
            </h1>

            <p class="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              Apa yang layak dibeli, apa yang harus dihindari, dan bagaimana menjaga ikan tetap segar tanpa formalin. Laut Berkah Abadi menghubungkan hasil tangkapan pancing subuh nelayan Muncar langsung ke dapur rumah tangga dan pelaku kuliner dengan standar rantai dingin tanpa putus.
            </p>

            <!-- Dual Action CTAs -->
            <div class="flex flex-wrap items-center gap-3.5 pt-3">
              <NuxtLink
                to="/katalog"
                class="h-12 px-6 bg-white hover:bg-slate-100 text-[#002242] font-bold text-xs sm:text-sm rounded-xl inline-flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[20px]">storefront</span>
                <span>Telusuri Katalog Segar</span>
              </NuxtLink>

              <a
                href="#panduan-mutu"
                class="h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/25 text-white font-semibold text-xs sm:text-sm rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[20px]">verified</span>
                <span>Panduan Keputusan Mutu</span>
              </a>
            </div>
          </div>

          <!-- Floating Metric Pill di Sudut Kanan Bawah Desktop -->
          <div class="hidden lg:flex absolute right-12 bottom-12 bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-5 items-center gap-4 shadow-xl max-w-sm text-slate-900">
            <div class="w-12 h-12 rounded-xl bg-[#103860] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span class="material-symbols-outlined text-[26px]">ac_unit</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold tracking-widest uppercase text-slate-500">Standar Cold Storage Muncar</span>
              <span class="text-base font-extrabold text-[#002242]">Ruang Dingin 0°C – 2°C</span>
              <span class="text-xs text-slate-600">Blast freezer cepat -20°C higienis</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. SCROLLYTELLING PINNED VIDEO ENGINE (Persis Seafood Watch Signature Video Scroller) -->
      <ScrollyStory />

      <!-- 3. FIFTY-FIFTY ALTERNATING INSTITUTIONAL PILLARS (Mengadopsi Seafood Watch /about-us) -->
      <section id="pilar-lba" class="w-full flex flex-col">
        <!-- Pilar 1: Siapa Kami (Who We Are) -> Background Putih -->
        <div class="w-full bg-white border-b border-slate-100 py-16 md:py-24">
          <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div class="flex flex-col gap-4 max-w-xl">
              <span class="text-[11px] font-bold tracking-widest uppercase text-[#103860]">
                PILAR 01 • SIAPA KAMI
              </span>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#002242] leading-tight">
                Pusat pengolahan dan distribusi rantai dingin Pelabuhan Muncar.
              </h2>
              <div class="text-slate-600 text-sm md:text-base leading-relaxed flex flex-col gap-3">
                <p>
                  Laut Berkah Abadi lahir dari pesisir Pelabuhan Muncar Banyuwangi, salah satu sentra pendaratan ikan terpenting di Selat Bali. Kami menyaksikan bagaimana rantai distribusi tradisional sering merugikan nelayan kecil sekaligus membahayakan konsumen akibat penggunaan bahan pengawet sintetis.
                </p>
                <p>
                  Kami hadir sebagai jembatan langsung antara nelayan pancing ulur Muncar dengan konsumen rumah tangga dan pelaku kuliner. Dengan memangkas rantai tengkulak gelap, nelayan mendapatkan kepastian harga timbangan yang adil, sementara konsumen menerima hasil laut berkualitas prima dengan harga transparan.
                </p>
              </div>
              <div class="flex items-center gap-4 pt-2">
                <NuxtLink to="/katalog" class="text-xs sm:text-sm font-bold text-[#103860] hover:text-[#002242] inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer">
                  <span>Lihat hasil tangkapan hari ini</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </NuxtLink>
              </div>
            </div>

            <div class="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-lg">
              <NuxtImg
                src="https://cdn.ammarabufadhel.my.id/banners/banner-dermaga-muncar-2a28a9c6.webp"
                alt="Dermaga pendaratan ikan tradisional Muncar"
                class="w-full h-full object-cover"
                loading="lazy"
                width="800"
                height="600"
                format="webp"
              />
              <div class="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-semibold">
                Dermaga Tradisional Nelayan Muncar
              </div>
            </div>
          </div>
        </div>

        <!-- Pilar 2: Apa yang Kami Lakukan (What We Do) -> Background Mist (#F8FAFC) -->
        <div class="w-full bg-[#F8FAFC] border-b border-slate-200/70 py-16 md:py-24">
          <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <!-- Media di Kiri pada Desktop -->
            <div class="order-2 lg:order-1 relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-lg">
              <NuxtImg
                src="https://cdn.ammarabufadhel.my.id/products/asset-1544552866-03b7d7e3.webp"
                alt="Meja preparasi dan pengolahan ikan higienis Muncar"
                class="w-full h-full object-cover"
                loading="lazy"
                width="800"
                height="600"
                format="webp"
              />
              <div class="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-semibold">
                Inspeksi Organoleptik Meja Stainless Steel
              </div>
            </div>

            <div class="order-1 lg:order-2 flex flex-col gap-4 max-w-xl">
              <span class="text-[11px] font-bold tracking-widest uppercase text-[#103860]">
                PILAR 02 • APA YANG KAMI LAKUKAN
              </span>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#002242] leading-tight">
                Seleksi mutu subuh dan pengawalan suhu dingin tanpa kompromi.
              </h2>
              <div class="text-slate-600 text-sm md:text-base leading-relaxed flex flex-col gap-3">
                <p>
                  Setiap subuh pukul 05:00 WIB saat perahu nelayan merapat, tim kurasi kami langsung melakukan uji organoleptik: kejernihan pupil mata, warna merah segar insang, dan kekenyalan elastisitas serat daging.
                </p>
                <p>
                  Ikan yang lolos seleksi ditimbang secara basah di timbangan digital transparan, disiangi di atas meja baja tahan karat steril, lalu dikemas rapat dalam kantong vakum kedap udara bersama ice gel beku. Seluruh proses diawasi ketat dalam ruangan bersuhu 0°C sampai 2°C untuk menghentikan perkembangan bakteri.
                </p>
              </div>
              <div class="flex items-center gap-4 pt-2">
                <a href="#panduan-mutu" class="text-xs sm:text-sm font-bold text-[#103860] hover:text-[#002242] inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer">
                  <span>Pelajari standar seleksi mutu kami</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Pilar 3: Mengapa Ini Penting (Why It Matters) -> Background Putih -->
        <div class="w-full bg-white border-b border-slate-100 py-16 md:py-24">
          <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div class="flex flex-col gap-4 max-w-xl">
              <span class="text-[11px] font-bold tracking-widest uppercase text-[#103860]">
                PILAR 03 • MENGAPA INI PENTING
              </span>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#002242] leading-tight">
                Menjaga kelestarian laut dan melindungi kesehatan generasi penerus.
              </h2>
              <div class="text-slate-600 text-sm md:text-base leading-relaxed flex flex-col gap-3">
                <p>
                  Ikan laut merupakan sumber protein murni dan asam lemak Omega-3 (EPA dan DHA) yang krusial bagi pertumbuhan otak anak serta kesehatan jantung keluarga. Namun, manfaat alami ini hilang seketika jika ikan terpapar formalin atau mengalami kebusukan histamin akibat putusnya rantai dingin.
                </p>
                <p>
                  Di sisi lain, kelestarian laut Selat Bali dan Samudra Hindia terancam jika metode penangkapan destruktif seperti cantrang atau racun potasium terus dibiarkan. Dengan mendukung metode pancing ulur ramah lingkungan, kita menjaga terumbu karang tetap lestari untuk generasi masa depan.
                </p>
              </div>
              <div class="flex items-center gap-4 pt-2">
                <NuxtLink to="/katalog" class="text-xs sm:text-sm font-bold text-[#103860] hover:text-[#002242] inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer">
                  <span>Pesan ikan sehat tanpa bahan kimia</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </NuxtLink>
              </div>
            </div>

            <div class="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-lg">
              <NuxtImg
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80&auto=format&fit=crop"
                alt="Hidangan hasil laut segar untuk keluarga dan mitra kuliner"
                class="w-full h-full object-cover"
                loading="lazy"
                width="800"
                height="600"
                format="webp"
              />
              <div class="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-semibold">
                Nutrisi Segar Tanpa Pengawet Kimia
              </div>
            </div>
          </div>
        </div>

        <!-- Pilar 4: Strategi Distribusi Kami (Our Strategy) -> Background Mist (#F8FAFC) -->
        <div class="w-full bg-[#F8FAFC] border-b border-slate-200/70 py-16 md:py-24">
          <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <!-- Media di Kiri pada Desktop -->
            <div class="order-2 lg:order-1 relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-lg">
              <NuxtImg
                src="https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp"
                alt="Bukti slip timbangan digital dan kemasan rantai dingin"
                class="w-full h-full object-cover"
                loading="lazy"
                width="800"
                height="600"
                format="webp"
              />
              <div class="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-semibold">
                Slip Timbang Digital dan Label Mutu
              </div>
            </div>

            <div class="order-1 lg:order-2 flex flex-col gap-4 max-w-xl">
              <span class="text-[11px] font-bold tracking-widest uppercase text-[#103860]">
                PILAR 04 • STRATEGI DISTRIBUSI
              </span>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#002242] leading-tight">
                Pengiriman jadwal subuh dan kemitraan pasokan kuliner berstandar.
              </h2>
              <div class="text-slate-600 text-sm md:text-base leading-relaxed flex flex-col gap-3">
                <p>
                  Untuk pesanan rumah tangga di area lokal Banyuwangi, kurir berinsulasi termal kami bergerak mulai pukul 06:00 sampai 08:30 WIB agar paket tiba sebelum waktu masak siang. Untuk pengiriman luar kota di Jawa Timur dan Bali, kami menggunakan kemasan kotak styrofoam tebal berlapis es gel beku.
                </p>
                <p>
                  Bagi pengusaha kuliner, hotel, dan katering, kami menyediakan layanan pasokan berkala dengan potongan spesifik yang terkalibrasi beratnya, memudahkan chef menghitung biaya porsi hidangan secara akurat tanpa risiko fluktuasi berat palsu.
                </p>
              </div>
              <div class="flex items-center gap-4 pt-2">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi,%20saya%20ingin%20konsultasi%20pasokan%20ikan%20restoran/katering"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs sm:text-sm font-bold text-[#103860] hover:text-[#002242] inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
                >
                  <span>Konsultasi pasokan restoran dan hotel</span>
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

    </main>
  </div>
</template>
