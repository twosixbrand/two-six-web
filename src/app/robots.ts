import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cart',
          '/checkout',
          '/checkout/success',
          '/login',
          '/login/otp',
          '/orders',
          '/profile',
          '/tracking',
          '/unsubscribe',
          '/mantenimiento',
          '/api/sentry-example-api/',
          '/sentry-example-page',
        ],
      },
    ],
    sitemap: 'https://twosixweb.com/sitemap.xml',
  };
}

