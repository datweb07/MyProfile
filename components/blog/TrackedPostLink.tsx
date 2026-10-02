'use client';

import type {ReactNode} from 'react';
import Link from 'next/link';

export default function TrackedPostLink({slug, children, className, title, newTab = false}: {
  postId: string;
  slug: string;
  children: ReactNode;
  className?: string;
  title?: string;
  newTab?: boolean;
}) {
  return (
    <Link className={className} href={`/blog/${slug}`} target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined} title={title}>
      {children}
    </Link>
  );
}
