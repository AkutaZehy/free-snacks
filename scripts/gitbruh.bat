@echo off
setlocal

set "SENTENCES_FILE=%~dp0resources\sentences.txt"
if not exist "%SENTENCES_FILE%" (
    echo sentences.txt not found
    pause
    exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo Current directory is not a git repository
    pause
    exit /b 1
)

git status --porcelain | findstr . >nul 2>&1
if errorlevel 1 (
    echo No staged files - run git add first
    pause
    exit /b 1
)

for /f %%A in ('find /c /v "" ^< "%SENTENCES_FILE%"') do set "TOTAL=%%A"

set /a "LINE=(%RANDOM% %% %TOTAL%) + 1"

set "SENTENCE="
for /f "tokens=%LINE% delims=" %%A in (%SENTENCES_FILE%) do set "SENTENCE=%%A"

if not defined SENTENCE (
    echo Failed to read a random sentence
    pause
    exit /b 1
)

echo Commit message: bruh: %SENTENCE%
git commit -m "bruh: %SENTENCE%"
pause
