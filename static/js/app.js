/**
 * Todo App —— 前端交互逻辑
 * 所有操作通过 AJAX 无刷新完成
 */

const API_BASE = "/api/todos";

// ====== DOM 元素 ======
const todoList = document.getElementById("todo-list");
const statsText = document.getElementById("stats-text");
const addForm = document.getElementById("add-form");
const addTitle = document.getElementById("add-title");
const addDesc = document.getElementById("add-description");

// 编辑弹窗
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editTitle = document.getElementById("edit-title");
const editDesc = document.getElementById("edit-description");
const btnCancelEdit = document.getElementById("btn-cancel-edit");

let editingId = null; // 当前正在编辑的 todo id

// ====== 工具函数 ======
function formatTime(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function escapeHtml(str) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(str).replace(/[&<>"']/g, (c) => map[c]);
}

// ====== API 调用 ======
async function fetchTodos() {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("获取列表失败");
    return res.json();
}

async function createTodo(title, description) {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error("添加失败");
    return res.json();
}

async function updateTodo(id, data) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("更新失败");
    return res.json();
}

async function toggleComplete(id) {
    const res = await fetch(`${API_BASE}/${id}/complete`, {
        method: "PATCH",
    });
    if (!res.ok) throw new Error("操作失败");
    return res.json();
}

async function deleteTodo(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("删除失败");
    return res.json();
}

// ====== 渲染 ======
function renderTodos(todos) {
    if (!todos || todos.length === 0) {
        todoList.innerHTML = '<li class="empty-hint">暂无待办事项，快来添加吧 🎉</li>';
    } else {
        todoList.innerHTML = todos
            .map(
                (todo) => `
            <li class="todo-item${todo.completed ? " completed" : ""}" data-id="${todo.id}">
                <input
                    type="checkbox"
                    class="todo-checkbox"
                    ${todo.completed ? "checked" : ""}
                    title="切换完成状态"
                >
                <div class="todo-content">
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                    ${todo.description ? `<div class="todo-desc">${escapeHtml(todo.description)}</div>` : ""}
                    <div class="todo-time">创建于 ${formatTime(todo.created_at)}</div>
                </div>
                <div class="todo-actions">
                    <button class="btn-icon btn-edit" title="编辑">✏️</button>
                    <button class="btn-icon btn-delete" title="删除">🗑️</button>
                </div>
            </li>`
            )
            .join("");
    }
    updateStats(todos);
}

function updateStats(todos) {
    const total = todos.length;
    const uncompleted = todos.filter((t) => !t.completed).length;
    statsText.textContent = `共 ${total} 条 · ${uncompleted} 条未完成`;
}

// ====== 刷新列表 ======
async function refreshList() {
    try {
        const todos = await fetchTodos();
        renderTodos(todos);
    } catch (err) {
        console.error(err);
        alert("加载待办列表失败，请检查后端是否正常运行。");
    }
}

// ====== 事件绑定 ======

// 1. 添加待办
addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = addTitle.value.trim();
    if (!title) return;
    try {
        await createTodo(title, addDesc.value.trim());
        addTitle.value = "";
        addDesc.value = "";
        await refreshList();
    } catch (err) {
        console.error(err);
        alert("添加失败，请重试。");
    }
});

// 2. 列表操作 —— 事件委托
todoList.addEventListener("click", async (e) => {
    const item = e.target.closest(".todo-item");
    if (!item) return;

    const id = Number(item.dataset.id);

    // 切换完成状态
    if (e.target.classList.contains("todo-checkbox")) {
        try {
            await toggleComplete(id);
            await refreshList();
        } catch (err) {
            console.error(err);
            alert("操作失败，请重试。");
        }
    }

    // 编辑
    if (e.target.closest(".btn-edit")) {
        const titleEl = item.querySelector(".todo-title");
        const descEl = item.querySelector(".todo-desc");
        editingId = id;
        editTitle.value = titleEl ? titleEl.textContent : "";
        editDesc.value = descEl ? descEl.textContent : "";
        editModal.classList.remove("hidden");
    }

    // 删除
    if (e.target.closest(".btn-delete")) {
        if (!confirm("确定要删除这条待办吗？")) return;
        try {
            await deleteTodo(id);
            await refreshList();
        } catch (err) {
            console.error(err);
            alert("删除失败，请重试。");
        }
    }
});

// 3. 编辑弹窗 —— 保存
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = editTitle.value.trim();
    if (!title) return;
    try {
        await updateTodo(editingId, {
            title,
            description: editDesc.value.trim(),
        });
        editModal.classList.add("hidden");
        editingId = null;
        await refreshList();
    } catch (err) {
        console.error(err);
        alert("保存失败，请重试。");
    }
});

// 4. 编辑弹窗 —— 取消
btnCancelEdit.addEventListener("click", () => {
    editModal.classList.add("hidden");
    editingId = null;
});

// 点击弹窗遮罩关闭
editModal.addEventListener("click", (e) => {
    if (e.target === editModal) {
        editModal.classList.add("hidden");
        editingId = null;
    }
});

// ====== 初始加载 ======
refreshList();
