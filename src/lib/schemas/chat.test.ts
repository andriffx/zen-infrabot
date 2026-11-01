import { describe, it, expect } from 'vitest';
import { chatRequestSchema, serverProfileSchema, chatSessionSchema } from './chat';

describe('chatRequestSchema', () => {
  it('validates a valid chat request payload with default options', () => {
    const input = {
      messages: [{ role: 'user', content: 'Kenapa docker container restart terus?' }]
    };
    const parsed = chatRequestSchema.parse(input);
    expect(parsed.model).toBe('gemini-3.5-flash');
    expect(parsed.temperature).toBe(0.3);
    expect(parsed.topP).toBe(0.85);
    expect(parsed.maxTokens).toBe(2048);
  });

  it('validates request with optional serverProfile', () => {
    const input = {
      messages: [{ role: 'user', content: 'Cek disk space' }],
      serverProfile: {
        os: 'Debian 12',
        techStack: 'Proxmox VE'
      }
    };
    const parsed = chatRequestSchema.parse(input);
    expect(parsed.serverProfile?.os).toBe('Debian 12');
    expect(parsed.serverProfile?.techStack).toBe('Proxmox VE');
  });

  it('validates user message with image even if text content is empty', () => {
    const input = {
      messages: [
        {
          role: 'user',
          content: '',
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
        }
      ]
    };
    const parsed = chatRequestSchema.parse(input);
    expect(parsed.messages[0].image).toBeDefined();
  });

  it('rejects image that exceeds maximum size length (>3,000,000 chars)', () => {
    const oversizedImage = 'data:image/png;base64,' + 'a'.repeat(3000001);
    expect(() =>
      chatRequestSchema.parse({
        messages: [{ role: 'user', content: 'test', image: oversizedImage }]
      })
    ).toThrow();
  });

  it('rejects empty messages array', () => {
    const input = { messages: [] };
    expect(() => chatRequestSchema.parse(input)).toThrow();
  });

  it('rejects message with empty content or out-of-range temperature', () => {
    expect(() =>
      chatRequestSchema.parse({
        messages: [{ role: 'user', content: '' }]
      })
    ).toThrow();

    expect(() =>
      chatRequestSchema.parse({
        messages: [{ role: 'user', content: 'test' }],
        temperature: 1.5
      })
    ).toThrow();
  });
});

describe('serverProfileSchema', () => {
  it('supplies default empty strings for unspecified fields', () => {
    const parsed = serverProfileSchema.parse({});
    expect(parsed.os).toBe('');
    expect(parsed.techStack).toBe('');
    expect(parsed.specs).toBe('');
    expect(parsed.notes).toBe('');
  });
});

describe('chatSessionSchema', () => {
  it('validates a full chat session object', () => {
    const now = Date.now();
    const session = {
      id: 'session-1',
      title: 'Docker Restart Issue',
      messages: [
        { role: 'user', content: 'Docker issue' },
        { role: 'assistant', content: 'Here is how to fix it' }
      ],
      createdAt: now,
      updatedAt: now
    };
    const parsed = chatSessionSchema.parse(session);
    expect(parsed.id).toBe('session-1');
    expect(parsed.messages).toHaveLength(2);
  });
});
