/**
 * SUAS KKS : SISTEM UNDIAN ANUGERAH SINERGI 2026, KOLEJ KOMUNITI SEGAMAT
 * Logik Aplikasi, Enjin Undian, Pengesahan IC, Live Real-Time Sync & Top 3 Calon Tertinggi
 */

// URL Google Apps Script Rasmi Terkini
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxp8sMbGQ90e0D7FgGvBtmQv5OHqAuJXBvtc3MwD9oCnu1XBjV39gg0ZqjMQsavVkXUYQ/exec';

// Kunci Storan Tempatan (LocalStorage Keys)
const STORAGE_KEYS = {
  CURRENT_IC: 'suas_kks_current_ic',
  VOTES_DB: 'suas_kks_votes_db',
  AWARDS_CONFIG: 'suas_kks_awards_config',
  GAS_URL: 'suas_kks_gas_url',
  SYSTEM_LOGS: 'suas_kks_logs'
};

// State Aplikasi
const AppState = {
  currentVoter: null,
  votedCategories: {}, // { categoryId: candidateName }
  awards: [],
  votesDb: [],
  systemLogs: [],
  gasUrl: DEFAULT_GAS_URL,
  gasLiveResults: {}, // { [categoryId]: { [candidateName]: count } }
  gasStats: null,
  adminLoggedIn: false,
  activeFilter: 'all',
  selectedCandidates: {} // { categoryId: candidateName } (pilihan semasa belum dihantar)
};

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupEventListeners();
  setupScrollEffects();
  renderAll();
  checkPersistedSession();

  // Tarik data Google Sheets secara langsung serta-merta
  fetchLiveGoogleSheetData(false);

  // Auto-polling data masa nyata setiap 10 saat (Real-Time Live Polling)
  setInterval(() => {
    fetchLiveGoogleSheetData(false);
  }, 10000);
});

/**
 * 1. PENGURUSAN DATA & STATE
 */
function initData() {
  // Tetapkan URL Google Apps Script rasmi terkini
  AppState.gasUrl = DEFAULT_GAS_URL;
  localStorage.setItem(STORAGE_KEYS.GAS_URL, AppState.gasUrl);

  // Muatkan Senarai Anugerah (atau gunakan INITIAL_AWARDS dari data.js)
  const savedAwards = localStorage.getItem(STORAGE_KEYS.AWARDS_CONFIG);
  if (savedAwards) {
    try {
      AppState.awards = JSON.parse(savedAwards);
    } catch (e) {
      AppState.awards = JSON.parse(JSON.stringify(INITIAL_AWARDS));
    }
  } else {
    AppState.awards = JSON.parse(JSON.stringify(INITIAL_AWARDS));
  }

  // Sentiasa kemas kini calon Anugerah Bintang Harapan (Rookie of the Year) kepada 23 calon rasmi
  const rookieAward = AppState.awards.find(a => a.id === 'anugerah_2');
  if (rookieAward && typeof ROOKIE_LELAKI !== 'undefined' && typeof ROOKIE_PEREMPUAN !== 'undefined') {
    const catL = rookieAward.categories.find(c => c.id === 'rookie_lelaki');
    if (catL) catL.candidates = [...ROOKIE_LELAKI];
    const catP = rookieAward.categories.find(c => c.id === 'rookie_perempuan');
    if (catP) catP.candidates = [...ROOKIE_PEREMPUAN];
  }
  localStorage.setItem(STORAGE_KEYS.AWARDS_CONFIG, JSON.stringify(AppState.awards));


  // Muatkan Pangkalan Data Undian Tempatan
  const savedVotes = localStorage.getItem(STORAGE_KEYS.VOTES_DB);
  if (savedVotes) {
    try {
      AppState.votesDb = JSON.parse(savedVotes);
    } catch (e) {
      AppState.votesDb = [];
    }
  } else {
    AppState.votesDb = [];
  }

  // Muatkan Log Sistem
  const savedLogs = localStorage.getItem(STORAGE_KEYS.SYSTEM_LOGS);
  if (savedLogs) {
    try {
      AppState.systemLogs = JSON.parse(savedLogs);
    } catch (e) {
      AppState.systemLogs = [];
    }
  } else {
    AppState.systemLogs = [
      {
        time: new Date().toLocaleString('ms-MY'),
        action: 'SISTEM_BERMULA',
        user: 'SISTEM',
        detail: 'Sistem SUAS KKS 2026 diaktifkan dengan sambungan Google Sheets real-time.'
      }
    ];
  }
}

function checkPersistedSession() {
  const savedIc = localStorage.getItem(STORAGE_KEYS.CURRENT_IC);
  if (savedIc) {
    verifyVoterIC(savedIc, false);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.AWARDS_CONFIG, JSON.stringify(AppState.awards));
  localStorage.setItem(STORAGE_KEYS.VOTES_DB, JSON.stringify(AppState.votesDb));
  localStorage.setItem(STORAGE_KEYS.SYSTEM_LOGS, JSON.stringify(AppState.systemLogs));
  localStorage.setItem(STORAGE_KEYS.GAS_URL, AppState.gasUrl);
}

function addLog(action, user, detail) {
  const logItem = {
    time: new Date().toLocaleString('ms-MY'),
    action: action,
    user: user,
    detail: detail
  };
  AppState.systemLogs.unshift(logItem);
  if (AppState.systemLogs.length > 200) AppState.systemLogs.pop();
  localStorage.setItem(STORAGE_KEYS.SYSTEM_LOGS, JSON.stringify(AppState.systemLogs));
}

/**
 * 2. EFEK SKROL KEMAS BAGI HEADER NAVIGASI (BANNER KEKAL STATIK)
 */
function setupScrollEffects() {
  const header = document.getElementById('siteHeader');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (header) {
      if (scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }, { passive: true });
}


/**
 * 3. PENYEGARAN REAL-TIME DENGAN GOOGLE APPS SCRIPT
 */
async function fetchLiveGoogleSheetData(showIndicator = false) {
  if (!AppState.gasUrl) return;

  const liveText = document.getElementById('liveSyncText');
  if (showIndicator && liveText) liveText.textContent = 'Menyegerak...';

  try {
    if (AppState.adminLoggedIn) {
      // Mod Pentadbir: Tarik data penuh (termasuk keputusan calon dan top 3) menggunakan password admin rasmi
      const res = await fetch(`${AppState.gasUrl}?action=get_admin_data&password=${encodeURIComponent(SYSTEM_CONFIG.adminPasswordDefault)}`, {
        method: 'GET',
        mode: 'cors'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.resultsByCat) {
            AppState.gasLiveResults = data.resultsByCat;
          }

          if (data.allVotesLog && Array.isArray(data.allVotesLog) && data.allVotesLog.length > 0) {
            // Gabungkan undian awan ke pangkalan data tempatan
            const existingIds = new Set(AppState.votesDb.map(v => `${cleanIC(v.ic)}_${v.categoryId}`));

            data.allVotesLog.forEach(v => {
              const catId = findCategoryIdByName(v.catName) || v.catName;
              const key = `${cleanIC(v.ic)}_${catId}`;
              if (!existingIds.has(key)) {
                AppState.votesDb.push({
                  id: 'v_gas_' + Math.random().toString(36).substr(2, 6),
                  timestamp: v.time,
                  displayTime: new Date(v.time).toLocaleString('ms-MY'),
                  ic: v.ic,
                  voterName: v.voterName,
                  role: v.role,
                  awardTitle: v.awardTitle,
                  categoryName: v.catName,
                  categoryId: catId,
                  candidateName: v.candidate
                });
                existingIds.add(key);
              }
            });
            localStorage.setItem(STORAGE_KEYS.VOTES_DB, JSON.stringify(AppState.votesDb));
          }

          if (data.stats) {
            AppState.gasStats = data.stats;
          }
        }
      }
    } else {
      // Mod Peserta / Awam: Hanya tarik statistik kehadiran pengundi (TIADA keputusan calon / top 3)
      const res = await fetch(`${AppState.gasUrl}?action=get_stats`, {
        method: 'GET',
        mode: 'cors'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          AppState.gasStats = {
            totalEligible: data.totalEligible || 64,
            totalVoted: data.totalVoted || 0,
            turnoutPercent: data.turnoutPercent || 0,
            adminVoted: data.adminVoted || 0,
            adminTotal: data.adminTotal || 15,
            pensyarahVoted: data.pensyarahVoted || 0,
            pensyarahTotal: data.pensyarahTotal || 49,
            categoryTurnout: data.categoryTurnout || {}
          };
          // Kosongkan keputusan calon dari storan aktif peserta untuk privasi penuh
          AppState.gasLiveResults = {};
        }
      }
    }

    // Kemaskini rekod undian staf aktif jika sedang log masuk
    if (AppState.currentVoter) {
      updateVoterRecordsFromDb();
      renderVoterBar();
    }

    // Kemaskini paparan mengikut peranan
    renderAwardsGrid();
    renderDashboard();
    if (AppState.adminLoggedIn) {
      renderAdminLeaderboard();
      renderStaffStatusTable();
    }

    if (liveText) liveText.textContent = 'Google Sheets Real-Time';
    if (showIndicator) showToast('Data undian telah disegerakkan secara langsung dengan Google Sheets!', 'success');
  } catch (err) {
    console.warn('Real-time sync notice:', err);
    if (liveText) liveText.textContent = 'Pangkalan Data Tempatan';
  }
}

function refreshLiveData(manualClick = false) {
  fetchLiveGoogleSheetData(manualClick);
}

function findCategoryIdByName(categoryName) {
  if (!categoryName) return '';
  for (const a of AppState.awards) {
    for (const c of a.categories) {
      if (c.name.trim().toLowerCase() === categoryName.trim().toLowerCase()) {
        return c.id;
      }
    }
  }
  return '';
}

/**
 * 4. PENGIRAAN 3 CALON UNDIAN TERTINGGI (TOP 3)
 */
function getTop3ForCategory(categoryId, candidateList = []) {
  // 1. Ambil kiraan daripada gasLiveResults jika ada
  const catTallies = (AppState.gasLiveResults && AppState.gasLiveResults[categoryId]) ? 
    { ...AppState.gasLiveResults[categoryId] } : {};

  // 2. Gabungkan dengan votesDb tempatan jika belum sync
  AppState.votesDb.forEach(vote => {
    if (vote.categoryId === categoryId && vote.candidateName) {
      catTallies[vote.candidateName] = (catTallies[vote.candidateName] || 0);
    }
  });

  // Kira jumlah undi keseluruhan kategori ini
  let totalVotes = 0;
  Object.values(catTallies).forEach(c => totalVotes += c);

  // Pastikan setiap calon dalam senarai rasmi diambil kira
  const allCandidates = candidateList.length > 0 ? candidateList : Object.keys(catTallies);

  const ranked = allCandidates.map(cand => {
    const count = catTallies[cand] || 0;
    const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return {
      name: cand,
      count: count,
      percent: percent
    };
  }).sort((a, b) => b.count - a.count);

  return {
    totalVotes: totalVotes,
    top3: ranked.slice(0, 3)
  };
}

function renderTop3PodiumHtml(categoryId, candidateList = []) {
  const { totalVotes, top3 } = getTop3ForCategory(categoryId, candidateList);

  if (totalVotes === 0 || !top3 || top3.length === 0 || top3[0].count === 0) {
    return `
      <div class="top3-empty-state">
        <i class="fas fa-info-circle" style="color: var(--gold-light); margin-right: 0.35rem;"></i>
        Belum ada undian direkodkan bagi kategori ini. Jadilah staf pertama yang mengundi!
      </div>
    `;
  }

  const medals = [
    { rank: '1', icon: '🥇', label: 'Tempat 1 (Mendahului)', class: 'rank-1' },
    { rank: '2', icon: '🥈', label: 'Tempat 2', class: 'rank-2' },
    { rank: '3', icon: '🥉', label: 'Tempat 3', class: 'rank-3' }
  ];

  return `
    <div class="top3-grid">
      ${top3.map((cand, idx) => {
        const medal = medals[idx] || medals[2];
        return `
          <div class="top3-item-podium ${medal.class}">
            <div class="top3-medal-icon">${medal.icon}</div>
            <div class="top3-info">
              <div class="top3-candidate-name" title="${escapeHtml(cand.name)}">
                ${escapeHtml(cand.name)}
              </div>
              <div class="top3-vote-bar">
                <span>${medal.label}</span>
                <span class="top3-vote-count">${cand.count} Undian (${cand.percent}%)</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * 4.1 STATISTIK KELUAR MENGUNDI MENGIKUT KATEGORI
 * (Hanya statistik kehadiran/turnout dipaparkan kepada peserta; undian calon kekal sulit)
 */
function getCategoryTurnout(categoryId) {
  let count = 0;
  const countedIcs = new Set();
  
  // Kira undian daripada pangkalan data tempatan
  AppState.votesDb.forEach(vote => {
    if (vote.categoryId === categoryId && !countedIcs.has(cleanIC(vote.ic))) {
      countedIcs.add(cleanIC(vote.ic));
      count++;
    }
  });

  // Gabungkan dengan statistik Google Sheets jika ada
  if (AppState.gasStats && AppState.gasStats.categoryTurnout && AppState.gasStats.categoryTurnout[categoryId]) {
    count = Math.max(count, AppState.gasStats.categoryTurnout[categoryId]);
  }
  return count;
}

function renderCategoryTurnoutWidget(cat, award) {
  const totalEligible = 64;
  const turnoutCount = getCategoryTurnout(cat.id);
  const percent = Math.round((turnoutCount / totalEligible) * 100);

  // Bahagian keputusan calon KHAS untuk pentadbir sahaja
  let adminSection = '';
  if (AppState.adminLoggedIn) {
    adminSection = `
      <div class="admin-top3-preview-box">
        <div class="admin-preview-header">
          <span class="admin-badge"><i class="fas fa-user-shield"></i> Akses Pentadbir</span>
          <span class="admin-preview-title"><i class="fas fa-trophy" style="color: var(--gold-light); margin-right: 0.35rem;"></i> Keputusan Calon & 3 Calon Tertinggi</span>
        </div>
        ${renderTop3PodiumHtml(cat.id, cat.candidates)}
      </div>
    `;
  }

  return `
    <div class="category-turnout-widget">
      <div class="turnout-widget-header">
        <div class="turnout-widget-title">
          <i class="fas fa-poll" style="color: var(--gold-light);"></i>
          Statistik Keluar Mengundi Kategori
        </div>
        <div class="turnout-live-tag">
          <span class="live-pulse-dot" style="width: 6px; height: 6px;"></span>
          <span>Status Semasa</span>
        </div>
      </div>
      <div class="turnout-widget-body">
        <div class="turnout-metrics-row">
          <div class="turnout-metric-main">
            <span class="turnout-metric-number">${turnoutCount}</span>
            <span class="turnout-metric-total">/ ${totalEligible} staf telah mengundi</span>
          </div>
          <div class="turnout-metric-badge">
            <i class="fas fa-users"></i> Partisipasi: ${percent}%
          </div>
        </div>
        <div class="turnout-progress-bar-wrap" title="${turnoutCount} daripada ${totalEligible} staf telah keluar mengundi (${percent}%)">
          <div class="turnout-progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
        <div class="turnout-confidential-note">
          <i class="fas fa-shield-alt"></i>
          <span>Keputusan undian calon adalah <strong>SULIT</strong> &bull; Hanya boleh dilihat oleh <strong>Pentadbir Sahaja</strong></span>
        </div>
      </div>
      ${adminSection}
    </div>
  `;
}

/**
 * 5. PENGESAHAN NO. IC STAF
 */
function cleanIC(rawIc) {
  return String(rawIc || '').replace(/[^0-9]/g, '').trim();
}

function formatIC(rawIc) {
  const c = cleanIC(rawIc);
  if (c.length === 12) {
    return `${c.substring(0, 6)}-${c.substring(6, 8)}-${c.substring(8, 12)}`;
  }
  return rawIc;
}

function verifyVoterIC(rawIc, showToastOnSuccess = true) {
  const cleaned = cleanIC(rawIc);
  if (!cleaned) {
    showToast('Sila masukkan No. Kad Pengenalan anda.', 'error');
    return false;
  }

  // Cari dalam 64 staf yang berdaftar
  const staff = STAFF_LIST.find(s => cleanIC(s.ic) === cleaned);

  if (!staff) {
    showToast('No. Kad Pengenalan tidak dijumpai dalam senarai 64 staf yang layak mengundi!', 'error');
    return false;
  }

  // Berjaya ditemui
  AppState.currentVoter = staff;
  localStorage.setItem(STORAGE_KEYS.CURRENT_IC, staff.ic);

  // Ambil rekod undian terdahulu untuk staf ini
  updateVoterRecordsFromDb();

  // Kemaskini Bar Pengundi & UI
  renderVoterBar();
  renderAwardsGrid();
  closeModal('icModal');

  if (showToastOnSuccess) {
    showToast(`Selamat datang, ${staff.name}! Pengesahan berjaya.`, 'success');
  }

  // Segerak ke awan Google Sheets serta-merta
  fetchLiveGoogleSheetData(false);

  return true;
}

function logoutVoter() {
  AppState.currentVoter = null;
  AppState.votedCategories = {};
  AppState.selectedCandidates = {};
  localStorage.removeItem(STORAGE_KEYS.CURRENT_IC);
  renderVoterBar();
  renderAwardsGrid();
  showToast('Sesi pengundi ditamatkan.', 'info');
}

function updateVoterRecordsFromDb() {
  AppState.votedCategories = {};
  if (!AppState.currentVoter) return;

  const voterIcClean = cleanIC(AppState.currentVoter.ic);
  const staffVotes = AppState.votesDb.filter(v => cleanIC(v.ic) === voterIcClean);

  staffVotes.forEach(v => {
    AppState.votedCategories[v.categoryId] = v.candidateName;
  });
}

/**
 * 6. PROSES PENGHANTARAN UNDIAN
 */
function selectCandidate(categoryId, candidateName) {
  if (AppState.votedCategories[categoryId]) {
    showToast('Anda sudah menghantar undian untuk kategori ini!', 'info');
    return;
  }
  AppState.selectedCandidates[categoryId] = candidateName;
  renderCandidatesGrid(categoryId);
  updateCategorySubmitFooter(categoryId);
}

function submitCategoryVote(awardId, categoryId) {
  // Pastikan pengundi disahkan dahulu
  if (!AppState.currentVoter) {
    showToast('Sila masukkan No. Kad Pengenalan anda terlebih dahulu untuk mengundi!', 'error');
    openModal('icModal');
    return;
  }

  // Semak jika sudah mengundi kategori ini
  if (AppState.votedCategories[categoryId]) {
    showToast('Anda telah pun membuat undian untuk kategori ini!', 'error');
    return;
  }

  const chosenCandidate = AppState.selectedCandidates[categoryId];
  if (!chosenCandidate) {
    showToast('Sila pilih seorang calon sebelum menekan butang undi!', 'error');
    return;
  }

  // Dapatkan maklumat anugerah dan subkategori
  const award = AppState.awards.find(a => a.id === awardId);
  const category = award ? award.categories.find(c => c.id === categoryId) : null;

  if (!award || !category) {
    showToast('Maklumat kategori tidak sah!', 'error');
    return;
  }

  // Catat undian ke dalam pangkalan data setempat
  const voteRecord = {
    id: 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    displayTime: new Date().toLocaleString('ms-MY'),
    ic: AppState.currentVoter.ic,
    voterName: AppState.currentVoter.name,
    role: AppState.currentVoter.role,
    gender: AppState.currentVoter.gender,
    awardId: award.id,
    awardTitle: award.title,
    categoryId: category.id,
    categoryName: category.name,
    candidateName: chosenCandidate
  };

  AppState.votesDb.push(voteRecord);
  AppState.votedCategories[categoryId] = chosenCandidate;
  delete AppState.selectedCandidates[categoryId];

  addLog('UNDI_DIHANTAR', AppState.currentVoter.name, `Mengundi calon ${chosenCandidate} bagi ${category.name}`);
  saveState();

  // Kemaskini terus kiraan live dalam memory
  if (!AppState.gasLiveResults[categoryId]) AppState.gasLiveResults[categoryId] = {};
  AppState.gasLiveResults[categoryId][chosenCandidate] = (AppState.gasLiveResults[categoryId][chosenCandidate] || 0) + 1;

  // Hantar undian ke Google Apps Script di latar belakang (Background Sync)
  sendVoteToGoogleSheet(voteRecord);

  // Maklum balas pantas & kemaskini paparan
  showToast(`Undian anda untuk "${category.name}" telah berjaya direkodkan!`, 'success');
  renderVoterBar();
  renderAwardsGrid();
  renderDashboard();

  if (AppState.adminLoggedIn) {
    renderAdminPortal();
  }
}

/**
 * 7. PENGHANTARAN KE GOOGLE APPS SCRIPT / GOOGLE SHEETS
 */
async function sendVoteToGoogleSheet(voteRecord) {
  if (!AppState.gasUrl) return;

  try {
    const payload = {
      action: 'submit_vote',
      ic: voteRecord.ic,
      name: voteRecord.voterName,
      role: voteRecord.role,
      votes: [
        {
          awardId: voteRecord.awardId,
          awardTitle: voteRecord.awardTitle,
          categoryId: voteRecord.categoryId,
          categoryName: voteRecord.categoryName,
          candidateName: voteRecord.candidateName
        }
      ]
    };

    // Google Apps Script accepts text/plain to avoid CORS preflight options blocking
    await fetch(AppState.gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    console.log('Undian disegerakkan ke Google Sheet.');
    setTimeout(() => {
      fetchLiveGoogleSheetData(false);
    }, 1200);
  } catch (err) {
    console.warn('Gagal sync ke Google Sheet:', err);
  }
}

/**
 * 8. RENDERING UI, AWARDS GRID & TOP 3 CANDIDATES
 */
function renderAll() {
  renderVoterBar();
  renderAwardsGrid();
  renderDashboard();
  renderStaffStatusTable();
}

function renderVoterBar() {
  const container = document.getElementById('voterBarContainer');
  if (!container) return;

  if (!AppState.currentVoter) {
    container.innerHTML = `
      <div class="voter-bar-content">
        <div class="voter-profile">
          <div class="voter-avatar">?</div>
          <div class="voter-details">
            <h4>Sila Sahkan No. Kad Pengenalan Untuk Mengundi</h4>
            <span class="voter-ic-text">Setiap staf yang berdaftar layak mengundi 1 calon bagi setiap kategori</span>
          </div>
        </div>
        <div>
          <button class="btn-lookup" onclick="openModal('icModal')">
            <i class="fas fa-id-card"></i> Sahkan No. IC Saya
          </button>
        </div>
      </div>
    `;
    return;
  }

  let totalCategories = 0;
  AppState.awards.forEach(a => {
    if (a.active) totalCategories += a.categories.length;
  });

  const votedCount = Object.keys(AppState.votedCategories).length;
  const progressPercent = totalCategories > 0 ? Math.round((votedCount / totalCategories) * 100) : 0;
  const initials = AppState.currentVoter.name
    .split(' ')
    .filter(n => n.length > 0)
    .slice(0, 2)
    .map(n => n[0])
    .join('');

  const isRoleAdmin = AppState.currentVoter.role === 'Staff Admin';

  container.innerHTML = `
    <div class="voter-bar-content">
      <div class="voter-profile">
        <div class="voter-avatar">${initials}</div>
        <div class="voter-details">
          <h4>
            ${AppState.currentVoter.name}
            <span class="voter-role-badge ${isRoleAdmin ? 'admin' : 'pensyarah'}">
              ${AppState.currentVoter.role}
            </span>
          </h4>
          <span class="voter-ic-text">No. IC: ${AppState.currentVoter.ic} | Jantina: ${AppState.currentVoter.gender}</span>
        </div>
      </div>
      <div class="voter-progress-box">
        <div class="progress-indicator">
          <span class="progress-label">Kemajuan Undian Anda</span>
          <span class="progress-count">${votedCount} / ${totalCategories} Kategori Diundi (${progressPercent}%)</span>
          <div class="progress-bar-small">
            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
        <button class="btn-admin-action" onclick="logoutVoter()" title="Tukar Staf / Log Keluar">
          <i class="fas fa-sign-out-alt"></i> Tukar Staf
        </button>
      </div>
    </div>
  `;
}

function renderAwardsGrid() {
  const grid = document.getElementById('awardsGrid');
  if (!grid) return;

  const filter = AppState.activeFilter;
  let html = '';

  AppState.awards.forEach(award => {
    if (!award.active) return;

    let visibleCategories = award.categories;
    if (filter === 'admin') {
      visibleCategories = award.categories.filter(c => c.targetRole === 'Staff Admin' || c.name.toLowerCase().includes('admin'));
      if (visibleCategories.length === 0) return;
    } else if (filter === 'pensyarah') {
      visibleCategories = award.categories.filter(c => c.targetRole === 'Staff Pensyarah' || c.name.toLowerCase().includes('pensyarah'));
      if (visibleCategories.length === 0) return;
    } else if (filter === 'open') {
      visibleCategories = award.categories.filter(c => c.targetRole === 'Semua' || c.name.toLowerCase().includes('open'));
      if (visibleCategories.length === 0) return;
    }

    html += `
      <div class="award-card" id="card_${award.id}">
        <div class="award-header-layout">
          <div class="award-image-container" onclick="openImageLightbox('${award.image}', '${escapeHtml(award.title)}')">
            <img 
              src="${award.image}" 
              alt="${escapeHtml(award.title)}" 
              class="award-img" 
              loading="lazy" 
              onerror="this.onerror=null; this.src='https://lh3.googleusercontent.com/d/${award.driveId}';"
            />
            <div class="zoom-overlay"><i class="fas fa-search-plus"></i> Lihat Penuh</div>
          </div>
          <div class="award-info-box">
            <div class="award-number-badge">
              <i class="fas fa-award"></i> Anugerah #${award.bil}
            </div>
            <h3 class="award-title">${escapeHtml(award.title)}</h3>
            <div class="award-purpose-box">
              <span class="purpose-label">Tujuan Anugerah:</span>
              <p class="purpose-text">"${escapeHtml(award.purpose)}"</p>
            </div>
          </div>
        </div>

        <div class="award-categories-container">
          ${visibleCategories.map(cat => renderCategoryBlock(award, cat)).join('')}
        </div>
      </div>
    `;
  });

  if (html === '') {
    html = `<div style="text-align: center; padding: 3rem; color: var(--text-muted);">Tiada anugerah dalam kategori ini.</div>`;
  }

  grid.innerHTML = html;
}

function renderCategoryBlock(award, cat) {
  const isVoted = Boolean(AppState.votedCategories[cat.id]);
  const votedCandidate = AppState.votedCategories[cat.id] || '';
  const selectedCandidate = AppState.selectedCandidates[cat.id] || '';

  return `
    <div class="category-block ${isVoted ? 'voted' : ''}" id="cat_block_${cat.id}">
      <div class="category-header">
        <h4 class="category-title">
          <i class="fas fa-chevron-right" style="color: var(--gold-primary); font-size: 0.85rem;"></i>
          ${escapeHtml(cat.name)}
        </h4>
        <div>
          ${isVoted ? `
            <span class="category-status-pill done">
              <i class="fas fa-check-circle"></i> Sudah Mengundi
            </span>
          ` : `
            <span class="category-status-pill pending">
              <i class="fas fa-hourglass-half"></i> Belum Mengundi
            </span>
          `}
        </div>
      </div>

      <!-- Statistik Keluar Mengundi Kategori (Peserta) & Preview Calon (Admin Sahaja) -->
      ${renderCategoryTurnoutWidget(cat, award)}

      ${isVoted ? `
        <div style="padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem;">
          <div>
            <span style="font-size: 0.82rem; color: #a7f3d0; display: block;">Pilihan undian anda:</span>
            <strong style="color: #ffffff; font-size: 1.05rem;"><i class="fas fa-user-check" style="color: #34d399; margin-right: 0.4rem;"></i>${escapeHtml(votedCandidate)}</strong>
          </div>
          <div class="voted-badge-box">
            <i class="fas fa-lock"></i> Undian Dikunci & Sah
          </div>
        </div>
      ` : `
        <div class="candidate-controls">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Cari nama calon..." 
              id="search_${cat.id}" 
              oninput="filterCandidates('${cat.id}')"
            />
          </div>
          <div class="candidate-pool-count">
            Pilihan Calon: <strong>${cat.candidates.length}</strong> orang staf
          </div>
        </div>

        <div class="candidates-grid" id="grid_${cat.id}">
          ${cat.candidates.map(candidateName => {
            const isSelected = selectedCandidate === candidateName;
            const staffObj = STAFF_LIST.find(s => s.name === candidateName);
            const initials = candidateName
              .split(' ')
              .filter(w => w.length > 0)
              .slice(0, 2)
              .map(w => w[0])
              .join('');

            return `
              <div 
                class="candidate-card ${isSelected ? 'selected' : ''}" 
                onclick="selectCandidate('${cat.id}', '${escapeHtml(candidateName)}')"
                data-name="${escapeHtml(candidateName.toLowerCase())}"
              >
                <div class="candidate-avatar">${initials}</div>
                <div class="candidate-name-box">
                  <div class="candidate-name" title="${escapeHtml(candidateName)}">${escapeHtml(candidateName)}</div>
                  <div class="candidate-role-sub">${staffObj ? staffObj.role : cat.targetRole}</div>
                </div>
                <div class="custom-radio-check">
                  <i class="fas fa-check"></i>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="category-submit-footer" id="footer_${cat.id}">
          <div class="selected-calon-preview">
            Calon Dipilih: <strong>${selectedCandidate ? escapeHtml(selectedCandidate) : 'Belum memilih calon'}</strong>
          </div>
          <div>
            <button 
              class="btn-vote-submit" 
              onclick="submitCategoryVote('${award.id}', '${cat.id}')"
              ${!selectedCandidate ? 'disabled' : ''}
            >
              <i class="fas fa-vote-yea"></i> Hantar Undian Kategori Ini
            </button>
          </div>
        </div>
      `}
    </div>
  `;
}

function filterCandidates(categoryId) {
  const input = document.getElementById(`search_${categoryId}`);
  const grid = document.getElementById(`grid_${categoryId}`);
  if (!input || !grid) return;

  const query = input.value.toLowerCase().trim();
  const cards = grid.getElementsByClassName('candidate-card');

  for (let card of cards) {
    const name = card.getAttribute('data-name') || '';
    if (name.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  }
}

function renderCandidatesGrid(categoryId) {
  const grid = document.getElementById(`grid_${categoryId}`);
  if (!grid) return;

  const selectedCandidate = AppState.selectedCandidates[categoryId];
  const cards = grid.getElementsByClassName('candidate-card');

  for (let card of cards) {
    const name = card.getAttribute('data-name');
    if (selectedCandidate && name === selectedCandidate.toLowerCase()) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  }
}

function updateCategorySubmitFooter(categoryId) {
  const footer = document.getElementById(`footer_${categoryId}`);
  if (!footer) return;

  const selectedCandidate = AppState.selectedCandidates[categoryId];
  const preview = footer.querySelector('.selected-calon-preview strong');
  const btn = footer.querySelector('.btn-vote-submit');

  if (preview) {
    preview.textContent = selectedCandidate || 'Belum memilih calon';
  }
  if (btn) {
    btn.disabled = !selectedCandidate;
  }
}

/**
 * 9. DASHBOARD PENYERTAAN & SHOWCASE 3 CALON TERTINGGI (TOP 3)
 */
function renderDashboard() {
  const totalEligible = 64;
  
  const uniqueVoterIcs = new Set();
  const adminVotedIcs = new Set();
  const pensyarahVotedIcs = new Set();
  const categoryVotesCount = {};

  AppState.votesDb.forEach(vote => {
    uniqueVoterIcs.add(cleanIC(vote.ic));
    if (vote.role === 'Staff Admin') {
      adminVotedIcs.add(cleanIC(vote.ic));
    } else {
      pensyarahVotedIcs.add(cleanIC(vote.ic));
    }
    categoryVotesCount[vote.categoryId] = (categoryVotesCount[vote.categoryId] || 0) + 1;
  });

  const totalVoted = AppState.gasStats ? AppState.gasStats.totalVoted : uniqueVoterIcs.size;
  const turnoutPercent = Math.round((totalVoted / totalEligible) * 100);

  const totalEligibleEl = document.getElementById('statTotalEligible');
  const totalVotedEl = document.getElementById('statTotalVoted');
  const turnoutPercentEl = document.getElementById('statTurnoutPercent');
  const adminTurnoutEl = document.getElementById('statAdminTurnout');
  const pensyarahTurnoutEl = document.getElementById('statPensyarahTurnout');

  if (totalEligibleEl) totalEligibleEl.textContent = totalEligible;
  if (totalVotedEl) totalVotedEl.textContent = totalVoted;
  if (turnoutPercentEl) turnoutPercentEl.textContent = `${turnoutPercent}%`;
  if (adminTurnoutEl) {
    const adminCount = AppState.gasStats ? AppState.gasStats.adminVoted : adminVotedIcs.size;
    adminTurnoutEl.textContent = `${adminCount} / 15 (${Math.round((adminCount / 15) * 100)}%)`;
  }
  if (pensyarahTurnoutEl) {
    const pensyarahCount = AppState.gasStats ? AppState.gasStats.pensyarahVoted : pensyarahVotedIcs.size;
    pensyarahTurnoutEl.textContent = `${pensyarahCount} / 49 (${Math.round((pensyarahCount / 49) * 100)}%)`;
  }

  // Sembunyikan atau paparkan banner sesi pentadbir
  const adminBanner = document.getElementById('dashboardAdminBanner');
  if (adminBanner) {
    adminBanner.style.display = AppState.adminLoggedIn ? 'flex' : 'none';
  }
  const navAdminContainer = document.getElementById('navAdminStatusContainer');
  if (navAdminContainer) {
    navAdminContainer.style.display = AppState.adminLoggedIn ? 'block' : 'none';
  }

  // Render Showcase 3 Calon Tertinggi dalam Dashboard (HANYA jika Admin)
  renderDashboardTop3();

  // Kemaskini Progress Bar Kehadiran Setiap Kategori
  const turnoutGrid = document.getElementById('turnoutGrid');
  if (!turnoutGrid) return;

  let turnoutHtml = '';
  AppState.awards.forEach(award => {
    if (!award.active) return;
    award.categories.forEach(cat => {
      let votesCount = categoryVotesCount[cat.id] || 0;
      if (AppState.gasStats && AppState.gasStats.categoryTurnout && AppState.gasStats.categoryTurnout[cat.id]) {
        votesCount = Math.max(votesCount, AppState.gasStats.categoryTurnout[cat.id]);
      }
      const percent = Math.round((votesCount / totalEligible) * 100);

      let statusColor = '#34d399';
      let statusText = 'Tinggi';
      if (percent < 40) { statusColor = '#f59e0b'; statusText = 'Rendah'; }
      else if (percent < 70) { statusColor = '#38bdf8'; statusText = 'Sederhana'; }

      turnoutHtml += `
        <div class="turnout-item-card">
          <div class="turnout-item-header">
            <span class="turnout-award-name" title="${escapeHtml(award.title)}">${escapeHtml(award.title)}</span>
            <span class="turnout-count-badge">${votesCount} / ${totalEligible} Undian (${percent}%)</span>
          </div>
          <div class="turnout-cat-name">${escapeHtml(cat.name)}</div>
          <div class="turnout-progress-container" title="${votesCount} daripada ${totalEligible} staf telah mengundi">
            <div class="turnout-progress-fill" style="width: ${percent}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.55rem; font-size: 0.75rem;">
            <span style="color: ${statusColor}; font-weight: 600;"><i class="fas fa-chart-pie"></i> Partisipasi ${statusText}</span>
            <span style="color: var(--text-muted);"><i class="fas fa-lock" style="font-size: 0.7rem; margin-right: 0.2rem;"></i> Keputusan Calon: Sulit</span>
          </div>
        </div>
      `;
    });
  });

  turnoutGrid.innerHTML = turnoutHtml;
}

function renderDashboardTop3() {
  const container = document.getElementById('dashboardTop3Container');
  if (!container) return;

  // Kerahsiaan Calon: HANYA pentadbir dibenarkan melihat kedudukan calon
  if (!AppState.adminLoggedIn) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  let html = '';

  AppState.awards.forEach(award => {
    if (!award.active) return;

    html += `
      <div style="background: rgba(9, 19, 36, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.65rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <h4 style="color: #ffffff; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-award" style="color: var(--gold-light);"></i>
            Anugerah #${award.bil}: ${escapeHtml(award.title)}
          </h4>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-style: italic;">
            ${escapeHtml(award.purpose)}
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${award.categories.map(cat => `
            <div>
              <div style="font-size: 0.88rem; font-weight: 700; color: var(--gold-light); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fas fa-chevron-circle-right" style="font-size: 0.8rem;"></i>
                ${escapeHtml(cat.name)}
              </div>
              ${renderTop3PodiumHtml(cat.id, cat.candidates)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * 10. SEMAK STATUS UNDIAN MENGIKUT IC
 */
function lookupVoterStatus() {
  const input = document.getElementById('lookupIcInput');
  const container = document.getElementById('lookupResultContainer');
  if (!input || !container) return;

  const rawIc = input.value.trim();
  const cleaned = cleanIC(rawIc);

  if (!cleaned) {
    showToast('Sila masukkan No. Kad Pengenalan!', 'error');
    return;
  }

  const staff = STAFF_LIST.find(s => cleanIC(s.ic) === cleaned);
  if (!staff) {
    container.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); padding: 1.25rem; color: #fca5a5; text-align: center;">
        <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
        <strong>No. Kad Pengenalan tidak berdaftar!</strong><br/>
        Hanya 64 staf rasmi Kolej Komuniti Segamat yang dibenarkan mengundi. Sila semak semula nombor kad pengenalan anda.
      </div>
    `;
    return;
  }

  const voterVotes = AppState.votesDb.filter(v => cleanIC(v.ic) === cleaned);
  const votedCatIds = new Set(voterVotes.map(v => v.categoryId));

  let totalCategories = 0;
  let categoryStatusList = [];

  AppState.awards.forEach(a => {
    if (a.active) {
      a.categories.forEach(c => {
        totalCategories++;
        const hasVoted = votedCatIds.has(c.id);
        categoryStatusList.push({
          awardTitle: a.title,
          categoryName: c.name,
          hasVoted: hasVoted
        });
      });
    }
  });

  container.innerHTML = `
    <div style="background: var(--bg-card); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h3 style="color: #ffffff; font-size: 1.2rem;">${staff.name}</h3>
          <span style="color: var(--text-muted); font-size: 0.85rem;">No. IC: ${staff.ic} | ${staff.role}</span>
        </div>
        <div>
          <span class="category-status-pill ${voterVotes.length === totalCategories ? 'done' : 'pending'}">
            ${voterVotes.length} / ${totalCategories} Kategori Selesai
          </span>
        </div>
      </div>

      <div style="max-height: 260px; overflow-y: auto; padding-right: 0.5rem;">
        ${categoryStatusList.map(item => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.85rem;">
            <div>
              <strong style="color: #ffffff;">${escapeHtml(item.awardTitle)}</strong>
              <span style="color: var(--text-muted); display: block; font-size: 0.78rem;">${escapeHtml(item.categoryName)}</span>
            </div>
            <div>
              ${item.hasVoted ? `
                <span style="color: #34d399; font-weight: 700;"><i class="fas fa-check-circle"></i> Selesai</span>
              ` : `
                <span style="color: #fbbf24;"><i class="fas fa-clock"></i> Belum Mengundi</span>
              `}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 1.25rem; text-align: center;">
        <button class="btn-vote-submit" onclick="loginAndVoteWithIC('${staff.ic}')">
          <i class="fas fa-vote-yea"></i> Mengundi Sekarang Menggunakan IC Ini
        </button>
      </div>
    </div>
  `;
}

function loginAndVoteWithIC(ic) {
  verifyVoterIC(ic, true);
  switchPage('undian');
}

/**
 * 11. PORTAL ADMIN & LEADERBOARD LENGKAP
 */
function attemptAdminLogin() {
  const input = document.getElementById('adminPasswordInput');
  if (!input) return;

  const password = input.value;
  if (password === SYSTEM_CONFIG.adminPasswordDefault) {
    AppState.adminLoggedIn = true;
    closeModal('adminLoginModal');
    input.value = '';
    
    // Kemaskini status UI & tarik data penuh calon jika Google Sheets disambungkan
    fetchLiveGoogleSheetData(false);
    renderAll();
    renderAdminPortal();
    switchPage('admin');
    showToast('Log masuk Pentadbir berjaya! Keputusan undian calon kini boleh dilihat.', 'success');
    addLog('ADMIN_LOGIN', 'PENTADBIR', 'Log masuk ke Portal Pentadbir');
  } else {
    showToast('Kata laluan admin salah! Sila cuba lagi.', 'error');
  }
}

function adminLogout() {
  AppState.adminLoggedIn = false;
  AppState.gasLiveResults = {};
  renderAll();
  switchPage('undian');
  showToast('Pentadbir telah log keluar. Keputusan calon ditutup.', 'info');
  addLog('ADMIN_LOGOUT', 'PENTADBIR', 'Log keluar dari Portal Pentadbir');
  fetchLiveGoogleSheetData(false);
}

function renderAdminPortal() {
  if (!AppState.adminLoggedIn) {
    openModal('adminLoginModal');
    return;
  }

  renderAdminLeaderboard();
  renderStaffStatusTable();
  renderAwardsManagement();
  renderAdminLogs();
  renderGoogleSheetConfig();
}

function renderAdminLeaderboard() {
  const container = document.getElementById('adminLeaderboardContainer');
  if (!container) return;

  const votesCountByCat = {};

  AppState.votesDb.forEach(vote => {
    if (!votesCountByCat[vote.categoryId]) {
      votesCountByCat[vote.categoryId] = {};
    }
    votesCountByCat[vote.categoryId][vote.candidateName] = 
      (votesCountByCat[vote.categoryId][vote.candidateName] || 0) + 1;
  });

  // Gabungkan gasLiveResults jika ada
  if (AppState.gasLiveResults) {
    for (const cId in AppState.gasLiveResults) {
      if (!votesCountByCat[cId]) votesCountByCat[cId] = {};
      for (const cand in AppState.gasLiveResults[cId]) {
        votesCountByCat[cId][cand] = Math.max(
          votesCountByCat[cId][cand] || 0,
          AppState.gasLiveResults[cId][cand]
        );
      }
    }
  }

  let html = '';

  AppState.awards.forEach(award => {
    html += `
      <div class="leaderboard-award-card">
        <div class="leaderboard-award-header">
          <h3 class="leaderboard-award-title">
            <i class="fas fa-trophy" style="color: var(--gold-light); margin-right: 0.5rem;"></i>
            ${escapeHtml(award.title)}
          </h3>
          <span style="font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(award.purpose)}</span>
        </div>

        ${award.categories.map(cat => {
          const catVotes = votesCountByCat[cat.id] || {};
          let totalCatVotes = 0;
          Object.values(catVotes).forEach(c => totalCatVotes += c);

          const candidateRanking = cat.candidates.map(candidateName => {
            const count = catVotes[candidateName] || 0;
            const percent = totalCatVotes > 0 ? Math.round((count / totalCatVotes) * 100) : 0;
            return {
              name: candidateName,
              count: count,
              percent: percent
            };
          }).sort((a, b) => b.count - a.count);

          return `
            <div class="leaderboard-subcat-block">
              <div class="leaderboard-subcat-title">
                <span><i class="fas fa-layer-group"></i> ${escapeHtml(cat.name)}</span>
                <span style="font-size: 0.85rem; color: var(--gold-light);">Jumlah Undi: ${totalCatVotes}</span>
              </div>

              <div class="ranked-candidate-list">
                ${candidateRanking.slice(0, 10).map((cand, idx) => {
                  let rankClass = 'rank-other';
                  if (cand.count > 0) {
                    if (idx === 0) rankClass = 'rank-1';
                    else if (idx === 1) rankClass = 'rank-2';
                    else if (idx === 2) rankClass = 'rank-3';
                  }

                  return `
                    <div class="ranked-candidate-row ${rankClass}">
                      <div class="rank-badge">
                        ${idx === 0 && cand.count > 0 ? '🥇' : idx === 1 && cand.count > 0 ? '🥈' : idx === 2 && cand.count > 0 ? '🥉' : '#' + (idx + 1)}
                      </div>
                      <div class="ranked-details">
                        <div class="ranked-name-bar">
                          <span class="ranked-name">${escapeHtml(cand.name)}</span>
                          <span class="ranked-votes-count">${cand.count} Undi (${cand.percent}%)</span>
                        </div>
                        <div class="ranked-progress-bg">
                          <div class="ranked-progress-bar" style="width: ${cand.percent}%;"></div>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderStaffStatusTable() {
  const tbody = document.getElementById('staffTableBody');
  if (!tbody) return;

  const searchInput = document.getElementById('staffTableSearch');
  const roleFilter = document.getElementById('staffRoleFilter');
  const statusFilter = document.getElementById('staffStatusFilter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedRole = roleFilter ? roleFilter.value : 'all';
  const selectedStatus = statusFilter ? statusFilter.value : 'all';

  const voterVoteCounts = {};
  AppState.votesDb.forEach(vote => {
    const c = cleanIC(vote.ic);
    voterVoteCounts[c] = (voterVoteCounts[c] || 0) + 1;
  });

  let totalCategories = 0;
  AppState.awards.forEach(a => {
    if (a.active) totalCategories += a.categories.length;
  });

  let filteredStaff = STAFF_LIST.filter(s => {
    const nameMatch = s.name.toLowerCase().includes(query) || s.ic.includes(query);
    const roleMatch = selectedRole === 'all' || s.role === selectedRole;
    
    const count = voterVoteCounts[cleanIC(s.ic)] || 0;
    let statusMatch = true;
    if (selectedStatus === 'voted') statusMatch = count > 0;
    if (selectedStatus === 'unvoted') statusMatch = count === 0;
    if (selectedStatus === 'complete') statusMatch = count === totalCategories;

    return nameMatch && roleMatch && statusMatch;
  });

  tbody.innerHTML = filteredStaff.map((staff, idx) => {
    const count = voterVoteCounts[cleanIC(staff.ic)] || 0;
    const isComplete = count >= totalCategories;
    const isVoted = count > 0;

    return `
      <tr>
        <td>${idx + 1}</td>
        <td><code>${staff.ic}</code></td>
        <td><strong>${escapeHtml(staff.name)}</strong></td>
        <td><span class="voter-role-badge ${staff.role === 'Staff Admin' ? 'admin' : 'pensyarah'}">${staff.role}</span></td>
        <td>${staff.gender}</td>
        <td><strong>${count}</strong> / ${totalCategories} kat</td>
        <td>
          ${isComplete ? `
            <span style="color: #34d399; font-weight: 700;"><i class="fas fa-check-double"></i> Selesai Semua</span>
          ` : isVoted ? `
            <span style="color: #fbbf24; font-weight: 600;"><i class="fas fa-hourglass-half"></i> Sebahagian (${count})</span>
          ` : `
            <span style="color: #fca5a5;"><i class="fas fa-times-circle"></i> Belum Undi</span>
          `}
        </td>
        <td>
          ${isVoted ? `
            <button class="btn-admin-action danger" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;" onclick="confirmResetVoter('${staff.ic}', '${escapeHtml(staff.name)}')">
              <i class="fas fa-undo"></i> Reset Undian
            </button>
          ` : `
            <span style="color: var(--text-muted); font-size: 0.78rem;">-</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function confirmResetVoter(ic, name) {
  if (confirm(`Adakah anda pasti ingin memadam semua undian untuk ${name} (No. IC: ${ic})?\nStaf ini boleh mengundi semula selepas dipadam.`)) {
    const clean = cleanIC(ic);
    AppState.votesDb = AppState.votesDb.filter(v => cleanIC(v.ic) !== clean);

    if (AppState.currentVoter && cleanIC(AppState.currentVoter.ic) === clean) {
      AppState.votedCategories = {};
    }

    addLog('RESET_UNDIAN_STAF', 'ADMIN', `Memadamkan undian staf ${name} (${ic})`);
    saveState();
    renderAll();
    renderAdminPortal();
    showToast(`Undian untuk ${name} berjaya diresetkan!`, 'success');
  }
}

function renderAwardsManagement() {
  const container = document.getElementById('adminAwardsManageContainer');
  if (!container) return;

  container.innerHTML = AppState.awards.map((award, aIdx) => `
    <div style="background: rgba(9, 19, 36, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 0.85rem;">
        <div>
          <h4 style="color: #ffffff; font-size: 1.15rem;">#${award.bil}: ${escapeHtml(award.title)}</h4>
          <span style="color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(award.purpose)}</span>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <span style="font-size: 0.82rem; color: ${award.active ? '#34d399' : '#fca5a5'};">
            ${award.active ? 'Status: AKTIF' : 'Status: DITUTUP'}
          </span>
          <button class="btn-admin-action" onclick="toggleAwardActive(${aIdx})">
            ${award.active ? 'Tutup Undian' : 'Buka Undian'}
          </button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.85rem;">
        ${award.categories.map((cat, cIdx) => `
          <div style="background: rgba(15, 29, 53, 0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <strong style="color: var(--gold-light); font-size: 0.88rem;">${escapeHtml(cat.name)}</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${cat.candidates.length} calon</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Peranan Sasaran: ${cat.targetRole}
            </div>
            <button class="btn-admin-action" style="margin-top: 0.6rem; padding: 0.25rem 0.65rem; font-size: 0.75rem; width: 100%; justify-content: center;" onclick="editCategoryCandidates('${award.id}', '${cat.id}')">
              <i class="fas fa-users-cog"></i> Urus Senarai Calon
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function toggleAwardActive(awardIndex) {
  AppState.awards[awardIndex].active = !AppState.awards[awardIndex].active;
  saveState();
  renderAll();
  renderAdminPortal();
  showToast(`Status undian ${AppState.awards[awardIndex].title} dikemaskini.`, 'info');
}

function editCategoryCandidates(awardId, categoryId) {
  const award = AppState.awards.find(a => a.id === awardId);
  const cat = award ? award.categories.find(c => c.id === categoryId) : null;
  if (!cat) return;

  const currentList = cat.candidates.join('\n');
  const newList = prompt(`Senarai calon bagi "${cat.name}" (Satu nama per baris):`, currentList);

  if (newList !== null) {
    const updated = newList.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    if (updated.length > 0) {
      cat.candidates = updated;
      saveState();
      renderAll();
      renderAdminPortal();
      showToast(`Senarai calon ${cat.name} berjaya dikemaskini!`, 'success');
      addLog('KEMASKINI_CALON', 'ADMIN', `Mengemaskini calon ${cat.name}`);
    } else {
      showToast('Senarai calon tidak boleh kosong!', 'error');
    }
  }
}

function renderAdminLogs() {
  const container = document.getElementById('adminLogsList');
  if (!container) return;

  container.innerHTML = AppState.systemLogs.map(log => `
    <div style="padding: 0.65rem 0.85rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.82rem; display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
      <div>
        <span style="color: var(--gold-light); font-weight: 600;">[${log.action}]</span>
        <span style="color: #ffffff; margin-left: 0.4rem;">${escapeHtml(log.detail)}</span>
      </div>
      <div style="color: var(--text-muted); font-size: 0.78rem;">
        ${log.user} | ${log.time}
      </div>
    </div>
  `).join('');
}

function renderGoogleSheetConfig() {
  const input = document.getElementById('googleAppsScriptUrlInput');
  if (input) {
    input.value = AppState.gasUrl;
  }
}

function saveGoogleSheetUrl() {
  const input = document.getElementById('googleAppsScriptUrlInput');
  if (!input) return;

  const url = input.value.trim();
  AppState.gasUrl = url || DEFAULT_GAS_URL;
  localStorage.setItem(STORAGE_KEYS.GAS_URL, AppState.gasUrl);
  showToast('URL Google Apps Script disimpan dan disambungkan!', 'success');
  addLog('KEMASKINI_CONFIG', 'ADMIN', 'URL Google Apps Script dikemaskini');
  fetchLiveGoogleSheetData(true);
}

/**
 * 12. EKSPORT KEPUTUSAN KE CSV & CETAK LAPORAN
 */
function exportResultsToCSV() {
  if (AppState.votesDb.length === 0) {
    showToast('Tiada rekod undian untuk dieksport!', 'info');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Timestamp,No IC,Nama Pengundi,Kategori Staf,Jantina,ID Anugerah,Nama Anugerah,ID Kategori,Nama Kategori,Calon Dipilih\n';

  AppState.votesDb.forEach(v => {
    const row = [
      `"${v.displayTime || v.timestamp}"`,
      `"${v.ic}"`,
      `"${v.voterName.replace(/"/g, '""')}"`,
      `"${v.role}"`,
      `"${v.gender || ''}"`,
      `"${v.awardId}"`,
      `"${v.awardTitle.replace(/"/g, '""')}"`,
      `"${v.categoryId}"`,
      `"${v.categoryName.replace(/"/g, '""')}"`,
      `"${v.candidateName.replace(/"/g, '""')}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Keputusan_Undian_SUAS_KKS_2026_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Fail CSV berjaya dimuat turun!', 'success');
  addLog('EKSPORT_CSV', 'ADMIN', 'Eksport laporan undian ke CSV');
}

function printOfficialReport() {
  window.print();
}

/**
 * 13. GENERATE DATA DEMO UNTUK UJIAN SISTEM
 */
function generateDemoData() {
  if (!confirm('Adakah anda ingin menjana simulasi undian daripada 45 staf untuk demonstrasi sistem, leaderboard dan carta Top 3?')) {
    return;
  }

  const shuffledStaff = [...STAFF_LIST].sort(() => 0.5 - Math.random()).slice(0, 45);

  shuffledStaff.forEach(staff => {
    AppState.awards.forEach(award => {
      award.categories.forEach(cat => {
        const randomCandidate = cat.candidates[Math.floor(Math.random() * cat.candidates.length)];
        
        const existing = AppState.votesDb.find(v => cleanIC(v.ic) === cleanIC(staff.ic) && v.categoryId === cat.id);
        if (!existing) {
          AppState.votesDb.push({
            id: 'v_demo_' + Math.random().toString(36).substr(2, 6),
            timestamp: new Date().toISOString(),
            displayTime: new Date().toLocaleString('ms-MY'),
            ic: staff.ic,
            voterName: staff.name,
            role: staff.role,
            gender: staff.gender,
            awardId: award.id,
            awardTitle: award.title,
            categoryId: cat.id,
            categoryName: cat.name,
            candidateName: randomCandidate
          });

          if (!AppState.gasLiveResults[cat.id]) AppState.gasLiveResults[cat.id] = {};
          AppState.gasLiveResults[cat.id][randomCandidate] = (AppState.gasLiveResults[cat.id][randomCandidate] || 0) + 1;
        }
      });
    });
  });

  addLog('GENERATE_DEMO_DATA', 'ADMIN', 'Menjana data undian simulasi 45 staf');
  saveState();
  updateVoterRecordsFromDb();
  renderAll();
  renderAdminPortal();
  showToast('Data simulasi 45 staf berjaya dijana! Sila lihat kedudukan 3 calon tertinggi.', 'success');
}

function resetAllVotesData() {
  const code = prompt('AMARAN KESELAMATAN: Sila taip "RESET" untuk memadam keseluruhan data undian sistem:');
  if (code === 'RESET') {
    AppState.votesDb = [];
    AppState.votedCategories = {};
    AppState.selectedCandidates = {};
    AppState.gasLiveResults = {};
    saveState();
    renderAll();
    renderAdminPortal();
    showToast('Semua data undian telah dipadamkan.', 'info');
    addLog('RESET_SEMUA_UNDIAN', 'ADMIN', 'Keseluruhan data undian dipadamkan semula');
  }
}

/**
 * 14. MODALS & LIGHTBOX IMAGE PREVIEW
 */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function openImageLightbox(src, title) {
  const modal = document.getElementById('imageLightboxModal');
  const img = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');

  if (modal && img) {
    img.src = src;
    if (titleEl) titleEl.textContent = title;
    modal.classList.add('active');
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-triangle';

  toast.innerHTML = `
    <i class="fas ${icon} toast-icon"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * 15. NAVIGATION & TABS
 */
function switchPage(pageName) {
  const sections = document.querySelectorAll('.page-section');
  sections.forEach(sec => sec.classList.remove('active'));

  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  const targetSec = document.getElementById(`page_${pageName}`);
  if (targetSec) targetSec.classList.add('active');

  const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  if (pageName === 'dashboard') {
    renderDashboard();
  }
  if (pageName === 'admin') {
    renderAdminPortal();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setAwardFilter(filterName) {
  AppState.activeFilter = filterName;

  const btns = document.querySelectorAll('.filter-tab-btn');
  btns.forEach(btn => btn.classList.remove('active'));

  const activeBtn = document.querySelector(`[data-filter="${filterName}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  renderAwardsGrid();
}

function switchAdminTab(tabName) {
  const tabs = document.querySelectorAll('.admin-tab-content');
  tabs.forEach(t => t.classList.remove('active'));

  const btns = document.querySelectorAll('.admin-tab-btn');
  btns.forEach(b => b.classList.remove('active'));

  const targetTab = document.getElementById(`admin_tab_${tabName}`);
  if (targetTab) targetTab.classList.add('active');

  const activeBtn = document.querySelector(`[data-admin-tab="${tabName}"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

function setupEventListeners() {
  const icInput = document.getElementById('modalIcInput');
  if (icInput) {
    icInput.addEventListener('input', (e) => {
      let val = cleanIC(e.target.value);
      if (val.length > 12) val = val.substring(0, 12);
      if (val.length > 8) {
        e.target.value = `${val.substring(0, 6)}-${val.substring(6, 8)}-${val.substring(8)}`;
      } else if (val.length > 6) {
        e.target.value = `${val.substring(0, 6)}-${val.substring(6)}`;
      } else {
        e.target.value = val;
      }
    });

    icInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        verifyVoterIC(icInput.value, true);
      }
    });
  }

  const adminPassInput = document.getElementById('adminPasswordInput');
  if (adminPassInput) {
    adminPassInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        attemptAdminLogin();
      }
    });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
