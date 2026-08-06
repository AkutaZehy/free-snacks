@echo off
chcp 65001 >nul
setlocal

set /p "minutes=输入关机倒计时（分钟）: "

:: 校验输入是否为正整数
set /a "test=minutes" 2>nul
if %test% leq 0 (
    echo 请输入大于 0 的数字
    pause
    exit /b 1
)

set /a "seconds=minutes * 60"
echo.
echo 将在 %minutes% 分钟后关机（%seconds% 秒）
set /p "confirm=确认？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消
    pause
    exit /b 0
)

shutdown -s -t %seconds%
echo 已设置关机倒计时。
pause