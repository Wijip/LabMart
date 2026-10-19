// Checkout Page Script (checkout.js)

let selectedCourierId = 'jne-reg';
let selectedPaymentMethod = 'qris';
let selectedProtection = {
  insurance: true, // Asuransi Pecah Belah Lab (Rp 15.000)
  woodCrate: false, // Packing Kayu Ekstra (Rp 25.000)
  coldPack: false // Ice Gel Tambahan (Rp 35.000)
};

const PROTECTION_PRICES = {
  insurance: 15000,
  woodCrate: 25000,
  coldPack: 35000
};

document.addEventListener('DOMContentLoaded', () => {
  // Wajib login sebelum mengakses halaman checkout
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
    showToast('Akses dibatasi: Silakan masuk ke akun laboratorium terlebih dahulu untuk melakukan pembelian.', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=checkout.html';
    }, 1000);
    return;
  }

  const totals = getCartTotals();
  if (totals.selectedItemsCount === 0) {
    showToast('Keranjang Anda belum memiliki produk yang dipilih untuk checkout.', 'warning');
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 1500);
    return;
  }

  // Pre-fill user profile if logged in
  if (typeof getCurrentUser === 'function') {
    const user = getCurrentUser();
    if (user) {
      const nameEl = document.getElementById('checkout-recipient-name');
      const phoneEl = document.getElementById('checkout-recipient-phone');
      const labEl = document.getElementById('checkout-recipient-lab');
      const addrEl = document.getElementById('checkout-recipient-address');
      const cityEl = document.getElementById('checkout-recipient-city');

      if (nameEl && user.name) nameEl.value = user.name;
      if (phoneEl && user.phone) phoneEl.value = user.phone;
      if (labEl && (user.labName || user.institution)) labEl.value = user.labName || user.institution;
      if (addrEl && user.address) addrEl.value = user.address;
      if (cityEl && user.city) cityEl.value = user.city;
    }
  }

  // Auto-enable cold pack if cart has cold chain item
  if (totals.hasColdChainItem) {
    selectedProtection.coldPack = true;
    selectedCourierId = 'cold-chain'; // auto-select cold chain courier
  }

  // Auto-enable wood crate if fragile instrument
  if (totals.hasFragileItem) {
    selectedProtection.woodCrate = true;
  }

  renderCheckoutItems(totals);
  renderCourierOptions(totals);
  setupProtectionCheckboxes();
  setupPaymentMethodSelector();
  updateCheckoutTotals();
});

// Render Selected Items in Checkout Order Summary
function renderCheckoutItems(totals) {
  const container = document.getElementById('checkout-items-preview');
  if (!container) return;

  container.innerHTML = totals.selectedItems.map(item => {
    const p = item.product;
    const v = item.variant;
    return `
      <div class="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
        <div class="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
          <img src="${p.images[0]}" alt="${p.name}" onerror="this.onerror=null; this.src='images/microscope.jpg';" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 truncate">${p.name}</h4>
          <div class="flex items-center gap-2 text-xs text-slate-600 font-medium mt-0.5">
            <span class="font-bold text-slate-800">${item.quantity}x</span>
            <span class="text-slate-300">|</span>
            <span>Varian: ${v ? v.name : 'Standar'}</span>
          </div>
          ${item.notes ? `
            <div class="text-xs text-teal-800 font-medium italic truncate mt-0.5">
              Catatan: "${item.notes}"
            </div>
          ` : ''}
        </div>
        <div class="text-right shrink-0">
          <div class="text-xs sm:text-sm font-black text-slate-900 font-mono-code">${formatRupiah(item.subtotal)}</div>
          <div class="text-xs text-slate-500 font-semibold">${formatWeight(item.weight)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Courier Options with Dynamic Pricing
function renderCourierOptions(totals) {
  const container = document.getElementById('couriers-list');
  if (!container) return;

  const totalKg = Math.max(1, Math.ceil(totals.totalWeight / 1000));

  container.innerHTML = SHIPPING_COURIERS.map(courier => {
    let cost = courier.baseCost * totalKg;
    if (courier.minWeight && totals.totalWeight < courier.minWeight) {
      cost = courier.baseCost * Math.ceil(courier.minWeight / 1000);
    }

    const isSelected = courier.id === selectedCourierId;

    return `
      <label class="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
        isSelected 
          ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/20 shadow-sm' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }">
        <input 
          type="radio" 
          name="courier" 
          value="${courier.id}" 
          ${isSelected ? 'checked' : ''} 
          onchange="handleCourierChange('${courier.id}')"
          class="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
        />
        <div class="flex-1">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-teal-700 text-xl">${courier.icon}</span>
              <span class="text-xs sm:text-base font-extrabold text-slate-900">${courier.name}</span>
            </div>
            <span class="text-xs sm:text-base font-black text-teal-800 font-mono-code">${formatRupiah(cost)}</span>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            <span class="text-teal-700 font-bold">Estimasi: ${courier.etd}</span>
            <span class="text-slate-300">•</span>
            <span>${courier.description}</span>
          </div>
          ${courier.isColdChain ? `
            <div class="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-md bg-cyan-100 text-cyan-900 text-xs font-bold border border-cyan-200">
              <span class="material-symbols-outlined text-sm">ac_unit</span>
              Insulasi Styrofoam + Ice Gel Reusable
            </div>
          ` : ''}
        </div>
      </label>
    `;
  }).join('');
}

function handleCourierChange(courierId) {
  selectedCourierId = courierId;
  const totals = getCartTotals();
  renderCourierOptions(totals);
  updateCheckoutTotals();
}

// Setup Protection Checkboxes
function setupProtectionCheckboxes() {
  const chkInsurance = document.getElementById('protect-insurance');
  const chkWood = document.getElementById('protect-wood');
  const chkCold = document.getElementById('protect-cold');

  if (chkInsurance) {
    chkInsurance.checked = selectedProtection.insurance;
    chkInsurance.addEventListener('change', (e) => {
      selectedProtection.insurance = e.target.checked;
      updateCheckoutTotals();
    });
  }

  if (chkWood) {
    chkWood.checked = selectedProtection.woodCrate;
    chkWood.addEventListener('change', (e) => {
      selectedProtection.woodCrate = e.target.checked;
      updateCheckoutTotals();
    });
  }

  if (chkCold) {
    chkCold.checked = selectedProtection.coldPack;
    chkCold.addEventListener('change', (e) => {
      selectedProtection.coldPack = e.target.checked;
      updateCheckoutTotals();
    });
  }
}

// Calculate Current Shipping Cost
function getCurrentShippingCost() {
  const totals = getCartTotals();
  const courier = SHIPPING_COURIERS.find(c => c.id === selectedCourierId) || SHIPPING_COURIERS[0];
  const totalKg = Math.max(1, Math.ceil(totals.totalWeight / 1000));

  let cost = courier.baseCost * totalKg;
  if (courier.minWeight && totals.totalWeight < courier.minWeight) {
    cost = courier.baseCost * Math.ceil(courier.minWeight / 1000);
  }
  return cost;
}

// Update Totals and Financial Breakdown
function updateCheckoutTotals() {
  const totals = getCartTotals();
  const shippingCost = getCurrentShippingCost();

  // Protection additions
  let protectionTotal = 0;
  if (selectedProtection.insurance) protectionTotal += PROTECTION_PRICES.insurance;
  if (selectedProtection.woodCrate) protectionTotal += PROTECTION_PRICES.woodCrate;
  if (selectedProtection.coldPack) protectionTotal += PROTECTION_PRICES.coldPack;

  // Coupon
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
      discountAmount = Math.min(shippingCost, coupon.value);
    }
  }

  const platformFee = 1000;
  const grandTotal = Math.max(0, totals.subtotal + shippingCost + protectionTotal - discountAmount + platformFee);

  // Update DOM Elements
  const subtotalEl = document.getElementById('calc-subtotal');
  const shippingEl = document.getElementById('calc-shipping');
  const protectionEl = document.getElementById('calc-protection');
  const protectionRow = document.getElementById('calc-protection-row');
  const discountEl = document.getElementById('calc-discount');
  const discountRow = document.getElementById('calc-discount-row');
  const grandTotalEl = document.getElementById('calc-grand-total');
  const btnTotalEl = document.getElementById('btn-grand-total');

  if (subtotalEl) subtotalEl.textContent = formatRupiah(totals.subtotal);
  if (shippingEl) shippingEl.textContent = formatRupiah(shippingCost);

  if (protectionRow && protectionEl) {
    if (protectionTotal > 0) {
      protectionRow.classList.remove('hidden');
      protectionEl.textContent = formatRupiah(protectionTotal);
    } else {
      protectionRow.classList.add('hidden');
    }
  }

  if (discountRow && discountEl) {
    if (discountAmount > 0) {
      discountRow.classList.remove('hidden');
      discountEl.textContent = `-${formatRupiah(discountAmount)}`;
    } else {
      discountRow.classList.add('hidden');
    }
  }

  if (grandTotalEl) grandTotalEl.textContent = formatRupiah(grandTotal);
  if (btnTotalEl) btnTotalEl.textContent = formatRupiah(grandTotal);

  // Update QRIS dynamic display amount
  const qrisAmountEl = document.getElementById('qris-display-amount');
  if (qrisAmountEl) qrisAmountEl.textContent = formatRupiah(grandTotal);

  return {
    subtotal: totals.subtotal,
    shippingCost,
    protectionTotal,
    discountAmount,
    platformFee,
    grandTotal
  };
}

// Payment Method Selector
function setupPaymentMethodSelector() {
  const methodRadios = document.querySelectorAll('input[name="payment_method"]');
  const panels = {
    qris: document.getElementById('pay-panel-qris'),
    va: document.getElementById('pay-panel-va'),
    ewallet: document.getElementById('pay-panel-ewallet'),
    credit: document.getElementById('pay-panel-credit'),
    invoice: document.getElementById('pay-panel-invoice')
  };

  methodRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedPaymentMethod = e.target.value;
      Object.keys(panels).forEach(key => {
        if (panels[key]) {
          if (key === selectedPaymentMethod) {
            panels[key].classList.remove('hidden');
          } else {
            panels[key].classList.add('hidden');
          }
        }
      });
    });
  });

  // Start QRIS timer
  startQrisTimer();
}

function startQrisTimer() {
  const timerEl = document.getElementById('qris-timer-text');
  if (!timerEl) return;

  let secondsLeft = 15 * 60; // 15 mins
  const interval = setInterval(() => {
    if (secondsLeft <= 0) {
      clearInterval(interval);
      timerEl.textContent = '00:00 (Kedaluwarsa)';
      return;
    }
    secondsLeft--;
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, 1000);
}

// Copy Virtual Account Number
function copyVirtualAccount(num) {
  navigator.clipboard.writeText(num).then(() => {
    showToast(`Nomor Virtual Account ${num} berhasil disalin!`, 'success');
  }).catch(() => {
    showToast(`Nomor VA: ${num}`, 'info');
  });
}

// Final Order Processing
function processPaymentOrder(simulatedPaid = false, redirectTarget = 'status') {
  // Verifikasi status login sebelum memproses pesanan
  if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
    showToast('Silakan masuk ke akun laboratorium Anda terlebih dahulu untuk menyelesaikan pesanan.', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=checkout.html';
    }, 800);
    return;
  }

  const recipientName = document.getElementById('checkout-recipient-name')?.value.trim();
  const recipientPhone = document.getElementById('checkout-recipient-phone')?.value.trim();
  const recipientAddress = document.getElementById('checkout-recipient-address')?.value.trim();
  const recipientLab = document.getElementById('checkout-recipient-lab')?.value.trim() || 'Laboratorium Umum';
  const recipientCity = document.getElementById('checkout-recipient-city')?.value.trim() || 'Indonesia';

  if (!recipientName || !recipientPhone || !recipientAddress) {
    showToast('Harap lengkapi Nama Penerima, Nomor Telepon, dan Alamat Laboratorium Anda.', 'error');
    document.getElementById('checkout-recipient-name')?.focus();
    return;
  }

  const totals = getCartTotals();
  const calculations = updateCheckoutTotals();
  const courier = SHIPPING_COURIERS.find(c => c.id === selectedCourierId);
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

  // Generate unique Invoice ID and Tracking No
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const invoiceNumber = `INV/LAB/${new Date().getFullYear()}/${randomNum}`;
  const trackingNumber = `${courier.code}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  let paymentMethodName = 'QRIS Instant Standard';
  if (selectedPaymentMethod === 'va') paymentMethodName = 'Transfer Virtual Account';
  if (selectedPaymentMethod === 'ewallet') paymentMethodName = 'E-Wallet';
  if (selectedPaymentMethod === 'credit') paymentMethodName = 'Kartu Kredit / Debit';
  if (selectedPaymentMethod === 'invoice') paymentMethodName = 'PO Institusi (Term 30 Hari)';

  const newOrder = {
    invoiceNumber,
    trackingNumber,
    createdAt: new Date().toISOString(),
    status: 'Menunggu Pengiriman',
    paymentStatus: simulatedPaid ? 'Lunas (Verified by QRIS)' : 'Menunggu Pembayaran',
    paymentMethod: paymentMethodName,
    recipient: {
      name: recipientName,
      email: currentUser?.email || '',
      userId: currentUser?.id || '',
      phone: recipientPhone,
      lab: recipientLab,
      address: recipientAddress,
      city: recipientCity
    },
    courier: {
      id: courier.id,
      name: courier.name,
      code: courier.code,
      etd: courier.etd,
      isColdChain: courier.isColdChain
    },
    protection: selectedProtection,
    items: totals.selectedItems.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0],
      variantName: item.variant ? item.variant.name : 'Standar',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      notes: item.notes,
      grade: item.product.grade,
      brand: item.product.brand
    })),
    pricing: calculations
  };

  // Save to LocalStorage active order
  saveActiveOrder(newOrder);

  // Remove purchased selected items from cart
  const fullCart = getCart();
  const remainingCart = fullCart.filter(item => !item.selected);
  saveCart(remainingCart);

  // Remove applied coupon
  removeCoupon();

  if (redirectTarget === 'payment') {
    showToast('Menyimpan pesanan dan membuka kanal pembayaran lengkap...', 'info');
    setTimeout(() => {
      window.location.href = 'payment.html';
    }, 800);
  } else {
    showToast('Pesanan berhasil dibuat! Mengalihkan ke nota dan pelacakan...', 'success');
    setTimeout(() => {
      window.location.href = 'order-status.html';
    }, 1200);
  }
}
