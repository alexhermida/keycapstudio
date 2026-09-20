import { describe, expect, it } from 'vitest';
import { detectLocale } from '../src/i18n';

describe('locale detection', () => {
  it('uses the first supported browser language, including a regional tag', () => {
    expect(detectLocale(['gl-ES', 'es-ES'])).toBe('gl');
    expect(detectLocale(['fr-FR', 'es-MX'])).toBe('es');
  });

  it('falls back to English', () => {
    expect(detectLocale(['fr-FR'])).toBe('en');
  });
});
