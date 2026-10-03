// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MixedText } from '../src';

afterEach(cleanup);

const TEXT = 'A little about who I am:';

describe('semantics and accessibility', () => {
  it('renders a paragraph by default and any requested element', () => {
    const { container, rerender } = render(<MixedText text="Hello" />);
    expect(container.firstElementChild?.tagName).toBe('P');
    rerender(<MixedText as="h2" text={TEXT} />);
    const heading = screen.getByRole('heading', { level: 2, name: TEXT });
    expect(heading.tagName).toBe('H2');
  });

  it('keeps the original text, with real spaces, as accessible name and text content', () => {
    const { container } = render(<MixedText as="h1" text={TEXT} />);
    const heading = screen.getByRole('heading', { level: 1, name: TEXT });
    expect(heading.textContent).toBe(TEXT);
    expect([...container.querySelectorAll('h1 > span')].map((s) => s.textContent)).toEqual(
      TEXT.split(' '),
    );
  });

  it('adds no ARIA of its own and forwards user attributes', () => {
    const { container } = render(
      <MixedText text="مرحبا بالعالم" lang="ar" dir="rtl" id="x" aria-describedby="d" />,
    );
    const el = container.firstElementChild;
    for (const name of ['role', 'aria-hidden', 'aria-label'])
      expect(el?.hasAttribute(name)).toBe(false);
    expect(el?.getAttribute('lang')).toBe('ar');
    expect(el?.getAttribute('dir')).toBe('rtl');
    expect(el?.getAttribute('id')).toBe('x');
    expect(el?.getAttribute('aria-describedby')).toBe('d');
  });

  it('renders newlines as <br> and keeps the words', () => {
    const { container } = render(<MixedText text={'one two\nthree'} />);
    expect(container.querySelectorAll('br')).toHaveLength(1);
    expect(container.textContent).toBe('one twothree');
  });

  it('renders empty text as an empty element', () => {
    const { container } = render(<MixedText text="" />);
    expect(container.firstElementChild?.childNodes).toHaveLength(0);
  });
});

describe('appearance', () => {
  it('styles every word with its own font', () => {
    const { container } = render(<MixedText text={TEXT} />);
    const spans = [...container.querySelectorAll('span')] as HTMLElement[];
    expect(spans).toHaveLength(6);
    expect(spans[0]?.style.fontStyle).toBe('italic');
    expect(spans[0]?.style.fontFamily).toContain('Fraunces');
    expect(spans[1]?.style.fontFamily).toContain('Abril Fatface');
    expect(spans[1]?.style.display).toBe('inline-block');
  });

  it('is stable across renders and responds to the seed', () => {
    const html = (seed: number): string =>
      render(<MixedText text="one two three four five" seed={seed} />).container.innerHTML;
    const first = html(3);
    cleanup();
    expect(html(3)).toBe(first);
    cleanup();
    expect(html(4)).not.toBe(first);
  });

  it('applies palette and fonts', () => {
    const { container } = render(
      <MixedText
        text="A little"
        seed={0}
        palette={{ ink: 'rgb(1, 2, 3)' }}
        fonts={{ fraunces: 'MyFont' }}
      />,
    );
    expect((container.firstElementChild as HTMLElement).style.color).toBe('rgb(1, 2, 3)');
    expect((container.querySelector('span') as HTMLElement).style.fontFamily).toBe('MyFont');
  });

  it('merges className and lets style override defaults', () => {
    const { container } = render(
      <MixedText text="Hi" className="mine" style={{ margin: '10px', color: 'blue' }} />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toBe('mine');
    expect(el.style.margin).toBe('10px');
    expect(el.style.color).toBe('blue');
    expect(el.style.lineHeight).toBe('1.2');
  });
});

describe('size', () => {
  it('sets a single size inline, from a string or a number', () => {
    const { container, rerender } = render(<MixedText text="Hi" size="clamp(1.5rem, 4vw, 3rem)" />);
    expect((container.firstElementChild as HTMLElement).style.fontSize).toBe(
      'clamp(1.5rem, 4vw, 3rem)',
    );
    rerender(<MixedText text="Hi" size={24} />);
    expect((container.firstElementChild as HTMLElement).style.fontSize).toBe('24px');
    expect(container.querySelector('style')).toBeNull();
  });

  it('uses a scoped media-query stylesheet for per-screen sizes', () => {
    const { container } = render(
      <MixedText
        as="h2"
        text="Hi there"
        size={{ small: '1.25rem', medium: '1.75rem', large: '2.5rem' }}
      />,
    );
    const css = container.querySelector('style')?.textContent ?? '';
    const heading = container.querySelector('h2');
    expect(heading?.className).toMatch(/^mt-/);
    expect(css).toContain(`@media (max-width:767.98px){.${heading?.className}{font-size:1.25rem}}`);
    expect(css).toContain('(min-width:768px) and (max-width:1023.98px)');
    expect(css).toContain('@media (min-width:1024px)');
    expect(css).toContain('font-size:2.5rem');
    expect(css).not.toContain('{S}');
  });

  it('only emits the breakpoints that were given', () => {
    const { container } = render(<MixedText text="Hi" size={{ large: '3rem' }} />);
    const css = container.querySelector('style')?.textContent ?? '';
    expect(css).toContain('min-width:1024px');
    expect(css).not.toContain('max-width');
  });
});

describe('safety', () => {
  it('renders text as text, never as markup', () => {
    const text = '<img src=x onerror="alert(1)"> <script>1</script>';
    const { container } = render(<MixedText text={text} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toBe(text);
  });

  it('refuses size values that could escape the stylesheet', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(
      <MixedText text="x" size={{ large: '1rem}</style><script>alert(1)</script>' }} />,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('style')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('warns once in development instead of throwing on bad input', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => render(<MixedText text="x" size={Number.NaN} />)).not.toThrow();
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
