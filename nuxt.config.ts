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
    '@nuxt/image',
  ],

  image: {
    domains: [
      'api-muncar.ammarabufadhel.my.id',
      'cdn.ammarabufadhel.my.id',
      'images.unsplash.com',
      'unsplash.com',
      'localhost',
      '127.0.0.1',
      'api.qrserver.com',
    ],
    format: ['webp', 'avif'],
    quality: 85,
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api-muncar.ammarabufadhel.my.id',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://lautberkahabadi.com',
      midtransClientKey: process.env.NUXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-vE8vECZNYD2RyXbI',
      midtransSnapUrl: process.env.NUXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js',
    },
  },

  $production: {
    routeRules: {
      '/': { swr: 300 },
      '/katalog': { swr: 300 },
      '/produk/**': { swr: 600 },
    },
  },

  // Hybrid rendering: SPA for transactional flows, dynamic SSR in dev, SWR in production
  routeRules: {
    '/login': { redirect: '/auth?mode=login' },
    '/signup': { redirect: '/auth?mode=register' },
    '/daftar': { redirect: '/auth?mode=register' },
    '/auth': { ssr: false },
    '/keranjang': { ssr: false },
    '/checkout': { ssr: false },
    '/pembayaran/**': { ssr: false },
    '/orders/**': { ssr: false },
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
        { name: 'robots', content: 'index, follow' },
        // OpenGraph
        { property: 'og:site_name', content: 'Laut Berkah Abadi' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Laut Berkah Abadi | D2C Cold Chain Seafood Muncar' },
        {
          property: 'og:description',
          content: 'Pesan ikan segar Muncar dengan standar rantai dingin -20°C ke dapur Anda. Garansi kesegaran 100%.',
        },
        { property: 'og:image', content: '/brand/logo.webp' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Laut Berkah Abadi | D2C Cold Chain Seafood Muncar' },
        {
          name: 'twitter:description',
          content: 'Pesan ikan segar Muncar dengan standar rantai dingin -20°C ke dapur Anda. Garansi kesegaran 100%.',
        },
        { name: 'twitter:image', content: '/brand/logo.webp' },
      ],
      link: [
        { rel: 'icon', type: 'image/webp', href: '/brand/logo.webp' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap',
          media: 'print',
          onload: "this.media='all'",
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/material-symbols-outlined.woff2',
          crossorigin: '',
        },
      ],
      script: [
        {
          src: 'https://app.sandbox.midtrans.com/snap/snap.js',
          'data-client-key': 'Mid-client-vE8vECZNYD2RyXbI',
          async: true,
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
