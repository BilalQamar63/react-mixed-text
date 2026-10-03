import { MixedText } from 'react-mixed-text';
import type { ReactElement } from 'react';
import { useState } from 'react';

// These seeds reproduce the arrangement of the original portfolio page.
const PARAGRAPHS = [
  { text: 'A little about who I am:', seed: 6, size: 'clamp(1.6rem, 5vw, 2.4rem)' },
  { text: 'I build software around real problems.', seed: 0, size: 'clamp(1.2rem, 3.5vw, 1.7rem)' },
  {
    text: 'I am a full-stack developer focused on building practical web applications and digital products.',
    seed: 2,
    size: 'clamp(1.1rem, 3vw, 1.5rem)',
  },
  { text: "That's the kind of work I enjoy.", seed: 9, size: 'clamp(1.3rem, 4vw, 2rem)' },
];

export function App(): ReactElement {
  const [shift, setShift] = useState(0);
  const [custom, setCustom] = useState('Mix any text you like, every word gets its own style.');

  return (
    <main>
      <div className="bar">
        <span>Shuffle offset: {shift}</span>
        <button type="button" onClick={() => setShift((n) => n + 1)}>
          Shuffle
        </button>
        <button type="button" onClick={() => setShift(0)}>
          Reset
        </button>
      </div>

      <div className="panel">
        {PARAGRAPHS.map((paragraph) => (
          <MixedText
            key={paragraph.text}
            text={paragraph.text}
            seed={paragraph.seed + shift}
            size={paragraph.size}
          />
        ))}
      </div>

      <div className="panel">
        <textarea rows={2} value={custom} onChange={(e) => setCustom(e.target.value)} />
        <MixedText
          text={custom}
          seed={shift}
          size={{ small: '1.25rem', medium: '1.6rem', large: '2rem' }}
        />
        <div className="bar">
          Resize the window: size is 1.25rem, 1.6rem or 2rem by screen width.
        </div>
      </div>
    </main>
  );
}
