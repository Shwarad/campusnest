@echo off
SET NODE_DIR=%LOCALAPPDATA%\Programs\nodejs
SET PATH=%NODE_DIR%;%PATH%

echo ============================================
echo  CampusNest - Seed Database + Start
echo ============================================
echo.
echo Step 1: Seeding database with demo data...
cd /d C:\Users\Asus\Documents\CampusNest\server
npm run seed
echo.
echo Seed complete! Starting app...
timeout /t 2 /nobreak > nul

echo Step 2: Starting Backend...
start "CampusNest Backend" cmd /k "cd /d C:\Users\Asus\Documents\CampusNest\server && npm run dev"
timeout /t 3 /nobreak > nul

echo Step 3: Starting Frontend...
start "CampusNest Frontend" cmd /k "cd /d C:\Users\Asus\Documents\CampusNest\client && npm run dev"
timeout /t 5 /nobreak > nul

echo.
echo App running at http://localhost:5173
start "" "http://localhost:5173"
