// Store & State Manager (LocalStorage based) for LabMart Indonesia

const STORAGE_KEYS = {
  CART: 'labmart_cart_v1',
  WISHLIST: 'labmart_wishlist_v1',
  ACTIVE_ORDER: 'labmart_active_order_v1',
  ORDERS_HISTORY: 'labmart_orders_history_v1',
  APPLIED_COUPON: 'labmart_coupon_v1',
  SELLER_PRODUCTS: 'labmart_seller_products_v1'
};

// Format currency into Indonesian Rupiah (Rp)
function formatRupiah(amount) {
  if (isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// Format number (e.g. 1.250 g to 1.25 kg)
function formatWeight(grams) {
  if (grams >= 1000) {
    return (grams / 1000).toFixed(2) + ' kg';
  }
  return grams + ' gram';
}

// Seller Custom Products Functions (LocalStorage)
function getSellerProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SELLER_PRODUCTS);
    if (!raw) {
      // Seed initial seller product for SmartLab Official Store demo
      const seedSellerProducts = [
        {
          id: "LAB-SEL-101",
          name: "Pipet Tetes Kaca Panjang 15 cm dengan Karet Merah (Pack 10 Pcs)",
          category: "glassware",
          categoryLabel: "Alat Kaca & Plastik",
          brand: "SmartLab Scientific",
          price: 25000,
          originalPrice: 32000,
          discount: 22,
          rating: 4.9,
          reviewsCount: 45,
          soldCount: "380+ terjual",
          stock: 60,
          weight: 150,
          requiresColdChain: false,
          requiresWoodenCrate: false,
          grade: "Kaca Borosilikat Tahan Reagen Kimia",
          casNumber: "-",
          badge: "Produk Mitra Resmi",
          isSellerProduct: true,
          sellerEmail: "seller@smartlab.co.id",
          storeName: "SmartLab Official Store",
          storeCity: "Tangerang / Jabodetabek",
          storeRating: 4.9,
          images: [
            "images/erlenmeyer.jpg"
          ],
          variants: [
            { name: "Pack 10 Pcs Pipet Tetes Kaca", extraPrice: 0, stock: 60 },
            { name: "Pack 25 Pcs Pipet Tetes Kaca (Hemat)", extraPrice: 28000, stock: 35 }
          ],
          shortDescription: "Pipet tetes kaca tebal dengan ujung presisi dan karet hisap merah lentur untuk penambahan larutan tetes demi tetes secara teliti.",
          description: `Pipet Tetes Kaca 15 cm SmartLab dirancang untuk memindahkan cairan dalam volume kecil secara akurat saat titrasi atau pengujian kualitatif. Kaca berkualitas tahan terhadap asam encer maupun pekat.`,
          specifications: {
            "Panjang Batang": "150 mm (15 cm)",
            "Material": "Kaca Netral Tahan Reagen + Karet Kualitas Tinggi",
            "Isi Kemasan": "10 Pcs Pipet + Karet Hisap Terpasang"
          },
          safetyNotice: "Lepas karet hisap dan cuci kaca setelah digunakan dengan larutan asam atau basa kuat."
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SELLER_PRODUCTS, JSON.stringify(seedSellerProducts));
      return seedSellerProducts;
    }
    let list = JSON.parse(raw);
    if (Array.isArray(list)) {
      list = list.filter(p => !p.price || p.price < 500000);
      if (list.length === 0) {
        localStorage.removeItem(STORAGE_KEYS.SELLER_PRODUCTS);
        return getSellerProducts();
      }
      return list;
    }
    return [];
  } catch (e) {
    console.error('Error reading seller products from localStorage', e);
    return [];
  }
}

function saveSellerProduct(product) {
  try {
    const list = getSellerProducts();
    const idx = list.findIndex(p => p.id === product.id);
    if (idx > -1) {
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    localStorage.setItem(STORAGE_KEYS.SELLER_PRODUCTS, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error('Error saving seller product', e);
    return false;
  }
}

function deleteSellerProduct(productId) {
  try {
    const list = getSellerProducts();
    const filtered = list.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_KEYS.SELLER_PRODUCTS, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting seller product', e);
    return false;
  }
}

// Get All Products (Default Catalog + Seller Added Products)
function getAllProducts() {
  const sellerProducts = getSellerProducts();
  return [...sellerProducts, ...LAB_PRODUCTS];
}

// Get Product by ID (Searches in combined products)
function getProductById(id) {
  return getAllProducts().find(p => p.id === id) || null;
}

// Cart Storage Functions
function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading cart from localStorage', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    updateHeaderBadges();
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
  }
}

// Add item to Cart
function addToCart(productId, variantIndex = 0, quantity = 1, notes = '') {
  const cart = getCart();
  const product = getProductById(productId);
  if (!product) return false;

  const existingIndex = cart.findIndex(
    item => item.productId === productId && item.variantIndex === variantIndex
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
    if (notes) cart[existingIndex].notes = notes;
  } else {
    cart.push({
      productId,
      variantIndex,
      quantity,
      notes: notes || '',
      selected: true,
      addedAt: new Date().toISOString()
    });
  }

  saveCart(cart);
  showToast(`"${product.name.slice(0, 32)}..." berhasil ditambahkan ke keranjang!`, 'success');
  return true;
}

// Update Quantity
function updateCartItemQty(index, qty) {
  const cart = getCart();
  if (cart[index]) {
    if (qty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = qty;
    }
    saveCart(cart);
  }
}

// Remove Item from Cart
function removeCartItem(index) {
  const cart = getCart();
  if (cart[index]) {
    cart.splice(index, 1);
    saveCart(cart);
    showToast('Produk telah dihapus dari keranjang belanja.', 'info');
  }
}

// Toggle Item Selected
function toggleCartItemSelection(index) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].selected = !cart[index].selected;
    saveCart(cart);
  }
}

// Select All / Deselect All
function toggleAllCartSelection(isSelected) {
  const cart = getCart();
  cart.forEach(item => {
    item.selected = isSelected;
  });
  saveCart(cart);
}

// Get Cart Item Count (sum of quantities)
function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Calculate Cart Totals
function getCartTotals() {
  const cart = getCart();
  let subtotal = 0;
  let totalWeight = 0;
  let selectedItemsCount = 0;
  let hasColdChainItem = false;
  let hasFragileItem = false;

  const enrichedItems = cart.map((item, index) => {
    const product = getProductById(item.productId);
    if (!product) return null;

    const variant = product.variants && product.variants[item.variantIndex] ? product.variants[item.variantIndex] : null;
    const itemPrice = product.price + (variant ? variant.extraPrice : 0);
    const itemSubtotal = itemPrice * item.quantity;
    const itemWeight = (product.weight || 500) * item.quantity;

    if (item.selected) {
      subtotal += itemSubtotal;
      totalWeight += itemWeight;
      selectedItemsCount += item.quantity;
      if (product.requiresColdChain) hasColdChainItem = true;
      if (product.requiresWoodenCrate) hasFragileItem = true;
    }

    return {
      ...item,
      cartIndex: index,
      product,
      variant,
      unitPrice: itemPrice,
      subtotal: itemSubtotal,
      weight: itemWeight
    };
  }).filter(Boolean);

  return {
    items: enrichedItems,
    selectedItems: enrichedItems.filter(i => i.selected),
    subtotal,
    totalWeight,
    selectedItemsCount,
    hasColdChainItem,
    hasFragileItem
  };
}

// Wishlist System
function getWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function toggleWishlist(productId) {
  let list = getWishlist();
  const exists = list.includes(productId);
  if (exists) {
    list = list.filter(id => id !== productId);
    showToast('Dihapus dari daftar favorit.', 'info');
  } else {
    list.push(productId);
    showToast('Ditambahkan ke daftar favorit!', 'success');
  }
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
  updateHeaderBadges();
  return !exists;
}

function isInWishlist(productId) {
  const list = getWishlist();
  return list.includes(productId);
}

// Coupon / Voucher System
function getAppliedCoupon() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLIED_COUPON);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function applyCoupon(code) {
  const coupon = AVAILABLE_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!coupon) {
    showToast('Kode voucher tidak ditemukan atau telah kedaluwarsa.', 'error');
    return false;
  }
  
  const totals = getCartTotals();
  if (totals.subtotal < coupon.minSpend) {
    showToast(`Voucher berlaku minimal pembelanjaan ${formatRupiah(coupon.minSpend)}.`, 'error');
    return false;
  }

  localStorage.setItem(STORAGE_KEYS.APPLIED_COUPON, JSON.stringify(coupon));
  showToast(`Voucher "${coupon.name}" berhasil diterapkan!`, 'success');
  return coupon;
}

function removeCoupon() {
  localStorage.removeItem(STORAGE_KEYS.APPLIED_COUPON);
  showToast('Voucher belanja telah dihapus.', 'info');
}

// Active Order System (After Checkout)
function getActiveOrder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveActiveOrder(order) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDER, JSON.stringify(order));
  // Also push to history
  try {
    const rawHistory = localStorage.getItem(STORAGE_KEYS.ORDERS_HISTORY);
    const history = rawHistory ? JSON.parse(rawHistory) : [];
    history.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS_HISTORY, JSON.stringify(history.slice(0, 20)));
  } catch (e) {
    console.error(e);
  }
}

// Global Toast Notification
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('lab-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'lab-toast-container';
    toastContainer.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none items-center max-w-md w-full px-4';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-animate flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium pointer-events-auto bg-white transition-all';
  
  let iconName = 'info';
  let iconClass = 'text-teal-600 bg-teal-50';
  let borderClass = 'border-teal-200';

  if (type === 'success') {
    iconName = 'check_circle';
    iconClass = 'text-emerald-600 bg-emerald-50';
    borderClass = 'border-emerald-200';
  } else if (type === 'error') {
    iconName = 'error';
    iconClass = 'text-rose-600 bg-rose-50';
    borderClass = 'border-rose-200';
  } else if (type === 'warning') {
    iconName = 'warning';
    iconClass = 'text-amber-600 bg-amber-50';
    borderClass = 'border-amber-200';
  }

  toast.classList.add(borderClass);
  toast.innerHTML = `
    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconClass}">
      <span class="material-symbols-outlined text-lg">${iconName}</span>
    </div>
    <div class="text-slate-800 flex-1 leading-snug">${message}</div>
    <button class="text-slate-400 hover:text-slate-600 p-1" onclick="this.parentElement.remove()">
      <span class="material-symbols-outlined text-base">close</span>
    </button>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Update Header Cart and Wishlist Badges
function updateHeaderBadges() {
  const count = getCartCount();
  const cartBadges = document.querySelectorAll('.cart-badge');
  cartBadges.forEach(badge => {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });

  const wishlistCount = getWishlist().length;
  const wishBadges = document.querySelectorAll('.wishlist-badge');
  wishBadges.forEach(badge => {
    if (wishlistCount > 0) {
      badge.textContent = wishlistCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderBadges();
});
