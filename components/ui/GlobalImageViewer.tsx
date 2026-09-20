'use client';

import {PointerEvent, WheelEvent, useCallback, useEffect, useRef, useState} from 'react';

type ImageInfo = {src: string; alt: string};
type Point = {x: number; y: number};
type IconName = 'rotate-left' | 'rotate-right' | 'flip' | 'minus' | 'plus' | 'reset' | 'close';

const MIN_SCALE = 0.25;
const MAX_SCALE = 6;
const SCALE_STEP = 0.25;

export default function GlobalImageViewer() {
  const [image, setImage] = useState<ImageInfo | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [position, setPosition] = useState<Point>({x: 0, y: 0});
  const dragStart = useRef<Point | null>(null);
  const positionStart = useRef<Point>({x: 0, y: 0});

  const reset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setFlipped(false);
    setPosition({x: 0, y: 0});
  }, []);

  const close = useCallback(() => {
    setImage(null);
    reset();
  }, [reset]);

  const changeScale = useCallback((amount: number) => {
    setScale((current) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, current + amount)));
  }, []);

  useEffect(() => {
    const openFromClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (target.closest('[data-image-viewer]') || target.dataset.noPreview === 'true') return;

      const src = target.currentSrc || target.src;
      if (!src) return;
      event.preventDefault();
      setImage({src, alt: target.alt || 'Image preview'});
      reset();
    };

    document.addEventListener('click', openFromClick, true);
    return () => document.removeEventListener('click', openFromClick, true);
  }, [reset]);

  useEffect(() => {
    if (!image) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === '+' || event.key === '=') changeScale(SCALE_STEP);
      if (event.key === '-') changeScale(-SCALE_STEP);
      if (event.key.toLowerCase() === 'r') setRotation((value) => value + 90);
      if (event.key.toLowerCase() === 'l') setRotation((value) => value - 90);
      if (event.key.toLowerCase() === 'h') setFlipped((value) => !value);
      if (event.key === '0') reset();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [changeScale, close, image, reset]);

  if (!image) return null;

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    changeScale(event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP);
  };

  const onPointerDown = (event: PointerEvent<HTMLImageElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {x: event.clientX, y: event.clientY};
    positionStart.current = position;
  };

  const onPointerMove = (event: PointerEvent<HTMLImageElement>) => {
    if (!dragStart.current) return;
    setPosition({
      x: positionStart.current.x + event.clientX - dragStart.current.x,
      y: positionStart.current.y + event.clientY - dragStart.current.y
    });
  };

  const onPointerUp = (event: PointerEvent<HTMLImageElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStart.current = null;
  };

  return (
    <div
      className="global-image-viewer"
      data-image-viewer
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer: ${image.alt}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      onWheel={onWheel}
    >
      <button className="image-viewer-close" type="button" onClick={close} title="Close (Esc)" aria-label="Close image viewer">
        <ViewerIcon name="close" />
      </button>

      <div className="image-viewer-stage">
        {/* A native img supports local, optimized and future remote image URLs uniformly. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          draggable={false}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { dragStart.current = null; }}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${rotation}deg) scale(${flipped ? -scale : scale}, ${scale})`
          }}
        />
      </div>

      <div className="image-viewer-toolbar" aria-label="Image controls">
        <button type="button" onClick={() => setRotation((value) => value - 90)} title="Rotate left (L)" aria-label="Rotate left"><ViewerIcon name="rotate-left" /></button>
        <button type="button" onClick={() => setRotation((value) => value + 90)} title="Rotate right (R)" aria-label="Rotate right"><ViewerIcon name="rotate-right" /></button>
        <button type="button" onClick={() => setFlipped((value) => !value)} title="Flip horizontally (H)" aria-label="Flip horizontally"><ViewerIcon name="flip" /></button>
        <span className="image-viewer-divider" aria-hidden="true" />
        <button type="button" onClick={() => changeScale(-SCALE_STEP)} title="Zoom out (-)" aria-label="Zoom out"><ViewerIcon name="minus" /></button>
        <output aria-live="polite" title="Current zoom">{Math.round(scale * 100)}%</output>
        <button type="button" onClick={() => changeScale(SCALE_STEP)} title="Zoom in (+)" aria-label="Zoom in"><ViewerIcon name="plus" /></button>
        <button type="button" onClick={reset} title="Reset image (0)" aria-label="Reset image"><ViewerIcon name="reset" /></button>
      </div>
    </div>
  );
}

function ViewerIcon({name}: {name: IconName}) {
  const paths: Record<IconName, React.ReactNode> = {
    'rotate-left': <><path d="M9 7H4v-5" /><path d="M4.5 7A8 8 0 1 1 4 15" /></>,
    'rotate-right': <><path d="M15 7h5v-5" /><path d="M19.5 7A8 8 0 1 0 20 15" /></>,
    flip: <><path d="M3 7h18" /><path d="m7 3-4 4 4 4" /><path d="m17 13 4 4-4 4" /><path d="M21 17H3" /></>,
    minus: <path d="M5 12h14" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    reset: <><path d="M4 4v6h6" /><path d="M5.5 16a8 8 0 1 0 1-9L4 10" /></>,
    close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}
