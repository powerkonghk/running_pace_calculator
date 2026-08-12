@echo off
title Running Calculator
cd /d "%~dp0"

echo Starting Running Calculator...
echo Press Ctrl+C to stop the server.
echo.

start "" http://localhost:3000

call npm run dev

pause
