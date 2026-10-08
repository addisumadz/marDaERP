[CmdletBinding()]
param(
    [int]$Port = 9092,
    [switch]$WhatIf
)

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Searching for processes listening on port $Port..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
    Write-Host "[i] No process found listening on port $Port." -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Cyan
    return
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($procId in $pids) {
    if ($procId -eq 0) { continue }
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    $procName = if ($proc) { $proc.ProcessName } else { "Unknown" }
    $procPath = if ($proc) { $proc.Path } else { "N/A" }

    Write-Host "[*] Found process listening on port ${Port}:" -ForegroundColor Yellow
    Write-Host "    PID         : $procId" -ForegroundColor White
    Write-Host "    Name        : $procName" -ForegroundColor White
    Write-Host "    Path        : $procPath" -ForegroundColor DarkGray

    if ($WhatIf) {
        Write-Host "    [WhatIf] Would terminate process $procId ($procName)." -ForegroundColor Magenta
    } else {
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-Host "    [+] Successfully terminated PID $procId ($procName)." -ForegroundColor Green
        } catch {
            Write-Host "    [-] Failed to terminate PID $procId : $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "        Try running PowerShell as Administrator." -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Done." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
