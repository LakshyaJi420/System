document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.getElementById("username");
    const xpDisplay = document.getElementById("xp");
    const taskList = document.getElementById("task-list");
    const taskResetTimer = document.getElementById("task-reset-timer");

    const setAvatarBtn = document.getElementById("setAvatarBtn");
    const avatarImg = document.getElementById("avatar");

    let currentUser = JSON.parse(localStorage.getItem("user")) || null;

    // Load user data
    function loadUser() {
        if (currentUser) {
            usernameDisplay.textContent = currentUser.username || "Guest";
            xpDisplay.textContent = currentUser.xp || 0;
            avatarImg.src = currentUser.avatar || "images/default-avatar.png";
        }
    }

    function saveCurrentUser() {
        localStorage.setItem("user", JSON.stringify(currentUser));
    }

    // Set Avatar Function
    function setAvatar() {
        let avatarUrl = prompt("Enter avatar URL (leave blank to use default):");
        if (!avatarUrl || avatarUrl.trim() === "") {
            avatarUrl = "images/default-avatar.png";
        }
        avatarImg.src = avatarUrl;
        if (currentUser) {
            currentUser.avatar = avatarUrl;
            saveCurrentUser();
        }
    }

    setAvatarBtn.addEventListener("click", setAvatar);

    // Task generation based on XP
    function generateDailyTasks() {
        let xp = currentUser ? currentUser.xp : 0;
        let tasks = [];

        if (xp < 50) {
            tasks = ["Read a book", "Walk 30 minutes", "Drink a glass of water"];
        } else if (xp < 200) {
            tasks = ["Run 2 km", "Drink 2L water", "Stretch for 15 minutes"];
        } else {
            tasks = ["Workout 30 min", "Meditate 20 min", "Try a new skill"];
        }

        let selectedTasks = [];
        while (selectedTasks.length < 3) {
            let randomTask = tasks[Math.floor(Math.random() * tasks.length)];
            if (!selectedTasks.includes(randomTask)) {
                selectedTasks.push({ text: randomTask, completed: false });
            }
        }

        localStorage.setItem("dailyTasks", JSON.stringify(selectedTasks));
        return selectedTasks;
    }

    // Load daily tasks
    function loadTasks() {
        let savedTasks = JSON.parse(localStorage.getItem("dailyTasks")) || generateDailyTasks();
        taskList.innerHTML = "";
        let completedTasks = 0;

        savedTasks.forEach((task, index) => {
            const taskItem = document.createElement("li");
            taskItem.textContent = task.text;
            taskItem.classList.add("task-item");
            if (task.completed) {
                taskItem.classList.add("completed");
                completedTasks++;
            }
            taskItem.addEventListener("click", () => completeTask(index));
            taskList.appendChild(taskItem);
        });

        if (completedTasks === savedTasks.length) {
            taskResetTimer.textContent = "New tasks will appear after midnight.";
        } else {
            taskResetTimer.textContent = "";
        }
    }

    function completeTask(index) {
        let tasks = JSON.parse(localStorage.getItem("dailyTasks"));
        if (!tasks[index].completed) {
            tasks[index].completed = true;
            currentUser.xp += 10;
            saveCurrentUser();
            localStorage.setItem("dailyTasks", JSON.stringify(tasks));
            loadTasks();
            loadUser();
        }
    }

    // Reset tasks daily at midnight
    function checkTaskReset() {
        let lastReset = localStorage.getItem("lastReset");
        let today = new Date().toDateString();

        if (lastReset !== today) {
            localStorage.setItem("lastReset", today);
            generateDailyTasks();
        }
    }

    checkTaskReset();
    loadUser();
    loadTasks();
});
