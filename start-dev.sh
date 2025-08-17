#!/bin/bash

echo "Starting Clap Recognition App Development Environment..."
echo

# Function to cleanup background processes
cleanup() {
    echo "Stopping development servers..."
    pkill -f "python app.py"
    pkill -f "npm run dev"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo "Starting Backend (Flask)..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend (React)..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo
echo "Development servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo
echo "The app uses heuristic-based clap detection - no training required!"
echo
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
