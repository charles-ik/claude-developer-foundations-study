@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 practice_server.py --open
) else (
  python practice_server.py --open
)
if errorlevel 1 (
  echo Install Python 3.10 or later from https://www.python.org/downloads/ and try again.
  pause
)
