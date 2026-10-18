// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  experimental: {
    appManifest: false,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  // Hybrid rendering: SWR for public catalog, SPA for transactional flows
  routeRules: {
    '/': { swr: 300 },
    '/katalog': { swr: 300 },
    '/produk/**': { swr: 600 },
    '/auth': { ssr: false },
    '/keranjang': { ssr: false },
    '/checkout': { ssr: false },
    '/pembayaran/**': { ssr: false },
    '/pesanan': { ssr: false },
    '/pesanan/**': { ssr: false },
    '/akun': { ssr: false },
  },

  css: [
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      htmlAttrs: {
        lang: 'id',
        class: 'light',
      },
      title: 'Laut Berkah Abadi | D2C Cold Chain Seafood Muncar Banyuwangi',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        {
          name: 'description',
          content: 'Distribusi hasil laut segar Muncar, Banyuwangi dengan garansi rantai dingin presisi, kalkulasi rendemen transparan, dan pengiriman armada dingin subuh.',
        },
        { name: 'theme-color', content: '#103860' },
        // OpenGraph
        { property: 'og:site_name', content: 'Laut Berkah Abadi' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Laut Berkah Abadi | D2C Cold Chain Seafood Muncar' },
        {
          property: 'og:description',
          content: 'Pesan ikan segar Muncar dengan standar rantai dingin -20°C ke dapur Anda. Garansi kesegaran 100%.',
        },
        { property: 'og:image', content: '/brand/logo.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/brand/logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
        },
      ],
    },
  },

  pinia: {
    autoImports: ['defineStore', 'storeToRefs', 'acceptHMRUpdate'],
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})

