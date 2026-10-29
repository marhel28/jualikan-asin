import { defineEventHandler, setHeader } from 'h3'
import { PRODUCTS } from '~/data/products'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = (config.public?.siteUrl as string) || 'https://lautberkahabadi.com'
  const currentDate = new Date().toISOString().split('T')[0]

  const staticRoutes = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${siteUrl}/katalog`, priority: '0.9', changefreq: 'daily' },
    { loc: `${siteUrl}/tentang`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${siteUrl}/syarat-ketentuan`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${siteUrl}/kebijakan-privasi`, priority: '0.5', changefreq: 'monthly' },
  ]

  // ponytail: escape XML special characters to guarantee valid XML output
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const productRoutes = PRODUCTS.map((product) => ({
    loc: `${siteUrl}/produk/${product.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    image: product.images?.hero,
    title: product.name,
  }))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticRoutes.map(route => `  <url>
    <loc>${escapeXml(route.loc)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
${productRoutes.map(route => `  <url>
    <loc>${escapeXml(route.loc)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    ${route.image ? `<image:image>
      <image:loc>${escapeXml(route.image)}</image:loc>
      <image:title>${escapeXml(route.title)}</image:title>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
  return xml.trim()
})
