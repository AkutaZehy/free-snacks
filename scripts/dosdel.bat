@echo off
chcp 65001 >nul
setlocal

if "%~1"=="" (
    echo 用法: dosdel.bat "文件或目录路径"
    echo.
    echo 支持删除：
    echo   - 长路径文件（^>260字符）
    echo   - DOS 保留名文件（NUL, LPT1 等）
    echo   - 权限受限的文件
    pause
    exit /b 1
)

if not exist "%~1" (
    echo 路径不存在: %~1
    pause
    exit /b 1
)

echo 正在获取完全控制权限...
icacls "%~1" /grant Everyone:F /t /c /q >nul 2>&1

echo 正在删除: %~1
del /f /a /q "\\?\%~1" 2>nul
rd /s /q "\\?\%~1" 2>nul

if exist "%~1" (
    echo.
    echo 删除失败，文件可能被其他程序占用
) else (
    echo.
    echo 已成功删除: %~1
)
pause