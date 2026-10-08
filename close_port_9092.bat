@echo off
setlocal enabledelayedexpansion

set PORT=9092
if not "%~1"=="" set PORT=%~1

echo ================================================================
echo  Find and Close Port %PORT%
echo ================================================================
echo.

set FOUND=0
set KILLED_PIDS=,

for /f "tokens=5" %%a in ('netstat -ano -p tcp ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    set TARGET_PID=%%a
    if not "!TARGET_PID!"=="" if not "!TARGET_PID!"=="0" (
        echo !KILLED_PIDS! | findstr /C:",!TARGET_PID!," >nul 2>&1
        if errorlevel 1 (
            set FOUND=1
            set KILLED_PIDS=!KILLED_PIDS!!TARGET_PID!,
            echo [*] Found process listening on port %PORT%:
            echo     PID: !TARGET_PID!
            for /f "tokens=1 delims=," %%p in ('tasklist /FI "PID eq !TARGET_PID!" /FO CSV /NH 2^>nul') do (
                echo     Process Name: %%~p
            )
            echo     Terminating PID !TARGET_PID!...
            taskkill /F /PID !TARGET_PID! >nul 2>&1
            if !errorlevel! equ 0 (
                echo     [+] Successfully terminated PID !TARGET_PID!.
            ) else (
                echo     [-] Failed to terminate PID !TARGET_PID!. Try running this script as Administrator.
            )
            echo.
        )
    )
)

if %FOUND% equ 0 (
    echo [i] No active process found listening on port %PORT%.
    echo.
)

echo ================================================================
echo  Done.
echo ================================================================
if "%~2" neq "--nopause" pause
