#!/bin/bash

echo "====================================="
echo "  股票分析平台 - 启动全部服务"
echo "====================================="
echo ""

# 启动后端
echo "[1/2] 启动后端服务..."
./start-backend.sh &
BACKEND_PID=$!

sleep 3

# 启动前端
echo ""
echo "[2/2] 启动前端服务..."
./start-frontend.sh &
FRONTEND_PID=$!

echo ""
echo "====================================="
echo "  所有服务已启动"
echo "====================================="
echo "后端: http://localhost:8080"
echo "前端: http://localhost:5173"
echo "H2控制台: http://localhost:8080/h2-console"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

wait
