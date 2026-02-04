@echo off
setlocal

if "%PORT%"=="" set PORT=8000

python -m http.server %PORT%
