// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MixedText } from '../src';

describe('server rendering', () => {
  it('runs without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the same markup every time', () => {
    const element = <MixedText as="h1" text="A little about who I am:" seed={6} />;
    const html = renderToString(element);
    expect(renderToString(element)).toBe(html);
    expect(html.startsWith('<h1 style="')).toBe(true);
    expect([...html.matchAll(/<span [^>]*>([^<]*)<\/span>/g)].map((m) => m[1])).toEqual([
      'A',
      'little',
      'about',
      'who',
      'I',
      'am:',
    ]);
  });

  it('keeps quotes in font names intact inside the sized stylesheet', () => {
    const html = renderToString(
      <MixedText
        text="x"
        size={{ large: 'calc(1rem + 1vw)' }}
        fonts={{ playfair: '"Playfair Display", serif' }}
      />,
    );
    expect(html).toContain('@media (min-width:1024px)');
    expect(html).toContain('calc(1rem + 1vw)');
  });
});
