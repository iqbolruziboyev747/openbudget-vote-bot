@echo off
REM FATH Website Build and Deploy

cd /d C:\Users\user\fath-website

echo.
echo ==========================================
echo BUILD QILINMOQDA...
echo ==========================================
echo.

npm run build

if errorlevel 1 (
    echo.
    echo BUILD FAILED!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo BUILD MUVAFFAQIYATLI!
echo ==========================================
echo.
echo Keyingi qadam: firebase login
echo.

pause
