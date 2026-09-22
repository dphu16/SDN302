let todos = [
  { id: 1715000000000, text: "Học DOM Manipulation", completed: false },
  { id: 1715000000001, text: "Dựng khung HTML và CSS", completed: true }
];

function savetoLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos() {
    // xoa danh sach hien tai
    document.getElementById("todo-list").innerHTML = "";

    // duyet qua danh sach todos va tao ra cac the li
    todos.forEach((todo) => {
        const li = document.createElement("li");

        // gan class completed neu status la true
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        // gan id vao thuoc tinh dataset de nhan khi click
        li.dataset.id = todo.id;
        
        li.innerHTML = 
        `<label class="todo-content">
          <input
            type="checkbox"
            class="todo-checkbox"
            ${todo.completed ? 'checked' : ''}
            >
            <span class="todo-text">${todo.text}</span>
        </label>
        <button class="btn-delete" title="Xoa"></button>`;

        document.getElementById("todo-list").appendChild(li);
    });
}

function addTodo(text) {
    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false
    };

    todos.push(newTodo);
    savetoLocalStorage();
    rederTodos();
}

renderTodos();