import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { useChat } from './use-chat';

describe('useChat helper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default stores', () => {
    const { messages, input, isLoading } = useChat();

    expect(get(messages)).toEqual([]);
    expect(get(input)).toBe('');
    expect(get(isLoading)).toBe(false);
  });

  it('initializes with initialMessages and initialInput if provided', () => {
    const initialMessages = [{ id: '1', role: 'user' as const, content: 'Test' }];
    const { messages, input } = useChat({
      initialMessages,
      initialInput: 'Halo'
    });

    expect(get(messages)).toEqual(initialMessages);
    expect(get(input)).toBe('Halo');
  });

  it('allows updating messages via setMessages', () => {
    const { messages, setMessages } = useChat();
    const newMessages = [{ id: '1', role: 'assistant' as const, content: 'Halo dunia' }];

    setMessages(newMessages);
    expect(get(messages)).toEqual(newMessages);

    setMessages([]);
    expect(get(messages)).toEqual([]);
  });

  it('handleSubmit ignores empty or whitespace input', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { input, handleSubmit, isLoading } = useChat();

    input.set('   ');
    await handleSubmit();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(get(isLoading)).toBe(false);
  });

  it('handleSubmit sends user message and streams AI response chunks', async () => {
    // Create a mock stream with AI SDK data stream chunks
    const chunks = [
      '0:"Halo! "\n',
      '0:"Ada yang bisa "\n',
      '0:"saya bantu?"\n',
      'd:{"finishReason":"stop"}\n'
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      }
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onFinish = vi.fn();
    const { messages, input, handleSubmit, isLoading } = useChat({
      api: '/api/chat',
      body: { model: 'gemini-2.5-flash' },
      onFinish
    });

    input.set('Bagaimana cara cek disk di Linux?');
    const submitPromise = handleSubmit();

    // Input should be cleared immediately
    expect(get(input)).toBe('');

    await submitPromise;

    expect(get(isLoading)).toBe(false);

    const msgs = get(messages);
    expect(msgs.length).toBe(2);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toBe('Bagaimana cara cek disk di Linux?');
    expect(msgs[1].role).toBe('assistant');
    expect(msgs[1].content).toBe('Halo! Ada yang bisa saya bantu?');

    expect(onFinish).toHaveBeenCalledWith({
      id: expect.any(String),
      role: 'assistant',
      content: 'Halo! Ada yang bisa saya bantu?'
    });
  });

  it('handleSubmit handles SSE stream with delta format from toUIMessageStreamResponse', async () => {
    const sseChunks = [
      'data: {"type":"start"}\n\n',
      'data: {"type":"start-step"}\n\n',
      'data: {"type":"text-delta","id":"0","delta":"Periksa status container dengan "}\n\n',
      'data: {"type":"text-delta","id":"0","delta":"`docker ps -a`."}\n\n',
      'data: {"type":"finish-step"}\n\n',
      'data: {"type":"finish"}\n\n',
      'data: [DONE]\n\n'
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of sseChunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      }
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' }
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onFinish = vi.fn();
    const { messages, input, handleSubmit, isLoading } = useChat({
      api: '/api/chat',
      onFinish
    });

    input.set('Mengapa Docker container restart terus?');
    await handleSubmit();

    expect(get(isLoading)).toBe(false);
    const msgs = get(messages);
    expect(msgs.length).toBe(2);
    expect(msgs[1].role).toBe('assistant');
    expect(msgs[1].content).toBe('Periksa status container dengan `docker ps -a`.');
    expect(onFinish).toHaveBeenCalledWith({
      id: expect.any(String),
      role: 'assistant',
      content: 'Periksa status container dengan `docker ps -a`.'
    });
  });

  it('handles SSE stream error event', async () => {
    const sseChunks = [
      'data: {"type":"start"}\n\n',
      'data: {"type":"error","errorText":"Model rate limit exceeded."}\n\n',
      'data: [DONE]\n\n'
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of sseChunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      }
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' }
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onError = vi.fn();
    const { messages, input, handleSubmit, isLoading } = useChat({
      onError
    });

    input.set('Test prompt');
    await handleSubmit();

    expect(get(isLoading)).toBe(false);
    const msgs = get(messages);
    expect(msgs.length).toBe(2);
    expect(msgs[1].role).toBe('assistant');
    expect(msgs[1].content).toContain('Model rate limit exceeded.');
    expect(onError).toHaveBeenCalled();
  });

  it('handles server error response gracefully', async () => {
    const mockResponse = new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onError = vi.fn();
    const { messages, input, handleSubmit, isLoading } = useChat({
      onError
    });

    input.set('Halo');
    await handleSubmit();

    expect(get(isLoading)).toBe(false);
    const msgs = get(messages);
    expect(msgs.length).toBe(2);
    expect(msgs[1].role).toBe('assistant');
    expect(msgs[1].content).toContain('GEMINI_API_KEY belum dikonfigurasi di server environment.');
    expect(onError).toHaveBeenCalled();
  });

  it('stop cancels active stream request and resets isLoading', async () => {
    let aborted = false;
    vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
      init?.signal?.addEventListener('abort', () => {
        aborted = true;
      });
      return new Promise(() => {}); // Never resolves
    });

    const { input, handleSubmit, isLoading, stop } = useChat();

    input.set('Perintah docker');
    handleSubmit(); // Do not await

    expect(get(isLoading)).toBe(true);
    stop();

    expect(aborted).toBe(true);
    expect(get(isLoading)).toBe(false);
  });

  it('handleSubmit sends image in user message and payload', async () => {
    let capturedBody: any;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      capturedBody = JSON.parse(init?.body as string);
      return new Response('0:"Analisis selesai"\n', {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    });

    const { handleSubmit } = useChat();
    await handleSubmit(undefined, { image: 'data:image/png;base64,1234' });

    expect(capturedBody).toBeDefined();
    expect(capturedBody.messages[0].image).toBe('data:image/png;base64,1234');
  });
});

