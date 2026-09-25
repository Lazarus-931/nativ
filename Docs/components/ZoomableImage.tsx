import { useEffect, useId, useRef, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function ZoomableImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const descriptionId = useId();
  const resolvedSrc = `${BASE}${src}`;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const close = closeRef.current;
      if (!close) return;
      event.preventDefault();
      close.focus();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="media-trigger"
        aria-label={`Enlarge image: ${alt}`}
        onClick={() => setOpen(true)}
      >
        <img src={resolvedSrc} alt={alt} loading="lazy" decoding="async" />
        <span className="media-trigger__expand" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Expanded image: ${alt}`}
          aria-describedby={caption ? descriptionId : undefined}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <div className="media-lightbox__panel">
            <button
              ref={closeRef}
              type="button"
              className="media-lightbox__close"
              aria-label="Close expanded image"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
            <img src={resolvedSrc} alt={alt} />
            {caption ? <p id={descriptionId} className="media-lightbox__caption">{caption}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
