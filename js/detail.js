// Product Detail Page Script (detail.js)

let currentProduct = null;
let selectedVariantIndex = 0;
let currentQty = 1;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'LAB-001';

  currentProduct = getProductById(productId);
  if (!currentProduct) {
    currentProduct = typeof getAllProducts === 'function' ? getAllProducts()[0] : LAB_PRODUCTS[0]; // fallback
  }

  renderProductDetails();
  renderRelatedProducts();
  setupTabNavigation();
  setupDiscussionForm();
});

function renderProductDetails() {
  const p = currentProduct;
  document.title = `${p.name} - LabMart Indonesia`;

  // Breadcrumbs
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  const breadcrumbTitle = document.getElementById('breadcrumb-title');
  if (breadcrumbCategory) breadcrumbCategory.textContent = p.categoryLabel;
  if (breadcrumbTitle) breadcrumbTitle.textContent = p.name;

  // Title, Badges, Brand
  const titleEl = document.getElementById('product-title');
  if (titleEl) titleEl.textContent = p.name;

  const brandEl = document.getElementById('product-brand');
  if (brandEl) brandEl.textContent = p.brand;

  const storeEl = document.getElementById('store-name');
  if (storeEl) storeEl.textContent = p.storeName;

  const storeCityEl = document.getElementById('store-city');
  if (storeCityEl) storeCityEl.textContent = p.storeCity;

  const ratingEl = document.getElementById('product-rating');
  if (ratingEl) ratingEl.textContent = p.rating;

  const reviewsEl = document.getElementById('product-reviews');
  if (reviewsEl) reviewsEl.textContent = `${p.reviewsCount} ulasan`;

  const soldEl = document.getElementById('product-sold');
  if (soldEl) soldEl.textContent = p.soldCount;

  // Images Gallery
  const mainImage = document.getElementById('main-image');
  const thumbsContainer = document.getElementById('thumbs-container');
  if (mainImage && p.images.length > 0) {
    mainImage.src = p.images[0];
    mainImage.onerror = function() {
      this.onerror = null;
      this.src = 'images/microscope.jpg';
    };
  }
  if (thumbsContainer) {
    thumbsContainer.innerHTML = p.images.map((img, idx) => `
      <button 
        onclick="switchMainImage('${img}', this)"
        class="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${idx === 0 ? 'border-teal-600 ring-2 ring-teal-600/30' : 'border-slate-200 hover:border-teal-400'}"
      >
        <img src="${img}" alt="${p.name}" onerror="this.onerror=null; this.src='images/microscope.jpg';" class="w-full h-full object-cover" />
      </button>
    `).join('');
  }

  // Badges
  const badgesContainer = document.getElementById('product-badges');
  if (badgesContainer) {
    badgesContainer.innerHTML = `
      ${p.badge ? `
        <span class="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
          <span class="material-symbols-outlined text-sm sm:text-base">verified</span>
          ${p.badge}
        </span>
      ` : ''}
      <span class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
        Grade: ${p.grade}
      </span>
      ${p.casNumber !== '-' ? `
        <span class="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-mono-code font-bold px-3 py-1 rounded-full">
          ${p.casNumber}
        </span>
      ` : ''}
      ${p.requiresColdChain ? `
        <span class="inline-flex items-center gap-1.5 bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
          <span class="material-symbols-outlined text-sm sm:text-base">ac_unit</span>
          Pengiriman Rantai Dingin (Cold-Chain)
        </span>
      ` : ''}
    `;
  }

  // Variants list
  const variantsContainer = document.getElementById('variants-container');
  if (variantsContainer) {
    variantsContainer.innerHTML = p.variants.map((v, idx) => `
      <button 
        onclick="selectVariant(${idx})"
        class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
          idx === selectedVariantIndex
            ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-600/20'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        }"
      >
        ${v.name} ${v.extraPrice > 0 ? `<span class="text-teal-600 font-bold">(+${formatRupiah(v.extraPrice)})</span>` : ''}
      </button>
    `).join('');
  }

  // Descriptions & Specs
  const descShort = document.getElementById('product-desc-short');
  if (descShort) descShort.textContent = p.shortDescription;

  const descFull = document.getElementById('product-desc-full');
  if (descFull) descFull.innerHTML = p.description.replace(/\n\n/g, '<br><br>');

  const specsTable = document.getElementById('product-specs-table');
  if (specsTable) {
    specsTable.innerHTML = Object.entries(p.specifications).map(([key, value]) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50/70">
        <td class="py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-600 w-1/3 bg-slate-50/50">${key}</td>
        <td class="py-2.5 px-4 text-xs sm:text-sm text-slate-800">${value}</td>
      </tr>
    `).join('');
  }

  const safetyEl = document.getElementById('product-safety-notice');
  if (safetyEl) safetyEl.textContent = p.safetyNotice;

  updatePriceAndSubtotal();
}

// Switch Image
function switchMainImage(src, btn) {
  const mainImage = document.getElementById('main-image');
  if (mainImage) mainImage.src = src;

  const buttons = document.querySelectorAll('#thumbs-container button');
  buttons.forEach(b => {
    b.className = 'w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-teal-400 transition-all';
  });
  btn.className = 'w-16 h-16 rounded-xl overflow-hidden border-2 border-teal-600 ring-2 ring-teal-600/30 transition-all';
}

// Select Variant
function selectVariant(idx) {
  selectedVariantIndex = idx;
  const p = currentProduct;

  const variantsContainer = document.getElementById('variants-container');
  if (variantsContainer) {
    variantsContainer.querySelectorAll('button').forEach((btn, i) => {
      if (i === idx) {
        btn.className = 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-600/20 transition-all';
      } else {
        btn.className = 'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:border-slate-300 transition-all';
      }
    });
  }

  const selectedVariantLabel = document.getElementById('side-selected-variant');
  if (selectedVariantLabel) {
    selectedVariantLabel.textContent = p.variants[idx].name;
  }

  updatePriceAndSubtotal();
}

// Update Price & Subtotal in Sticky Sidebar
function updatePriceAndSubtotal() {
  const p = currentProduct;
  const variant = p.variants[selectedVariantIndex] || p.variants[0];
  const unitPrice = p.price + (variant ? variant.extraPrice : 0);
  const subtotal = unitPrice * currentQty;

  const priceDisplay = document.getElementById('product-price-display');
  if (priceDisplay) priceDisplay.textContent = formatRupiah(unitPrice);

  const sideSubtotal = document.getElementById('side-subtotal-display');
  if (sideSubtotal) sideSubtotal.textContent = formatRupiah(subtotal);

  const sideStock = document.getElementById('side-stock-info');
  if (sideStock) {
    const stockAvailable = variant.stock || p.stock;
    sideStock.textContent = `Sisa Stok: ${stockAvailable} unit`;
  }

  const qtyInput = document.getElementById('side-qty-input');
  if (qtyInput) qtyInput.value = currentQty;
}

// Quantity Stepper
function adjustDetailQty(delta) {
  const p = currentProduct;
  const variant = p.variants[selectedVariantIndex] || p.variants[0];
  const maxStock = variant.stock || p.stock || 99;

  let newQty = currentQty + delta;
  if (newQty < 1) newQty = 1;
  if (newQty > maxStock) {
    newQty = maxStock;
    showToast(`Batas kuantitas melebihi stok yang tersedia (${maxStock} unit).`, 'warning');
  }

  currentQty = newQty;
  updatePriceAndSubtotal();
}

// Add to Cart from Detail Page
function handleDetailAddToCart() {
  const notes = document.getElementById('side-order-notes')?.value || '';
  addToCart(currentProduct.id, selectedVariantIndex, currentQty, notes);
}

// Buy Now (Direct to Checkout)
function handleDetailBuyNow() {
  const notes = document.getElementById('side-order-notes')?.value || '';
  addToCart(currentProduct.id, selectedVariantIndex, currentQty, notes);
  window.location.href = 'checkout.html';
}

// Tab Navigation
function setupTabNavigation() {
  const tabs = document.querySelectorAll('[data-tab-target]');
  const contents = document.querySelectorAll('.tab-content-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab-target');

      tabs.forEach(t => {
        t.classList.remove('border-teal-600', 'text-teal-700', 'font-bold');
        t.classList.add('border-transparent', 'text-slate-500', 'font-medium');
      });
      tab.classList.add('border-teal-600', 'text-teal-700', 'font-bold');
      tab.classList.remove('border-transparent', 'text-slate-500', 'font-medium');

      contents.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });
}

// Related Products
function renderRelatedProducts() {
  const allList = typeof getAllProducts === 'function' ? getAllProducts() : LAB_PRODUCTS;
  const related = allList
    .filter(p => p.id !== currentProduct.id && (p.category === currentProduct.category || p.rating >= 4.9))
    .slice(0, 4);

  container.innerHTML = related.map(p => `
    <div class="product-card bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col group shadow-sm hover:border-teal-500">
      <a href="product-detail.html?id=${p.id}" class="block aspect-square w-full bg-slate-50 overflow-hidden relative">
        <img src="${p.images[0]}" alt="${p.name}" onerror="this.onerror=null; this.src='images/microscope.jpg';" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </a>
      <div class="p-3 sm:p-4 flex flex-col flex-1">
        <span class="text-xs sm:text-sm font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded w-fit mb-1">${p.categoryLabel}</span>
        <a href="product-detail.html?id=${p.id}" class="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-teal-600 line-clamp-2 leading-snug">
          ${p.name}
        </a>
        <div class="mt-2 text-xs sm:text-sm font-black text-teal-800 font-mono-code">
          ${formatRupiah(p.price)}
        </div>
        <div class="mt-auto pt-3">
          <button 
            onclick="addToCart('${p.id}', 0, 1, '')"
            class="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <span class="material-symbols-outlined text-base">add_shopping_cart</span>
            <span>+ Keranjang</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Discussion Form Simulation
function setupDiscussionForm() {
  const btn = document.getElementById('submit-discussion-btn');
  const input = document.getElementById('discussion-input');
  const list = document.getElementById('discussion-list');

  if (btn && input && list) {
    btn.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) {
        showToast('Silakan tulis pertanyaan Anda mengenai spesifikasi alat/bahan lab ini.', 'warning');
        return;
      }

      const item = document.createElement('div');
      item.className = 'p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2';
      item.innerHTML = `
        <div class="flex items-center justify-between text-xs sm:text-sm text-slate-600">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900">Peneliti / Pengguna Lab</span>
            <span class="px-2.5 py-0.5 rounded bg-teal-100 text-teal-800 font-black text-xs">Anda</span>
          </div>
          <span class="font-medium">Baru saja</span>
        </div>
        <p class="text-xs sm:text-sm text-slate-800 font-medium">${text}</p>
        <div class="mt-2 pl-4 border-l-2 border-teal-500 text-xs sm:text-sm text-slate-600 italic">
          Admin Laboratorium sedang meninjau pertanyaan ini dan akan membalas segera.
        </div>
      `;

      list.prepend(item);
      input.value = '';
      showToast('Pertanyaan Anda berhasil dikirim ke Penanggung Jawab Teknis Lab!', 'success');
    });
  }
}
