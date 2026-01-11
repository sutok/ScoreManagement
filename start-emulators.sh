#!/bin/bash

echo "🚀 Firebase エミュレーターを起動します..."
echo ""
echo "利用可能なサービス:"
echo "  - Firestore Emulator: http://localhost:8080"
echo "  - Authentication Emulator: http://localhost:9099"
echo "  - Emulator UI: http://localhost:4000"
echo ""
echo "停止するには Ctrl+C を押してください"
echo ""

firebase emulators:start
