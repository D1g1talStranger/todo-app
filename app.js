const STORAGE_KEY = "todos";
const FILTER_KEY = "filter";
const todos = [];
let filter = "all"
const filterAllBtn = document.querySelector("#filter-all");
const filterActiveBtn = document.querySelector("#filter-active");
const filterCompletedBtn = document.querySelector("#filter-completed");
const savedFilter = localStorage.getItem(FILTER_KEY);
if (savedFilter) filter = savedFilter;
renderFilterUI();
const countEl = document.querySelector("#todo-count");
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
    todos.push(...JSON.parse(saved));
}

function renderFilterUI() {
    filterAllBtn.disabled = filter === "all";
    filterActiveBtn.disabled = filter === "active";
    filterCompletedBtn.disabled = filter === "completed";
}


document.querySelector("#filter-all").addEventListener("click", () => {
    filter = "all";
    commit();
});

document.querySelector("#filter-active").addEventListener("click", () => {
    filter = "active";
    commit();
});

document.querySelector("#filter-completed").addEventListener("click", () => {
    filter = "completed";
    commit();
});

document.querySelector("#clear-completed").addEventListener("click", () => {
    if (!todos.some((todo) => todo.completed)) return;

    const ok = confirm("Clear all completed todos?");
    if (!ok) return;

    const activeTodos = todos.filter((t) => !t.completed);
    todos.length = 0;
    todos.push(...activeTodos);
    commit();
});

document.querySelector("#reset-app").addEventListener("click", () => {
    const ok = confirm("This will delete all todos. Continue?");
    if (!ok) return;

    todos.length = 0;
    filter = "all";
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FILTER_KEY);
    renderTodos();
    renderFilterUI();
    input.focus();
});

const input = document.querySelector("#todo-input");
const form = document.querySelector("#todo-form");
const list = document.querySelector("#todo-list");

function renderTodos() {
    renderFilterUI();
    list.textContent = "";

    const clearBtn = document.querySelector("#clear-completed");
    clearBtn.hidden = !todos.some((todo) => todo.completed);

    const visibleTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    })

    const frag = document.createDocumentFragment();

    visibleTodos.forEach((todo) => {
        const li = document.createElement("li");
        li.dataset.completed = String(todo.completed);
        li.dataset.id = todo.id
        li.setAttribute("role", "listitem");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.completed;
        checkbox.dataset.action = "toggle";
        checkbox.setAttribute("aria-checked", String(todo.completed));

        const textSpan = document.createElement("span");
        textSpan.tabIndex = 0;
        textSpan.textContent = todo.text;
        textSpan.dataset.action = "edit"
        textSpan.setAttribute("role", "button")

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.action = "delete";

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(deleteBtn);
        frag.appendChild(li);
    });

    list.appendChild(frag);
    const completed = todos.filter((todo) => todo.completed).length;
    const total = todos.length;
    countEl.textContent = `${completed} of ${total} completed`;
}

function getTodoContext(event) {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl || !list.contains(actionEl)) return null;

    const li = actionEl.closest("li");
    if (!li) return null;

    const id = li.dataset.id;
    if (!id) return null;

    return {
        actionEl,
        action: actionEl.dataset.action,
        li,
        id,
    };
}

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function commit() {
    localStorage.setItem(FILTER_KEY, filter);
    saveTodos();
    renderTodos();
}

function editTodo(todo) {
    const nextText = prompt("Edit todo:", todo.text);
    if (nextText === null) return;
  
    const trimmed = nextText.trim();
    if (trimmed === "") return;
  
    todo.text = trimmed;
    commit();
}

list.addEventListener("click", (event) => {
    const ctx = getTodoContext(event);
    if (!ctx) return;

    if (ctx.action === "delete") {
      const index = todos.findIndex((todo) => String(todo.id) === String(ctx.id));
      if (index === -1) return;
      todos.splice(index, 1);
      commit();
      return;
    }

    if (ctx.action === "toggle") {
        const checkbox = ctx.actionEl;
        if (!(checkbox instanceof HTMLInputElement)) return;
        if (checkbox.type !== "checkbox") return;

        const todo = todos.find((todo) => String(todo.id) === String(ctx.id));
        if (!todo) return;

        todo.completed = checkbox.checked;
        commit();
        return;
    }
});

list.addEventListener("dblclick", (event) => {
    const editEl = event.target.closest('[data-action="edit"]');
    if (!editEl || !list.contains(editEl)) return;
    const li = editEl.closest("li");
    const id = li.dataset.id;
    if (!id) return;
    const todo = todos.find(todo => String(todo.id) === String(id));
    if (!todo) return;
    editTodo(todo);
});

list.addEventListener("keydown", (event) => {
    const editEl = event.target.closest('[data-action="edit"]');
    if (!editEl || !list.contains(editEl)) return;
    if (event.repeat) return;

    const li = editEl.closest("li");
    if (!li) return;
    
    const id = li.dataset.id;
    if (!id) return;

    const todo = todos.find((todo) => String(todo.id) === String(id));
    if (!todo) return;

    if (event.isComposing) return;

    if (event.key === "Enter") {
        event.preventDefault();
        editTodo(todo);
    }

    if (event.key === " ") {
        event.preventDefault();
        editTodo(todo);
    }

    if (event.key === "Escape") {
        event.preventDefault();
        editEl.blur();
    }
});

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = input.value.trim();
    if (text === "") return;

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
    }
  
    todos.push(todo);
    commit();
    form.reset();
    input.focus();
});

renderTodos();
input.focus();