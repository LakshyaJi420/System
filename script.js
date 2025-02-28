document.addEventListener("DOMContentLoaded", () => {
  // Element References
  const authSection = document.getElementById("auth-section");
  const authName = document.getElementById("authName");
  const authPassword = document.getElementById("authPassword");
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");

  const profileSection = document.getElementById("profile-section");
  const welcomeMsg = document.getElementById("welcomeMsg");
  const levelDisplay = document.getElementById("level");
  const xpDisplay = document.getElementById("xp");
  const rankDisplay = document.getElementById("rank");
  const titleDisplay = document.getElementById("title");
  const logoutBtn = document.getElementById("logoutBtn");

  const tasksSection = document.getElementById("tasks-section");
  const dailyTaskDisplay = document.getElementById("dailyTask");
  const taskTimerDisplay = document.getElementById("taskTimer");
  const completeTaskBtn = document.getElementById("completeTaskBtn");

  const leaderboardSection = document.getElementById("leaderboard-section");
  const leaderboardList = document.getElementById("leaderboardList");

  // Constants
  const TASK_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  // Sample Daily Tasks (quests)
  const dailyTasks = [
    { task: "Do 10 push-ups", xp: 10 },
    { task: "Run 1 km", xp: 15 },
    { task: "Walk for 30 minutes", xp: 10 }
  ];

  let currentUser = null;
  let taskInterval = null;

  // Utility functions to work with localStorage
  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  function loadUsers() {
    return JSON.parse(localStorage.getItem("users")) || {};
  }

  // Function to update user's stats based on XP and level thresholds
  function updateUserStats(user) {
    // Level up: every (current level * 50) XP is needed to level up
    while (user.xp >= user.level * 50) {
      user.xp -= user.level * 50;
      user.level++;
    }
    // Rank determination: E Rank for low, A Rank for mid, S Rank for high
    if (user.level < 5) {
      user.rank = "E Rank";
    } else if (user.level < 9) {
      user.rank = "A Rank";
    } else {
      user.rank = "S Rank";
    }
    // Title assignment based on level (inspired by Solo Leveling)
    if (user.level === 1) {
      user.title = "Novice Hunter";
    } else if (user.level < 5) {
      user.title = "Rookie Hunter";
    } else if (user.level < 9) {
      user.title = "Seasoned Hunter";
    } else if (user.level < 12) {
      user.title = "Elite Hunter";
    } else if (user.level < 15) {
      user.title = "Elite Master";
    } else {
      user.title = "Monarch of Shadow";
    }
  }

  function updateProfileDisplay() {
    welcomeMsg.textContent = `Welcome, ${currentUser.username}!`;
    levelDisplay.textContent = currentUser.level;
    xpDisplay.textContent = currentUser.xp;
    rankDisplay.textContent = currentUser.rank;
    titleDisplay.textContent = currentUser.title;
  }

  // Update the global leaderboard
  function updateLeaderboard() {
    const users = loadUsers();
    const userArray = Object.values(users).sort((a, b) => {
      if (b.level === a.level) return b.xp - a.xp;
      return b.level - a.level;
    });
    leaderboardList.innerHTML = "";
    userArray.forEach(user => {
      const li = document.createElement("li");
      li.textContent = `${user.username} - Level: ${user.level}, XP: ${user.xp}, Rank: ${user.rank}, Title: ${user.title}`;
      leaderboardList.appendChild(li);
    });
  }

  // Daily Task (Quest) Handling
  function assignDailyTask() {
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
      // If task expired and not completed, apply penalty
      if (!currentUser.dailyTask.completed) {
        currentUser.xp = Math.max(0, currentUser.xp - 5);
        alert("You missed your daily task! You lost 5 XP.");
        updateUserStats(currentUser);
        saveCurrentUser();
        updateProfileDisplay();
      }
      assignDailyTask();
      return;
    }
    dailyTaskDisplay.textContent = `Task: ${currentUser.dailyTask.task} (XP Reward: ${currentUser.dailyTask.xp})`;
    taskTimerDisplay.textContent = formatTime(remaining);
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

  function saveCurrentUser() {
    const users = loadUsers();
    users[currentUser.username] = currentUser;
    saveUsers(users);
  }

  // --- Authentication Events ---

  // Register new user
  registerBtn.addEventListener("click", () => {
    const username = authName.value.trim();
    const password = authPassword.value.trim();
    if (!username || !password) {
      alert("Please enter both a username and a password.");
      return;
    }
    let users = loadUsers();
    if (users[username]) {
      alert("User already registered! Please use the login button.");
      return;
    }
    // Create new user object with default stats
    users[username] = {
      username,
      password,
      level: 1,
      xp: 0,
      rank: "E Rank",
      title: "Novice Hunter",
      dailyTask: null
    };
    saveUsers(users);
    alert("Registered new user! Now please log in.");
  });

  // Login existing user
  loginBtn.addEventListener("click", () => {
    const username = authName.value.trim();
    const password = authPassword.value.trim();
    if (!username || !password) {
      alert("Please enter both a username and a password.");
      return;
    }
    let users = loadUsers();
    if (!users[username]) {
      alert("User not found! Please register first.");
      return;
    }
    if (users[username].password !== password) {
      alert("Incorrect password. Please try again.");
      return;
    }
    currentUser = users[username];
    updateUserStats(currentUser);
    updateProfileDisplay();
    assignDailyTask();
    updateLeaderboard();
    // Show main sections and hide authentication
    authSection.style.display = "none";
    profileSection.style.display = "block";
    tasksSection.style.display = "block";
    leaderboardSection.style.display = "block";
  });

  // Logout event
  logoutBtn.addEventListener("click", () => {
    currentUser = null;
    authSection.style.display = "block";
    profileSection.style.display = "none";
    tasksSection.style.display = "none";
    leaderboardSection.style.display = "none";
    authName.value = "";
    authPassword.value = "";
  });

  // Complete Daily Task (Quest) event with confirmation warning
  completeTaskBtn.addEventListener("click", () => {
    if (!currentUser.dailyTask || currentUser.dailyTask.completed) return;
    const confirmComplete = confirm("Are you sure you've completed the task? If you lie to yourself, you'll lose XP and weaken your stats!");
    if (confirmComplete) {
      currentUser.dailyTask.completed = true;
      currentUser.xp += currentUser.dailyTask.xp;
      updateUserStats(currentUser);
      alert("Task completed! Great job and keep pushing forward!");
      saveCurrentUser();
      updateProfileDisplay();
      assignDailyTask();
      updateLeaderboard();
    }
  });
});
