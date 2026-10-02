import sanitizeHtml from 'sanitize-html';

export default function PostContent({html}: {html: string}) {
  const cleanHtml = sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe', 'u'],
    allowedAttributes: {
      '*': ['class', 'style'],
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'loading', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'title']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com'],
    allowedStyles: {
      '*': {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgb/i],
        'text-align': [/^(left|right|center|justify)$/],
        'font-family': [/^(IBM Plex Sans|Barlow)$/]
      }
    },
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {...attribs, rel: 'noopener noreferrer nofollow'}
      })
    }
  });

  return <div className="blog-prose" dangerouslySetInnerHTML={{__html: cleanHtml}} />;
}
