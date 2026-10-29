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
    },
    { property: 'og:title', content: 'Kebijakan Privasi | Laut Berkah Abadi Banyuwangi' },
    { property: 'og:description', content: 'Kebijakan perlindungan data dan privasi pelanggan Laut Berkah Abadi Banyuwangi.' },
    { property: 'og:image', content: 'https://lautberkahabadi.com/brand/logo.webp' },
    { property: 'og:url', content: 'https://lautberkahabadi.com/kebijakan-privasi' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  link: [
    { rel: 'canonical', href: 'https://lautberkahabadi.com/kebijakan-privasi' }
  ]
})
</script>

<template>
  <div class="bg-[#F8FAFC] text-slate-900 font-sans antialiased min-h-screen flex flex-col items-center">
    <!-- Desktop Breadcrumb (hidden on mobile) -->
    <nav class="hidden md:flex w-full max-w-5xl lg:max-w-6xl px-6 pt-4 pb-2 items-center gap-2 text-xs text-slate-500">
      <NuxtLink to="/" class="hover:text-[#103860] transition-colors">Beranda</NuxtLink>
      <span class="text-slate-300">/</span>
      <span class="text-slate-900 font-medium">Kebijakan Privasi</span>
    </nav>

    <!-- Shell Container: mobile default, expanded responsive card on md+ -->
    <div class="w-full max-w-md md:max-w-5xl lg:max-w-6xl bg-white min-h-screen md:min-h-0 flex flex-col border-x border-slate-200/80 md:border md:rounded-2xl md:my-6 shadow-none pb-24 md:pb-10 overflow-hidden">
      
      <!-- Top Navigation (Mobile only, hidden on md+) -->
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
          <h1 class="text-base font-semibold text-[#002242]">Kebijakan Privasi</h1>
        </div>
      </header>

      <!-- Content -->
      <main class="p-4 md:p-8 lg:p-10 flex flex-col gap-6 md:gap-8 text-xs text-slate-600 leading-relaxed">
        
        <!-- Header Banner -->
        <div class="p-6 md:p-8 rounded-xl bg-gradient-to-br from-[#103860] via-[#0d2f52] to-[#081a2e] text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
          <div class="flex flex-col gap-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 self-start">
              <span class="px-2.5 py-1 rounded-md bg-white/10 text-white text-[10px] font-bold tracking-widest uppercase">
                Perlindungan Data Konsumen
              </span>
              <span class="text-[11px] text-slate-300">Pembaruan: Oktober 2026</span>
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white">Kebijakan Privasi & Keamanan Data</h2>
            <p class="text-slate-200 text-xs md:text-sm leading-relaxed">
              Komitmen Laut Berkah Abadi dalam menjaga kerahasiaan identitas dan data transaksi hasil laut segar Anda sesuai regulasi perlindungan data pribadi Republik Indonesia.
            </p>
          </div>

          <div class="hidden lg:flex flex-col gap-1.5 p-3.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 text-right shrink-0">
            <span class="text-[11px] text-slate-300 font-medium">Standar Privasi</span>
            <span class="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
              <span class="material-symbols-outlined text-[16px]">verified_user</span>
              Terenkripsi & Aman
            </span>
            <span class="text-[10px] text-slate-300">Cold Chain Hub Muncar</span>
          </div>
        </div>

        <!-- Ikhtisar Komitmen Keamanan -->
        <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#103860]/10 text-[#103860] flex items-center justify-center shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[20px]">security</span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-xs md:text-sm font-bold text-slate-900">Jaminan Keamanan Pelanggan</h3>
            <p class="text-slate-600 text-xs md:text-[13px] leading-relaxed">
              Laut Berkah Abadi berkomitmen menjaga kerahasiaan dan keamanan informasi pribadi setiap pelanggan sesuai peraturan perundang-undangan Republik Indonesia. Data Anda hanya diproses untuk operasional pemenuhan pesanan dan pengantaran rantai dingin higienis.
            </p>
          </div>
        </div>

        <!-- Poin Kebijakan Grid: 1 Kolom Mobile, 2 Kolom Desktop -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          
          <!-- Poin 1 -->
          <div class="bg-white border border-slate-200/90 rounded-xl p-4 md:p-5 flex flex-col gap-2.5 shadow-2xs">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#103860] font-bold text-xs shrink-0">
                1
              </span>
              <h3 class="font-bold text-slate-900 text-sm">Data yang Dikumpulkan</h3>
            </div>
            <p class="text-slate-600 text-xs md:text-[13px] leading-relaxed">
              Informasi yang kami minta saat Anda melakukan transaksi terbatas pada keperluan pengiriman pesanan hasil laut segar, mencakup nama lengkap, nomor WhatsApp aktif, alamat penerima pengiriman, serta catatan porsi khusus dapur Anda.
            </p>
          </div>

          <!-- Poin 2 -->
          <div class="bg-white border border-slate-200/90 rounded-xl p-4 md:p-5 flex flex-col gap-2.5 shadow-2xs">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#103860] font-bold text-xs shrink-0">
                2
              </span>
              <h3 class="font-bold text-slate-900 text-sm">Penggunaan Informasi</h3>
            </div>
            <p class="text-slate-600 text-xs md:text-[13px] leading-relaxed">
              Data pribadi digunakan secara eksklusif untuk:
            </p>
            <ul class="list-disc pl-4 space-y-1.5 text-slate-600 text-xs md:text-[13px]">
              <li>Memproses pesanan dan mengonfirmasi pembayaran instan (QRIS atau Virtual Account).</li>
              <li>Mengirimkan foto bukti nota timbangan digital via WhatsApp sebelum paket berangkat.</li>
              <li>Memandu kurir armada dingin menuju alamat pengantaran Anda tepat waktu.</li>
            </ul>
          </div>

          <!-- Poin 3 -->
          <div class="bg-white border border-slate-200/90 rounded-xl p-4 md:p-5 flex flex-col gap-2.5 shadow-2xs">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#103860] font-bold text-xs shrink-0">
                3
              </span>
              <h3 class="font-bold text-slate-900 text-sm">Keamanan Transaksi</h3>
            </div>
            <p class="text-slate-600 text-xs md:text-[13px] leading-relaxed">
              Pembayaran diproses melalui gateway resmi Bank Indonesia dengan QRIS Dinamis dan Virtual Account terenkripsi. Kami tidak pernah meminta atau menyimpan data rahasia perbankan, nomor kartu kredit, maupun PIN Anda.
            </p>
          </div>

          <!-- Poin 4 -->
          <div class="bg-white border border-slate-200/90 rounded-xl p-4 md:p-5 flex flex-col gap-2.5 shadow-2xs">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#103860] font-bold text-xs shrink-0">
                4
              </span>
              <h3 class="font-bold text-slate-900 text-sm">Hak Akses dan Pembaruan Data</h3>
            </div>
            <p class="text-slate-600 text-xs md:text-[13px] leading-relaxed">
              Anda berhak memperbarui alamat pengiriman atau meminta penghapusan riwayat akun kapan saja dengan menghubungi Customer Service WhatsApp resmi Laut Berkah Abadi Banyuwangi.
            </p>
          </div>

        </div>

        <!-- Banner Bantuan / Kontak Layanan -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <div>
              <h4 class="text-xs md:text-sm font-bold text-slate-900">Pertanyaan Terkait Data Pribadi?</h4>
              <p class="text-[11px] md:text-xs text-slate-500">Tim operasional kami siap membantu penyesuaian atau klarifikasi data akun Anda.</p>
            </div>
          </div>
          <a 
            href="https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi,%20saya%20ingin%20bertanya%20mengenai%20kebijakan%20privasi%20data" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#103860] hover:bg-[#0c2b4a] text-white text-xs font-bold rounded-lg transition-colors shrink-0"
          >
            <span>Hubungi via WhatsApp</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        <!-- Tombol Aksi Navigasi -->
        <div class="pt-2 flex flex-col sm:flex-row gap-3">
          <NuxtLink 
            to="/" 
            class="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span class="material-symbols-outlined text-[16px]">home</span>
            <span>Kembali ke Beranda</span>
          </NuxtLink>
          <NuxtLink 
            to="/katalog" 
            class="flex-1 h-11 bg-[#103860] hover:bg-[#0c2b4a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span class="material-symbols-outlined text-[16px]">storefront</span>
            <span>Jelajahi Katalog Ikan Segar</span>
          </NuxtLink>
        </div>
      </main>

      <CommonAppFooter />
    </div>
  </div>
</template>
