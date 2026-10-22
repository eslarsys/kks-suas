# SUAS KKS : SISTEM UNDIAN ANUGERAH SINERGI 2026
### KOLEJ KOMUNITI SEGAMAT

Sistem pengundian anugerah berasaskan Web Apps HTML responsif yang diintegrasikan dengan Google Sheets sebagai pangkalan data awan.

---

## 🌟 Ciri-Ciri Utama Sistem

1. **Header Banner Dinamik & Lebih Lebar (Scroll-Reactive & Parallax):**
   - Menggunakan banner rasmi SUAS KKS (`assets/banner.jpg`) dengan paparan ultra-lebar (*full-width*) tanpa crop.
   - Dilengkapi efek pergerakan dinamik semasa skrol (*scroll-reactive header* & *depth parallax*):
     * Semasa di bahagian atas: Banner berada dalam mod Hero yang megah, lebar, dan berkilau (*ambient gold shimmer*).
     * Semasa skrol ke bawah: Header bertukar menjadi bar navigasi kompak (*sleek sticky dock*) dengan efek kaca (*frosted glassmorphism*).
2. **Penyegerakan Google Sheets Secara Langsung (Real-Time Live API):**
   - Disambungkan secara automatik ke Web API Google Apps Script:
     `https://script.google.com/macros/s/AKfycbxp8sMbGQ90e0D7FgGvBtmQv5OHqAuJXBvtc3MwD9oCnu1XBjV39gg0ZqjMQsavVkXUYQ/exec`
   - Data undian dan status kehadiran disegerak secara langsung di latar belakang (*auto-polling* setiap 10 saat) dengan lencana penunjuk *● Real-Time Live Sync*.

3. **Paparan 3 Calon Undian Tertinggi (Top 3 Real-Time Leaderboard):**
   - Memaparkan terus 3 calon yang mendahului undian bagi setiap anugerah dan kategori:
     * 🥇 **Tempat 1** (Emas - Mendahului)
     * 🥈 **Tempat 2** (Perak)
     * 🥉 **Tempat 3** (Gangsa)
   - Dipaparkan pada setiap kad undian anugerah dan juga dalam bahagian khas di *Dashboard & Top 3*.
4. **Favicon Rasmi:**
   - Ikon trofi emas Kolej Komuniti Segamat (`assets/favicon.png`).
5. **Senarai 64 Staf Sah & Layak Mengundi:**
   - **49 Orang Staff Pensyarah**
   - **15 Orang Staff Admin**
   - **Jumlah Keseluruhan: 64 Orang Staf**
6. **Pengesahan No. Kad Pengenalan (IC) & Peraturan 1 Undi Sahaja:**
   - Staf wajib memasukkan No. IC untuk mengesahkan identiti.
   - Setiap staf **hanya boleh mengundi satu (1) kali bagi setiap kategori**.
   - Sistem mengunci (*lock*) kategori yang telah diundi dengan lencana hijau **"Sudah Mengundi"**.

5. **Pemisahan Kategori Calon Mengikut Peranan:**
   - Kategori Staff Admin hanya memaparkan calon-calon Admin.
   - Kategori Staff Pensyarah hanya memaparkan calon-calon Pensyarah.
   - Kategori Terbuka dibahagikan kepada Kategori Lelaki dan Kategori Perempuan mengikut lampiran.
6. **Dashboard Penyertaan Awam (Public Turnout Dashboard):**
   - Memaparkan peratusan kehadiran pengundi bagi setiap kategori secara langsung.
   - **Kawalan Kerahsiaan:** Keputusan markah undian calon adalah **SULIT** dan tidak dipaparkan kepada umum; hanya dipaparkan kepada Pentadbir.
7. **Portal Pentadbir (Admin Portal):**
   - Dilindungi kata laluan: **`kks@123`**.
   - **Leaderboard Langsung:** Memaparkan jumlah undian calon, kedudukan (🥇 Emas, 🥈 Perak, 🥉 Gangsa), serta bar peratusan undi.
   - **Pengurusan Calon & Anugerah:** Buka / tutup undian bagi anugerah tertentu dan kemaskini senarai calon.
   - **Jadual 64 Staf:** Semakan status undian setiap staf dengan fungsi *Reset Undian* staf jika diperlukan.
   - **Eksport Data CSV & Cetak Laporan:** Muat turun data undian lengkap ke format fail `.csv` atau cetak laporan rasmi.
   - **Simulasi Data Ujian (45 Staf):** Butang satu klik untuk menjana simulasi undian bagi demonstrasi majlis.
8. **Integrasi Google Sheets & Google Apps Script:**
   - Disediakan fail lengkap `Code.gs` / `google_apps_script.js` untuk mencipta spreadsheet pangkalan data automatik.

---

## 📁 Struktur Fail Projek

```text
suasin/
├── index.html               # Halaman web utama sistem SUAS KKS
├── styles.css               # Rekaan tema premium (Royal Navy & Radiant Gold)
├── app.js                   # Enjin logik undian, pengesahan IC & portal admin
├── data.js                  # Pangkalan data rasmi 64 staf dan konfigurasi 9 anugerah
├── Code.gs                  # Kod Google Apps Script untuk Google Sheets
├── google_apps_script.js    # Salinan kod Google Apps Script beserta dokumentasi
├── server.ps1               # Pelayan web tempatan (Local Web Server)
├── README.md                # Panduan penggunaan sistem
└── assets/                  # Grafik rasmi sistem
    ├── banner.jpg           # Banner rasmi SUAS KKS
    ├── favicon.png          # Ikon favico rasmi
    ├── award_never_say_no.jpg
    ├── award_bintang_harapan.jpg
    ├── award_penyelamat_keadaan.jpg
    ├── award_happy_go_lucky.jpg
    ├── award_paling_havoc.jpg
    ├── award_darah_kopi.jpg
    ├── award_acah_busy.jpg
    ├── award_hantu_pantry.jpg
    └── award_sukan_harapan.jpg
```

---

## 🚀 Cara Menjalankan Sistem Secara Tempatan (Localhost)

### Kaedah 1: Menggunakan Pelayan PowerShell (Disyorkan)
Buka PowerShell di dalam folder projek dan jalankan:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Buka pelayar web anda di: **`http://localhost:8080/`**

### Kaedah 2: Buka Terus Fail HTML
Klik dua kali pada fail `index.html` untuk membuka sistem secara terus dalam mana-mana pelayar web moden (Google Chrome, Microsoft Edge, Mozilla Firefox).

---

## 📊 Cara Menyambungkan ke Google Sheets (Pangkalan Data)

1. Buka Google Drive anda dan cipta **Google Spreadsheet baharu**.
2. Klik menu **Extensions (Sambungan) > Apps Script**.
3. Buka fail [Code.gs](file:///c:/Antigavity/suasin/Code.gs), salin semua kod di dalamnya, dan tampal ke dalam editor Google Apps Script.
4. Klik butang **Deploy (Guna) > New deployment (Gunakan baharu)** di bahagian atas kanan.
5. Tetapkan:
   - **Select type:** *Web app*
   - **Description:** *SUAS KKS API*
   - **Execute as:** *Me (Akaun Google anda)*
   - **Who has access:** *Anyone (Sesiapa sahaja)*
6. Klik **Deploy**, kemudian salin **Web app URL** yang terhasil (bermula dengan `https://script.google.com/macros/s/.../exec`).
7. Buka sistem SUAS KKS di pelayar web, klik **Portal Pentadbir** (kata laluan: `kks@123`), pergi ke tab **Tetapan Google Sheets**, masukkan URL tersebut dan klik **Simpan URL**.
8. Sistem kini berhubung secara terus dengan Google Sheet anda!

---

## 🔒 Maklumat Pentadbir (Admin Access)
- **Kata Laluan Admin:** `kks@123`
