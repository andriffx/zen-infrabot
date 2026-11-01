<script lang="ts">
  import MessageBubble from './MessageBubble.svelte';
  import { Loader2 } from 'lucide-svelte';
  import type { Message } from '#lib/schemas/chat';

  interface Props {
    messages?: Array<Message | { id?: string; role: string; content: string; image?: string }>;
    isLoading?: boolean;
    onSelectSuggestion?: (suggestion: string) => void;
  }

  let {
    messages = [],
    isLoading = false,
    onSelectSuggestion = () => {}
  }: Props = $props();

  let container: HTMLDivElement | null = $state(null);

  $effect(() => {
    if (messages.length > 0 || isLoading) {
      container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  });
</script>

<div bind:this={container} class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
  {#each messages as msg, i (msg.id || `${i}-${msg.content}`)}
    <MessageBubble
      role={msg.role}
      content={msg.content}
      image={msg.image}
      onSelectSuggestion={onSelectSuggestion}
    />
  {/each}

  {#if isLoading}
    <div class="flex items-center gap-3 sm:gap-3.5 py-4 pl-4 sm:pl-6 pr-12 sm:pr-16 md:pr-20 text-xs text-slate-500 dark:text-slate-400 animate-pulse">
      <div class="w-8 h-8 rounded-lg bg-blue-600/20 dark:bg-blue-600/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
        <Loader2 size={16} class="animate-spin text-blue-500" />
      </div>
      <span>InfraBot sedang menganalisis & menyusun rekomendasi...</span>
    </div>
  {/if}
</div>
