@echo off
chcp 65001 >nul

:: 检查管理员权限
net session >nul 2>&1
if errorlevel 1 (
    echo 需要管理员权限，正在请求提升...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ==========================================
echo   百度网盘「智能看图」卸载脚本
echo ==========================================
echo.
echo 此脚本将删除百度网盘的「智能看图」功能。
echo 请确保以管理员权限运行此脚本。
echo.
pause
echo.
echo 正在删除注册表项...

echo [1/3] 删除 HKEY_CLASSES_ROOT\BaiduNetdiskImageViewerAssociations
reg delete "HKEY_CLASSES_ROOT\BaiduNetdiskImageViewerAssociations" /f >nul 2>&1
if %errorlevel% equ 0 (
    echo     √ 删除成功
) else (
    echo     × 删除失败或项目不存在
)

echo [2/3] 删除 HKEY_CURRENT_USER\Software\Baidu\BaiduNetdiskImageViewer
reg delete "HKEY_CURRENT_USER\Software\Baidu\BaiduNetdiskImageViewer" /f >nul 2>&1
if %errorlevel% equ 0 (
    echo     √ 删除成功
) else (
    echo     × 删除失败或项目不存在
)

echo [3/3] 删除 RegisteredApplications 中的 BaiduNetdiskImageViewer
reg delete "HKEY_CURRENT_USER\Software\RegisteredApplications" /v "BaiduNetdiskImageViewer" /f >nul 2>&1
if %errorlevel% equ 0 (
    echo     √ 删除成功
) else (
    echo     × 删除失败或项目不存在
)

echo.
echo 正在删除相关文件...
set "imageviewer_path=%APPDATA%\baidu\BaiduNetdisk\module\ImageViewer"
if exist "%imageviewer_path%" (
    echo 找到目录: %imageviewer_path%
    echo 正在删除相关文件...
    rmdir /s /q "%imageviewer_path%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo     √ 相关文件删除成功
    ) else (
        echo     × 相关文件删除失败，可能有文件正在使用
        echo     请手动删除: %imageviewer_path%
    )
) else (
    echo     目录不存在或已被删除
)

echo.
echo ==========================================
echo 卸载完成！
echo ==========================================
echo.
echo 请重启资源管理器以确保更改生效。
echo 如仍有问题，请检查以下路径是否有残留文件：
echo %APPDATA%\baidu\BaiduNetdisk\module\ImageViewer
echo.
echo 按任意键退出...
pause >nul