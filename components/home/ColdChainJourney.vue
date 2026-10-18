<script setup lang="ts">
const steps = [
  {
    time: '04:30 WIB',
    tag: 'Dermaga Muncar',
    title: 'Pendaratan Subuh',
    desc: 'Kapal pancing ulur sandar langsung di TPI Higienis Muncar tanpa perantara.',
    icon: 'sailing'
  },
  {
    time: '05:15 WIB',
    tag: 'Laboratorium QC',
    title: 'Uji Mutu & Cold Hub -20°C',
    desc: 'Inspeksi kesegaran mata, insang merah, dan perendaman es curah higienis.',
    icon: 'ac_unit'
  },
  {
    time: '06:00 WIB',
    tag: 'Armada Berinsulasi',
    title: 'Pengantaran Siap Masak',
    desc: 'Dikirim dengan thermal bag berpendingin, tiba segar sebelum jam makan siang.',
    icon: 'local_shipping'
  }
]
</script>

<template>
  <section class="bg-gradient-to-b from-slate-50/60 to-white border-y border-slate-200/70 py-6 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-2">
        <div>
          <div class="flex items-center gap-1.5 text-xs font-bold text-[#059669] tracking-wider uppercase">
            <span class="inline-block w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
            Protokol 4 Jam Dari Laut
          </div>
          <h2 class="text-base md:text-lg font-bold text-[#103860] mt-0.5">
            Jalur Cepat Tangkapan Muncar ke Dapur Anda
          </h2>
        </div>
        <p class="text-xs text-slate-500 max-w-sm">
          Menjaga kesegaran alami selat Bali tanpa bahan kimia pengawet dan tanpa jeda suhu.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          class="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-3 shadow-2xs hover:border-[#103860]/40 transition"
        >
          <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#103860] shrink-0 border border-slate-200/60">
            <span class="material-symbols-outlined text-[20px]">{{ step.icon }}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold text-[#103860] bg-slate-100 px-1.5 py-0.5 rounded">{{ step.time }}</span>
              <span class="text-[10px] text-slate-400 font-medium truncate">{{ step.tag }}</span>
            </div>
            <h3 class="text-xs font-bold text-slate-800 mt-1 leading-tight">{{ step.title }}</h3>
            <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
