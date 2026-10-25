<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  images: {
    hero: string
    texture: string
    scaleSlip: string
  }
  productName: string
  landingPort?: string
}

const props = withDefaults(defineProps<Props>(), {
  landingPort: 'Pelabuhan Muncar Banyuwangi'
})

type GalleryView = 'hero' | 'texture' | 'scaleSlip'
const activeView = ref<GalleryView>('hero')

const activeImage = computed(() => {
  if (activeView.value === 'texture') return props.images.texture
  if (activeView.value === 'scaleSlip') return props.images.scaleSlip
  return props.images.hero
})

const viewNumber = computed(() => {
  if (activeView.value === 'texture') return 2
  if (activeView.value === 'scaleSlip') return 3
  return 1
})

const handleViewChange = (view: GalleryView) => {
  activeView.value = view
}
</script>

<template>
  <div class="flex flex-col gap-2.5 w-full">
    <!-- Main Hero Image Box with Origin & Perspective Overlays -->
    <div class="relative w-full h-72 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-xs group">
      <NuxtImg 
        :src="activeImage" 
        :alt="`${productName} (Tampilan ${viewNumber} dari 3)`" 
        class="w-full h-full object-cover transition-all duration-300"
        loading="eager"
        width="800"
        height="600"
        format="webp"
      />

      <!-- Perspective Counter Pill (Top-Right) -->
      <div class="absolute top-3 right-3 bg-[#002242]/85 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
        <span class="material-symbols-outlined text-[14px]">photo_camera</span>
        <span>{{ viewNumber }} / 3 Foto Riil Cold Chain</span>
      </div>

      <!-- Dock Origin Pill (Bottom-Left) -->
      <div class="absolute bottom-3 left-3 bg-[#002242]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md max-w-[85%]">
        <span class="material-symbols-outlined text-[#85f8c4] text-[16px]">anchor</span>
        <span class="text-xs font-medium tracking-wide truncate">Pendaratan {{ landingPort }}</span>
      </div>
    </div>

    <!-- 3-Thumbnail Perspective Selector Grid -->
    <div class="grid grid-cols-3 gap-2 w-full">
      <!-- Thumbnail 1: Utuh Segar -->
      <button 
        type="button" 
        @click="handleViewChange('hero')"
        class="relative h-18 sm:h-20 rounded-xl overflow-hidden border-2 transition-all focus:outline-none bg-white cursor-pointer"
        :class="activeView === 'hero' ? 'border-[#103860] ring-2 ring-[#103860]/20 shadow-xs' : 'border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300'"
        aria-label="Tampilkan Foto Ikan Utuh Segar"
      >
        <NuxtImg 
          :src="images.hero" 
          alt="Foto Utuh Segar" 
          class="w-full h-full object-cover"
          width="200"
          height="150"
          format="webp"
          loading="lazy"
        />
        <div class="absolute bottom-0 inset-x-0 bg-[#002242]/85 backdrop-blur-xs text-white text-[10px] font-semibold text-center py-0.5 truncate px-1">
          Utuh Segar
        </div>
      </button>

      <!-- Thumbnail 2: Tekstur Daging -->
      <button 
        type="button" 
        @click="handleViewChange('texture')"
        class="relative h-18 sm:h-20 rounded-xl overflow-hidden border-2 transition-all focus:outline-none bg-white cursor-pointer"
        :class="activeView === 'texture' ? 'border-[#103860] ring-2 ring-[#103860]/20 shadow-xs' : 'border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300'"
        aria-label="Tampilkan Foto Tekstur Daging Ikan"
      >
        <NuxtImg 
          :src="images.texture" 
          alt="Foto Tekstur Daging" 
          class="w-full h-full object-cover"
          width="200"
          height="150"
          format="webp"
          loading="lazy"
        />
        <div class="absolute bottom-0 inset-x-0 bg-[#002242]/85 backdrop-blur-xs text-white text-[10px] font-semibold text-center py-0.5 truncate px-1">
          Tekstur Daging
        </div>
      </button>

      <!-- Thumbnail 3: Timbangan Riil -->
      <button 
        type="button" 
        @click="handleViewChange('scaleSlip')"
        class="relative h-18 sm:h-20 rounded-xl overflow-hidden border-2 transition-all focus:outline-none bg-white cursor-pointer"
        :class="activeView === 'scaleSlip' ? 'border-[#103860] ring-2 ring-[#103860]/20 shadow-xs' : 'border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300'"
        aria-label="Tampilkan Foto Timbangan Riil Cold Hub"
      >
        <NuxtImg 
          :src="images.scaleSlip" 
          alt="Foto Timbangan Riil" 
          class="w-full h-full object-cover"
          width="200"
          height="150"
          format="webp"
          loading="lazy"
        /> 
          alt="Foto Timbangan Riil" 
          class="w-full h-full object-cover"
        />
        <div class="absolute bottom-0 inset-x-0 bg-[#002242]/85 backdrop-blur-xs text-white text-[10px] font-semibold text-center py-0.5 truncate px-1">
          Timbangan Riil
        </div>
      </button>
    </div>
  </div>
</template>
