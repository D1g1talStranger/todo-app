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

list.addEventListener("change", (event) => {
    if (!event.target.matches('input[data-action="toggle"]')) return;
    const li = event.target.closest("li");
    const id = Number(li.dataset.id);
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    todo.completed = event.target.checked;
    commit();
});

function renderTodos() {
    renderFilterUI();
    list.innerHTML = "";

    const clearBtn = document.querySelector("#clear-completed");
    clearBtn.hidden = !todos.some((todo) => todo.completed);

    const visibleTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    })

    visibleTodos.forEach((todo) => {
        const li = document.createElement("li");
        li.dataset.id = todo.id

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.completed;
        checkbox.dataset.action = "toggle";

        const textSpan = document.createElement("span");
        textSpan.tabIndex = 0;
        textSpan.textContent = todo.text;

        textSpan.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;
            if (event.key === "Escape") {
                textSpan.blur();
                return;
            }
          
            editTodo(todo);
        });

        textSpan.addEventListener("dblclick", () => {
            editTodo(todo);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.action = "delete";

        if (todo.completed) {
            li.style.textDecoration = "line-through";
        }

        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });

    const completed = todos.filter((todo) => todo.completed).length;
    const total = todos.length;
    countEl.textContent = `${completed} of ${total} completed`;
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
    const li = event.target.closest("li");
    if (!li) return;
  
    const id = Number(li.dataset.id);
  
    if (event.target.matches('button[data-action="delete"]')) {
      const index = todos.findIndex((t) => t.id === id);
      if (index === -1) return;
      todos.splice(index, 1);
      commit();
      return;
    }
});

form.addEventListener("submit", () => {
    const text = input.value.trim();
    if (text === "") return;

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
    }
  
    event.preventDefault();
    todos.push(todo);
    commit();
    form.reset();
    input.focus();
});

renderTodos();
input.focus();
console.log(form);
console.log(input);
const taskText = input.value.trim() + "test";
console.log(taskText);
