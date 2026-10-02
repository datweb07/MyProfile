'use client';

import {useEffect, useRef, useState} from 'react';
import {incrementPostView} from '@/lib/engagement-client';

export default function PostViewCounter({postId, initialViews}: {postId: string; initialViews: number}) {
  const [views, setViews] = useState(initialViews);
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    void incrementPostView(postId).then(({data, error}) => {
      if (!error && data !== null) setViews(Number(data));
    });
  }, [postId]);

  return <span aria-live="polite">{views} views</span>;
}
