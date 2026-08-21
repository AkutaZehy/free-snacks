@echo off

:: Check admin rights
net session >nul 2>&1
if errorlevel 1 (
    echo Admin rights required, requesting elevation...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo Removing Baidu Netdisk context menu entries...
reg delete "HKEY_CLASSES_ROOT\Directory\shellex\ContextMenuHandlers\YunShellExt" /f >nul 2>&1
reg delete "HKEY_CLASSES_ROOT\*\shellex\ContextMenuHandlers\YunShellExt" /f >nul 2>&1

echo Done! If it does not take effect, restart Explorer.
pause
