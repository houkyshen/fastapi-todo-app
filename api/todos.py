"""Todo RESTful API 路由"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services import todo_service

router = APIRouter(prefix="/api")


# ---------- 请求模型 ----------
class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, description="任务标题")
    description: str = Field("", description="任务描述")


class TodoUpdate(BaseModel):
    title: str | None = Field(None, description="新标题")
    description: str | None = Field(None, description="新描述")


# ---------- 路由 ----------
@router.get("/todos")
def list_todos():
    """获取所有待办"""
    return todo_service.get_all_todos()


@router.post("/todos", status_code=201)
def create_todo(body: TodoCreate):
    """创建新待办"""
    todo = todo_service.create_todo(title=body.title, description=body.description)
    return todo


@router.put("/todos/{todo_id}")
def update_todo(todo_id: int, body: TodoUpdate):
    """更新待办（标题 / 描述）"""
    todo = todo_service.update_todo(todo_id, title=body.title, description=body.description)
    if todo is None:
        raise HTTPException(status_code=404, detail="待办不存在")
    return todo


@router.patch("/todos/{todo_id}/complete")
def toggle_complete(todo_id: int):
    """切换完成状态"""
    todo = todo_service.toggle_complete(todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="待办不存在")
    return todo


@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    """删除待办"""
    ok = todo_service.delete_todo(todo_id)
    if not ok:
        raise HTTPException(status_code=404, detail="待办不存在")
    return {"detail": "删除成功"}
