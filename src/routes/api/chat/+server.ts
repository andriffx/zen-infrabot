import { json, type RequestHandler } from '@sveltejs/kit';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { GEMINI_API_KEY } from '$app/env/private';
import { chatRequestSchema } from '#lib/schemas/chat';
import { buildSystemPrompt } from '#lib/server/prompt';

export function _formatErrorMessage(error: unknown): string {
  if (!error) return 'Terjadi kesalahan pada layanan AI.';

  let rawMessage = '';
  if (typeof error === 'string') {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === 'object') {
    const errObj = error as Record<string, any>;
    rawMessage = errObj.message || errObj.data?.message || errObj.cause?.message || JSON.stringify(error);
  }

  const lower = rawMessage.toLowerCase();

  if (
    lower.includes('high demand') ||
    lower.includes('spikes in demand') ||
    lower.includes('503') ||
    lower.includes('unavailable')
  ) {
    return `Server model Gemini sedang mengalami lonjakan beban tinggi (503 High Demand). Silakan coba sesaat lagi, atau beralih ke model "gemini-3.5-flash-lite" di menu Pengaturan AI.\n\nDetail teknis: ${rawMessage}`;
  }

  if (
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('resource_exhausted') ||
    lower.includes('429')
  ) {
    return `Batas kuota/rate limit API Gemini telah tercapai (429 Quota Exceeded). Silakan tunggu beberapa saat sebelum mencoba kembali.\n\nDetail teknis: ${rawMessage}`;
  }

  if (
    lower.includes('api_key') ||
    lower.includes('api key') ||
    lower.includes('unauthorized') ||
    lower.includes('401')
  ) {
    return `API Key Gemini tidak valid atau belum diaktifkan. Silakan periksa kembali konfigurasi GEMINI_API_KEY di file .env.\n\nDetail teknis: ${rawMessage}`;
  }

  return rawMessage || 'Terjadi kesalahan saat memproses streaming respon AI.';
}

function extractMediaType(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  return match ? match[1] : 'image';
}

export const POST: RequestHandler = async ({ request }) => {
  const apiKey = GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  if (!apiKey) {
    return json(
      { error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Format JSON request tidak valid.' }, { status: 400 });
  }

  const parseResult = chatRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return json(
      { error: 'Validasi input gagal.', details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { messages, model, temperature, topP, maxTokens, serverProfile } = parseResult.data;

  // Filter out any empty messages and truncate to the most recent 20 messages for context safety
  const trimmedMessages = messages
    .filter((m) => (m.content && m.content.trim().length > 0) || !!m.image)
    .slice(-20);

  if (trimmedMessages.length === 0) {
    return json({ error: 'Tidak ada pesan yang valid untuk dikirim.' }, { status: 400 });
  }

  const formattedMessages = trimmedMessages.map((m) => {
    if (m.role === 'user' && m.image) {
      return {
        role: m.role,
        content: [
          {
            type: 'text' as const,
            text: m.content?.trim() || 'Tolong analisis screenshot infrastruktur ini:'
          },
          {
            type: 'file' as const,
            data: m.image,
            mediaType: extractMediaType(m.image)
          }
        ]
      };
    }
    return {
      role: m.role,
      content: m.content
    };
  });

  const google = createGoogleGenerativeAI({ apiKey });

  try {
    const result = streamText({
      model: google(model),
      system: buildSystemPrompt(serverProfile),
      messages: formattedMessages as any,
      temperature,
      topP,
      maxOutputTokens: maxTokens
    });

    if (
      'toDataStreamResponse' in result &&
      typeof (result as { toDataStreamResponse?: (options?: any) => Response }).toDataStreamResponse === 'function'
    ) {
      return (result as { toDataStreamResponse: (options?: any) => Response }).toDataStreamResponse({
        getErrorMessage: (err: unknown) => _formatErrorMessage(err)
      });
    }

    return result.toUIMessageStreamResponse({
      onError(error) {
        console.error('Gemini stream error:', error);
        return _formatErrorMessage(error);
      }
    });
  } catch (error: any) {
    console.error('Gemini stream error:', error);
    return json(
      { error: _formatErrorMessage(error) },
      { status: 500 }
    );
  }
};
