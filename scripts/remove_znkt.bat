@echo off

:: Check admin rights
net session >nul 2>&1
if errorlevel 1 (
    echo Admin rights required, requesting elevation...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ==========================================
echo  Baidu Netdisk "Smart Image Viewer"
echo        removal script
echo ==========================================
echo.
echo This script removes Baidu Netdisk's "Smart Image Viewer".
echo Please ensure you run it as administrator.
echo.
pause
echo.
echo Deleting registry entries...

echo [1/3] Deleting HKEY_CLASSES_ROOT\BaiduNetdiskImageViewerAssociations
reg delete "HKEY_CLASSES_ROOT\BaiduNetdiskImageViewerAssociations" /f >nul 2>&1
if %errorlevel% equ 0 (
    echo     [OK] Deleted
) else (
    echo     [FAIL] Delete failed or item does not exist
)

echo [2/3] Deleting HKEY_CURRENT_USER\Software\Baidu\BaiduNetdiskImageViewer
reg delete "HKEY_CURRENT_USER\Software\Baidu\BaiduNetdiskImageViewer" /f >nul 2>&1
if %errorlevel% equ 0 (
    echo     [OK] Deleted
) else (
    echo     [FAIL] Delete failed or item does not exist
)

echo [3/3] Deleting BaiduNetdiskImageViewer from RegisteredApplications
reg delete "HKEY_CURRENT_USER\Software\RegisteredApplications" /v "BaiduNetdiskImageViewer" /f >nul 2>&1
if %errorlevel% equ 0 (
    echo     [OK] Deleted
) else (
    echo     [FAIL] Delete failed or item does not exist
)

echo.
echo Deleting related files...
set "imageviewer_path=%APPDATA%\baidu\BaiduNetdisk\module\ImageViewer"
if exist "%imageviewer_path%" (
    echo Found directory: %imageviewer_path%
    echo Deleting related files...
    rmdir /s /q "%imageviewer_path%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo     [OK] Related files deleted
    ) else (
        echo     [FAIL] Failed - some files may be in use
        echo     Please delete manually: %imageviewer_path%
    )
) else (
    echo     Directory does not exist or was already deleted
)

echo.
echo ==========================================
echo Uninstall complete!
echo ==========================================
echo.
echo Please restart Explorer for the changes to take effect.
echo If issues remain, check the following path for leftovers:
echo %APPDATA%\baidu\BaiduNetdisk\module\ImageViewer
echo.
echo Press any key to exit...
pause >nul
