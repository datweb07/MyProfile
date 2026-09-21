'use client';

import type {MouseEventHandler, ReactNode} from 'react';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/client';

export default function TrackedPostLink({postId, slug, children, className, title, newTab = true}: {
  postId: string;
  slug: string;
  children: ReactNode;
  className?: string;
  title?: string;
  newTab?: boolean;
}) {
  const trackView: MouseEventHandler<HTMLAnchorElement> = () => {
    void createClient().rpc('increment_post_views', {p_post_id: postId});
  };

  return (
    <Link className={className} href={`/blog/${slug}`} target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined} title={title} onClick={trackView}>
      {children}
    </Link>
  );
}
