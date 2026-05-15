$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Continue'
$headers = @{'User-Agent' = 'WWII-Map-Educational/1.0 (schmidt@rhowerk.de)'}

$cities = @(
    @{id='brest';        name='Brest';       query='Brest, Belarus'},
    @{id='smolensk';     name='Smolensk';    query='Smolensk, Russia'},
    @{id='kiev';         name='Kiew';        query='Kyiv, Ukraine'},
    @{id='leningrad';    name='Leningrad';   query='Saint Petersburg, Russia'},
    @{id='moscow';       name='Moskau';      query='Moscow, Russia'},
    @{id='sevastopol';   name='Sewastopol';  query='Sevastopol'},
    @{id='stalingrad';   name='Stalingrad';  query='Volgograd, Russia'},
    @{id='kharkov';      name='Charkow';     query='Kharkiv, Ukraine'},
    @{id='kursk';        name='Kursk';       query='Kursk, Russia'},
    @{id='budapest';     name='Budapest';    query='Budapest, Hungary'},
    @{id='koenigsberg';  name='Koenigsberg'; query='Kaliningrad, Russia'},
    @{id='berlin';       name='Berlin';      query='Berlin, Germany'},
    @{id='warsaw';       name='Warschau';    query='Warsaw, Poland'},
    @{id='minsk';        name='Minsk';       query='Minsk, Belarus'},
    @{id='vyazma';       name='Wjasma';      query='Vyazma, Russia'}
)

$results = @{}

foreach ($c in $cities) {
    $q = [System.Uri]::EscapeDataString($c.query)
    $url = "https://nominatim.openstreetmap.org/search?q=$q&format=geojson&polygon_geojson=1&limit=1"
    Write-Host "Fetching $($c.id)..."
    $ok = $false
    for ($try=1; $try -le 2; $try++) {
        try {
            $r = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 30
            $outPath = "c:\Users\WildC\OneDrive\Desktop\map\city_$($c.id).json"
            [System.IO.File]::WriteAllText($outPath, $r.Content, [System.Text.Encoding]::UTF8)
            $ok = $true
            Write-Host "  OK ($($r.Content.Length) bytes)"
            break
        } catch {
            Write-Host "  Try $try failed: $_"
            Start-Sleep -Seconds 2
        }
    }
    if (-not $ok) { Write-Host "  FAILED: $($c.id)" }
    Start-Sleep -Milliseconds 1200
}

Write-Host "Done."
