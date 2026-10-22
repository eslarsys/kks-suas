New-Item -ItemType Directory -Force -Path 'assets'
if (Test-Path 'test_banner.jpg') {
    Move-Item -Force test_banner.jpg assets/banner.jpg
}

$files = @(
  @{ id='1VDpPCqnMgq-KY-Hs-MOwZbux8aD3A_On'; name='assets/favicon.png' },
  @{ id='1SIU-LpOTCM1HJh0Yhv7-TtJd5V4u5ruR'; name='assets/award_never_say_no.jpg' },
  @{ id='1bpMcmqHkNYLeQipI7zesVvbWQ0oEcsS4'; name='assets/award_bintang_harapan.jpg' },
  @{ id='1sax8R5l8mI0ZkTpuo_CqnZWchhDeZoYO'; name='assets/award_penyelamat_keadaan.jpg' },
  @{ id='1wcMBoDvOfY315cAhEqlbPTBV__OediLS'; name='assets/award_happy_go_lucky.jpg' },
  @{ id='1nR7YjyUaTs-Q9Q8fad89k6B1RbybEGrm'; name='assets/award_paling_havoc.jpg' },
  @{ id='1zzyZ_BqoloLIoySchuEQdxVhLVKA24Iw'; name='assets/award_darah_kopi.jpg' },
  @{ id='1mhcs0gz7hyvDdhnJ2uXwIauSFy8nUYPi'; name='assets/award_acah_busy.jpg' },
  @{ id='1cBD4HboMm6LV70GTstAdOQNl_vR5sK_G'; name='assets/award_hantu_pantry.jpg' },
  @{ id='1kcBYicAIPPyT6hwSPP8sA4OP16Iv_ROh'; name='assets/award_sukan_harapan.jpg' }
)

foreach ($f in $files) {
    Write-Host "Downloading $($f.name)..."
    try {
        Invoke-WebRequest -Uri "https://drive.google.com/uc?export=view&id=$($f.id)" -OutFile $f.name -TimeoutSec 30
    } catch {
        Write-Warning "Failed to download $($f.name): $_"
    }
}
Get-ChildItem assets | Select-Object Name, Length
