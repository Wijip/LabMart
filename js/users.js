// User Authentication & Profile Management (LocalStorage based) for LabMart Indonesia

const USER_STORAGE_KEYS = {
  USERS_LIST: 'labmart_users_v1',
  CURRENT_USER: 'labmart_current_user_v1'
};

// Akun Demo Bawaan (Pre-seeded accounts)
const DEFAULT_DEMO_USERS = [
  {
    id: 'USR-001',
    name: 'Dr. Rian Pratama, S.Si., M.Biotech',
    email: 'peneliti@ugm.ac.id',
    password: 'password123',
    role: 'Peneliti / Dosen',
    institution: 'Universitas Gadjah Mada',
    labName: 'Laboratorium Kimia Analitik & Bioteknologi FMIPA',
    phone: '0812-8877-6655',
    address: 'Gedung FMIPA Terpadu Lt. 3, Jl. Kaliurang KM 4.5, Sekip Utara, Sleman',
    city: 'D.I. Yogyakarta 55284',
    labType: 'Universitas / Pendidikan',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'USR-002',
    name: 'Siti Rahmawati, S.Farm., Apt.',
    email: 'qc@biofarma.co.id',
    password: 'password123',
    role: 'QA / QC Manager',
    institution: 'PT Bio Farma (Persero)',
    labName: 'Quality Control & Biological Testing Lab',
    phone: '0813-9922-1144',
    address: 'Kawasan Industri Bio Farma, Jl. Pasteur No. 28',
    city: 'Kota Bandung 40161',
    labType: 'Industri / Farmasi',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'USR-003',
    name: 'Ir. Hendra Kusuma, M.Sc.',
    email: 'admin@labmart.id',
    password: 'admin123',
    role: 'Procurement Specialist',
    institution: 'Badan Riset dan Inovasi Nasional (BRIN)',
    labName: 'Pusat Riset Material Maju & Kimia Terapan',
    phone: '0811-2233-4455',
    address: 'Kawasan Sains Terpadu BJ Habibie Serpong',
    city: 'Tangerang Selatan 15314',
    labType: 'Lembaga Riset Pemerintah',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'USR-SELLER-01',
    name: 'PT SmartLab Mitra Nusantara',
    email: 'seller@smartlab.co.id',
    password: 'seller123',
    role: 'Mitra Distributor Resmi',
    institution: 'PT SmartLab Indonesia',
    labName: 'Pusat Distribusi Alat Riset & Reagen PA',
    phone: '021-5890-1234',
    address: 'Kawasan Industri Cikarang Barat Blok C-12',
    city: 'Kab. Bekasi, Jawa Barat',
    labType: 'Distributor Resmi / Supplier Lab',
    isSeller: true,
    storeName: 'SmartLab Official Store',
    storeCity: 'Tangerang / Jabodetabek',
    storeRating: 4.9,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&q=80'
  }
];

// Initialize users storage if empty
function initializeUsersStorage() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEYS.USERS_LIST);
    if (!raw) {
      localStorage.setItem(USER_STORAGE_KEYS.USERS_LIST, JSON.stringify(DEFAULT_DEMO_USERS));
    } else {
      const existing = JSON.parse(raw);
      // Ensure seller demo user is always present
      if (!existing.some(u => u.id === 'USR-SELLER-01')) {
        existing.push(DEFAULT_DEMO_USERS.find(u => u.id === 'USR-SELLER-01'));
        localStorage.setItem(USER_STORAGE_KEYS.USERS_LIST, JSON.stringify(existing));
      }
    }
    // CATATAN: Pengguna baru yang pertama kali membuka web tidak otomatis login.
    // State dimulai dalam keadaan anonim / guest (tanpa akun login) sampai pengguna
    // menekan tombol Masuk atau Mendaftar.
  } catch (e) {
    console.error('Error initializing users in localStorage', e);
  }
}

// Get all registered users
function getAllUsers() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEYS.USERS_LIST);
    return raw ? JSON.parse(raw) : DEFAULT_DEMO_USERS;
  } catch (e) {
    return DEFAULT_DEMO_USERS;
  }
}

// Get currently logged-in user
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Check if user is logged in
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Login function
function loginUser(email, password) {
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();
  const found = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

  if (found) {
    localStorage.setItem(USER_STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
    return { success: true, user: found };
  }
  return { success: false, message: 'Email atau kata sandi tidak cocok. Silakan coba lagi.' };
}

// Register function
function registerUser(userData) {
  const users = getAllUsers();
  const cleanEmail = userData.email.trim().toLowerCase();

  // Check existing
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' };
  }

  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name: userData.name,
    email: cleanEmail,
    password: userData.password,
    role: userData.role || (userData.isSeller ? 'Mitra Distributor Resmi' : 'Peneliti Lab'),
    institution: userData.institution || 'Laboratorium Umum',
    labName: userData.labName || userData.institution,
    phone: userData.phone || '08xxxxxxxxxx',
    address: userData.address || '',
    city: userData.city || 'Indonesia',
    labType: userData.labType || (userData.isSeller ? 'Distributor Resmi / Supplier Lab' : 'Pendidikan / Kampus'),
    isSeller: Boolean(userData.isSeller),
    storeName: userData.storeName || (userData.isSeller ? userData.institution : ''),
    storeCity: userData.city || 'Indonesia',
    storeRating: 5.0,
    verified: true,
    avatar: userData.isSeller 
      ? 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USER_STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
  // Auto-login after register
  localStorage.setItem(USER_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

  return { success: true, user: newUser };
}

// Logout function
function logoutUser() {
  try {
    localStorage.removeItem(USER_STORAGE_KEYS.CURRENT_USER);
  } catch (e) {
    console.error('Error removing current user from localStorage', e);
  }

  if (typeof showToast === 'function') {
    showToast('Anda telah keluar dari akun laboratorium.', 'info');
  }

  if (typeof updateGlobalUserNav === 'function') {
    updateGlobalUserNav();
  }

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 400);
}

// Update profile
function updateUserProfile(updatedFields) {
  const current = getCurrentUser();
  if (!current) return false;

  const users = getAllUsers();
  const index = users.findIndex(u => u.id === current.id);
  
  const updatedUser = { ...current, ...updatedFields };
  if (index > -1) {
    users[index] = updatedUser;
    localStorage.setItem(USER_STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
  }
  localStorage.setItem(USER_STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
  return updatedUser;
}

// Update Header User Nav automatically across all pages
function updateGlobalUserNav() {
  const userContainer = document.getElementById('header-user-nav');
  if (!userContainer) return;

  const user = getCurrentUser();

  if (user) {
    const isSeller = Boolean(user.isSeller);
    userContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <!-- Shortcut Seller Center -->
        <a 
          href="seller.html" 
          class="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl ${isSeller ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black shadow-sm shadow-amber-500/20' : 'bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200'} text-xs transition-all"
          title="Buka Pusat Mitra Seller LabMart"
        >
          <span class="material-symbols-outlined text-base">storefront</span>
          <span class="hidden sm:inline">${isSeller ? 'Pusat Seller' : 'Mitra Toko'}</span>
        </a>

        <!-- User Dropdown Menu -->
        <div class="relative group/user">
          <button class="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors">
            <div class="w-9 h-9 rounded-xl ${isSeller ? 'bg-amber-600 border-amber-400' : 'bg-teal-600 border-teal-500'} text-white flex items-center justify-center font-bold text-xs overflow-hidden border shadow-sm">
              ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}" onerror="this.style.display='none'; this.parentElement.textContent='${user.name.charAt(0)}';" class="w-full h-full object-cover" />` : user.name.charAt(0)}
            </div>
            <div class="hidden xl:flex flex-col text-left">
              <span class="text-xs font-bold text-slate-800 truncate max-w-[130px]">${user.name.split(',')[0]}</span>
              <span class="text-[10px] ${isSeller ? 'text-amber-700' : 'text-teal-700'} font-semibold flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[12px]">verified</span> ${isSeller ? 'Mitra Toko' : 'Terverifikasi'}
              </span>
            </div>
            <span class="material-symbols-outlined text-slate-400 text-sm hidden xl:inline">arrow_drop_down</span>
          </button>

          <!-- Dropdown Menu -->
          <div class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 hidden group-hover/user:block z-50 transition-all">
            <div class="px-4 py-2 border-b border-slate-100">
              <div class="font-bold text-xs text-slate-900 truncate">${user.name}</div>
              <div class="text-[11px] text-slate-500 truncate">${user.email}</div>
              <div class="text-[10px] ${isSeller ? 'text-amber-700 font-bold' : 'text-teal-700 font-semibold'} mt-0.5">
                ${isSeller ? '🏢 ' + (user.storeName || user.institution) : user.institution}
              </div>
            </div>

            <!-- Pusat Mitra Seller Button in Dropdown -->
            <a href="seller.html" class="flex items-center gap-2.5 px-4 py-2.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold border-b border-amber-100 transition-colors">
              <span class="material-symbols-outlined text-base text-amber-600">storefront</span>
              <div class="flex flex-col">
                <span>Pusat Mitra Seller</span>
                <span class="text-[10px] text-amber-700 font-normal">Kelola produk & pesanan lab</span>
              </div>
            </a>

            <a href="profile.html" class="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium">
              <span class="material-symbols-outlined text-base text-slate-400">person</span>
              <span>Profil & Pengaturan Akun</span>
            </a>
            <a href="order-status.html" class="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium">
              <span class="material-symbols-outlined text-base text-slate-400">receipt_long</span>
              <span>Faktur & Pelacakan</span>
            </a>
            <a href="cart.html" class="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium">
              <span class="material-symbols-outlined text-base text-slate-400">shopping_cart</span>
              <span>Keranjang Belanja</span>
            </a>
            <div class="border-t border-slate-100 my-1"></div>
            <button onclick="logoutUser()" class="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold text-left">
              <span class="material-symbols-outlined text-base">logout</span>
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    userContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <a href="seller.html" class="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 px-2.5 py-1.5 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all">
          <span class="material-symbols-outlined text-base">storefront</span>
          <span>Mitra Seller</span>
        </a>
        <a href="login.html" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-100 transition-colors">
          Masuk
        </a>
        <a href="register.html" class="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-sm transition-all">
          Daftar Lab
        </a>
      </div>
    `;
  }
}

// Auto-run on script load
initializeUsersStorage();
document.addEventListener('DOMContentLoaded', () => {
  updateGlobalUserNav();
});
