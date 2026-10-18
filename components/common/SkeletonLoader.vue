<script setup lang="ts">
interface Props {
  type?: 'card' | 'row' | 'telemetry' | 'timeline'
  count?: number
}

withDefaults(defineProps<Props>(), {
  type: 'card',
  count: 1
})
</script>

<template>
  <div class="w-full">
    <!-- 1. Catalog Product Card Grid Skeleton -->
    <div v-if="type === 'card'" class="grid grid-cols-2 gap-3 w-full">
      <div 
        v-for="i in count" 
        :key="i" 
        class="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs animate-pulse flex flex-col justify-between"
      >
        <!-- Image placeholder -->
        <div class="h-36 w-full bg-slate-200 relative">
          <div class="absolute top-2 left-2 h-4 w-20 rounded-full bg-slate-300"></div>
        </div>

        <!-- Card Body -->
        <div class="p-3 flex flex-col gap-2">
          <!-- Species title -->
          <div class="h-4 w-3/4 rounded bg-slate-200"></div>
          <div class="h-3 w-1/2 rounded bg-slate-100"></div>

          <!-- Yield Pill -->
          <div class="h-4 w-24 rounded-full bg-slate-200 mt-1"></div>

          <!-- Price & Button -->
          <div class="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
            <div class="h-5 w-20 rounded bg-slate-200"></div>
            <div class="w-8 h-8 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Cart / Order Row Item Skeleton -->
    <div v-else-if="type === 'row'" class="flex flex-col gap-3 w-full">
      <div 
        v-for="i in count" 
        :key="i" 
        class="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3.5 shadow-xs animate-pulse"
      >
        <!-- Thumbnail placeholder -->
        <div class="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0"></div>

        <!-- Item Details -->
        <div class="flex-1 flex flex-col gap-1.5">
          <div class="h-4 w-40 rounded bg-slate-200"></div>
          <div class="h-3 w-28 rounded bg-slate-100"></div>
          <div class="h-4 w-24 rounded bg-slate-200 mt-1"></div>
        </div>

        <!-- Quantity / Action placeholder -->
        <div class="w-16 h-8 rounded-lg bg-slate-200 flex-shrink-0"></div>
      </div>
    </div>

    <!-- 3. Telemetry Pill Skeleton -->
    <div v-else-if="type === 'telemetry'" class="w-full">
      <div class="bg-slate-200/60 border border-slate-200 rounded-xl p-3 flex items-center gap-3 animate-pulse">
        <div class="w-3 h-3 rounded-full bg-slate-300 flex-shrink-0"></div>
        <div class="flex flex-col gap-1.5 flex-1">
          <div class="h-3.5 w-52 rounded bg-slate-300"></div>
          <div class="h-3 w-40 rounded bg-slate-200"></div>
        </div>
      </div>
    </div>

    <!-- 4. 5-Stage Cold Chain Timeline Skeleton -->
    <div v-else-if="type === 'timeline'" class="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col gap-4 animate-pulse">
      <div class="h-4 w-48 rounded bg-slate-300"></div>
      <div class="flex flex-col gap-4 mt-2">
        <div v-for="i in 5" :key="i" class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0"></div>
          <div class="flex-1 flex flex-col gap-1">
            <div class="h-3.5 w-3/4 rounded bg-slate-200"></div>
            <div class="h-2.5 w-1/2 rounded bg-slate-100"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

