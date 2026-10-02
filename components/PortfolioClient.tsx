'use client';

import Image from 'next/image';
import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {createBrowserClient} from '@supabase/ssr';
import GlobalImageViewer from '@/components/ui/GlobalImageViewer';
import LatestWritingSection from '@/components/blog/LatestWritingSection';
import type {PostCard as PostCardData} from '@/types/blog';

type Messages = Record<string, unknown>;

declare global {
  interface Window {
    supabase?: {createClient: typeof createBrowserClient};
    __PORTFOLIO_LOCALE__?: string;
    __PORTFOLIO_MESSAGES__?: Messages;
    __portfolioCleanup?: () => void;
    __portfolioRuntimeLoaded?: boolean;
    __portfolioRuntimeCleanupTimer?: number;
    __SUPABASE_URL__?: string;
    __SUPABASE_ANON_KEY__?: string;
    __WEB3FORMS_ACCESS_KEY__?: string;
    __ORCID_URL__?: string;
  }
}

export default function PortfolioClient({
  html,
  locale,
  messages,
  posts,
  postCount,
  articleContent
}: {
  html: string;
  locale: string;
  messages: Messages;
  posts: PostCardData[];
  postCount: number;
  articleContent?: ReactNode;
}) {
  return (
    <>
      <div className="portfolio-app" dangerouslySetInnerHTML={{__html: html}} />
      <ProfileImagePortal html={html} />
      <LatestWritingPortal posts={posts} count={postCount} locale={locale} />
      <ArticlePortal content={articleContent} />
      <PortfolioRuntime locale={locale} messages={messages} layoutMode={articleContent ? 'article' : 'portfolio'} />
      <GlobalImageViewer />
    </>
  );
}

function ArticlePortal({content}: {content?: ReactNode}) {
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMount(document.getElementById('blogArticleMount'));
  }, [content]);

  if (!mount || !content) return null;
  return createPortal(content, mount);
}

function LatestWritingPortal({posts, count, locale}: {posts: PostCardData[]; count: number; locale: string}) {
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMount(document.getElementById('latestWritingMount'));
  }, [posts, count, locale]);

  if (!mount) return null;
  return createPortal(<LatestWritingSection posts={posts} count={count} locale={locale} />, mount);
}

function ProfileImagePortal({html}: {html: string}) {
  const [imageMount, setImageMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setImageMount(document.getElementById('profileImageMount'));
  }, [html]);

  if (!imageMount) return null;

  return createPortal(
    <Image
      className="profile-image"
      src="/pictures/img-main.png"
      alt="Dat Truong portrait"
      width={2052}
      height={2048}
      priority
      sizes="(max-width: 768px) 80vw, 42vw"
    />,
    imageMount
  );
}

function PortfolioRuntime({locale, messages, layoutMode}: {locale: string; messages: Messages; layoutMode: 'portfolio' | 'article'}) {

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.__portfolioRuntimeCleanupTimer) {
      window.clearTimeout(window.__portfolioRuntimeCleanupTimer);
      delete window.__portfolioRuntimeCleanupTimer;
    }

    window.__PORTFOLIO_LOCALE__ = locale;
    window.__PORTFOLIO_MESSAGES__ = messages;
    window.__SUPABASE_URL__ = process.env.NEXT_PUBLIC_SUPABASE_URL;
    window.__SUPABASE_ANON_KEY__ = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    window.__WEB3FORMS_ACCESS_KEY__ = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
    window.__ORCID_URL__ = process.env.NEXT_PUBLIC_ORCID_URL;
    window.supabase = {createClient: createBrowserClient};

    if (!window.__portfolioRuntimeLoaded) {
      window.__portfolioRuntimeLoaded = true;
      const runtime = document.createElement('script');
      runtime.src = '/portfolio-runtime.js';
      runtime.dataset.portfolioRuntime = 'true';
      runtime.onload = () => {
        document.dispatchEvent(new Event('DOMContentLoaded'));
        window.dispatchEvent(new Event('load'));
      };
      document.body.appendChild(runtime);
    }

    return () => {
      window.__portfolioRuntimeCleanupTimer = window.setTimeout(() => {
        window.__portfolioCleanup?.();
        document.querySelector('script[data-portfolio-runtime]')?.remove();
        delete window.__PORTFOLIO_MESSAGES__;
        delete window.__PORTFOLIO_LOCALE__;
        delete window.__SUPABASE_URL__;
        delete window.__SUPABASE_ANON_KEY__;
        delete window.__WEB3FORMS_ACCESS_KEY__;
        delete window.__ORCID_URL__;
        delete window.__portfolioRuntimeLoaded;
        delete window.__portfolioRuntimeCleanupTimer;
      }, 0);
    };
  }, [locale, messages, layoutMode]);

  return null;
}
