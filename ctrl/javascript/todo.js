import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
// firebase configuration 
const firebaseConfig = {
    apiKey: "AIzaSyCnUfHW7ZFMlAr7dCT6rN3hPiACME9hYYA",
    authDomain: "sandbox-bb9f2.firebaseapp.com",
    databaseURL: "https://sandbox-bb9f2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sandbox-bb9f2",
    storageBucket: "sandbox-bb9f2.firebasestorage.app",
    messagingSenderId: "118199686299",
    appId: "1:118199686299:web:02eef1d189e541eb8aa23e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null;
let tasksRef = null;
let goalsRef = null;
let notesRef = null;
let eventsRef = null;

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".tasks .add").forEach(button => {
        button.addEventListener("click", showTaskInputBox);
    });
    document.querySelectorAll(".weekly-goals .add").forEach(button => {
        button.addEventListener("click", showGoalInputBox);
    });
    document.querySelectorAll(".notes .add").forEach(button => {
        button.addEventListener("click", showNoteInputBox);
    });
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        tasksRef = collection(db, 'users', userId, 'tasks');
        goalsRef = collection(db, 'users', userId, 'weeklygoals');
        notesRef = collection(db, 'users', userId, 'notes');
        eventsRef = collection(db, 'users', userId, 'events');
        console.log('User logged in:', userId);

        await loadTasks();
        await loadGoals();
        await loadNotes();
    } else {
        console.log('User not logged in');
    }
});
//tasks
async function loadTasks() {
    if (!userId) return;
    const querySnapshot = await getDocs(tasksRef);
    querySnapshot.forEach((doc) => {
        addTaskToUI(doc.data(), doc.id);
    });
}


function showTaskInputBox() {
    const taskSection = document.querySelector(".tasks");
    if (!taskSection) return console.error("Tasks section not found");

    const inputBox = document.createElement("div");
    inputBox.classList.add("task-input-box");
    inputBox.innerHTML = `
        <input type="text" id="task-input" placeholder="Task Name">
        <select id="priority-select">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
        </select>
        <button id="add-task">Add</button>
    `;
    taskSection.prepend(inputBox);

    document.getElementById("add-task").addEventListener("click", async () => {
        await addTask();
        inputBox.remove();
    });
}

async function addTask() {
    if (!userId) return;

    const taskText = document.getElementById("task-input").value.trim();
    const priority = document.getElementById("priority-select").value;
    if (taskText) {
        const taskData = { text: taskText, priority, completed: false, createdAt: new Date().toISOString() };
        const taskDocRef = await addDoc(tasksRef, taskData);
        addTaskToUI(taskData, taskDocRef.id);
    }
}

function addTaskToUI(taskData, taskId) {
    const todoList = document.querySelector(".tasks ul");
    if (!todoList) return console.error("Tasks list not found");

    const li = document.createElement("li");
    li.classList.add("task-item");
    if (taskData.completed) {
        li.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = taskData.completed;
    checkbox.addEventListener("change", async function () {
        await setDoc(doc(db, 'users', userId, 'tasks', taskId), { completed: this.checked }, { merge: true });
        li.classList.toggle("completed", this.checked);
    });

    const priorityTag = document.createElement("span");
    priorityTag.textContent = taskData.priority.toUpperCase();
    priorityTag.classList.add("priority", taskData.priority);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.classList.add("delete-task");
    deleteBtn.addEventListener("click", async () => {
        await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
        li.remove();
    });

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(` ${taskData.text} `));
    li.appendChild(priorityTag);
    li.appendChild(deleteBtn);
    todoList.prepend(li);
}




//notes

async function loadNotes() {
    if (!userId) return;
    const querySnapshot = await getDocs(notesRef);
    const notesGrid = document.querySelector(".notes .notes-grid");
    notesGrid.innerHTML = "";
    querySnapshot.forEach((doc) => {
        addNoteToUI(doc.data(), doc.id);
    });
}

function showNoteInputBox() {
    const noteSection = document.querySelector(".notes");
    if (!noteSection) return console.error("Notes section not found");

    const inputBox = document.createElement("div");
    inputBox.classList.add("note-input-box");
    inputBox.innerHTML = `
        <textarea id="note-text" placeholder="Write your note..."></textarea>
        <button id="add-note">Save</button>
    `;
    noteSection.prepend(inputBox);

    document.getElementById("add-note").addEventListener("click", async () => {
        const noteText = document.getElementById("note-text").value.trim();
        if (noteText) {
            const noteData = { text: noteText, createdAt: new Date().toISOString() };
            const noteDocRef = await addDoc(notesRef, noteData);
            addNoteToUI(noteData, noteDocRef.id);
        }
        inputBox.remove();
    });
}

function addNoteToUI(noteData, noteId) {
    const notesGrid = document.querySelector(".notes .notes-grid");
    if (!notesGrid) return;
    
    const noteDiv = document.createElement("div");
    noteDiv.classList.add("note");
    noteDiv.style.width = "100px";
    noteDiv.style.height = "150px";
    noteDiv.style.overflowY = "auto";  // Vertical scroll if needed
    noteDiv.style.wordWrap = "break-word";  // Ensure text wraps
    noteDiv.style.padding = "10px";
    noteDiv.style.border = "1px solid #ccc";
    noteDiv.style.position = "relative";
    noteDiv.textContent = noteData.text;
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.classList.add("delete-note");
    deleteBtn.style.position = "absolute";
    deleteBtn.style.top = "5px";
    deleteBtn.style.right = "5px";
    deleteBtn.addEventListener("click", async () => {
        await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
        noteDiv.remove();
    });
    
    noteDiv.appendChild(deleteBtn);
    notesGrid.prepend(noteDiv);
}