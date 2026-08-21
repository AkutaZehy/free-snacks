@echo off
setlocal

:: Check admin rights
net session >nul 2>&1
if errorlevel 1 (
    echo Admin rights required, requesting elevation...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ==========================================
echo         System Temp File Cleaner
echo ==========================================
echo.
echo The following items will be cleaned:
echo   - User temp files
echo   - System temp files
echo   - Edge/IE cache
echo   - Thumbnail cache
echo   - DirectX shader cache
echo   - Crash dumps
echo   - Windows Update download cache
echo.
echo Please close all running programs first.
echo.
set /p "confirm=Start cleaning? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

set "count=0"

echo.
echo [1/8] Cleaning user temp files...
del /f /s /q "%TEMP%\*" >nul 2>&1
rd /s /q "%TEMP%" >nul 2>&1
md "%TEMP%" >nul 2>&1
set /a count+=1

echo [2/8] Cleaning system temp files...
del /f /s /q "%SYSTEMROOT%\Temp\*" >nul 2>&1
set /a count+=1

echo [3/8] Cleaning Edge/IE cache...
del /f /s /q "%LOCALAPPDATA%\Microsoft\Windows\INetCache\*" >nul 2>&1
set /a count+=1

echo [4/8] Cleaning thumbnail cache...
del /f /s /q "%LOCALAPPDATA%\Microsoft\Windows\Explorer\thumbcache_*" >nul 2>&1
set /a count+=1

echo [5/8] Cleaning DirectX shader cache...
del /f /s /q "%LOCALAPPDATA%\D3DSCache\*" >nul 2>&1
set /a count+=1

echo [6/8] Cleaning crash dumps...
del /f /s /q "%LOCALAPPDATA%\CrashDumps\*" >nul 2>&1
set /a count+=1

echo [7/8] Cleaning Windows Error Reports...
del /f /s /q "%LOCALAPPDATA%\Microsoft\Windows\WER\*" >nul 2>&1
set /a count+=1

echo [8/8] Cleaning Windows Update download cache...
del /f /s /q "%SYSTEMROOT%\SoftwareDistribution\Download\*" >nul 2>&1
set /a count+=1

echo.
echo ==========================================
echo Cleaning complete! Processed %count% categories.
echo ==========================================
echo.
pause
