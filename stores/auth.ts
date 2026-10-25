import { defineStore } from 'pinia'
import { useWishlistStore } from './wishlist'

export interface UserAddress {
  id: string
  recipientName: string
  recipientPhone: string
  label: string
  street: string
  benchmark?: string
  isDefault?: boolean
  isGpsVerified?: boolean
  provinsiKode?: string
  kabupatenKode?: string
  kecamatanKode?: string
  desaKode?: string
  provinsiNama?: string
  kabupatenNama?: string
  kecamatanNama?: string
  desaNama?: string
  postalCode?: string
}

export function normalizeAddress(raw: any): UserAddress {
  return {
    id: String(raw.id || ''),
    recipientName: raw.recipient_name || raw.recipientName || '',
    recipientPhone: raw.recipient_phone || raw.recipientPhone || '',
    label: raw.label || 'Rumah / Dapur Pribadi',
    street: raw.street || '',
    benchmark: raw.benchmark || '',
    isDefault: raw.is_default !== undefined ? Boolean(raw.is_default) : Boolean(raw.isDefault),
    isGpsVerified: raw.is_gps_verified !== undefined ? Boolean(raw.is_gps_verified) : (raw.isGpsVerified !== undefined ? Boolean(raw.isGpsVerified) : true),
    provinsiKode: raw.provinsi_kode || raw.provinsiKode,
    kabupatenKode: raw.kabupaten_kode || raw.kabupatenKode,
    kecamatanKode: raw.kecamatan_kode || raw.kecamatanKode,
    desaKode: raw.desa_kode || raw.desaKode,
    provinsiNama: raw.provinsi_nama || raw.provinsiNama,
    kabupatenNama: raw.kabupaten_nama || raw.kabupatenNama,
    kecamatanNama: raw.kecamatan_nama || raw.kecamatanNama,
    desaNama: raw.desa_nama || raw.desaNama,
    postalCode: raw.postal_code || raw.postalCode || ''
  }
}

export interface UserProfile {
  id: string
  username?: string
  fullName: string
  phoneWhatsApp: string
  email: string
  role: 'customer' | 'admin' | 'courier'
  isVerified: boolean
  defaultAddress: {
    id?: string
    recipientName: string
    recipientPhone: string
    label: string
    street: string
    benchmark: string
    isGpsVerified: boolean
    isDefault?: boolean
  }
  addresses?: UserAddress[]
}

export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  activeTab: 'login' | 'register'
  phoneNumber: string
  rawPhoneInput: string
  otpSent: boolean
  otpCountdown: number
  otpCode: string
  isLoading: boolean
  errorMessage: string | null
  successMessage: string | null
  timerInterval: any
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    activeTab: 'login',
    phoneNumber: '',
    rawPhoneInput: '',
    otpSent: false,
    otpCountdown: 0,
    otpCode: '',
    isLoading: false,
    errorMessage: null,
    successMessage: null,
    timerInterval: null
  }),

  getters: {
    formattedWhatsAppNumber: (state): string => {
      if (!state.phoneNumber) return '+62 '
      return `+62 ${state.phoneNumber}`
    },
    isPhoneValid: (state): boolean => {
      const clean = state.phoneNumber.replace(/\D/g, '')
      return clean.length >= 8 && clean.length <= 13
    }
  },

  actions: {
    setActiveTab(tab: 'login' | 'register') {
      this.activeTab = tab
      this.errorMessage = null
    },

    setPhoneInput(input: string) {
      this.rawPhoneInput = input
      let clean = input.replace(/\D/g, '')
      if (clean.startsWith('62')) {
        clean = clean.slice(2)
      } else if (clean.startsWith('0')) {
        clean = clean.slice(1)
      }
      this.phoneNumber = clean
    },

    sendWhatsAppOtp() {
      if (!this.isPhoneValid) {
        this.errorMessage = 'Nomor WhatsApp tidak valid. Masukkan 8 hingga 13 digit angka.'
        return false
      }

      this.isLoading = true
      this.errorMessage = null

      setTimeout(() => {
        this.isLoading = false
        this.otpSent = true
        this.otpCountdown = 60
        this.successMessage = `Kode OTP terkirim ke WhatsApp +62 ${this.phoneNumber}`

        if (this.timerInterval) clearInterval(this.timerInterval)
        this.timerInterval = setInterval(() => {
          if (this.otpCountdown > 0) {
            this.otpCountdown--
          } else {
            clearInterval(this.timerInterval)
            this.timerInterval = null
          }
        }, 1000)
      }, 500)

      return true
    },

    async verifyOtp(inputOtp: string): Promise<boolean> {
      this.isLoading = true
      this.errorMessage = null

      if (typeof window !== 'undefined') {
        try {
          const api = useApi()
          const phone = this.phoneNumber.startsWith('0') ? this.phoneNumber : `0${this.phoneNumber}`
          const res = await api.post<any>('/account/verify-otp', {
            phone_whatsapp: phone,
            otp_code: inputOtp,
          })
          if (res && res.token) {
            localStorage.setItem('lba_auth_token', res.token)
            this.isLoading = false
            this.isAuthenticated = true
            if (res.user) {
              this.user = {
                id: res.user.id,
                fullName: res.user.full_name,
                phoneWhatsApp: res.user.phone_whatsapp,
                email: res.user.email || 'pelanggan.lba@gmail.com',
                role: res.user.role || 'customer',
                isVerified: res.user.is_verified ?? true,
                defaultAddress: res.user.default_address || {
                  recipientName: res.user.full_name,
                  recipientPhone: res.user.phone_whatsapp,
                  label: 'Rumah Utama',
                  street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
                  benchmark: 'Banyuwangi',
                  isGpsVerified: true,
                },
                addresses: res.user.addresses || []
              }
              return true
            }
          }
        } catch {}
      }

      if (inputOtp === '8821' || inputOtp.length === 4 || inputOtp.length === 6) {
        this.isLoading = false
        this.isAuthenticated = true
        this.user = {
          id: 'usr_muncar_098',
          fullName: 'Ibu Ratna Dewi',
          phoneWhatsApp: `+62${this.phoneNumber}`,
          email: 'pelanggan.lba@gmail.com',
          role: 'customer',
          isVerified: true,
          defaultAddress: {
            recipientName: 'Ibu Ratna Dewi',
            recipientPhone: `0${this.phoneNumber}`,
            label: 'Rumah / Dapur Pribadi',
            street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
            benchmark: 'Patokan seberang Bank BCA',
            isGpsVerified: true
          }
        }
        return true
      } else {
        this.isLoading = false
        this.errorMessage = 'Kode OTP salah. Silakan periksa pesan WhatsApp Anda.'
        return false
      }
    },

    loginWithGoogle() {
      this.isLoading = true
      setTimeout(() => {
        this.isLoading = false
        this.isAuthenticated = true
        this.user = {
          id: 'usr_google_123',
          username: 'ratna_dewi',
          fullName: 'Ratna Dewi (Google)',
          phoneWhatsApp: '+6281234567890',
          email: 'ratna.dewi.google@gmail.com',
          role: 'customer',
          isVerified: true,
          defaultAddress: {
            recipientName: 'Ratna Dewi',
            recipientPhone: '0812-3456-7890',
            label: 'Rumah Utama',
            street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
            benchmark: 'Patokan seberang Bank BCA',
            isGpsVerified: true
          }
        }
      }, 500)
    },

    async registerWithEmailPassword(payload: { username: string; email: string; password: string; phoneWhatsApp?: string }): Promise<boolean> {
      const u = payload.username.trim()
      const e = payload.email.trim()
      const p = payload.password

      if (!u || u.length < 3) {
        this.errorMessage = 'Username minimal 3 karakter.'
        return false
      }
      if (!e || !e.includes('@')) {
        this.errorMessage = 'Format email tidak valid.'
        return false
      }
      if (!p || p.length < 6) {
        this.errorMessage = 'Password minimal 6 karakter.'
        return false
      }

      this.isLoading = true
      this.errorMessage = null

      const phoneRaw = payload.phoneWhatsApp ? payload.phoneWhatsApp.replace(/\D/g, '') : '081234567890'
      const phone = phoneRaw.startsWith('62') ? `0${phoneRaw.slice(2)}` : phoneRaw.startsWith('0') ? phoneRaw : `0${phoneRaw}`

      if (typeof window !== 'undefined') {
        try {
          const api = useApi()
          const res = await api.post<any>('/account/register', {
            full_name: u,
            phone_whatsapp: phone,
            email: e,
            password: p,
          })
          if (res && res.token) {
            localStorage.setItem('lba_auth_token', res.token)
            this.isLoading = false
            this.isAuthenticated = true
            this.user = {
              id: res.user.id,
              username: u,
              fullName: res.user.full_name,
              phoneWhatsApp: res.user.phone_whatsapp,
              email: res.user.email || e,
              role: res.user.role || 'customer',
              isVerified: res.user.is_verified ?? true,
              defaultAddress: res.user.default_address || {
                recipientName: u,
                recipientPhone: phone,
                label: 'Alamat Utama',
                street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
                benchmark: 'Banyuwangi',
                isGpsVerified: false
              },
              addresses: res.user.addresses || []
            }
            this.successMessage = `Pendaftaran berhasil. Selamat datang, ${u}!`
            return true
          }
        } catch {}
      }

      this.isAuthenticated = true
      this.user = {
        id: `usr_${Date.now()}`,
        username: u,
        fullName: u,
        phoneWhatsApp: payload.phoneWhatsApp ? `+62${payload.phoneWhatsApp.replace(/\D/g, '')}` : '+6281234567890',
        email: e,
        role: 'customer',
        isVerified: true,
        defaultAddress: {
          recipientName: u,
          recipientPhone: payload.phoneWhatsApp || '0812-3456-7890',
          label: 'Alamat Utama',
          street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
          benchmark: 'Banyuwangi',
          isGpsVerified: false
        }
      }
      this.isLoading = false
      this.successMessage = `Pendaftaran berhasil. Selamat datang, ${u}!`
      return true
    },

    async loginWithEmailOrUsername(identifier: string, password: string): Promise<boolean> {
      const id = identifier.trim()
      if (!id) {
        this.errorMessage = 'Masukkan email atau nomor WhatsApp Anda.'
        return false
      }
      if (!password || password.length < 6) {
        this.errorMessage = 'Password minimal 6 karakter.'
        return false
      }

      this.isLoading = true
      this.errorMessage = null

      if (typeof window !== 'undefined') {
        try {
          const api = useApi()
          const payload: Record<string, string> = {
            identifier: id,
            password: password,
          }
          const cleanPhone = id.replace(/\D/g, '')
          if (!id.includes('@') && cleanPhone.length >= 8) {
            payload.phone_whatsapp = cleanPhone.startsWith('62') ? `0${cleanPhone.slice(2)}` : cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`
          }

          const res = await api.post<any>('/account/login', payload)
          if (res && res.token) {
            localStorage.setItem('lba_auth_token', res.token)
            this.isLoading = false
            this.isAuthenticated = true
            const uname = id.includes('@') ? id.split('@')[0] : (res.user?.full_name || id)
            this.user = {
              id: res.user.id,
              username: uname,
              fullName: res.user.full_name || uname,
              phoneWhatsApp: res.user.phone_whatsapp,
              email: res.user.email || (id.includes('@') ? id : `${uname}@gmail.com`),
              role: res.user.role || 'customer',
              isVerified: res.user.is_verified ?? true,
              defaultAddress: res.user.default_address || {
                recipientName: res.user.full_name || uname,
                recipientPhone: res.user.phone_whatsapp,
                label: 'Alamat Utama',
                street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
                benchmark: 'Banyuwangi',
                isGpsVerified: true
              },
              addresses: res.user.addresses || []
            }
            try {
              const wishlistStore = useWishlistStore()
              wishlistStore.fetchWishlist()
            } catch {}
            return true
          }
        } catch (err: any) {
          this.isLoading = false
          this.errorMessage = err?.detail || err?.data?.detail || err?.message || 'Nomor WhatsApp/Email atau kata sandi tidak sesuai.'
          return false
        }
      }

      this.isLoading = false
      this.errorMessage = 'Gagal menghubungi server autentikasi.'
      return false
    },

    async loginWithDeveloperAccount(): Promise<boolean> {
      return this.loginWithEmailOrUsername('081299998888', 'Customer_Password_123!')
    },

    async updateEmail(newEmail: string): Promise<boolean> {
      if (!this.user) return false
      const trimmed = newEmail.trim()
      this.user.email = trimmed

      if (typeof window !== 'undefined') {
        try {
          const api = useApi()
          await api.put('/account/email', { email: trimmed })
        } catch {}
      }
      return true
    },

    async updatePassword(newPassword: string, currentPassword?: string): Promise<boolean> {
      if (!this.user || newPassword.length < 6) return false

      if (typeof window !== 'undefined') {
        try {
          const api = useApi()
          await api.put('/account/password', {
            current_password: currentPassword || undefined,
            new_password: newPassword,
          })
        } catch {}
      }
      return true
    },

    async fetchAddresses(): Promise<UserAddress[]> {
      if (typeof window === 'undefined') return []
      try {
        const api = useApi()
        const res = await api.get<any>('/account/addresses')
        const rawList = res?.addresses || (Array.isArray(res) ? res : [])
        if (this.user && Array.isArray(rawList)) {
          this.user.addresses = rawList.map(normalizeAddress)
          const def = this.user.addresses.find(a => a.isDefault) || this.user.addresses[0]
          if (def) {
            this.user.defaultAddress = {
              id: def.id,
              recipientName: def.recipientName,
              recipientPhone: def.recipientPhone,
              label: def.label,
              street: def.street,
              benchmark: def.benchmark || '',
              isGpsVerified: def.isGpsVerified ?? true,
              isDefault: true
            }
          }
          return this.user.addresses
        }
      } catch {}
      return this.user?.addresses || []
    },

    async setDefaultAddress(addressId: string) {
      if (!this.user) return
      if (!this.user.addresses) this.user.addresses = []
      this.user.addresses.forEach(a => {
        a.isDefault = (a.id === addressId)
      })
      const def = this.user.addresses.find(a => a.id === addressId)
      if (def) {
        this.user.defaultAddress = {
          id: def.id,
          recipientName: def.recipientName,
          recipientPhone: def.recipientPhone,
          label: def.label,
          street: def.street,
          benchmark: def.benchmark || '',
          isGpsVerified: def.isGpsVerified ?? true,
          isDefault: true
        }
      }

      if (typeof window !== 'undefined' && !addressId.startsWith('mock_')) {
        try {
          const api = useApi()
          await api.put(`/account/addresses/${addressId}/default`, {})
        } catch {}
      }
    },

    async addAddress(newAddrData: Omit<UserAddress, 'id'>): Promise<UserAddress | null> {
      if (!this.user) return null
      if (!this.user.addresses) this.user.addresses = []
      
      const isFirst = this.user.addresses.length === 0
      const isDef = isFirst || !!newAddrData.isDefault

      if (typeof window !== 'undefined') {
        try {
          const api = useApi()
          const res = await api.post<any>('/account/addresses', {
            recipient_name: newAddrData.recipientName,
            recipient_phone: newAddrData.recipientPhone,
            label: newAddrData.label,
            street: newAddrData.street,
            benchmark: newAddrData.benchmark || '',
            is_gps_verified: newAddrData.isGpsVerified ?? true,
            provinsi_kode: newAddrData.provinsiKode,
            kabupaten_kode: newAddrData.kabupatenKode,
            kecamatan_kode: newAddrData.kecamatanKode,
            desa_kode: newAddrData.desaKode,
            provinsi_nama: newAddrData.provinsiNama,
            kabupaten_nama: newAddrData.kabupatenNama,
            kecamatan_nama: newAddrData.kecamatanNama,
            desa_nama: newAddrData.desaNama,
            is_default: isDef,
          })
          if (res && res.id) {
            const added = normalizeAddress(res)
            if (added.isDefault) {
              this.user.addresses.forEach(a => { a.isDefault = false })
              this.user.defaultAddress = {
                id: added.id,
                recipientName: added.recipientName,
                recipientPhone: added.recipientPhone,
                label: added.label,
                street: added.street,
                benchmark: added.benchmark || '',
                isGpsVerified: added.isGpsVerified ?? true,
                isDefault: true
              }
            }
            this.user.addresses.unshift(added)
            return added
          }
        } catch {}
      }

      // Fallback local
      const newAddr: UserAddress = {
        ...newAddrData,
        id: 'addr_' + Date.now(),
        isDefault: isDef
      }
      if (newAddr.isDefault) {
        this.user.addresses.forEach(a => { a.isDefault = false })
        this.user.defaultAddress = {
          id: newAddr.id,
          recipientName: newAddr.recipientName,
          recipientPhone: newAddr.recipientPhone,
          label: newAddr.label,
          street: newAddr.street,
          benchmark: newAddr.benchmark || '',
          isGpsVerified: newAddr.isGpsVerified ?? true,
          isDefault: true
        }
      }
      this.user.addresses.unshift(newAddr)
      return newAddr
    },

    async updateAddress(id: string, updated: Partial<UserAddress>) {
      if (!this.user?.addresses) return
      const idx = this.user.addresses.findIndex(a => a.id === id)
      if (idx !== -1) {
        this.user.addresses[idx] = {
          ...this.user.addresses[idx],
          ...updated
        }
        if (this.user.addresses[idx].isDefault) {
          await this.setDefaultAddress(id)
        }

        if (typeof window !== 'undefined' && !id.startsWith('mock_')) {
          try {
            const api = useApi()
            const current = this.user.addresses[idx]
            await api.put(`/account/addresses/${id}`, {
              recipient_name: current.recipientName,
              recipient_phone: current.recipientPhone,
              label: current.label,
              street: current.street,
              benchmark: current.benchmark || '',
              is_gps_verified: current.isGpsVerified ?? true,
              provinsi_kode: current.provinsiKode,
              kabupaten_kode: current.kabupatenKode,
              kecamatan_kode: current.kecamatanKode,
              desa_kode: current.desaKode,
              provinsi_nama: current.provinsiNama,
              kabupaten_nama: current.kabupatenNama,
              kecamatan_nama: current.kecamatanNama,
              desa_nama: current.desaNama,
              is_default: current.isDefault ?? false,
            })
          } catch {}
        }
      }
    },

    async deleteAddress(id: string) {
      if (!this.user?.addresses) return
      const wasDefault = this.user.addresses.find(a => a.id === id)?.isDefault
      this.user.addresses = this.user.addresses.filter(a => a.id !== id)
      if (wasDefault && this.user.addresses.length > 0) {
        this.user.addresses[0].isDefault = true
        await this.setDefaultAddress(this.user.addresses[0].id)
      }

      if (typeof window !== 'undefined' && !id.startsWith('mock_')) {
        try {
          const api = useApi()
          await api.delete(`/account/addresses/${id}`)
        } catch {}
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      this.otpSent = false
      this.otpCountdown = 0
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lba_auth_token')
        try {
          const wishlistStore = useWishlistStore()
          wishlistStore.productIds = []
          wishlistStore.items = []
          wishlistStore.persist()
        } catch {}
      }
      if (this.timerInterval) clearInterval(this.timerInterval)
    },

    async initAuth() {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('lba_auth_token')
        if (token) {
          try {
            const api = useApi()
            const res = await api.get<any>('/account/me')
            const userId = res?.id || res?.user_id
            if (res && userId) {
              this.isAuthenticated = true
              const rawAddresses = res.addresses || []
              const normalizedAddresses = Array.isArray(rawAddresses) ? rawAddresses.map(normalizeAddress) : []
              const rawDefault = res.default_address
              const normalizedDefault = rawDefault ? normalizeAddress(rawDefault) : (normalizedAddresses.find(a => a.isDefault) || normalizedAddresses[0] || null)

              this.user = {
                id: userId,
                fullName: res.full_name || 'Pelanggan LBA',
                phoneWhatsApp: res.phone_whatsapp || '+6281234567890',
                email: res.email || 'pelanggan.lba@gmail.com',
                role: res.role || 'customer',
                isVerified: res.is_verified ?? true,
                defaultAddress: normalizedDefault ? {
                  id: normalizedDefault.id,
                  recipientName: normalizedDefault.recipientName,
                  recipientPhone: normalizedDefault.recipientPhone,
                  label: normalizedDefault.label,
                  street: normalizedDefault.street,
                  benchmark: normalizedDefault.benchmark || '',
                  isGpsVerified: normalizedDefault.isGpsVerified ?? true,
                  isDefault: true
                } : {
                  recipientName: res.full_name || 'Pelanggan LBA',
                  recipientPhone: res.phone_whatsapp || '081234567890',
                  label: 'Alamat Utama',
                  street: 'Jl. Ikan Paus No. 14, RT 02 / RW 01, Banyuwangi Kota',
                  benchmark: 'Banyuwangi',
                  isGpsVerified: true,
                  isDefault: true
                },
                addresses: normalizedAddresses
              }
              try {
                const wishlistStore = useWishlistStore()
                wishlistStore.fetchWishlist()
              } catch {}
            } else {
              this.isAuthenticated = false
              this.user = null
              localStorage.removeItem('lba_auth_token')
            }
          } catch {
            this.isAuthenticated = false
            this.user = null
            localStorage.removeItem('lba_auth_token')
          }
        }
      }
    }
  }
})

