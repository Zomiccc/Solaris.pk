@echo off
echo Starting Solaris Online Store...

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && node index.js"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd client && npm start"

echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul
