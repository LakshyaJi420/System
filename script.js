document.addEventListener("DOMContentLoaded", () => {
  // --- Element References ---
  // Authentication
  const authSection = document.getElementById("auth-section");
  const authName = document.getElementById("authName");
  const authPassword = document.getElementById("authPassword");
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");

  // Main content container
  const mainContent = document.getElementById("main-content");

  // Sections
  const profileSection = document.getElementById("profile-section");
  const tasksSection = document.getElementById("tasks-section");
  const leaderboardSection = document.getElementById("leaderboard-section");
  const settingsSection = document.getElementById("settings-section");

  // Profile Elements
  const welcomeMsg = document.getElementById("welcomeMsg");
  const levelDisplay = document.getElementById("level");
  const xpDisplay = document.getElementById("xp");
  const rankDisplay = document.getElementById("rank");
  const titleDisplay = document.getElementById("title");

  // Task Elements
  const dailyTaskDisplay = document.getElementById("dailyTask");
  const taskTimerDisplay = document.getElementById("taskTimer");
  const completeTaskBtn = document.getElementById("completeTaskBtn");

  // Leaderboard
  const leaderboardList = document.getElementById("leaderboardList");

  // Settings Elements
  const changeNameBtn = document.getElementById("changeNameBtn");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const settingsLogoutBtn = document.getElementById("logoutBtn");

  // Navigation buttons
  const navButtons = document.querySelectorAll(".nav-btn");

  // --- Constants & Data ---
  const TASK_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  const dailyTasks = [
    { task: "Read a book for 30 minutes", xp: 20 },
    { task: "Run 1 km", xp: 15 },
    { task: "Walk for 30 minutes", xp: 10 }
  ];

  let currentUser = null;
  let taskInterval = null;

  // --- Utility Functions ---
  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }
  function loadUsers() {
    return JSON.parse(localStorage.getItem("users")) || {};
  }
  function saveCurrentUser() {
    let users = loadUsers();
    users[currentUser.username] = currentUser;
    saveUsers(users);
  }
  function updateUserStats(user) {
    while (user.xp >= user.level * 50) {
      user.xp -= user.level * 50;
      user.level++;
    }
    if (user.level < 5) {
      user.rank = "E Rank";
    } else if (user.level < 9) {
      user.rank = "A Rank";
    } else {
      user.rank = "S Rank";
    }
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
  function updateLeaderboard() {
    const users = loadUsers();
    const userArray = Object.values(users)
      .filter(user => user.username && user.username !== "Kirmada")
      .sort((a, b) => {
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
  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  // --- Daily Task Handling ---
  function assignDailyTask() {
    const now = Date.now();
    if (!currentUser.dailyTask || now - currentUser.dailyTask.assignedAt > TASK_DURATION) {
      const taskObj = dailyTasks[Math.floor(Math.random() * dailyTasks.length)];
      currentUser.dailyTask = {
        task: taskObj.task,
        xp: taskObj.xp,
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
      if (!currentUser.dailyTask.completed) {
        currentUser.xp = Math.max(0, currentUser.xp - 5);
        alert("You missed your daily task! You lost 5 XP.");
        updateUserStats(currentUser);
        saveCurrentUser();
        updateProfileDisplay();
      }
      alert("Daily task completed! New task will appear after the timer resets.");
      currentUser.dailyTask = null;
      assignDailyTask();
      return;
    }
    dailyTaskDisplay.textContent = `Task: ${currentUser.dailyTask.task} (XP: ${currentUser.dailyTask.xp})`;
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

  // --- Navigation ---
  function showSection(sectionId) {
    const sections = ["profile-section", "tasks-section", "leaderboard-section", "settings-section"];
    sections.forEach(id => {
      document.getElementById(id).style.display = (id === sectionId) ? "block" : "none";
    });
  }
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const sectionId = btn.getAttribute("data-section");
      showSection(sectionId);
    });
  });

  // --- Authentication Events ---
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

    authSection.style.display = "none";
    mainContent.style.display = "block";
    showSection("profile-section");
  });

  // --- Settings Events ---
  settingsLogoutBtn.addEventListener("click", () => {
    currentUser = null;
    authSection.style.display = "block";
    mainContent.style.display = "none";
    authName.value = "";
    authPassword.value = "";
  });
  changeNameBtn.addEventListener("click", () => {
    const newName = prompt("Enter your new username:");
    if (newName && newName.trim() !== "" && newName.trim() !== currentUser.username) {
      let users = loadUsers();
      if (users[newName]) {
        alert("This username is already taken.");
        return;
      }
      delete users[currentUser.username];
      currentUser.username = newName.trim();
      users[currentUser.username] = currentUser;
      saveUsers(users);
      alert("Username changed successfully!");
      updateProfileDisplay();
      updateLeaderboard();
    }
  });
  changePasswordBtn.addEventListener("click", () => {
    const newPassword = prompt("Enter your new password:");
    if (newPassword && newPassword.trim() !== "") {
      currentUser.password = newPassword.trim();
      saveCurrentUser();
      alert("Password changed successfully!");
    }
  });
  deleteAccountBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      let users = loadUsers();
      delete users[currentUser.username];
      saveUsers(users);
      alert("Account deleted successfully.");
      currentUser = null;
      authSection.style.display = "block";
      mainContent.style.display = "none";
    }
  });
});
