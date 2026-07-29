@echo off
SET NODE_DIR=%LOCALAPPDATA%\Programs\nodejs
SET PATH=%NODE_DIR%;%PATH%

echo ============================================
echo  CampusNest - Setup, Seed Database + Start
echo ============================================
echo.

cd /d C:\Users\Asus\Documents\CampusNest\server

echo Step 1: Generating Prisma client...
node "%NODE_DIR%\node_modules\npm\bin\npm-cli.js" run db:generate
if %errorlevel% neq 0 (
  echo ERROR: Prisma generate failed. Check server/.env has a valid DATABASE_URL.
  pause
  exit /b 1
)
echo.

echo Step 2: Pushing schema to database (creates tables if missing)...
node "%NODE_DIR%\node_modules\npm\bin\npm-cli.js" run db:push
if %errorlevel% neq 0 (
  echo ERROR: db:push failed. Check DATABASE_URL in server/.env and ensure your Neon database is reachable.
  pause
  exit /b 1
)
echo.

echo Step 3: Seeding database with demo data...
node "%NODE_DIR%\node_modules\npm\bin\npm-cli.js" run seed
if %errorlevel% neq 0 (
  echo ERROR: Seed failed. Check server/.env and your database connection.
  pause
  exit /b 1
)
echo.

echo Seed complete! Starting app...
timeout /t 2 /nobreak > nul

echo Step 4: Starting Backend (port 5000)...
start "CampusNest Backend" cmd /k "cd /d C:\Users\Asus\Documents\CampusNest\server && npm run dev"
timeout /t 3 /nobreak > nul

echo Step 5: Starting Frontend (port 5173)...
start "CampusNest Frontend" cmd /k "cd /d C:\Users\Asus\Documents\CampusNest\client && npm run dev"
timeout /t 5 /nobreak > nul

echo.
echo ============================================
echo  App running at http://localhost:5173
echo ============================================
echo  Demo login: student@campusnest.demo / Demo@123
echo  Demo owner: owner@campusnest.demo   / Demo@123
echo  Demo admin: admin@campusnest.demo   / Demo@123
echo ============================================
start "" "http://localhost:5173"
