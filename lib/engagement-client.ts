'use client';

const TOKEN_KEY = 'blog-engagement-token';

export function getEngagementToken() {
  let token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = window.crypto.randomUUID();
    window.localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export async function incrementPostView(postId: string) {
  const response = await fetch('/api/blog/engagement', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({action: 'view', postId, clientToken: getEngagementToken()}),
    keepalive: true
  });
  const payload = await response.json() as {data?: number; error?: string};
  return {data: payload.data ?? null, error: response.ok ? null : new Error(payload.error ?? 'Could not record view.')};
}

export async function sendEngagement(payload: Record<string, unknown>) {
  const response = await fetch('/api/blog/engagement', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({...payload, clientToken: getEngagementToken()})
  });
  const result = await response.json() as {data?: unknown; error?: string};
  if (!response.ok) throw new Error(result.error ?? 'Request failed.');
  return result.data;
}
