#!/bin/bash

echo "====================================="
echo "  股票分析平台 - 前端启动脚本"
echo "====================================="

cd "$(dirname "$0")/frontend"

if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

echo ""
echo "正在启动前端服务..."
echo "前端将运行在: http://localhost:5173"
echo ""

npm run dev
