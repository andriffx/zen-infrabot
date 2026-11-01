import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './+server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { INFRABOT_SYSTEM_PROMPT } from '#lib/server/prompt';

vi.mock('ai', () => ({
  streamText: vi.fn()
}));

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn()
}));

vi.mock('$app/env/private', () => ({
  get GEMINI_API_KEY() {
    return process.env.GEMINI_API_KEY;
  }
}));

describe('POST /api/chat', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.GEMINI_API_KEY = originalEnv;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  function createRequest(body: unknown, validJson = true): Request {
    return {
      json: validJson
        ? async () => body
        : async () => {
            throw new Error('Unexpected token');
          }
    } as unknown as Request;
  }

  it('returns 500 when GEMINI_API_KEY is not configured', async () => {
    const request = createRequest({
      messages: [{ role: 'user', content: 'Halo' }]
    });

    const response = await POST({ request } as any);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('GEMINI_API_KEY belum dikonfigurasi di server environment.');
  });

  it('returns 400 when request body contains invalid JSON', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const request = createRequest(null, false);

    const response = await POST({ request } as any);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Format JSON request tidak valid.');
  });

  it('returns 400 when input validation fails (empty messages)', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const request = createRequest({ messages: [] });

    const response = await POST({ request } as any);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Validasi input gagal.');
    expect(data.details).toBeDefined();
  });

  it('returns 400 when temperature is out of range', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const request = createRequest({
      messages: [{ role: 'user', content: 'Halo' }],
      temperature: 2.0
    });

    const response = await POST({ request } as any);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Validasi input gagal.');
  });

  it('successfully invokes streamText and returns streaming response', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockModelFn = vi.fn().mockReturnValue('mock-model-instance');
    vi.mocked(createGoogleGenerativeAI).mockReturnValue(mockModelFn as any);

    const mockResponse = new Response('stream data', { status: 200 });
    const mockToUIMessageStreamResponse = vi.fn().mockReturnValue(mockResponse);

    vi.mocked(streamText).mockReturnValue({
      toUIMessageStreamResponse: mockToUIMessageStreamResponse
    } as any);

    const request = createRequest({
      messages: [{ role: 'user', content: 'Bagaimana cara cek disk di Linux?' }],
      model: 'gemini-2.5-flash',
      temperature: 0.5,
      topP: 0.9,
      maxTokens: 1024
    });

    const response = await POST({ request } as any);

    expect(createGoogleGenerativeAI).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(mockModelFn).toHaveBeenCalledWith('gemini-2.5-flash');
    expect(streamText).toHaveBeenCalledWith({
      model: 'mock-model-instance',
      system: INFRABOT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: 'Bagaimana cara cek disk di Linux?' }],
      temperature: 0.5,
      topP: 0.9,
      maxOutputTokens: 1024
    });
    expect(mockToUIMessageStreamResponse).toHaveBeenCalled();
    expect(response).toBe(mockResponse);
  });

  it('formats image payload into multimodal parts for user message', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockModelFn = vi.fn().mockReturnValue('mock-model-instance');
    vi.mocked(createGoogleGenerativeAI).mockReturnValue(mockModelFn as any);

    const mockResponse = new Response('ok');
    vi.mocked(streamText).mockReturnValue({
      toUIMessageStreamResponse: vi.fn().mockReturnValue(mockResponse)
    } as any);

    const request = createRequest({
      messages: [
        {
          role: 'user',
          content: 'Cek screenshot error ini',
          image: 'data:image/png;base64,sample'
        }
      ]
    });

    await POST({ request } as any);

    const passedMessages = vi.mocked(streamText).mock.calls[0][0].messages as any[];
    expect(passedMessages[0].role).toBe('user');
    expect(Array.isArray(passedMessages[0].content)).toBe(true);
    expect(passedMessages[0].content).toEqual([
      { type: 'text', text: 'Cek screenshot error ini' },
      { type: 'file', data: 'data:image/png;base64,sample', mediaType: 'image/png' }
    ]);
  });

  it('truncates messages to the most recent 20 for context safety', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockModelFn = vi.fn().mockReturnValue('mock-model-instance');
    vi.mocked(createGoogleGenerativeAI).mockReturnValue(mockModelFn as any);

    const mockResponse = new Response('ok');
    vi.mocked(streamText).mockReturnValue({
      toUIMessageStreamResponse: vi.fn().mockReturnValue(mockResponse)
    } as any);

    const messages = Array.from({ length: 30 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Pesan ke-${i + 1}`
    }));

    const request = createRequest({ messages });
    await POST({ request } as any);

    const passedMessages = vi.mocked(streamText).mock.calls[0][0].messages;
    expect(passedMessages).toHaveLength(20);
    expect(passedMessages?.[0]?.content).toBe('Pesan ke-11');
    expect(passedMessages?.[19]?.content).toBe('Pesan ke-30');
  });

  it('handles stream errors gracefully by returning status 500', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockModelFn = vi.fn().mockReturnValue('mock-model-instance');
    vi.mocked(createGoogleGenerativeAI).mockReturnValue(mockModelFn as any);

    vi.mocked(streamText).mockImplementation(() => {
      throw new Error('Gemini API quota exceeded');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const request = createRequest({
      messages: [{ role: 'user', content: 'Test prompt' }]
    });

    const response = await POST({ request } as any);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain('Gemini API quota exceeded');

    consoleSpy.mockRestore();
  });

  it('formats high demand 503 errors with actionable guidance', async () => {
    process.env.GEMINI_API_KEY = 'test-key';

    const mockModelFn = vi.fn().mockReturnValue('mock-model-instance');
    vi.mocked(createGoogleGenerativeAI).mockReturnValue(mockModelFn as any);

    vi.mocked(streamText).mockImplementation(() => {
      throw new Error('This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const request = createRequest({
      messages: [{ role: 'user', content: 'Test prompt' }]
    });

    const response = await POST({ request } as any);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain('503 High Demand');
    expect(data.error).toContain('gemini-3.5-flash-lite');

    consoleSpy.mockRestore();
  });
});
