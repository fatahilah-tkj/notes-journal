PRODUCT REQUIREMENT DOCUMENT (PRD)
Nama Proyek: Personal IT Learning Journal & Project Showcase (Field Notes)
Versi: 1.1 (Final) | Tech Stack: Vanilla HTML5, CSS3, JavaScript (Node.js Build Script) | Platform Deployment: Vercel
1. Project Overview & Target Audiens
1.1 Tujuan Proyek
Proyek ini membangun sebuah website statis personal terpisah sebagai jurnal perjalanan belajar (catatan harian, hasil praktikum IT/Networking/Web Dev) sekaligus tempat penyimpanan (showcase) massal proyek/latihan web eksternal yang dibuat selama proses belajar. Proyek ini berfungsi sebagai personal branding publik yang bersih, unik, dan interaktif.
1.2 Target Audiens
Rekan sejawat teknisi IT/TKJ, komunitas developer, dan potensial rekruter di masa depan yang ingin melihat bukti nyata (proof of work) dari perkembangan kompetensi teknis pemilik web secara kronologis.
1.3 Batasan Pengembangan (Developer Constraints)
* Mobile-First Development: Seluruh kode harus dirancang dan dioptimalkan agar mudah ditulis, dimodifikasi, dan dikelola murni melalui perangkat mobile (smartphone) menggunakan aplikasi teks editor seperti Acode atau Spck Code Editor.
* Zero Frameworks/Libraries: Dilarang keras menggunakan framework (React, Vue, Tailwind) atau library pihak ketiga (Marked.js, jQuery). Semua kode front-end wajib menggunakan murni Vanilla HTML5, CSS3, dan Native JavaScript.
2. Struktur Direktori & Arsitektur Proyek
Sistem wajib diatur dalam struktur folder terpisah berikut agar skalabilitas jangka panjangnya aman dan sangat mudah dikelola via HP:
[root]/
├── package.json        (Konfigurasi npm & script build Vercel)
├── build.js            (Script otomatisasi Node.js saat build-time)
├── index.html          (Landing Page minimalis / Sampul Depan)
├── catatan.html        (Template Buku Binder / Shell Konten)
├── style.css           (Pusat CSS Custom Properties & Layout)
├── script.js           (Logika Frontend: Fetch, URL Router, Search, & Sorting)
├── catatan/            (Folder Khusus Dokumen HTML Parsial)
│   ├── cisco-ospf.html
│   └── css-flexbox.html
└── proyek/             (Folder Khusus Metadata Link Web Eksternal)
   ├── toko-online.json
   └── kalkulator-js.json

3. Desain Sistem & Spesifikasi Visual (Skeuomorphic Field Notes)
Konsep visual meniru tampilan Buku Jurnal / Catatan Binder Fisik menggunakan manipulasi CSS modern tanpa menggunakan gambar latar belakang eksternal agar performa loading tetap instan.
3.1 Variabel CSS (CSS Custom Properties)
Wajib dideklarasikan di dalam :root pada file style.css dan digunakan secara konsisten di seluruh elemen UI:
:root {
 --paper-cream: #faf6ee;     /* Latar belakang halaman kertas */
 --ink-dark: #22252a;        /* Warna teks utama (tinta pena) */
 --ink-muted: #5c6370;       /* Warna teks sekunder (tanggal/status) */
 --line-blue: #e3ebf5;       /* Warna garis horizontal buku */
 --margin-red: #ff9aa2;      /* Warna garis tepi vertikal buku */
 --accent-soft: #f0e9dc;     /* Warna background tab aktif / hover */
 --border-binder: #ccc2b0;   /* Warna pembatas elemen skeuomorphic */
 --font-title: 'Special Elite', 'Courier Prime', monospace;
 --font-body: 'Inter', 'Roboto', sans-serif;
}

3.2 Trik CSS Efek Kertas Bergaris (Paper Lined Effect)
Wajib diterapkan pada kontainer konten jurnal di catatan.html:
.paper-container {
 background-color: var(--paper-cream);
 background-image: linear-gradient(var(--line-blue) 1px, transparent 1px);
 background-size: 100% 2rem; /* Jarak antar garis horizontal */
 line-height: 2rem;
 position: relative;
 padding-left: 3rem; /* Memberikan ruang untuk garis margin merah */
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

4. Sistem Otomatisasi Build-Time (Vercel Automation)
Untuk menghindari keharusan mengedit file HTML secara manual setiap kali ada catatan atau proyek baru, proses pengindeksan data dipindahkan ke server Vercel saat deployment.
4.1 Spesifikasi Script build.js (Node.js)
Script ini dijalankan otomatis oleh Vercel (via npm run build) sebelum website dipublikasikan. Tugas utamanya membaca file di folder /catatan dan /proyek, lalu mem-build dua file JSON statis kecil di root direktori: daftar-catatan.json dan daftar-proyek.json.
const fs = require('fs');
const path = require('path');

// 1. Scan folder catatan/
const catatanDir = path.join(__dirname, 'catatan');
const daftarCatatan = fs.readdirSync(catatanDir)
 .filter(file => file.endsWith('.html'))
 .map(file => {
   const stat = fs.statSync(path.join(catatanDir, file));
   const slug = path.parse(file).name;
   const judul = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
   
   return {
     slug: slug,
     judul: judul,
     tanggal: stat.mtime // Diurutkan berdasarkan kapan file diperbarui/dibuat
   };
 });

fs.writeFileSync(path.join(__dirname, 'daftar-catatan.json'), JSON.stringify(daftarCatatan, null, 2));

// 2. Scan folder proyek/
const proyekDir = path.join(__dirname, 'proyek');
const daftarProyek = fs.readdirSync(proyekDir)
 .filter(file => file.endsWith('.json'))
 .map(file => {
   return JSON.parse(fs.readFileSync(path.join(proyekDir, file), 'utf8'));
 });

fs.writeFileSync(path.join(__dirname, 'daftar-proyek.json'), JSON.stringify(daftarProyek, null, 2));

console.log("Build data JSON berhasil dibuat otomatis!");

5. Spesifikasi Fungsional Frontend & Fitur
5.1 Landing Page Minimalis (index.html)
* Tata Letak: Vertikal satu kolom yang sangat bersih. Mobile-first alami tanpa elemen yang memicu horizontal scroll.
* Komponen:
   * Header: Judul jurnal (menggunakan --font-title).
   * Bio Section: 1-2 paragraf perkenalan fokus keahlian IT & Web Dev.
   * Showcase Section: Menampilkan list teks vertikal statis beberapa proyek unggulan atau fetch otomatis dari daftar-proyek.json. Format list minimalis: Nama Website — Deskripsi Singkat [Link Live].
   * Navigation Footer: Tautan bersih bertuliskan "Buka Buku Catatan Belajar →" yang mengarah ke catatan.html.
5.2 Halaman Template Jurnal Binder (catatan.html)
* Tata Letak: Menggunakan desain skeuomorphic kertas binder bergaris. Memiliki menu Tab Pembatas Binder (Index Tabs) di area yang mudah dijangkau jempol:
   * Tab 1: "Semua Catatan"
   * Tab 2: "Daftar Latihan Web"
* Fitur Pengurutan (Sorting):
   * Terdapat pemilih (dropdown/tombol): "Terbaru" dan "Terlama".
   * Logika: Menggunakan JavaScript Array .reverse() / .sort() secara lokal di browser. Urutan list wajib berubah instan (0 milidetik) tanpa reload halaman saat diklik.
5.3 Pencarian Real-Time & Penanganan Kondisi Kosong (Search Bar & Empty State)
* Komponen Visual Search Bar:
   * Posisi: Di halaman catatan.html sebelum daftar list muncul.
   * Desain: Gaya garis bawah putus-putus (dashed underline) berwarna --ink-dark, tanpa border kotak kaku.
   * Placeholder: "Cari catatan atau proyek di sini..." dengan warna --ink-muted.
* Tombol Clear Search ([X]):
   * Elemen [X] menggunakan font --font-title, posisi absolute di pojok kanan dalam search bar.
   * Logika Perilaku: Default disembunyikan (display: none). Saat user mengetik minimal 1 huruf, tombol otomatis muncul.
   * Aksi Klik: Mengosongkan input, menyembunyikan tombol [X] kembali, menghapus empty state, dan memunculkan kembali list data asli secara instan.
* Kondisi Kosong (Empty State):
   * Jika filter search bar menghasilkan 0 data, container list asli disembunyikan.
   * Munculkan teks pemberitahuan dinamis di tengah layar: "Catatan tidak ditemukan. Coba kata kunci lain atau pastikan ejaan sudah benar." (Menggunakan font --font-title dan warna --ink-muted).
   * Saat teks pencarian dihapus, empty state langsung hilang dan data kembali normal.
5.4 Sistem Routing Parameter URL (script.js)
* Logika utama untuk merealisasikan Dynamic Fetching Content dari folder /catatan tanpa menggunakan framework:
const params = new URLSearchParams(window.location.search);
const page = params.get('page');
const kontenDiv = document.getElementById('konten-jurnal');

if (page) {
 fetch(`catatan/${page}.html`)
   .then(response => {
     if(!response.ok) throw new Error('Catatan tidak ditemukan');
     return response.text();
   })
   .then(html => { kontenDiv.innerHTML = html; })
   .catch(err => {
     kontenDiv.innerHTML = `<h2 style="font-family: var(--font-title);">Error 404</h2><p>Halaman catatan tidak ditemukan.</p>`;
   });
} else {
 // Render daftar indeks dari JSON jika tidak ada parameter ?page=
}

6. Spesifikasi Format Konten Data (Data Templates)
6.1 Format File Catatan Baru (HTML Parsial)
Disimpan di folder /catatan/. File ini tidak boleh mengandung tag <html> atau <body>. Isinya murni tag semantik konten agar sangat mudah dan ringan diketik langsung dari HP:
<h2>Konfigurasi Routing Dinamis OSPF di Cisco</h2>
<p class="meta-date" style="color: var(--ink-muted);">Dipelajari pada: 11 Juni 2026 | Kategori: #Networking</p>

<p>Hari ini saya berhasil menyelesaikan praktikum OSPF menggunakan Cisco Modeling Labs...</p>

<pre><code>Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0</code></pre>

<img src="[https://i.ibb.co/xyz/screenshot-ospf.png](https://i.ibb.co/xyz/screenshot-ospf.png)" alt="Bukti Tabel Routing OSPF" class="img-fluid">

6.2 Format File Metadata Proyek Baru (JSON)
Disimpan di folder /proyek/. Digunakan untuk meregistrasi tautan web eksternal hasil latihan:
{
 "judul": "Kloning Landing Page Toko Online",
 "deskripsi": "Latihan eksplorasi layout menggunakan CSS Grid tingkat lanjut dan Flexbox murni tanpa framework.",
 "link": "[https://toko-online-latihan.vercel.app](https://toko-online-latihan.vercel.app)",
 "tanggal": "2026-06-11"
}

7. Kriteria Penerimaan & Guardrails Ketat
1. Dilarang Halusinasi Struktur: AI Developer tidak boleh mengubah penamaan CSS Variables atau menambahkan arsitektur library pihak ketiga atas inisiatif sendiri.
2. Validasi File HTML Parsial: Jika file gagal di-fetch (URL salah), UI tidak boleh blank white screen. Harus melakukan graceful fallback menampilkan teks Empty State.
3. Manajemen Gambar: Skrip tidak perlu menampung gambar lokal. Seluruh <img> akan menggunakan URL absolut dari penyedia Image Hosting gratis (ImgBB/PostImages) sesuai alur kerja seluler.
4. Optimasi Performa JSON: Script Node.js di sisi server Vercel harus memproduksi JSON tanpa spasi berlebih (minified output) demi memastikan transfer payload di sisi browser mobile tetap di bawah 100 KB.