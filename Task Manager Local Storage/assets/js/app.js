const taskInput = document.querySelector("#task"); 
const form = document.querySelector("#task-form"); 
const filter = document.querySelector("#filter"); 
const taskList = document.querySelector(".collection"); 
const clearBtn = document.querySelector(".clear-tasks"); 
const ascending = document.querySelector('.ascending');
const descending = document.querySelector('.descending');

const reloadIcon = document.querySelector(".fa"); 

let DB;

document.addEventListener("DOMContentLoaded", () => {

    form.addEventListener('submit', addNewTask);
    clearBtn.addEventListener('click', clearAllTasks);
    filter.addEventListener('keyup', filterTasks);
    taskList.addEventListener('click', removeTask);
    reloadIcon.addEventListener('click', reloadPage);

    ascending.addEventListener('click', sortTasksAsc);
    descending.addEventListener('click', sortTasksDesc);

    let TasksDB = indexedDB.open("tasks", 1);
    TasksDB.onerror = function () {
        console.log("There was an error");
    };
    TasksDB.onsuccess = function () {
        DB = TasksDB.result;
        displayTaskList();
    };

    TasksDB.onupgradeneeded = function (e) {
        let db = e.target.result;

        let objectStore = db.createObjectStore("tasks", {
        keyPath: "id",
        autoIncrement: true,
        });

        objectStore.createIndex("taskname", "taskname", { unique: false });

        console.log("Database ready and fields created!");
    };


    function addNewTask(e) {
        e.preventDefault();
        if (taskInput.value === "") {
            taskInput.style.borderColor = "red";
        return;
        }
        let newTask = {
            taskname: taskInput.value,
            taskdate: new Date(),
        };

        // Insert the object into the database
        let transaction = DB.transaction(["tasks"], "readwrite");
        let objectStore = transaction.objectStore("tasks");

        let request = objectStore.add(newTask);

        // on success
        request.onsuccess = () => {
            console.log("on success")
            form.reset();
        };
        transaction.oncomplete = () => {
            console.log("New appointment added");
            displayTaskList();
        };
        transaction.onerror = () => {
            console.log("There was an error, try again!");
        };
    }

    function displayTaskList() {
        while (taskList.firstChild) {
            taskList.removeChild(taskList.firstChild);
        }

        let objectStore = DB.transaction("tasks").objectStore("tasks");

        objectStore.openCursor().onsuccess = function (e) {
        let cursor = e.target.result;

        if (cursor) {
            const li = document.createElement("li");
            li.setAttribute("data-task-id", cursor.value.id);
            li.className = "collection-item";
            li.appendChild(document.createTextNode(cursor.value.taskname));
            const link = document.createElement("a");
            link.className = "delete-item secondary-content";
            link.innerHTML = `
                    <i class="fa fa-remove"></i>
                    &nbsp;
                    <a href="./edit.html?id=${cursor.value.id}"><i class="fa fa-edit"></i> </a>
                    `;
            li.appendChild(link);
            taskList.appendChild(li);
            cursor.continue();
        }
        };
    }

    // Remove task event [event delegation]
    taskList.addEventListener("click", removeTask);

    function removeTask(e) {
        if (e.target.parentElement.classList.contains("delete-item")) {
        if (confirm("Are You Sure about that ?")) {
            // get the task id
            let taskID = Number(
            e.target.parentElement.parentElement.getAttribute("data-task-id")
            );
            // use a transaction
            let transaction = DB.transaction(["tasks"], "readwrite");
            let objectStore = transaction.objectStore("tasks");
            objectStore.delete(taskID);

            transaction.oncomplete = () => {
            e.target.parentElement.parentElement.remove();
            };
        }
        }
    }


    //clear tasks
    function clearAllTasks() {
        let transaction = DB.transaction("tasks", "readwrite");
        let tasks = transaction.objectStore("tasks");
        // clear the table.
        tasks.clear();
        displayTaskList();
        console.log("Tasks Cleared !!!");
    }

    function sortTasksAsc(e){
        let container = taskList;
        container.innerHTML = "";
        let objectStore = DB.transaction("tasks").objectStore("tasks");
        var allRecords = objectStore.getAll();
        allRecords.onsuccess = function() {
            const taskNames = allRecords.result.map((allRecord) => ({
                taskname : allRecord.taskname,
                taskDate :  allRecord.taskdate,
            }));
            taskNames.sort(function(a,b){
                let aa = a.taskDate;
                let bb = b.taskDate;
                return aa < bb ? -1 : (aa > bb ? 1 : 0);
            }).forEach((li, index) => {
                list = document.createElement("li");
                list.setAttribute("data-task-id", index + 1);
                list.className = "collection-item";
                list.appendChild(document.createTextNode(li.taskname));
                const link = document.createElement("a");
                link.className = "delete-item secondary-content";
                link.innerHTML = `
                    <i class="fa fa-remove"></i>
                    &nbsp;
                    <a href="./edit.html?id=${index + 1}"><i class="fa fa-edit"></i> </a>
                    `;
                list.appendChild(link); 
                container.appendChild(list);
            });
        };
    }
    
    function sortTasksDesc(e){
        let container = taskList;
        container.innerHTML = "";
        let objectStore = DB.transaction("tasks").objectStore("tasks");
        var allRecords = objectStore.getAll();
        allRecords.onsuccess = function() {
            const taskNames = allRecords.result.map((allRecord) => ({
                taskname : allRecord.taskname,
                taskDate :  allRecord.taskdate,
            }));
            taskNames.sort(function(a,b){
                let aa = a.taskDate;
                let bb = b.taskDate;
                return aa > bb ? -1 : (aa < bb ? 1 : 0);
            }).forEach((li, index) => {
                list = document.createElement("li");
                list.setAttribute("data-task-id", index + 1);
                list.className = "collection-item";
                list.appendChild(document.createTextNode(li.taskname));
                const link = document.createElement("a");
                link.className = "delete-item secondary-content";
                link.innerHTML = `
                    <i class="fa fa-remove"></i>
                    &nbsp;
                    <a href="./edit.html?id=${index + 1}"><i class="fa fa-edit"></i> </a>
                    `;
                list.appendChild(link); 
                container.appendChild(list);
            });
            //.forEach(li => container.appendChild(li));
        };
    }
    
    function filterTasks(e) {
        const inputText = e.target.value.toLowerCase();
        const tasks = Array.from(taskList.children);
        tasks.forEach(function(task){
            let title = task.innerText;
            if(title.toLowerCase().indexOf(inputText) != -1){
                task.style.display = "block";
            }else{
                task.style.display = "none";
            }
        });
        console.log(Array.from(taskList.children).map((val) => val.innerHTML));
    };
    
    function reloadPage() {
        location.reload();
    }
});
