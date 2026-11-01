<script lang="ts">
  import { Bot, User, Sparkles, ArrowRight, ZoomIn, X } from 'lucide-svelte';
  import CodeBlock from './CodeBlock.svelte';
  import { renderMarkdown } from '#lib/utils/markdown';
  import { extractFollowUpSuggestions } from '#lib/utils/recommendations';

  interface Props {
    role?: string;
    content?: string;
    image?: string;
    onSelectSuggestion?: (suggestion: string) => void;
  }

  let {
    role = 'user',
    content = '',
    image = undefined,
    onSelectSuggestion = () => {}
  }: Props = $props();

  let isLightboxOpen = $state(false);

  let extracted = $derived(extractFollowUpSuggestions(content));
  let cleanContent = $derived(extracted.cleanContent);
  let suggestions = $derived(extracted.suggestions);

  // Parser to extract ```code blocks and regular markdown text
  let parsedBlocks = $derived.by(() => {
    const blocks: Array<{ type: 'text' | 'code'; text: string; lang?: string }> = [];
    const codeRegex = /```([a-zA-Z0-9_-]*)[^\S\r\n]*\r?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeRegex.exec(cleanContent)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'text',
          text: cleanContent.slice(lastIndex, match.index)
        });
      }
      blocks.push({
        type: 'code',
        lang: match[1] || 'bash',
        text: match[2].trimEnd()
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < cleanContent.length) {
      const remaining = cleanContent.slice(lastIndex);
      // Support unclosed code blocks during streaming responses
      const unclosedMatch = remaining.match(/^([\s\S]*?)```([a-zA-Z0-9_-]*)[^\S\r\n]*\r?\n([\s\S]*)$/);
      if (unclosedMatch) {
        if (unclosedMatch[1]) {
          blocks.push({
            type: 'text',
            text: unclosedMatch[1]
          });
        }
        blocks.push({
          type: 'code',
          lang: unclosedMatch[2] || 'bash',
          text: unclosedMatch[3]
        });
      } else {
        blocks.push({
          type: 'text',
          text: remaining
        });
      }
    }

    return blocks;
  });
</script>

<svelte:window onkeydown={(e) => { if (isLightboxOpen && e.key === 'Escape') isLightboxOpen = false; }} />

<div class={`flex gap-3 sm:gap-3.5 py-4 pl-4 sm:pl-6 pr-12 sm:pr-16 md:pr-20 ${role === 'user' ? 'bg-slate-100/60 dark:bg-slate-900/40' : ''}`}>
  <div class="shrink-0 mt-0.5">
    {#if role === 'user'}
      <div class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
        <User size={18} />
      </div>
    {:else}
      <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
        <Bot size={18} />
      </div>
    {/if}
  </div>

  <div class="flex-1 min-w-0 space-y-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
    <div class="font-semibold text-xs text-slate-500 dark:text-slate-400 mb-1">
      {role === 'user' ? 'Anda' : 'InfraBot'}
    </div>

    {#if image}
      <div class="my-2">
        <button
          type="button"
          onclick={() => (isLightboxOpen = true)}
          class="inline-block group relative cursor-zoom-in rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition text-left"
          title="Klik untuk melihat ukuran penuh (zoom)"
          aria-label="Perbesar gambar screenshot"
        >
          <img
            src={image}
            alt="Screenshot Lampiran"
            class="max-w-xs sm:max-w-md max-h-72 object-contain transition group-hover:scale-[1.01]"
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span class="bg-black/70 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 backdrop-blur-xs font-medium shadow-sm">
              <ZoomIn size={14} />
              Perbesar
            </span>
          </div>
        </button>
      </div>

      {#if isLightboxOpen}
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Screenshot Penuh"
          tabindex="-1"
        >
          <!-- Backdrop button -->
          <button
            type="button"
            class="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-zoom-out border-0 w-full h-full"
            onclick={() => (isLightboxOpen = false)}
            aria-label="Tutup pratinjau"
          ></button>

          <!-- Close button -->
          <button
            type="button"
            onclick={() => (isLightboxOpen = false)}
            class="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition cursor-pointer z-10"
            title="Tutup (Esc)"
            aria-label="Tutup"
          >
            <X size={22} />
          </button>

          <!-- Image container -->
          <div class="relative z-10 max-w-full max-h-full flex items-center justify-center pointer-events-none">
            <img
              src={image}
              alt="Screenshot Lampiran Penuh"
              class="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10 pointer-events-auto"
            />
          </div>
        </div>
      {/if}
    {/if}

    {#each parsedBlocks as block}
      {#if block.type === 'code'}
        <CodeBlock code={block.text} language={block.lang} />
      {:else}
        <div class="markdown-body">
          {@html renderMarkdown(block.text)}
        </div>
      {/if}
    {/each}

    {#if role === 'assistant' && suggestions.length > 0}
      <div class="pt-3 flex flex-wrap gap-2 items-center">
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles size={13} class="text-blue-500" />
          Rekomendasi Pertanyaan:
        </span>
        {#each suggestions as suggestion}
          <button
            type="button"
            onclick={() => onSelectSuggestion(suggestion)}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-slate-800/90 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 rounded-full transition cursor-pointer text-left shadow-2xs hover:shadow-xs"
          >
            <span>{suggestion}</span>
            <ArrowRight size={12} class="opacity-70 shrink-0" />
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>
