$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Force TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$ua = 'WW2-Map/1.0 (schmidt@rhowerk.de)'
$headers = @{ 'User-Agent' = $ua }

# City definitions: [app_id, search_name, country_code, display_name_de]
$cities = @(
    @{ id='brest'; q='Brest'; cc='by'; name='Brest' },
    @{ id='smolensk'; q='Smolensk'; cc='ru'; name='Smolensk' },
    @{ id='kiev'; q='Kyiv'; cc='ua'; name='Kiew' },
    @{ id='leningrad'; q='Saint Petersburg'; cc='ru'; name='Leningrad' },
    @{ id='moscow'; q='Moscow'; cc='ru'; name='Moskau' },
    @{ id='sevastopol'; q='Sevastopol'; cc=''; name='Sewastopol' },
    @{ id='stalingrad'; q='Volgograd'; cc='ru'; name='Stalingrad' },
    @{ id='kharkov'; q='Kharkiv'; cc='ua'; name='Charkow' },
    @{ id='kursk'; q='Kursk'; cc='ru'; name='Kursk' },
    @{ id='budapest'; q='Budapest'; cc='hu'; name='Budapest' },
    @{ id='koenigsberg'; q='Kaliningrad'; cc='ru'; name='Koenigsberg' },
    @{ id='berlin'; q='Berlin'; cc='de'; name='Berlin' },
    @{ id='warsaw'; q='Warszawa'; cc='pl'; name='Warschau' },
    @{ id='minsk'; q='Minsk'; cc='by'; name='Minsk' },
    @{ id='vyazma'; q='Vyazma'; cc='ru'; name='Wjasma' }
)

$features = @()
$warnings = @()

foreach ($c in $cities) {
    Write-Host "==> $($c.id) / $($c.q)"
    $url = "https://nominatim.openstreetmap.org/search?q=$([uri]::EscapeDataString($c.q))&format=json&limit=10&addressdetails=1&extratags=1"
    if ($c.cc) { $url += "&countrycodes=$($c.cc)" }

    try {
        $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    } catch {
        Write-Host "  ERROR search: $_"
        $warnings += "$($c.id): search failed: $_"
        Start-Sleep -Milliseconds 1200
        continue
    }

    # Filter for relation + boundary + administrative
    $candidates = @($resp | Where-Object {
        $_.osm_type -eq 'relation' -and
        $_.class -eq 'boundary' -and
        $_.type -eq 'administrative'
    })

    if ($candidates.Count -eq 0) {
        # fallback: any relation with boundary class
        $candidates = @($resp | Where-Object {
            $_.osm_type -eq 'relation' -and
            ($_.class -eq 'boundary' -or $_.class -eq 'place')
        })
    }

    if ($candidates.Count -eq 0) {
        Write-Host "  No candidate found"
        $warnings += "$($c.id): no boundary relation found"
        Start-Sleep -Milliseconds 1200
        continue
    }

    # Show all candidates
    foreach ($cand in $candidates) {
        $admLevel = if ($cand.extratags -and $cand.extratags.admin_level) { $cand.extratags.admin_level } else { '?' }
        $dn = $cand.display_name
        if ($dn.Length -gt 80) { $dn = $dn.Substring(0, 80) }
        Write-Host "  cand: osm_id=$($cand.osm_id) admin=$admLevel type=$($cand.type) addrtype=$($cand.addresstype) display=$dn"
    }

    # Pick best: prefer admin_level=8 (city), then 6, then 4
    $best = $null
    foreach ($lvl in @('8','6','4','9','10')) {
        $match = @($candidates | Where-Object { $_.extratags -and $_.extratags.admin_level -eq $lvl }) | Select-Object -First 1
        if ($match) { $best = $match; break }
    }
    if (-not $best) { $best = $candidates[0] }

    $dn = $best.display_name
    if ($dn.Length -gt 80) { $dn = $dn.Substring(0, 80) }
    Write-Host "  PICKED: osm_id=$($best.osm_id) admin=$($best.extratags.admin_level) display=$dn"

    Start-Sleep -Milliseconds 1200

    # Lookup full geometry
    $lookupUrl = "https://nominatim.openstreetmap.org/lookup?osm_ids=R$($best.osm_id)&format=json&polygon_geojson=1&polygon_threshold=0.0005"
    try {
        $lookup = Invoke-RestMethod -Uri $lookupUrl -Headers $headers -Method Get
    } catch {
        Write-Host "  ERROR lookup: $_"
        $warnings += "$($c.id): lookup failed: $_"
        Start-Sleep -Milliseconds 1200
        continue
    }

    $geo = $lookup[0].geojson
    if (-not $geo) {
        Write-Host "  No geometry in lookup"
        $warnings += "$($c.id): no geometry returned"
        Start-Sleep -Milliseconds 1200
        continue
    }

    $feature = [ordered]@{
        type = 'Feature'
        properties = [ordered]@{
            id = $c.id
            name = $c.name
            osm_relation_id = [long]$best.osm_id
            osm_display_name = $best.display_name
            admin_level = $best.extratags.admin_level
        }
        geometry = $geo
    }

    $features += $feature
    Write-Host "  OK: geometry type=$($geo.type)"
    Start-Sleep -Milliseconds 1200
}

$out = [ordered]@{
    type = 'FeatureCollection'
    _meta = [ordered]@{
        source = 'OpenStreetMap via Nominatim'
        license = 'ODbL'
        generated = '2026-05-17'
        polygon_threshold = 0.0005
        note = 'admin_level=8 city boundaries (mostly modern). Anachronism (modern boundaries vs 1942) accepted.'
        warnings = $warnings
    }
    features = $features
}

$json = $out | ConvertTo-Json -Depth 100 -Compress
$outPath = 'C:\Users\WildC\OneDrive\Dokumente\GitHub\ww2-interactive-map\public\data\cities_boundaries.json'
[System.IO.File]::WriteAllText($outPath, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "Features written: $($features.Count)"
Write-Host "Warnings: $($warnings.Count)"
foreach ($w in $warnings) { Write-Host "  WARN: $w" }
$fi = Get-Item $outPath
Write-Host "File size: $([Math]::Round($fi.Length/1024, 1)) KB"
