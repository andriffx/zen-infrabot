import { describe, it, expect } from 'vitest';
import { extractFollowUpSuggestions } from './recommendations';

describe('extractFollowUpSuggestions', () => {
  it('returns empty suggestions and empty cleanContent when given empty content', () => {
    const result = extractFollowUpSuggestions('');
    expect(result).toEqual({ cleanContent: '', suggestions: [] });
  });

  it('returns original content and empty suggestions when tag is not present', () => {
    const content = 'Berikut adalah analisis log Docker container Anda.';
    const result = extractFollowUpSuggestions(content);
    expect(result.cleanContent).toBe(content);
    expect(result.suggestions).toEqual([]);
  });

  it('extracts valid JSON suggestions array and strips the comment from cleanContent', () => {
    const content = `Berikut solusinya:
1. Jalankan \`docker restart\`.

<!-- FOLLOW_UP_SUGGESTIONS: ["Bagaimana cara mengecek exit code?", "Tampilkan konfigurasi compose"] -->`;

    const result = extractFollowUpSuggestions(content);
    expect(result.cleanContent).toBe(
      `Berikut solusinya:\n1. Jalankan \`docker restart\`.`
    );
    expect(result.suggestions).toEqual([
      'Bagaimana cara mengecek exit code?',
      'Tampilkan konfigurasi compose'
    ]);
  });

  it('handles multi-line formatting inside the tag', () => {
    const content = `Analisis selesai.
<!-- FOLLOW_UP_SUGGESTIONS: [
  "Saran 1",
  "Saran 2"
] -->`;

    const result = extractFollowUpSuggestions(content);
    expect(result.cleanContent).toBe('Analisis selesai.');
    expect(result.suggestions).toEqual(['Saran 1', 'Saran 2']);
  });

  it('handles malformed JSON gracefully without throwing', () => {
    const content = `Teks jawaban. <!-- FOLLOW_UP_SUGGESTIONS: [invalid-json -->`;
    const result = extractFollowUpSuggestions(content);
    expect(result.cleanContent).toBe(content);
    expect(result.suggestions).toEqual([]);
  });
});

