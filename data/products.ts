export interface ProductCutOption {
  type: 'utuh_bersih' | 'fillet_tanpa_kulit' | 'steak_melintang'
  label: string
  description: string
  yieldRatio: number
  yieldBadge: string
}

export interface Product {
  id: string
  slug: string
  name: string
  scientificName: string
  category: 'utuh' | 'fillet' | 'steak' | 'sup' | 'udang_cumi'
  pricePerKg: number
  unit: 'kg' | 'pack'
  packWeightGrams?: number
  stockKg: number
  exportGrade: string
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
  availableCuts: ProductCutOption[]
  supportsSoupBones: boolean
  isFeatured: boolean
  soldCount: number
  wishlistCount: number
  culinaryIdeas?: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: 'tenggiri-papan',
    slug: 'ikan-tenggiri-papan-segar',
    name: 'Ikan Tenggiri Papan Segar',
    scientificName: 'Scomberomorus commerson',
    category: 'utuh',
    pricePerKg: 92000,
    unit: 'kg',
    stockKg: 45,
    exportGrade: 'Grade Ekspor A',
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
      hero: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      texture: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      scaleSlip: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=800&q=80'
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
    supportsSoupBones: true,
    isFeatured: true,
    soldCount: 342,
    wishlistCount: 94,
    culinaryIdeas: ['Pempek', 'Siomay', 'Otak-otak', 'Bakso Ikan']
  },
  {
    id: 'kerapu-macan',
    slug: 'ikan-kerapu-macan-muncar',
    name: 'Ikan Kerapu Macan Muncar',
    scientificName: 'Epinephelus fuscoguttatus',
    category: 'utuh',
    pricePerKg: 85000,
    unit: 'kg',
    stockKg: 30,
    exportGrade: 'Grade Ekspor Super',
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
      hero: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80',
      texture: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      scaleSlip: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
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
    supportsSoupBones: true,
    isFeatured: true,
    soldCount: 185,
    wishlistCount: 68,
    culinaryIdeas: ['Tim Jahe Kecap', 'Sup Kuah Asam', 'Bakar Jimbaran']
  },
  {
    id: 'tongkol-lisong',
    slug: 'ikan-tongkol-lisong-segar',
    name: 'Ikan Tongkol Lisong Segar',
    scientificName: 'Auxis rochei',
    category: 'utuh',
    pricePerKg: 36000,
    unit: 'kg',
    stockKg: 80,
    exportGrade: 'Grade A Tangkapan Harian',
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
      hero: 'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80',
      texture: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      scaleSlip: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
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
    supportsSoupBones: true,
    isFeatured: false,
    soldCount: 520,
    wishlistCount: 112,
    culinaryIdeas: ['Pindang Bumbu Rujak', 'Balado Pedas', 'Tongkol Suwir Kemangi']
  },
  {
    id: 'lemuru-segar',
    slug: 'ikan-lemuru-segar-muncar',
    name: 'Ikan Lemuru Segar Muncar',
    scientificName: 'Sardinella lemuru',
    category: 'utuh',
    pricePerKg: 24000,
    unit: 'kg',
    stockKg: 120,
    exportGrade: 'Grade Pendaratan 05:30 WIB',
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
      hero: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      texture: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      scaleSlip: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
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
    supportsSoupBones: false,
    isFeatured: true,
    soldCount: 890,
    wishlistCount: 145,
    culinaryIdeas: ['Pindang Banyuwangi', 'Goreng Tepung', 'Pepes Daun']
  },
  {
    id: 'kakap-merah',
    slug: 'ikan-kakap-merah-muncar',
    name: 'Ikan Kakap Merah Muncar',
    scientificName: 'Lutjanus malabaricus',
    category: 'utuh',
    pricePerKg: 98000,
    unit: 'kg',
    stockKg: 25,
    exportGrade: 'Grade Ekspor A',
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
      hero: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      texture: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      scaleSlip: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
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
    supportsSoupBones: true,
    isFeatured: true,
    soldCount: 215,
    wishlistCount: 86,
    culinaryIdeas: ['Gulai Kepala Kakap', 'Bakar Jimbaran', 'Fillet Asam Manis']
  },
  {
    id: 'cumi-sero',
    slug: 'cumi-sero-segar-muncar',
    name: 'Cumi Sero Segar Muncar',
    scientificName: 'Photololigo duvaucelii',
    category: 'udang_cumi',
    pricePerKg: 78000,
    unit: 'kg',
    stockKg: 35,
    exportGrade: 'Grade A Cumi Jarum / Sero',
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
      hero: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
      texture: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      scaleSlip: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
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
    supportsSoupBones: false,
    isFeatured: true,
    soldCount: 268,
    wishlistCount: 73,
    culinaryIdeas: ['Cumi Saus Padang', 'Cumi Hitam Pedas', 'Calamari Crispy']
  },
  {
    id: 'kepala-kakap-merah',
    slug: 'kepala-dan-rahang-kakap-merah-segar',
    name: 'Kepala & Rahang Kakap Merah Segar',
    scientificName: 'Lutjanus malabaricus (Head & Collar)',
    category: 'sup',
    pricePerKg: 38000,
    unit: 'kg',
    stockKg: 15,
    exportGrade: 'Pilihan Restoran Seafood',
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
      hero: 'https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80',
      texture: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      scaleSlip: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
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
    supportsSoupBones: false,
    isFeatured: false,
    soldCount: 140,
    wishlistCount: 39,
    culinaryIdeas: ['Gulai Padang Gurih', 'Sup Bening Belimbing', 'Pindang Asam Segar']
  },
  {
    id: 'steak-tuna-yellowfin',
    slug: 'steak-tuna-yellowfin-200g',
    name: 'Steak Ikan Tuna Sirip Kuning (Yellowfin) 200g',
    scientificName: 'Thunnus albacares',
    category: 'steak',
    pricePerKg: 34000,
    unit: 'pack',
    packWeightGrams: 200,
    stockKg: 40,
    exportGrade: 'Grade Sashimi / Grill',
    catchMethod: 'Pancing Ulur Samudra Hindia',
    landingPort: 'Pelabuhan Muncar Banyuwangi',
    originZone: 'Samudra Hindia Selatan Jawa',
    description: 'Potongan steak tuna sirip kuning dengan warna ruby-red segar pekat. Dipotong presisi tebal 2.5 cm dan dikemas vacuum sealed higienis per porsi 200 gram.',
    qualityBadges: [
      'Grade Sashimi & Grill',
      'Ruby Red Bebas Karbon Monoksida',
      'Vacuum Sealed Pack',
      'Bebas Formalin'
    ],
    images: {
      hero: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?auto=format&fit=crop&w=800&q=80',
      texture: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
      scaleSlip: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
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
    supportsSoupBones: false,
    isFeatured: true,
    soldCount: 410,
    wishlistCount: 165,
    culinaryIdeas: ['Pan-Seared Steak', 'Tuna Teriyaki', 'Salad Sashimi']
  },
  {
    id: 'baronang-tulis',
    slug: 'fillet-ikan-baronang-tulis',
    name: 'Fillet Ikan Baronang Tulis',
    scientificName: 'Siganus javus',
    category: 'fillet',
    pricePerKg: 162090,
    unit: 'pack',
    packWeightGrams: 120,
    stockKg: 13,
    exportGrade: 'Grade Resto & Ekspor',
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
      hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKq4wj0SSDRfGxjw8Uowg7fUbiS5NUgPdgIV8ufwsH9m8qnWoCDd03VYxKOXZXkiKTkSTt0jgHRgM7--Vgf_oN90GNEzraTSixRwYrQqFrZk-nhcaYzeh1tnhiqLJ5lhorOydBeDn78xn9SN_hCPOx8UR_he7Q4saMhHQFaJJv7RrxlLHM_JR1S_xaGpXlXfXRHishJ2xIY9ucYozw-f4QNqF_JDeShY-yhg3icWsEXNj_57xVrsp_1w',
      texture: 'https://lh3.googleusercontent.com/aida/AEtjO1WwLof93E6LGMtVedhj4a7Vd-cMrwGO3RMidHHayttfFDqavnduO2WDbx58uVEdpWSqdvTB1BZ8nz0k5zXe3JYMme67fbx6MRGWjXhM2_-dCC9qP5JzKCFJBUyPJSeH7-10F-4f0dI8Rs__3QibhJDCb3b-exs7-1e5N8RXr6Dtj2iRCqn0bCPBiadbaZ8jHBeCgV8VhulK1X51BO92z7mLkUO8_qz88WiHXK8Xq6-esPXYQ8z06tv7Yahp',
      scaleSlip: 'https://lh3.googleusercontent.com/aida/AEtjO1XpAA_7I4IAuh4Jt92vzCoaGrm4FCNeimbDXBRk2uazVkwTJPTFZrikkQ9xgNRL0EDTiVv5_G5cXEY-FtaeRNU2typXuyvO73QKLx5jUCtxO8d881h03FlrqMUnPPbFKvKbBVgEwqpDep88jkxxwZX1-J9ShbQbjX5SwJjKD92Btz_Ew5QBfeRfQAVgD79QrPVRq2uacf_pm25NsQ297WqcioU72HP2PaDS0B83hHPAJya7uzSdiz5dEY0'
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
    supportsSoupBones: false,
    isFeatured: true,
    soldCount: 98,
    wishlistCount: 54,
    culinaryIdeas: ['Fillet Goreng Tepung', 'Fillet Tumis Taoco', 'Fillet Bakar Sambal']
  }
]

