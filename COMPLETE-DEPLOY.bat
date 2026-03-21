@echo off
REM FATH Website Complete Deployment Script
REM This script sets up the entire website and deploys it to Firebase

echo.
echo ==========================================
echo   FATH WEBSITE COMPLETE DEPLOYMENT
echo ==========================================
echo.

REM Current directory
cd /d C:\Users\user\fath-website

REM 1. Create all necessary directories
echo [1/10] Creating directory structure...
mkdir src\lib 2>nul
mkdir src\app\shop 2>nul
mkdir src\app\dashboard 2>nul
mkdir src\app\admin 2>nul
mkdir src\app\api\payment 2>nul
mkdir src\app\login 2>nul
mkdir src\app\signup 2>nul
mkdir src\app\features 2>nul
mkdir src\app\success 2>nul

echo [DONE] Directories created

REM 2. Copy Firebase configuration
echo.
echo [2/10] Setting up Firebase configuration...

REM Copy session files with full content for firebase.js
powershell -NoProfile -Command "
\$firebase_content = @'
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
'@;
\$firebase_content | Out-File 'src/lib/firebase.js' -Encoding UTF8 -Force
"

echo [DONE] Firebase configured

REM 3. Install dependencies
echo.
echo [3/10] Dependencies already installed (npm install completed earlier)
echo [DONE]

REM 4. Create .env.local
echo.
echo [4/10] Verifying environment variables...
if exist .env.local (
    echo [DONE] .env.local already exists
) else (
    echo [ERROR] .env.local not found!
    echo Please create .env.local with Stripe keys
    exit /b 1
)

REM 5. Build the project
echo.
echo [5/10] Building Next.js project...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed!
    exit /b 1
)
echo [DONE] Build successful

REM 6. Firebase login
echo.
echo [6/10] Firebase authentication...
call firebase login
if errorlevel 1 (
    echo [ERROR] Firebase login failed!
    exit /b 1
)
echo [DONE] Firebase authenticated

REM 7. Initialize Firebase hosting
echo.
echo [7/10] Initializing Firebase hosting...
call firebase init hosting --yes
if errorlevel 1 (
    echo [WARNING] Firebase init returned non-zero - may already be initialized
)
echo [DONE]

REM 8. Deploy to Firebase
echo.
echo [8/10] Deploying to Firebase hosting...
call firebase deploy --only hosting
if errorlevel 1 (
    echo [ERROR] Deployment failed!
    exit /b 1
)
echo [DONE] Deployment successful

REM 9. Get deployment URL
echo.
echo [9/10] Getting deployment details...
echo.
echo Deployment completed!
echo Visit: https://fathrobot-5c48d.web.app
echo.

REM 10. Post-deployment instructions
echo.
echo [10/10] Post-deployment setup...
echo.
echo ==========================================
echo   DEPLOYMENT COMPLETE! 🎉
echo ==========================================
echo.
echo Next steps:
echo 1. Visit: https://fathrobot-5c48d.web.app
echo 2. Sign up with your email
echo 3. Go to Firebase Console
echo 4. Add isAdmin=true to your user document
echo 5. Test payment with Stripe test card:
echo    - Card: 4242 4242 4242 4242
echo    - Expiry: 12/25
echo    - CVC: 123
echo.
echo ==========================================
echo.

pause
