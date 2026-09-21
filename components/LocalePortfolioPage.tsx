import fs from 'node:fs';
import path from 'node:path';
import PortfolioClient from '@/components/PortfolioClient';
import LocaleIntlProvider from '@/components/LocaleIntlProvider';
import englishMessages from '@/messages/en.json';
import vietnameseMessages from '@/messages/vi.json';
import {getPublishedPosts} from '@/lib/posts';
import type {PostCard as PostCardData} from '@/types/blog';

type Locale = 'en' | 'vi';

function getLegacyBody(locale: Locale) {
  const source = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';

  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<img\s+class="profile-image"[\s\S]*?\/>/i, '<span id="profileImageMount" class="profile-image-mount"></span>')
    .replace(/\s*<div class="modal-overlay" id="imageModal">[\s\S]*?<img id="fullImage"[\s\S]*?<\/div>\s*<\/div>/i, '')
    .replaceAll('./pictures/', '/pictures/')
    .replaceAll('./musics/', '/musics/')
    .replaceAll('./documents/', '/documents/')
    .replaceAll('./messages/', '/messages/')
    .replace(/href="\/en\/(home|journey|writing)"(?=\s+data-section-route)/g, `href="/${locale}/$1"`);
}

export default async function LocalePortfolioPage({locale}: {locale: Locale}) {
  const messages = locale === 'vi' ? vietnameseMessages : englishMessages;
  let posts: PostCardData[] = [];
  let postCount = 0;

  try {
    const result = await getPublishedPosts(1, 3);
    posts = result.posts;
    postCount = result.count;
  } catch {
    // Keep the portfolio available while the optional blog database is offline.
  }

  return (
    <LocaleIntlProvider locale={locale} messages={messages}>
      <PortfolioClient
        html={getLegacyBody(locale)}
        locale={locale}
        messages={messages}
        posts={posts}
        postCount={postCount}
      />
    </LocaleIntlProvider>
  );
}
