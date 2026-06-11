const fs = require('fs');
const path = require('path');

// 1. Scan folder catatan/ untuk file .html
const catatanDir = path.join(__dirname, 'catatan');
const daftarCatatan = fs.readdirSync(catatanDir)
  .filter(file => file.endsWith('.html'))
  .map(file => {
    const stat = fs.statSync(path.join(catatanDir, file));
    const slug = path.parse(file).name;
    // Ubah slug menjadi judul: "cisco-ospf" -> "Cisco Ospf"
    const judul = slug.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return { slug, judul, tanggal: stat.mtime };
  });

// Tulis daftar-catatan.json (minified)
fs.writeFileSync(
  path.join(__dirname, 'daftar-catatan.json'),
  JSON.stringify(daftarCatatan)
);

// 2. Scan folder proyek/ untuk file .json
const proyekDir = path.join(__dirname, 'proyek');
const daftarProyek = fs.readdirSync(proyekDir)
  .filter(file => file.endsWith('.json'))
  .map(file => {
    const filePath = path.join(proyekDir, file);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });

// Tulis daftar-proyek.json (minified)
fs.writeFileSync(
  path.join(__dirname, 'daftar-proyek.json'),
  JSON.stringify(daftarProyek)
);

console.log('✅ Build data JSON berhasil dibuat (minified)');