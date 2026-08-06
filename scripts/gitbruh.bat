@echo off
chcp 65001 >nul
setlocal

set "SENTENCES_FILE=%~dp0resources\sentences.txt"
if not exist "%SENTENCES_FILE%" (
    echo sentences.txt 未找到
    pause
    exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo 当前目录不是 git 仓库
    pause
    exit /b 1
)

git status --porcelain | findstr . >nul 2>&1
if errorlevel 1 (
    echo 没有已暂存的文件，请先 git add
    pause
    exit /b 1
)

for /f %%A in ('find /c /v "" ^< "%SENTENCES_FILE%"') do set "TOTAL=%%A"

set /a "LINE=(%RANDOM% %% %TOTAL%) + 1"

set "SENTENCE="
for /f "tokens=%LINE% delims=" %%A in (%SENTENCES_FILE%) do set "SENTENCE=%%A"

if not defined SENTENCE (
    echo 无法读取随机句子
    pause
    exit /b 1
)

echo 提交信息: bruh: %SENTENCE%
git commit -m "bruh: %SENTENCE%"
pause