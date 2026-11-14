$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$base = 'https://free.e-pedagog6.com/2024/BZO7/files/page/'
$totalPages = 146

1..$totalPages | ForEach-Object {
    $n = $_
    $target = Join-Path $root "page-$n.jpg"
    if ((Test-Path -LiteralPath $target) -and ((Get-Item -LiteralPath $target).Length -gt 0)) { return }
    $url = "$base$n.jpg"
    for ($attempt = 0; $attempt -lt 3; $attempt++) {
        try {
            & curl.exe -fsSL --retry 2 -o $target $url
            if ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $target) -and ((Get-Item -LiteralPath $target).Length -gt 0)) {
                break
            }
            throw "curl exited with $LASTEXITCODE"
        } catch {
            if ($attempt -eq 2) { throw }
            Start-Sleep -Seconds 1
        }
    }
    if ($n % 20 -eq 0 -or $n -eq $totalPages) { Write-Output "Saved up to page $n" }
}

$missing = @(1..$totalPages | Where-Object {
    $p = Join-Path $root "page-$_.jpg"
    -not (Test-Path -LiteralPath $p) -or ((Get-Item -LiteralPath $p).Length -eq 0)
})
if ($missing.Count) { throw "Missing pages: $missing" }

$imgs = (1..$totalPages | ForEach-Object {
    "<img id=`"page-$_`" width=`"1240`" height=`"1654`" src=`"page-$_.jpg`" loading=`"lazy`" alt=`"Страница $_`">"
}) -join ''

$html = @"
<!doctype html><html lang="bg"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Биология и здравно образование — 7. клас</title><style>body{margin:0;background:#555;font-family:Arial}header{position:sticky;top:0;padding:12px;background:#fff;display:flex;align-items:center;gap:16px;flex-wrap:wrap;z-index:10;box-shadow:0 1px 5px #0002}img{display:block;width:min(100%,909px);height:auto;margin:16px auto;background:white;scroll-margin-top:var(--header-height,90px)}a{color:#1454a0}.back{display:inline-block;background:#e7eddf;color:#31583c;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:600}.back:hover{background:#dce8d1}.back:focus-visible{outline:3px solid #cf8b32;outline-offset:3px}header span{font-size:14px;color:#465345}</style><header><a class="back" href="../../../?grade=7&amp;subject=biology">← Обратно към уроците</a><span>Биология и здравно образование — 7. клас · $totalPages страници</span></header>$imgs<script>
const backLink = document.querySelector('.back');
const lessonId = new URLSearchParams(location.search).get('lesson');
if (/^[a-z0-9-]+$/.test(lessonId || '')) {
  const returnUrl = new URL(backLink.href);
  returnUrl.searchParams.set('lesson', lessonId);
  backLink.href = returnUrl.href;
  backLink.textContent = '← Обратно към урока';
}
const header = document.querySelector('header');
function updateHeaderSpace() {
  document.documentElement.style.setProperty('--header-height', (header.offsetHeight + 16) + 'px');
}
updateHeaderSpace();
new ResizeObserver(updateHeaderSpace).observe(header);
const target = /^#page-\d+$/.test(location.hash) ? document.getElementById(location.hash.slice(1)) : null;
if (target) {
  target.loading = 'eager';
  requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
}
</script></html>
"@

[IO.File]::WriteAllText((Join-Path $root 'index.html'), $html, [System.Text.UTF8Encoding]::new($false))
Write-Output "Verified all $totalPages pages; offline index.html ready."
