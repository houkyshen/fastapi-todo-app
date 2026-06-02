"""数据读写逻辑 —— 基于 JSON 文件"""

import json
import os
import threading
from typing import Optional

from core.settings import DATA_FILE

_lock = threading.Lock()


def _read_all() -> list[dict]:
    """读取全部待办（内部方法）"""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _write_all(data: list[dict]) -> None:
    """写入全部待办（内部方法）"""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)


def get_all_todos() -> list[dict]:
    """获取所有待办"""
    with _lock:
        return _read_all()


def get_todo_by_id(todo_id: int) -> Optional[dict]:
    """根据 id 获取单条待办"""
    with _lock:
        todos = _read_all()
        for todo in todos:
            if todo.get("id") == todo_id:
                return todo
        return None


def create_todo(title: str, description: str = "") -> dict:
    """创建新待办，返回创建后的对象"""
    with _lock:
        todos = _read_all()

        # 生成自增 id
        max_id = max((t.get("id", 0) for t in todos), default=0)
        new_id = max_id + 1

        from datetime import datetime
        now = datetime.now().isoformat()

        todo = {
            "id": new_id,
            "title": title,
            "description": description,
            "completed": False,
            "created_at": now,
            "updated_at": now,
        }
        todos.append(todo)
        _write_all(todos)
        return todo


def update_todo(todo_id: int, title: Optional[str] = None, description: Optional[str] = None) -> Optional[dict]:
    """更新待办标题 / 描述，返回更新后的对象；不存在返回 None"""
    with _lock:
        todos = _read_all()
        for todo in todos:
            if todo.get("id") == todo_id:
                if title is not None:
                    todo["title"] = title
                if description is not None:
                    todo["description"] = description
                from datetime import datetime
                todo["updated_at"] = datetime.now().isoformat()
                _write_all(todos)
                return todo
        return None


def toggle_complete(todo_id: int) -> Optional[dict]:
    """切换完成状态，返回更新后的对象；不存在返回 None"""
    with _lock:
        todos = _read_all()
        for todo in todos:
            if todo.get("id") == todo_id:
                todo["completed"] = not todo.get("completed", False)
                from datetime import datetime
                todo["updated_at"] = datetime.now().isoformat()
                _write_all(todos)
                return todo
        return None


def delete_todo(todo_id: int) -> bool:
    """删除待办，返回是否删除成功"""
    with _lock:
        todos = _read_all()
        original_len = len(todos)
        todos = [t for t in todos if t.get("id") != todo_id]
        if len(todos) < original_len:
            _write_all(todos)
            return True
        return False
