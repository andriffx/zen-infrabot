import { writable, type Writable, get } from 'svelte/store';
import type { Message } from '#lib/schemas/chat';

export type { Message };

export interface UseChatOptions {
  api?: string;
  initialMessages?: Message[];
  initialInput?: string;
  body?: Record<string, unknown> | (() => Record<string, unknown>);
  headers?: Record<string, string>;
  onResponse?: (response: Response) => void | Promise<void>;
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export interface UseChatHelpers {
  messages: Writable<Message[]>;
  input: Writable<string>;
  isLoading: Writable<boolean>;
  handleSubmit: (
    event?: { preventDefault?: () => void },
    chatRequestOptions?: { data?: Record<string, any>; image?: string }
  ) => Promise<void>;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
  reload: () => Promise<void>;
  append: (message: Message) => Promise<void>;
}

export function useChat(options: UseChatOptions = {}): UseChatHelpers {
  const {
    api = '/api/chat',
    initialMessages = [],
    initialInput = '',
    headers = {},
    onResponse,
    onFinish,
    onError
  } = options;

  const messages = writable<Message[]>(initialMessages);
  const input = writable<string>(initialInput);
  const isLoading = writable<boolean>(false);

  let abortController: AbortController | null = null;

  function stop() {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    isLoading.set(false);
  }

  function setMessages(newMessages: Message[]) {
    messages.set(newMessages);
  }

  async function triggerChat(chatMessages: Message[]) {
    stop();
    isLoading.set(true);

    abortController = new AbortController();
    const currentAbortController = abortController;

    const assistantId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11);

    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: ''
    };

    messages.set([...chatMessages, assistantMsg]);

    // Resolve dynamic body properties (like getters)
    const extraBody = typeof options.body === 'function' ? options.body() : { ...options.body };

    const payload = {
      messages: chatMessages
        .filter((m) => (m.content && m.content.trim().length > 0) || !!m.image)
        .map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.image ? { image: m.image } : {})
        })),
      ...extraBody
    };

    let assistantContent = '';

    function updateAssistant(content: string) {
      assistantContent = content;
      messages.update((prev) =>
        prev.map((msg) => (msg.id === assistantId ? { ...msg, content: assistantContent } : msg))
      );
    }

    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload),
        signal: currentAbortController.signal
      });

      if (onResponse) {
        await onResponse(response);
      }

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch {
          // ignore json parse error
        }
        updateAssistant(`⚠️ ${errorMsg}`);
        const err = new Error(errorMsg);
        onError?.(err);
        return;
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let isDataStream = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // AI SDK Data Stream protocol: "0:\"chunk\"\n"
          if (trimmed.startsWith('0:')) {
            isDataStream = true;
            try {
              const text = JSON.parse(trimmed.slice(2));
              if (typeof text === 'string') {
                updateAssistant(assistantContent + text);
              }
            } catch {
              // ignore parse errors on malformed lines
            }
          } else if (trimmed.startsWith('data:')) {
            // Server-sent events protocol: "data: ..."
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') continue;
            let parsed: any;
            try {
              parsed = JSON.parse(dataStr);
            } catch {
              if (!dataStr.startsWith('{')) {
                updateAssistant(assistantContent + dataStr);
              }
              continue;
            }

            if (parsed && typeof parsed === 'object') {
              if (parsed.type === 'error') {
                const errorMsg =
                  parsed.errorText ||
                  parsed.error ||
                  'Terjadi kesalahan saat streaming respon AI.';
                throw new Error(errorMsg);
              }
              const text =
                parsed.delta ??
                parsed.textDelta ??
                parsed.text ??
                parsed.content ??
                '';
              if (text) {
                updateAssistant(assistantContent + text);
              }
            } else if (typeof parsed === 'string') {
              updateAssistant(assistantContent + parsed);
            }
          } else if (
            !isDataStream &&
            !trimmed.startsWith('d:') &&
            !trimmed.startsWith('e:') &&
            !trimmed.startsWith('f:')
          ) {
            // Plain text stream fallback
            updateAssistant(assistantContent + line + '\n');
          }
        }
      }

      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('0:')) {
          try {
            const text = JSON.parse(trimmed.slice(2));
            if (typeof text === 'string') {
              updateAssistant(assistantContent + text);
            }
          } catch {
            // ignore
          }
        } else if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim();
          if (dataStr !== '[DONE]') {
            let parsed: any;
            try {
              parsed = JSON.parse(dataStr);
            } catch {
              if (!dataStr.startsWith('{')) {
                updateAssistant(assistantContent + dataStr);
              }
              parsed = null;
            }

            if (parsed && typeof parsed === 'object') {
              if (parsed.type === 'error') {
                const errorMsg =
                  parsed.errorText ||
                  parsed.error ||
                  'Terjadi kesalahan saat streaming respon AI.';
                throw new Error(errorMsg);
              }
              const text =
                parsed.delta ??
                parsed.textDelta ??
                parsed.text ??
                parsed.content ??
                '';
              if (text) {
                updateAssistant(assistantContent + text);
              }
            } else if (typeof parsed === 'string') {
              updateAssistant(assistantContent + parsed);
            }
          }
        } else if (!isDataStream && !trimmed.startsWith('d:') && !trimmed.startsWith('e:')) {
          updateAssistant(assistantContent + buffer);
        }
      }

      onFinish?.({ id: assistantId, role: 'assistant', content: assistantContent });
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Stream aborted by user via stop()
        return;
      }
      const errorMsg = error?.message || 'Gagal memproses pesan.';
      updateAssistant(`⚠️ Terjadi kesalahan: ${errorMsg}`);
      onError?.(error instanceof Error ? error : new Error(errorMsg));
    } finally {
      isLoading.set(false);
      abortController = null;
    }
  }

  async function handleSubmit(
    event?: { preventDefault?: () => void },
    chatRequestOptions?: { data?: Record<string, any>; image?: string }
  ) {
    event?.preventDefault?.();
    const currentInput = get(input).trim();
    const image = chatRequestOptions?.image;
    if ((!currentInput && !image) || get(isLoading)) {
      return;
    }

    const userId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11);

    const userMsg: Message = {
      id: userId,
      role: 'user',
      content: currentInput,
      ...(image ? { image } : {})
    };

    const nextMessages = [...get(messages), userMsg];
    input.set('');
    await triggerChat(nextMessages);
  }

  async function reload() {
    const currentMessages = get(messages);
    if (currentMessages.length === 0 || get(isLoading)) return;

    let newMessages = [...currentMessages];
    if (newMessages[newMessages.length - 1].role === 'assistant') {
      newMessages.pop();
    }
    await triggerChat(newMessages);
  }

  async function append(message: Message) {
    const nextMessages = [...get(messages), message];
    await triggerChat(nextMessages);
  }

  return {
    messages,
    input,
    isLoading,
    handleSubmit,
    stop,
    setMessages,
    reload,
    append
  };
}

