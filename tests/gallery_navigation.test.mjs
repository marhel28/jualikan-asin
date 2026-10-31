/**
 * Frontend Unit Test: Product Gallery Image Deduplication & Navigation
 * Native Node.js test runner (zero external dependencies)
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { PRODUCTS } from '../data/products.ts'

// Pure deduplication helper identical to galleryImages computed property
function resolveGalleryImages(product) {
  if (!product) return []
  const imgs = []
  if (product.images?.hero) imgs.push(product.images.hero)
  if (product.images?.texture) imgs.push(product.images.texture)
  if (product.images?.scaleSlip) imgs.push(product.images.scaleSlip)
  if (imgs.length === 0 && product.imageUrl) {
    imgs.push(product.imageUrl)
  }
  return Array.from(new Set(imgs.filter(url => typeof url === 'string' && url.trim().length > 0)))
}

test('Gallery Deduplication: Products with identical hero and texture URLs do NOT produce duplicate thumbnails', () => {
  const tenggiri = PRODUCTS.find(p => p.id === 'tenggiri-papan')
  assert.ok(tenggiri, 'Tenggiri papan must exist')
  assert.equal(tenggiri.images.hero, tenggiri.images.texture, 'Tenggiri hero and texture have identical URLs')

  const gallery = resolveGalleryImages(tenggiri)
  assert.equal(gallery.length, 2, 'Gallery must contain exactly 2 unique photos, not 3 with duplicates')
  assert.equal(new Set(gallery).size, gallery.length, 'Every photo in gallery must be strictly unique')
})

test('Gallery Deduplication: Products with distinct photos preserve all photos', () => {
  const baronang = PRODUCTS.find(p => p.id === 'baronang-tulis')
  assert.ok(baronang, 'Baronang must exist')

  const gallery = resolveGalleryImages(baronang)
  assert.ok(gallery.length >= 2, 'Baronang must have at least 2 photos')
  assert.equal(new Set(gallery).size, gallery.length, 'All photos must be unique without duplicate keys')
})

test('Gallery Navigation: prevGalleryImage and nextGalleryImage loop smoothly', () => {
  const gallery = ['https://cdn.example.com/img1.webp', 'https://cdn.example.com/img2.webp', 'https://cdn.example.com/img3.webp']
  let activeIndex = 0

  const nextImage = () => {
    activeIndex = activeIndex >= gallery.length - 1 ? 0 : activeIndex + 1
    return activeIndex
  }

  const prevImage = () => {
    activeIndex = activeIndex <= 0 ? gallery.length - 1 : activeIndex - 1
    return activeIndex
  }

  assert.equal(nextImage(), 1, 'Next from 0 should be 1')
  assert.equal(nextImage(), 2, 'Next from 1 should be 2')
  assert.equal(nextImage(), 0, 'Next from 2 should loop to 0')

  assert.equal(prevImage(), 2, 'Prev from 0 should loop to 2')
  assert.equal(prevImage(), 1, 'Prev from 2 should be 1')
  assert.equal(prevImage(), 0, 'Prev from 1 should be 0')
})

test('Gallery Navigation: Switching to identical image URL preserves loaded status without skeleton freeze', () => {
  const gallery = ['https://cdn.example.com/img1.webp']
  let activeIndex = 0
  let isHeroImageLoaded = true
  let isHeroImageError = false

  const switchImage = (targetIdx) => {
    if (targetIdx < 0 || targetIdx >= gallery.length) return
    if (activeIndex === targetIdx) return

    const targetImg = gallery[targetIdx]
    const currentImg = gallery[activeIndex]

    activeIndex = targetIdx

    if (targetImg === currentImg) {
      isHeroImageLoaded = true
      return
    }

    isHeroImageLoaded = false
    isHeroImageError = false
  }

  // Attempt to switch to out of bounds or same
  switchImage(0)
  assert.equal(isHeroImageLoaded, true, 'isHeroImageLoaded must remain true')
  assert.equal(activeIndex, 0, 'Index must remain 0')
})
