import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth'
import { useApi } from '~/composables/useApi'

export interface WishlistProduct {
  id: string
  name: string
  slug: string
  category?: string
  pricePerKg?: number
  price?: number
  unit?: string
  stockKg?: number
  exportGrade?: string
  images: { hero: string }
  imageUrl?: string
}

export interface WishlistState {
  productIds: string[]
  items: WishlistProduct[]
  isLoading: boolean
}

export const useWishlistStore = defineStore('wishlist', {
  state: (): WishlistState => ({
    productIds: [],
    items: [],
    isLoading: false
  }),

  getters: {
    count: (state): number => state.productIds.length,
    has: (state) => (productId: string): boolean => {
      return state.productIds.includes(productId)
    }
  },

  actions: {
    async fetchWishlist() {
      if (typeof window === 'undefined') return
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.productIds = []
        this.items = []
        return
      }

      this.isLoading = true
      try {
        const api = useApi()
        const data = await api.get<any[]>('/account/wishlist')
        if (Array.isArray(data)) {
          this.items = data.map((p: any) => {
            let heroImg = 'https://cdn.ammarabufadhel.my.id/products/asset-1544551763-ced7aa4f.webp'
            if (p.images) {
              if (typeof p.images === 'string') {
                try {
                  const parsed = JSON.parse(p.images)
                  heroImg = parsed.hero || heroImg
                } catch {}
              } else if (typeof p.images === 'object') {
                heroImg = p.images.hero || heroImg
              }
            }
            return {
              id: p.id,
              name: p.name,
              slug: p.slug || p.id,
              category: p.category || 'ikan_laut',
              pricePerKg: Number(p.price_per_kg) || 0,
              price: Number(p.price_per_kg) || 0,
              unit: p.unit || 'kg',
              stockKg: Number(p.stock_kg) || 0,
              exportGrade: p.export_grade || 'Grade A',
              images: { hero: heroImg },
              imageUrl: heroImg
            }
          })
          this.productIds = this.items.map(it => it.id)
          this.persist()
        }
      } catch (err) {
        console.error('Failed to fetch wishlist:', err)
      } finally {
        this.isLoading = false
      }
    },

    async toggle(productId: string, redirectPath?: string): Promise<{ success: boolean; isWishlisted?: boolean; requireAuth?: boolean }> {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        if (typeof window !== 'undefined') {
          const router = useRouter()
          const target = redirectPath || window.location.pathname
          router.push(`/auth?redirect=${encodeURIComponent(target)}`)
        }
        return { success: false, requireAuth: true }
      }

      const wasWishlisted = this.productIds.includes(productId)
      if (wasWishlisted) {
        this.productIds = this.productIds.filter(id => id !== productId)
        this.items = this.items.filter(it => it.id !== productId)
      } else {
        this.productIds.push(productId)
      }
      this.persist()

      try {
        const api = useApi()
        const res = await api.post<any>(`/account/wishlist/${productId}`)
        if (res && res.wishlist) {
          this.productIds = res.wishlist
        }
        await this.fetchWishlist()
        return { success: true, isWishlisted: !wasWishlisted }
      } catch (err) {
        // Rollback
        if (wasWishlisted) {
          this.productIds.push(productId)
        } else {
          this.productIds = this.productIds.filter(id => id !== productId)
        }
        this.persist()
        throw err
      }
    },

    async remove(productId: string) {
      await this.toggle(productId)
    },

    async clear() {
      for (const id of [...this.productIds]) {
        await this.toggle(id)
      }
      this.productIds = []
      this.items = []
      this.persist()
    },

    initFromStorage() {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('lba_wishlist')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
              this.productIds = parsed
            }
          } catch {}
        }
      }
    },

    persist() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lba_wishlist', JSON.stringify(this.productIds))
      }
    }
  }
})
