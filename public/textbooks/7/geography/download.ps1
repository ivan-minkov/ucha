$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$base = 'https://resource.klett.bg/epub/textbooks/b7geo/'
1..148 | ForEach-Object -Parallel {
    $n = $_
    $root = $using:root
    $base = $using:base
    $target = Join-Path $root "page-$n.svg"
    if (Test-Path -LiteralPath $target) { return }
    function Fetch([string]$url) {
        for ($attempt=0; $attempt -lt 3; $attempt++) {
            try { return Invoke-WebRequest -Uri $url -TimeoutSec 60 -ErrorAction Stop } catch { if ($attempt -eq 2) { throw } }
        }
    }
    $svg = [string](Fetch "$base$n.svg").Content
    $refs = [regex]::Matches($svg, '(?:xlink:)?href="([^"#][^"]*)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    foreach ($ref in $refs) {
        if ($ref.StartsWith('data:')) { continue }
        $uri = [uri]::new([uri]$base, $ref)
        if ($uri.Host -ne 'resource.klett.bg') { throw "Unexpected resource: $uri" }
        $result = Fetch $uri.AbsoluteUri
        $bytes = $result.RawContentStream.ToArray()
        $mime = switch ([IO.Path]::GetExtension($ref)) { '.jpg' {'image/jpeg'} '.jpeg' {'image/jpeg'} '.png' {'image/png'} '.svg' {'image/svg+xml'} default {'application/octet-stream'} }
        $svg = $svg.Replace('href="' + $ref + '"', 'href="data:' + $mime + ';base64,' + [Convert]::ToBase64String($bytes) + '"')
    }
    [IO.File]::WriteAllText($target, $svg)
    Write-Output "Saved page $n"
} -ThrottleLimit 4
$missing = @(1..148 | Where-Object { -not (Test-Path -LiteralPath (Join-Path $root "page-$_.svg")) })
if ($missing.Count) { throw "Missing pages: $missing" }
$html = '<!doctype html><html lang="bg"><meta charset="utf-8"><title>География и икономика — 7. клас</title><style>body{margin:0;background:#555;font-family:Arial}header{position:sticky;top:0;padding:12px;background:#fff}img{display:block;width:min(100%,909px);height:auto;margin:16px auto;background:white}a{color:#1454a0}</style><header>География и икономика — 7. клас · 148 страници · <a href="https://resource.klett.bg/epub/textbooks/b7geo/index.html?page=1">Източник: Klett</a></header>'
foreach ($n in 1..148) { $html += "<img src='page-$n.svg' loading='lazy' alt='Страница $n'>" }
$html += '</html>'
[IO.File]::WriteAllText((Join-Path $root 'index.html'), $html)
Write-Output 'Verified all 148 pages; offline index.html ready.'
