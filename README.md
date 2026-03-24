# 🔍 TelJobs — Job Scraper Bot

Bot scraper otomatis yang mencari lowongan kerja dari **Glints**, **JobStreet**, **LokerMedan**, dan **Loker.id**, lalu mengirim notifikasi ke **Telegram** (dan opsional **WhatsApp via Fonnte**).

Dilengkapi dengan **GitHub Actions** untuk menjalankan scraper secara otomatis tanpa server.

---

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Prasyarat](#-prasyarat)
- [Instalasi Lokal](#-instalasi-lokal)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan Secara Lokal](#-menjalankan-secara-lokal)
- [Setup GitHub Actions (Otomatis)](#-setup-github-actions-otomatis)
- [Cara Kerja Workflow](#-cara-kerja-workflow)
- [Struktur Project](#-struktur-project)
- [FAQ / Troubleshooting](#-faq--troubleshooting)

---

## ✨ Fitur

- Scraping dari 4 sumber: **Glints**, **JobStreet**, **LokerMedan.co.id**, **Loker.id**
- Filter loker **fresh** (maksimal 3 hari)
- Deteksi **repost** (loker yang diposting ulang)
- **Blacklist** perusahaan tertentu
- Notifikasi ke **Telegram Bot**
- Opsional notifikasi ke **WhatsApp** via Fonnte API
- Riwayat job disimpan di `processed_jobs.json` (mencegah duplikat)
- Otomatis berjalan via **GitHub Actions**

---

## 🛠 Prasyarat

Pastikan sudah terinstall:

| Software | Versi Minimum | Cara Cek |
|----------|--------------|----------|
| **Node.js** | v20+ | `node --version` |
| **npm** | v9+ | `npm --version` |
| **Git** | Terbaru | `git --version` |
| **Google Chrome** | Terbaru (untuk lokal) | Buka Chrome → Help → About |

> [!TIP]
> Download Node.js di [https://nodejs.org](https://nodejs.org) — pilih versi **LTS**.

---

## 📥 Instalasi Lokal

### 1. Clone Repository

```bash
git clone https://github.com/arfizihni29/teljobs.git
cd teljobs
```

### 2. Install Dependencies

```bash
npm install
```

Ini akan menginstall:
- `puppeteer` + `puppeteer-extra` + `stealth plugin` — browser otomatis untuk scraping
- `axios` — HTTP client untuk kirim notifikasi
- `dotenv` — membaca file `.env`

### 3. Buat File `.env`

Buat file `.env` di root folder project:

```bash
# Windows (PowerShell)
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Atau buat manual file `.env` dengan isi berikut:

```env
# === WAJIB ===
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# === OPSIONAL (WhatsApp via Fonnte) ===
FONNTE_TOKEN=your_fonnte_token_here
WHATSAPP_TARGET=08123456789

# === OPSIONAL (Lokal saja) ===
# Path ke Chrome di komputer kamu (Windows contoh di bawah)
PUPPETEER_EXECUTABLE_PATH=C:/Program Files/Google/Chrome/Application/chrome.exe
```

---

## ⚙️ Konfigurasi Environment

### Telegram Bot (WAJIB)

Kamu perlu **2 hal** dari Telegram:

| Variable | Cara Mendapatkan |
|----------|-----------------|
| `TELEGRAM_BOT_TOKEN` | Buka Telegram → chat [@BotFather](https://t.me/BotFather) → `/newbot` → ikuti instruksi → copy token |
| `TELEGRAM_CHAT_ID` | Chat bot kamu → buka `https://api.telegram.org/bot<TOKEN>/getUpdates` → cari `"chat":{"id":xxxxx}` |

**Langkah detail Telegram Bot:**

1. Buka Telegram, cari **@BotFather**
2. Kirim `/newbot`
3. Beri nama bot (contoh: "Job Notifier")
4. Beri username bot (contoh: `teljobs_notifier_bot`)
5. Copy **token** yang diberikan → masukkan ke `TELEGRAM_BOT_TOKEN`
6. **Kirim pesan apapun** ke bot kamu
7. Buka browser: `https://api.telegram.org/bot<TOKEN_KAMU>/getUpdates`
8. Cari angka `"id"` dalam `"chat"` → masukkan ke `TELEGRAM_CHAT_ID`

### WhatsApp via Fonnte (OPSIONAL)

| Variable | Cara Mendapatkan |
|----------|-----------------|
| `FONNTE_TOKEN` | Daftar di [fonnte.com](https://fonnte.com) → hubungkan WhatsApp → copy token |
| `WHATSAPP_TARGET` | Nomor HP tujuan notifikasi (format: `08xxx`) |

### Path Chrome (LOKAL SAJA)

| OS | Path Umum |
|----|----------|
| Windows | `C:/Program Files/Google/Chrome/Application/chrome.exe` |
| Mac | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` |
| Linux | `/usr/bin/google-chrome-stable` |

> [!NOTE]
> Di GitHub Actions, Chrome otomatis di-install oleh workflow, jadi `PUPPETEER_EXECUTABLE_PATH` **tidak perlu** diset.

---

## ▶️ Menjalankan Secara Lokal

```bash
npm start
```

atau:

```bash
node scraper.js
```

Bot akan:
1. Membuka browser (headless/tanpa tampilan)
2. Mengunjungi semua URL target satu per satu
3. Scraping lowongan kerja
4. Filter yang fresh (≤ 3 hari) & tidak di-blacklist
5. Kirim notifikasi ke Telegram
6. Simpan riwayat ke `processed_jobs.json`

> [!IMPORTANT]
> Pastikan koneksi internet stabil. Scraping semua sumber memakan waktu **5-10 menit**.

---

## 🤖 Setup GitHub Actions (Otomatis)

GitHub Actions memungkinkan scraper berjalan otomatis **tanpa server**. Berikut langkah setupnya:

### Step 1: Fork / Push ke GitHub

```bash
# Jika belum ada repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME_KAMU/teljobs.git
git branch -M main
git push -u origin main
```

### Step 2: Tambahkan Secrets di GitHub

Buka repository di GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Tambahkan secrets berikut:

| Secret Name | Value |
|------------|-------|
| `TELEGRAM_BOT_TOKEN` | Token dari BotFather |
| `TELEGRAM_CHAT_ID` | Chat ID Telegram kamu |
| `FONNTE_TOKEN` | *(opsional)* Token Fonnte |
| `WHATSAPP_TARGET` | *(opsional)* Nomor WhatsApp tujuan |

> [!CAUTION]
> **JANGAN** commit file `.env` ke GitHub! File ini sudah ada di `.gitignore`.

### Step 3: Jalankan Workflow

Ada **2 cara** menjalankan workflow:

#### Cara 1: Manual Trigger (Lewat GitHub)

1. Buka repo di GitHub
2. Klik tab **Actions**
3. Pilih **"Glints Hourly Scraper"** di sidebar kiri
4. Klik tombol **"Run workflow"** → **"Run workflow"**

#### Cara 2: Otomatis via Cron Job (Terjadwal)

Gunakan layanan seperti [cron-job.org](https://cron-job.org) untuk trigger workflow secara berkala:

1. Buat **Personal Access Token (PAT)** di GitHub:
   - GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
   - Beri akses: `Actions (Read and write)`
   - Copy token

2. Daftar di [cron-job.org](https://cron-job.org)

3. Buat cron job baru:
   - **URL:**
     ```
     https://api.github.com/repos/USERNAME_KAMU/teljobs/actions/workflows/scraper.yml/dispatches
     ```
   - **Method:** `POST`
   - **Headers:**
     ```
     Authorization: Bearer YOUR_GITHUB_PAT
     Accept: application/vnd.github.v3+json
     ```
   - **Body:**
     ```json
     {"ref": "main"}
     ```
   - **Schedule:** Setiap 1 jam (atau sesuai kebutuhan)

---

## 🔄 Cara Kerja Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Trigger     │────▶│  GitHub      │────▶│  Scraper     │
│  (Manual /   │     │  Actions     │     │  (Node.js)   │
│   Cron Job)  │     │  Runner      │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                          ┌───────────────────────┼───────────────────────┐
                          │                       │                       │
                          ▼                       ▼                       ▼
                   ┌──────────┐           ┌──────────────┐       ┌──────────────┐
                   │  Glints  │           │  JobStreet   │       │ LokerMedan   │
                   │  Loker.id│           │              │       │              │
                   └────┬─────┘           └──────┬───────┘       └──────┬───────┘
                        │                        │                      │
                        └────────────┬───────────┘──────────────────────┘
                                     │
                                     ▼
                           ┌──────────────────┐
                           │  Filter & Check  │
                           │  (Fresh, Blacklist│
                           │   Duplikat)       │
                           └────────┬─────────┘
                                    │
                          ┌─────────┴──────────┐
                          ▼                    ▼
                  ┌──────────────┐    ┌──────────────────┐
                  │  Telegram    │    │ processed_jobs   │
                  │  Notification│    │ .json (History)  │
                  └──────────────┘    └──────────────────┘
```

**Alur lengkap GitHub Actions:**

1. ⏱️ Workflow di-trigger (manual atau cron-job.org)
2. 📦 Checkout repository & install Node.js + dependencies
3. 🌐 Install Chrome browser di runner
4. 🔍 Jalankan `node scraper.js`
5. 📱 Kirim notifikasi lowongan baru ke Telegram
6. 💾 Commit perubahan `processed_jobs.json` kembali ke repo

---

## 📁 Struktur Project

```
teljobs/
├── .env                    # Environment variables (JANGAN commit!)
├── .env.example            # Template untuk .env
├── .gitignore              # Mengabaikan node_modules, .env
├── .github/
│   └── workflows/
│       └── scraper.yml     # GitHub Actions workflow
├── .travis.yml             # Travis CI config (alternatif)
├── package.json            # Dependencies & scripts
├── scraper.js              # ⭐ Script utama scraper
├── processed_jobs.json     # Riwayat job yang sudah diproses
├── index.html              # Frontend viewer (opsional)
├── script.js               # Frontend logic (opsional)
├── style.css               # Frontend styling (opsional)
└── debug_*.js              # Script debugging (development)
```

---

## ❓ FAQ / Troubleshooting

### ❌ Error: "Could not find Chrome"
**Solusi:** Set path Chrome yang benar di `.env`:
```env
PUPPETEER_EXECUTABLE_PATH=C:/Program Files/Google/Chrome/Application/chrome.exe
```

### ❌ Error: "TELEGRAM_BOT_TOKEN is undefined"
**Solusi:** Pastikan file `.env` ada di root folder dan isinya benar.

### ❌ Workflow tidak berjalan di GitHub Actions
**Solusi:**
1. Pastikan secrets sudah ditambahkan di repo settings
2. Cek tab **Actions** → klik workflow → lihat log error
3. Pastikan file `.github/workflows/scraper.yml` sudah ter-push

### ❌ Bot tidak mengirim pesan Telegram
**Solusi:**
1. Pastikan kamu sudah **mengirim pesan ke bot** minimal sekali
2. Cek `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` benar
3. Buka `https://api.telegram.org/bot<TOKEN>/getUpdates` untuk verifikasi

### ❌ Loker yang sama terkirim berulang kali
**Solusi:** File `processed_jobs.json` menyimpan riwayat. Jangan hapus file ini kecuali ingin reset. Repost hanya akan dikirim ulang setelah **3 hari cooldown**.

---

## 📄 Lisensi

Project ini untuk penggunaan pribadi.

---

> 💡 **Tips:** Kalau mau menambah sumber lowongan baru, edit array `TARGET_URLS` di `scraper.js` dan tambahkan logic scraping untuk sumber tersebut.
