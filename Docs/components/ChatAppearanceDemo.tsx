import { useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const sizes = [
  { id: 'small', label: 'Small', scale: '85%' },
  { id: 'default', label: 'Default', scale: '100%' },
  { id: 'large', label: 'Large', scale: '150%' },
] as const;

type Theme = 'light' | 'dark';

export function ChatAppearanceDemo() {
  const [theme, setTheme] = useState<Theme>('light');
  const [sizeIndex, setSizeIndex] = useState(1);
  const size = sizes[sizeIndex];
  const image = `/assets/getting-started/customization/chat-${theme}-${size.id}-v2.png`;
  const description = `${theme === 'light' ? 'Light' : 'Dark'} mode with ${size.label.toLowerCase()} (${size.scale}) chat text`;

  return (
    <section className="chat-demo" aria-label="Interactive Nativ appearance preview">
      <div className="chat-demo__controls">
        <div className="chat-demo__control-group">
          <span className="chat-demo__label">Appearance</span>
          <div className="chat-demo__segmented" role="group" aria-label="Preview appearance">
            {(['light', 'dark'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={theme === option ? 'is-active' : undefined}
                aria-pressed={theme === option}
                onClick={() => setTheme(option)}
              >
                {option === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </div>

        <label className="chat-demo__size-control">
          <span className="chat-demo__label-row">
            <span className="chat-demo__label">Chat text size</span>
            <output>{size.label} · {size.scale}</output>
          </span>
          <div className="chat-demo__range-row">
            <span aria-hidden="true">A</span>
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={sizeIndex}
              aria-label="Preview chat text size"
              aria-valuetext={`${size.label}, ${size.scale}`}
              onChange={(event) => setSizeIndex(Number(event.target.value))}
            />
            <span className="chat-demo__large-a" aria-hidden="true">A</span>
          </div>
          <span className="chat-demo__ticks" aria-hidden="true">
            {sizes.map((option) => <span key={option.id}>{option.label}</span>)}
          </span>
        </label>
      </div>

      <figure className={`chat-demo__preview chat-demo__preview--${theme}`}>
        <img src={`${BASE}${image}`} alt={`Nativ chat preview: ${description}`} />
        <figcaption>{description}</figcaption>
      </figure>
    </section>
  );
}
