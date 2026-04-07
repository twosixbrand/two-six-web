import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

// Revalidate every hour — Google fetches every 24h, this ensures fresh data
export const revalidate = 3600;

/** Google Product Category mapping based on Two Six's typeClothing values */
const GOOGLE_CATEGORY_MAP: Record<string, string> = {
  'camiseta': '212',     // Apparel & Accessories > Clothing > Shirts & Tops
  'polo': '212',          // Apparel & Accessories > Clothing > Shirts & Tops
  'camisa': '212',        // Apparel & Accessories > Clothing > Shirts & Tops
  'buso': '5388',         // Apparel & Accessories > Clothing > Outerwear > Sweaters (Hoodies)
  'chaqueta': '3066',     // Apparel & Accessories > Clothing > Outerwear > Coats & Jackets
  'pantalon largo': '204', // Apparel & Accessories > Clothing > Pants
  'jean': '204',          // Apparel & Accessories > Clothing > Pants
  'pantalon corto': '207', // Apparel & Accessories > Clothing > Shorts
  'calzado': '187',       // Apparel & Accessories > Shoes
  'gorra': '173',         // Apparel & Accessories > Clothing Accessories > Hats
  'vestido': '2271',      // Apparel & Accessories > Clothing > Dresses
};

/** Map Two Six gender names to Google's specification */
function mapGender(genderName: string): string {
  const normalized = genderName.toLowerCase().trim();
  if (normalized === 'masculino' || normalized === 'male') return 'male';
  if (normalized === 'femenino' || normalized === 'female') return 'female';
  return 'unisex';
}

/** Escape special XML characters */
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface FeedProduct {
  id: number;
  sku: string;
  price: number;
  discount_price: number | null;
  discount_percentage: number | null;
  active: boolean;
  quantity_available: number;
  slug: string | null;
  color_name: string | null;
  size_name: string | null;
  design_reference: string | null;
  design_description: string | null;
  clothing_name: string;
  gender_name: string;
  type_clothing_name: string | null;
  category_name: string | null;
  image_url: string | null;
  additional_images: string[];
}

function buildProductXml(product: FeedProduct, baseUrl: string): string {
  const productUrl = product.slug
    ? `${baseUrl}/product/${product.slug}`
    : `${baseUrl}/product/${product.id}`;

  const availability = product.quantity_available > 0 ? 'in_stock' : 'out_of_stock';

  // Build title: Clothing Name + Color + Size (Google best practice for apparel)
  const titleParts = [product.clothing_name];
  if (product.color_name) titleParts.push(product.color_name);
  if (product.size_name) titleParts.push(product.size_name);
  const title = titleParts.join(' - ');

  // Description: use design description or generate a descriptive fallback
  const description = product.design_description
    || `${product.clothing_name} de Two Six. Ropa colombiana con estilo y confort.`;

  // Price formatting: "89900.00 COP"
  const priceFormatted = `${product.price.toFixed(2)} COP`;

  // Sale price (if discount exists)
  const salePriceLine = product.discount_price
    ? `      <g:sale_price>${product.discount_price.toFixed(2)} COP</g:sale_price>`
    : '';

  // Google Product Category
  const typeKey = (product.type_clothing_name || '').toLowerCase().trim();
  const googleCategory = GOOGLE_CATEGORY_MAP[typeKey] || '1604'; // 1604 = Apparel & Accessories > Clothing (generic)

  // Gender
  const gender = mapGender(product.gender_name);

  // Image
  const imageLink = product.image_url || '';

  // Additional images (max 10)
  const additionalImageLines = product.additional_images
    .map((url) => `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`)
    .join('\n');

  // Shipping is managed directly in Google Merchant Center rules
  // Removed <g:shipping> block to avoid hardcoded 8000 COP overriding the free shipping threshold

  return `    <item>
      <g:id>${escapeXml(product.sku)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
${additionalImageLines ? additionalImageLines + '\n' : ''}      <g:availability>${availability}</g:availability>
      <g:price>${priceFormatted}</g:price>
${salePriceLine ? salePriceLine + '\n' : ''}      <g:brand>Two Six</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>false</g:identifier_exists>
      <g:mpn>${escapeXml(product.sku)}</g:mpn>
      <g:item_group_id>${escapeXml(product.design_reference || String(product.id))}</g:item_group_id>
${product.color_name ? `      <g:color>${escapeXml(product.color_name)}</g:color>\n` : ''}${product.size_name ? `      <g:size>${escapeXml(product.size_name)}</g:size>\n` : ''}      <g:gender>${gender}</g:gender>
      <g:age_group>adult</g:age_group>
      <g:google_product_category>${googleCategory}</g:google_product_category>
${product.type_clothing_name ? `      <g:product_type>${escapeXml(`Ropa > ${product.type_clothing_name}`)}</g:product_type>` : ''}
    </item>`;
}

export async function GET() {
  try {
    const baseUrl = 'https://twosixweb.com';

    // Fetch all products from the backend feed endpoint
    const products = await apiClient<FeedProduct[]>('/products/feed');

    // Filter out products without images (Google requires an image)
    const validProducts = products.filter((p) => p.image_url);

    // Build XML feed
    const itemsXml = validProducts.map((p) => buildProductXml(p, baseUrl)).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Two Six - Catálogo de Productos</title>
    <link>${baseUrl}</link>
    <description>Ropa colombiana con estilo y confort. Diseños exclusivos hechos en Medellín.</description>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error generating Google Merchant Center feed:', error);

    // Return a valid but empty feed on error
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Two Six - Catálogo de Productos</title>
    <link>https://twosixweb.com</link>
    <description>Feed temporarily unavailable</description>
  </channel>
</rss>`;

    return new NextResponse(errorXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
