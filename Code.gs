// Lihat google_apps_script.js untuk dokumentasi lengkap
// Salin semua kod ini ke dalam Google Apps Script (Extensions > Apps Script)

const ADMIN_PASS = 'kks@123';
const SHEET_UNDIAN = 'Undian_Masuk';
const SHEET_STAF = 'Senarai_Staf';
const SHEET_LOG = 'Log_Sistem';

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetUndian = ss.getSheetByName(SHEET_UNDIAN) || ss.insertSheet(SHEET_UNDIAN);
  sheetUndian.clear();
  sheetUndian.appendRow([
    'Timestamp', 'No. Kad Pengenalan (IC)', 'Nama Pengundi', 'Kategori Staf',
    'ID Anugerah', 'Nama Anugerah', 'ID Subkategori', 'Nama Subkategori', 'Calon Yang Dipilih'
  ]);
  formatHeader(sheetUndian);

  let sheetStaf = ss.getSheetByName(SHEET_STAF) || ss.insertSheet(SHEET_STAF);
  sheetStaf.clear();
  sheetStaf.appendRow([
    'ID', 'No. IC', 'Nama Penuh', 'Kategori / Peranan', 'Jantina',
    'Jumlah Kategori Diundi', 'Status Keseluruhan', 'Waktu Undian Terakhir'
  ]);
  formatHeader(sheetStaf);

  const defaultStaff = getInitialStaffList();
  for (let i = 0; i < defaultStaff.length; i++) {
    const s = defaultStaff[i];
    sheetStaf.appendRow([s.id, s.ic, s.name, s.role, s.gender, 0, 'Belum Mengundi', '-']);
  }

  let sheetLog = ss.getSheetByName(SHEET_LOG) || ss.insertSheet(SHEET_LOG);
  sheetLog.clear();
  sheetLog.appendRow(['Timestamp', 'Tindakan', 'No. IC / Pengguna', 'Butiran']);
  formatHeader(sheetLog);
  sheetLog.appendRow([new Date(), 'SETUP_SISTEM', 'ADMIN', 'Pangkalan data SUAS KKS 2026 sedia digunakan']);

  SpreadsheetApp.flush();
}

function formatHeader(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#0f172a');
  headerRange.setFontColor('#fbbf24');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action || 'get_stats';

    // 1. Statistik Awam (Hanya bilangan pengundi bagi setiap kategori - TIADA keputusan calon / top 3)
    if (action === 'get_stats') {
      const stats = getPublicStats();
      return jsonResponse({ success: true, ...stats });
    }
    if (action === 'check_voter') {
      const ic = cleanIC(params.ic || '');
      return jsonResponse({ success: true, ...getVoterStatus(ic) });
    }
    // 2. Akses Pentadbir (Keputusan penuh dan Top 3 hanya dengan kata laluan admin)
    if (action === 'get_admin_data') {
      if ((params.password || '') !== ADMIN_PASS) {
        return jsonResponse({ success: false, error: 'Akses ditolak: Kata laluan admin salah!' });
      }
      const adminData = getFullAdminData();
      const top3 = getTop3Results();
      return jsonResponse({ success: true, ...adminData, top3ByCat: top3 });
    }
    return jsonResponse({ success: true, message: 'SUAS KKS API Aktif' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}


/**
 * Kira 3 Calon Tertinggi Bagi Setiap Kategori
 */
function getTop3Results() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUndian = ss.getSheetByName(SHEET_UNDIAN);
  if (!sheetUndian) return {};

  const rows = sheetUndian.getDataRange().getValues();
  const catTallies = {};

  for (let i = 1; i < rows.length; i++) {
    const catId = rows[i][6];
    const candidate = rows[i][8];
    if (catId && candidate) {
      if (!catTallies[catId]) catTallies[catId] = {};
      catTallies[catId][candidate] = (catTallies[catId][candidate] || 0) + 1;
    }
  }

  const top3 = {};
  for (const catId in catTallies) {
    const sorted = Object.keys(catTallies[catId]).map(cand => ({
      name: cand,
      count: catTallies[catId][cand]
    })).sort((a, b) => b.count - a.count);

    top3[catId] = sorted.slice(0, 3);
  }
  return top3;
}


function doPost(e) {
  try {
    let postData = {};
    if (e.postData && e.postData.contents) {
      try { postData = JSON.parse(e.postData.contents); } catch (ex) { postData = e.parameter || {}; }
    } else {
      postData = e.parameter || {};
    }

    const action = postData.action || 'submit_vote';

    if (action === 'submit_vote') {
      const ic = cleanIC(postData.ic || '');
      const voterName = postData.name || '';
      const voterRole = postData.role || '';
      const votes = postData.votes || [];

      if (!ic) return jsonResponse({ success: false, error: 'No IC diperlukan!' });

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheetUndian = ss.getSheetByName(SHEET_UNDIAN);
      const sheetStaf = ss.getSheetByName(SHEET_STAF);
      const sheetLog = ss.getSheetByName(SHEET_LOG);

      const staffRowIndex = findStaffRowByIC(sheetStaf, ic);
      if (staffRowIndex === -1) {
        return jsonResponse({ success: false, error: 'No. IC ini tidak berdaftar dalam 64 staf yang layak!' });
      }

      const existingVotes = getVotedCategoriesForIC(sheetUndian, ic);
      const timestamp = new Date();
      let savedCount = 0;

      for (let i = 0; i < votes.length; i++) {
        const v = votes[i];
        if (!existingVotes.includes(v.categoryId) && v.candidateName) {
          sheetUndian.appendRow([
            timestamp, formatIC(ic), voterName, voterRole,
            v.awardId, v.awardTitle, v.categoryId, v.categoryName, v.candidateName
          ]);
          existingVotes.push(v.categoryId);
          savedCount++;
        }
      }

      const currentVoteCount = existingVotes.length;
      sheetStaf.getRange(staffRowIndex, 6).setValue(currentVoteCount);
      sheetStaf.getRange(staffRowIndex, 7).setValue(currentVoteCount > 0 ? 'Telah Mengundi (' + currentVoteCount + ' kat)' : 'Belum Mengundi');
      sheetStaf.getRange(staffRowIndex, 8).setValue(timestamp);

      sheetLog.appendRow([timestamp, 'UNDIAN_MASUK', formatIC(ic), voterName + ' mengundi ' + savedCount + ' kategori baharu.']);

      return jsonResponse({
        success: true,
        message: 'Undian anda telah berjaya disimpan!',
        votedCategories: existingVotes,
        savedCount: savedCount
      });
    }

    if (action === 'admin_reset_voter') {
      if ((postData.password || '') !== ADMIN_PASS) {
        return jsonResponse({ success: false, error: 'Kata laluan salah!' });
      }
      resetVoterBallot(cleanIC(postData.targetIC || ''));
      return jsonResponse({ success: true, message: 'Undian staf berjaya dipadam.' });
    }

    return jsonResponse({ success: false, error: 'Tindakan tidak sah' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function getPublicStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUndian = ss.getSheetByName(SHEET_UNDIAN);
  const sheetStaf = ss.getSheetByName(SHEET_STAF);

  const stafData = sheetStaf.getDataRange().getValues();
  const totalStaff = 64;
  let totalVoted = 0, adminVoted = 0, pensyarahVoted = 0;

  for (let i = 1; i < stafData.length; i++) {
    const count = parseInt(stafData[i][5], 10) || 0;
    const role = stafData[i][3];
    if (count > 0) {
      totalVoted++;
      if (role === 'Staff Admin') adminVoted++; else pensyarahVoted++;
    }
  }

  const undianData = sheetUndian.getDataRange().getValues();
  const categoryTurnout = {};
  for (let j = 1; j < undianData.length; j++) {
    const catId = undianData[j][6];
    if (catId) categoryTurnout[catId] = (categoryTurnout[catId] || 0) + 1;
  }

  return {
    totalEligible: totalStaff,
    totalVoted: totalVoted,
    turnoutPercent: Math.round((totalVoted / totalStaff) * 100),
    adminVoted: adminVoted,
    adminTotal: 15,
    pensyarahVoted: pensyarahVoted,
    pensyarahTotal: 49,
    categoryTurnout: categoryTurnout
  };
}

function getVoterStatus(rawIc) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetStaf = ss.getSheetByName(SHEET_STAF);
  const sheetUndian = ss.getSheetByName(SHEET_UNDIAN);
  const ic = cleanIC(rawIc);
  const stafData = sheetStaf.getDataRange().getValues();

  let voter = null;
  for (let i = 1; i < stafData.length; i++) {
    if (cleanIC(stafData[i][1]) === ic) {
      voter = {
        id: stafData[i][0], ic: stafData[i][1], name: stafData[i][2],
        role: stafData[i][3], gender: stafData[i][4],
        votedCount: stafData[i][5], status: stafData[i][6], lastVote: stafData[i][7]
      };
      break;
    }
  }

  if (!voter) return { eligible: false, message: 'No. IC tidak dijumpai dalam senarai 64 staf yang layak.' };

  const votedCategories = getVotedCategoriesForIC(sheetUndian, ic);
  return { eligible: true, voter: voter, votedCategories: votedCategories };
}

function getFullAdminData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUndian = ss.getSheetByName(SHEET_UNDIAN);
  const sheetStaf = ss.getSheetByName(SHEET_STAF);
  const sheetLog = ss.getSheetByName(SHEET_LOG);

  const undianRows = sheetUndian.getDataRange().getValues();
  const resultsByCat = {};
  const allVotesLog = [];

  for (let i = 1; i < undianRows.length; i++) {
    const row = undianRows[i];
    const catId = row[6];
    const candidate = row[8];

    allVotesLog.push({
      time: row[0], ic: row[1], voterName: row[2], role: row[3],
      awardTitle: row[5], catName: row[7], candidate: candidate
    });

    if (catId && candidate) {
      if (!resultsByCat[catId]) resultsByCat[catId] = {};
      resultsByCat[catId][candidate] = (resultsByCat[catId][candidate] || 0) + 1;
    }
  }

  const stafRows = sheetStaf.getDataRange().getValues();
  const staffStatusList = [];
  for (let j = 1; j < stafRows.length; j++) {
    const r = stafRows[j];
    staffStatusList.push({
      id: r[0], ic: r[1], name: r[2], role: r[3], gender: r[4],
      votedCount: r[5], status: r[6], lastVote: r[7]
    });
  }

  const logRows = sheetLog.getDataRange().getValues();
  const logs = [];
  const startLog = Math.max(1, logRows.length - 50);
  for (let k = startLog; k < logRows.length; k++) {
    logs.push({ time: logRows[k][0], action: logRows[k][1], user: logRows[k][2], detail: logRows[k][3] });
  }

  return {
    resultsByCat: resultsByCat,
    staffStatusList: staffStatusList,
    allVotesLog: allVotesLog.reverse(),
    systemLogs: logs.reverse(),
    stats: getPublicStats()
  };
}

function getVotedCategoriesForIC(sheetUndian, cleanIc) {
  const data = sheetUndian.getDataRange().getValues();
  const voted = [];
  for (let i = 1; i < data.length; i++) {
    if (cleanIC(data[i][1]) === cleanIc) voted.push(data[i][6]);
  }
  return voted;
}

function findStaffRowByIC(sheetStaf, cleanIc) {
  const data = sheetStaf.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (cleanIC(data[i][1]) === cleanIc) return i + 1;
  }
  return -1;
}

function resetVoterBallot(cleanIc) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUndian = ss.getSheetByName(SHEET_UNDIAN);
  const sheetStaf = ss.getSheetByName(SHEET_STAF);
  const sheetLog = ss.getSheetByName(SHEET_LOG);

  const data = sheetUndian.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (cleanIC(data[i][1]) === cleanIc) sheetUndian.deleteRow(i + 1);
  }

  const staffRow = findStaffRowByIC(sheetStaf, cleanIc);
  if (staffRow !== -1) {
    sheetStaf.getRange(staffRow, 6).setValue(0);
    sheetStaf.getRange(staffRow, 7).setValue('Belum Mengundi');
    sheetStaf.getRange(staffRow, 8).setValue('-');
  }
  sheetLog.appendRow([new Date(), 'RESET_UNDIAN', formatIC(cleanIc), 'Pentadbir memadamkan undian']);
}

function cleanIC(ic) { return String(ic || '').replace(/[^0-9]/g, ''); }
function formatIC(ic) {
  const c = cleanIC(ic);
  return c.length === 12 ? c.substring(0, 6) + '-' + c.substring(6, 8) + '-' + c.substring(8, 12) : c;
}
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getInitialStaffList() {
  return [
    { id: 'p01', ic: '780827-04-5267', name: 'TS.DR. AZIZUL BIN MOHD YUSOFF', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p02', ic: '820620-01-5603', name: 'AHMAD RAZIF BIN ABDUL HAMID', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p03', ic: '820520-06-5101', name: 'Ts. RASYIDI BIN ABDULLAH', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p04', ic: '851222-01-5335', name: 'Ts. ABDUL FATAH BIN MAT SAID', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p05', ic: '830614-03-5041', name: 'Ts. AMIER HAFIZUN BIN AB RASHID', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p06', ic: '810103-01-5972', name: 'ANITA A/P SUPRAMANIAM', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p07', ic: '780531-04-5081', name: 'BASRI BIN SENIN', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p08', ic: '840106-01-5238', name: 'FARA ELLINA BINTI KHAIDZIR', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p09', ic: '841120-01-5474', name: 'FAIZATUL NOOR BINTI ABU BAKAR', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p10', ic: '830212-05-5373', name: 'FIRDAUS BIN BACHOK @ EMBOK WALANG', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p11', ic: '790627-01-5089', name: 'HAIRUL FAHMI BIN MD MUSLIM', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p12', ic: '710710-01-5861', name: 'IBARIHIM BIN HAMZAH', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p13', ic: '870717-01-5349', name: 'IBRAHIM BIN MOHD ARIF', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p14', ic: '901022-13-6805', name: 'IRMAN FAREED BIN KADIR', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p15', ic: '780204-01-6697', name: 'KHAIRUDIN BIN TAIB', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p16', ic: '761219-01-6493', name: 'KHAIRUL ANUAR BIN SELAMAT', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p17', ic: '770819-11-5190', name: 'LILINA BINTI MOHD', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p18', ic: '820204-01-5911', name: 'MASRIZAL BIN MAHMOOD', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p19', ic: '790520-01-6217', name: 'Ts. MOHD AZAHARUDDIN BIN MOHD NADZRI', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p20', ic: '761118-01-7083', name: 'MOHD AZAR BIN MOHAMAD', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p21', ic: '780718-01-6109', name: 'MOHD FADLI BIN AHDON', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p22', ic: '860127-33-5917', name: 'Ts. MOHD HISHAM BIN SIDI AHMAD', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p23', ic: '831021-05-5375', name: 'MOHD NOR ADZMIE BIN ISMAIL', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p24', ic: '780730-06-5595', name: 'MOHD ZUHAIDIR BIN ZAINI', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p25', ic: '930331-06-5185', name: 'MUHAMMAD ADIB NIDZAMI BIN RAMLI', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p26', ic: '931128-06-5539', name: 'MUHAMMAD SYAFIQ BIN SAIFUL BAHRI', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p27', ic: '800916-01-5380', name: 'MUHIDA BINTI MAHMOOD', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p28', ic: '760311-10-5558', name: 'Ts. NAZILA BINTI MASDOR', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p29', ic: '830617-04-5114', name: 'NAZELIRA BINTI A. RAHIM', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p30', ic: '830824-01-6500', name: 'NAZRA BINTI ISMAIL', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p31', ic: '801027-01-5932', name: 'NOOR HAZNIZA BINTI SUKRI', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p32', ic: '830325-01-5554', name: 'NOR RASIDA BINTI ABD RAHMAN', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p33', ic: '781220-04-5062', name: 'NORASHIKIN BINTI SAMAH', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p34', ic: '830424-01-5736', name: 'NORELES BINTI ALI', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p35', ic: '831126-04-5368', name: 'NORMAH BINTI AUYOB', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p36', ic: '831121-11-5136', name: 'NORMADIAH BINTI MOHAMAD', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p37', ic: '810601-05-5272', name: 'NORMALINI BINTI MOHD YASIN', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p38', ic: '860914-43-6864', name: 'NURAZRINA BINTI MOHAMMAD FAUDZI', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p39', ic: '791022-01-6198', name: 'NURULHUDA BINTI SALIM', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p40', ic: '850515-04-5330', name: 'NUR UMIRA BINTI MUSTAPHA', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p41', ic: '820215-01-5626', name: 'RUSNANI BINTI YAHYA', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p42', ic: '830616-01-6266', name: 'SAHIRDA BINTI ITHNAIN', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p43', ic: '790101-01-5092', name: 'SALASIAH BINTI AMIN', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p44', ic: '850907-01-5798', name: 'SITI HAJJAR BINTI SARKOWI', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p45', ic: '780105-01-6288', name: 'SITI NAZURA BINTI SENAN', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'p46', ic: '770117-05-5437', name: 'SUHAIMI BIN MOHD KHALID', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p47', ic: '790105-01-5233', name: 'SYED ARIES AMEER BIN SYED ABDUL KADIR', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p48', ic: '921213-10-5751', name: 'WAN AHMAD BISHRUL HAFIY BIN WAN ABDUL GHANI', role: 'Staff Pensyarah', gender: 'Lelaki' },
    { id: 'p49', ic: '880117-08-5684', name: 'YOKANA A/P VELIAPANDIAN', role: 'Staff Pensyarah', gender: 'Perempuan' },
    { id: 'a01', ic: '801215-01-5454', name: 'NORASMAWATI BINTI MOHD NOR', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a02', ic: '850323-11-5664', name: 'SITI SAIDATUL AKHMAL BINTI MOHD', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a03', ic: '980716-01-6590', name: 'AIREEN NATHASYA BINTI AZLLY', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a04', ic: '810524-03-5023', name: 'MOHD NORHISYAM BIN MOHD RAHIMI', role: 'Staff Admin', gender: 'Lelaki' },
    { id: 'a05', ic: '790906-01-5997', name: 'SAHARUDDIN BIN EDRIS', role: 'Staff Admin', gender: 'Lelaki' },
    { id: 'a06', ic: '861104-23-5467', name: 'NURUL IDZUAN BIN JAMAL', role: 'Staff Admin', gender: 'Lelaki' },
    { id: 'a07', ic: '830101-08-6134', name: 'ROZAINI BINTI ABD RAZAK', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a08', ic: '830523-14-6424', name: 'HARYANTI BINTI MOHD HAIRUDDIN', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a09', ic: '830423-01-5734', name: 'NOR AZLEENY BINTI ABD ZIZ', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a10', ic: '810127-01-5598', name: 'FADILAH BINTI ABDUL MANAP', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a11', ic: '831111-10-5954', name: 'NORWANI BINTI MAT YUSOFF', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a12', ic: '830820-01-6060', name: 'AISHAH BINTI JAIS', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a13', ic: '790913-01-6242', name: 'NORAINI BINTI RAZALI', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a14', ic: '810623-01-5992', name: 'NOR FAEZAH BINTI MOHAMMED', role: 'Staff Admin', gender: 'Perempuan' },
    { id: 'a15', ic: '840904-01-5427', name: 'HISSHAMUDDIN BIN IBRAHIM', role: 'Staff Admin', gender: 'Lelaki' }
  ];
}
