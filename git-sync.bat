@echo off
echo 正在同步代码...
git pull origin master
if %errorlevel% neq 0 (
    echo 拉取失败，请检查冲突
    pause
    exit /b 1
)
git add .
git commit -m "%*"
if %errorlevel% neq 0 (
    echo 提交失败
    pause
    exit /b 1
)
git push origin master
if %errorlevel% neq 0 (
    echo 推送失败
    pause
    exit /b 1
)
echo 同步完成！
pause

