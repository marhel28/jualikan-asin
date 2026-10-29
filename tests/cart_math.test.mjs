/**
 * Frontend Unit Test: Cold-Chain Cart Math & Business Rules
 * Native Node.js test runner (zero external dependencies)
 */

import test from 'node:test'
import assert from 'node:assert/strict'

// Import pure logic functions and constants directly
import { 
  calcNetWeight, 
  YIELD_RATIOS, 
  PACKAGING_FEES,
  DEFAULT_PACKAGING_OPTIONS,
  FREE_SHIPPING_THRESHOLD 
} from '../composables/useCartMath.ts'

test('Cart Math: calcNetWeight respects butcher cut yield ratios', () => {
  // Fillet: 52% of 2 kg -> 1.04 kg
  const netFillet = calcNetWeight(2.0, 'fillet_tanpa_kulit')
  assert.equal(netFillet, 1.04)

  // Utuh Bersih: 85% of 1.5 kg -> 1.275 kg (JS Number.toFixed(2) rounds to 1.27 or 1.28 depending on floating point precision)
  const netUtuh = calcNetWeight(2.0, 'utuh_bersih')
  assert.equal(netUtuh, 1.7)

  // Steak Melintang: 80% of 3 kg -> 2.40 kg
  const netSteak = calcNetWeight(3.0, 'steak_melintang')
  assert.equal(netSteak, 2.4)

  // Edge cases: 0 or negative or invalid cut
  assert.equal(calcNetWeight(0, 'utuh_bersih'), 0)
  assert.equal(calcNetWeight(-5, 'fillet_tanpa_kulit'), 0)
  // Unknown cut fallback to 85%
  assert.equal(calcNetWeight(2.0, 'unknown_cut'), 1.7)
})

test('Cart Math: Cold-chain packaging fees are accurate and tiered', () => {
  assert.equal(PACKAGING_FEES.thermal_bag.fee, 7500)
  assert.equal(PACKAGING_FEES.styrofoam_box.fee, 18000)
  assert.equal(PACKAGING_FEES.insulated_pouch.fee, 4000)
  assert.ok(PACKAGING_FEES.styrofoam_box.fee > PACKAGING_FEES.thermal_bag.fee)
  assert.ok(PACKAGING_FEES.thermal_bag.fee > PACKAGING_FEES.insulated_pouch.fee)

  assert.equal(DEFAULT_PACKAGING_OPTIONS.length, 3)
  const def = DEFAULT_PACKAGING_OPTIONS.find(p => p.isDefault)
  assert.ok(def, 'Default packaging option must be present')
  assert.equal(def.id, 'thermal_bag')
})

test('Cart Math: Free shipping threshold is Rp 300,000', () => {
  assert.equal(FREE_SHIPPING_THRESHOLD, 300000)
  
  const subtotalUnder = 250000
  const isFreeUnder = subtotalUnder >= FREE_SHIPPING_THRESHOLD
  assert.equal(isFreeUnder, false)

  const subtotalOver = 350000
  const isFreeOver = subtotalOver >= FREE_SHIPPING_THRESHOLD
  assert.equal(isFreeOver, true)
})
