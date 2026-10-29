export interface ProductCutOption {
  type: 'utuh_bersih' | 'fillet_tanpa_kulit' | 'steak_melintang'
  label: string
  description: string
  yieldRatio: number
  yieldBadge: string
}

export interface CustomVariantTier1Option {
  id: string
  label: string
  weightValue: number
  price: number
  stock: number
  inStock: boolean
}

export interface CustomVariantTier2Option {
  id: string
  label: string
  priceDelta: number
  inStock: boolean
}

export interface CustomVariantsConfig {
  tier1: {
    name: string
    unit: 'gram' | 'kg'
    options: CustomVariantTier1Option[]
  }
  tier2: {
    enabled: boolean
    name: string
    options: CustomVariantTier2Option[]
  }
}

export interface Product {
  id: string
  slug: string
  name: string
  fishType?: string
  scientificName?: string
  category: 'Ikan Karang' | 'Ikan Pelagis' | 'Cumi & Gurita' | 'Udang & Krustasea' | 'Olahan & Sup' | string
  pricePerKg: number
  unit: 'kg' | 'pack'
  packWeightGrams?: number
  specWeight?: string
  specDimensions?: string
  stockKg: number
  exportGrade?: string
  catchMethod: string
  landingPort: string
  originZone: string
  description: string
  qualityBadges: string[]
  images: {
    hero: string
    texture: string
    scaleSlip: string
  }
  availableCuts?: ProductCutOption[]
  weightVariants?: Array<{
    grams: number
    price: number
    stock: number
    inStock: boolean
  }>
  customVariants?: CustomVariantsConfig
  supportsSoupBones: boolean
  isFeatured: boolean
  soldCount: number
  wishlistCount: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'tenggiri-papan',
    slug: 'ikan-tenggiri-papan-segar',
    name: 'Ikan Tenggiri Papan Segar',
    fishType: 'Ikan Tenggiri / Pelagis',
    scientificName: 'Scomberomorus commerson',
    specWeight: '100g - 270g per kemasan vakum',
    specDimensions: 'P 25-35 cm, L 8-12 cm',
    category: 'Ikan Pelagis',
    pricePerKg: 92000,
    unit: 'kg',
    stockKg: 45,
    catchMethod: 'Pancing Ulur Muncar (Non-Pukat)',
    landingPort: 'Pelabuhan Muncar Banyuwangi',
    originZone: 'Selat Bali & Samudra Hindia',
    description: 'Tenggiri papan segar tangkapan harian nelayan pancing ulur Muncar. Daging kenyal padat gurih tanpa suntik air, minim aroma amis, dan disimpan di atas es curah sejak kapal berlayar.',
    qualityBadges: [
      'Pancing Ulur Muncar',
      'Cold Chain 0 - 2°C Es Curah',
      'Tanpa Suntik Air',
      'Bebas Formalin'
    ],
    images: {
      hero: 'https://cdn.ammarabufadhel.my.id/products/ikan-kerapu-macan-muncar-texture-668bae1c.webp',
      texture: 'https://cdn.ammarabufadhel.my.id/products/ikan-kerapu-macan-muncar-texture-668bae1c.webp',
      scaleSlip: 'https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp'
    },
    availableCuts: [
      {
        type: 'utuh_bersih',
        label: 'Utuh Bersih',
        description: 'Kerok sisik, buang insang & isi perut',
        yieldRatio: 0.85,
        yieldBadge: '~850g/kg (Rendemen 85%)'
      },
      {
        type: 'fillet_tanpa_kulit',
        label: 'Fillet Tanpa Kulit',
        description: 'Daging murni tanpa tulang & duri',
        yieldRatio: 0.52,
        yieldBadge: '~520g/kg (Rendemen 52%)'
      },
      {
        type: 'steak_melintang',
        label: 'Steak Melintang',
        description: 'Potong bulat tebal 2.5 cm siap masak',
        yieldRatio: 0.80,
        yieldBadge: '~800g/kg (Rendemen 80%)'
      }
    ],
    customVariants: {
      tier1: {
        name: 'Pilihan Berat',
        unit: 'gram',
        options: [
          { id: 'opt-100', label: '100', weightValue: 0.1, price: 9500, stock: 20, inStock: true },
          { id: 'opt-150', label: '150', weightValue: 0.15, price: 14000, stock: 20, inStock: true },
          { id: 'opt-200', label: '200', weightValue: 0.2, price: 18500, stock: 20, inStock: true },
          { id: 'opt-250', label: '250', weightValue: 0.25, price: 23000, stock: 20, inStock: true }
        ]
      },
      tier2: {
        enabled: true,
        name: 'Jenis Potongan',
        options: [
          { id: 'cut-1', label: 'Fillet Tanpa Kulit', priceDelta: 0, inStock: true },
          { id: 'cut-2', label: 'Steak Melintang', priceDelta: 0, inStock: true }
        ]
      }
    },
    supportsSoupBones: true,
    isFeatured: true,
    soldCount: 342,
    wishlistCount: 94
  },
  {
    id: 'kerapu-macan',
    slug: 'ikan-kerapu-macan-muncar',
    name: 'Ikan Kerapu Macan Muncar',
    scientificName: 'Epinephelus fuscoguttatus',
    category: 'Ikan Karang',
    pricePerKg: 85000,
    unit: 'kg',
    stockKg: 30,
    catchMethod: 'Pancing Ulur Karang Selat Bali',
    landingPort: 'Pelabuhan Muncar Banyuwangi',
    originZone: 'Gugusan Karang Plawangan Muncar',
    description: 'Kerapu macan (cantang) kualitas restoran hidangan laut. Memiliki tekstur daging putih lembut berlapis gelatin alami yang sangat gurih saat dikukus saus jahe kecap asin.',
    qualityBadges: [
      'Pancing Ulur Karang',
      'Tekstur Daging Lembut',
      'Es Curah Higienis',
      'Bebas Formalin'
    ],
    images: {
      hero: 'https://cdn.ammarabufadhel.my.id/products/ikan-kerapu-macan-muncar-hero-b15ce231.webp',
      texture: 'https://cdn.ammarabufadhel.my.id/products/ikan-kerapu-macan-muncar-texture-668bae1c.webp',
      scaleSlip: 'https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp'
    },
    availableCuts: [
      {
        type: 'utuh_bersih',
        label: 'Utuh Bersih',
        description: 'Kerok sisik, buang insang & isi perut',
        yieldRatio: 0.85,
        yieldBadge: '~850g/kg (Rendemen 85%)'
      },
      {
        type: 'fillet_tanpa_kulit',
        label: 'Fillet Tanpa Kulit',
        description: 'Daging murni tanpa tulang & duri',
        yieldRatio: 0.52,
        yieldBadge: '~520g/kg (Rendemen 52%)'
      }
    ],
    customVariants: {
      tier1: {
        name: 'Pilihan Berat',
        unit: 'gram',
        options: [
          { id: 'opt-100', label: '100', weightValue: 0.1, price: 8500, stock: 15, inStock: true },
          { id: 'opt-150', label: '150', weightValue: 0.15, price: 13000, stock: 15, inStock: true },
          { id: 'opt-200', label: '200', weightValue: 0.2, price: 17000, stock: 15, inStock: true },
          { id: 'opt-250', label: '250', weightValue: 0.25, price: 21500, stock: 15, inStock: true }
        ]
      },
      tier2: {
        enabled: true,
        name: 'Pilihan Olahan',
        options: [
          { id: 'cut-1', label: 'Utuh Bersih', priceDelta: 0, inStock: true },
          { id: 'cut-2', label: 'Fillet Bersih', priceDelta: 2000, inStock: true }
        ]
      }
    },
    supportsSoupBones: true,
    isFeatured: true,
    soldCount: 185,
    wishlistCount: 68
  },
  {
    id: 'tongkol-lisong',
    slug: 'ikan-tongkol-lisong-segar',
    name: 'Ikan Tongkol Lisong Segar',
    scientificName: 'Auxis rochei',
    category: 'Ikan Pelagis',
    pricePerKg: 36000,
    unit: 'kg',
    stockKg: 80,
    catchMethod: 'Pancing Rawai Nelayan Muncar',
    landingPort: 'Pelabuhan Muncar Banyuwangi',
    originZone: 'Perairan Luar Teluk Pangpang',
    description: 'Tongkol lisong segar dengan ciri khas daging merah padat kaya asam lemak Omega-3. Sangat lezat dimasak bumbu sarden pedas, balado, atau diasap aroma kayu kelapa.',
    qualityBadges: [
      'Pancing Rawai Nelayan',
      'Kaya Omega-3 Alami',
      'Insang Merah Segar',
      'Bebas Pengawet'
    ],
    images: {
      hero: 'https://cdn.ammarabufadhel.my.id/products/ikan-tongkol-lisong-segar-hero-a990fbbd.webp',
      texture: 'https://cdn.ammarabufadhel.my.id/products/ikan-tongkol-lisong-segar-hero-a990fbbd.webp',
      scaleSlip: 'https://cdn.ammarabufadhel.my.id/qc/fillet-ikan-baronang-tulis-scaleSlip-502d9720.webp'
    },
    availableCuts: [
      {
        type: 'utuh_bersih',
        label: 'Utuh Bersih',
        description: 'Kerok sisik, buang insang & isi perut',
        yieldRatio: 0.85,
        yieldBadge: '~850g/kg (Rendemen 85%)'
      },
      {
        type: 'steak_melintang',
        label: 'Steak Melintang',
        description: 'Potong bulat tebal 2.5 cm siap masak',
        yieldRatio: 0.80,
        yieldBadge: '~800g/kg (Rendemen 80%)'
      }
    ],
    customVariants: {
      tier1: {
        name: 'Pilihan Berat',
        unit: 'gram',
        options: [
          { id: 'opt-100', label: '100', weightValue: 0.1, price: 5000, stock: 30, inStock: true },
          { id: 'opt-150', label: '150', weightValue: 0.15, price: 5500, stock: 30, inStock: true },
          { id: 'opt-200', label: '200', weightValue: 0.2, price: 7500, stock: 30, inStock: true },
          { id: 'opt-250', label: '250', weightValue: 0.25, price: 9000, stock: 30, inStock: true }
        ]
      },
      tier2: {
        enabled: false,
        name: 'Pilihan Potongan',
        options: [
          { id: 'cut-1', label: 'Potong Bulat Melintang', priceDelta: 0, inStock: true }
        ]
      }
    },
    supportsSoupBones: true,
    isFeatured: false,
    soldCount: 520,
    wishlistCount: 112
  },
  {
    id: 'lemuru-segar',
    slug: 'ikan-lemuru-segar-muncar',
    name: 'Ikan Lemuru Segar Muncar',
    scientificName: 'Sardinella lemuru',
    category: 'Ikan Pelagis',
    pricePerKg: 24000,
    unit: 'kg',
    stockKg: 120,
    catchMethod: 'Payang Tradisional Selat Bali',
    landingPort: 'Pelabuhan Muncar Banyuwangi',
    originZone: 'Selat Bali Muncar',
    description: 'Ikan lemuru ikonik Muncar yang terkenal dengan kandungan minyak ikan alaminya. Ditangkap subuh dan langsung dipacking dengan es curah higienis tanpa fermentasi.',
    qualityBadges: [
      'Ikan Khas Selat Bali',
      'Minyak Ikan Alami Tinggi',
      'Mata Jernih Bercahaya',
      'Bebas Formalin'
    ],
    images: {
      hero: 'https://cdn.ammarabufadhel.my.id/products/ikan-lemuru-segar-muncar-hero-5397da81.webp',
      texture: 'https://cdn.ammarabufadhel.my.id/products/ikan-lemuru-segar-muncar-hero-5397da81.webp',
      scaleSlip: 'https://cdn.ammarabufadhel.my.id/qc/fillet-ikan-baronang-tulis-scaleSlip-502d9720.webp'
    },
    availableCuts: [
      {
        type: 'utuh_bersih',
        label: 'Utuh Bersih',
        description: 'Buang insang & isi perut, sisik dibersihkan',
        yieldRatio: 0.85,
        yieldBadge: '~850g/kg (Rendemen 85%)'
      }
    ],
    customVariants: {
      tier1: {
        name: 'Pilihan Berat',
        unit: 'gram',
        options: [
          { id: 'opt-250', label: '250', weightValue: 0.25, price: 6000, stock: 50, inStock: true },
          { id: 'opt-500', label: '500', weightValue: 0.5, price: 12000, stock: 50, inStock: true },
          { id: 'opt-1000', label: '1000', weightValue: 1.0, price: 24000, stock: 50, inStock: true }
        ]
      },
      tier2: {
        enabled: false,
        name: 'Pilihan Olahan',
        options: [
          { id: 'cut-1', label: 'Utuh Bersih Siang', priceDelta: 0, inStock: true }
        ]
      }
    },
    supportsSoupBones: false,
    isFeatured: true,
    soldCount: 890,
    wishlistCount: 145
  },
  {
    id: 'kakap-merah',
    slug: 'ikan-kakap-merah-muncar',
    name: 'Ikan Kakap Merah Muncar',
    scientificName: 'Lutjanus malabaricus',
    category: 'Ikan Karang',
    pricePerKg: 98000,
    unit: 'kg',
    stockKg: 25,
    catchMethod: 'Pancing Ulur Karang Dalam Muncar',
    landingPort: 'Pelabuhan Muncar Banyuwangi',
    originZone: 'Perairan Karang Samudra Hindia',
    description: 'Kakap merah sisik cerah dengan daging putih berserat halus manis alami. Sangat cocok dibakar bumbu Jimbaran atau dibuat fillet crispy saus asam manis.',
    qualityBadges: [
      'Pancing Ulur Karang Dalam',
      'Tekstur Flaky Padat',
      'Rasa Manis Alami',
      'Bebas Formalin'
    ],
    images: {
      hero: 'https://cdn.ammarabufadhel.my.id/products/kakap-merah-karang-banyuwangi-primary-3f19ab8d.webp',
      texture: 'https://cdn.ammarabufadhel.my.id/products/kakap-merah-karang-banyuwangi-primary-3f19ab8d.webp',
      scaleSlip: 'https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp'
    },
    availableCuts: [
      {
        type: 'utuh_bersih',
        label: 'Utuh Bersih',
        description: 'Kerok sisik, buang insang & isi perut',
        yieldRatio: 0.85,
        yieldBadge: '~850g/kg (Rendemen 85%)'
      },
      {
        type: 'fillet_tanpa_kulit',
        label: 'Fillet Tanpa Kulit',
        description: 'Daging murni tanpa tulang & duri',
        yieldRatio: 0.52,
        yieldBadge: '~520g/kg (Rendemen 52%)'
      },
      {
        type: 'steak_melintang',
        label: 'Steak Melintang',
        description: 'Potong bulat tebal 2.5 cm siap masak',
        yieldRatio: 0.80,
        yieldBadge: '~800g/kg (Rendemen 80%)'
      }
    ],
    customVariants: {
      tier1: {
        name: 'Pilihan Berat',
        unit: 'gram',
        options: [
          { id: 'opt-100', label: '100', weightValue: 0.1, price: 10000, stock: 15, inStock: true },
          { id: 'opt-150', label: '150', weightValue: 0.15, price: 15000, stock: 15, inStock: true },
          { id: 'opt-200', label: '200', weightValue: 0.2, price: 19500, stock: 15, inStock: true },
          { id: 'opt-250', label: '250', weightValue: 0.25, price: 24500, stock: 15, inStock: true }
        ]
      },
      tier2: {
        enabled: true,
        name: 'Pilihan Olahan',
        options: [
          { id: 'cut-1', label: 'Utuh Bersih', priceDelta: 0, inStock: true },
          { id: 'cut-2', label: 'Fillet Bersih', priceDelta: 2500, inStock: true }
        ]
      }
    },
    supportsSoupBones: true,
    isFeatured: true,
    soldCount: 215,
    wishlistCount: 86
  },
  {
    id: 'cumi-sero',
    slug: 'cumi-sero-segar-muncar',
    name: 'Cumi Sero Segar Muncar',
    scientificName: 'Photololigo duvaucelii',
    category: 'Cumi & Gurita',
    pricePerKg: 78000,
    unit: 'kg',
    stockKg: 35,
    catchMethod: 'Pancing Cumi Lampu Malam Selat Bali',
    landingPort: 'Pelabuhan Muncar Banyuwangi',
    originZone: 'Selat Bali Bagian Selatan',
    description: 'Cumi sero segar berkulit bintik bening dengan kantong tinta utuh. Tekstur daging kenyal renyah alami tanpa pemutih kimia dan tidak susut berlebih saat dimasak.',
    qualityBadges: [
      'Badan Bening Kenyal',
      'Tinta Utuh Alami',
      'Tanpa Rendaman Es Tawar',
      'Bebas Pengawet'
    ],
    images: {
      hero: 'https://cdn.ammarabufadhel.my.id/products/cumi-sero-segar-muncar-hero-db3bf362.webp',
      texture: 'https://cdn.ammarabufadhel.my.id/products/cumi-sero-segar-muncar-hero-db3bf362.webp',
      scaleSlip: 'https://cdn.ammarabufadhel.my.id/qc/fillet-ikan-baronang-tulis-scaleSlip-502d9720.webp'
    },
    availableCuts: [
      {
        type: 'utuh_bersih',
        label: 'Utuh Bersih',
        description: 'Kupas kantong tinta, buang tulang rawan & mata',
        yieldRatio: 0.85,
        yieldBadge: '~850g/kg (Rendemen 85%)'
      }
    ],
    customVariants: {
      tier1: {
        name: 'Pilihan Berat',
        unit: 'gram',
        options: [
          { id: 'opt-100', label: '100', weightValue: 0.1, price: 8000, stock: 20, inStock: true },
          { id: 'opt-150', label: '150', weightValue: 0.15, price: 11500, stock: 20, inStock: true },
          { id: 'opt-200', label: '200', weightValue: 0.2, price: 15500, stock: 20, inStock: true },
          { id: 'opt-250', label: '250', weightValue: 0.25, price: 19500, stock: 20, inStock: true }
        ]
      },
      tier2: {
        enabled: false,
        name: 'Pilihan Kulit',
        options: [
          { id: 'cut-1', label: 'Tanpa Kulit', priceDelta: 0, inStock: true },
          { id: 'cut-2', label: 'Dengan Kulit', priceDelta: 0, inStock: false }
        ]
      }
    },
    supportsSoupBones: false,
    isFeatured: true,
    soldCount: 540,
    wishlistCount: 73
  },
  {
    id: 'kepala-kakap-merah',
    slug: 'kepala-dan-rahang-kakap-merah-segar',
    name: 'Kepala & Rahang Kakap Merah Segar',
    scientificName: 'Lutjanus malabaricus (Head & Collar)',
    category: 'Olahan & Sup',
    pricePerKg: 38000,
    unit: 'kg',
    stockKg: 15,
    catchMethod: 'Preparasi Cold Hub Muncar',
    landingPort: 'Fasilitas Cold Hub LBA Muncar',
    originZone: 'Muncar Banyuwangi',
    description: 'Bagian kepala dan rahang kakap merah segar dengan daging pipi yang sangat tebal dan gurih. Sudah dibelah dua dan dibersihkan insangnya, siap untuk gulai atau sup kepala ikan.',
    qualityBadges: [
      'Paling Cocok Gulai & Sup',
      'Insang Bersih Siap Masak',
      'Daging Pipi Tebal',
      'Bebas Formalin'
    ],
    images: {
      hero: 'https://cdn.ammarabufadhel.my.id/products/kakap-merah-karang-banyuwangi-primary-3f19ab8d.webp',
      texture: 'https://cdn.ammarabufadhel.my.id/products/kakap-merah-karang-banyuwangi-primary-3f19ab8d.webp',
      scaleSlip: 'https://cdn.ammarabufadhel.my.id/qc/ikan-kerapu-macan-muncar-scaleSlip-292250c2.webp'
    },
    availableCuts: [
      {
        type: 'utuh_bersih',
        label: 'Utuh Bersih',
        description: 'Belah dua bersih insang siap masak',
        yieldRatio: 1.0,
        yieldBadge: '100% Bagian Sup'
      }
    ],
    customVariants: {
      tier1: {
        name: 'Pilihan Berat',
        unit: 'gram',
        options: [
          { id: 'opt-500', label: '500', weightValue: 0.5, price: 19000, stock: 20, inStock: true },
          { id: 'opt-1000', label: '1000', weightValue: 1.0, price: 38000, stock: 20, inStock: true }
        ]
      },
      tier2: {
        enabled: false,
        name: 'Pilihan Olahan',
        options: [
          { id: 'cut-1', label: 'Belah Dua Bersih', priceDelta: 0, inStock: true }
        ]
      }
    },
    supportsSoupBones: false,
    isFeatured: false,
    soldCount: 140,
    wishlistCount: 39
  },
  {
    id: 'steak-tuna-yellowfin',
    slug: 'steak-tuna-yellowfin-200g',
    name: 'Steak Ikan Tuna Sirip Kuning (Yellowfin) 200g',
    scientificName: 'Thunnus albacares',
    category: 'Ikan Pelagis',
    pricePerKg: 34000,
    unit: 'pack',
    packWeightGrams: 200,
    stockKg: 40,
    catchMethod: 'Pancing Ulur Samudra Hindia',
    landingPort: 'Pelabuhan Muncar Banyuwangi',
    originZone: 'Samudra Hindia Selatan Jawa',
    description: 'Potongan steak tuna sirip kuning dengan warna ruby-red segar pekat. Dipotong presisi tebal 2.5 cm dan dikemas vacuum sealed higienis per porsi 200 gram.',
    qualityBadges: [
      'Daging Segar Pilihan',
      'Ruby Red Bebas Karbon Monoksida',
      'Vacuum Sealed Pack',
      'Bebas Formalin'
    ],
    images: {
      hero: 'https://cdn.ammarabufadhel.my.id/products/asset-1534483509719-49b99676.webp',
      texture: 'https://cdn.ammarabufadhel.my.id/products/asset-1534483509719-49b99676.webp',
      scaleSlip: 'https://cdn.ammarabufadhel.my.id/qc/fillet-ikan-baronang-tulis-scaleSlip-502d9720.webp'
    },
    availableCuts: [
      {
        type: 'steak_melintang',
        label: 'Steak Melintang',
        description: 'Potongan vacuum pack siap panggang',
        yieldRatio: 1.0,
        yieldBadge: 'Netto 200g Vakum'
      }
    ],
    customVariants: {
      tier1: {
        name: 'Pilihan Kemasan',
        unit: 'pack',
        options: [
          { id: 'opt-200g', label: '200g (1 Pack)', weightValue: 0.2, price: 34000, stock: 40, inStock: true }
        ]
      },
      tier2: {
        enabled: false,
        name: 'Pilihan Olahan',
        options: [
          { id: 'cut-1', label: 'Vakum Chilled', priceDelta: 0, inStock: true }
        ]
      }
    },
    supportsSoupBones: false,
    isFeatured: true,
    soldCount: 410,
    wishlistCount: 165
  },
  {
    id: 'baronang-tulis',
    slug: 'fillet-ikan-baronang-tulis',
    name: 'Fillet Ikan Baronang Tulis',
    scientificName: 'Siganus javus',
    category: 'Ikan Karang',
    pricePerKg: 162090,
    unit: 'pack',
    packWeightGrams: 120,
    stockKg: 13,
    catchMethod: 'Pancing Nelayan Selat Bali',
    landingPort: 'Pelabuhan Muncar Banyuwangi',
    originZone: 'Selat Bali & Muncar',
    description: 'Ikan Baronang Tulis pilihan tangkapan pancing nelayan Selat Bali. Memiliki tekstur daging yang putih, tebal, gurih alami, dan rendah duri halus. Fillet diproses secara bersih (skin-on), bebas lendir & kotoran, lalu segera divakum food-grade dan disimpan pada rantai dingin 0°C - 2°C untuk menjaga kesegaran tingkat sashimi.',
    qualityBadges: [
      'Segar Cold Chain',
      'Pancing Selat Bali',
      '100% Bebas Pengawet Kimia & Tanpa Suntik Air',
      'Timbangan Akurat Terverifikasi'
    ],
    images: {
      hero: 'https://cdn.ammarabufadhel.my.id/products/fillet-ikan-baronang-tulis-hero-47685fbf.webp',
      texture: 'https://cdn.ammarabufadhel.my.id/products/fillet-ikan-baronang-tulis-texture-bec184e3.webp',
      scaleSlip: 'https://cdn.ammarabufadhel.my.id/qc/fillet-ikan-baronang-tulis-scaleSlip-502d9720.webp'
    },
    availableCuts: [
      {
        type: 'fillet_tanpa_kulit',
        label: 'Fillet Segar Bersih (Skin-On)',
        description: 'Vakum food-grade chilled 0°C - 2°C',
        yieldRatio: 1.0,
        yieldBadge: 'Netto Siap Masak'
      }
    ],
    customVariants: {
      tier1: {
        name: 'Pilihan Kemasan',
        unit: 'pack',
        options: [
          { id: 'opt-120g', label: '120g (1 Pack)', weightValue: 0.12, price: 162090, stock: 13, inStock: true }
        ]
      },
      tier2: {
        enabled: false,
        name: 'Pilihan Olahan',
        options: [
          { id: 'cut-1', label: 'Skin-On Fillet', priceDelta: 0, inStock: true }
        ]
      }
    },
    supportsSoupBones: false,
    isFeatured: true,
    soldCount: 98,
    wishlistCount: 54
  }
]

export function normalizeProduct(bp: any): Product {
  const local = PRODUCTS.find(p => p.id === bp.id || p.slug === bp.slug)
  const heroImg = bp.images?.hero || bp.image_url || local?.images?.hero || ''
  const rawStock = bp.stockKg ?? bp.stock_kg
  const parsedStock = (rawStock !== undefined && rawStock !== null && !isNaN(Number(rawStock)))
    ? Number(rawStock)
    : (local?.stockKg ?? 0)
  return {
    id: bp.id,
    name: bp.name,
    fishType: bp.fishType || bp.fish_type || bp.category || local?.fishType || 'Ikan Laut Segar',
    scientificName: bp.scientificName || bp.latin_name || local?.scientificName || '',
    slug: bp.slug,
    category: bp.category || local?.category || 'utuh',
    pricePerKg: Number(bp.pricePerKg ?? bp.price_per_kg) || local?.pricePerKg || 0,
    originalPricePerKg: bp.originalPricePerKg ?? local?.originalPricePerKg,
    rating: Number(bp.rating) || local?.rating || 4.9,
    reviewCount: bp.reviewCount ?? bp.review_count ?? local?.reviewCount ?? 100,
    freshnessScore: bp.freshnessScore ?? bp.freshness_score ?? local?.freshnessScore ?? 98,
    catchMethod: bp.catchMethod ?? bp.catch_method ?? local?.catchMethod ?? 'Pancing Ulur Tradisional Muncar',
    landingTime: bp.landingTime ?? bp.landing_time ?? local?.landingTime ?? '05:30 WIB Subuh',
    storageTemp: bp.storageTemp ?? bp.storage_temp ?? local?.storageTemp ?? 'Chilled 1.5 C',
    images: bp.images || local?.images || { hero: heroImg, gallery: [heroImg] },
    stockKg: parsedStock,
    minOrderKg: Number(bp.minOrderKg ?? bp.min_order_kg) || local?.minOrderKg || 1,
    description: bp.description || local?.description || '',
    isFeatured: bp.isFeatured ?? bp.is_featured ?? local?.isFeatured ?? false,
    availableCuts: bp.availableCuts || local?.availableCuts || [
      { type: 'utuh_bersih', label: 'Utuh Bersih', yieldRatio: 0.85, description: 'Insang & jeroan dibuang' },
      { type: 'fillet_tanpa_kulit', label: 'Fillet Tanpa Kulit', yieldRatio: 0.52, description: 'Daging murni tanpa tulang' },
      { type: 'steak_melintang', label: 'Steak Melintang', yieldRatio: 0.80, description: 'Potong bulat melintang' },
    ],
    tags: bp.tags || local?.tags || ['Segar Muncar', 'Cold Chain'],
    unit: bp.unit || local?.unit || 'kg',
    soldCount: Number(bp.soldCount ?? bp.sold_count ?? local?.soldCount ?? 0),
    wishlistCount: Number(bp.wishlistCount ?? bp.wishlist_count ?? local?.wishlistCount ?? 0),
    qualityBadges: bp.qualityBadges || local?.qualityBadges || ['Tangkapan Hari Ini', 'Bebas Formalin'],
    supportsSoupBones: bp.supportsSoupBones ?? local?.supportsSoupBones ?? false,
    customVariants: bp.customVariants || bp.custom_variants || local?.customVariants || null
  } as Product
}

