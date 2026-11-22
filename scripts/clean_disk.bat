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
echo    System Junk File Cleaner (classic)
echo ==========================================
echo.
echo The following items will be cleaned:
echo   - %systemdrive% junk: *.tmp *.mp *.log *.gid *.chk *.old
echo   - Recycle Bin: %systemdrive%\recycled
echo   - %windir% junk: *.bak, prefetch, temp
echo   - User cookies, recent items
echo   - Temporary Internet Files, Local Settings temp
echo.
echo Please close all running programs first.
echo.
set /p "confirm=Start cleaning? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

del /f /s /q %systemdrive%\*.tmp
del /f /s /q %systemdrive%\*._mp
del /f /s /q %systemdrive%\*.log
del /f /s /q %systemdrive%\*.gid
del /f /s /q %systemdrive%\*.chk
del /f /s /q %systemdrive%\*.old
del /f /s /q %systemdrive%\recycled\*.*
del /f /s /q %windir%\*.bak
del /f /s /q %windir%\prefetch\*.*
rd /s /q %windir%\temp & md %windir%\temp
del /f /q %userprofile%\cookies\*.*
del /f /q %userprofile%\recent\*.*
del /f /s /q "%userprofile%\Local Settings\Temporary Internet Files\*.*"
del /f /s /q "%userprofile%\Local Settings\Temp\*.*"
del /f /s /q "%userprofile%\recent\*.*"

echo.
echo ==========================================
echo Cleaning complete! System junk removed.
echo ==========================================
echo.
pause