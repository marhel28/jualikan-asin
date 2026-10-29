<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) router.back()
  else router.push('/')
}

useHead({
  title: 'Tentang Kami: Perjalanan Laut Berkah Abadi | Muncar, Banyuwangi',
  meta: [
    { name: 'description', content: 'Perjalanan Laut Berkah Abadi dari dermaga Muncar Banyuwangi, rantai dingin 0-4\u00B0C, timbangan jujur, tanpa pengawet. Foto dan cerita lapangan langsung dari nelayan.' },
    { name: 'geo.position', content: '-8.4328;114.3361' },
    { name: 'geo.placename', content: 'Pelabuhan Muncar, Kabupaten Banyuwangi, Jawa Timur, Indonesia' },
    { name: 'geo.region', content: 'ID-JI' },
    { name: 'ICBM', content: '-8.4328, 114.3361' },
    { property: 'og:title', content: 'Tentang Kami: Perjalanan Laut Berkah Abadi | Muncar, Banyuwangi' },
    { property: 'og:description', content: 'Perjalanan Laut Berkah Abadi dari dermaga Muncar Banyuwangi, rantai dingin 0-4\u00B0C, timbangan jujur, tanpa pengawet.' },
    { property: 'og:image', content: 'https://lautberkahabadi.com/brand/logo.webp' },
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
    <nav class="hidden md:flex w-full max-w-6xl px-6 pt-4 pb-2 items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-slate-900 font-medium">Tentang Kami</span>
    </nav>

    <div class="w-full max-w-md md:max-w-6xl bg-white md:bg-transparent min-h-screen md:min-h-0 flex flex-col md:gap-6 border-x border-slate-200/80 md:border-0 shadow-none pb-24 md:pb-10">
      <!-- Mobile header -->
      <header class="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center gap-3">
        <button type="button" aria-label="Kembali" class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 text-[#002242] active:scale-95 cursor-pointer" @click="goBack">
          <span class="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <span class="text-base font-semibold text-[#002242]">Tentang Kami</span>
      </header>

      <main class="flex flex-col gap-8 md:gap-10 p-4 md:p-0">
        <!-- HERO STORY : 2 kolom desktop -->
        <section class="bg-white md:border md:border-slate-200/80 md:rounded-xl overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <!-- teks -->
            <div class="p-5 md:p-8 lg:p-10 flex flex-col gap-4">
              <div class="inline-flex items-center gap-2 self-start">
                <span class="px-2.5 py-1 rounded-md bg-[#103860]/8 text-[#103860] text-[10px] font-bold tracking-widest uppercase">Sejak 2021 • Pelabuhan Muncar</span>
                <span class="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Rantai dingin terjaga
                </span>
              </div>
              <h1 class="font-display text-[22px] md:text-[28px] font-bold leading-tight text-[#0b1e35]">
                Dari dermaga Muncar,<br>langsung ke dapur Anda.
              </h1>
              <p class="text-sm text-slate-600 leading-relaxed">
                Laut Berkah Abadi lahir dari jarak yang terlalu jauh antara harga di pelelangan dan mutu ikan yang sampai di kota. Kami memotong rantai itu, menjemput ikan pagi hari di dermaga Muncar, menjaga suhu 0–4°C tanpa putus, dan menimbang jujur di cold hub sebelum kirim.
              </p>
              <p class="text-xs text-slate-500 leading-relaxed">
                Bukan distributor besar. Kami tim kecil yang berdiri di samping nelayan pancing ulur tradisional (tanpa pukat yang merusak karang), memastikan setiap kilogram yang Anda terima adalah ikan yang baru turun kapal.
              </p>
              <!-- trust chips -->
              <div class="flex flex-wrap gap-2 pt-1">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <span class="material-symbols-outlined text-[16px] text-emerald-600">verified</span> Tanpa pengawet
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <span class="material-symbols-outlined text-[16px] text-sky-600">ac_unit</span> 0–4°C terjaga
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <span class="material-symbols-outlined text-[16px] text-[#103860]">groups</span> 100% nelayan lokal
                </span>
              </div>
            </div>
            <!-- foto hero -->
            <div class="relative bg-slate-100 min-h-[260px] lg:min-h-0">
              <!-- ponytail: ganti src ke foto asli Muncar di /public/tentang/hero.jpg saat tersedia -->
              <NuxtImg
                src="https://cdn.ammarabufadhel.my.id/banners/banner-laut-selatbali-09d4359b.webp"
                alt="Kapal nelayan berjejer di dermaga Muncar pagi hari"
                class="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                width="900"
                height="600"
                format="webp"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent lg:hidden" />
              <!-- floating badge desktop -->
              <div class="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[260px] bg-white/95 backdrop-blur rounded-xl border border-white/60 p-3 flex items-center gap-3 shadow-sm">
                <div class="w-10 h-10 rounded-lg bg-[#103860] text-white flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[20px]">thermostat</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] font-bold tracking-widest uppercase text-slate-500">Cold Hub Muncar</span>
                  <span class="text-sm font-bold text-slate-900">Suhu ruang 0°–2°C</span>
                  <span class="text-[11px] text-slate-500">Es curah + blast freezer −20°C</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- TIMELINE PERJALANAN -->
        <section class="bg-white md:border md:border-slate-200/80 md:rounded-xl p-5 md:p-8 flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <span class="text-[11px] font-bold tracking-[0.14em] uppercase text-[#103860]">Jejak Langkah Kami</span>
            <h3 class="font-display text-lg md:text-xl font-bold text-slate-900">Perjalanan yang jujur, bukan cerita brosur.</h3>
            <p class="text-xs md:text-sm text-slate-500 max-w-2xl leading-relaxed">Tiga fase yang membentuk cara kami bekerja hari ini, setiap fase lahir dari masalah nyata di lapangan.</p>
          </div>

          <div class="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <!-- garis desktop -->
            <div class="hidden md:block absolute top-[34px] left-[8%] right-[8%] h-px bg-slate-200" />
            <!-- 01 -->
            <div class="relative bg-slate-50/70 border border-slate-200 rounded-xl p-4 md:p-5 flex flex-col gap-3">
              <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-[#103860] shadow-2xs">01</div>
              <div class="flex flex-col gap-1.5">
                <span class="text-[11px] font-bold tracking-widest uppercase text-slate-400">2021: Dermaga</span>
                <h4 class="text-sm font-bold text-slate-900">Berawal dari selisih harga</h4>
                <p class="text-xs text-slate-600 leading-relaxed">Nelayan menjual murah di pelelangan, konsumen kota menerima ikan yang sudah lewat rantai panjang. Kami mulai dengan satu motor ber-es dan timbangan digital di tepi dermaga.</p>
              </div>
            </div>
            <!-- 02 -->
            <div class="relative bg-slate-50/70 border border-slate-200 rounded-xl p-4 md:p-5 flex flex-col gap-3">
              <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-[#103860] shadow-2xs">02</div>
              <div class="flex flex-col gap-1.5">
                <span class="text-[11px] font-bold tracking-widest uppercase text-slate-400">2023: Cold chain</span>
                <h4 class="text-sm font-bold text-slate-900">Membangun rantai dingin sendiri</h4>
                <p class="text-xs text-slate-600 leading-relaxed">Cold hub kecil di Muncar: es curah 0°C, ruang beku −20°C, meja sortir higienis. Ikan tidak pernah keluar dari suhu aman sejak diangkat dari air.</p>
              </div>
            </div>
            <!-- 03 -->
            <div class="relative bg-white border border-[#103860]/15 rounded-xl p-4 md:p-5 flex flex-col gap-3 shadow-2xs">
              <div class="w-8 h-8 rounded-full bg-[#103860] text-white flex items-center justify-center text-xs font-bold">03</div>
              <div class="flex flex-col gap-1.5">
                <span class="text-[11px] font-bold tracking-widest uppercase text-[#103860]">Sekarang: Transparan</span>
                <h4 class="text-sm font-bold text-slate-900">Distribusi yang bisa Anda cek</h4>
                <p class="text-xs text-slate-600 leading-relaxed">Pesan dari HP, terima foto timbangan + berat kotor/bersih + rendemen. Dari partai kecil rumahan sampai kebutuhan resto.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- GALERI DOKUMENTASI -->
        <section class="flex flex-col gap-4">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-2 px-1">
            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold tracking-[0.14em] uppercase text-[#103860]">Dokumentasi Lapangan</span>
              <h3 class="font-display text-lg md:text-xl font-bold text-slate-900">Yang Anda lihat adalah yang kami kerjakan.</h3>
            </div>
            <p class="text-xs text-slate-500 max-w-sm">Foto diambil di Muncar, bukan stok generik. Ganti mudah saat foto asli siap.</p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <!-- ponytail: ganti src ke /public/tentang/01.jpg dst saat foto asli tersedia -->
            <figure class="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <div class="aspect-[4/3] overflow-hidden bg-slate-100">
                <NuxtImg src="https://cdn.ammarabufadhel.my.id/products/asset-1544552866-03b7d7e3.webp" alt="Bongkar hasil tangkapan pagi di dermaga Muncar" class="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" loading="lazy" width="600" height="450" format="webp" />
              </div>
              <figcaption class="p-3 flex flex-col gap-1">
                <span class="text-xs font-bold text-slate-900">Bongkar pagi, 05.30 WIB</span>
                <span class="text-[11px] text-slate-500 leading-relaxed">Ikan baru turun kapal, langsung masuk es curah, belum sempat naik suhu.</span>
              </figcaption>
            </figure>

            <figure class="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <div class="aspect-[4/3] overflow-hidden bg-slate-100">
                <NuxtImg src="https://images.unsplash.com/photo-1534768651016-33c15cd2cc10?w=800&q=80&auto=format&fit=crop" alt="Sortir dan pembersihan higienis di meja stainless" class="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" loading="lazy" width="600" height="450" format="webp" />
              </div>
              <figcaption class="p-3 flex flex-col gap-1">
                <span class="text-xs font-bold text-slate-900">Sortir & bersihkan</span>
                <span class="text-[11px] text-slate-500 leading-relaxed">Kerok sisik, buang insang & isi perut di meja higienis, berat susut tercatat.</span>
              </figcaption>
            </figure>

            <figure class="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <div class="aspect-[4/3] overflow-hidden bg-slate-100">
                <NuxtImg src="https://cdn.ammarabufadhel.my.id/banners/banner-dermaga-muncar-2a28a9c6.webp" alt="Timbangan digital transparan sebelum pengemasan" class="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" loading="lazy" width="600" height="450" format="webp" />
              </div>
              <figcaption class="p-3 flex flex-col gap-1">
                <span class="text-xs font-bold text-slate-900">Timbang jujur</span>
                <span class="text-[11px] text-slate-500 leading-relaxed">Berat kotor & bersih difoto, harga ikut timbangan awal, selisih dijelaskan.</span>
              </figcaption>
            </figure>

            <figure class="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <div class="aspect-[4/3] overflow-hidden bg-slate-100">
                <NuxtImg src="https://cdn.ammarabufadhel.my.id/banners/banner-pasar-ikan-118875e7.webp" alt="Pengemasan vakum dan ice gel siap kirim" class="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" loading="lazy" width="600" height="450" format="webp" />
              </div>
              <figcaption class="p-3 flex flex-col gap-1">
                <span class="text-xs font-bold text-slate-900">Vakum + ice gel</span>
                <span class="text-[11px] text-slate-500 leading-relaxed">Kantong vakum food-grade tebal, ice gel beku & insulasi termal sampai tujuan.</span>
              </figcaption>
            </figure>

            <figure class="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col col-span-2 lg:col-span-2">
              <div class="aspect-[16/9] lg:aspect-[2.2/1] overflow-hidden bg-slate-100 relative">
                <NuxtImg src="https://cdn.ammarabufadhel.my.id/banners/banner-laut-selatbali-4be58f45.webp" alt="Perahu nelayan Muncar di Selat Bali" class="w-full h-full object-cover" loading="lazy" width="800" height="400" format="webp" />
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/55 to-transparent p-3 md:p-4">
                  <span class="text-xs md:text-sm font-semibold text-white">Selat Bali & Samudra Hindia: sumber ikan tangkapan harian kami.</span>
                </div>
              </div>
              <figcaption class="px-3 py-2.5 flex items-center gap-2 text-[11px] text-slate-500">
                <span class="material-symbols-outlined text-[16px]">photo_camera</span> Dokumentasi akan diganti foto asli Muncar secara bertahap, hubungi kami untuk kunjungan cold hub.
              </figcaption>
            </figure>
          </div>
        </section>

        <!-- KOMITMEN / PROOF -->
        <section class="bg-white md:border md:border-slate-200/80 md:rounded-xl p-5 md:p-8 flex flex-col gap-5">
          <h3 class="font-display text-base md:text-lg font-bold text-slate-900">Komitmen yang bisa Anda verifikasi.</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#103860] shrink-0">
                <span class="material-symbols-outlined text-[20px]">scale</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-sm font-bold text-slate-900">Timbangan jujur</span>
                <span class="text-xs text-slate-600 leading-relaxed">Slip digital difoto. Estimasi rendemen per jenis ikan dijelaskan sebelum checkout.</span>
              </div>
            </div>
            <div class="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shrink-0">
                <span class="material-symbols-outlined text-[20px]">science</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-sm font-bold text-slate-900">Tanpa formalin</span>
                <span class="text-xs text-slate-600 leading-relaxed">Hanya es & suhu. Uji berkala & rantai dingin tanpa putus, bukan bahan kimia.</span>
              </div>
            </div>
            <div class="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sky-700 shrink-0">
                <span class="material-symbols-outlined text-[20px]">ac_unit</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-sm font-bold text-slate-900">Dingin sampai depan pintu</span>
                <span class="text-xs text-slate-600 leading-relaxed">0–2°C di hub, −20°C beku, vakum + ice gel + dus insulasi untuk pengiriman.</span>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span class="inline-flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pesanan difoto sebelum kirim</span>
            <span class="text-slate-300">•</span>
            <span>Butuh bukti? Chat kami di WhatsApp, kami kirim foto timbangan pesanan Anda.</span>
          </div>
        </section>

        <!-- CTA -->
        <section class="rounded-xl bg-[#0b1e35] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex flex-col gap-2 max-w-xl">
            <h3 class="font-display text-lg md:text-xl font-bold">Rasakan bedanya ikan baru turun kapal.</h3>
            <p class="text-sm text-slate-300 leading-relaxed">Pesan hari ini: kami siapkan dari Muncar dengan timbangan & rantai dingin yang bisa Anda cek.</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 shrink-0">
            <NuxtLink to="/katalog" class="h-11 px-6 bg-white text-[#0b1e35] font-bold text-sm rounded-lg inline-flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">storefront</span> Lihat katalog segar
            </NuxtLink>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener" class="h-11 px-6 bg-white/10 border border-white/20 text-white font-semibold text-sm rounded-lg inline-flex items-center justify-center gap-2 hover:bg-white/15 transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">chat</span> Tanya stok hari ini
            </a>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
