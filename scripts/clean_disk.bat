@echo off
chcp 65001 >nul
setlocal

:: 检查管理员权限
net session >nul 2>&1
if errorlevel 1 (
    echo 需要管理员权限，正在请求提升...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ==========================================
echo         系统临时文件清理工具
echo ==========================================
echo.
echo 即将清理以下内容：
echo   - 用户临时文件
echo   - 系统临时文件
echo   - Edge/IE 缓存
echo   - 缩略图缓存
echo   - DirectX 着色器缓存
echo   - 崩溃转储文件
echo   - Windows Update 下载缓存
echo.
echo 请先关闭所有正在运行的程序。
echo.
set /p "confirm=确认开始清理？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消
    pause
    exit /b 0
)

set "count=0"

echo.
echo [1/8] 清理用户临时文件...
del /f /s /q "%TEMP%\*" >nul 2>&1
rd /s /q "%TEMP%" >nul 2>&1
md "%TEMP%" >nul 2>&1
set /a count+=1

echo [2/8] 清理系统临时文件...
del /f /s /q "%SYSTEMROOT%\Temp\*" >nul 2>&1
set /a count+=1

echo [3/8] 清理 Edge/IE 缓存...
del /f /s /q "%LOCALAPPDATA%\Microsoft\Windows\INetCache\*" >nul 2>&1
set /a count+=1

echo [4/8] 清理缩略图缓存...
del /f /s /q "%LOCALAPPDATA%\Microsoft\Windows\Explorer\thumbcache_*" >nul 2>&1
set /a count+=1

echo [5/8] 清理 DirectX 着色器缓存...
del /f /s /q "%LOCALAPPDATA%\D3DSCache\*" >nul 2>&1
set /a count+=1

echo [6/8] 清理崩溃转储文件...
del /f /s /q "%LOCALAPPDATA%\CrashDumps\*" >nul 2>&1
set /a count+=1

echo [7/8] 清理 Windows 错误报告...
del /f /s /q "%LOCALAPPDATA%\Microsoft\Windows\WER\*" >nul 2>&1
set /a count+=1

echo [8/8] 清理 Windows Update 下载缓存...
del /f /s /q "%SYSTEMROOT%\SoftwareDistribution\Download\*" >nul 2>&1
set /a count+=1

echo.
echo ==========================================
echo 清理完成！已处理 %count% 个类别。
echo ==========================================
echo.
pause