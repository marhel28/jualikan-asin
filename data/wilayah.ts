export interface WilayahItem {
  kode: string
  nama: string
}

// Hierarchical Indonesian Administrative Region Dataset conforming to wilayah_2022 format
// 2 chars = Provinsi, 5 chars = Kabupaten/Kota, 8 chars = Kecamatan, 13 chars = Desa/Kelurahan
export const WILAYAH_DATA: WilayahItem[] = [
  // --- PROVINSI (len 2) ---
  { kode: '35', nama: 'JAWA TIMUR' },
  { kode: '51', nama: 'BALI' },
  { kode: '31', nama: 'DKI JAKARTA' },
  { kode: '32', nama: 'JAWA BARAT' },
  { kode: '33', nama: 'JAWA TENGAH' },

  // --- KABUPATEN / KOTA (len 5, prefix 2 + '.') ---
  // Jawa Timur (35)
  { kode: '35.10', nama: 'KAB. BANYUWANGI' },
  { kode: '35.78', nama: 'KOTA SURABAYA' },
  { kode: '35.07', nama: 'KAB. MALANG' },
  { kode: '35.09', nama: 'KAB. JEMBER' },
  { kode: '35.15', nama: 'KAB. SIDOARJO' },
  // Bali (51)
  { kode: '51.71', nama: 'KOTA DENPASAR' },
  { kode: '51.03', nama: 'KAB. BADUNG' },
  // DKI Jakarta (31)
  { kode: '31.71', nama: 'KOTA JAKARTA SELATAN' },
  { kode: '31.72', nama: 'KOTA JAKARTA TIMUR' },

  // --- KECAMATAN (len 8, prefix 5 + '.') ---
  // Banyuwangi (35.10)
  { kode: '35.10.10', nama: 'MUNCAR' },
  { kode: '35.10.19', nama: 'BANYUWANGI' },
  { kode: '35.10.11', nama: 'ROGOJAMPI' },
  { kode: '35.10.13', nama: 'GENTENG' },
  { kode: '35.10.09', nama: 'CLURING' },
  // Surabaya (35.78)
  { kode: '35.78.01', nama: 'WONOKROMO' },
  { kode: '35.78.02', nama: 'GUBENG' },
  { kode: '35.78.13', nama: 'RUNGKUT' },
  // Malang (35.07)
  { kode: '35.07.18', nama: 'KEPANJEN' },
  { kode: '35.07.24', nama: 'SINGOSARI' },
  // Jember (35.09)
  { kode: '35.09.21', nama: 'SUMBERSARI' },
  { kode: '35.09.19', nama: 'PATRANG' },
  // Sidoarjo (35.15)
  { kode: '35.15.11', nama: 'WARU' },
  { kode: '35.15.08', nama: 'SIDOARJO' },
  // Denpasar (51.71)
  { kode: '51.71.01', nama: 'DENPASAR SELATAN' },
  { kode: '51.71.02', nama: 'DENPASAR TIMUR' },
  // Badung (51.03)
  { kode: '51.03.01', nama: 'KUTA' },
  { kode: '51.03.05', nama: 'KUTA UTARA' },
  // Jakarta Selatan (31.71)
  { kode: '31.71.01', nama: 'TEBET' },
  { kode: '31.71.03', nama: 'KEBAYORAN BARU' },
  // Jakarta Timur (31.72)
  { kode: '31.72.01', nama: 'MATRAMAN' },
  { kode: '31.72.04', nama: 'JATINEGARA' },

  // --- DESA / KELURAHAN (len 13, prefix 8 + '.') ---
  // Muncar (35.10.10)
  { kode: '35.10.10.2001', nama: 'KEDUNGREJO' },
  { kode: '35.10.10.2002', nama: 'TEMBOKREJO' },
  { kode: '35.10.10.2003', nama: 'SUMBERSEWU' },
  { kode: '35.10.10.2004', nama: 'KEDUNGASRI' },
  { kode: '35.10.10.2005', nama: 'KUMENDUNG' },
  // Banyuwangi Kota (35.10.19)
  { kode: '35.10.19.1001', nama: 'KEPALEN' },
  { kode: '35.10.19.1002', nama: 'PANDEREJO' },
  { kode: '35.10.19.1003', nama: 'TAMANBARU' },
  { kode: '35.10.19.1004', nama: 'TUKANGKAYU' },
  // Rogojampi (35.10.11)
  { kode: '35.10.11.2001', nama: 'ROGOJAMPI' },
  { kode: '35.10.11.2002', nama: 'GITIK' },
  { kode: '35.10.11.2003', nama: 'KEDALEMAN' },
  // Genteng (35.10.13)
  { kode: '35.10.13.2001', nama: 'GENTENGKULON' },
  { kode: '35.10.13.2002', nama: 'GENTENGWETAN' },
  // Cluring (35.10.09)
  { kode: '35.10.09.2001', nama: 'BENCULUK' },
  { kode: '35.10.09.2002', nama: 'CLURING' },
  // Wonokromo (35.78.01)
  { kode: '35.78.01.1001', nama: 'DARMO' },
  { kode: '35.78.01.1002', nama: 'SAWAHAN' },
  // Gubeng (35.78.02)
  { kode: '35.78.02.1001', nama: 'AIRLANGGA' },
  { kode: '35.78.02.1002', nama: 'BARATA JAYA' },
  // Rungkut (35.78.13)
  { kode: '35.78.13.1001', nama: 'RUNGKUT KIDUL' },
  { kode: '35.78.13.1002', nama: 'MEDOKAN AYU' },
  // Kepanjen (35.07.18)
  { kode: '35.07.18.1001', nama: 'KEPANJEN' },
  { kode: '35.07.18.2002', nama: 'CEPOKOLYOM' },
  // Singosari (35.07.24)
  { kode: '35.07.24.1001', nama: 'PAGENTAN' },
  { kode: '35.07.24.2002', nama: 'CANDIRENGGO' },
  // Sumbersari (35.09.21)
  { kode: '35.09.21.1001', nama: 'KRANJINGAN' },
  { kode: '35.09.21.1002', nama: 'SUMBERSARI' },
  // Patrang (35.09.19)
  { kode: '35.09.19.1001', nama: 'JEMBERLOR' },
  { kode: '35.09.19.1002', nama: 'PATRANG' },
  // Waru (35.15.11)
  { kode: '35.15.11.2001', nama: 'BERBEK' },
  { kode: '35.15.11.2002', nama: 'KUREKSARI' },
  // Sidoarjo Kota (35.15.08)
  { kode: '35.15.08.1001', nama: 'SIDOKUMPUL' },
  { kode: '35.15.08.1002', nama: 'LEMAHPUTRO' },
  // Denpasar Selatan (51.71.01)
  { kode: '51.71.01.1001', nama: 'SANUR' },
  { kode: '51.71.01.1002', nama: 'SIDAKARYA' },
  // Denpasar Timur (51.71.02)
  { kode: '51.71.02.1001', nama: 'KESIMAN' },
  { kode: '51.71.02.1002', nama: 'SUMERTA' },
  // Kuta (51.03.01)
  { kode: '51.03.01.1001', nama: 'KUTA' },
  { kode: '51.03.01.1002', nama: 'LEGIAN' },
  // Kuta Utara (51.03.05)
  { kode: '51.03.05.1001', nama: 'CANGGU' },
  { kode: '51.03.05.1002', nama: 'KEROBOKAN' },
  // Tebet (31.71.01)
  { kode: '31.71.01.1001', nama: 'TEBET BARAT' },
  { kode: '31.71.01.1002', nama: 'TEBET TIMUR' },
  // Kebayoran Baru (31.71.03)
  { kode: '31.71.03.1001', nama: 'SELONG' },
  { kode: '31.71.03.1002', nama: 'GUNUNG' },
  // Matraman (31.72.01)
  { kode: '31.72.01.1001', nama: 'PALMERIAM' },
  { kode: '31.72.01.1002', nama: 'KEBON MANGGIS' },
  // Jatinegara (31.72.04)
  { kode: '31.72.04.1001', nama: 'BALI MESTER' },
  { kode: '31.72.04.1002', nama: 'KAMPUNG MELAYU' }
]

// Query helper matching myroot593/Alamat SQL logic:
// SELECT kode, nama FROM wilayah_2022 WHERE LEFT(kode, n) = parent AND CHAR_LENGTH(kode) = target_len
export const getProvinces = (): WilayahItem[] => {
  return WILAYAH_DATA.filter(item => item.kode.length === 2)
}

export const getCities = (provCode: string): WilayahItem[] => {
  if (!provCode) return []
  return WILAYAH_DATA.filter(item => item.kode.startsWith(provCode + '.') && item.kode.length === 5)
}

export const getDistricts = (cityCode: string): WilayahItem[] => {
  if (!cityCode) return []
  return WILAYAH_DATA.filter(item => item.kode.startsWith(cityCode + '.') && item.kode.length === 8)
}

export const getVillages = (districtCode: string): WilayahItem[] => {
  if (!districtCode) return []
  return WILAYAH_DATA.filter(item => item.kode.startsWith(districtCode + '.') && item.kode.length === 13)
}

export const getWilayahName = (code: string): string => {
  return WILAYAH_DATA.find(item => item.kode === code)?.nama || ''
}
