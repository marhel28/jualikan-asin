import test from 'node:test'
import assert from 'node:assert/strict'

// Pure logic mirror of frontend/pages/produk/[slug].vue stock & variant calculations
function computeVariantStock(masterStockKg, weightKg, isPack = false) {
  if (masterStockKg <= 0) return 0
  if (isPack) return Math.floor(masterStockKg)
  const weight = weightKg || 0.1
  return Math.floor(masterStockKg / weight)
}

function computeMaxStock(masterStockKg, isPack, selectedVariantStock) {
  if (masterStockKg <= 0) return 0
  if (isPack) return Math.floor(masterStockKg)
  if (typeof selectedVariantStock === 'number') {
    return selectedVariantStock
  }
  return Math.floor(masterStockKg)
}

function clampQuantity(qty, maxStock) {
  if (maxStock <= 0) return 0
  if (qty < 1) return 1
  if (qty > maxStock) return maxStock
  return qty
}

function changeQty(currentQty, delta, maxStock) {
  if (maxStock <= 0) return currentQty
  const next = currentQty + delta
  if (next >= 1 && next <= maxStock) return next
  return currentQty
}

test('Dynamic Stock: converts masterStockKg accurately to variant packs', () => {
  // 10kg fish, 200g (0.2kg) pack -> 50 packs
  assert.equal(computeVariantStock(10, 0.2), 50)

  // 2.5kg fish, 250g (0.25kg) pack -> 10 packs
  assert.equal(computeVariantStock(2.5, 0.25), 10)

  // 1.1kg fish, 200g pack -> Math.floor(1.1 / 0.2) = 5 packs
  assert.equal(computeVariantStock(1.1, 0.2), 5)

  // 0kg master stock -> 0 packs
  assert.equal(computeVariantStock(0, 0.2), 0)

  // Negative master stock -> 0 packs
  assert.equal(computeVariantStock(-1, 0.2), 0)

  // Pack unit item with 7 packs in stock -> 7 packs regardless of weight
  assert.equal(computeVariantStock(7, 0.5, true), 7)
})

test('Dynamic Stock: computeMaxStock and clamping prevents ordering depleted items', () => {
  // Out of stock product
  const max0 = computeMaxStock(0, false, 0)
  assert.equal(max0, 0)
  assert.equal(clampQuantity(1, max0), 0)
  assert.equal(changeQty(0, 1, max0), 0)

  // In stock product (5 packs available)
  const max5 = computeMaxStock(1.0, false, 5)
  assert.equal(max5, 5)
  assert.equal(clampQuantity(1, max5), 1)
  assert.equal(clampQuantity(10, max5), 5) // Clamped down
  assert.equal(changeQty(1, 1, max5), 2)
  assert.equal(changeQty(5, 1, max5), 5) // Cannot exceed maxStock
  assert.equal(changeQty(1, -1, max5), 1) // Cannot go below 1
})
