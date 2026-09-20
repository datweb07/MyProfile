import fs from 'node:fs';
import path from 'node:path';
import PortfolioClient from '@/components/PortfolioClient';
import LocaleIntlProvider from '@/components/LocaleIntlProvider';
import englishMessages from '@/messages/en.json';
import vietnameseMessages from '@/messages/vi.json';

type Locale = 'en' | 'vi';

function getLegacyBody() {
  const source = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';

  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<img\s+class="profile-image"[\s\S]*?\/>/i, '<span id="profileImageMount" class="profile-image-mount"></span>')
    .replace(/\s*<div class="modal-overlay" id="imageModal">[\s\S]*?<img id="fullImage"[\s\S]*?<\/div>\s*<\/div>/i, '')
    .replaceAll('./pictures/', '/pictures/')
    .replaceAll('./musics/', '/musics/')
    .replaceAll('./documents/', '/documents/')
    .replaceAll('./messages/', '/messages/');
}

export default function LocalePortfolioPage({locale}: {locale: Locale}) {
  const messages = locale === 'vi' ? vietnameseMessages : englishMessages;

  return (
    <LocaleIntlProvider locale={locale} messages={messages}>
      <PortfolioClient html={getLegacyBody()} locale={locale} messages={messages} />
    </LocaleIntlProvider>
  );
}
