// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2x6hE6WwhjFSUJ18dEwkrXhO6Zlj53z0",
  authDomain: "todo-app-with-database-dceca.firebaseapp.com",
  databaseURL: "https://todo-app-with-database-dceca-default-rtdb.firebaseio.com",
  projectId: "todo-app-with-database-dceca",
  storageBucket: "todo-app-with-database-dceca.appspot.com",
  messagingSenderId: "995423941719",
  appId: "1:995423941719:web:1d2b11030d5fb95bd6df12",
  measurementId: "G-2XFL9J8M5C"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const notCompletedTasks = document.getElementById('notCompletedTasks');
const completedTasks = document.getElementById('completedTasks');

const tasksRef = database.ref('tasks');

addTaskBtn.addEventListener('click', addList);
taskInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    addList();
  }
});

function addList() {
  const newTask = taskInput.value.trim();
  if (newTask !== '') {
    const taskData = {
      task: newTask,
      completed: false
    };

    tasksRef.push(taskData)
      .then(() => {
        taskInput.value = '';
      })
      .catch((error) => {
        console.error("Error adding task: ", error);
      });
  }
}

function createTaskElement(taskKey, taskData) {
  const newLi = document.createElement('li');
  const checkBtn = document.createElement('button');
  const delBtn = document.createElement('button');

  checkBtn.innerHTML = '<i class="fa fa-check"></i>';
  delBtn.innerHTML = '<i class="fa fa-trash"></i>';

  newLi.textContent = taskData.task;
  newLi.setAttribute('data-key', taskKey);
  newLi.appendChild(checkBtn);
  newLi.appendChild(delBtn);

  if (taskData.completed) {
    completedTasks.appendChild(newLi);
    checkBtn.style.display = 'none';
  } else {
    notCompletedTasks.appendChild(newLi);
  }

  checkBtn.addEventListener('click', () => {
    markTaskAsCompleted(taskKey);
  });

  delBtn.addEventListener('click', () => {
    deleteTask(taskKey);
  });
}

function markTaskAsCompleted(taskKey) {
  const taskRef = tasksRef.child(taskKey);
  taskRef.update({ completed: true })
    .then(() => {
      taskRef.once('value', (snapshot) => {
        const taskData = snapshot.val();
        const taskElement = document.querySelector(`li[data-key="${taskKey}"]`);
        taskElement.remove();
        createTaskElement(taskKey, taskData);
      });
    })
    .catch((error) => {
      console.error("Error marking task as completed: ", error);
    });
}

function deleteTask(taskKey) {
  const taskRef = tasksRef.child(taskKey);
  taskRef.remove()
    .catch((error) => {
      console.error("Error deleting task: ", error);
    });
}

// Listen for child added events
tasksRef.on('child_added', (snapshot) => {
  const taskKey = snapshot.key;
  const taskData = snapshot.val();
  createTaskElement(taskKey, taskData);
});

// Listen for child changed events
tasksRef.on('child_changed', (snapshot) => {
  const taskKey = snapshot.key;
  const taskData = snapshot.val();
  const taskElement = document.querySelector(`li[data-key="${taskKey}"]`);
  taskElement.remove();
  createTaskElement(taskKey, taskData);
});

// Listen for child removed events
tasksRef.on('child_removed', (snapshot) => {
  const taskKey = snapshot.key;
  const taskElement = document.querySelector(`li[data-key="${taskKey}"]`);
  taskElement.remove();
});