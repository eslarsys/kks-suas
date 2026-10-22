/**
 * SUAS KKS : SISTEM UNDIAN ANUGERAH SINERGI 2026, KOLEJ KOMUNITI SEGAMAT
 * Senarai Rasmi 64 Staf & Konfigurasi 9 Anugerah
 */

// Senarai 64 Staf KKS (49 Pensyarah + 15 Admin)
const STAFF_LIST = [
  // --- 49 STAF PENSYARAH ---
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

  // --- 15 STAF ADMIN ---
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

// Helper pools of names
const ALL_STAFF_NAMES = STAFF_LIST.map(s => s.name);
const ADMIN_NAMES = STAFF_LIST.filter(s => s.role === 'Staff Admin').map(s => s.name);
const PENSYARAH_NAMES = STAFF_LIST.filter(s => s.role === 'Staff Pensyarah').map(s => s.name);

const ADMIN_LELAKI = STAFF_LIST.filter(s => s.role === 'Staff Admin' && s.gender === 'Lelaki').map(s => s.name);
const ADMIN_PEREMPUAN = STAFF_LIST.filter(s => s.role === 'Staff Admin' && s.gender === 'Perempuan').map(s => s.name);

const PENSYARAH_LELAKI = STAFF_LIST.filter(s => s.role === 'Staff Pensyarah' && s.gender === 'Lelaki').map(s => s.name);
const PENSYARAH_PEREMPUAN = STAFF_LIST.filter(s => s.role === 'Staff Pensyarah' && s.gender === 'Perempuan').map(s => s.name);

const SEMUA_LELAKI = STAFF_LIST.filter(s => s.gender === 'Lelaki').map(s => s.name);
const SEMUA_PEREMPUAN = STAFF_LIST.filter(s => s.gender === 'Perempuan').map(s => s.name);

// Senarai Calon Khas Rasmi Bagi Anugerah Bintang Harapan (Rookie of the Year) - 23 Orang Staf
const ROOKIE_LELAKI = [
  'WAN AHMAD BISHRUL HAFIY BIN WAN ABDUL GHANI',
  'IRMAN FAREED BIN KADIR',
  'SAHARUDDIN BIN EDRIS',
  'Ts. AMIER HAFIZUN BIN AB RASHID',
  'NURUL IDZUAN BIN JAMAL',
  'AHMAD RAZIF BIN ABDUL HAMID',
  'BASRI BIN SENIN',
  'TS.DR. AZIZUL BIN MOHD YUSOFF',
  'MOHD FADLI BIN AHDON',
  'MUHAMMAD ADIB NIDZAMI BIN RAMLI'
];

const ROOKIE_PEREMPUAN = [
  'NOR AZLEENY BINTI ABD ZIZ',
  'NAZRA BINTI ISMAIL',
  'FADILAH BINTI ABDUL MANAP',
  'NORASHIKIN BINTI SAMAH',
  'NORMADIAH BINTI MOHAMAD',
  'SITI HAJJAR BINTI SARKOWI',
  'FAIZATUL NOOR BINTI ABU BAKAR',
  'NORASMAWATI BINTI MOHD NOR',
  'AISHAH BINTI JAIS',
  'NAZELIRA BINTI A. RAHIM',
  'NURULHUDA BINTI SALIM',
  'NUR UMIRA BINTI MUSTAPHA',
  'AIREEN NATHASYA BINTI AZLLY'
];

// Senarai 9 Anugerah dan Sub-Kategori Rasmi
const INITIAL_AWARDS = [
  {
    id: 'anugerah_1',
    bil: 1,
    title: 'Anugerah Never Say No',
    purpose: 'Diberikan kepada staf yang jarang menolak kerja',
    image: 'assets/award_never_say_no.jpg',
    driveLink: 'https://drive.google.com/file/d/1SIU-LpOTCM1HJh0Yhv7-TtJd5V4u5ruR/view?usp=drive_link',
    driveId: '1SIU-LpOTCM1HJh0Yhv7-TtJd5V4u5ruR',
    active: true,
    categories: [
      {
        id: 'nsn_admin',
        name: 'Kategori Staff Admin',
        targetRole: 'Staff Admin',
        candidates: [...ADMIN_NAMES]
      },
      {
        id: 'nsn_pensyarah',
        name: 'Kategori Staff Pensyarah',
        targetRole: 'Staff Pensyarah',
        candidates: [...PENSYARAH_NAMES]
      }
    ]
  },
  {
    id: 'anugerah_2',
    bil: 2,
    title: 'Anugerah Bintang Harapan (Rookie of the Year)',
    purpose: 'Dikhaskan untuk staf yang bekerja kurang dari 5 tahun yang menunjukkan potensi dan hasil kerja luar biasa',
    image: 'assets/award_bintang_harapan.jpg',
    driveLink: 'https://drive.google.com/file/d/1bpMcmqHkNYLeQipI7zesVvbWQ0oEcsS4/view?usp=drive_link',
    driveId: '1bpMcmqHkNYLeQipI7zesVvbWQ0oEcsS4',
    active: true,
    categories: [
      {
        id: 'rookie_lelaki',
        name: 'Open Semua - Kategori Lelaki',
        targetRole: 'Semua',
        candidates: [...ROOKIE_LELAKI]
      },
      {
        id: 'rookie_perempuan',
        name: 'Open Semua - Kategori Perempuan',
        targetRole: 'Semua',
        candidates: [...ROOKIE_PEREMPUAN]
      }
    ]
  },
  {
    id: 'anugerah_3',
    bil: 3,
    title: 'Anugerah Penyelamat Keadaan',
    purpose: 'Staf yang selalu menjadi tempat rujukan kawan-kawan untuk menyelesaikan segala permasalahan',

    image: 'assets/award_penyelamat_keadaan.jpg',
    driveLink: 'https://drive.google.com/file/d/1sax8R5l8mI0ZkTpuo_CqnZWchhDeZoYO/view?usp=drive_link',
    driveId: '1sax8R5l8mI0ZkTpuo_CqnZWchhDeZoYO',
    active: true,
    categories: [
      {
        id: 'penyelamat_admin_l',
        name: 'Staff Admin - Kategori Lelaki',
        targetRole: 'Staff Admin',
        candidates: [...ADMIN_LELAKI]
      },
      {
        id: 'penyelamat_admin_p',
        name: 'Staff Admin - Kategori Perempuan',
        targetRole: 'Staff Admin',
        candidates: [...ADMIN_PEREMPUAN]
      },
      {
        id: 'penyelamat_pensyarah_l',
        name: 'Staff Pensyarah - Kategori Lelaki',
        targetRole: 'Staff Pensyarah',
        candidates: [...PENSYARAH_LELAKI]
      },
      {
        id: 'penyelamat_pensyarah_p',
        name: 'Staff Pensyarah - Kategori Perempuan',
        targetRole: 'Staff Pensyarah',
        candidates: [...PENSYARAH_PEREMPUAN]
      }
    ]
  },
  {
    id: 'anugerah_4',
    bil: 4,
    title: 'Anugerah Happy Go Lucky',
    purpose: 'Staf yang sentiasa ceria, positif, suka senyum dan pandai menghidupkan suasana di tempat kerja',
    image: 'assets/award_happy_go_lucky.jpg',
    driveLink: 'https://drive.google.com/file/d/1wcMBoDvOfY315cAhEqlbPTBV__OediLS/view?usp=drive_link',
    driveId: '1wcMBoDvOfY315cAhEqlbPTBV__OediLS',
    active: true,
    categories: [
      {
        id: 'happy_lelaki',
        name: 'Open Semua - Kategori Lelaki',
        targetRole: 'Semua',
        candidates: [...SEMUA_LELAKI]
      },
      {
        id: 'happy_perempuan',
        name: 'Open Semua - Kategori Perempuan',
        targetRole: 'Semua',
        candidates: [...SEMUA_PEREMPUAN]
      }
    ]
  },
  {
    id: 'anugerah_5',
    bil: 5,
    title: 'Anugerah Staf Paling Havoc',
    purpose: 'Staf admin yang banyak membantu dan meringankan urusan kerja di KKS',
    image: 'assets/award_paling_havoc.jpg',
    driveLink: 'https://drive.google.com/file/d/1nR7YjyUaTs-Q9Q8fad89k6B1RbybEGrm/view?usp=sharing',
    driveId: '1nR7YjyUaTs-Q9Q8fad89k6B1RbybEGrm',
    active: true,
    categories: [
      {
        id: 'havoc_admin_l',
        name: 'Staff Admin - Kategori Lelaki',
        targetRole: 'Staff Admin',
        candidates: [...ADMIN_LELAKI]
      },
      {
        id: 'havoc_admin_p',
        name: 'Staff Admin - Kategori Perempuan',
        targetRole: 'Staff Admin',
        candidates: [...ADMIN_PEREMPUAN]
      }
    ]
  },
  {
    id: 'anugerah_6',
    bil: 6,
    title: 'Anugerah Darah Kopi Konsisten',
    purpose: 'Staf yang kelihatan tidak bermaya atau tidak boleh diajak berbincang selagi belum ngopi',
    image: 'assets/award_darah_kopi.jpg',
    driveLink: 'https://drive.google.com/file/d/1zzyZ_BqoloLIoySchuEQdxVhLVKA24Iw/view?usp=drive_link',
    driveId: '1zzyZ_BqoloLIoySchuEQdxVhLVKA24Iw',
    active: true,
    categories: [
      {
        id: 'kopi_lelaki',
        name: 'Open Semua - Kategori Lelaki',
        targetRole: 'Semua',
        candidates: [...SEMUA_LELAKI]
      },
      {
        id: 'kopi_perempuan',
        name: 'Open Semua - Kategori Perempuan',
        targetRole: 'Semua',
        candidates: [...SEMUA_PEREMPUAN]
      }
    ]
  },
  {
    id: 'anugerah_7',
    bil: 7,
    title: 'Anugerah Acah-acah Busy',
    purpose: 'Staf yang kelihatan rajin dan berdedikasi dalam menjalankan setiap tugas yang diberikan',
    image: 'assets/award_acah_busy.jpg',
    driveLink: 'https://drive.google.com/file/d/1mhcs0gz7hyvDdhnJ2uXwIauSFy8nUYPi/view?usp=drive_link',
    driveId: '1mhcs0gz7hyvDdhnJ2uXwIauSFy8nUYPi',
    active: true,
    categories: [
      {
        id: 'busy_admin_l',
        name: 'Staff Admin - Kategori Lelaki',
        targetRole: 'Staff Admin',
        candidates: [...ADMIN_LELAKI]
      },
      {
        id: 'busy_admin_p',
        name: 'Staff Admin - Kategori Perempuan',
        targetRole: 'Staff Admin',
        candidates: [...ADMIN_PEREMPUAN]
      },
      {
        id: 'busy_pensyarah_l',
        name: 'Staff Pensyarah - Kategori Lelaki',
        targetRole: 'Staff Pensyarah',
        candidates: [...PENSYARAH_LELAKI]
      },
      {
        id: 'busy_pensyarah_p',
        name: 'Staff Pensyarah - Kategori Perempuan',
        targetRole: 'Staff Pensyarah',
        candidates: [...PENSYARAH_PEREMPUAN]
      }
    ]
  },
  {
    id: 'anugerah_8',
    bil: 8,
    title: 'Anugerah Hantu Pantry',
    purpose: 'Staf yang pantang dengar ada makanan percuma, sentiasa ada stok snek, atau paling rajin bancuh air di pantry pejabat',
    image: 'assets/award_hantu_pantry.jpg',
    driveLink: 'https://drive.google.com/file/d/1cBD4HboMm6LV70GTstAdOQNl_vR5sK_G/view?usp=drive_link',
    driveId: '1cBD4HboMm6LV70GTstAdOQNl_vR5sK_G',
    active: true,
    categories: [
      {
        id: 'pantry_lelaki',
        name: 'Open Semua - Kategori Lelaki',
        targetRole: 'Semua',
        candidates: [...SEMUA_LELAKI]
      },
      {
        id: 'pantry_perempuan',
        name: 'Open Semua - Kategori Perempuan',
        targetRole: 'Semua',
        candidates: [...SEMUA_PEREMPUAN]
      }
    ]
  },
  {
    id: 'anugerah_9',
    bil: 9,
    title: 'Anugerah Bintang Sukan Harapan',
    purpose: 'Khusus untuk staf yang mempunyai bakat terserlah dalam pelbagai jenis sukan',
    image: 'assets/award_sukan_harapan.jpg',
    driveLink: 'https://drive.google.com/file/d/1kcBYicAIPPyT6hwSPP8sA4OP16Iv_ROh/view?usp=drive_link',
    driveId: '1kcBYicAIPPyT6hwSPP8sA4OP16Iv_ROh',
    active: true,
    categories: [
      {
        id: 'sukan_lelaki',
        name: 'Open Semua - Kategori Lelaki',
        targetRole: 'Semua',
        candidates: [...SEMUA_LELAKI]
      },
      {
        id: 'sukan_perempuan',
        name: 'Open Semua - Kategori Perempuan',
        targetRole: 'Semua',
        candidates: [...SEMUA_PEREMPUAN]
      }
    ]
  }
];

// Banner & Favicon configurations
const SYSTEM_CONFIG = {
  appName: 'SUAS KKS : SISTEM UNDIAN ANUGERAH SINERGI 2026',
  appSubtitle: 'Kolej Komuniti Segamat',
  bannerUrl: 'assets/banner.jpg',
  bannerDriveId: '1ScN_qvfqXOiKn7ryTKoROLxK7V4VeDmh',
  faviconUrl: 'assets/favicon.png',
  faviconDriveId: '1VDpPCqnMgq-KY-Hs-MOwZbux8aD3A_On',
  adminPasswordDefault: 'kks@123',
  gasUrl: 'https://script.google.com/macros/s/AKfycbxp8sMbGQ90e0D7FgGvBtmQv5OHqAuJXBvtc3MwD9oCnu1XBjV39gg0ZqjMQsavVkXUYQ/exec',
  totalEligibleStaff: 64,
  totalPensyarah: 49,
  totalAdmin: 15
};

