// ========== GLOBAL VARIABLES ==========
let dataCatatan = [];       // array dari daftar-catatan.json
let dataProyek = [];        // array dari daftar-proyek.json

let tabAktif = 'catatan';   // 'catatan' atau 'proyek'
let sortState = {
  catatan: 'terbaru',
  proyek: 'terbaru'
};
let searchTerm = '';
let currentPage = {
  catatan: 1,
  proyek: 1
};
const ITEMS_PER_PAGE = 20;

// Elemen DOM
const modeIndeks = document.getElementById('mode-indeks');
const modeBaca = document.getElementById('mode-baca');
const tabCatatanBtn = document.getElementById('tab-catatan');
const tabProyekBtn = document.getElementById('tab-proyek');
const sortSelect = document.getElementById('sort-select');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const listContainer = document.getElementById('list-container');
const emptyStateDiv = document.getElementById('empty-state');
const paginationControls = document.getElementById('pagination-controls');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfoSpan = document.getElementById('page-info');
const backToListBtn = document.getElementById('back-to-list');
const kontenJurnal = document.getElementById('konten-jurnal');

// ========== HELPER FUNCTIONS ==========
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return 'Tanggal tidak valid';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Filter, sort, paginasi
function getFilteredSortedData() {
  let rawData = tabAktif === 'catatan' ? [...dataCatatan] : [...dataProyek];
  // Filter berdasarkan searchTerm (cari di judul)
  if (searchTerm.trim() !== '') {
    const term = searchTerm.trim().toLowerCase();
    rawData = rawData.filter(item => item.judul.toLowerCase().includes(term));
  }
  // Sorting
  const sortValue = sortState[tabAktif];
  rawData.sort((a, b) => {
    const dateA = new Date(a.tanggal);
    const dateB = new Date(b.tanggal);
    if (sortValue === 'terbaru') return dateB - dateA;
    else return dateA - dateB;
  });
  return rawData;
}

function renderList() {
  const filtered = getFilteredSortedData();
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  let current = currentPage[tabAktif];
  if (current > totalPages) current = totalPages;
  if (current < 1) current = 1;
  currentPage[tabAktif] = current;

  // Handle empty state
  if (totalItems === 0) {
    listContainer.style.display = 'none';
    emptyStateDiv.style.display = 'block';
    paginationControls.style.display = 'none';
    return;
  }
  listContainer.style.display = 'block';
  emptyStateDiv.style.display = 'none';
  paginationControls.style.display = 'flex';

  // Paginate
  const start = (current - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, end);

  // Render HTML
  let html = '';
  for (let item of pageItems) {
    if (tabAktif === 'catatan') {
      html += `
        <div class="list-item" data-slug="${escapeHtml(item.slug)}">
          <strong>📄 ${escapeHtml(item.judul)}</strong>
          <span class="date">${formatDate(item.tanggal)}</span>
        </div>
      `;
    } else {
      html += `
        <div class="list-item proyek-item">
          <strong>🔗 ${escapeHtml(item.judul)}</strong>
          <span class="date">${formatDate(item.tanggal)}</span>
          <div class="proyek-desc">${escapeHtml(item.deskripsi)}</div>
          <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="proyek-link">[Link Live]</a>
        </div>
      `;
    }
  }
  listContainer.innerHTML = html;

  // Update pagination info & button state
  pageInfoSpan.textContent = `Halaman ${current} / ${totalPages}`;
  prevPageBtn.disabled = (current <= 1);
  nextPageBtn.disabled = (current >= totalPages);

  // Attach click event untuk catatan (hanya mode catatan)
  if (tabAktif === 'catatan') {
    document.querySelectorAll('.list-item[data-slug]').forEach(el => {
      el.addEventListener('click', (e) => {
        // Jangan jika klik di dalam link proyek (tidak ada di mode catatan, tapi aman)
        const slug = el.getAttribute('data-slug');
        if (slug) {
          window.history.pushState({}, '', `?page=${slug}`);
          handleRouting();
        }
      });
    });
  }
}

function resetIndeksState() {
  tabAktif = 'catatan';
  sortState = { catatan: 'terbaru', proyek: 'terbaru' };
  searchTerm = '';
  currentPage = { catatan: 1, proyek: 1 };
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  sortSelect.value = 'terbaru';
  // Update UI tab
  tabCatatanBtn.classList.add('active');
  tabProyekBtn.classList.remove('active');
  renderList();
}

// ========== ROUTING & MODE BACA ==========
async function handleRouting() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  if (page) {
    // Mode baca
    modeIndeks.style.display = 'none';
    modeBaca.style.display = 'block';
    kontenJurnal.innerHTML = '<p>Memuat catatan...</p>';
    try {
      const response = await fetch(`catatan/${page}.html`);
      if (!response.ok) throw new Error('Catatan tidak ditemukan');
      const html = await response.text();
      kontenJurnal.innerHTML = html;
    } catch (err) {
      kontenJurnal.innerHTML = `<h2 style="font-family: var(--font-title);">⚠️ Error 404</h2><p>Halaman catatan tidak ditemukan. Pastikan file ${page}.html ada di folder catatan/</p>`;
    }
  } else {
    // Mode indeks
    modeIndeks.style.display = 'block';
    modeBaca.style.display = 'none';
    resetIndeksState();
  }
}

// ========== EVENT LISTENERS ==========
function bindEvents() {
  // Tab
  tabCatatanBtn.addEventListener('click', () => {
    if (tabAktif === 'catatan') return;
    tabAktif = 'catatan';
    tabCatatanBtn.classList.add('active');
    tabProyekBtn.classList.remove('active');
    currentPage[tabAktif] = 1;
    renderList();
  });
  tabProyekBtn.addEventListener('click', () => {
    if (tabAktif === 'proyek') return;
    tabAktif = 'proyek';
    tabProyekBtn.classList.add('active');
    tabCatatanBtn.classList.remove('active');
    currentPage[tabAktif] = 1;
    renderList();
  });

  // Sorting
  sortSelect.addEventListener('change', (e) => {
    sortState[tabAktif] = e.target.value;
    currentPage[tabAktif] = 1;
    renderList();
  });

  // Search input
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    currentPage[tabAktif] = 1;
    renderList();
    // Tampilkan tombol clear jika ada input
    if (searchTerm.length > 0) {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }
  });

  // Tombol clear search
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    currentPage[tabAktif] = 1;
    renderList();
    clearSearchBtn.style.display = 'none';
  });

  // Pagination
  prevPageBtn.addEventListener('click', () => {
    if (currentPage[tabAktif] > 1) {
      currentPage[tabAktif]--;
      renderList();
    }
  });
  nextPageBtn.addEventListener('click', () => {
    const filtered = getFilteredSortedData();
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage[tabAktif] < totalPages) {
      currentPage[tabAktif]++;
      renderList();
    }
  });

  // Tombol kembali ke daftar (dari mode baca)
  backToListBtn.addEventListener('click', () => {
    // Reset URL tanpa parameter
    window.history.pushState({}, '', 'catatan.html');
    handleRouting(); // akan masuk ke mode indeks dan reset state
  });
}

// ========== INIT ==========
async function init() {
  try {
    const [resCatatan, resProyek] = await Promise.all([
      fetch('daftar-catatan.json'),
      fetch('daftar-proyek.json')
    ]);
    if (!resCatatan.ok || !resProyek.ok) throw new Error('Gagal fetch data');
    dataCatatan = await resCatatan.json();
    dataProyek = await resProyek.json();
  } catch (err) {
    console.error(err);
    listContainer.innerHTML = '<p>Gagal memuat data. Pastikan file daftar-catatan.json dan daftar-proyek.json tersedia.</p>';
    return;
  }
  bindEvents();
  await handleRouting(); // cek URL parameter
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', init);