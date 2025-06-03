:: 生成随机数（通过当前时间戳对 700 取余）
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

:: 执行 Git 提交
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