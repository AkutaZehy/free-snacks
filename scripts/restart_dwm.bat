@echo off

echo Restarting Desktop Window Manager (DWM).
echo The screen will flicker briefly; this is normal.
echo.
set /p "confirm=Restart DWM? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo Restarting DWM...
taskkill /f /im dwm.exe >nul 2>&1
start dwm
echo DWM restarted.
pause
