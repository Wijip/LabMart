// Floating Chat CS Lab & RFQ (Request for Quotation) Modal Component

document.addEventListener('DOMContentLoaded', () => {
  injectFloatingChatWidget();
  injectRfqModal();
});

// 1. Floating Live Chat Widget Component
function injectFloatingChatWidget() {
  if (document.getElementById('lab-floating-chat-root')) return;

  const chatContainer = document.createElement('div');
  chatContainer.id = 'lab-floating-chat-root';
  chatContainer.className = 'fixed bottom-20 sm:bottom-5 right-4 sm:right-5 z-40 flex flex-col items-end no-print font-sans';

  chatContainer.innerHTML = `
    <!-- Chat Window Popup (Hidden by default) -->
    <div id="lab-chat-window" class="hidden mb-3 w-[calc(100vw-32px)] max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300">
      
      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-teal-800 to-teal-700 p-4 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
              <span class="material-symbols-outlined text-xl">biotech</span>
            </div>
            <span class="w-3 h-3 rounded-full bg-emerald-400 border-2 border-teal-800 absolute -bottom-0.5 -right-0.5"></span>
          </div>
          <div>
            <div class="text-xs font-black">Dr. Alisa & Tim Ahli Kimia</div>
            <div class="text-[10px] text-teal-200">Konsultasi Teknis & Spesifikasi MSDS</div>
          </div>
        </div>

        <button onclick="toggleLabChat()" class="text-white/80 hover:text-white p-1">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Chat Body -->
      <div id="lab-chat-messages" class="p-4 h-72 overflow-y-auto space-y-3 bg-slate-50 text-xs">
        <div class="flex items-start gap-2">
          <div class="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">CS</div>
          <div class="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-200 text-slate-700 shadow-2xs leading-relaxed">
            Halo! Ada yang bisa kami bantu terkait pengadaan instrumen, reagen Pro Analisis (PA), sertifikat CoA, atau pengiriman bahan kimia B3?
          </div>
        </div>

        <!-- Quick Questions Chips -->
        <div class="space-y-1.5 pt-1">
          <div class="text-[10px] text-slate-400 font-bold uppercase">Pertanyaan Cepat:</div>
          <button onclick="sendQuickChatMessage('Apakah produk bahan kimia disertai sertifikat CoA dan MSDS?')" class="w-full text-left p-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-semibold transition-colors">
            📄 Apakah produk disertai CoA & MSDS resmi?
          </button>
          <button onclick="sendQuickChatMessage('Bagaimana prosedur pengiriman berpendingin (Cold-Chain)?')" class="w-full text-left p-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-semibold transition-colors">
            ❄️ Bagaimana prosedur pengiriman Cold-Chain?
          </button>
          <button onclick="sendQuickChatMessage('Bisa menerbitkan Faktur Pajak e-Faktur untuk kampus?')" class="w-full text-left p-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-semibold transition-colors">
            🏛️ Apakah bisa menerbitkan Faktur Pajak institusi?
          </button>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input 
          id="lab-chat-input"
          type="text" 
          placeholder="Ketik pertanyaan teknis lab..."
          onkeydown="if(event.key==='Enter') sendChatMessage()"
          class="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button 
          onclick="sendChatMessage()"
          class="w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center transition-colors shadow-sm"
        >
          <span class="material-symbols-outlined text-base">send</span>
        </button>
      </div>

    </div>

    <!-- Floating Toggle Button -->
    <button 
      id="lab-chat-toggle-btn"
      onclick="toggleLabChat()"
      class="p-3.5 sm:px-4 sm:py-3 rounded-full sm:rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-xl shadow-teal-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 border-2 border-white"
      title="Tanya Spesialis Lab & CS"
    >
      <span class="material-symbols-outlined text-xl sm:text-lg">support_agent</span>
      <span class="hidden sm:inline">Tanya Spesialis Lab & CS</span>
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
    </button>
  `;

  document.body.appendChild(chatContainer);
}

function toggleLabChat() {
  const windowEl = document.getElementById('lab-chat-window');
  if (!windowEl) return;
  const isHidden = windowEl.classList.contains('hidden');
  if (isHidden) {
    windowEl.classList.remove('hidden');
  } else {
    windowEl.classList.add('hidden');
  }
}

function sendQuickChatMessage(text) {
  const input = document.getElementById('lab-chat-input');
  if (input) input.value = text;
  sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('lab-chat-input');
  const msgContainer = document.getElementById('lab-chat-messages');
  if (!input || !msgContainer) return;

  const text = input.value.trim();
  if (!text) return;

  // Add User Message
  const userMsg = document.createElement('div');
  userMsg.className = 'flex justify-end';
  userMsg.innerHTML = `
    <div class="p-3 bg-teal-600 text-white rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[85%] shadow-2xs">
      ${text}
    </div>
  `;
  msgContainer.appendChild(userMsg);
  input.value = '';
  msgContainer.scrollTop = msgContainer.scrollHeight;

  // Simulated Auto Reply
  setTimeout(() => {
    let reply = 'Terima kasih atas pertanyaan Anda. Tim spesialis teknis laboratorium kami akan memastikan kesesuaian spesifikasi produk dan ketersediaan lot batch terbaru.';

    const lower = text.toLowerCase();
    if (lower.includes('msds') || lower.includes('coa')) {
      reply = 'Semua reagen grade Pro Analisis (PA) di LabMart selalu disertai dokumen Certificate of Analysis (CoA) lot terbaru dan lembar Safety Data Sheet (SDS/MSDS) resmi berstandar GHS.';
    } else if (lower.includes('cold') || lower.includes('dingin') || lower.includes('suhu')) {
      reply = 'Pengiriman Cold-Chain menggunakan kemasan box styrofoam kedap udara dengan ice pack pendingin khusus suhu 2-8°C atau dry ice -20°C untuk menjaga viabilitas enzim dan antibodi.';
    } else if (lower.includes('pajak') || lower.includes('kampus') || lower.includes('institusi') || lower.includes('po')) {
      reply = 'Tentu! Kami melayani pengadaan B2B/B2G lengkap dengan e-Faktur Pajak resmi, Surat Perintah Kerja (SPK), dan mekanisme pembayaran Term of Payment (TOP 30 Hari).';
    }

    const replyMsg = document.createElement('div');
    replyMsg.className = 'flex items-start gap-2';
    replyMsg.innerHTML = `
      <div class="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">CS</div>
      <div class="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-200 text-slate-700 text-xs shadow-2xs leading-relaxed max-w-[85%]">
        ${reply}
      </div>
    `;
    msgContainer.appendChild(replyMsg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }, 600);
}

// 2. RFQ (Request for Quotation) Modal Component
function injectRfqModal() {
  if (document.getElementById('lab-rfq-modal')) return;

  const rfqModal = document.createElement('div');
  rfqModal.id = 'lab-rfq-modal';
  rfqModal.className = 'fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm hidden flex items-center justify-center p-4 font-sans no-print';

  rfqModal.innerHTML = `
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200 p-6 sm:p-8 space-y-5">
      
      <!-- Close button -->
      <button onclick="closeRfqModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>

      <div class="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
          <span class="material-symbols-outlined text-2xl">picture_as_pdf</span>
        </div>
        <div>
          <h3 class="text-lg font-black text-slate-900">Surat Penawaran Resmi (RFQ Quotation)</h3>
          <p class="text-xs text-slate-500">Dokumen penawaran harga formal untuk pengajuan anggaran institusi</p>
        </div>
      </div>

      <!-- Formal Quotation Content -->
      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs text-slate-700">
        <div class="flex justify-between items-start border-b border-slate-200 pb-3">
          <div>
            <div class="font-bold text-slate-900">PT SARANA LABORATORIUM NUSANTARA</div>
            <div class="text-[11px] text-slate-500">Izin Kemenkes RI: FK.01.02/VI/892-e/2024 • NPWP: 01.382.910.2-021.000</div>
          </div>
          <div class="text-right">
            <div class="font-mono-code font-bold text-teal-800">SPH/LAB/2026/0892</div>
            <div class="text-[11px] text-slate-500">Berlaku s/d: 14 Hari Kerja</div>
          </div>
        </div>

        <div class="space-y-1">
          <span class="font-bold text-slate-800 block text-[11px] uppercase">DITUJUKAN KEPADA:</span>
          <div id="rfq-dest-name" class="font-bold text-slate-900">Dr. Rian Pratama (FMIPA UGM)</div>
          <div class="text-slate-500">Perihal: Penawaran Harga Pengadaan Alat & Reagen Laboratorium 2026</div>
        </div>

        <div class="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5">Item Barang</th>
                <th class="p-2.5 text-center">Qty</th>
                <th class="p-2.5 text-right">Harga Resmi</th>
              </tr>
            </thead>
            <tbody id="rfq-items-preview">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>

        <div class="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-[11px] space-y-1">
          <div class="font-bold">Ketentuan Penawaran:</div>
          <div>1. Harga sudah termasuk PPN 11% dan penerbitan faktur pajak elektronik.</div>
          <div>2. Garansi resmi kalibrasi KAN dan jaminan originalitas pabrikan 100%.</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <button onclick="window.print()" class="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-base">print</span>
          Cetak Dokumen Quotation (PDF)
        </button>
        <button onclick="closeRfqModal(); showToast('Permintaan quotation telah dikirimkan ke email lab Anda!', 'success')" class="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-base">mail</span>
          Kirim ke Email Instansi
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(rfqModal);
}

function openRfqModal(productName, price) {
  const modal = document.getElementById('lab-rfq-modal');
  if (!modal) return;

  const tbody = document.getElementById('rfq-items-preview');
  if (tbody) {
    tbody.innerHTML = `
      <tr class="border-b border-slate-100">
        <td class="p-2.5 font-bold text-slate-800">${productName || 'Paket Pengadaan Instrumen & Reagen Laboratorium'}</td>
        <td class="p-2.5 text-center font-bold">1 Unit</td>
        <td class="p-2.5 text-right font-mono-code font-bold text-teal-800">${typeof formatRupiah === 'function' ? formatRupiah(price || 50000) : 'Rp 50.000'}</td>
      </tr>
    `;
  }

  modal.classList.remove('hidden');
}

function closeRfqModal() {
  const modal = document.getElementById('lab-rfq-modal');
  if (modal) modal.classList.add('hidden');
}
