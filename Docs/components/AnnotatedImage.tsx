import type { CSSProperties } from 'react';
import { ZoomableImage } from './ZoomableImage';

type Callout = {
  x: number;
  y: number;
  label: string;
};

function parseCallouts(points?: string): Callout[] {
  if (!points) return [];

  return points
    .split(';')
    .map((point) => {
      const [rawX, rawY, ...labelParts] = point.split('|');
      return {
        x: Number(rawX),
        y: Number(rawY),
        label: labelParts.join('|').trim(),
      };
    })
    .filter(
      (point) =>
        Number.isFinite(point.x) &&
        Number.isFinite(point.y) &&
        point.label.length > 0,
    );
}

export function AnnotatedImage({
  src,
  alt,
  width,
  caption,
  points,
}: {
  src: string;
  alt?: string;
  width?: number;
  caption?: string;
  points?: string;
}) {
  const callouts = parseCallouts(points);
  const style: CSSProperties | undefined = width ? { maxWidth: `${width}px` } : undefined;

  return (
    <figure className="annotated-image" style={style}>
      <div className="annotated-image__frame">
        <ZoomableImage src={src} alt={alt || ''} caption={caption} />
        {callouts.map((point, index) => (
          <span
            aria-hidden="true"
            className="annotated-image__pin"
            key={`${point.x}-${point.y}-${point.label}`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            {index + 1}
          </span>
        ))}
      </div>
      {callouts.length > 0 ? (
        <ol className="annotated-image__legend">
          {callouts.map((point, index) => (
            <li key={point.label}>
              <span aria-hidden="true" className="annotated-image__legend-number">
                {index + 1}
              </span>
              <span>{point.label}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {caption ? <figcaption className="annotated-image__caption">{caption}</figcaption> : null}
    </figure>
  );
}
