<script lang="ts">
  import { Terminal, Container, Network, Server, HardDrive, Sparkles } from 'lucide-svelte';

  interface Props {
    onSelectPrompt?: (prompt: string) => void;
  }

  let { onSelectPrompt = (_prompt: string) => {} }: Props = $props();

  const domains = [
    { name: 'Linux Admin', icon: Terminal, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Docker & Containers', icon: Container, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Proxmox VE', icon: HardDrive, color: 'text-orange-500 bg-orange-500/10' },
    { name: 'MikroTik & Network', icon: Network, color: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Server Admin', icon: Server, color: 'text-purple-500 bg-purple-500/10' }
  ];

  const suggestedPrompts = [
    {
      domain: 'Docker',
      title: 'Container CrashLoop',
      prompt: 'Mengapa Docker container saya mengalami restart terus-menerus? Bagaimana cara menganalisis error log-nya?'
    },
    {
      domain: 'Linux',
      title: 'Permission Denied',
      prompt: 'Bagaimana cara memperbaiki error permission denied pada service systemd di Linux Ubuntu?'
    },
    {
      domain: 'Proxmox',
      title: 'VM Storage Lock',
      prompt: 'VM Proxmox saya terkunci (locked) saat proses backup storage. Bagaimana cara membukanya dengan aman?'
    },
    {
      domain: 'MikroTik',
      title: 'High CPU Usage',
      prompt: 'Mengapa CPU router MikroTik mencapai 95% saat jam kerja dan bagaimana cara profiling traffic-nya?'
    }
  ];
</script>

<div class="max-w-3xl mx-auto py-8 px-4 flex flex-col items-center text-center">
  <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4">
    <Terminal size={32} />
  </div>

  <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
    Asisten AI Khusus Infrastruktur IT
  </h2>
  <p class="text-sm text-slate-600 dark:text-slate-400 max-w-lg mb-6">
    Tanyakan troubleshooting server, tempelkan error log, atau diskusikan konfigurasi Linux, Docker, Proxmox, dan MikroTik.
  </p>

  <!-- Domain badges -->
  <div class="flex flex-wrap justify-center gap-2 mb-8">
    {#each domains as domain}
      {@const IconComponent = domain.icon}
      <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <span class={`p-1 rounded-md ${domain.color}`}>
          <IconComponent size={14} />
        </span>
        <span class="text-slate-700 dark:text-slate-300">{domain.name}</span>
      </div>
    {/each}
  </div>

  <!-- Suggested prompts grid -->
  <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
    {#each suggestedPrompts as sp}
      <button
        onclick={() => onSelectPrompt(sp.prompt)}
        class="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition text-left flex flex-col justify-between"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">{sp.domain}</span>
          <Sparkles size={14} class="text-slate-400 group-hover:text-blue-500 transition" />
        </div>
        <p class="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
          {sp.prompt}
        </p>
      </button>
    {/each}
  </div>
</div>

