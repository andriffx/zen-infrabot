<script lang="ts">
  import { onMount } from 'svelte';
  import { Server, Settings, PlusCircle, Sun, Moon, History } from 'lucide-svelte';

  interface Props {
    activeModel?: string;
    showNewChat?: boolean;
    sessionCount?: number;
    onNewChat?: () => void;
    onOpenSettings?: () => void;
    onToggleHistory?: () => void;
  }

  let {
    activeModel = 'gemini-3.5-flash',
    showNewChat = false,
    sessionCount = 0,
    onNewChat = () => {},
    onOpenSettings = () => {},
    onToggleHistory = () => {}
  }: Props = $props();

  let isDark = $state(false);

  onMount(() => {
    if (typeof document !== 'undefined') {
      isDark =
        document.documentElement.classList.contains('dark') ||
        (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  });

  function toggleDarkMode() {
    isDark = !isDark;
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        try {
          localStorage.setItem('theme', 'dark');
        } catch (e) {}
      } else {
        document.documentElement.classList.remove('dark');
        try {
          localStorage.setItem('theme', 'light');
        } catch (e) {}
      }
    }
  }
</script>

<header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
  <div class="flex items-center gap-3">
    <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
      <Server size={20} />
    </div>
    <div>
      <div class="flex items-center gap-2">
        <h1 class="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100">InfraBot</h1>
        <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          {activeModel}
        </span>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">AI Infrastructure Assistant</p>
    </div>
  </div>

  <div class="flex items-center gap-2">
    <button
      onclick={onToggleHistory}
      class="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
      title="Riwayat Percakapan"
      aria-label="Riwayat Percakapan"
    >
      <History size={18} />
      <span class="hidden sm:inline text-xs font-medium">Riwayat</span>
      {#if sessionCount > 0}
        <span class="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          {sessionCount}
        </span>
      {/if}
    </button>

    {#if showNewChat}
      <button
        onclick={onNewChat}
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
        title="Mulai sesi obrolan baru"
      >
        <PlusCircle size={16} />
        <span>New Chat</span>
      </button>
    {/if}

    <button
      onclick={onOpenSettings}
      class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      title="Pengaturan AI"
      aria-label="Pengaturan"
    >
      <Settings size={18} />
    </button>

    <button
      onclick={toggleDarkMode}
      class="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      title="Toggle Dark Mode"
      aria-label="Toggle tema"
    >
      {#if isDark}
        <Sun size={18} />
      {:else}
        <Moon size={18} />
      {/if}
    </button>
  </div>
</header>
