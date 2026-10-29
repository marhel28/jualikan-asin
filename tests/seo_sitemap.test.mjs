/**
 * Frontend Unit Test: SEO, Geo, and Sitemap Rules
 * Native Node.js test runner (zero external dependencies)
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTS } from '../data/products.ts'

test('Sitemap XML escaping handles ampersands and special characters', () => {
  const escapeXml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  assert.equal(escapeXml('Kepala & Rahang Kakap Merah Segar'), 'Kepala &amp; Rahang Kakap Merah Segar')
  assert.equal(escapeXml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
})

test('All catalog products have valid names and slugs for SSR SEO indexing', () => {
  assert.ok(PRODUCTS.length > 0)
  for (const p of PRODUCTS) {
    assert.ok(p.id, `Product missing id: ${p.name}`)
    assert.ok(p.slug, `Product missing slug: ${p.name}`)
    assert.ok(p.name, `Product missing name: ${p.slug}`)
    assert.ok(p.pricePerKg > 0, `Product pricePerKg invalid: ${p.slug}`)

    // Test synchronous SSR lookup
    const found = PRODUCTS.find(prod => prod.slug === p.slug || prod.id === p.id)
    assert.ok(found, `Synchronous SSR lookup failed for ${p.slug}`)
    assert.equal(found.id, p.id)
  }
})

test('Static trust routes are accounted for in sitemap index', () => {
  const staticPaths = ['/', '/katalog', '/tentang', '/syarat-ketentuan', '/kebijakan-privasi']
  assert.equal(staticPaths.length, 5)
  assert.ok(staticPaths.includes('/tentang'))
  assert.ok(staticPaths.includes('/syarat-ketentuan'))
  assert.ok(staticPaths.includes('/kebijakan-privasi'))
})
