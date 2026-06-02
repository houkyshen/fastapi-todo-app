@echo off
chcp 65001 >nul
cd /d "E:\projects\AI-Agent\CC-Test\todo-app"
E:\environment\python310\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 >> "E:\projects\AI-Agent\CC-Test\todo-app\server.log" 2>&1
