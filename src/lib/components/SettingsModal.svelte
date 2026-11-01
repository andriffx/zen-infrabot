<script lang="ts">
  import { X, RotateCcw, Cpu, Server, Sparkles } from 'lucide-svelte';
  import type { ServerProfile } from '#lib/schemas/chat';
  import { saveServerProfile } from '#lib/utils/storage';

  interface Props {
    isOpen?: boolean;
    model?: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    serverProfile?: ServerProfile;
    defaultTab?: 'model' | 'memory';
  }

  let {
    isOpen = $bindable(false),
    model = $bindable('gemini-3.5-flash'),
    temperature = $bindable(0.3),
    topP = $bindable(0.85),
    maxTokens = $bindable(2048),
    serverProfile = $bindable({ os: '', techStack: '', specs: '', notes: '' }),
    defaultTab = 'model'
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let activeTab = $state<'model' | 'memory'>(defaultTab);

  // Local draft state so changes are only applied when user clicks "Simpan & Tutup"
  // svelte-ignore state_referenced_locally
  let draftModel = $state(model);
  // svelte-ignore state_referenced_locally
  let draftTemperature = $state(temperature);
  // svelte-ignore state_referenced_locally
  let draftTopP = $state(topP);
  // svelte-ignore state_referenced_locally
  let draftMaxTokens = $state(maxTokens);
  // svelte-ignore state_referenced_locally
  let draftProfile = $state<ServerProfile>({
    os: serverProfile.os || '',
    techStack: serverProfile.techStack || '',
    specs: serverProfile.specs || '',
    notes: serverProfile.notes || ''
  });

  $effect(() => {
    if (isOpen) {
      activeTab = defaultTab;
      draftModel = model;
      draftTemperature = temperature;
      draftTopP = topP;
      draftMaxTokens = maxTokens;
      draftProfile = {
        os: serverProfile.os || '',
        techStack: serverProfile.techStack || '',
        specs: serverProfile.specs || '',
        notes: serverProfile.notes || ''
      };
    }
  });

  function resetDefaults() {
    if (activeTab === 'model') {
      draftModel = 'gemini-3.5-flash';
      draftTemperature = 0.3;
      draftTopP = 0.85;
      draftMaxTokens = 2048;
    } else {
      draftProfile = { os: '', techStack: '', specs: '', notes: '' };
    }
  }

  function handleSave() {
    model = draftModel;
    temperature = draftTemperature;
    topP = draftTopP;
    maxTokens = draftMaxTokens;
    serverProfile = { ...draftProfile };
    saveServerProfile(serverProfile);
    isOpen = false;
  }

  function handleCancel() {
    isOpen = false;
  }
</script>

<svelte:window onkeydown={(event) => { if (isOpen && event.key === 'Escape') handleCancel(); }} />

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 relative flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Pengaturan AI (Settings)</h3>
        <button
          onclick={handleCancel}
          class="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1.5 p-1 my-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs font-medium">
        <button
          type="button"
          onclick={() => (activeTab = 'model')}
          class={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md transition cursor-pointer ${
            activeTab === 'model'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Cpu size={14} />
          Model AI
        </button>
        <button
          type="button"
          onclick={() => (activeTab = 'memory')}
          class={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md transition cursor-pointer ${
            activeTab === 'memory'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Server size={14} />
          Profil Server (Memory)
        </button>
      </div>

      <!-- Tab Contents -->
      <div class="overflow-y-auto space-y-4 py-2 flex-1 pr-1">
        {#if activeTab === 'model'}
          <div>
            <label for="model-select" class="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Model AI</label>
            <select
              id="model-select"
              bind:value={draftModel}
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Rekomendasi Cepat & Handal)</option>
              <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Super Cepat ~1 Detik)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Deep Reasoning)</option>
            </select>
          </div>

          <div>
            <div class="flex justify-between text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              <label for="temp-slider">Temperature</label>
              <span class="text-blue-600 dark:text-blue-400">{draftTemperature.toFixed(2)}</span>
            </div>
            <input
              id="temp-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              bind:value={draftTemperature}
              class="w-full accent-blue-600"
            />
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Nilai rendah (0.1 - 0.3) menghasilkan jawaban teknis yang lebih terarah dan konsisten.</p>
          </div>

          <div>
            <div class="flex justify-between text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              <label for="topP-slider">Top P</label>
              <span class="text-blue-600 dark:text-blue-400">{draftTopP.toFixed(2)}</span>
            </div>
            <input
              id="topP-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              bind:value={draftTopP}
              class="w-full accent-blue-600"
            />
          </div>

          <div>
            <div class="flex justify-between text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              <label for="max-tokens">Max Output Tokens</label>
              <span class="text-blue-600 dark:text-blue-400">{draftMaxTokens}</span>
            </div>
            <input
              id="max-tokens"
              type="number"
              min="256"
              max="8192"
              step="256"
              bind:value={draftMaxTokens}
              class="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        {:else}
          <!-- Memory Tab -->
          <div class="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <Sparkles size={16} class="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <span>
              InfraBot akan mengingat profil ini dan secara otomatis menyesuaikan perintah CLI (misal <code>apt</code> vs <code>dnf</code>), path config, serta arsitektur solusi tanpa perlu Anda ulangi di setiap pertanyaan.
            </span>
          </div>

          <div>
            <label for="profile-os" class="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Sistem Operasi / Distro
            </label>
            <input
              id="profile-os"
              type="text"
              placeholder="Contoh: Ubuntu 24.04 LTS, Debian 12, Rocky Linux 9"
              bind:value={draftProfile.os}
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label for="profile-tech" class="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Tech Stack & Layanan Utama
            </label>
            <input
              id="profile-tech"
              type="text"
              placeholder="Contoh: Docker 26, Proxmox VE 8, MikroTik RouterOS 7, Nginx"
              bind:value={draftProfile.techStack}
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label for="profile-specs" class="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Spesifikasi Hardware
            </label>
            <input
              id="profile-specs"
              type="text"
              placeholder="Contoh: 4 vCPU, 8 GB RAM, 100 GB NVMe SSD"
              bind:value={draftProfile.specs}
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label for="profile-notes" class="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Catatan Lingkungan Tambahan
            </label>
            <textarea
              id="profile-notes"
              rows="3"
              placeholder="Contoh: Non-root user sudoer, SSH custom port 2222, private subnet 10.0.0.0/24"
              bind:value={draftProfile.notes}
              class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            ></textarea>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
        <button
          onclick={resetDefaults}
          class="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <RotateCcw size={14} />
          {activeTab === 'model' ? 'Reset Default' : 'Kosongkan'}
        </button>
        <div class="flex items-center gap-2">
          <button
            onclick={handleCancel}
            class="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            Batal
          </button>
          <button
            onclick={handleSave}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition cursor-pointer shadow-sm shadow-blue-500/20"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
