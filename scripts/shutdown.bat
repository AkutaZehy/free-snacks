@echo off
setlocal

set /p "minutes=Enter shutdown countdown (minutes): "

:: Validate input is a positive integer
set /a "test=minutes" 2>nul
if %test% leq 0 (
    echo Please enter a number greater than 0
    pause
    exit /b 1
)

set /a "seconds=minutes * 60"
echo.
echo Will shut down in %minutes% minute(s) (%seconds% seconds)
set /p "confirm=Confirm? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

shutdown -s -t %seconds%
echo Shutdown countdown set.
pause
