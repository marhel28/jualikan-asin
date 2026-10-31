<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface StoryStep {
  id: string
  stepNumber: string
  tag: string
  title: string
  subtitle: string
  body: string
  bullets: Array<{ icon: string; title: string; desc: string }>
  mediaType: 'video' | 'image'
  mediaSrc: string
  mediaPoster: string
  badgeText: string
  badgeSub: string
  badgeColor: string
}

const steps: StoryStep[] = [
  {
    id: 'step-laut',
    stepNumber: '01',
    tag: 'Habitat & Tangkapan Muncar',
    title: 'Pilihan ikan Anda menentukan masa depan laut.',
    subtitle: 'Diadaptasi dari prinsip konservasi laut global, kami menghubungkan Anda langsung dengan nelayan pancing ulur Pelabuhan Muncar.',
    body: 'Setiap ekor ikan tangkapan liar kami berasal dari perairan Selat Bali dan Samudra Hindia. Kami bermitra langsung dengan nelayan lokal yang menggunakan pancing ulur tradisional, bukan pukat harimau atau cantrang dasar yang menghancurkan terumbu karang.',
    bullets: [
      { icon: 'sailing', title: 'Nelayan Pancing Ulur', desc: 'Metode selektif satu kail satu ikan, menjaga populasi dan habitat karang alami.' },
      { icon: 'water_drop', title: 'Perairan Selat Bali', desc: 'Arus selat yang kaya nutrisi menghasilkan daging ikan padat dan gurih alami.' },
      { icon: 'verified', title: 'Tanpa Pengawet Sintetis', desc: 'Kesegaran dipertahankan murni dengan es dan suhu rendah, bukan formalin.' }
    ],
    mediaType: 'video',
    mediaSrc: 'https://www.seafoodwatch.org/globalassets/sfw/videos/homepage/school-of-jacks-1rf24.00.mp4#t=0.1',
    mediaPoster: 'https://cdn.ammarabufadhel.my.id/banners/banner-laut-selatbali-09d4359b.webp',
    badgeText: 'Selat Bali & Samudra Hindia',
    badgeSub: 'Tangkapan Pancing Harian',
    badgeColor: 'bg-[#103860]'
  },
  {
    id: 'step-rantai-dingin',
    stepNumber: '02',
    tag: 'Rantai Dingin Presisi',
    title: 'Kecepatan penanganan sejak detik pertama di air.',
    subtitle: 'Kunci mutu ikan terbaik bukan pada jarak tempuh, melainkan rantai dingin tanpa putus sejak kapal merapat di dermaga Muncar.',
    body: 'Begitu ikan naik dari air laut, nelayan langsung memasukkannya ke palka ber-es curah cair (slurry ice) bersuhu 0°C. Di Cold Hub Muncar, ikan masuk meja preparasi stainless steel berpendingin, dibersihkan higienis, dan jika dibekukan masuk blast freezer -20°C agar serat daging tidak pecah.',
    bullets: [
      { icon: 'ac_unit', title: 'Suhu Palka 0°C', desc: 'Ikan langsung didinginkan di kapal sebelum sempat mengalami kenaikan suhu biologis.' },
      { icon: 'kitchen', title: 'Blast Freezer -20°C', desc: 'Pembekuan kilat menjaga tekstur, kadar air, dan keutuhan nutrisi protein ikan.' },
      { icon: 'inventory_2', title: 'Vakum & Insulasi Termal', desc: 'Dikemas kantong vakum food-grade tebal bersama ice gel beku ke alamat tujuan.' }
    ],
    mediaType: 'video',
    mediaSrc: 'https://www.seafoodwatch.org/globalassets/sfw/videos/homepage/aquaculture-fish-farming-7sec-1rf24.00.mp4#t=0.1',
    mediaPoster: 'https://cdn.ammarabufadhel.my.id/banners/banner-dermaga-muncar-2a28a9c6.webp',
    badgeText: 'Cold Hub Muncar 0°–2°C',
    badgeSub: 'Blast Freezer -20°C Terkalibrasi',
    badgeColor: 'bg-sky-800'
  },
  {
    id: 'step-kurasi',
    stepNumber: '03',
    tag: 'Standar Kurasi 3 Tingkat LBA',
    title: 'Transparansi standar kurasi: Hijau, Kuning, dan Merah.',
    subtitle: 'Mengambil inspirasi kurasi ilmiah Seafood Watch, kami menerapkan panduan kurasi ketat pada seluruh hasil laut yang kami distribusikan.',
    body: 'Konsumen berhak tahu dari mana ikannya berasal dan bagaimana ia ditangkap. Kami membagi kurasi ke dalam tiga tingkat tegas agar meja makan Anda selalu menerima hasil laut yang aman, segar, dan ramah lingkungan.',
    bullets: [
      { icon: 'check_circle', title: 'Hijau (Pilihan Utama)', desc: 'Ikan laut liar pancingan harian (Kakap, Tongkol, Tenggiri, Lemuru). Ramah karang dan lolos uji organoleptik segar.' },
      { icon: 'info', title: 'Kuning (Alternatif Terkendali)', desc: 'Budidaya air payau alami teruji (Bandeng cabut duri, Udang vaname higienis). Bebas residu antibiotik terlarang.' },
      { icon: 'cancel', title: 'Merah (Tolak & Dilarang)', desc: 'Ikan hasil bom, potasium/sianida, cantrang perusak dasar, anakan di bawah ukuran, dan satwa dilindungi. Dilarang masuk hub kami.' }
    ],
    mediaType: 'image',
    mediaSrc: 'https://cdn.ammarabufadhel.my.id/products/asset-1544552866-03b7d7e3.webp',
    mediaPoster: 'https://cdn.ammarabufadhel.my.id/products/asset-1544552866-03b7d7e3.webp',
    badgeText: 'Kurasi Transparan LBA',
    badgeSub: 'Tiga Tingkat Keberlanjutan Mutu',
    badgeColor: 'bg-emerald-800'
  }
]

const activeIndex = ref(0)
const rootRef = ref<HTMLElement | null>(null)
const cardRefs = ref<HTMLElement[]>([])
const videoRefs = ref<(HTMLVideoElement | null)[]>([])
const isIntersectingContainer = ref(false)

const scrollToStep = (index: number) => {
  const el = cardRefs.value[index]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

let cardObserver: IntersectionObserver | null = null
let containerObserver: IntersectionObserver | null = null

onMounted(() => {
  // 1. Observer untuk kontainer keseluruhan (pause/play video hemat resource)
  if (rootRef.value) {
    containerObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        isIntersectingContainer.value = entry?.isIntersecting ?? false
        updateVideoPlayState()
      },
      { threshold: 0.1 }
    )
    containerObserver.observe(rootRef.value)
  }

  // 2. Observer untuk tiap kartu cerita
  cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-step-index'))
          if (!isNaN(idx)) {
            activeIndex.value = idx
            updateVideoPlayState()
          }
        }
      })
    },
    { threshold: 0.45, rootMargin: '-10% 0px -20% 0px' }
  )

  cardRefs.value.forEach((card) => {
    if (card) cardObserver?.observe(card)
  })
})

onBeforeUnmount(() => {
  cardObserver?.disconnect()
  containerObserver?.disconnect()
})

const updateVideoPlayState = () => {
  videoRefs.value.forEach((vid, idx) => {
    if (!vid) return
    if (isIntersectingContainer.value && activeIndex.value === idx) {
      vid.play().catch(() => {
        // Autoplay kebijakan browser, biarkan silent fallback
      })
    } else {
      vid.pause()
    }
  })
}
</script>

<template>
  <section ref="rootRef" class="w-full bg-white md:border md:border-slate-200/80 md:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10">
    <!-- Header Bagian -->
    <div class="flex flex-col gap-2 mb-8 md:mb-12 border-b border-slate-100 pb-6">
      <div class="inline-flex items-center gap-2 self-start">
        <span class="px-2.5 py-1 rounded-md bg-[#103860]/8 text-[#103860] text-[10px] font-bold tracking-widest uppercase">
          Filosofi & Rantai Pasok
        </span>
        <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Standar Seafood Berkelanjutan
        </span>
      </div>
      <h2 class="font-display text-xl sm:text-2xl md:text-3xl font-bold text-[#0b1e35] leading-snug">
        Dari kedalaman laut Selat Bali hingga piring saji keluarga Anda.
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
        Mengintegrasikan standar penangkapan bertanggung jawab dan rantai dingin presisi Muncar. Gulir ke bawah untuk melihat perjalanan transparansi hasil laut kami.
      </p>
    </div>

    <!-- Scrollytelling Layout: Dual Rail (Desktop) & Stack (Mobile) -->
    <div class="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      
      <!-- KOLOM KIRI (Desktop Sticky Media Rail) -->
      <div class="hidden lg:block lg:col-span-6 sticky top-24 z-20">
        <div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-md">
          
          <!-- Background layers cross-fade -->
          <div
            v-for="(st, idx) in steps"
            :key="'media-' + st.id"
            class="absolute inset-0 transition-opacity duration-700 ease-in-out"
            :class="activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'"
          >
            <!-- Video Media -->
            <video
              v-if="st.mediaType === 'video'"
              :ref="(el) => { if (el) videoRefs[idx] = el as HTMLVideoElement }"
              :src="st.mediaSrc"
              :poster="st.mediaPoster"
              autoplay
              loop
              muted
              playsinline
              preload="metadata"
              class="w-full h-full object-cover"
            />

            <!-- Image Media Fallback -->
            <img
              v-else
              :src="st.mediaSrc"
              :alt="st.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />

            <!-- Gradient Overlay tipis untuk kontras badge -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

            <!-- Floating Badge Kiri Bawah -->
            <div class="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-sm flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div :class="st.badgeColor" class="w-9 h-9 rounded-lg text-white flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[20px]">
                    {{ idx === 0 ? 'sailing' : (idx === 1 ? 'thermostat' : 'verified') }}
                  </span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">{{ st.badgeSub }}</span>
                  <span class="text-xs font-bold text-slate-900 truncate">{{ st.badgeText }}</span>
                </div>
              </div>
              <span class="px-2 py-1 rounded bg-slate-100 text-[#103860] text-[10px] font-mono font-bold shrink-0">
                Langkah {{ st.stepNumber }}/03
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Stepper Navigation Dots (Desktop) -->
        <div class="mt-4 flex items-center justify-between px-2 py-2 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div class="flex items-center gap-2">
            <button
              v-for="(st, idx) in steps"
              :key="'btn-' + st.id"
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              :class="activeIndex === idx ? 'bg-[#103860] text-white shadow-2xs' : 'bg-transparent text-slate-600 hover:bg-slate-200/60'"
              @click="scrollToStep(idx)"
            >
              <span>{{ st.stepNumber }}</span>
              <span class="hidden xl:inline text-[11px] font-normal opacity-90">{{ st.tag }}</span>
            </button>
          </div>
          <span class="text-[11px] text-slate-500 font-medium pr-2">
            Gulir untuk melanjutkan
          </span>
        </div>
      </div>

      <!-- KOLOM KANAN (Scrolling Narasi Cards) -->
      <div class="col-span-1 lg:col-span-6 flex flex-col gap-10 lg:gap-16 py-2">
        <div
          v-for="(st, idx) in steps"
          :key="'card-' + st.id"
          :ref="(el) => { if (el) cardRefs[idx] = el as HTMLElement }"
          :data-step-index="idx"
          class="flex flex-col gap-5 p-5 sm:p-6 md:p-8 rounded-2xl border transition-all duration-300"
          :class="activeIndex === idx ? 'bg-white border-[#103860]/30 shadow-md ring-1 ring-[#103860]/10' : 'bg-slate-50/60 border-slate-200/80 shadow-none'"
        >
          <!-- Mobile Media Preview (Khusus Layar < lg) -->
          <div class="lg:hidden relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
            <video
              v-if="st.mediaType === 'video'"
              :src="st.mediaSrc"
              :poster="st.mediaPoster"
              autoplay
              loop
              muted
              playsinline
              class="w-full h-full object-cover"
            />
            <img
              v-else
              :src="st.mediaSrc"
              :alt="st.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div class="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[11px] flex items-center justify-between">
              <span class="font-bold">{{ st.badgeText }}</span>
              <span class="text-slate-300 text-[10px]">{{ st.badgeSub }}</span>
            </div>
          </div>

          <!-- Step Tag & Number -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="inline-flex items-center gap-2">
              <span
                class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                :class="activeIndex === idx ? 'bg-[#103860] text-white' : 'bg-slate-200 text-slate-700'"
              >
                {{ st.stepNumber }}
              </span>
              <span class="text-xs font-bold tracking-wider uppercase text-[#103860]">
                {{ st.tag }}
              </span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">Tahap {{ idx + 1 }} dari 3</span>
          </div>

          <!-- Judul & Subtitle -->
          <div class="flex flex-col gap-2">
            <h3 class="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {{ st.title }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {{ st.subtitle }}
            </p>
          </div>

          <!-- Deskripsi Utama -->
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {{ st.body }}
          </p>

          <!-- Poin Kunci / Bullets -->
          <div class="flex flex-col gap-2.5 pt-2">
            <div
              v-for="(bullet, bIdx) in st.bullets"
              :key="'bullet-' + idx + '-' + bIdx"
              class="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :class="idx === 2 && bIdx === 2 ? 'bg-rose-50 text-rose-700' : (idx === 2 && bIdx === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-[#103860]')"
              >
                <span class="material-symbols-outlined text-[18px]">
                  {{ bullet.icon }}
                </span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold text-slate-900">{{ bullet.title }}</span>
                <span class="text-[11px] sm:text-xs text-slate-500 leading-relaxed">{{ bullet.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
