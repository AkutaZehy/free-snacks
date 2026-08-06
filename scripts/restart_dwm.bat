@echo off
chcp 65001 >nul

echo 即将重启桌面管理器（DWM）。
echo 屏幕会短暂闪烁，这是正常现象。
echo.
set /p "confirm=确认重启？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消
    pause
    exit /b 0
)

echo 正在重启 DWM...
taskkill /f /im dwm.exe >nul 2>&1
start dwm
echo DWM 已重启。
pause