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
  <footer class="relative mt-12 bg-white text-slate-600 text-xs border-t border-slate-200 overflow-hidden">
    
    <!-- Transparent Marine Fish & Wave Watermark Pattern (Low Opacity Vector Background ala Reference 1) -->
    <div class="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.038] text-[#103860]">
      <svg class="absolute -right-10 -bottom-12 w-[400px] h-[300px] md:w-[600px] md:h-[420px]" viewBox="0 0 600 420" fill="currentColor">
        <!-- Leading Pelagic Tuna/Mackerel Fish Silhouette -->
        <path d="M470,170 C430,155 365,152 295,175 C225,198 175,190 128,166 C98,151 68,133 38,142 C28,145 18,156 14,171 C24,176 43,169 68,176 C107,185 146,214 205,219 C264,224 333,205 402,185 C441,175 460,172 470,170 Z" />
        <path d="M295,175 C315,132 344,113 368,108 C358,127 343,151 324,166 Z" />
        <path d="M205,219 C195,248 176,267 156,276 C171,257 186,236 195,221 Z" />
        <path d="M68,176 C43,142 14,113 0,104 C10,133 19,162 14,171 C19,181 9,210 0,239 C14,229 43,200 68,176 Z" />
        
        <!-- Trailing Fish Silhouette -->
        <path d="M235,295 C210,285 166,281 127,295 C88,309 59,304 30,290 C15,283 5,287 0,295 C15,300 34,306 73,309 C112,312 156,300 195,287 C220,281 230,279 235,295 Z" />
        <path d="M30,290 C15,271 5,257 0,252 C5,271 10,285 0,295 C10,304 5,319 0,338 C5,333 15,319 30,290 Z" />

        <!-- Fluid Marine Wave Lines -->
        <path d="M0,75 Q150,120 300,65 T600,75" stroke="currentColor" stroke-width="3" fill="none" opacity="0.6" />
        <path d="M0,115 Q150,160 300,105 T600,115" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4" />
        <path d="M0,360 Q150,400 300,350 T600,370" stroke="currentColor" stroke-width="3" fill="none" opacity="0.5" />
      </svg>
    </div>

    <!-- Main Footer Content Grid (Clean 4-Column Layout ala Reference Image 1) -->
    <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
        
        <!-- Column 1: Brand & Origin (About Us) (lg:col-span-4) -->
        <div class="lg:col-span-4 flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
              <img 
                src="/brand/logo.webp" 
                alt="Laut Berkah Abadi" 
                class="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <span class="text-sm font-extrabold text-[#103860] block tracking-tight">Laut Berkah Abadi</span>
              <span class="text-[11px] text-slate-500 font-medium">Cold Chain Seafood Muncar</span>
            </div>
          </div>

          <p class="text-xs text-slate-500 leading-relaxed pr-3">
            Distribusi hasil laut segar tangkapan harian nelayan Selat Bali dan Samudra Hindia. Diamankan dengan rantai dingin presisi 0-2°C langsung dari dermaga Pelabuhan Muncar ke pintu rumah Anda.
          </p>

          <div class="pt-1 flex items-center gap-2 text-[11px] text-[#059669] font-semibold">
            <span class="material-symbols-outlined text-[16px]">verified</span>
            <span>Garansi Segar Alami, Tanpa Bahan Pengawet</span>
          </div>
        </div>

        <!-- Column 2: Contact Info (ala Reference Image 1) (lg:col-span-3) -->
        <div class="lg:col-span-3 flex flex-col gap-3">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Informasi Kontak
          </h4>
          <div class="space-y-2.5 text-xs text-slate-600">
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[16px] text-[#103860] shrink-0 mt-0.5">location_on</span>
              <span class="leading-relaxed">
                Pelabuhan Perikanan Muncar, Kabupaten Banyuwangi, Jawa Timur
              </span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[16px] text-[#103860] shrink-0 mt-0.5">call</span>
              <span class="font-mono">+62 812-3456-7890</span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[16px] text-[#103860] shrink-0 mt-0.5">mail</span>
              <span class="font-mono">admin@lautberkahabadi.id</span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[16px] text-[#059669] shrink-0 mt-0.5">schedule</span>
              <span>Kirim Subuh: 06:00 - 08:30 WIB</span>
            </div>
          </div>
        </div>

        <!-- Column 3: Important Link (ala Reference Image 1) (lg:col-span-2) -->
        <div class="lg:col-span-2 flex flex-col gap-3">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Tautan Penting
          </h4>
          <ul class="space-y-2 text-xs">
            <li>
              <NuxtLink to="/katalog" class="text-slate-600 hover:text-[#103860] transition-colors inline-block">
                Katalog Ikan Segar
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/keranjang" class="text-slate-600 hover:text-[#103860] transition-colors inline-block">
                Keranjang Belanja
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/akun" class="text-slate-600 hover:text-[#103860] transition-colors inline-block">
                Akun Saya
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tentang" class="text-slate-600 hover:text-[#103860] transition-colors inline-block">
                Tentang Kami
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/kebijakan-privasi" class="text-slate-600 hover:text-[#103860] transition-colors inline-block">
                Kebijakan Privasi
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/syarat-ketentuan" class="text-slate-600 hover:text-[#103860] transition-colors inline-block">
                Syarat & Ketentuan
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Column 4: Layanan CS & Konsultasi Cepat (lg:col-span-3) -->
        <div class="lg:col-span-3 flex flex-col gap-3">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Layanan Cepat
          </h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            Konsultasi tangkapan harian, pesanan boks styrofoam luar kota, atau kebutuhan pasokan restoran & katering.
          </p>

          <div class="pt-1">
            <a 
              :href="waUrl" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#006c4a] border border-emerald-200/80 font-bold transition-colors text-xs w-full shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <span class="material-symbols-outlined text-[17px]">chat</span>
              <span>Hubungi CS WhatsApp Muncar</span>
            </a>
          </div>
        </div>

      </div>

      <!-- Bottom Bar: Hairline Divider, Left Copyright, Right Social Icons (ala Reference Image 1) -->
      <div class="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <!-- Copyright Text -->
        <p class="text-center sm:text-left">
          © {{ currentYear }} Laut Berkah Abadi. Seluruh hak cipta dilindungi.
        </p>

        <!-- Social Media Links (Right-aligned Flat Icons) -->
        <div class="flex items-center gap-2">
          <span class="text-slate-400 mr-1 hidden sm:inline">Ikuti Kami:</span>
          <a 
            v-for="item in socialLinks"
            :key="item.name"
            :href="item.url" 
            target="_blank" 
            rel="noopener noreferrer" 
            :aria-label="`${item.name} Laut Berkah Abadi`"
            :class="['w-8 h-8 rounded-full bg-slate-50 hover:bg-white border border-slate-200 text-slate-600 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer', item.hoverClass]"
          >
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path :d="item.path"></path>
            </svg>
          </a>
        </div>
      </div>

    </div>
  </footer>
</template>
