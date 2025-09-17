async function loadTodos() {
    try{
        const res = await fetch('/todos', { 
        method: 'GET',
        credentials: 'same-origin',
        headers: {'Accept' : 'application/json'}
    });

    console.log('Réponse fectch', res)

    if (!res.ok) {
        console.error('Erreur fetch todos', res.status);
        return;
    }
    console.log('Réponse fetch: ', res)
    const todos = await res.json();
    console.log('Todos reçus: ', todos)
    const list = document.getElementById('todo-list');
    list.innerHTML = ''

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${todo.done ? "<s>" + todo.task + "</s>" : todo.task}
            <form style="display:inline" action="/todos/${todo.id}/done" method="POST">
                <button type="submit">Fait</button>
            </form>
            <form style="display:inline" action="/todos/${todo.id}/delete" method="POST">
                <button type="submit">Supprimer</button>
            </form>
        `;
        list.appendChild(li);
    });
    }catch (err){
        console.error ('Erreur fetch todos: ', err)
    }
    
}

loadTodos();