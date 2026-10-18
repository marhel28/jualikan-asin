import { defineStore } from 'pinia'

export interface UserAddress {
  id: string
  recipientName: string
  recipientPhone: string
  label: string
  street: string
  benchmark?: string
  isDefault?: boolean
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

export interface UserProfile {
  id: string
  username?: string
  fullName: string
  phoneWhatsApp: string
  email: string
  role: 'customer' | 'admin' | 'courier'
  isVerified: boolean
  defaultAddress: {
    recipientName: string
    recipientPhone: string
    label: string
    street: string
    benchmark: string
    isGpsVerified: boolean
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

    verifyOtp(inputOtp: string) {
      this.isLoading = true
      this.errorMessage = null

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

    registerWithEmailPassword(payload: { username: string; email: string; password: string; phoneWhatsApp?: string }): boolean {
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

    loginWithEmailOrUsername(identifier: string, password: string): boolean {
      const id = identifier.trim()
      if (!id) {
        this.errorMessage = 'Masukkan email atau username Anda.'
        return false
      }
      if (!password || password.length < 6) {
        this.errorMessage = 'Password minimal 6 karakter.'
        return false
      }

      this.isLoading = true
      this.errorMessage = null
      this.isAuthenticated = true
      const isEmail = id.includes('@')
      const uname = isEmail ? id.split('@')[0] : id
      this.user = {
        id: `usr_${Date.now()}`,
        username: uname,
        fullName: uname,
        phoneWhatsApp: '+6281234567890',
        email: isEmail ? id : `${uname}@gmail.com`,
        role: 'customer',
        isVerified: true,
        defaultAddress: {
          recipientName: uname,
          recipientPhone: '0812-3456-7890',
          label: 'Alamat Utama',
          street: 'Jl. Basuki Rahmat No. 42, Banyuwangi Kota',
          benchmark: 'Banyuwangi',
          isGpsVerified: true
        }
      }
      this.isLoading = false
      return true
    },

    updateEmail(newEmail: string): boolean {
      if (!this.user) return false
      this.user.email = newEmail.trim()
      return true
    },

    updatePassword(newPassword: string): boolean {
      if (!this.user || newPassword.length < 6) return false
      return true
    },

    setDefaultAddress(addressId: string) {
      if (!this.user || !this.user.addresses) return
      this.user.addresses.forEach(a => {
        a.isDefault = (a.id === addressId)
      })
      const def = this.user.addresses.find(a => a.id === addressId)
      if (def) {
        this.user.defaultAddress = {
          recipientName: def.recipientName,
          recipientPhone: def.recipientPhone,
          label: def.label,
          street: def.street,
          benchmark: def.benchmark || '',
          isGpsVerified: true
        }
      }
    },

    addAddress(newAddrData: Omit<UserAddress, 'id'>) {
      if (!this.user) return
      if (!this.user.addresses) this.user.addresses = []
      const newAddr: UserAddress = {
        ...newAddrData,
        id: 'addr_' + Date.now(),
        isDefault: this.user.addresses.length === 0 || !!newAddrData.isDefault
      }
      if (newAddr.isDefault) {
        this.user.addresses.forEach(a => { a.isDefault = false })
      }
      this.user.addresses.push(newAddr)
      if (newAddr.isDefault) {
        this.setDefaultAddress(newAddr.id)
      }
    },

    updateAddress(id: string, updated: Partial<UserAddress>) {
      if (!this.user?.addresses) return
      const idx = this.user.addresses.findIndex(a => a.id === id)
      if (idx !== -1) {
        this.user.addresses[idx] = {
          ...this.user.addresses[idx],
          ...updated
        }
        if (this.user.addresses[idx].isDefault) {
          this.setDefaultAddress(id)
        }
      }
    },

    deleteAddress(id: string) {
      if (!this.user?.addresses) return
      const wasDefault = this.user.addresses.find(a => a.id === id)?.isDefault
      this.user.addresses = this.user.addresses.filter(a => a.id !== id)
      if (wasDefault && this.user.addresses.length > 0) {
        this.user.addresses[0].isDefault = true
        this.setDefaultAddress(this.user.addresses[0].id)
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      this.otpSent = false
      this.otpCountdown = 0
      if (this.timerInterval) clearInterval(this.timerInterval)
    }
  }
})

