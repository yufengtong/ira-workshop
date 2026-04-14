#!/bin/bash

echo "====================================="
echo "  股票分析平台 - 后端启动脚本"
echo "====================================="

MAVEN_PATH="/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven3/bin/mvn"

if [ ! -f "$MAVEN_PATH" ]; then
    echo "错误: 找不到Maven,请检查IntelliJ IDEA是否安装"
    exit 1
fi

cd "$(dirname "$0")/backend"

echo "正在启动后端服务..."
echo "后端将运行在: http://localhost:8080"
echo "H2控制台: http://localhost:8080/h2-console"
echo ""

"$MAVEN_PATH" spring-boot:run
