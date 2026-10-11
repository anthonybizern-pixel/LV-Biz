@echo off
rem English Coach : supprime le rappel quotidien
schtasks /Delete /TN "English Coach - rappel" /F >nul 2>&1
if %errorlevel%==0 (
  echo.
  echo   Rappel supprime. Tu ne recevras plus de notification.
) else (
  echo.
  echo   Aucun rappel n'etait installe.
)
echo.
pause
