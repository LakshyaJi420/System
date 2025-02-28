document.addEventListener("DOMContentLoaded", () => {
  // Element References
  const loginSection = document.getElementById("login-section");
  const profileSection = document.getElementById("profile-section");
  const tasksSection = document.getElementById("tasks-section");
  const leaderboardSection = document.getElementById("leaderboard-section");

  const loginName = document.getElementById("loginName");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const welcomeMsg = document.getElementById("welcomeMsg");
  const levelDisplay = document.getElementById("level");
  const xpDisplay = document.getElementById("xp");
  const rankDisplay = document.getElementById("rank");
  const titleDisplay = document.getElementById("title");

  const dailyTaskDisplay = document.getElementById("dailyTask");
  const taskTimerDisplay = document.getElementById("taskTimer");
  const completeTaskBtn = document.getElementById("completeTaskBtn");
  const taskWarning = document.getElementById("taskWarning");

  const leaderboardList = document.getElementById("leaderboardList");

  // Constants
  const TASK_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  // Sample Daily Tasks
  const dailyTasks = [
    { task: "Do 10 push-ups", xp: 10 },
    { task: "Run 1 km", xp: 15 },
    { task: "Walk for 30 minutes", xp: 10 }
  ];

  // Current logged-in user object
  let currentUser = null;
  let taskInterval = null;

  // Utility Functions
  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  function loadUsers() {
    return JSON.parse(localStorage.getItem("users")) || {};
  }
  
  // Assign a title and rank based on level
  function updateUserStats(user) {
    // For simplicity: level up every 50 XP
    while (user.xp >= user.level * 50) {
      user.xp -= user.level * 50;
      user.level++;
    }
    // Rank logic
    if (user.level < 5) {
      user.rank = "E Rank";
    } else if (user.level < 9) {
      user.rank = "A Rank";
    } else {
      user.rank = "S Rank";
    }
    // Title logic (you can expand this list)
    if (user.level === 1) user.title = "Novice Hunter";
    else if (user.level < 5) user.title = "Rookie Hunter";
    else if (user.level < 9) user.title = "Seasoned Hunter";
    else if (user.level < 12) user.title = "Elite Hunter";
    else user.title = "Sung Jin-Woo"; // Ultimate title for high levels
  }
  
  function updateProfileDisplay() {
    welcomeMsg.textContent = `Welcome, ${currentUser.name}!`;
    levelDisplay.textContent = currentUser.level;
    xpDisplay.textContent = currentUser.xp;
    rankDisplay.textContent = currentUser.rank;
    titleDisplay.textContent = currentUser.title;
  }
  
  // Leaderboard update: sorts all users by level and XP
  function updateLeaderboard() {
    const users = loadUsers();
    const userArray = Object.values(users).sort((a, b) => {
      if (b.level === a.level) return b.xp - a.xp;
      return b.level - a.level;
    });
    leaderboardList.innerHTML = "";
    userArray.forEach(user => {
      const li = document.createElement("li");
      li.textContent = `${user.name} - Level: ${user.level}, XP: ${user.xp}, Rank: ${user.rank}`;
      leaderboardList.appendChild(li);
    });
  }
  
  // Daily Task Handling
  function assignDailyTask() {
    // Check if there's already an active daily task for the user
    const now = Date.now();
    if (!currentUser.dailyTask || now - currentUser.dailyTask.assignedAt > TASK_DURATION) {
      // Assign a random task from dailyTasks
      const task = dailyTasks[Math.floor(Math.random() * dailyTasks.length)];
      currentUser.dailyTask = {
        task: task.task,
        xp: task.xp,
        assignedAt: now,
        completed: false
      };
      saveCurrentUser();
    }
    displayDailyTask();
  }
  
  function displayDailyTask() {
    const now = Date.now();
    const remaining = TASK_DURATION - (now - currentUser.dailyTask.assignedAt);
    if (remaining <= 0) {
      // Task expired; if not completed, penalize user.
      if (!currentUser.dailyTask.completed) {
        currentUser.xp = Math.max(0, currentUser.xp - 5); // Deduct 5 XP for failing
        alert("You missed your daily task! You lost 5 XP.");
        updateUserStats(currentUser);
        saveCurrentUser();
        updateProfileDisplay();
      }
      // Reassign a new daily task
      assignDailyTask();
      return;
    }
    dailyTaskDisplay.textContent = `Task: ${currentUser.dailyTask.task} (XP Reward: ${currentUser.dailyTask.xp})`;
    taskTimerDisplay.textContent = formatTime(remaining);
    
    // Update timer every second
    if (taskInterval) clearInterval(taskInterval);
    taskInterval = setInterval(() => {
      const now = Date.now();
      const remaining = TASK_DURATION - (now - currentUser.dailyTask.assignedAt);
      if (remaining <= 0) {
        clearInterval(taskInterval);
        displayDailyTask();
      } else {
        taskTimerDisplay.textContent = formatTime(remaining);
      }
    }, 1000);
  }
  
  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  
  // Save current user data to localStorage
  function saveCurrentUser() {
    const users = loadUsers();
    users[currentUser.name] = currentUser;
    saveUsers(users);
  }
  
  // Login / Register Event
  loginBtn.addEventListener("click", () => {
    const name = loginName.value.trim();
    const password = loginPassword.value; // In a real app, use proper hashing!
    if (!name || !password) {
      alert("Please enter a name and password.");
      return;
    }
    let users = loadUsers();
    if (!users[name]) {
      // Register new user
      users[name] = {
        name,
        password, // Not secure! For demo purposes only.
        level: 1,
        xp: 0,
        rank: "E Rank",
        title: "Novice Hunter",
        dailyTask: null
      };
      saveUsers(users);
    } else {
      // Login: check password
      if (users[name].password !== password) {
        alert("Incorrect password.");
        return;
      }
    }
    currentUser = users[name];
    updateUserStats(currentUser);
    updateProfileDisplay();
    assignDailyTask();
    updateLeaderboard();
    
    // Show/Hide sections
    loginSection.style.display = "none";
    profileSection.style.display = "block";
    tasksSection.style.display = "block";
    leaderboardSection.style.display = "block";
  });
  
  logoutBtn.addEventListener("click", () => {
    currentUser = null;
    loginSection.style.display = "block";
    profileSection.style.display = "none";
    tasksSection.style.display = "none";
    leaderboardSection.style.display = "none";
    loginName.value = "";
    loginPassword.value = "";
  });
  
  // Complete Task Button with Warning
  completeTaskBtn.addEventListener("click", () => {
    if (!currentUser.dailyTask || currentUser.dailyTask.completed) return;
    // Show a confirmation with a warning message.
    const confirmComplete = confirm(
      "Are you sure you've completed the task? If you lie to yourself, you'll lose XP and weaken your stats!"
    );
    if (confirmComplete) {
      currentUser.dailyTask.completed = true;
      currentUser.xp += currentUser.dailyTask.xp;
      updateUserStats(currentUser);
      alert("Task completed! Great job and keep pushing forward!");
      saveCurrentUser();
      updateProfileDisplay();
      // After task completion, assign a new task for the next day.
      assignDailyTask();
      updateLeaderboard();
    }
  });
  
  // (Optional) You can add more features here such as viewing task history, achievements, etc.
});
