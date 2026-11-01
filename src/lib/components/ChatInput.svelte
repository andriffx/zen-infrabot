<script lang="ts">
  import { Send, Square, Image as ImageIcon, X, AlertCircle } from 'lucide-svelte';

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  interface Props {
    input?: string;
    isLoading?: boolean;
    onSubmit?: (image?: string | null) => void;
    onStop?: () => void;
  }

  let {
    input = $bindable(''),
    isLoading = false,
    onSubmit = () => {},
    onStop = () => {}
  }: Props = $props();

  let textarea: HTMLTextAreaElement | null = $state(null);
  let fileInput: HTMLInputElement | null = $state(null);
  let selectedImage = $state<string | null>(null);
  let errorMessage = $state<string | null>(null);

  function adjustHeight() {
    if (!textarea) return;
    if (!input || input.trim() === '') {
      textarea.style.height = '';
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }

  function processImageFile(file: File) {
    if (!file.type.startsWith('image/')) {
      errorMessage = 'Format file harus berupa gambar (PNG, JPG, WebP, GIF)';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      errorMessage = `Ukuran gambar melebihi batas maksimal 2MB (${sizeMB}MB)`;
      return;
    }

    errorMessage = null;
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage = (e.target?.result as string) || null;
    };
    reader.readAsDataURL(file);
  }

  function handlePaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          processImageFile(file);
          break;
        }
      }
    }
  }

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (!isLoading && (input.trim() || selectedImage)) {
      const imgToSend = selectedImage;
      selectedImage = null;
      errorMessage = null;
      if (fileInput) fileInput.value = '';
      if (textarea) textarea.style.height = '';
      onSubmit(imgToSend);
    }
  }

  function removeImage() {
    selectedImage = null;
    errorMessage = null;
    if (fileInput) fileInput.value = '';
  }

  $effect(() => {
    // Explicitly track input reactivity
    const _ = input;
    adjustHeight();
  });
</script>

<div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
  {#if errorMessage}
    <div class="max-w-4xl mx-auto mb-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <AlertCircle size={14} class="shrink-0 text-rose-600 dark:text-rose-400" />
        <span>{errorMessage}</span>
      </div>
      <button onclick={() => (errorMessage = null)} class="p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900 cursor-pointer">
        <X size={13} />
      </button>
    </div>
  {/if}

  <div class="max-w-4xl mx-auto flex flex-col bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
    {#if selectedImage}
      <div class="flex items-center gap-2 p-1.5 mb-1.5 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
        <img
          src={selectedImage}
          alt="Screenshot Preview"
          class="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
        />
        <div class="text-xs pr-1">
          <span class="font-medium text-slate-800 dark:text-slate-200 block">Screenshot Dilampirkan</span>
          <span class="text-[10px] text-slate-400">Siap dianalisis (Maks 2MB)</span>
        </div>
        <button
          type="button"
          onclick={removeImage}
          class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
          aria-label="Hapus gambar"
          title="Hapus gambar"
        >
          <X size={15} />
        </button>
      </div>
    {/if}

    <div class="flex items-end gap-1.5">
      <input
        bind:this={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onchange={handleFileChange}
        class="hidden"
        id="screenshot-upload"
      />

      <button
        type="button"
        onclick={() => fileInput?.click()}
        class="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-700 transition shrink-0 cursor-pointer"
        title="Upload screenshot gambar (Maks 2MB)"
        aria-label="Upload gambar"
      >
        <ImageIcon size={18} />
      </button>

      <textarea
        bind:this={textarea}
        bind:value={input}
        onkeydown={handleKeyDown}
        oninput={adjustHeight}
        onpaste={handlePaste}
        rows={1}
        placeholder="Ketik pesan, paste error log, atau paste screenshot (Cmd+V / Ctrl+V)..."
        aria-label="Pesan atau pertanyaan infrastruktur"
        class="flex-1 bg-transparent border-0 resize-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none px-2 py-1.5 max-h-44"
      ></textarea>

      {#if isLoading}
        <button
          type="button"
          onclick={onStop}
          class="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition shrink-0 cursor-pointer"
          title="Hentikan pembuatan"
          aria-label="Stop"
        >
          <Square size={16} />
        </button>
      {:else}
        <button
          type="button"
          onclick={handleSend}
          disabled={!input.trim() && !selectedImage}
          class="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition shrink-0 cursor-pointer"
          title="Kirim pesan"
          aria-label="Kirim"
        >
          <Send size={16} />
        </button>
      {/if}
    </div>
  </div>

  <div class="max-w-4xl mx-auto mt-2 flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 px-1">
    <span>💡 Hint: Anda bisa paste screenshot langsung dengan <kbd class="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">Cmd+V</kbd> / <kbd class="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">Ctrl+V</kbd> (Maks 2MB).</span>
    <span>Enter ↵</span>
  </div>
</div>
