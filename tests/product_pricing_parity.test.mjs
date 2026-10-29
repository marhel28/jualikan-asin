/**
 * Frontend Unit Test: Product Price Parity between Catalog Card & Detail Page
 * Native Node.js test runner (zero external dependencies)
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTS } from '../data/products.ts'
import { resolveProductPricing } from '../composables/useProductPrice.ts'

test('Pricing Parity: Fixed pack products maintain exact pack price without synthetic division', () => {
  const tuna = PRODUCTS.find(p => p.id === 'steak-tuna-yellowfin')
  assert.ok(tuna, 'Tuna yellowfin must exist')
  
  const pricing = resolveProductPricing(tuna)
  // Must NOT divide by 10 to Rp 5.000
  assert.equal(pricing.priceInfo.minPrice, 34000)
  assert.equal(pricing.priceInfo.maxPrice, 34000)
  assert.equal(pricing.priceInfo.isRange, false)
  assert.equal(pricing.priceInfo.displayPrice, 'Rp 34.000')
  assert.equal(pricing.priceInfo.unitLabel, '/ pack')
  assert.equal(pricing.tier1Config.unit, 'pack')
  assert.equal(pricing.tier1Config.options[0].price, 34000)
})

test('Pricing Parity: Variant products produce identical range on Card and Detail', () => {
  const cumi = PRODUCTS.find(p => p.id === 'cumi-sero')
  assert.ok(cumi, 'Cumi sero must exist')
  
  const pricing = resolveProductPricing(cumi)
  assert.equal(pricing.priceInfo.minPrice, 8000)
  assert.equal(pricing.priceInfo.maxPrice, 19500)
  assert.equal(pricing.priceInfo.isRange, true)
  assert.equal(pricing.priceInfo.displayPrice, 'Rp 8.000 - Rp 19.500')
  assert.equal(pricing.priceInfo.hasVariants, true)
  assert.equal(pricing.tier1Config.options.length, 4)
})

test('Pricing Parity: Fallback handles products with empty customVariants consistently', () => {
  const emptyVariantProduct = {
    id: 'test-fish',
    name: 'Ikan Uji Coba',
    slug: 'ikan-uji-coba',
    unit: 'kg',
    pricePerKg: 100000,
    stockKg: 50,
    customVariants: {}
  }

  const pricing = resolveProductPricing(emptyVariantProduct)
  // Fallback 100g = 10000, 250g = 25000
  assert.equal(pricing.priceInfo.minPrice, 10000)
  assert.equal(pricing.priceInfo.maxPrice, 25000)
  assert.equal(pricing.priceInfo.isRange, true)
  assert.equal(pricing.priceInfo.displayPrice, 'Rp 10.000 - Rp 25.000')
  assert.equal(pricing.tier1Config.options.length, 4)
  assert.equal(pricing.tier1Config.options[0].price, 10000)
})

test('Pricing Parity: All catalog products have consistent pricing info', () => {
  for (const p of PRODUCTS) {
    const pricing = resolveProductPricing(p)
    assert.ok(pricing.priceInfo.minPrice > 0, `minPrice must be > 0 for ${p.slug}`)
    assert.ok(pricing.priceInfo.maxPrice >= pricing.priceInfo.minPrice, `maxPrice must be >= minPrice for ${p.slug}`)
    assert.ok(pricing.tier1Config.options.length > 0, `tier1 options must exist for ${p.slug}`)
  }
})

test('Pricing Parity: Recommendation items resolve identically to catalog cards', () => {
  // Simulating recommendation candidate (e.g. Lemuru recommended on Tenggiri page)
  const lemuru = PRODUCTS.find(p => p.id === 'lemuru-segar')
  assert.ok(lemuru, 'Lemuru segar must exist')

  const pricing = resolveProductPricing(lemuru)
  // Ensures raw pricePerKg (24000) is NOT displayed directly as single price without range/pack unit
  assert.equal(pricing.priceInfo.minPrice, 6000)
  assert.equal(pricing.priceInfo.maxPrice, 24000)
  assert.equal(pricing.priceInfo.displayPrice, 'Rp 6.000 - Rp 24.000')
  assert.equal(pricing.priceInfo.hasVariants, true)
})
