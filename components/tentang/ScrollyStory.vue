<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface StoryStep {
  id: string
  stepNumber: string
  alignment: 'right' | 'left'
  sectionTitle: string
  title: string
  body: string
  mediaType: 'video' | 'image'
  mediaSrc: string
  mediaPoster: string
  badgeText: string
  btnSecondaryText: string
  btnSecondaryLink: string
  btnSecondaryIcon: string
  btnPrimaryText: string
  btnPrimaryLink: string
  btnPrimaryIcon: string
}

const steps: StoryStep[] = [
  {
    id: 'step-laut',
    stepNumber: '01',
    alignment: 'right', // Card on right, persis Seafood Watch
    sectionTitle: 'Pilihan hasil laut Anda menentukan masa depan nelayan.',
    title: 'Memilih hasil laut segar berkualitas berawal dari sini.',
    body: 'Apa yang layak dibeli, apa yang harus dihindari, dan bagaimana memastikan ikan tetap segar tanpa formalin. Hasil tangkapan Laut Berkah Abadi berasal langsung dari nelayan pancing ulur Muncar di Selat Bali dan Samudra Hindia, dikawal rantai dingin tanpa putus sejak perahu merapat hingga tiba di dapur keluarga Anda.',
    mediaType: 'video',
    mediaSrc: 'https://www.seafoodwatch.org/globalassets/sfw/videos/homepage/school-of-jacks-1rf24.00.mp4#t=0.1',
    mediaPoster: 'https://cdn.ammarabufadhel.my.id/banners/banner-laut-selatbali-09d4359b.webp',
    badgeText: 'Perairan Selat Bali & Samudra Hindia',
    btnSecondaryText: 'Pelajari kemitraan nelayan kami',
    btnSecondaryLink: '#pilar-lba',
    btnSecondaryIcon: 'map',
    btnPrimaryText: 'Panduan mutu dan katalog segar',
    btnPrimaryLink: '/katalog',
    btnPrimaryIcon: 'menu_book'
  },
  {
    id: 'step-rantai-dingin',
    stepNumber: '02',
    alignment: 'left', // Alternating: Card on left
    sectionTitle: 'Rantai dingin presisi sejak detik pertama di air.',
    title: 'Menjaga suhu dingin 0-2°C sejak di atas perahu nelayan.',
    body: 'Kunci kesegaran ikan terbaik bukan pada kecepatan kirim, melainkan konsistensi suhu dingin. Saat ikan diangkat dari air, nelayan langsung memindahkannya ke palka ber-es curah 0°C. Di fasilitas cold storage Muncar, ikan diproses higienis dan jika dibekukan langsung masuk blast freezer -20°C agar serat daging tidak pecah.',
    mediaType: 'video',
    mediaSrc: 'https://www.seafoodwatch.org/globalassets/sfw/videos/homepage/aquaculture-fish-farming-7sec-1rf24.00.mp4#t=0.1',
    mediaPoster: 'https://cdn.ammarabufadhel.my.id/banners/banner-dermaga-muncar-2a28a9c6.webp',
    badgeText: 'Cold Storage Muncar 0°C – 2°C',
    btnSecondaryText: 'Standar ruang pendingin Muncar',
    btnSecondaryLink: '#panduan-mutu',
    btnSecondaryIcon: 'ac_unit',
    btnPrimaryText: 'Jadwal kirim subuh bergaransi',
    btnPrimaryLink: '/katalog',
    btnPrimaryIcon: 'schedule'
  },
  {
    id: 'step-kurasi',
    stepNumber: '03',
    alignment: 'right', // Alternating: Card on right
    sectionTitle: 'Mengenal mutu dan keaslian hasil laut Anda.',
    title: 'Transparansi timbangan digital dan edukasi rendemen netto.',
    body: 'Konsumen berhak tahu dari mana ikannya berasal, bagaimana cara penangkapannya, dan berapa berat bersih riil setelah disiangi. Setiap pesanan ditimbang digital secara transparan dengan foto slip timbang asli. Kami terbuka menjelaskan rumus rendemen: 85% untuk utuh siang dan 52% untuk fillet murni.',
    mediaType: 'image',
    mediaSrc: 'https://cdn.ammarabufadhel.my.id/products/asset-1544552866-03b7d7e3.webp',
    mediaPoster: 'https://cdn.ammarabufadhel.my.id/products/asset-1544552866-03b7d7e3.webp',
    badgeText: 'Kurasi Mutu & Timbangan Transparan',
    btnSecondaryText: 'Rumus rendemen timbangan netto',
    btnSecondaryLink: '#panduan-mutu',
    btnSecondaryIcon: 'scale',
    btnPrimaryText: 'Pesan ikan timbangan jujur',
    btnPrimaryLink: '/katalog',
    btnPrimaryIcon: 'shopping_bag'
  }
]

const activeIndex = ref(0)
const isVideoPaused = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const stepRefs = ref<HTMLElement[]>([])
const videoRefs = ref<(HTMLVideoElement | null)[]>([])

const togglePlayPause = () => {
  const currentVideo = videoRefs.value[activeIndex.value]
  if (!currentVideo) return

  if (currentVideo.paused) {
    currentVideo.play().then(() => {
      isVideoPaused.value = false
    }).catch(() => {})
  } else {
    currentVideo.pause()
    isVideoPaused.value = true
  }
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof window === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const indexAttr = entry.target.getAttribute('data-step-index')
          if (indexAttr !== null) {
            const newIndex = parseInt(indexAttr, 10)
            if (!isNaN(newIndex) && newIndex !== activeIndex.value) {
              activeIndex.value = newIndex
              updateVideoPlayback()
            }
          }
        }
      })
    },
    {
      root: null,
      rootMargin: '-25% 0px -25% 0px',
      threshold: 0.3
    }
  )

  stepRefs.value.forEach((el) => {
    if (el) observer?.observe(el)
  })

  updateVideoPlayback()
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

const updateVideoPlayback = () => {
  videoRefs.value.forEach((vid, idx) => {
    if (!vid) return
    if (idx === activeIndex.value) {
      if (!isVideoPaused.value) {
        vid.play().catch(() => {})
      }
    } else {
      vid.pause()
    }
  })
}
</script>

<template>
  <div ref="rootRef" class="relative w-full bg-slate-950 text-slate-900">

    <!-- 1. FULL-SCREEN 100vw x 100vh FIXED VIEWPORT MEDIA (PERSIS SEAFOOD WATCH .homepage-background) -->
    <div class="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <!-- Media Layer for Each Step with Cross-Fade Transitions -->
      <div
        v-for="(st, idx) in steps"
        :key="'full-media-' + st.id"
        class="absolute inset-0 transition-opacity duration-700 ease-in-out"
        :class="activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'"
      >
        <!-- Native Video Element filling entire 100vw x 100vh -->
        <video
          v-if="st.mediaType === 'video'"
          :ref="(el) => { if (el) videoRefs[idx] = el as HTMLVideoElement }"
          :src="st.mediaSrc"
          :poster="st.mediaPoster"
          autoplay
          loop
          muted
          playsinline
          preload="auto"
          class="w-full h-full object-cover"
        />

        <!-- High-res Image Fallback filling entire 100vw x 100vh -->
        <img
          v-else
          :src="st.mediaSrc"
          :alt="st.title"
          class="w-full h-full object-cover"
          loading="lazy"
        />

        <!-- Ambient overlay for text legibility -->
        <div class="absolute inset-0 bg-black/25 pointer-events-none" />
      </div>

      <!-- PAUSE / PLAY BUTTON AT BOTTOM LEFT (PERSIS SEAFOOD WATCH 'PAUSE' BUTTON) -->
      <div class="absolute bottom-10 left-8 sm:left-14 lg:left-20 z-20 pointer-events-auto">
        <button
          type="button"
          @click="togglePlayPause"
          class="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors cursor-pointer group"
          :aria-label="isVideoPaused ? 'Putar Video' : 'Jeda Video'"
        >
          <span class="material-symbols-outlined text-[20px] drop-shadow-md">
            {{ isVideoPaused ? 'play_arrow' : 'pause' }}
          </span>
          <span class="text-xs sm:text-sm font-bold tracking-widest uppercase drop-shadow-md">
            {{ isVideoPaused ? 'PLAY' : 'PAUSE' }}
          </span>
        </button>
      </div>
    </div>

    <!-- 2. SCROLLING STORY SECTIONS IN NORMAL FLOW (SLIDING OVER THE FIXED VIDEO) -->
    <div class="relative z-10 w-full">
      <div
        v-for="(st, idx) in steps"
        :key="'story-section-' + st.id"
        :ref="(el) => { if (el) stepRefs[idx] = el as HTMLElement }"
        :data-step-index="idx"
        class="min-h-[120vh] sm:min-h-[135vh] lg:min-h-[145vh] w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex items-center py-28 sm:py-36 md:py-48"
      >
        <!-- Card Container: Alternating position (Right aligned in Step 1 & 3, Left aligned in Step 2) -->
        <div
          class="w-full flex"
          :class="st.alignment === 'right' ? 'justify-end' : 'justify-start'"
        >
          <div class="w-full lg:w-[540px] xl:w-[600px] flex flex-col gap-4">

            <!-- SECTION HEADER TITLE (Persis Seafood Watch .homepage-section-title di atas kartu) -->
            <header class="flex flex-col gap-1">
              <span class="text-[11px] font-bold tracking-widest uppercase text-sky-300 drop-shadow-md">
                LANGKAH {{ st.stepNumber }} DARI 03
              </span>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                {{ st.sectionTitle }}
              </h2>
            </header>

            <!-- THE SEAFOOD WATCH MIST/WHITE FLOATING CARD (Persis Screenshot Seafood Watch) -->
            <div
              class="w-full bg-[#F5F5F5] text-slate-900 rounded-[4px] p-8 sm:p-10 md:p-12 shadow-2xl transition-all duration-500 flex flex-col gap-4 border border-white/60"
              :class="activeIndex === idx ? 'opacity-100 ring-1 ring-black/5' : 'opacity-95'"
            >
              <!-- Card Headline (22px - 26px clean bold font persis screenshot) -->
              <h3 class="text-xl sm:text-2xl md:text-[24px] font-bold text-slate-900 leading-snug tracking-tight">
                {{ st.title }}
              </h3>

              <!-- Card Body Paragraph (16px - 18px clean reading text persis screenshot) -->
              <p class="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {{ st.body }}
              </p>

              <!-- TWO BUTTONS (PERSIS SCREENSHOT SEAFOOD WATCH: 1 Outline Button + 1 Filled Solid Button) -->
              <div class="flex flex-col items-start gap-3 pt-2">
                <!-- Button 1: Outline Button with Icon (Learn how to partner with us) -->
                <NuxtLink
                  :to="st.btnSecondaryLink"
                  class="h-11 px-5 rounded-[2px] bg-white hover:bg-slate-50 border border-[#00629B] text-[#00629B] font-semibold text-xs sm:text-sm inline-flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-[18px]">
                    {{ st.btnSecondaryIcon }}
                  </span>
                  <span>{{ st.btnSecondaryText }}</span>
                </NuxtLink>

                <!-- Button 2: Solid Filled Blue Button with Icon (Seafood guides & tips for consumers) -->
                <NuxtLink
                  :to="st.btnPrimaryLink"
                  class="h-11 px-5 rounded-[2px] bg-[#00629B] hover:bg-[#004f7c] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <span class="material-symbols-outlined text-[18px]">
                    {{ st.btnPrimaryIcon }}
                  </span>
                  <span>{{ st.btnPrimaryText }}</span>
                </NuxtLink>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
