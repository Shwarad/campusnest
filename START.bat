@echo off
echo ============================================
echo  CampusNest - Starting Application
echo ============================================

SET NODE_DIR=%LOCALAPPDATA%\Programs\nodejs
SET PATH=%NODE_DIR%;%PATH%

echo [1/2] Starting Backend (port 5000)...
start "CampusNest Backend" cmd /k "cd /d C:\Users\Asus\Documents\CampusNest\server && node --version && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend (port 5173)...
start "CampusNest Frontend" cmd /k "cd /d C:\Users\Asus\Documents\CampusNest\client && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo ============================================
echo  App starting at http://localhost:5173
echo  API running at http://localhost:5000
echo ============================================
echo  Demo login: student@campusnest.demo / Demo@123
echo ============================================
start "" "http://localhost:5173"
