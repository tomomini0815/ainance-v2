@echo off
echo MySQL rootユーザーのパスワードをリセットします...
echo.

echo 1. MySQLサービスを停止します...
net stop MySQL80
if %errorlevel% neq 0 (
    echo エラー: MySQLサービスの停止に失敗しました。管理者権限で実行してください。
    pause
    exit /b 1
)

echo.
echo 2. MySQLを安全モードで起動します...
start /b "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables
timeout /t 5 /nobreak >nul

echo.
echo 3. rootユーザーのパスワードをリセットします...
echo USE mysql; > reset-password.sql
echo UPDATE user SET authentication_string=PASSWORD('root1234') WHERE User='root'; >> reset-password.sql
echo FLUSH PRIVILEGES; >> reset-password.sql
echo EXIT; >> reset-password.sql

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root < reset-password.sql
del reset-password.sql

echo.
echo 4. MySQLを通常モードで再起動します...
taskkill /f /im mysqld.exe
timeout /t 3 /nobreak >nul
net start MySQL80

echo.
echo MySQL rootユーザーのパスワードが正常にリセットされました。
echo 新しいパスワード: root1234
pause