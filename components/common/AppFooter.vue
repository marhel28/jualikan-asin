<script setup lang="ts">
const currentYear = new Date().getFullYear()
const waUrl = 'https://wa.me/6281234567890?text=Halo%20Laut%20Berkah%20Abadi,%20saya%20ingin%20bertanya%20seputar%20hasil%20laut%20segar%20Muncar.'

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/lautberkahabadi',
    hoverClass: 'hover:text-[#E4405F] hover:border-[#E4405F]',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
  },
  {
    name: 'TikTok',
    url: 'https://tiktok.com/@lautberkahabadi',
    hoverClass: 'hover:text-black hover:border-black',
    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.05 3.25-1.54 3.32-3.35.03-3.95.02-7.91.02-11.86-.01-1.57.01-3.14-.02-4.71z'
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com/lautberkahabadi',
    hoverClass: 'hover:text-[#1877F2] hover:border-[#1877F2]',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
  },
  {
    name: 'WhatsApp',
    url: waUrl,
    hoverClass: 'hover:text-[#25D366] hover:border-[#25D366]',
    path: 'M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.353.101.173.45 0.742.965 1.201.662.59 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.044.072.044.419-.1 0.824z'
  }
]
</script>

<template>
  <footer class="mt-8 pt-8 pb-12 border-t border-slate-200/90 bg-slate-50/70 text-slate-600 text-xs">
    <div class="max-w-md md:max-w-6xl mx-auto px-4 flex flex-col gap-6 md:gap-8">
      
      <!-- Top Grid: Brand, Trust Badges, Navigation, Social/CS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <!-- 1. Brand & Description -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-[#103860] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <span class="material-symbols-outlined text-[18px]">anchor</span>
            </div>
            <div>
              <p class="font-bold text-sm text-[#103860] leading-tight">Laut Berkah Abadi</p>
              <p class="text-[11px] text-slate-500">Cold Chain Seafood Muncar</p>
            </div>
          </div>

          <p class="text-xs text-slate-500 leading-relaxed">
            Distribusi ikan laut segar tangkapan harian nelayan Selat Bali dan Samudra Hindia dengan garansi rantai dingin presisi langsung ke dapur Anda.
          </p>
        </div>

        <!-- 2. Clean 3-Item Trust Badges -->
        <div class="flex flex-col gap-2.5">
          <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Standar Mutu</div>
          <div class="grid grid-cols-3 md:grid-cols-1 gap-2">
            <div class="flex flex-col md:flex-row md:items-center items-center text-center md:text-left p-2 rounded-lg bg-white border border-slate-200/70 shadow-2xs md:gap-2.5">
              <span class="material-symbols-outlined text-[20px] text-[#006c4a] mb-1 md:mb-0">ac_unit</span>
              <div>
                <span class="font-semibold text-[11px] text-slate-800 block">Cold Chain</span>
                <span class="text-[10px] text-slate-500">Suhu 0 - 2°C</span>
              </div>
            </div>

            <div class="flex flex-col md:flex-row md:items-center items-center text-center md:text-left p-2 rounded-lg bg-white border border-slate-200/70 shadow-2xs md:gap-2.5">
              <span class="material-symbols-outlined text-[20px] text-[#103860] mb-1 md:mb-0">scale</span>
              <div>
                <span class="font-semibold text-[11px] text-slate-800 block">Timbangan Riil</span>
                <span class="text-[10px] text-slate-500">Foto Timbangan</span>
              </div>
            </div>

            <div class="flex flex-col md:flex-row md:items-center items-center text-center md:text-left p-2 rounded-lg bg-white border border-slate-200/70 shadow-2xs md:gap-2.5">
              <span class="material-symbols-outlined text-[20px] text-amber-600 mb-1 md:mb-0">verified</span>
              <div>
                <span class="font-semibold text-[11px] text-slate-800 block">Bebas Formalin</span>
                <span class="text-[10px] text-slate-500">100% Segar Alami</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Navigation Links (About, Privacy, Terms, Catalog) -->
        <div class="flex flex-col gap-2.5">
          <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Informasi & Bantuan</div>
          <div class="grid grid-cols-2 md:grid-cols-1 gap-y-2 text-xs">
            <NuxtLink to="/tentang" class="text-slate-600 hover:text-[#103860] transition-colors flex items-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-slate-400"></span>
              <span>Tentang Kami</span>
            </NuxtLink>
            <NuxtLink to="/katalog" class="text-slate-600 hover:text-[#103860] transition-colors flex items-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-slate-400"></span>
              <span>Katalog Produk</span>
            </NuxtLink>
            <NuxtLink to="/kebijakan-privasi" class="text-slate-600 hover:text-[#103860] transition-colors flex items-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-slate-400"></span>
              <span>Kebijakan Privasi</span>
            </NuxtLink>
            <NuxtLink to="/syarat-ketentuan" class="text-slate-600 hover:text-[#103860] transition-colors flex items-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-slate-400"></span>
              <span>Syarat & Ketentuan</span>
            </NuxtLink>
          </div>
        </div>

        <!-- 4. Media Sosial & Hubungi Kami -->
        <div class="flex flex-col gap-3">
          <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Layanan Pelanggan</div>
          <p class="text-xs text-slate-500 leading-relaxed">
            Butuh info ketersediaan stok kapal atau pesanan khusus restoran & reseller?
          </p>
          <a 
            :href="waUrl" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-[#006c4a] border border-emerald-200/80 font-semibold hover:bg-emerald-100 transition-colors shadow-2xs text-xs w-full"
          >
            <span class="material-symbols-outlined text-[16px]">support_agent</span>
            <span>CS WhatsApp Muncar</span>
          </a>

          <div class="flex flex-col gap-1.5 mt-1">
            <span class="text-[11px] font-medium text-slate-500">Ikuti Kami:</span>
            <div class="flex items-center gap-2">
              <a 
                v-for="item in socialLinks"
                :key="item.name"
                :href="item.url" 
                target="_blank" 
                rel="noopener noreferrer" 
                :aria-label="`${item.name} Laut Berkah Abadi`"
                :class="['w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer', item.hoverClass]"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path :d="item.path"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Operational Location & Copyright -->
      <div class="pt-4 border-t border-slate-200/70 flex flex-col md:flex-row md:items-center md:justify-between gap-1 text-[11px] text-slate-500">
        <p>Fasilitas Cold Hub: Pelabuhan Muncar, Banyuwangi, Jawa Timur</p>
        <p>© {{ currentYear }} Laut Berkah Abadi. Seluruh hak cipta dilindungi.</p>
      </div>

    </div>
  </footer>
</template>
