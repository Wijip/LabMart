// Cart Page Logic (cart.js)

document.addEventListener('DOMContentLoaded', () => {
  renderCartView();
  setupVoucherInput();
});

function renderCartView() {
  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const cartContent = document.getElementById('cart-content-grid');
  const selectAllCheckbox = document.getElementById('select-all-items');

  if (!container) return;

  const totals = getCartTotals();
  const cart = totals.items;

  if (cart.length === 0) {
    if (cartContent) cartContent.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (cartContent) cartContent.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  // Check if all are selected
  const allSelected = cart.length > 0 && cart.every(i => i.selected);
  if (selectAllCheckbox) selectAllCheckbox.checked = allSelected;

  container.innerHTML = cart.map((item, idx) => {
    const p = item.product;
    const v = item.variant;

    return `
      <div class="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-5 shadow-sm transition-all hover:border-slate-300">
        <div class="flex items-start gap-2.5 sm:gap-4">
          <!-- Checkbox item -->
          <div class="pt-1.5 sm:pt-2 shrink-0">
            <input 
              type="checkbox" 
              ${item.selected ? 'checked' : ''} 
              onchange="toggleCartItemSelection(${item.cartIndex}); renderCartView();"
              class="w-4 h-4 sm:w-5 sm:h-5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
            />
          </div>

          <!-- Gambar Produk -->
          <a href="product-detail.html?id=${p.id}" class="w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 block">
            <img src="${p.images[0]}" alt="${p.name}" onerror="this.onerror=null; this.src='images/microscope.jpg';" class="w-full h-full object-cover" />
          </a>

          <!-- Detail Produk & Harga -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-1.5">
              <div class="min-w-0">
                <span class="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">${p.categoryLabel}</span>
                <a href="product-detail.html?id=${p.id}" class="block text-sm sm:text-base font-extrabold text-slate-900 hover:text-teal-600 mt-1 line-clamp-1">
                  ${p.name}
                </a>
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                  <span class="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">Varian: ${v ? v.name : 'Standar'}</span>
                  ${p.casNumber !== '-' ? `<span class="font-mono-code text-slate-700 hidden xs:inline font-semibold">${p.casNumber}</span>` : ''}
                  <span>Berat: <strong class="text-slate-800">${formatWeight(item.weight)}</strong></span>
                </div>
                ${p.requiresColdChain ? `
                  <div class="inline-flex items-center gap-1 mt-1 text-xs font-extrabold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded">
                    <span class="material-symbols-outlined text-sm">ac_unit</span>
                    Cold-Chain
                  </div>
                ` : ''}
              </div>

              <!-- Tombol Hapus -->
              <button 
                onclick="promptDeleteCartItem(${item.cartIndex})" 
                title="Hapus Produk" 
                class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
              >
                <span class="material-symbols-outlined text-xl sm:text-2xl">delete</span>
              </button>
            </div>

            <!-- Catatan Pesanan Khusus -->
            <div class="mt-2.5 sm:mt-3">
              <div class="flex items-center gap-1.5 sm:gap-2">
                <span class="material-symbols-outlined text-slate-500 text-base sm:text-lg shrink-0">edit_note</span>
                <input 
                  type="text" 
                  placeholder="Catatan pesanan (CoA, packing ekstra)..."
                  value="${item.notes || ''}"
                  onchange="updateCartItemNotes(${item.cartIndex}, this.value)"
                  class="text-xs sm:text-sm text-slate-800 font-medium border-b border-slate-200 focus:border-teal-500 focus:outline-none bg-transparent w-full py-1 placeholder:text-slate-400"
                />
              </div>
            </div>

            <!-- Baris Bawah: Harga Satuan, Kuantitas, Subtotal -->
            <div class="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span class="text-xs sm:text-sm text-slate-500 font-medium block sm:inline">Harga Satuan: </span>
                <span class="text-xs sm:text-sm font-extrabold text-slate-800 font-mono-code">${formatRupiah(item.unitPrice)}</span>
              </div>

              <div class="flex items-center gap-2.5 sm:gap-4">
                <div class="flex items-center border border-slate-300 rounded-lg sm:rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button 
                    onclick="updateCartItemQty(${item.cartIndex}, ${item.quantity - 1}); renderCartView();" 
                    class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors font-bold text-sm"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value="${item.quantity}" 
                    onchange="handleManualQtyChange(${item.cartIndex}, this.value)"
                    class="w-10 sm:w-12 text-center text-xs sm:text-sm font-extrabold text-slate-900 border-x border-slate-200 py-1 focus:outline-none"
                  />
                  <button 
                    onclick="updateCartItemQty(${item.cartIndex}, ${item.quantity + 1}); renderCartView();" 
                    class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <div class="text-right shrink-0">
                  <span class="text-xs text-slate-400 font-medium block">Total</span>
                  <span class="text-sm sm:text-lg font-black text-teal-700 font-mono-code">${formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateCartSummary(totals);
}

// Update Summary Panel
function updateCartSummary(totals) {
  const selectedCountEl = document.getElementById('summary-selected-count');
  const weightEl = document.getElementById('summary-weight');
  const subtotalEl = document.getElementById('summary-subtotal');
  const discountRow = document.getElementById('summary-discount-row');
  const discountEl = document.getElementById('summary-discount');
  const grandTotalEl = document.getElementById('summary-grand-total');
  const checkoutBtn = document.getElementById('checkout-action-btn');
  const coldNotice = document.getElementById('summary-cold-notice');
  const fragileNotice = document.getElementById('summary-fragile-notice');

  if (selectedCountEl) selectedCountEl.textContent = `${totals.selectedItemsCount} item`;
  if (weightEl) weightEl.textContent = formatWeight(totals.totalWeight);
  if (subtotalEl) subtotalEl.textContent = formatRupiah(totals.subtotal);

  // Cold Chain Notice
  if (coldNotice) {
    if (totals.hasColdChainItem) {
      coldNotice.classList.remove('hidden');
    } else {
      coldNotice.classList.add('hidden');
    }
  }

  // Fragile / Wood Notice
  if (fragileNotice) {
    if (totals.hasFragileItem) {
      fragileNotice.classList.remove('hidden');
    } else {
      fragileNotice.classList.add('hidden');
    }
  }

  // Voucher Calculation
  const coupon = getAppliedCoupon();
  let discountAmount = 0;
  if (coupon && totals.subtotal >= coupon.minSpend) {
    if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    } else if (coupon.type === 'percentage') {
      discountAmount = (totals.subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.type === 'shipping') {
      // In cart, show note that shipping coupon will be deducted at checkout
      discountAmount = 0;
    }

    if (discountRow && discountEl) {
      discountRow.classList.remove('hidden');
      discountEl.textContent = `-${formatRupiah(discountAmount)}`;
    }
  } else {
    if (discountRow) discountRow.classList.add('hidden');
  }

  const grandTotal = Math.max(0, totals.subtotal - discountAmount);
  if (grandTotalEl) grandTotalEl.textContent = formatRupiah(grandTotal);

  const mobileStickyTotal = document.getElementById('mobile-sticky-total');
  if (mobileStickyTotal) mobileStickyTotal.textContent = formatRupiah(grandTotal);

  const mobileStickyBar = document.getElementById('mobile-cart-sticky-bar');
  if (mobileStickyBar) {
    if (totals.totalItemsCount === 0 || totals.selectedItemsCount === 0) {
      mobileStickyBar.classList.add('opacity-50', 'pointer-events-none');
    } else {
      mobileStickyBar.classList.remove('opacity-50', 'pointer-events-none', 'hidden');
    }
  }

  // Enable/Disable Checkout Button
  if (checkoutBtn) {
    if (totals.selectedItemsCount === 0) {
      checkoutBtn.disabled = true;
      checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
      checkoutBtn.classList.remove('hover:bg-teal-700', 'shadow-teal-600/20');
    } else {
      checkoutBtn.disabled = false;
      checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      checkoutBtn.classList.add('hover:bg-teal-700', 'shadow-teal-600/20');
    }
  }
}

// Select All Toggle
function handleToggleSelectAll(checkbox) {
  toggleAllCartSelection(checkbox.checked);
  renderCartView();
}

// Update Note per Item
function updateCartItemNotes(index, notes) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].notes = notes;
    saveCart(cart);
  }
}

// Manual Qty Change
function handleManualQtyChange(index, val) {
  const qty = parseInt(val, 10);
  if (isNaN(qty) || qty < 1) {
    updateCartItemQty(index, 1);
  } else {
    updateCartItemQty(index, qty);
  }
  renderCartView();
}

// Delete Confirmation
function promptDeleteCartItem(index) {
  if (confirm('Apakah Anda yakin ingin menghapus produk ini dari keranjang belanja?')) {
    removeCartItem(index);
    renderCartView();
  }
}

// Setup Voucher Field
function setupVoucherInput() {
  const btn = document.getElementById('apply-voucher-btn');
  const input = document.getElementById('voucher-code-input');
  const badgeContainer = document.getElementById('active-voucher-badge');

  function renderVoucherBadge() {
    const coupon = getAppliedCoupon();
    if (!badgeContainer) return;

    if (coupon) {
      badgeContainer.innerHTML = `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base text-teal-600">confirmation_number</span>
            <div>
              <span class="font-bold">${coupon.code}</span> - ${coupon.name}
            </div>
          </div>
          <button onclick="handleRemoveVoucher()" class="text-rose-600 hover:text-rose-800 font-bold p-1">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      `;
      badgeContainer.classList.remove('hidden');
      if (input) input.value = '';
    } else {
      badgeContainer.innerHTML = '';
      badgeContainer.classList.add('hidden');
    }
  }

  if (btn && input) {
    btn.addEventListener('click', () => {
      const code = input.value.trim();
      if (!code) {
        showToast('Masukkan kode voucher (contoh: LABHEMAT)', 'warning');
        return;
      }
      const res = applyCoupon(code);
      if (res) {
        renderVoucherBadge();
        renderCartView();
      }
    });
  }

  window.handleRemoveVoucher = function() {
    removeCoupon();
    renderVoucherBadge();
    renderCartView();
  };

  renderVoucherBadge();
}

// Proceed to Checkout
function proceedToCheckout() {
  const totals = getCartTotals();
  if (totals.selectedItemsCount === 0) {
    showToast('Pilih setidaknya satu barang untuk melanjutkan ke checkout.', 'warning');
    return;
  }
  window.location.href = 'checkout.html';
}
