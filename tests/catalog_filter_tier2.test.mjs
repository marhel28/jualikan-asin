import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTS } from '../data/products.ts'

describe('Catalog Filter Tier 2 Synchronization', () => {
  // Filter logic replicate from katalog.vue
  function filterByCut(products, cutType) {
    if (!cutType) return products

    if (cutType === 'utuh_bersih') {
      return products.filter(p => {
        const hasTier2 = p.customVariants?.tier2?.enabled && p.customVariants.tier2.options?.some(o =>
          /utuh|siang/i.test(o.label || '')
        )
        const hasCut = p.availableCuts?.some(c =>
          c.type === 'utuh_bersih' || /utuh|siang/i.test(c.label || '')
        )
        return Boolean(hasTier2 || hasCut)
      })
    }

    if (cutType === 'fillet') {
      return products.filter(p => {
        const isCat = p.category?.toLowerCase() === 'fillet'
        const hasTier2 = p.customVariants?.tier2?.enabled && p.customVariants.tier2.options?.some(o =>
          /fillet|kulit|duri/i.test(o.label || '')
        )
        const hasCut = p.availableCuts?.some(c =>
          c.type === 'fillet_tanpa_kulit' || /fillet/i.test(c.label || '')
        )
        return Boolean(isCat || hasTier2 || hasCut)
      })
    }

    if (cutType === 'steak') {
      return products.filter(p => {
        const isCat = p.category?.toLowerCase() === 'steak'
        const hasTier2 = p.customVariants?.tier2?.enabled && p.customVariants.tier2.options?.some(o =>
          /steak/i.test(o.label || '')
        )
        const hasCut = p.availableCuts?.some(c =>
          c.type === 'steak_melintang' || /steak/i.test(c.label || '')
        )
        return Boolean(isCat || hasTier2 || hasCut)
      })
    }

    return products
  }

  test('Filter utuh_bersih matches products with utuh_bersih cut or Tier 2 utuh/siang', () => {
    const matched = filterByCut(PRODUCTS, 'utuh_bersih')
    assert.ok(matched.length > 0, 'Harus menemukan produk utuh bersih')
    const lemuru = matched.find(p => p.id === 'lemuru-segar')
    assert.ok(lemuru, 'Lemuru segar harus cocok dengan utuh bersih')
  })

  test('Filter fillet matches products with fillet_tanpa_kulit, category fillet, or Tier 2 fillet', () => {
    const matched = filterByCut(PRODUCTS, 'fillet')
    assert.ok(matched.length > 0, 'Harus menemukan produk fillet')
    const baronang = matched.find(p => p.id === 'baronang-tulis')
    assert.ok(baronang, 'Fillet Baronang harus cocok dengan filter fillet')
  })

  test('Filter steak matches products with steak_melintang, category steak, or Tier 2 steak', () => {
    const matched = filterByCut(PRODUCTS, 'steak')
    assert.ok(matched.length > 0, 'Harus menemukan produk steak')
    const yellowfin = matched.find(p => p.id === 'steak-tuna-yellowfin')
    assert.ok(yellowfin, 'Steak Yellowfin harus cocok dengan filter steak')
  })

  test('Dashboard Tier 2 enabled options are respected during cut filtering', () => {
    const sampleProductWithTier2 = {
      id: 'custom-snapper',
      name: 'Kakap Spesial Muncar',
      availableCuts: [],
      customVariants: {
        tier2: {
          enabled: true,
          name: 'Jenis Potongan',
          options: [
            { id: 'p-1', label: 'Utuh Bersih Siang', priceDelta: 0, inStock: true },
            { id: 'p-2', label: 'Fillet Tanpa Duri', priceDelta: 5000, inStock: true }
          ]
        }
      }
    }

    const testList = [sampleProductWithTier2]
    assert.equal(filterByCut(testList, 'utuh_bersih').length, 1, 'Cocok dengan Utuh Bersih Siang')
    assert.equal(filterByCut(testList, 'fillet').length, 1, 'Cocok dengan Fillet Tanpa Duri')
    assert.equal(filterByCut(testList, 'steak').length, 0, 'Tidak cocok dengan Steak Melintang')
  })

  test('Dashboard Tier 2 disabled options do NOT falsely match without availableCuts', () => {
    const sampleProductTier2Disabled = {
      id: 'disabled-tier2',
      name: 'Ikan Uji Coba',
      availableCuts: [],
      customVariants: {
        tier2: {
          enabled: false,
          name: 'Pilihan Kulit',
          options: [
            { id: 'cut-1', label: 'Tanpa Kulit', inStock: true }
          ]
        }
      }
    }

    const testList = [sampleProductTier2Disabled]
    assert.equal(filterByCut(testList, 'fillet').length, 0, 'Tidak boleh cocok karena tier2 dinonaktifkan')
  })
})
