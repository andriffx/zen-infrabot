# InfraBot – AI Infrastructure Assistant 🚀

**InfraBot** adalah asisten AI conversational fullstack yang dirancang khusus untuk memandu administrator sistem, insinyur DevOps, dan praktisi IT dalam memahami, mendiagnosis, dan menyelesaikan berbagai permasalahan infrastruktur secara interaktif dan terstruktur.

Aplikasi ini dibangun menggunakan arsitektur modern berbasis **SvelteKit 2**, **Svelte 5 (Runes)**, **Tailwind CSS v4**, serta **Vercel AI SDK** yang terhubung langsung dengan **Google Gemini API**.

---

## 🎯 Domain Spesialisasi

InfraBot memiliki spesialisasi dan pemahaman mendalam dalam 5 domain utama infrastruktur IT:

1. **🐧 Linux Administration**
   - Diagnosis service systemd, journalctl, dan process management.
   - Troubleshooting perizinan file (permissions, ownership, chmod, chown, ACL).
   - Pengelolaan paket (APT, DNF/YUM, Pacman), storage disk, dan LVM.
2. **🐳 Docker & Containerization**
   - Troubleshooting container crash-loop, error restart, dan exit codes.
   - Analisis dan validasi berkas `docker-compose.yml` serta Dockerfile.
   - Konfigurasi Docker network, bridge, volume mount, dan storage driver.
3. **📦 Proxmox Virtualization (PVE)**
   - Troubleshooting Virtual Machine (QEMU/KVM) dan LXC containers.
   - Manajemen storage pool (ZFS, Ceph, LVM-Thin, NFS).
   - Analisis error cluster quorum, migrasi node, dan backup/restore (PBS).
4. **🌐 MikroTik & Networking**
   - Konfigurasi dan debugging RouterOS (Firewall Filter, NAT, Mangle, Address List).
   - Diagnosis routing (Static, OSPF, BGP), VLAN, bonding, DHCP, dan DNS.
   - Analisis lonjakan CPU, memory leak, dan pemantauan interface bandwidth.
5. **🖥️ Server Administration**
   - Konfigurasi Web Server & Reverse Proxy (Nginx, Apache, Caddy).
   - Database server maintenance (PostgreSQL, MySQL/MariaDB, Redis).
   - Hardening keamanan (UFW, iptables, Fail2ban, SSH key security, SSL/TLS Let's Encrypt).

---

## ✨ Fitur Utama

- **⚡ Real-time AI Streaming**: Respons AI dihasilkan secara bertahap (token streaming) secara instan tanpa menunggu seluruh jawaban selesai dibuat.
- **🧠 Memory — Profil Lingkungan Server**: Simpan OS (Ubuntu, Debian, dll.), tech stack (Docker, Proxmox, MikroTik, Nginx), dan spesifikasi server di memori browser. AI otomatis menyesuaikan rekomendasi perintah dan arsitektur tanpa perlu mengetik ulang konteks.
- **💬 Riwayat Chat Multi-Sesi & Clear Chat**: Riwayat percakapan tersimpan otomatis di browser (`localStorage`). Akses sesi lampau melalui slide-over panel drawer, buat obrolan baru, atau bersihkan semua riwayat via tombol **Clear Chat**.
- **💡 Smart Follow-up Recommendation Chips**: Rekomendasi pertanyaan atau langkah diagnostik interaktif di bawah respon AI yang dapat langsung diklik untuk dikirim secara instan.
- **🖼️ Multimodal Screenshot, Paste (`Cmd+V`) & In-Place Zoom**: Upload atau paste screenshot console/dashboard (Proxmox VNC, WinBox MikroTik, Portainer, error kernel panic) langsung ke chat (maksimal 2MB). Dilengkapi pratinjau zoom lightbox in-place di halaman yang sama tanpa membuka tab baru, dan didiagnosis langsung oleh Vision AI Gemini.
- **🛡️ Safety Guardrails & Destructive Command Warning**: Deteksi otomatis perintah terminal berisiko tinggi (seperti `rm -rf`, `mkfs`, `dd`, `iptables -F`, `ufw reset`, `docker system prune -a`) dengan badge peringatan visual agar sistem pengguna tetap terlindungi.
- **📋 Rich Markdown & Code Blocks**: Blok kode perintah dilengkapi syntax highlighting, nama bahasa, dan tombol satu-klik **Salin** (Copy to Clipboard) dengan render markdown yang nyaman dibaca baik mode terang maupun gelap.
- **⚙️ Konfigurasi Parameter AI Fleksibel**: Pengaturan model AI (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.8-flash`), *Temperature*, *Top P*, dan *Max Output Tokens* melalui modal Settings interaktif.
- **💡 Suggested Prompts**: Rekomendasi pertanyaan umum di halaman awal untuk mempercepat inisiasi troubleshooting.
- **📱 Desain Modern, Responsif & Dark Mode**: Tampilan responsif dengan dukungan tema gelap/terang yang ergonomis untuk pengguna desktop maupun perangkat mobile.

---

## 🛠️ Tech Stack

- **Framework**: [SvelteKit 2](https://kit.svelte.dev/)
- **UI Engine**: [Svelte 5](https://svelte.dev/) dengan Runes (`$state`, `$derived`, `$props`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/google`, `@ai-sdk/svelte`)
- **LLM Provider**: [Google Gemini API](https://ai.google.dev/) (Default: `gemini-3.5-flash`)
- **Validasi Skema**: [Zod](https://zod.dev/)
- **Icon Set**: [Lucide Svelte](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Type Checking**: [TypeScript 5+](https://www.typescriptlang.org/) & `svelte-check`
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 📋 Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `>= 18.x` (disarankan LTS versi 20 atau 22).
- **pnpm**: Versi `>= 8.x` atau `9.x`.
- **Google Gemini API Key**: Dapatkan API key gratis atau berbayar melalui [Google AI Studio](https://aistudio.google.com/).

---

## ⚙️ Konfigurasi Environment

1. Salin berkas konfigurasi contoh `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

2. Buka `.env` dan masukkan API key Gemini Anda:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
   ```

> ⚠️ **Catatan Keamanan:** `GEMINI_API_KEY` hanya dibaca oleh server-side endpoint (`/api/chat`) dan tidak pernah terekspos ke sisi client/browser. Jangan pernah melakukan commit berkas `.env` ke repository publik.

---

## 🚀 Instalasi & Menjalankan Aplikasi

### 1. Pasang Dependensi
```bash
pnpm install
```

### 2. Jalankan Server Pengembangan (Dev Mode)
```bash
pnpm dev
```
Aplikasi akan aktif pada `http://localhost:5173`. Buka URL tersebut di browser favorit Anda.

Untuk membuka browser secara otomatis:
```bash
pnpm dev -- --open
```

### 3. Kompilasi Produksi (Production Build)
```bash
pnpm build
```

### 4. Menjalankan Preview Versi Produksi
```bash
pnpm preview
```

---

## 🧪 Pengujian & Quality Assurance

Proyek ini dilengkapi dengan suite pengujian komprehensif (unit tests, component tests, API endpoint mocks, dan schema validation):

```bash
# Menjalankan seluruh rangkaian tes (93 tes vitest)
pnpm test

# Memeriksa tipe TypeScript dan diagnostik Svelte
pnpm check

# Memeriksa typecheck dalam mode watch
pnpm check:watch
```

---

## 🛡️ Keamanan & Guardrails

InfraBot menerapkan prinsip pertahanan berlapis (defense-in-depth):

1. **Server-Side API Key Protection**: Kunci otentikasi LLM (`GEMINI_API_KEY`) hanya diakses dari runtime server dan divalidasi sebelum request diteruskan ke AI.
2. **Skema Validasi Zod**: Setiap request ke `/api/chat` divalidasi struktur dan ukurannya (membatasi karakter pesan hingga 20.000 karakter, validasi tipe model, dan batas numerik parameter).
3. **Context Truncation Protection**: Riwayat pesan otomatis dibatasi maksimal 20 pesan terbaru untuk mencegah pembengkakan konsumsi token dan payload berlebih.
4. **Peringatan Perintah Berbahaya (Destructive Command Warning)**: Regex scanner memeriksa kode bash sebelum dirender dan memunculkan badge peringatan berwarna kuning/amber jika terdeteksi perintah sistem yang berpotensi destruktif.

---

## ❓ Panduan Troubleshooting

| Gejala / Permasalahan | Penyebab Kemungkinan | Solusi |
|---|---|---|
| **Error 500: "GEMINI_API_KEY belum dikonfigurasi"** | Variabel environment `GEMINI_API_KEY` belum diset di berkas `.env` atau server environment. | Buat berkas `.env` dari `.env.example`, isi nilai `GEMINI_API_KEY`, dan restart dev server. |
| **Error 400: "Validasi input gagal"** | Format pesan tidak sesuai ketentuan atau parameter numerik di luar jangkauan (misal temp > 1.0). | Buka modal **Settings** di header, lalu klik **Reset to Default**. |
| **Error Quota Exceeded / Rate Limit** | Batas limit gratis API Gemini pada Google AI Studio tercapai. | Tunggu beberapa saat, gunakan model `gemini-3.5-flash-lite`, atau gunakan API key dengan kuota berbayar (Pay-as-you-go). |
| **Port 5173 bentrok / sudah terpakai** | Ada proses lain yang mendengarkan pada port 5173. | Jalankan dengan port spesifik: `pnpm dev -- --port 3000`. |

