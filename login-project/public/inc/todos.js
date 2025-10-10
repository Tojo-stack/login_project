async function loadTodos() {
    try{
        const res = await fetch('/todos', { 
        method: 'GET',
        credentials: 'same-origin',
        headers: {'Accept' : 'application/json'}
    });

    if (!res.ok) {
        console.error('Erreur fetch todos', res.status);
        return;
    }

    const todos = await res.json();
    const list = document.getElementById('todo-list');
    list.innerHTML = ''

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${todo.done ? "<s>" + todo.task + "</s>" : todo.task}
            <button class="done-btn" data-id="${todo.id}" style="">Fait</button>
            <button class="delete-btn" data-id="${todo.id}">Supprimer</button>
        `;
        list.appendChild(li);
    });

    // ... Gestion des clics 'Fait' ...
    document.querySelectorAll('.done-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id
                const res = await fetch(`/todos/${id}/done`, { method: 'POST' })
                if (res.ok) loadTodos()
            })
        })

        // ... Gestion des clics 'Supprimer' ...
    document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id
                const res = await fetch(`/todos/${id}/delete`, { method: 'POST' })
                if (res.ok) loadTodos()
            })
        })


    }catch (err){
        console.error ('Erreur fetch todos: ', err)
    }
    
}



//  ... Ajouter une tâche ...
document.getElementById('add-form').addEventListener('submit', async (e) =>{
    e.preventDefault()
    const taskInput = document.getElementById('task-input').value.trim()
    if (!taskInput) return

    const res = await fetch('/todos', {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({task: taskInput})
    })

    if(res.ok){
        document.getElementById('task-input').value = ''
        loadTodos()
    }else{
        console.error('Erreur ajout todo', res.status)
    }
})

loadTodos();