# FastAPI Todo App

一个简洁的待办事项 Web 应用，后端使用 FastAPI，前端使用原生 HTML/CSS/JS，数据存储在 JSON 文件中。

## 功能

- **查看所有待办** — 列表展示，已完成任务划线置灰
- **添加待办** — 标题 + 描述表单
- **编辑待办** — 模态弹窗编辑标题和描述
- **切换完成状态** — 点击复选框标记完成/未完成
- **删除待办** — 单条删除，确认后执行
- **数据持久化** — JSON 文件存储，重启不丢失
- **统计信息** — 顶部显示总数和未完成数
- **响应式布局** — 手机和桌面均可使用
- **无刷新交互** — 全部操作通过 AJAX 完成
- **开机自启** — Windows 计划任务，无需登录即可运行

## 技术栈

| 层 | 技术 |
|------|------|
| 后端 | FastAPI (Python) |
| 前端 | HTML + CSS + JavaScript (原生) |
| 存储 | JSON 文件 |
| 服务 | Uvicorn |

## 项目结构

```
todo-app/
├── main.py                  # FastAPI 入口
├── api/
│   ├── __init__.py
│   └── todos.py             # RESTful API 路由
├── core/
│   ├── __init__.py
│   └── settings.py          # 配置
├── services/
│   ├── __init__.py
│   └── todo_service.py      # JSON 读写逻辑（线程安全）
├── data/
│   └── todos.json           # 数据文件
├── static/
│   ├── css/
│   │   └── style.css        # 样式
│   └── js/
│       └── app.js            # 前端交互
├── templates/
│   └── index.html           # 首页模板
├── docs/
│   └── auto-start.md        # 开机自启说明
└── start-todo.bat           # 启动脚本
```

## 快速开始

```bash
# 1. 安装依赖
pip install fastapi uvicorn python-multipart

# 2. 启动服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 3. 打开浏览器
# 页面: http://localhost:8000
# API 文档: http://localhost:8000/docs
```

## API 接口

| 方法 | 路径 | 功能 |
|------|------|------|
| `GET` | `/` | 返回首页 HTML |
| `GET` | `/api/todos` | 获取所有待办 |
| `POST` | `/api/todos` | 创建新待办 |
| `PUT` | `/api/todos/{id}` | 更新待办 |
| `PATCH` | `/api/todos/{id}/complete` | 切换完成状态 |
| `DELETE` | `/api/todos/{id}` | 删除待办 |

### 请求示例

```bash
# 创建待办
curl -X POST http://localhost:8000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "学习 FastAPI", "description": "阅读官方文档"}'

# 切换完成状态
curl -X PATCH http://localhost:8000/api/todos/1/complete

# 更新待办
curl -X PUT http://localhost:8000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "新标题", "description": "新描述"}'

# 删除待办
curl -X DELETE http://localhost:8000/api/todos/1
```

## 数据模型

```json
{
  "id": 1,
  "title": "任务标题",
  "description": "任务描述",
  "completed": false,
  "created_at": "2026-06-02T08:29:10.027069",
  "updated_at": "2026-06-02T08:29:10.027069"
}
```

## 开机自启（Windows）

已配置计划任务，系统启动后自动运行。详见 [docs/auto-start.md](docs/auto-start.md)。

```bash
# 手动触发
schtasks /run /tn "TodoApp"

# 删除自启
schtasks /delete /tn "TodoApp" /f
```
