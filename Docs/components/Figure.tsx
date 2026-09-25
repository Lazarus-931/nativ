import type { CSSProperties } from 'react';
import { ZoomableImage } from './ZoomableImage';

export function Figure({
  src,
  alt,
  width,
  caption,
}: {
  src: string;
  alt?: string;
  width?: number;
  caption?: string;
}) {
  const style: CSSProperties | undefined = width ? { maxWidth: `${width}px` } : undefined;
  return (
    <figure className="figure" style={style}>
      <ZoomableImage src={src} alt={alt || ''} caption={caption} />
      {caption ? <figcaption className="figure__caption">{caption}</figcaption> : null}
    </figure>
  );
}
