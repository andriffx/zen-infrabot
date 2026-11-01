import { z } from 'zod';

export const messageSchema = z
  .object({
    id: z.string().optional(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(20000, 'Pesan melebihi batas maksimal'),
    image: z.string().max(3000000, 'Ukuran gambar melebihi batas maksimal 2MB').optional()
  })
  .refine((msg) => msg.role !== 'user' || msg.content.trim().length > 0 || !!msg.image, {
    message: 'Pesan atau gambar tidak boleh kosong',
    path: ['content']
  });

export const serverProfileSchema = z.object({
  os: z.string().optional().default(''),
  techStack: z.string().optional().default(''),
  specs: z.string().optional().default(''),
  notes: z.string().optional().default('')
});

export const chatSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(messageSchema),
  createdAt: z.number(),
  updatedAt: z.number()
});

export const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1, 'Minimal satu pesan harus dikirim'),
  model: z.string().default('gemini-3.5-flash'),
  temperature: z.number().min(0.0).max(1.0).default(0.3),
  topP: z.number().min(0.0).max(1.0).default(0.85),
  maxTokens: z.number().int().min(100).max(8192).default(2048),
  serverProfile: serverProfileSchema.optional()
});

export type Message = z.infer<typeof messageSchema>;
export type ServerProfile = z.infer<typeof serverProfileSchema>;
export type ChatSession = z.infer<typeof chatSessionSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
