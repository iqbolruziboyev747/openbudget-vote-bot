@echo off
REM FATH Website Setup and Deployment
REM Run this from C:\Users\user\fath-website

cd /d C:\Users\user\fath-website

REM Create all needed directories
echo Creating directories...
for /d %%d in (lib app\shop app\dashboard app\admin app\api\payment app\login app\signup app\features app\success) do (
    if not exist "src\%%d" mkdir "src\%%d"
)

echo.
echo ==========================================
echo COPY FILES FROM SESSION FOLDER
echo ==========================================
echo.

REM Copy firebase config
echo [1/8] Copying Firebase configuration...
copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\firebase-client.js" "src\lib\firebase.js" /Y >nul

REM Copy home page
echo [2/8] Copying home page...
copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\pages-home-complete.jsx" "src\app\page.jsx" /Y >nul

REM Copy shop page
echo [3/8] Copying shop page...
copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\pages-shop-complete.jsx" "src\app\shop\page.jsx" /Y >nul

REM Copy dashboard page
echo [4/8] Copying dashboard page...
copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\pages-dashboard-complete.jsx" "src\app\dashboard\page.jsx" /Y >nul

REM Copy admin page
echo [5/8] Copying admin page...
copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\pages-admin-complete.jsx" "src\app\admin\page.jsx" /Y >nul

REM Copy auth pages
echo [6/8] Copying auth pages...
copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\pages-login.jsx" "src\app\login\page.jsx" /Y >nul
copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\pages-signup.jsx" "src\app\signup\page.jsx" /Y >nul
copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\pages-success.jsx" "src\app\success\page.jsx" /Y >nul

REM Copy features page (if exists)
if exist "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\pages-features.jsx" (
    copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\pages-features.jsx" "src\app\features\page.jsx" /Y >nul
)

REM Copy payment API
echo [7/8] Copying payment API...
copy "C:\Users\user\.copilot\session-state\d134c7b1-0330-48a4-9be1-b4586f1f410b\api-payment.js" "src\app\api\payment\route.js" /Y >nul

REM Copy package.json if needed
echo [8/8] Checking dependencies...

echo.
echo ==========================================
echo FILES COPIED SUCCESSFULLY
echo ==========================================
echo.

REM Check for Stripe keys
echo Checking Stripe keys in .env.local...
findstr /M "STRIPE_PUBLIC_KEY" .env.local >nul
if errorlevel 1 (
    echo.
    echo WARNING: Stripe keys not found in .env.local
    echo Please add them manually:
    echo   STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
    echo   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET
    echo.
    pause
)

echo.
echo Ready to build and deploy!
echo.
echo Run: npm run build
echo Then: firebase deploy --only hosting
echo.

pause
