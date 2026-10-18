<script setup lang="ts">
import { computed } from 'vue'
import type { ProductCutOption } from '~/data/products'
import type { CutType } from '~/stores/cart'

interface Props {
  cuts: ProductCutOption[]
  modelValue: CutType
  grossKg: number
}

const props = withDefaults(defineProps<Props>(), {
  grossKg: 1
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: CutType): void
}>()

const activeCut = computed(() => {
  return props.cuts.find(c => c.type === props.modelValue) || props.cuts[0]
})

const activeRatio = computed(() => {
  if (activeCut.value) return activeCut.value.yieldRatio
  if (props.modelValue === 'fillet_tanpa_kulit') return 0.52
  if (props.modelValue === 'steak_melintang') return 0.80
  return 0.85
})

const currentNetKg = computed(() => {
  return Number((props.grossKg * activeRatio.value).toFixed(2))
})

const currentNetGrams = computed(() => {
  return Math.round(props.grossKg * activeRatio.value * 1000)
})

const selectCut = (cutType: CutType) => {
  emit('update:modelValue', cutType)
}
</script>

<template>
  <div class="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col gap-3.5">
    <!-- Section Title & Free Prep Badge -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px] text-[#103860]">restaurant</span>
        <h2 class="text-sm font-bold text-[#103860]">Preparasi & Pilihan Potongan</h2>
      </div>
      <span class="text-xs font-semibold text-[#059669]">
        Bebas Biaya: Rp 0
      </span>
    </div>

    <!-- Cut Selection Options List -->
    <div class="flex flex-col gap-2.5">
      <label 
        v-for="cut in cuts" 
        :key="cut.type"
        @click="selectCut(cut.type)"
        class="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
        :class="modelValue === cut.type ? 'border-[#103860] bg-blue-50/40 shadow-xs' : 'border-slate-200 hover:bg-slate-50/80'"
      >
        <div class="flex items-center gap-3">
          <input 
            type="radio" 
            name="cutPreparation" 
            :value="cut.type" 
            :checked="modelValue === cut.type"
            @change="selectCut(cut.type)"
            class="text-[#103860] focus:ring-[#103860] w-4 h-4 cursor-pointer"
          />
          <div class="flex flex-col">
            <span class="text-sm font-bold text-[#103860] leading-snug">{{ cut.label }}</span>
            <span class="text-xs text-slate-500 leading-normal">{{ cut.description }}</span>
          </div>
        </div>

        <div class="text-right flex-shrink-0 ml-2">
          <span class="text-xs font-semibold text-[#059669]">
            ~{{ Math.round(grossKg * cut.yieldRatio * 1000) }}g ({{ Math.round(cut.yieldRatio * 100) }}%)
          </span>
        </div>
      </label>
    </div>

    <!-- Real-Time Rendemen Calculator Box -->
    <div class="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-3.5 flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-600 font-medium">Timbangan Kotor Awal (Cold Hub):</span>
        <span class="font-bold text-[#103860]">{{ grossKg }} kg kotor</span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-600 font-medium">Rasio Rendemen Daging ({{ activeCut?.label || 'Potongan' }}):</span>
        <span class="font-bold text-[#059669]">{{ Math.round(activeRatio * 100) }}% bersih</span>
      </div>
      <div class="pt-2 border-t border-slate-200/80 flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-700">Estimasi Daging Bersih Siap Masak:</span>
        <span class="text-sm font-bold text-[#059669]">
          ~{{ currentNetGrams.toLocaleString('id-ID') }} gram ({{ currentNetKg.toLocaleString('id-ID') }} kg)
        </span>
      </div>
    </div>
  </div>
</template>
