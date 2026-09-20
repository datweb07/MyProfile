import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

export default withNextIntl({
  images: {
    formats: ['image/avif', 'image/webp']
  }
});
