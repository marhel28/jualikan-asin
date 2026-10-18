import { defineStore } from 'pinia'
import { PRODUCTS, type Product } from '~/data/products'

export interface WishlistState {
  productIds: string[]
}

export const useWishlistStore = defineStore('wishlist', {
  state: (): WishlistState => ({
    // Default with 2 mock items so customer sees populated state on first visit
    productIds: ['tongkol-deho', 'fillet-kerapu-cantang']
  }),

  getters: {
    items: (state): Product[] => {
      return state.productIds
        .map(id => PRODUCTS.find(p => p.id === id))
        .filter((p): p is Product => p !== undefined)
    },
    count: (state): number => state.productIds.length,
    has: (state) => (productId: string): boolean => {
      return state.productIds.includes(productId)
    }
  },

  actions: {
    toggle(productId: string) {
      const idx = this.productIds.indexOf(productId)
      if (idx !== -1) {
        this.productIds.splice(idx, 1)
      } else {
        this.productIds.push(productId)
      }
      this.persist()
    },

    remove(productId: string) {
      const idx = this.productIds.indexOf(productId)
      if (idx !== -1) {
        this.productIds.splice(idx, 1)
        this.persist()
      }
    },

    clear() {
      this.productIds = []
      this.persist()
    },

    initFromStorage() {
      if (import.meta.client) {
        const stored = localStorage.getItem('lba_wishlist')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
              this.productIds = parsed
            }
          } catch (e) {
            // fallback to default
          }
        }
      }
    },

    persist() {
      if (import.meta.client) {
        localStorage.setItem('lba_wishlist', JSON.stringify(this.productIds))
      }
    }
  }
})
