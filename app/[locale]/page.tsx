import fs from 'node:fs';
import path from 'node:path';
import {getMessages} from 'next-intl/server';
import PortfolioClient from '@/components/PortfolioClient';

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

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const messages = await getMessages();

  return <PortfolioClient html={getLegacyBody()} locale={locale} messages={messages} />;
}
