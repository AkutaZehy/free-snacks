@echo off
setlocal

if "%~1"=="" (
    echo Usage: dosdel.bat "file-or-folder-path"
    echo.
    echo Supports deleting:
    echo   - Long paths ^(^>260 chars^)
    echo   - DOS reserved names ^(NUL, LPT1, etc.^)
    echo   - Permission-restricted files
    pause
    exit /b 1
)

set "TARGET=%~1"
if not "%TARGET:~1,1%"==":" if not "%TARGET:~0,2%"=="\\" set "TARGET=%CD%\%TARGET%"

if not exist "\\?\%TARGET%" (
    echo Path not found: %TARGET%
    pause
    exit /b 1
)

echo Taking full control...
icacls "%TARGET%" /grant Everyone:F /t /c /q >nul 2>&1

echo Deleting: %TARGET%
del /f /a /q "\\?\%TARGET%" 2>nul
rd /s /q "\\?\%TARGET%" 2>nul

if exist "\\?\%TARGET%" (
    echo.
    echo Deletion failed - file may be in use
) else (
    echo.
    echo Successfully deleted: %TARGET%
)
pause
