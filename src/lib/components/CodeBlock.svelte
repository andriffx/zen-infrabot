<script lang="ts">
  import { Check, Copy, AlertTriangle } from 'lucide-svelte';
  import { isDestructiveCommand } from '#lib/utils/security';

  interface Props {
    code?: string;
    language?: string;
  }

  let { code = '', language = 'bash' }: Props = $props();
  let copied = $state(false);

  let isDangerous = $derived(isDestructiveCommand(code));

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  }
</script>

<div class="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 font-mono text-xs shadow-md">
  {#if isDangerous}
    <div class="bg-amber-500/20 border-b border-amber-500/30 px-3 py-1.5 flex items-center gap-2 text-amber-300 text-[11px] font-sans">
      <AlertTriangle size={14} class="shrink-0 text-amber-400" />
      <span><strong>Peringatan Berisiko:</strong> Perintah ini berpotensi mengubah atau menghapus data sistem. Jalankan dengan hati-hati.</span>
    </div>
  {/if}

  <div class="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
    <span class="lowercase font-semibold text-slate-300">{language || 'code'}</span>
    <button
      onclick={copyToClipboard}
      class="flex items-center gap-1 hover:text-white transition px-2 py-0.5 rounded hover:bg-slate-800"
      title="Salin ke clipboard"
    >
      {#if copied}
        <Check size={13} class="text-emerald-400" />
        <span class="text-emerald-400 text-[10px]">Tersalin!</span>
      {:else}
        <Copy size={13} />
        <span class="text-[10px]">Salin</span>
      {/if}
    </button>
  </div>

  <div class="p-3 overflow-x-auto leading-relaxed">
    <pre><code>{code}</code></pre>
  </div>
</div>
