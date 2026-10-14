@echo off
chcp 65001 >nul
title IT Demirbas - Backend API Sunucusu
cd /d "c:\Users\Monster\Desktop\koordinatörlük\backend"
echo ===================================================================
echo   IT Demirbas ve Zimmet Yonetimi - Backend API Sunucusu
echo   Telefonunuzdaki APK bu adrese baglanir: http://10.236.158.60:5000
echo ===================================================================
echo.
echo Sunucu baslatiliyor (Port 5000)...
npm start
pause
