#!/bin/bash
echo "================================================"
echo "  Starting LogiCore Monorepo Services"
echo "================================================"

# Start PostgreSQL if not running
sudo systemctl start postgresql@18-main 2>/dev/null || sudo systemctl start postgresql 2>/dev/null

# Kill anything on our ports
for port in 3000 3001 3002 3003 3004; do
  pid=$(lsof -t -i:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "Stopping existing process on port $port..."
    kill -9 $pid 2>/dev/null
  fi
done

sleep 1

# Start Redis if installed
redis-cli ping > /dev/null 2>&1 || redis-server --daemonize yes 2>/dev/null

# Start backend
echo "Starting Backend (Port 3000)..."
cd ~/Desktop/LogiCore/backend
npm run dev > /tmp/logicore-backend.log 2>&1 &
sleep 3

# Check backend is up
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✓ Backend started successfully"
else
  echo "  Backend may still be starting..."
fi

# Start all frontends
echo "Starting Manager Dashboard (Port 3001)..."
cd ~/Desktop/LogiCore/frontend-manager
npm run dev > /tmp/logicore-manager.log 2>&1 &

echo "Starting Driver App (Port 3002)..."
cd ~/Desktop/LogiCore/frontend-driver
npm run dev > /tmp/logicore-driver.log 2>&1 &

echo "Starting Supplier Portal (Port 3003)..."
cd ~/Desktop/LogiCore/frontend-supplier
npm run dev > /tmp/logicore-supplier.log 2>&1 &

echo "Starting Gate App (Port 3004)..."
cd ~/Desktop/LogiCore/frontend-gate
npm run dev > /tmp/logicore-gate.log 2>&1 &

sleep 5

# Get local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "================================================"
echo "  All LogiCore services are running"
echo "================================================"
echo ""
echo "=== URL MAPPINGS ==="
echo "Manager Dashboard:  http://localhost:3001"
echo "Driver Mobile App:  http://localhost:3002"
echo "Supplier Portal:    http://localhost:3003"
echo "Gate Security App:  http://localhost:3004"
echo "Backend API:        http://localhost:3000"
echo ""
echo "=== FOR PHONE ACCESS ==="
echo "Driver App on phone: http://$LOCAL_IP:3002"
echo "Gate App on tablet:  http://$LOCAL_IP:3004"
echo ""
echo "=== DEMO CREDENTIALS ==="
echo "All portals open directly without login"
echo ""
echo "=== SIMULATOR COMMANDS ==="
echo "cd ~/Desktop/LogiCore/simulator"
echo "python simulator.py --scenario normal_trip"
echo "python simulator.py --scenario driver_noshow"
echo "python simulator.py --scenario plan_change"
echo "python simulator.py --scenario inventory_alert"
echo ""
