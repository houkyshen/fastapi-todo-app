"""FastAPI Todo Web App —— 入口"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from api.todos import router as todo_router
from core.settings import STATIC_DIR, TEMPLATES_DIR

app = FastAPI(title="Todo App", version="1.0.0")

# 注册 API 路由
app.include_router(todo_router)

# 挂载静态文件 (CSS / JS)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def index():
    """返回首页 HTML"""
    return FileResponse(os.path.join(TEMPLATES_DIR, "index.html"))
