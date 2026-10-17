// Main Script for Dashboard / Katalog LabMart (index.html)

let activeCategory = 'all';
let searchQuery = '';
let activeSort = 'popular';
let activeGradeFilter = 'all';

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  renderCategoryTabs();
  renderProducts();
  initCountdownTimer();
  initQuickViewModal();
  setupSearchAndFilters();
});

// Render Category Filter Tabs
function renderCategoryTabs() {
  const container = document.getElementById('category-bar');
  if (!container) return;

  container.innerHTML = LAB_CATEGORIES.map(cat => {
    const isActive = cat.id === activeCategory;
    return `
      <button 
        onclick="setCategory('${cat.id}')"
        class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
          isActive 
            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 ring-2 ring-teal-600 ring-offset-1' 
            : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-400 hover:bg-slate-50'
        }"
      >
        <span class="material-symbols-outlined text-base sm:text-lg">${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');
}

// Set Active Category
function setCategory(catId) {
  activeCategory = catId;
  renderCategoryTabs();
  renderProducts();
}

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById('cards-grid');
  const countLabel = document.getElementById('products-count');
  if (!grid) return;

  let filtered = typeof getAllProducts === 'function' ? [...getAllProducts()] : [...LAB_PRODUCTS];

  // Category filter
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  // Grade filter
  if (activeGradeFilter !== 'all') {
    if (activeGradeFilter === 'pa') {
      filtered = filtered.filter(p => p.grade.toLowerCase().includes('pro analisis') || p.grade.toLowerCase().includes('pa'));
    } else if (activeGradeFilter === 'cold') {
      filtered = filtered.filter(p => p.requiresColdChain);
    } else if (activeGradeFilter === 'fragile') {
      filtered = filtered.filter(p => p.requiresWoodenCrate);
    }
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.casNumber.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (activeSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (activeSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (countLabel) {
    countLabel.textContent = `${filtered.length} Produk Ditemukan`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
          <span class="material-symbols-outlined text-3xl">search_off</span>
        </div>
        <h4 class="text-lg font-bold text-slate-800">Tidak ada produk laboratorium yang cocok</h4>
        <p class="text-sm text-slate-500 mt-1 max-w-md mx-auto">Coba gunakan kata kunci lain seperti 'Mikroskop', 'Etanol', 'Erlenmeyer', atau ganti kategori pencarian Anda.</p>
        <button onclick="resetFilters()" class="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold">
          Reset Filter Pencarian
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const isWished = isInWishlist(product.id);
    return `
      <div class="product-card bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col group relative shadow-2xs hover:border-teal-500">
        <!-- Badge Atas -->
        <div class="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-col gap-1 items-start max-w-[calc(100%-38px)]">
          ${product.badge ? `
            <span class="inline-flex items-center gap-1 bg-teal-600/95 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm max-w-full">
              <span class="material-symbols-outlined text-xs sm:text-sm shrink-0">verified</span>
              <span class="truncate">${product.badge}</span>
            </span>
          ` : ''}
          ${product.requiresColdChain ? `
            <span class="inline-flex items-center gap-1 bg-cyan-600/95 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm max-w-full">
              <span class="material-symbols-outlined text-xs sm:text-sm shrink-0">ac_unit</span>
              <span class="truncate">Cold Chain</span>
            </span>
          ` : ''}
        </div>

        <!-- Tombol Wishlist -->
        <button 
          onclick="handleWishlistClick(event, '${product.id}')"
          title="Simpan ke Favorit"
          class="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-xs shadow-sm border border-slate-200 flex items-center justify-center transition-transform active:scale-90 hover:scale-105"
        >
          <span class="material-symbols-outlined text-base sm:text-lg ${isWished ? 'fill-1 text-rose-500' : 'text-slate-400 hover:text-rose-500'}">favorite</span>
        </button>

        <!-- Foto Produk -->
        <a href="product-detail.html?id=${product.id}" class="block aspect-square w-full bg-slate-50 overflow-hidden relative group/img">
          <img 
            src="${product.images[0]}" 
            alt="${product.name}" 
            class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
            loading="lazy"
            onerror="this.onerror=null; this.src='images/microscope.jpg';"
          />
          <div class="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors"></div>
        </a>

        <!-- Content Info -->
        <div class="p-2.5 sm:p-4 flex flex-col flex-1 justify-between">
          <div>
            <!-- Kategori & Brand -->
            <div class="flex items-center justify-between text-xs text-slate-500 mb-1 gap-1 min-w-0">
              <span class="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-xs truncate shrink-0 max-w-[60%]">${product.categoryLabel}</span>
              <span class="truncate text-xs font-semibold text-slate-500 text-right min-w-0">${product.brand}</span>
            </div>

            <!-- Judul Produk -->
            <a href="product-detail.html?id=${product.id}" class="font-extrabold text-slate-900 text-xs sm:text-base hover:text-teal-600 line-clamp-2 leading-snug sm:leading-normal mt-0.5 group-hover:text-teal-600 transition-colors min-h-[2.2rem] sm:min-h-[2.8rem]" title="${product.name}">
              ${product.name}
            </a>

            <!-- Grade Kimia / Standar Lab -->
            <p class="text-xs sm:text-sm text-slate-700 mt-1 flex items-center gap-1 min-w-0 font-medium">
              <span class="material-symbols-outlined text-xs sm:text-sm text-teal-600 shrink-0">science</span>
              <span class="truncate">${product.grade}</span>
            </p>

            <!-- Rating & Terjual -->
            <div class="flex items-center gap-1.5 mt-1 text-xs sm:text-sm">
              <div class="flex items-center text-amber-500 font-extrabold gap-0.5 shrink-0">
                <span class="material-symbols-outlined text-xs sm:text-sm fill-1">star</span>
                <span>${product.rating}</span>
              </div>
              <span class="text-slate-300">|</span>
              <span class="text-slate-600 truncate font-semibold text-xs sm:text-sm">${product.soldCount}</span>
            </div>

            <!-- Harga & Diskon -->
            <div class="mt-1.5 sm:mt-2 pt-1 border-t border-slate-100">
              <div class="flex flex-wrap items-baseline gap-1.5">
                <span class="text-sm sm:text-lg font-black text-teal-700 font-mono-code">${formatRupiah(product.price)}</span>
                ${product.discount > 0 ? `
                  <span class="text-xs sm:text-sm text-slate-400 line-through font-mono-code">${formatRupiah(product.originalPrice)}</span>
                ` : ''}
              </div>
              ${product.discount > 0 ? `
                <div class="mt-0.5">
                  <span class="text-xs font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded leading-none inline-block">-${product.discount}%</span>
                </div>
              ` : ''}
            </div>

            <!-- Lokasi Toko -->
            <div class="flex items-center gap-1 text-xs text-slate-500 mt-1 min-w-0">
              <span class="material-symbols-outlined text-xs sm:text-sm text-teal-600 shrink-0">store</span>
              <span class="truncate font-semibold text-slate-600">${product.storeCity || product.storeName || 'Distributor Resmi'}</span>
            </div>
          </div>

          <!-- Tombol Aksi Bawah -->
          <div class="mt-2.5 sm:mt-3 pt-1 flex items-center gap-1.5 sm:gap-2">
            <a 
              href="product-detail.html?id=${product.id}"
              class="flex-1 py-2 sm:py-2.5 px-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-extrabold text-slate-800 hover:bg-slate-100 hover:border-slate-400 transition-colors flex items-center justify-center gap-1 text-center"
            >
              <span class="material-symbols-outlined text-sm sm:text-base">visibility</span>
              <span>Detail</span>
            </a>
            <button 
              onclick="handleQuickAddToCart(event, '${product.id}')"
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-xs active:scale-95 transition-all shrink-0"
              title="Tambah ke Keranjang"
            >
              <span class="material-symbols-outlined text-base sm:text-lg">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Quick Add To Cart from Card
function handleQuickAddToCart(event, productId) {
  event.stopPropagation();
  event.preventDefault();
  addToCart(productId, 0, 1, '');
}

// Wishlist Click
function handleWishlistClick(event, productId) {
  event.stopPropagation();
  event.preventDefault();
  toggleWishlist(productId);
  renderProducts();
}

// Setup Filters & Search
function setupSearchAndFilters() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderProducts();
    });
  }

  const gradeFilter = document.getElementById('filter-grade');
  if (gradeFilter) {
    gradeFilter.addEventListener('change', (e) => {
      activeGradeFilter = e.target.value;
      renderProducts();
    });
  }
}

function resetFilters() {
  activeCategory = 'all';
  searchQuery = '';
  activeSort = 'popular';
  activeGradeFilter = 'all';
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'popular';

  const gradeFilter = document.getElementById('filter-grade');
  if (gradeFilter) gradeFilter.value = 'all';

  renderCategoryTabs();
  renderProducts();
}

// Countdown Timer for Flash Sale
function initCountdownTimer() {
  const timerHours = document.getElementById('timer-hours');
  const timerMins = document.getElementById('timer-mins');
  const timerSecs = document.getElementById('timer-secs');

  if (!timerHours || !timerMins || !timerSecs) return;

  // Set target 8 hours from now or fixed end-of-day
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 6);

  function update() {
    const now = new Date();
    const diff = Math.max(0, endTime - now);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    timerHours.textContent = String(hours).padStart(2, '0');
    timerMins.textContent = String(mins).padStart(2, '0');
    timerSecs.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// Quick View Modal
function initQuickViewModal() {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;

  window.closeQuickView = function() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      window.closeQuickView();
    }
  });
}

function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const body = document.getElementById('quick-view-content');
  if (!modal || !body) return;

  let selectedVariant = 0;
  let qty = 1;

  function renderModalBody() {
    const currentPrice = product.price + (product.variants[selectedVariant] ? product.variants[selectedVariant].extraPrice : 0);
    const subtotal = currentPrice * qty;

    body.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <!-- Gambar -->
        <div class="flex flex-col gap-3">
          <div class="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img id="qv-main-img" src="${product.images[0]}" alt="${product.name}" onerror="this.onerror=null; this.src='images/microscope.jpg';" class="w-full h-full object-cover" />
          </div>
          <div class="flex gap-2">
            ${product.images.map((img, idx) => `
              <button 
                onclick="document.getElementById('qv-main-img').src='${img}'"
                class="w-16 h-16 rounded-xl overflow-hidden border-2 hover:border-teal-500 border-slate-200"
              >
                <img src="${img}" onerror="this.onerror=null; this.src='images/microscope.jpg';" class="w-full h-full object-cover" />
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Info Produk -->
        <div class="flex flex-col">
          <div class="flex items-center justify-between">
            <span class="text-xs sm:text-sm font-bold px-3 py-1 bg-teal-50 text-teal-800 rounded-lg">${product.categoryLabel}</span>
            <span class="text-xs sm:text-sm font-mono-code font-bold text-slate-500">ID: ${product.id}</span>
          </div>

          <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 leading-snug">${product.name}</h3>

          <div class="flex items-center gap-3 mt-2 text-sm sm:text-base">
            <div class="flex items-center text-amber-500 font-extrabold gap-1">
              <span class="material-symbols-outlined text-lg fill-1">star</span>
              <span>${product.rating}</span>
            </div>
            <span class="text-slate-300">|</span>
            <span class="text-slate-700 font-medium">${product.reviewsCount} Ulasan</span>
            <span class="text-slate-300">|</span>
            <span class="text-slate-700 font-semibold">${product.soldCount}</span>
          </div>

          <!-- Harga -->
          <div class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div class="text-2xl sm:text-3xl font-black text-teal-700 font-mono-code">${formatRupiah(currentPrice)}</div>
            ${product.discount > 0 ? `
              <div class="flex items-center gap-2 mt-1">
                <span class="text-sm text-slate-400 line-through font-mono-code">${formatRupiah(product.originalPrice)}</span>
                <span class="text-xs sm:text-sm font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Diskon ${product.discount}%</span>
              </div>
            ` : ''}
          </div>

          <!-- Pilihan Varian -->
          <div class="mt-4">
            <label class="text-xs sm:text-sm font-extrabold text-slate-800 block mb-2 uppercase tracking-wide">Pilih Varian / Ukuran:</label>
            <div class="flex flex-wrap gap-2">
              ${product.variants.map((v, idx) => `
                <button 
                  onclick="changeQvVariant(${idx})"
                  class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    idx === selectedVariant 
                      ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-600/30' 
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }"
                >
                  ${v.name} ${v.extraPrice > 0 ? `(+${formatRupiah(v.extraPrice)})` : ''}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Qty & Subtotal -->
          <div class="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
            <div>
              <span class="text-xs sm:text-sm font-medium text-slate-500 block">Subtotal</span>
              <span class="text-xl sm:text-2xl font-black text-slate-900 font-mono-code">${formatRupiah(subtotal)}</span>
            </div>
            <div class="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
              <button onclick="changeQvQty(-1)" class="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold text-base">-</button>
              <span class="w-12 text-center text-base font-bold text-slate-900">${qty}</span>
              <button onclick="changeQvQty(1)" class="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold text-base">+</button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-5 flex gap-3">
            <a 
              href="product-detail.html?id=${product.id}"
              class="flex-1 py-3 px-4 rounded-xl border border-teal-600 text-teal-700 font-extrabold text-sm sm:text-base text-center hover:bg-teal-50 transition-colors"
            >
              Halaman Detail Penuh
            </a>
            <button 
              onclick="executeQvAddToCart('${product.id}')"
              class="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
            >
              <span class="material-symbols-outlined text-lg">shopping_cart</span>
              + Ke Keranjang
            </button>
          </div>
        </div>
      </div>
    `;
  }

  window.changeQvVariant = function(idx) {
    selectedVariant = idx;
    renderModalBody();
  };

  window.changeQvQty = function(delta) {
    qty = Math.max(1, qty + delta);
    renderModalBody();
  };

  window.executeQvAddToCart = function(pId) {
    addToCart(pId, selectedVariant, qty, '');
    window.closeQuickView();
  };

  renderModalBody();
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
