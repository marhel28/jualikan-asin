<script setup lang="ts">
interface Props {
  coldRoomTemp?: number
  chilledRoomTemp?: number
  dockTime?: string
  dockLocation?: string
}

withDefaults(defineProps<Props>(), {
  coldRoomTemp: -20,
  chilledRoomTemp: 1.5,
  dockTime: '05:30 WIB',
  dockLocation: 'Pelabuhan Muncar'
})
</script>

<template>
  <div class="bg-[#103860]/10 border border-[#103860]/20 rounded-xl p-3 flex items-center gap-3 shadow-xs">
    <!-- Animated Pulsing Radar Dot -->
    <div class="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
      <div class="w-3 h-3 rounded-full bg-[#059669] animate-ping absolute opacity-75"></div>
      <div class="w-2.5 h-2.5 rounded-full bg-[#059669] relative"></div>
    </div>

    <!-- Telemetry Readings -->
    <div class="flex flex-col">
      <span class="text-xs font-bold text-[#103860] flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">thermostat</span>
        Cold Room Muncar: {{ coldRoomTemp }}°C | Chilled Room: {{ chilledRoomTemp }}°C
      </span>
      <span class="text-xs text-slate-600 font-medium">
        Stok Baru Mendarat {{ dockTime }} dari {{ dockLocation }}
      </span>
    </div>
  </div>
</template>

