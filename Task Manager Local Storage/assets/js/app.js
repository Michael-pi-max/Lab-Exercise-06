// Define UI Variables 
const taskInput = document.querySelector('#task'); //the task input text field
const form = document.querySelector('#task-form'); //The form at the top
const filter = document.querySelector('#filter'); //the task filter text field
const taskList = document.querySelector('.collection'); //The UL
const clearBtn = document.querySelector('.clear-tasks'); //the all task clear button
const reloadIcon = document.querySelector('.fa'); //the reload button at the top navigation 

const ascending = document.querySelector('.ascending');
const descending = document.querySelector('.descending');

// Add Event Listener  [Form , clearBtn and filter search input ]
form.addEventListener('submit', addNewTask);
clearBtn.addEventListener('click', clearAllTasks);
filter.addEventListener('keyup', filterTasks);
taskList.addEventListener('click', removeTask);
reloadIcon.addEventListener('click', reloadPage);
document.addEventListener('DOMContentLoaded', loadTasksfromDB);

// create the database
let TasksDB = indexedDB.open('tasks', 1);

// if there's an error
TasksDB.onerror = function() {
    console.log('There was an error');
}
// if everything is fine, assign the result to the instance
TasksDB.onsuccess = function() {
    console.log('Database Ready');
    // save the result
    DB = TasksDB.result;
    // display the Task List 
    displayTaskList();
}

// This method runs once (great for creating the schema)
TasksDB.onupgradeneeded = function(e) {
    // the event will be the database
    let db = e.target.result;

    // create an object store, 
    // keypath is going to be the Indexes
    let objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });

    // createindex: 1) field name 2) keypath 3) options
    objectStore.createIndex('taskname', 'taskname', { unique: false });

    console.log('Database ready and fields created!');
}


function addNewTask(e) {
    e.preventDefault(); //disable form submission


    // Check empty entry
    if (taskInput.value === '') {
        taskInput.style.borderColor = "red";

        return;
    }
  // create a new object with the form info
  let newTask = {
      taskname: taskInput.value
  }
  // Insert the object into the database 
  let transaction = DB.transaction(['tasks'], 'readwrite');
  let objectStore = transaction.objectStore('tasks');

  let request = objectStore.add(newTask);
  // on success
  request.onsuccess = () => {
      form.reset();
  }
  transaction.oncomplete = () => {
      console.log('New Task added');
      displayTaskList();
  }
  transaction.onerror = () => { console.log('There was an error, try again!'); }
}


function displayTaskList() {
    // clear the previous task list
    while (taskList.firstChild) {   taskList.removeChild(taskList.firstChild);}

    // create the object store
    let objectStore = DB.transaction('tasks').objectStore('tasks');

    objectStore.openCursor().onsuccess = function(e) {
        // assign the current cursor
        let cursor = e.target.result;

        if (cursor) {
                  ……..
            li.setAttribute('data-task-id', cursor.value.id);
            // Create text node and append it 
            li.appendChild(document.createTextNode(cursor.value.taskname));
             ……...
            cursor.continue();
        }
    }
}


//clear tasks 
function clearAllTasks() {
    //Create the transaction and object store
    let transaction = DB.transaction("tasks", "readwrite"); 
    let tasks = transaction.objectStore("tasks");

    // clear the the table
    tasks.clear(); 
    //repaint the UI
    displayTaskList();

    console.log("Tasks Cleared !!!");
}

// Filter tasks function definition 
function filterTasks(e) {

    /*  
    Instruction for Handling the Search/filter 
    
    1. Receive the user input from the text input 
    2. Assign it to a variable so the us can reuse it 
    3. Use the querySelectorAll() in order to get the collection of li which have  .collection-item class 
    4. Iterate over the collection item Node List using forEach
    5. On each element check if the textContent of the li contains the text from User Input  [can use indexOf]
    6 . If it contains , change the display content of the element as block , else none
    
    
    */

}

function removeTask(e) {
    if (e.target.parentElement.classList.contains('delete-item')) {
        if (confirm('Are You Sure about that ?')) {
            // get the task id
            let taskID = Number(e.target.parentElement.parentElement.getAttribute('data-task-id'));
            // use a transaction
            let transaction = DB.transaction(['tasks'], 'readwrite');
            let objectStore = transaction.objectStore('tasks');
            objectStore.delete(taskID);

            transaction.oncomplete = () => {
                e.target.parentElement.parentElement.remove();
            }

        }
    }
}



// Reload Page Function 
function reloadPage() {
    //using the reload fun on location object 
    location.reload();
}


// Load from Storage Database 
function loadTasksfromDB() {
    let listofTasks = loadfromDB();
    if (listofTasks.length != 0) {
        listofTasks.forEach(function(eachTask) {
            // Create an li element when the user adds a task 
            const li = document.createElement('li');
            // Adding a class
            li.className = 'collection-item';
            // Create text node and append it 
            li.appendChild(document.createTextNode(eachTask));
            // Create new element for the link 
            const link = document.createElement('a');
            // Add class and the x marker for a 
            link.className = 'delete-item secondary-content';
            link.innerHTML = '<i class="fa fa-remove"> </i>';
            // Append link to li
            li.appendChild(link);
            // Append to UL 
            taskList.appendChild(li);
        });

    }

}