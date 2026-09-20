'use client';

import Image from 'next/image';
import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {createBrowserClient} from '@supabase/ssr';
import GlobalImageViewer from '@/components/ui/GlobalImageViewer';

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
  }
}

export default function PortfolioClient({
  html,
  locale,
  messages
}: {
  html: string;
  locale: string;
  messages: Messages;
}) {
  return (
    <>
      <div className="portfolio-app" dangerouslySetInnerHTML={{__html: html}} />
      <ProfileImagePortal />
      <PortfolioRuntime locale={locale} messages={messages} />
      <GlobalImageViewer />
    </>
  );
}

function ProfileImagePortal() {
  const [imageMount, setImageMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setImageMount(document.getElementById('profileImageMount'));
  }, []);

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

function PortfolioRuntime({locale, messages}: {locale: string; messages: Messages}) {

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
        delete window.__portfolioRuntimeLoaded;
        delete window.__portfolioRuntimeCleanupTimer;
      }, 0);
    };
  }, [locale, messages]);

  return null;
}
