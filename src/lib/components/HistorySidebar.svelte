<script lang="ts">
  import { X, History, Plus, Trash2, MessageSquare, AlertCircle } from 'lucide-svelte';
  import type { ChatSession } from '#lib/schemas/chat';

  interface Props {
    isOpen?: boolean;
    sessions?: ChatSession[];
    activeSessionId?: string | null;
    onSelectSession?: (session: ChatSession) => void;
    onNewChat?: () => void;
    onDeleteSession?: (id: string) => void;
    onClearAll?: () => void;
  }

  let {
    isOpen = $bindable(false),
    sessions = [],
    activeSessionId = null,
    onSelectSession = () => {},
    onNewChat = () => {},
    onDeleteSession = () => {},
    onClearAll = () => {}
  }: Props = $props();

  let showClearConfirm = $state(false);

  function formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Hari ini, ${timeStr}`;
    return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${timeStr}`;
  }

  function handleSelect(s: ChatSession) {
    onSelectSession(s);
    isOpen = false;
  }

  function handleStartNewChat() {
    onNewChat();
    isOpen = false;
  }

  function handleConfirmClear() {
    onClearAll();
    showClearConfirm = false;
  }
</script>

<svelte:window onkeydown={(e) => { if (isOpen && e.key === 'Escape') isOpen = false; }} />

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity"
    onclick={() => (isOpen = false)}
    role="presentation"
  ></div>

  <!-- Sidebar Drawer -->
  <aside
    class="fixed inset-y-0 left-0 z-50 w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-200 ease-out"
    aria-label="Panel Riwayat Percakapan"
  >
    <!-- Header -->
    <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold">
        <History size={18} class="text-blue-600 dark:text-blue-400" />
        <span>Riwayat Chat</span>
        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
          {sessions.length}
        </span>
      </div>
      <button
        onclick={() => (isOpen = false)}
        class="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        aria-label="Tutup riwayat"
      >
        <X size={18} />
      </button>
    </div>

    <!-- Actions: New Chat & Clear Chat -->
    <div class="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
      <button
        onclick={handleStartNewChat}
        class="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-xs"
      >
        <Plus size={15} />
        <span>Obrolan Baru</span>
      </button>

      {#if sessions.length > 0}
        <button
          onclick={() => (showClearConfirm = true)}
          class="flex items-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
          title="Hapus semua riwayat percakapan"
        >
          <Trash2 size={14} />
          <span>Clear Chat</span>
        </button>
      {/if}
    </div>

    <!-- Clear Confirmation Alert -->
    {#if showClearConfirm}
      <div class="m-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-900 dark:text-rose-200">
        <div class="flex items-start gap-2 mb-2">
          <AlertCircle size={16} class="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>Hapus seluruh riwayat percakapan secara permanen?</span>
        </div>
        <div class="flex items-center justify-end gap-2">
          <button
            onclick={() => (showClearConfirm = false)}
            class="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
          >
            Batal
          </button>
          <button
            onclick={handleConfirmClear}
            class="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer"
          >
            Ya, Hapus Semua
          </button>
        </div>
      </div>
    {/if}

    <!-- Session list -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      {#if sessions.length === 0}
        <div class="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-500">
          <MessageSquare size={32} class="mb-2 stroke-1 opacity-60" />
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Belum ada riwayat chat</p>
          <p class="text-[11px] mt-1">Percakapan Anda akan tersimpan otomatis di sini.</p>
        </div>
      {:else}
        {#each sessions as s (s.id)}
          <div
            class={`group flex items-center justify-between p-2.5 rounded-lg text-left transition cursor-pointer ${
              s.id === activeSessionId
                ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 font-medium'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <button
              onclick={() => handleSelect(s)}
              class="flex-1 min-w-0 pr-2 text-left cursor-pointer"
            >
              <div class="text-xs truncate">{s.title || 'Obrolan'}</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{formatDate(s.updatedAt)}</span>
                <span>•</span>
                <span>{s.messages.length} pesan</span>
              </div>
            </button>
            <button
              onclick={(e) => {
                e.stopPropagation();
                onDeleteSession(s.id);
              }}
              class="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="Hapus obrolan ini"
              aria-label={`Hapus ${s.title}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        {/each}
      {/if}
    </div>
  </aside>
{/if}

