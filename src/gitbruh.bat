@echo off
setlocal enabledelayedexpansion

:: 定义 SENTENCES_FILE，指向 sentenses.txt 文件的路径
set "SENTENCES_FILE=%~dp0resources\sentenses.txt"

:: 检查文件是否存在
if not exist "%SENTENCES_FILE%" (
    echo Error: sentenses.txt not found at %SENTENCES_FILE%
    echo Please ensure the file exists in the resources folder.
    pause
    exit /b 1
)

:: 检查是否是 Git 仓库（当前路径或父级路径）
set "IS_GIT_REPO=0"
echo Current directory: %cd%
git rev-parse --is-inside-work-tree >nul 2>&1
if not errorlevel 1 (
    set "IS_GIT_REPO=1"
) else (
    cd ..
    echo Parent directory: %cd%
    git rev-parse --is-inside-work-tree >nul 2>&1
    if not errorlevel 1 (
        set "IS_GIT_REPO=1"
    )
)

if "%IS_GIT_REPO%"=="0" (
    echo Error: Not a git repository in the current or parent directory.
    echo Please ensure you are running the script inside a Git repository.
    pause
    exit /b 1
)

:: 计算文件的总行数
set TOTAL_LINES=0
for /f %%A in ('find /c /v "" ^< "%SENTENCES_FILE%"') do set TOTAL_LINES=%%A

:: 检查总行数是否有效
if "%TOTAL_LINES%"=="0" (
    echo Error: sentenses.txt is empty or could not be read.
    echo Please ensure the file contains valid text.
    pause
    exit /b 1
)

:: 生成虚假的随机数（通过当前时间戳对 700 取余）
set RANDOM_SEED=
for /f %%A in ('powershell -Command "try { [int][double]::Parse((Get-Date).ToString('yyyyMMddHHmmss')) %% 700 } catch { 0 }"') do set RANDOM_SEED=%%A

:: 检查随机数是否生成成功
if not defined RANDOM_SEED (
    echo Error: RANDOM_SEED is not defined or invalid.
    pause
    exit /b 1
)

if "!RANDOM_SEED!"=="0" (
    echo Warning: RANDOM_SEED is 0. Using fallback value.
    set RANDOM_SEED=1
)

:: 调试输出
echo RANDOM_SEED=!RANDOM_SEED!
echo TOTAL_LINES=!TOTAL_LINES!

:: 计算随机行号
set /a LINE_NUM=!RANDOM_SEED! %% !TOTAL_LINES! + 1

:: 检查随机行号是否有效
if "!LINE_NUM!" GTR "!TOTAL_LINES!" (
    echo Error: LINE_NUM exceeds TOTAL_LINES.
    echo LINE_NUM=!LINE_NUM!, TOTAL_LINES=!TOTAL_LINES!
    pause
    exit /b 1
)

if "%LINE_NUM%"=="0" (
    echo Error: Invalid line number calculated.
    echo RANDOM_SEED=!RANDOM_SEED!, TOTAL_LINES=!TOTAL_LINES!
    pause
    exit /b 1
)

:: 提取随机行内容
set "RANDOM_SENTENCE="
set /a SKIP_LINES=!LINE_NUM! - 1

:: 调试输出
echo LINE_NUM=!LINE_NUM!
echo SKIP_LINES=!SKIP_LINES!

for /f "tokens=* delims=" %%A in ('more +!SKIP_LINES! "%SENTENCES_FILE%"') do (
    if not defined RANDOM_SENTENCE set "RANDOM_SENTENCE=%%A"
)

:: 检查是否成功提取随机行
if not defined RANDOM_SENTENCE (
    echo Error: Could not extract a random sentence from sentenses.txt.
    echo Please ensure the file contains enough lines.
    pause
    exit /b 1
)

:: 调试输出
echo RANDOM_SENTENCE=!RANDOM_SENTENCE!

:: 执行 Git 提交
echo Committing with message: bruh: !RANDOM_SENTENCE!
git commit -m "bruh: !RANDOM_SENTENCE!" >nul 2>&1
if errorlevel 1 (
    echo Error: Git commit failed. Ensure you have staged changes.
    echo Use 'git add <file>' to stage changes before running this script.
    pause
    exit /b 1
)

:: 输出提交信息并暂停
echo Committed with message: bruh: !RANDOM_SENTENCE!
pause