@echo off
echo Starting Clap Recognition App Development Environment...
echo.

echo Starting Backend (Flask)...
start "Backend Server" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python app.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend (React)...
start "Frontend Server" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo The app uses heuristic-based clap detection - no training required!
echo.
echo Press any key to exit this launcher...
pause >nul
