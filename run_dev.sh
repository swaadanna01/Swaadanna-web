#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p)
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

# Start Backend
echo "Starting Backend..."
cd backend
python3 -m uvicorn server:app --reload &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo "Starting Frontend..."
cd frontend
# Check if node_modules exists, if not warn
if [ ! -d "node_modules" ]; then
    echo "node_modules not found in frontend. Please run 'npm install --legacy-peer-deps' in frontend directory."
    cleanup
fi
npm start &
FRONTEND_PID=$!
cd ..

echo "Both servers are running."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
