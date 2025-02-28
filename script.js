document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("register-btn");
  const getTaskBtn = document.getElementById("get-task-btn");
  const completeTaskBtn = document.getElementById("complete-task-btn");
  const nameInput = document.getElementById("name");
  const ageInput = document.getElementById("age");
  const weightInput = document.getElementById("weight");
  const heightInput = document.getElementById("height");
  const welcomeMsg = document.getElementById("welcome");
  const taskDisplay = document.getElementById("task");
  const feedbackDisplay = document.getElementById("feedback");
  const leaderboardDisplay = document.getElementById("leaderboard");
  
  let currentUser = null;
  let currentTask = null;
  
  // Sample tasks based on levels
  const tasks = [
    { level: 1, task: "Do 10 push-ups", xp: 10 },
    { level: 1, task: "Run 500 meters", xp: 10 },
    { level: 2, task: "Do 20 push-ups", xp: 20 },
    { level: 2, task: "Run 1 km", xp: 20 },
    { level: 3, task: "Do 30 push-ups", xp: 30 },
    { level: 3, task: "Run 2 km", xp: 30 },
    { level: 4, task: "Do 40 push-ups", xp: 40 },
    { level: 4, task: "Run 3 km", xp: 40 },
    // Add more tasks as desired...
    { level: 5, task: "Do 50 push-ups", xp: 50 },
    { level: 5, task: "Run 5 km", xp: 50 }
  ];
  
  // Load users from localStorage or initialize empty object
  let users = JSON.parse(localStorage.getItem("users")) || {};
  
  function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  function updateLeaderboard() {
    leaderboardDisplay.innerHTML = "";
    const userArray = Object.values(users).sort((a, b) => b.level - a.level || b.xp - a.xp);
    userArray.forEach(user => {
      const li = document.createElement("li");
      li.textContent = `${user.name} - Level: ${user.level}, XP: ${user.xp}`;
      leaderboardDisplay.appendChild(li);
    });
  }
  
  registerBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const age = parseInt(ageInput.value.trim());
    const weight = parseInt(weightInput.value.trim());
    const height = parseInt(heightInput.value.trim());
    if (!name || isNaN(age) || isNaN(weight) || isNaN(height)) {
      alert("Please fill in all fields correctly.");
      return;
    }
    if (!users[name]) {
      users[name] = {
        name,
        age,
        weight,
        height,
        level: 1,
        xp: 0,
        completedTasks: [],
        skippedTasks: 0
      };
      saveUsers();
    }
    currentUser = users[name];
    welcomeMsg.textContent = `Welcome, ${currentUser.name}! Level: ${currentUser.level}`;
    document.getElementById("registration").style.display = "none";
    document.getElementById("content").style.display = "block";
    updateLeaderboard();
  });
  
  getTaskBtn.addEventListener("click", () => {
    if (!currentUser) return;
    // Get a random task based on user's level
    const availableTasks = tasks.filter(t => t.level === currentUser.level);
    if (availableTasks.length === 0) {
      taskDisplay.textContent = "No tasks available for your level.";
      return;
    }
    currentTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
    taskDisplay.textContent = `Task: ${currentTask.task} (XP: ${currentTask.xp})`;
    completeTaskBtn.style.display = "inline-block";
  });
  
  completeTaskBtn.addEventListener("click", () => {
    if (!currentUser || !currentTask) return;
    // Simulate task completion
    currentUser.xp += currentTask.xp;
    currentUser.completedTasks.push(currentTask.task);
    feedbackDisplay.textContent = "Task completed! Great job!";
    // Level up logic: level up every 50 XP for simplicity
    while (currentUser.xp >= currentUser.level * 50) {
      currentUser.xp -= currentUser.level * 50;
      currentUser.level++;
      feedbackDisplay.textContent += " You've leveled up!";
    }
    users[currentUser.name] = currentUser;
    saveUsers();
    updateLeaderboard();
    // Hide complete button after completion
    completeTaskBtn.style.display = "none";
    taskDisplay.textContent = "";
  });
});