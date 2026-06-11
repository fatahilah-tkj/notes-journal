
PRODUCT REQUIREMENT DOCUMENT (PRD) – FINAL DENGAN PAGINASI

Nama Proyek: Personal IT Learning Journal & Project Showcase (Field Notes)
Versi: 2.1 (Final dengan Paginasi)
Tech Stack: Vanilla HTML5, CSS3, JavaScript (Node.js Build Script)
Platform Deployment: Vercel

---

1. Project Overview & Target Audiens

1.1 Tujuan Proyek

Membangun website statis personal sebagai jurnal perjalanan belajar IT (catatan harian, praktikum networking/web dev) sekaligus showcase massal proyek/latihan web eksternal. Berfungsi sebagai personal branding publik yang bersih, unik, dan interaktif.

1.2 Target Audiens

Rekan sejawat teknisi IT/TKJ, komunitas developer, dan potensial rekruter yang ingin melihat bukti nyata perkembangan kompetensi teknis secara kronologis.

1.3 Batasan Pengembangan (Developer Constraints)

· Mobile-First: Seluruh kode harus mudah ditulis, dimodifikasi, dan dikelola melalui smartphone (Acode / Spck).
· Zero Frameworks/Libraries: Dilarang menggunakan React, Vue, Tailwind, jQuery, atau library JS lain (kecuali Google Fonts – diperbolehkan). Semua kode frontend wajib Vanilla HTML5, CSS3, Native JavaScript.
· Google Fonts diperbolehkan untuk Special Elite dan Inter.

---

2. Struktur Direktori & Arsitektur Proyek

```
[root]/
├── package.json
├── build.js
├── index.html
├── catatan.html
├── style.css
├── script.js
├── catatan/
│   ├── cisco-ospf.html
│   └── css-flexbox.html
└── proyek/
    ├── toko-online.json
    └── kalkulator-js.json
```

· daftar-catatan.json dan daftar-proyek.json dihasilkan otomatis oleh build.js di root saat deployment.

---

3. Desain Sistem & Spesifikasi Visual (Skeuomorphic Field Notes)

3.1 CSS Custom Properties

Dideklarasikan di :root dan digunakan secara konsisten.

```css
:root {
  --paper-cream: #faf6ee;
  --ink-dark: #22252a;
  --ink-muted: #5c6370;
  --line-blue: #e3ebf5;
  --margin-red: #ff9aa2;
  --accent-soft: #f0e9dc;
  --border-binder: #ccc2b0;
  --font-title: 'Special Elite', 'Courier Prime', monospace;
  --font-body: 'Inter', 'Roboto', sans-serif;
}
```

3.2 Efek Kertas Bergaris (Paper Lined Effect) – Diterapkan untuk kedua mode (indeks dan baca)

```css
.paper-container {
  background-color: var(--paper-cream);
  background-image: linear-gradient(var(--line-blue) 1px, transparent 1px);
  background-size: 100% 2rem;
  line-height: 2rem;
  position: relative;
  padding-left: 3rem;
}

.paper-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 2.5rem;
  width: 1px;
  height: 100%;
  background-color: var(--margin-red);
}
```

Semua konten di catatan.html (baik daftar indeks maupun hasil fetch catatan) berada di dalam elemen dengan kelas .paper-container.

---

4. Sistem Otomatisasi Build-Time (Vercel Automation)

4.1 Spesifikasi build.js (Node.js)

· Input: folder /catatan (file .html) dan /proyek (file .json)
· Output: daftar-catatan.json dan daftar-proyek.json di root, minified (tanpa spasi/baris kosong tambahan – gunakan JSON.stringify(data) tanpa indentasi).
· Catatan:
  · slug = nama file tanpa ekstensi
  · judul = dihasilkan dari slug (pisahkan dengan spasi, huruf pertama kapital)
  · tanggal = stat.mtime (objek Date)
· Proyek: baca langsung file JSON, asumsikan properti judul, deskripsi, link, tanggal
· Urutan: tidak perlu diurutkan saat build – urutan diserahkan ke frontend (sorting per tab).

4.2 Contoh kode build.js (minified output)

```js
const fs = require('fs');
const path = require('path');

const catatanDir = path.join(__dirname, 'catatan');
const daftarCatatan = fs.readdirSync(catatanDir)
  .filter(f => f.endsWith('.html'))
  .map(f => {
    const stat = fs.statSync(path.join(catatanDir, f));
    const slug = path.parse(f).name;
    const judul = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { slug, judul, tanggal: stat.mtime };
  });
fs.writeFileSync(path.join(__dirname, 'daftar-catatan.json'), JSON.stringify(daftarCatatan));

const proyekDir = path.join(__dirname, 'proyek');
const daftarProyek = fs.readdirSync(proyekDir)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(proyekDir, f), 'utf8')));
fs.writeFileSync(path.join(__dirname, 'daftar-proyek.json'), JSON.stringify(daftarProyek));

console.log('Build data JSON berhasil dibuat (minified)');
```

---

5. Spesifikasi Fungsional Frontend & Fitur (dengan Paginasi)

5.1 Landing Page (index.html)

· Tata letak vertikal satu kolom, mobile-first.
· Komponen:
  · Header dengan judul jurnal (font title)
  · Bio section (1-2 paragraf)
  · Showcase section: menampilkan beberapa proyek unggulan – fetch dari daftar-proyek.json (dinamis).
  · Navigation footer: tautan "Buka Buku Catatan Belajar →" menuju catatan.html

5.2 Halaman Template Jurnal Binder (catatan.html)

5.2.1 Mode Indeks (tanpa parameter ?page=) – DENGAN PAGINASI

Komponen yang ditampilkan:

· Dua tab: "Semua Catatan" dan "Daftar Latihan Web"
· Dropdown sorting: "Terbaru" (default) dan "Terlama"
· Search bar (dashed underline) dengan tombol clear [X]
· Area daftar list yang sudah dipaginasi
· Kontrol paginasi: tombol "Prev" dan "Next", indikator halaman (contoh: "Halaman 1 dari 5")

Aturan paginasi:

· 20 item per halaman (tetap).
· Paginasi berlaku setelah sorting dan filter.
· Jika total item ≤ 20, tombol Prev/Next di-disable (tetap tampil agar layout stabil) atau disembunyikan? Disable tetapi tetap tampil.
· Pindah tab → reset halaman ke 1.
· Melakukan pencarian (search) → reset halaman ke 1.
· Mengubah sorting → reset halaman ke 1.
· Tombol Prev/Next: mengubah halaman, re-render daftar tanpa reload.

Komponen visual paginasi:

· Letak: di bawah daftar list.
· Desain minimalis, warna --ink-muted.
· Contoh:
  <button class="page-btn" id="prevPage" disabled>← Sebelumnya</button>
  <span class="page-info">Halaman 1 / 3</span>
  <button class="page-btn" id="nextPage">Selanjutnya →</button>

Empty state:
Jika total item setelah filter = 0, tampilkan pesan "Catatan tidak ditemukan. Coba kata kunci lain atau pastikan ejaan sudah benar." (dengan --font-title, --ink-muted), dan sembunyikan kontrol paginasi.

5.2.2 Mode Baca (dengan parameter ?page=slug)

· JavaScript membaca URLSearchParams, jika ada page:
  · Sembunyikan mode indeks (tab, search, sorting, daftar, paginasi)
  · Tampilkan area konten (<div id="konten-jurnal">)
  · Fetch catatan/${page}.html
  · Jika sukses: inject HTML ke konten-jurnal (berada di dalam .paper-container)
  · Jika gagal: tampilkan pesan error 404.
  · Tambahkan tombol "kembali ke Daftar" (teks biasa, tanpa ikon) di atas konten.
    · Klik tombol → kembali ke mode indeks.
    · Reset semua state indeks: search kosong, tab "Semua Catatan", sorting "Terbaru", halaman 1.
    · URL kembali ke catatan.html.

5.3 Sistem Routing & State Management

· Gunakan URLSearchParams dan history.pushState (atau location.href untuk tombol kembali) agar navigasi antar catatan tidak melakukan full page reload.
· Saat pertama kali catatan.html dimuat tanpa parameter, render mode indeks dengan state default.
· State indeks per tab (search, sorting, halaman) disimpan di memori JavaScript, tetapi saat kembali dari mode baca, semua state direset ke default (sesuai keputusan UX).

5.4 Format Tampilan Daftar (mode indeks)

· Catatan: tampilkan 📄 <strong>judul</strong> <span class="date">DD MMM YYYY</span>
    (tanggal diformat dari properti tanggal JSON)
· Proyek: tampilkan 🔗 <strong>judul</strong> – deskripsi <a href="link" target="_blank">[Link Live]</a> <span class="date">DD MMM YYYY</span>
· Klik item catatan → arahkan ke ?page=slug (load parsial)
· Klik link proyek → buka tab baru (perilaku alami anchor)

---

6. Format Konten Data (Template)

6.1 File Catatan Baru (HTML parsial) – folder /catatan/

Tidak mengandung <html> atau <body>. Gunakan tag semantik.

```html
<h2>Konfigurasi Routing Dinamis OSPF di Cisco</h2>
<p class="meta-date" style="color: var(--ink-muted);">Dipelajari pada: 11 Juni 2026 | Kategori: #Networking</p>
<p>Hari ini saya berhasil menyelesaikan praktikum OSPF...</p>
<pre><code>Router(config)# router ospf 1</code></pre>
<img src="https://i.ibb.co/xyz/screenshot.png" alt="Bukti" class="img-fluid">
```

6.2 File Metadata Proyek (JSON) – folder /proyek/

```json
{
  "judul": "Kloning Landing Page Toko Online",
  "deskripsi": "Latihan eksplorasi layout CSS Grid dan Flexbox murni tanpa framework.",
  "link": "https://toko-online-latihan.vercel.app",
  "tanggal": "2026-06-11"
}
```

Judul proyek boleh duplikat, tidak ada validasi unik.

---

7. Kriteria Penerimaan (Final)

1. Dilarang mengubah CSS variables atau menambahkan library/framework.
2. Graceful fallback – jika fetch HTML parsial gagal, tampilkan pesan error, bukan blank screen.
3. Gambar eksternal – semua <img> menggunakan URL absolut.
4. JSON output build harus minified (tanpa spasi/baris kosong tambahan).
5. Sorting per tab menggunakan new Date(tanggal) secara konsisten.
6. Saat kembali dari mode baca ke indeks, search bar direset kosong, tab "Semua Catatan", sorting "Terbaru", halaman 1.
7. Tombol "kembali ke Daftar" wajib ada dan hanya teks (tanpa ikon panah).
8. Efek garis kertas (.paper-container) diterapkan untuk kedua mode (indeks dan baca).
9. Paginasi wajib diimplementasikan dengan 20 item per halaman. Kontrol Prev/Next berfungsi tanpa reload.
10. Total halaman dihitung dengan Math.ceil(totalItem / 20).
11. Saat filter (search) atau ganti sorting, halaman di-reset ke 1.
12. Saat pindah tab, halaman di-reset ke 1.
13. Jika hanya 1 halaman, tombol Prev/Next di-disable (tetap tampil).

---

8. Catatan Implementasi untuk Developer

· Gunakan fungsi renderList(dataArray, page) yang menampilkan item ke-(start) sampai (start+19).
· Simpan filteredData (hasil sorting + filter) dan currentPage per tab.
· Saat paginasi diklik, cukup re-render dari filteredData yang sudah ada.
· Gunakan sessionStorage jika ingin menyimpan state indeks (opsional, tidak wajib). Namun keputusan final: tidak perlu karena UX memilih reset penuh saat kembali dari mode baca.
· Pastikan semua konten dapat di-scroll dengan nyaman di HP (gunakan overflow-y: auto jika perlu).

