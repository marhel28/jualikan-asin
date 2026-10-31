<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) router.back()
  else router.push('/')
}

// State untuk tab panduan seleksi ikan (Adopsi Seafood Decision Guide)
const activeGuideTab = ref<'best' | 'good' | 'avoid'>('best')

useHead({
  title: 'Tentang Kami: Panduan Mutu & Perjalanan Rantai Dingin | Laut Berkah Abadi',
  meta: [
    { name: 'description', content: 'Perjalanan Laut Berkah Abadi dari dermaga Muncar Banyuwangi, rantai dingin 0-2°C konstan, timbangan jujur, bebas formalin, dan komitmen hasil laut berkelanjutan.' },
    { name: 'geo.position', content: '-8.4328;114.3361' },
    { name: 'geo.placename', content: 'Pelabuhan Muncar, Kabupaten Banyuwangi, Jawa Timur, Indonesia' },
    { name: 'geo.region', content: 'ID-JI' },
    { name: 'ICBM', content: '-8.4328, 114.3361' },
    { property: 'og:title', content: 'Tentang Kami: Panduan Mutu & Perjalanan Rantai Dingin | Laut Berkah Abadi' },
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
  <div class="bg-[#F8FAFC] text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center">
    <!-- Breadcrumb desktop -->
    <nav class="hidden md:flex w-full max-w-6xl px-6 pt-5 pb-2 items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-slate-900 font-medium">Tentang Kami</span>
    </nav>

    <!-- Mobile header bar -->
    <header class="md:hidden sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button type="button" aria-label="Kembali" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-[#002242] active:scale-95 cursor-pointer" @click="goBack">
          <span class="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <span class="text-base font-bold text-[#002242]">Tentang Kami</span>
      </div>
      <NuxtLink to="/katalog" class="text-xs font-bold text-[#103860] px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
        Katalog
      </NuxtLink>
    </header>

    <div class="w-full max-w-md md:max-w-6xl bg-white md:bg-transparent min-h-screen md:min-h-0 flex flex-col md:gap-8 border-x border-slate-200/80 md:border-0 shadow-none pb-24 md:pb-16">
      <main class="flex flex-col gap-10 md:gap-14 p-4 md:p-0">

        <!-- 1. HERO SECTION: Full-Bleed Atmospheric Maritime Hero (Adopsi Seafood Watch Hero) -->
        <section class="relative rounded-2xl overflow-hidden bg-[#002242] text-white shadow-sm border border-slate-200/60">
          <div class="relative min-h-[420px] md:min-h-[480px] flex items-center">
            <!-- Background Image -->
            <NuxtImg
              src="https://cdn.ammarabufadhel.my.id/banners/banner-laut-selatbali-09d4359b.webp"
              alt="Perahu nelayan tradisional Selat Bali Muncar"
              class="absolute inset-0 w-full h-full object-cover opacity-35"
              loading="eager"
              width="1440"
              height="720"
              format="webp"
            />
            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-r from-[#002242] via-[#002242]/85 to-transparent" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#002242] via-transparent to-transparent md:hidden" />

            <!-- Hero Content -->
            <div class="relative z-10 p-6 md:p-12 lg:p-14 max-w-2xl flex flex-col gap-4">
              <div class="inline-flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-sky-200 text-[10px] md:text-[11px] font-bold tracking-widest uppercase">
                  PANDUAN MUTU • LAUT BERKAH ABADI MUNCAR
                </span>
                <span class="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Palka Es Terjaga
                </span>
              </div>

              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
                Pilihan hasil laut Anda menentukan masa depan nelayan dan kesehatan keluarga.
              </h1>

              <p class="text-xs md:text-sm text-slate-200 leading-relaxed max-w-xl">
                Apa yang layak dibeli, apa yang harus dihindari, dan bagaimana menjaga ikan tetap segar tanpa formalin. Laut Berkah Abadi hadir menghubungkan hasil pendaratan subuh nelayan pancing Muncar langsung ke dapur rumah tangga dan pelaku kuliner dengan standar dingin tanpa putus.
              </p>

              <!-- Dual Action CTA -->
              <div class="flex flex-wrap items-center gap-3 pt-2">
                <NuxtLink
                  to="/katalog"
                  class="h-11 px-5 bg-white text-[#002242] hover:bg-slate-100 font-bold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[18px]">storefront</span>
                  <span>Telusuri Katalog Segar</span>
                </NuxtLink>

                <a
                  href="#panduan-mutu"
                  class="h-11 px-5 bg-white/10 hover:bg-white/15 border border-white/25 text-white font-semibold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[18px]">verified</span>
                  <span>Panduan Keputusan Mutu</span>
                </a>
              </div>
            </div>

            <!-- Floating Cold Hub Metric Pill (Desktop) -->
            <div class="hidden lg:flex absolute right-10 bottom-10 bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 p-4 items-center gap-3.5 shadow-lg max-w-xs text-slate-900">
              <div class="w-12 h-12 rounded-xl bg-[#103860] text-white flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[24px]">ac_unit</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[10px] font-bold tracking-widest uppercase text-slate-500">Standar Cold Storage Muncar</span>
                <span class="text-base font-extrabold text-[#002242]">Ruang Chilled 0°C – 2°C</span>
                <span class="text-[11px] text-slate-600">Blast freezer cepat −20°C higienis</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. SCROLLYTELLING SECTION: Floating Alternating Cards (Adopsi Khas Seafood Watch) -->
        <section class="flex flex-col gap-6">
          <div class="flex flex-col gap-1 px-1">
            <span class="text-[11px] font-bold tracking-[0.14em] uppercase text-[#103860]">Rantai Dingin Bergerak</span>
            <h2 class="text-xl md:text-2xl font-extrabold text-slate-900">
              Bagaimana hasil laut segar sampai di tangan Anda.
            </h2>
            <p class="text-xs md:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Tiga tahap presisi yang menjaga mutu ikan dari geladak perahu tradisional hingga depan pintu rumah Anda.
            </p>
          </div>

          <!-- Container 3 Frame Scrollytelling -->
          <div class="flex flex-col gap-8 md:gap-12">

            <!-- FRAME 1: Floating Card Kanan -->
            <div class="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 min-h-[380px] md:min-h-[420px] flex items-center justify-end">
              <NuxtImg
                src="https://cdn.ammarabufadhel.my.id/banners/banner-dermaga-muncar-2a28a9c6.webp"
                alt="Pendaratan kapal pancing ulur di Dermaga Muncar"
                class="absolute inset-0 w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width="1200"
                height="600"
                format="webp"
              />
              <div class="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60 md:to-transparent" />

              <!-- Floating Card (Kanan) -->
              <div class="relative z-10 m-4 md:m-8 max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-6 md:p-8 flex flex-col gap-3.5 shadow-xl">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-md bg-[#103860]/10 text-[#103860] text-[10px] font-bold tracking-widest uppercase">
                    TAHAP 01 • DERMAGA MUNCAR
                  </span>
                  <span class="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">schedule</span> 05:30 WIB
                  </span>
                </div>

                <h3 class="text-base md:text-lg font-bold text-[#002242] leading-snug">
                  Pendaratan langsung dari perahu pancing ulur tradisional.
                </h3>

                <p class="text-xs text-slate-600 leading-relaxed">
                  Ikan dijemput langsung dari nelayan saat perahu bersandar di dermaga Muncar. Langsung masuk palka es curah higienis tanpa jeda kenaikan suhu, mencegah kerusakan jaringan serat dan mencegah timbulnya aroma amis.
                </p>

                <div class="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-slate-700">
                  <span class="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Palka Es 0°C – 2°C</span>
                  <span class="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Bebas Bahan Kimia</span>
                </div>

                <div class="pt-2">
                  <NuxtLink to="/katalog" class="text-xs font-bold text-[#103860] hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <span>Lihat ikan tangkapan hari ini</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- FRAME 2: Floating Card Kiri -->
            <div class="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 min-h-[380px] md:min-h-[420px] flex items-center justify-start">
              <NuxtImg
                src="https://images.unsplash.com/photo-1534768651016-33c15cd2cc10?w=1200&q=80&auto=format&fit=crop"
                alt="Meja preparasi stainless steel higienis di Cold Hub LBA"
                class="absolute inset-0 w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width="1200"
                height="600"
                format="webp"
              />
              <div class="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-black/60 md:to-transparent" />

              <!-- Floating Card (Kiri) -->
              <div class="relative z-10 m-4 md:m-8 max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-6 md:p-8 flex flex-col gap-3.5 shadow-xl">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-md bg-emerald-600/10 text-emerald-800 text-[10px] font-bold tracking-widest uppercase">
                    TAHAP 02 • COLD HUB PREPARASI
                  </span>
                  <span class="text-xs font-bold text-[#103860] flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">balance</span> Timbang Jujur
                  </span>
                </div>

                <h3 class="text-base md:text-lg font-bold text-[#002242] leading-snug">
                  Preparasi bersih & pilihan potong bebas biaya tambahan.
                </h3>

                <p class="text-xs text-slate-600 leading-relaxed">
                  Dikerok sisik, disiangi insang dan isi perut, atau dibuat fillet tanpa duri di atas meja stainless steel 304 food-grade. Setiap pesanan ditimbang di depan kamera digital dengan slip foto bobot kotor vs netto yang transparan.
                </p>

                <div class="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-slate-700">
                  <span class="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Foto Timbangan Digital</span>
                  <span class="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Rendemen Netto Jelas</span>
                </div>

                <div class="pt-2">
                  <a href="https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi,%20saya%20ingin%20tanya%20layanan%20preparasi%20potongan" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <span>Tanya opsi potongan via WhatsApp</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- FRAME 3: Floating Card Kanan -->
            <div class="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 min-h-[380px] md:min-h-[420px] flex items-center justify-end">
              <NuxtImg
                src="https://cdn.ammarabufadhel.my.id/banners/banner-pasar-ikan-118875e7.webp"
                alt="Pengemasan vakum rapat dan armada pengiriman subuh"
                class="absolute inset-0 w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width="1200"
                height="600"
                format="webp"
              />
              <div class="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/60 md:to-transparent" />

              <!-- Floating Card (Kanan) -->
              <div class="relative z-10 m-4 md:m-8 max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl border border-white/80 p-6 md:p-8 flex flex-col gap-3.5 shadow-xl">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-md bg-sky-600/10 text-sky-800 text-[10px] font-bold tracking-widest uppercase">
                    TAHAP 03 • ARMADA SUBUH
                  </span>
                  <span class="text-xs font-bold text-sky-800 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">local_shipping</span> Siap Masak
                  </span>
                </div>

                <h3 class="text-base md:text-lg font-bold text-[#002242] leading-snug">
                  Pengiriman rantai dingin subuh langsung ke depan pintu Anda.
                </h3>

                <p class="text-xs text-slate-600 leading-relaxed">
                  Dikemas vakum tebal dengan ice gel beku dan thermal pouch atau box insulasi. Armada subuh meluncur jam 06:00 – 08:30 WIB melayani area Banyuwangi, Jember, Malang, Surabaya, dan Bali, siap dimasak untuk sarapan atau makan siang.
                </p>

                <div class="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-slate-700">
                  <span class="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Vacuum Pack Tebal</span>
                  <span class="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Ice Gel Garansi Dingin</span>
                </div>

                <div class="pt-2">
                  <NuxtLink to="/katalog" class="text-xs font-bold text-[#103860] hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <span>Pesan untuk jadwal subuh besok</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </NuxtLink>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- 3. PANDUAN KLASIFIKASI MUTU IKAN (Adopsi Seafood Watch Decision Guide) -->
        <section id="panduan-mutu" class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 flex flex-col gap-6 shadow-2xs">
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-bold tracking-[0.14em] uppercase text-[#103860]">Standar Keputusan Konsumen</span>
            <h2 class="text-xl md:text-2xl font-extrabold text-slate-900">
              Panduan Memilih Ikan Segar: Kenali Pilihan Terbaik.
            </h2>
            <p class="text-xs md:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Diadaptasi dari standar Seafood Watch internasional, kami membagi penanganan hasil laut ke dalam tiga kategori transparansi untuk keamanan konsumsi Anda.
            </p>
          </div>

          <!-- Selector Tabs -->
          <div class="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              @click="activeGuideTab = 'best'"
              class="py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              :class="activeGuideTab === 'best' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span class="hidden sm:inline">Pilihan Utama</span>
              <span class="sm:hidden">Terbaik</span>
            </button>

            <button
              type="button"
              @click="activeGuideTab = 'good'"
              class="py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              :class="activeGuideTab === 'good' ? 'bg-white text-amber-800 shadow-xs border border-amber-200' : 'text-slate-600 hover:text-slate-900'"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span class="hidden sm:inline">Pilihan Harian</span>
              <span class="sm:hidden">Harian</span>
            </button>

            <button
              type="button"
              @click="activeGuideTab = 'avoid'"
              class="py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              :class="activeGuideTab === 'avoid' ? 'bg-white text-rose-800 shadow-xs border border-rose-200' : 'text-slate-600 hover:text-slate-900'"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span class="hidden sm:inline">Wajib Dihindari</span>
              <span class="sm:hidden">Hindari</span>
            </button>
          </div>

          <!-- Tab Content Panel -->
          <div class="border rounded-2xl p-5 md:p-6 transition-all"
            :class="activeGuideTab === 'best' ? 'bg-emerald-50/40 border-emerald-200' : activeGuideTab === 'good' ? 'bg-amber-50/40 border-amber-200' : 'bg-rose-50/40 border-rose-200'">

            <!-- TAB 1: BEST CHOICE -->
            <div v-if="activeGuideTab === 'best'" class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">verified</span>
                  Kategori Hijau: Standar Ekspor & Mutu Utama
                </span>
                <span class="text-xs font-semibold text-emerald-800">100% Tersedia di LBA</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2 bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs">
                  <span class="text-xs font-bold text-slate-900">Metode Penangkapan</span>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Pancing ulur karang tradisional dan bubu nelayan pesisir. Tidak merusak karang, minim luka fisik pada ikan, dan ikan ditarik satu per satu dalam kondisi prima.
                  </p>
                </div>

                <div class="flex flex-col gap-2 bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs">
                  <span class="text-xs font-bold text-slate-900">Karakteristik Fisik</span>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Mata cembung bening berkilau, insang merah segar beraroma laut bersih, tekstur daging kenyal padat membal saat ditekan, dan sisik mengilap melekat kuat.
                  </p>
                </div>
              </div>

              <div class="text-xs text-slate-600">
                <strong>Contoh Produk Pilihan:</strong> Kerapu Cantang Muncar, Kakap Merah Karang, Tenggiri Papan Segar, Steak Tuna Yellowfin.
              </div>
            </div>

            <!-- TAB 2: GOOD ALTERNATIVE -->
            <div v-else-if="activeGuideTab === 'good'" class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">recommend</span>
                  Kategori Kuning: Pilihan Sehat Bernutrisi Tinggi
                </span>
                <span class="text-xs font-semibold text-amber-900">Tangkapan Musiman Subuh</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2 bg-white rounded-xl p-4 border border-amber-100 shadow-2xs">
                  <span class="text-xs font-bold text-slate-900">Metode Penangkapan</span>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Jaring payang tradisional dan jaring insang hanyut nelayan Selat Bali. Diangkat subuh dan langsung dipacking di atas es curah steril tanpa fermentasi.
                  </p>
                </div>

                <div class="flex flex-col gap-2 bg-white rounded-xl p-4 border border-amber-100 shadow-2xs">
                  <span class="text-xs font-bold text-slate-900">Karakteristik Fisik & Nutrisi</span>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Kaya minyak ikan Omega-3 (EPA & DHA) alami, daging merah gurih padat, sangat lezat diolah kuah sarden segar, balado pedas, atau goreng renyah.
                  </p>
                </div>
              </div>

              <div class="text-xs text-slate-600">
                <strong>Contoh Produk Pilihan:</strong> Ikan Lemuru Segar Muncar, Ikan Tongkol Lisong Selat Bali.
              </div>
            </div>

            <!-- TAB 3: AVOID -->
            <div v-else class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold inline-flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">cancel</span>
                  Kategori Merah: Ditolak 100% Dari Standar Kami
                </span>
                <span class="text-xs font-bold text-rose-700">Bahaya & Tidak Segar</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2 bg-white rounded-xl p-4 border border-rose-100 shadow-2xs">
                  <span class="text-xs font-bold text-rose-900">Praktik yang Kami Tolak</span>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Penggunaan formalin, pengawet kimia berbahaya, perendaman air tawar berlebih (suntik air pembesar bobot), atau penangkapan pukat harimau (trawl) perusak ekosistem.
                  </p>
                </div>

                <div class="flex flex-col gap-2 bg-white rounded-xl p-4 border border-rose-100 shadow-2xs">
                  <span class="text-xs font-bold text-rose-900">Tanda Bahaya Fisik</span>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Mata cekung keruh berdarah, insang pucat kelabu berlendir asam, daging lembek berongga, dan bau amonia menyengat akibat putus rantai dingin lebih dari 4 jam.
                  </p>
                </div>
              </div>

              <div class="text-xs text-rose-800 font-medium">
                Komitmen LBA: Fasilitas kami melakukan uji mutu organoleptik harian. Setiap ikan yang tidak lolos standar suhu dan uji mutu langsung ditolak di bibir dermaga.
              </div>
            </div>

          </div>
        </section>

        <!-- 4. KEEP READING: DEEP OCEAN EDITORIAL STORIES (Latar Deep Navy #002242) -->
        <section class="rounded-2xl bg-[#002242] text-white p-6 md:p-10 flex flex-col gap-8 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-white/10 pb-5">
            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-400">Dokumentasi & Edukasi Pesisir</span>
              <h2 class="text-xl md:text-2xl font-extrabold text-white">
                Kisah di Balik Dinginnya Tangkapan Muncar.
              </h2>
            </div>
            <p class="text-xs text-slate-300 max-w-sm">
              Artikel dan catatan lapangan yang kami susun untuk transparansi belanja Anda.
            </p>
          </div>

          <!-- 3-Column Story Cards (White Cards over Deep Navy) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">

            <!-- Card 1 -->
            <article class="bg-white text-slate-900 rounded-xl overflow-hidden flex flex-col shadow-sm hover:-translate-y-1 transition-all duration-300">
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
              <div class="p-5 flex flex-col gap-2.5 flex-1 justify-between">
                <div class="flex flex-col gap-2">
                  <span class="text-[10px] font-extrabold tracking-widest uppercase text-[#103860]">
                    CERITA DERMAGA
                  </span>
                  <h3 class="text-sm font-bold text-slate-900 leading-snug">
                    Menelisik Subuh di Dermaga Muncar: Dari Perahu Tradisional ke Palka Es
                  </h3>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Bagaimana para nelayan pancing ulur Selat Bali mempertahankan cara melaut ramah lingkungan tanpa merusak ekosistem terumbu karang.
                  </p>
                </div>
                <div class="pt-2 border-t border-slate-100">
                  <NuxtLink to="/katalog" class="text-xs font-bold text-[#103860] hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <span>Lihat ikan segar subuh</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </NuxtLink>
                </div>
              </div>
            </article>

            <!-- Card 2 -->
            <article class="bg-white text-slate-900 rounded-xl overflow-hidden flex flex-col shadow-sm hover:-translate-y-1 transition-all duration-300">
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
              <div class="p-5 flex flex-col gap-2.5 flex-1 justify-between">
                <div class="flex flex-col gap-2">
                  <span class="text-[10px] font-extrabold tracking-widest uppercase text-[#103860]">
                    EDUKASI TIMBANGAN
                  </span>
                  <h3 class="text-sm font-bold text-slate-900 leading-snug">
                    Memahami Rumus Berat Kotor vs Rendemen Netto Ikan Laut
                  </h3>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Mengapa susut potong (85% utuh siang dan 52% fillet murni) harus dijelaskan di awal agar pembeli tidak tertipu berat palsu.
                  </p>
                </div>
                <div class="pt-2 border-t border-slate-100">
                  <NuxtLink to="/katalog" class="text-xs font-bold text-[#103860] hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <span>Cek kalkulasi timbang</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </NuxtLink>
                </div>
              </div>
            </article>

            <!-- Card 3 -->
            <article class="bg-white text-slate-900 rounded-xl overflow-hidden flex flex-col shadow-sm hover:-translate-y-1 transition-all duration-300">
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
              <div class="p-5 flex flex-col gap-2.5 flex-1 justify-between">
                <div class="flex flex-col gap-2">
                  <span class="text-[10px] font-extrabold tracking-widest uppercase text-[#103860]">
                    KEMITRAAN KULINER
                  </span>
                  <h3 class="text-sm font-bold text-slate-900 leading-snug">
                    Pasokan Ikan Rantai Dingin Untuk Restoran, Hotel & Katering
                  </h3>
                  <p class="text-xs text-slate-600 leading-relaxed">
                    Program kemitraan pasokan berkala dengan spesifikasi gramasi dan potongan terstandarisasi untuk chef dan pengusaha kuliner di Jawa Timur & Bali.
                  </p>
                </div>
                <div class="pt-2 border-t border-slate-100">
                  <a href="https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi,%20saya%20ingin%20konsultasi%20pasokan%20ikan%20restoran/katering" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-[#103860] hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <span>Konsultasi pasokan Horeca</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </article>

          </div>
        </section>

        <!-- 5. KEMITRAAN & LOKASI HUB MUNCAR (Dine & Cook Sustainably CTA) -->
        <section class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
          <div class="flex flex-col gap-2 max-w-xl">
            <div class="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
              <span class="material-symbols-outlined text-[18px]">pin_drop</span>
              <span>Fasilitas Cold Storage Pelabuhan Muncar</span>
            </div>
            <h2 class="text-lg md:text-xl font-extrabold text-[#002242]">
              Kunjungi atau hubungi tim operasional kami di Muncar.
            </h2>
            <p class="text-xs text-slate-600 leading-relaxed">
              Pelabuhan Perikanan Pantai Muncar, Kabupaten Banyuwangi, Jawa Timur. Melayani pemesanan rumah tangga harian, suplai restoran, dan pengiriman armada dingin terjadwal.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 shrink-0">
            <NuxtLink
              to="/katalog"
              class="h-11 px-6 bg-[#103860] hover:bg-[#002242] text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
              <span>Pesan Ikan Segar</span>
            </NuxtLink>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi,%20saya%20ingin%20tanya%20stok%20ikan%20dan%20pengiriman%20rantai%20dingin"
              target="_blank"
              rel="noopener noreferrer"
              class="h-11 px-6 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#002242] font-semibold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span class="material-symbols-outlined text-[18px] text-emerald-700">chat</span>
              <span>Hotline WhatsApp</span>
            </a>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>
