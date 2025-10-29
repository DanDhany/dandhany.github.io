# Portofolio Astro — DanDhany

Portofolio berbasis Astro dengan gaya paralaks full-image dan tipografi Plus Jakarta Sans. Struktur mendukung koneksi ke CMS dan memiliki subfolder berisi versi dummy dari proyek yang bisa diisi nanti.

## 🚀 Menjalankan

```bash
npm run dev
```

## 📁 Struktur

```text
/
├── public/
│   └── global.css
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── ParallaxSection.astro
│   │   └── ProjectCard.astro
│   ├── data/
│   │   └── projects.json
│   ├── lib/
│   │   └── cms.ts
│   └── pages/
│       ├── index.astro
│       └── projects/
│           ├── project-alpha/
│           │   └── index.astro
│           └── project-beta/
│               └── index.astro
└── astro.config.mjs
```

## 🔌 Koneksi CMS

Siapkan environment variable berikut pada `.env` di root proyek:

```env
CMS_API_URL="https://your-headless-cms.example/api/projects"
CMS_API_TOKEN="YOUR_TOKEN"
```

Gunakan util `fetchProjectsFromCMS()` untuk mengambil data proyek. Bila env belum diset, sistem fallback ke `src/data/projects.json`.

## 🚢 Deploy ke GitHub Pages

Setel `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://dandhany.github.io',
});
```

Build dan publikasi:

```bash
npm run build
```

Unggah konten `dist/` ke GitHub Pages sesuai pengaturan repositori.
