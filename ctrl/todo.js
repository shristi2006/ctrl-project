const addButton = document.getElementById('add-btn');
        const inputField = document.getElementById('todo-input');
        const prioritySelect = document.getElementById('priority-select');
        const todoList = document.getElementById('todo-list');

        addButton.addEventListener('click', function() {
            const taskText = inputField.value.trim();
            const priority = prioritySelect.value;
            if (taskText) {
                const li = document.createElement('li');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';

                checkbox.addEventListener('change', function() {
                    if (checkbox.checked) {
                        li.classList.add('completed');
                    } else {
                        li.classList.remove('completed');
                    }
                });

                const taskLabel = document.createElement('span');
                taskLabel.textContent = taskText;

                const priorityLabel = document.createElement('span');
                priorityLabel.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
                priorityLabel.classList.add('priority');
                priorityLabel.classList.add(`priority-${priority}`);

                li.appendChild(checkbox);
                li.appendChild(taskLabel);
                li.appendChild(priorityLabel);
                todoList.appendChild(li);
                
                inputField.value = '';
            }
        });

        inputField.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                addButton.click();
            }
        });