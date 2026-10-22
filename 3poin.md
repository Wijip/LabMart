*DOKUMENTASI & EVALUASI WEBSITE LABMART INDONESIA (PROTOTIPE V1.0)*
_Platform Marketplace Pengadaan Alat, Bahan Kimia & Perlengkapan Laboratorium_
========================================

*📌 1. METODE YANG DIGUNAKAN*

*A. Pendekatan Pengembangan Sistem:*
• *Rapid Prototyping & User-Centered Design (UCD):* Pengembangan berfokus pada pembuatan prototipe interaktif fungsional tingkat tinggi (_high-fidelity interactive prototype_) untuk memvalidasi kebutuhan alur pengadaan sains (mahasiswa, dosen/peneliti, institusi, dan distributor) serta kesiapan demonstrasi (_pitching_) ke klien tanpa risiko kegagalan server.

*B. Arsitektur Perangkat Lunak:*
• *Pure Client-Side Jamstack Architecture:* Sistem dirancang 100% berbasis klien (_client-side_), bebas ketergantungan server backend (_zero backend dependency_). Aplikasi dapat berjalan langsung di browser mana pun secara offline maupun dihosting statis (GitHub Pages / Vercel).
• *State Management via Web Storage API (LocalStorage):* Pengelolaan data terpusat menggunakan modul `store.js` yang memanfaatkan `localStorage` browser untuk menyimpan data keranjang belanja, status checkout, riwayat pesanan/faktur, sesi pengguna, kupon promo, hingga produk baru mitra toko secara persisten.

*C. Tumpukan Teknologi (Tech Stack):*
• *HTML5 Semantik:* Menjamin struktur dokumen yang rapi, aksesibel, dan standar industri.
• *Tailwind CSS 3.x & Custom CSS:* Desain antarmuka modern berbasis utilitas yang responsif di semua perangkat, disertai modul cetak A4 terisolasi (`@media print`) dan efek animasi visual (seperti laser scanline QRIS).
• *Vanilla JavaScript (Modern ES6+):* Logika modular berbasis objek murni tanpa framework berat (React/Vue/Angular), menghasilkan performa eksekusi super ringan dan waktu muat instan (< 1 detik).
• *Desain Tipografi Khusus:* Perpaduan font _Plus Jakarta Sans_ (keterbacaan antarmuka modern) dan _JetBrains Mono_ (presisi angka nominal rupiah, kode invoice, barcode, dan nomor resi kurir).

*D. Metode Pengujian Kualitas (Quality Assurance):*
• *Black-Box Testing & Scenario-Based E2E Testing:* Pengujian fungsional menyeluruh yang mencakup 60 skenario uji (autentikasi akun, filter katalog, permohonan RFQ, validasi keranjang, kalkulasi ongkir/peti kayu, barcode kasir, e-Faktur A4, hingga Seller Centre).

========================================

*⭐ 2. KELEBIHAN WEBSITE*

*1. Ringan, Cepat & Bebas Biaya Server (Zero Server Cost)*
• Bebas dari ketergantungan database atau server backend (PHP/Node.js/Python).
• Dapat langsung dijalankan secara offline via double-click file `.html` atau dideploy ke hosting statis gratis dengan kecepatan akses instan (< 1 detik).

*2. Fitur Spesifik Pengadaan Laboratorium (Niche-Tailored)*
• *Data Sains Lengkap:* Menampilkan Grade Kemurnian (PA / Teknis), Lot Number, Rumus Kimia, dan Nomor CAS.
• *Kepatuhan Legalitas Mutu:* Dilengkapi tab dokumen mutu resmi (_Certificate of Analysis_ / CoA dan _Safety Data Sheet_ / MSDS).
• *Permohonan RFQ Formal:* Tombol minta Surat Penawaran Resmi (RFQ) berformat modal instan untuk bendahara pengadaan kampus/industri.
• *Logistik Khusus Bahan Kimia:* Pilihan proteksi pengiriman khusus berupa peti kayu bersertifikasi (_wooden crate_) dan asuransi pecah belah cairan kimia.

*3. Faktur Resmi Pengadaan e-Faktur Siap Cetak A4 (Print-Ready)*
• Dilengkapi lembar faktur resmi berstempel digital "QA/QC APPROVED", kop perusahaan legal, NPWP, dan rincian transaksi rapi.
• Format cetak terisolasi (`@media print`): saat menekan tombol cetak atau `Ctrl+P`, browser otomatis menyembunyikan navbar/footer dan menghasilkan lembar cetak 1 halaman A4 portrait yang rapi tanpa teks nominal yang terpotong.

*4. Kanal Pembayaran Nasional 2-Tahap yang Sangat Realistis*
• *Gerai Minimarket (Indomaret & Alfamart):* Menghasilkan barcode SVG Code-128 tajam yang dapat dipindai langsung oleh scanner kasir, disertai kode bayar manual 1-klik salin.
• *QRIS Dinamis:* Mendukung seluruh m-Banking dan e-Wallet nasional lengkap dengan animasi scanline laser interaktif.
• *Virtual Account:* Pilihan VA otomatis untuk BCA, Mandiri, BRI, dan BNI.

*5. Antarmuka Modern & Ergonomi Mobile (Tokopedia/Shopee Style)*
• Desain visual bersih, profesional, dan responsif dari layar smartphone (390px) hingga monitor desktop (1920px).
• Dilengkapi menu navigasi bawah (_fixed mobile bottom navigation_), live search instan tanpa refresh halaman, dan filter kategori berbasis tombol kapsul (_pills_).

*6. Sangat Siap untuk Demo & Presentasi (Pitching-Ready)*
• Menyediakan tombol instan 1-klik login multi-akun (Dosen/Peneliti ITS sebagai akun utama, Dosen UGM, QC Industri Bio Farma, dan Mitra Seller).
• Tombol simulasi pembayaran langsung lunas untuk memperagakan alur checkout penuh dalam hitungan detik.
• Form penerbitan produk baru di Seller Centre dengan tombol 1-klik isi demo barang lab.

*7. Pusat Mitra Toko Terintegrasi (Seller Centre)*
• Mitra distributor memiliki dashboard tersendiri untuk memantau performa toko, omset, pesanan masuk, dan menerbitkan produk baru yang langsung tayang secara live di katalog beranda pembeli.

========================================

*⚠️ 3. KEKURANGAN WEBSITE*

*1. Masih Berupa Prototipe Client-Side (Belum Ada Database Server Terpusat)*
• Semua data keranjang, akun, dan pesanan masih tersimpan di `localStorage` per-browser pengguna.
• Data transaksi dan produk baru yang ditambahkan di satu perangkat tidak akan tersinkronisasi ke perangkat lain atau pengguna yang berbeda.

*2. Belum Terintegrasi Payment Gateway Riil (Masih Berupa Simulasi)*
• Transaksi pembayaran saat ini masih menggunakan simulasi interaktif (mock simulation), belum terhubung langsung ke API payment gateway resmi (seperti Midtrans, Xendit, atau DOKU) untuk memproses uang nyata secara otomatis.

*3. Sistem Autentikasi & Keamanan Belum Standar Produksi*
• Login dan registrasi akun masih bersifat simulasi antarmuka di sisi browser.
• Belum ada sistem hashing password berbasis server (seperti bcrypt/argon2), belum menggunakan token otentikasi (JWT/Session Cookie), serta belum terintegrasi ke sistem Single Sign-On (SSO) institusi kampus.

*4. Pelacakan Ekspedisi Kurir Belum Terhubung API Nyata*
• Resi pengiriman dan tahapan pelacakan paket masih berupa simulasi logika bertahap, belum terhubung ke API pelacakan logistik resmi (JNE/SiCepat) atau sistem manajemen gudang fisik (WMS/ERP).

*5. Keterbatasan Kapasitas Penyimpanan Lokal (LocalStorage Limit)*
• Kapasitas penyimpanan `localStorage` pada browser terbatas (umumnya berkisar 5 MB), sehingga belum mampu menampung ribuan katalog produk, transaksi berskala besar, atau berkas unduhan dokumen asli (file PDF besar).

*6. Fitur Live Chat & Konsultasi Kimia Masih Statis*
• Widget obrolan layanan pelanggan (CS Lab) saat ini masih berupa simulasi antarmuka pop-up, belum terhubung ke server WebSocket atau layanan pesan instan dua arah secara langsung.

========================================
_Catatan: File ini siap langsung di-copy dan di-paste ke WhatsApp tanpa perlu diedit._
