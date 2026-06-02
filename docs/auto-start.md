# 开机自动启动 — 实现说明

## 方案选择

使用 **Windows 计划任务（Scheduled Task）**，分两步完成。

## 第一步：创建启动脚本

`start-todo.bat`：

```bat
@echo off
chcp 65001 >nul
cd /d "E:\projects\AI-Agent\CC-Test\todo-app"
E:\environment\python310\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 >> "E:\projects\AI-Agent\CC-Test\todo-app\server.log" 2>&1
```

做的事情：

- `chcp 65001` — 将控制台编码设为 UTF-8，避免中文日志乱码
- `cd /d` — 切换到项目目录
- `python -m uvicorn` — 用绝对路径的 Python 启动服务
- `>> server.log 2>&1` — 标准输出和错误都追加到日志文件

## 第二步：注册计划任务

用 PowerShell 调用 `schtasks`：

```powershell
schtasks /create `
  /tn 'TodoApp' `                            # 任务名称
  /tr '"E:\...\start-todo.bat"' `            # 要执行的脚本
  /sc onstart `                              # 触发器：系统启动时
  /ru SYSTEM `                               # 以 SYSTEM 账户运行（无需用户登录）
  /rl highest `                              # 最高权限
  /delay 0000:30 `                           # 延迟 30 秒（等网卡就绪）
  /f                                         # 强制创建，不提示确认
```

## 各参数作用

| 参数 | 含义 |
|------|------|
| `/sc onstart` | 开机即触发，不依赖任何用户登录 |
| `/ru SYSTEM` | 以系统账户运行，电脑刚开机还没输密码时也能启动 |
| `/rl highest` | 避免权限不足导致端口绑定失败 |
| `/delay 0000:30` | 等 30 秒再跑，确保 TCP/IP 协议栈已初始化 |

## 为什么不用其他方式

| 方式 | 问题 |
|------|------|
| 启动文件夹 (`shell:startup`) | 必须用户登录后才触发，重启后不输密码不会跑 |
| Windows 服务 | 需要额外装 `pywin32` 或 `nssm`，多一层依赖 |
| 注册表 `Run` 键 | 同样依赖登录，且 SYSTEM 账户下不会加载 |

**计划任务 + `OnStart` + `SYSTEM`** 是最干净的方案——不引入额外依赖，不依赖用户登录，开机就能跑。

## 常用管理命令

| 操作 | 命令 |
|------|------|
| 手动触发 | `schtasks /run /tn "TodoApp"` |
| 查看状态 | `schtasks /query /tn "TodoApp" /v` |
| 删除任务 | `schtasks /delete /tn "TodoApp" /f` |
| 查看日志 | 查看 `todo-app/server.log` |
