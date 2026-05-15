$ErrorActionPreference = 'Stop'

$cities = @(
    @{id='brest';        name='Brest'},
    @{id='smolensk';     name='Smolensk'},
    @{id='kiev';         name='Kiew'},
    @{id='leningrad';    name='Leningrad'},
    @{id='moscow';       name='Moskau'},
    @{id='sevastopol';   name='Sewastopol'},
    @{id='stalingrad';   name='Stalingrad'},
    @{id='kharkov';      name='Charkow'},
    @{id='kursk';        name='Kursk'},
    @{id='budapest';     name='Budapest'},
    @{id='koenigsberg';  name='Koenigsberg'},
    @{id='berlin';       name='Berlin'},
    @{id='warsaw';       name='Warschau'},
    @{id='minsk';        name='Minsk'},
    @{id='vyazma';       name='Wjasma'}
)

function Get-RingArea {
    param($ring)
    $a = 0.0
    for ($i = 0; $i -lt $ring.Count - 1; $i++) {
        $a += ($ring[$i][0] * $ring[$i+1][1]) - ($ring[$i+1][0] * $ring[$i][1])
    }
    return [Math]::Abs($a) / 2.0
}

function Simplify-Ring {
    param($ring, $targetVerts = 40)
    # Drop duplicate closing for selection, re-add at end
    $open = $ring[0..($ring.Count - 2)]
    $n = $open.Count
    if ($n -le $targetVerts) {
        $result = @()
        foreach ($p in $open) { $result += ,@([double]$p[0], [double]$p[1]) }
        $result += ,@([double]$open[0][0], [double]$open[0][1])
        return $result
    }
    $step = $n / [double]$targetVerts
    $result = @()
    for ($i = 0; $i -lt $targetVerts; $i++) {
        $idx = [int][Math]::Floor($i * $step)
        if ($idx -ge $n) { $idx = $n - 1 }
        $p = $open[$idx]
        $result += ,@([double]$p[0], [double]$p[1])
    }
    # Close ring
    $result += ,@($result[0][0], $result[0][1])
    return $result
}

$script:inv = [System.Globalization.CultureInfo]::InvariantCulture
function Format-Coord {
    param($v)
    return ([double]$v).ToString('0.0000', $script:inv)
}

$lines = @()
$lines += "export const CITIES: { id: string; name: string; geometry: GeoJSON.Polygon }[] = ["

$summary = @()

foreach ($c in $cities) {
    $path = "c:\Users\WildC\OneDrive\Desktop\map\city_$($c.id).json"
    $raw = [System.IO.File]::ReadAllText($path)
    $obj = $raw | ConvertFrom-Json
    if (-not $obj.features -or $obj.features.Count -eq 0) {
        $summary += "$($c.id): no features"
        continue
    }
    $feat = $obj.features[0]
    $geom = $feat.geometry
    $type = $geom.type

    $outerRing = $null
    $note = ''

    if ($type -eq 'Polygon') {
        $outerRing = $geom.coordinates[0]
    } elseif ($type -eq 'MultiPolygon') {
        # Pick polygon with largest outer-ring area
        $best = $null
        $bestArea = -1
        foreach ($poly in $geom.coordinates) {
            $ring = $poly[0]
            $area = Get-RingArea $ring
            if ($area -gt $bestArea) {
                $bestArea = $area
                $best = $ring
            }
        }
        $outerRing = $best
        $note = 'multipolygon, kept largest'
    } elseif ($type -eq 'Point') {
        $lon = [double]$geom.coordinates[0]
        $lat = [double]$geom.coordinates[1]
        $r = 0.1
        $verts = 16
        $ring = @()
        for ($i = 0; $i -lt $verts; $i++) {
            $theta = 2 * [Math]::PI * $i / $verts
            $x = $lon + $r * [Math]::Cos($theta)
            $y = $lat + $r * [Math]::Sin($theta)
            $ring += ,@($x, $y)
        }
        $ring += ,@($ring[0][0], $ring[0][1])
        $outerRing = $ring
        $note = 'point fallback (circle ~0.1deg)'
    } else {
        $summary += "$($c.id): unsupported geom type $type"
        continue
    }

    # Ensure closed
    $first = $outerRing[0]
    $last = $outerRing[$outerRing.Count - 1]
    if ($first[0] -ne $last[0] -or $first[1] -ne $last[1]) {
        $outerRing += ,@($first[0], $first[1])
    }

    $simp = Simplify-Ring $outerRing 40

    # Build coordinate string
    $coordParts = @()
    foreach ($p in $simp) {
        $coordParts += "[$(Format-Coord $p[0]),$(Format-Coord $p[1])]"
    }
    $coordStr = $coordParts -join ','

    $lines += "  {"
    $lines += "    id: '$($c.id)',"
    $lines += "    name: '$($c.name)',"
    $lines += "    geometry: {"
    $lines += "      type: 'Polygon',"
    $lines += "      coordinates: [[$coordStr]]"
    $lines += "    }"
    $lines += "  },"

    if ($note) { $summary += "$($c.id): $note ($($simp.Count) verts)" }
}

$lines += "]"

$out = $lines -join "`n"
[System.IO.File]::WriteAllText("c:\Users\WildC\OneDrive\Desktop\map\cities_output.ts", $out, [System.Text.Encoding]::UTF8)

Write-Host "=== SUMMARY ==="
foreach ($s in $summary) { Write-Host $s }
Write-Host ""
Write-Host "Output size: $($out.Length) bytes"
