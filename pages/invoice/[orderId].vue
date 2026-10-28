<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: false // Standalone clean layout without navbar/footer clutter
})

useHead({
  title: 'Invoice Resmi Bukti Pembayaran | Laut Berkah Abadi Banyuwangi'
})

const route = useRoute()
const router = useRouter()
const orderId = computed(() => String(route.params.orderId || ''))

const order = ref<any>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const loadInvoiceData = async () => {
  if (!orderId.value) return
  isLoading.value = true
  errorMessage.value = null
  try {
    const api = useApi()
    const target = orderId.value
    // Fetch order details via tracking or direct endpoint
    const res = await api.get<any>(`/orders/track/${target}`).catch(async () => {
      return await api.get<any>(`/orders/${target}`).catch(() => null)
    })
    if (res) {
      order.value = res
      if (route.query.download === '1' || route.query.download === 'true') {
        setTimeout(() => {
          handlePrint()
        }, 600)
      }
    } else {
      errorMessage.value = 'Dokumen pesanan tidak ditemukan di pangkalan data.'
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.detail || err?.message || 'Gagal memuat dokumen invoice resmi.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadInvoiceData()
})

const handlePrint = () => {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/pesanan')
  }
}

const formatRupiah = (val?: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0)
}

const formatDate = (isoString?: string) => {
  if (!isoString) return '-'
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(d)
  } catch {
    return isoString
  }
}

const invoiceNumber = computed(() => {
  const ordNum = order.value?.order_number || orderId.value || 'LBA'
  const datePart = order.value?.created_at ? order.value.created_at.slice(0, 10).replace(/-/g, '') : '20261028'
  return `INV/LBA/${datePart}/${ordNum}`
})

const packagingLabel = computed(() => {
  const pack = order.value?.packaging_type
  if (pack === 'styrofoam_box') return 'Box Styrofoam Segel + 4 Ice Gel + Flake Ice (Tahan 24 Jam)'
  return 'Thermal Bag Insulasi Tebal + 2 Ice Gel Food-Grade (Tahan 8 Jam)'
})

const resolvedPaymentMethodTitle = computed(() => {
  const bank = (order.value?.payment_bank || order.value?.payment_type || '').toUpperCase()
  if (bank.includes('BCA')) return 'BCA Virtual Account (Midtrans)'
  if (bank.includes('BNI')) return 'BNI Virtual Account (Midtrans)'
  if (bank.includes('BRI')) return 'BRI Virtual Account (Midtrans)'
  if (bank.includes('MANDIRI')) return 'Mandiri Bill / E-Channel (Midtrans)'
  if (bank.includes('PERMATA')) return 'Permata Virtual Account (Midtrans)'
  if (bank.includes('QRIS')) return 'QRIS Dinamis Bank Indonesia'
  return `Transfer ${bank || 'Midtrans Online'}`
})

const qrVerificationUrl = computed(() => {
  const num = order.value?.order_number || orderId.value
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`https://lautberkahabadi.com/invoice/${num}`)}`
})
</script>

<template>
  <div class="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased py-4 sm:py-8 px-2 sm:px-4">
    <!-- Action Toolbar (Hidden during print) -->
    <div class="max-w-4xl mx-auto mb-4 flex items-center justify-between gap-3 print:hidden">
      <button
        type="button"
        @click="goBack"
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Kembali</span>
      </button>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handlePrint"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#103860] hover:bg-[#13446E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <span class="material-symbols-outlined text-[18px]">print</span>
          <span>Cetak Dokumen / Simpan PDF</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-4xl mx-auto bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
      <div class="inline-block w-8 h-8 border-3 border-slate-200 border-t-[#103860] rounded-full animate-spin mb-3"></div>
      <p class="text-xs font-bold text-slate-600">Memuat berkas invoice resmi...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage || !order" class="max-w-4xl mx-auto bg-white rounded-2xl p-8 text-center border border-red-200 shadow-xs space-y-3">
      <span class="material-symbols-outlined text-4xl text-red-500">error</span>
      <h2 class="text-sm font-bold text-slate-900">Invoice Tidak Ditemukan</h2>
      <p class="text-xs text-slate-600">{{ errorMessage || 'Gagal memuat dokumen pesanan.' }}</p>
      <NuxtLink to="/pesanan" class="inline-block px-4 py-2 bg-[#103860] text-white text-xs font-bold rounded-xl">
        Kembali ke Pesanan Saya
      </NuxtLink>
    </div>

    <!-- Main Printable Paper Sheet (A4 Standard) -->
    <div v-else class="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:rounded-none">
      
      <!-- 1. Header & Letterhead (Kop Surat Resmi) -->
      <div class="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2 border-slate-900">
        <!-- Brand & Company Credentials -->
        <div class="flex items-start gap-3.5">
          <img
            src="/brand/logo.webp"
            alt="Laut Berkah Abadi"
            class="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl border border-slate-100 shadow-2xs shrink-0"
          />
          <div class="flex flex-col">
            <h1 class="text-lg sm:text-xl font-black text-[#103860] tracking-tight leading-none uppercase">
              Laut Berkah Abadi
            </h1>
            <span class="text-[11px] font-bold text-slate-600 mt-1">
              Fasilitas Cold Storage & Pengolahan Ikan Segar Muncar
            </span>
            <p class="text-[10px] text-slate-500 mt-0.5 leading-relaxed max-w-sm">
              Dermaga Pelabuhan Perikanan Pantai Muncar, Selat Bali, Banyuwangi, Jawa Timur 68472<br />
              WhatsApp: +62 812-3456-7890 • Website: lautberkahabadi.com
            </p>
          </div>
        </div>

        <!-- Document Identifier & Official Stamp -->
        <div class="flex flex-col items-start sm:items-end text-left sm:text-right shrink-0">
          <span class="text-[10px] font-extrabold uppercase tracking-widest text-[#103860] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Faktur Resmi & Bukti Pembayaran
          </span>
          <span class="font-mono text-sm sm:text-base font-extrabold text-slate-900 mt-1.5">
            {{ invoiceNumber }}
          </span>
          <div class="text-[10px] text-slate-500 mt-1 space-y-0.5">
            <div>Waktu Pesan: <span class="font-semibold text-slate-700">{{ formatDate(order.created_at) }}</span></div>
            <div>Waktu Lunas: <span class="font-semibold text-emerald-700">{{ formatDate(order.paid_at || order.updated_at) }}</span></div>
          </div>
        </div>
      </div>

      <!-- 2. Status Stamp & Delivery Profile (2 Kolom) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-200">
        <!-- Kolom Kiri: Profil Pembeli & Alamat Kirim -->
        <div class="flex flex-col gap-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tujuan Pengiriman & Penerima:</span>
          <div class="flex flex-col text-xs text-slate-700 space-y-1">
            <span class="font-bold text-sm text-slate-900">
              {{ order.recipient_name || 'Pelanggan Terdaftar LBA' }}
            </span>
            <div class="text-slate-600 font-mono text-[11px]">
              {{ order.recipient_phone || '-' }}
            </div>
            <p class="text-slate-600 leading-relaxed text-[11px] pt-1">
              {{ order.address_detail || order.street || '-' }}<br />
              <span v-if="order.subdistrict_name || order.district_name || order.city_name">
                {{ [order.subdistrict_name, order.district_name, order.city_name, order.province_name].filter(Boolean).join(', ') }}
              </span>
            </p>
            <div v-if="order.latitude && order.longitude" class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 pt-0.5">
              <span class="material-symbols-outlined text-[13px]">location_on</span>
              <span>Koordinat GPS Terverifikasi Presisi ({{ order.latitude }}, {{ order.longitude }})</span>
            </div>
            <div v-if="order.courier_notes" class="text-[10px] bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-slate-600 mt-1">
              <strong>Catatan Pengantaran:</strong> {{ order.courier_notes }}
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Spesifikasi Logistik Rantai Dingin & Stempel Lunas -->
        <div class="flex flex-col justify-between gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spesifikasi Rantai Dingin (Cold Chain):</span>
            <div class="flex flex-col gap-1.5 text-xs text-slate-700">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Jadwal Tiba:</span>
                <span class="font-bold text-[#103860]">{{ order.delivery_slot || 'Slot Pagi (06:00 - 08:30 WIB)' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Insulasi Kemasan:</span>
                <span class="font-medium text-slate-800 text-right max-w-[220px]">{{ packagingLabel }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Intake Cold Room:</span>
                <span class="font-bold text-blue-700">-20°C Terkontrol Presisi</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Kanal Pembayaran:</span>
                <span class="font-bold text-slate-800">{{ resolvedPaymentMethodTitle }}</span>
              </div>
            </div>
          </div>

          <!-- Stempel Digital LUNAS (Official Paid Seal Stamp) -->
          <div class="self-start sm:self-end mt-2">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 text-emerald-800 font-extrabold uppercase tracking-widest text-xs shadow-xs transform rotate-[-2deg]">
              <span class="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
              <div class="flex flex-col items-start leading-tight">
                <span class="text-[13px] font-black tracking-wider text-emerald-900">LUNAS / VERIFIED</span>
                <span class="text-[9px] font-bold text-emerald-700 normal-case">Otomatis Terverifikasi Midtrans</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Tabel Item Komoditas Laut (Itemized Catch-Weight Bill) -->
      <div class="py-6">
        <h2 class="text-xs font-bold uppercase tracking-wider text-[#103860] mb-3">
          Rincian Komoditas Hasil Laut Presisi:
        </h2>
        
        <div class="border border-slate-200 rounded-xl overflow-hidden">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <th class="py-2.5 px-3 text-center w-10">No</th>
                <th class="py-2.5 px-3">Komoditas & Potongan</th>
                <th class="py-2.5 px-3 text-right">Timbang Basah</th>
                <th class="py-2.5 px-3 text-right">Estimasi Netto</th>
                <th class="py-2.5 px-3 text-right">Harga Satuan</th>
                <th class="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-800">
              <tr
                v-for="(it, idx) in (order.items || [])"
                :key="idx"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">{{ idx + 1 }}</td>
                <td class="py-3 px-3">
                  <div class="font-bold text-slate-900">{{ it.product_name || 'Ikan Laut Segar' }}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">
                    Potongan: <strong class="text-slate-700">{{ it.cut_type || 'Utuh Bersih' }}</strong>
                    <span v-if="it.soup_bones_separated" class="ml-1 text-emerald-700 font-semibold">• Kepala & Tulang Sup Dipisah</span>
                  </div>
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold text-slate-800">
                  {{ it.gross_weight }} kg
                </td>
                <td class="py-3 px-3 text-right font-mono text-slate-600">
                  {{ it.estimated_net_weight ? `${it.estimated_net_weight} kg` : '~' }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-slate-700">
                  {{ formatRupiah(it.price_per_kg) }}
                </td>
                <td class="py-3 px-3 text-right font-mono font-extrabold text-[#103860]">
                  {{ formatRupiah(it.subtotal) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Ringkasan Finansial (Financial Summary) -->
      <div class="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4 pb-6 border-b border-slate-200">
        <!-- Jaminan Mutu & Catatan Penting -->
        <div class="flex flex-col gap-2 max-w-sm text-[11px] text-slate-600 leading-relaxed">
          <div class="font-bold text-[#103860] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>Jaminan Kesegaran Mutu Pelabuhan Muncar</span>
          </div>
          <p class="text-slate-500">
            Seluruh komoditas dibeli langsung dari nelayan pancing ulur Muncar dan dibekukan cepat. Simpan segera pada freezer suhu minimal -18°C apabila belum langsung diolah untuk menjaga kelezatan alami daging.
          </p>
        </div>

        <!-- Breakdown Angka Finansial -->
        <div class="w-full sm:w-72 flex flex-col gap-2 text-xs">
          <div class="flex items-center justify-between text-slate-600">
            <span>Subtotal Produk:</span>
            <span class="font-mono font-bold text-slate-800">{{ formatRupiah(order.subtotal_amount || order.total_amount) }}</span>
          </div>

          <div class="flex items-center justify-between text-slate-600">
            <span>Kemasan Rantai Dingin:</span>
            <span class="font-mono text-slate-800">{{ formatRupiah(order.packaging_fee || 0) }}</span>
          </div>

          <div class="flex items-center justify-between text-slate-600">
            <span>Ongkos Kirim Armada Dingin:</span>
            <span class="font-mono text-slate-800">{{ formatRupiah(order.shipping_fee || order.shipping_cost || 0) }}</span>
          </div>

          <div class="flex items-center justify-between text-emerald-700 font-semibold text-[11px]">
            <span>Gratis Ongkir Rute Lokal:</span>
            <span class="font-mono">-{{ formatRupiah(order.shipping_fee || order.shipping_cost || 0) }}</span>
          </div>

          <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span class="font-bold text-slate-900 text-sm">Total Lunas:</span>
            <span class="font-mono font-black text-lg text-emerald-700">
              {{ formatRupiah(order.grand_total || order.total_amount) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 5. Tanda Tangan Digital & Verifikasi QR Code -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <!-- QR Code Bukti Otentikasi -->
        <div class="flex items-center gap-3">
          <img
            :src="qrVerificationUrl"
            alt="QR Code Verifikasi Resmi"
            class="w-20 h-20 border border-slate-200 rounded-lg p-1 bg-white shrink-0"
          />
          <div class="flex flex-col text-[10px]">
            <span class="font-bold text-slate-800 text-[11px]">Verifikasi Dokumen Elektronik</span>
            <span class="text-slate-500">Scan QR Code untuk memeriksa keaslian bukti bayar di peladen resmi LBA Muncar.</span>
            <span class="font-mono text-slate-400 mt-1">Status: CERTIFIED COMPLETED</span>
          </div>
        </div>

        <!-- Otorisasi Manajemen Mutu -->
        <div class="flex flex-col items-center sm:items-end text-center sm:text-right">
          <span class="text-[10px] text-slate-400">Diverifikasi & Diterbitkan Secara Otomatis:</span>
          <div class="font-extrabold text-[#103860] text-xs mt-1">
            Divisi Operasional & Rantai Dingin
          </div>
          <span class="text-[10px] font-bold text-slate-700">Laut Berkah Abadi Banyuwangi</span>
          <span class="text-[9px] text-slate-400 mt-0.5">Dokumen ini sah dan diterbitkan tanpa memerlukan tanda tangan basah.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  body {
    background-color: #ffffff !important;
    color: #0f172a !important;
  }
  @page {
    size: A4;
    margin: 12mm;
  }
}
</style>
