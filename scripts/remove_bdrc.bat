@echo off
chcp 65001 >nul

:: 检查管理员权限
net session >nul 2>&1
if errorlevel 1 (
    echo 需要管理员权限，正在请求提升...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo 正在删除百度网盘右键菜单...
reg delete "HKEY_CLASSES_ROOT\Directory\shellex\ContextMenuHandlers\YunShellExt" /f >nul 2>&1
reg delete "HKEY_CLASSES_ROOT\*\shellex\ContextMenuHandlers\YunShellExt" /f >nul 2>&1

echo 删除完成！如未生效请重启资源管理器。
pause