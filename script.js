document.addEventListener("DOMContentLoaded", () => {
  // --- Element References ---
  // Auth
  const authSection = document.getElementById("auth-section");
  const authName = document.getElementById("authName");
  const authPassword = document.getElementById("authPassword");
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");
  
  // Main Content & Sections
  const mainContent = document.getElementById("main-content");
  const profileSection = document.getElementById("profile-section");
  const tasksSection = document.getElementById("tasks-section");
  const leaderboardSection = document.getElementById("leaderboard-section");
  const settingsSection = document.getElementById("settings-section");
  const adminPanel = document.getElementById("admin-panel");
  
  // Profile Elements
  const userNameDisplay = document.getElementById("user-name");
  const avatarImg = document.getElementById("avatar");
  const setAvatarBtn = document.getElementById("setAvatarBtn");
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
  
  // Settings Buttons
  const changeNameBtn = document.getElementById("changeNameBtn");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const settingsLogoutBtn = document.getElementById("settingsLogoutBtn");
  
  // Navigation Bar
  const navButtons = document.querySelectorAll(".nav-btn");
  const navBar = document.getElementById("nav-bar");
  
  // Admin Panel Container
  const adminControls = document.getElementById("adminControls");
  
  // --- Constants & Data ---
  const TASK_DURATION = 12 * 60 * 60 * 1000; // 12 hours
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
    if (user.level < 5) user.rank = "E Rank";
    else if (user.level < 9) user.rank = "A Rank";
    else user.rank = "S Rank";
  
    if (user.level === 1) user.title = "Novice Hunter";
    else if (user.level < 5) user.title = "Rookie Hunter";
    else if (user.level < 9) user.title = "Seasoned Hunter";
    else if (user.level < 12) user.title = "Elite Hunter";
    else if (user.level < 15) user.title = "Elite Master";
    else user.title = "Monarch of Shadow";
  }
  function updateProfileDisplay() {
    userNameDisplay.innerText = currentUser.username;
    levelDisplay.innerText = currentUser.level;
    xpDisplay.innerText = currentUser.xp;
    rankDisplay.innerText = currentUser.rank;
    titleDisplay.innerText = currentUser.title;
  }
  function updateLeaderboard() {
    const users = loadUsers();
    const userArray = Object.values(users)
      .filter(user => user.username && user.username !== "Kirmada")
      .sort((a, b) => (b.level === a.level ? b.xp - a.xp : b.level - a.level));
    leaderboardList.innerHTML = "";
    userArray.forEach(user => {
      let li = document.createElement("li");
      li.innerText = `${user.username} - Level: ${user.level}, XP: ${user.xp}, Rank: ${user.rank}, Title: ${user.title}`;
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
    dailyTaskDisplay.innerText = `Task: ${currentUser.dailyTask.task} (XP: ${currentUser.dailyTask.xp})`;
    taskTimerDisplay.innerText = formatTime(remaining);
    if (taskInterval) clearInterval(taskInterval);
    taskInterval = setInterval(() => {
      const now = Date.now();
      const rem = TASK_DURATION - (now - currentUser.dailyTask.assignedAt);
      if (rem <= 0) {
        clearInterval(taskInterval);
        displayDailyTask();
      } else {
        taskTimerDisplay.innerText = formatTime(rem);
      }
    }, 1000);
  }
  
  // --- Navigation ---
  function showSection(sectionId) {
    ["profile-section", "tasks-section", "leaderboard-section", "settings-section"].forEach(id => {
      document.getElementById(id).classList.add("hidden");
    });
    document.getElementById(sectionId).classList.remove("hidden");
  }
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.getAttribute("data-section");
      showSection(section);
    });
  });
  
  // --- Admin Panel ---
  function updateAdminPanel() {
    const users = loadUsers();
    const adminList = Object.values(users).filter(user => user.username && user.username !== "Kirmada");
    adminControls.innerHTML = "";
    adminList.forEach(user => {
      let div = document.createElement("div");
      div.className = "admin-control";
      div.innerHTML = `<strong>${user.username}</strong> - Level: ${user.level}, XP: ${user.xp}`;
      let awardBtn = document.createElement("button");
      awardBtn.className = "action-btn";
      awardBtn.innerText = "Award XP";
      awardBtn.addEventListener("click", () => {
        let xp = parseInt(prompt(`Enter XP to award to ${user.username}:`));
        if (!isNaN(xp)) {
          user.xp += xp;
          updateUserStats(user);
          saveUsers(users);
          updateLeaderboard();
          updateAdminPanel();
          alert(`Awarded ${xp} XP to ${user.username}.`);
        }
      });
      let deleteBtn = document.createElement("button");
      deleteBtn.className = "action-btn";
      deleteBtn.innerText = "Delete User";
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Delete account of ${user.username}?`)) {
          delete users[user.username];
          saveUsers(users);
          updateLeaderboard();
          updateAdminPanel();
          alert(`${user.username} deleted.`);
        }
      });
      div.appendChild(awardBtn);
      div.appendChild(deleteBtn);
      adminControls.appendChild(div);
    });
  }
  
  // --- Settings ---
  changeNameBtn.addEventListener("click", () => {
    let newName = prompt("Enter new username:");
    if (newName && newName.trim() !== "" && newName.trim() !== currentUser.username) {
      let users = loadUsers();
      if (users[newName]) {
        alert("Username already taken.");
        return;
      }
      delete users[currentUser.username];
      currentUser.username = newName.trim();
      users[currentUser.username] = currentUser;
      saveUsers(users);
      updateProfileDisplay();
      updateLeaderboard();
      alert("Username changed successfully!");
    }
  });
  changePasswordBtn.addEventListener("click", () => {
    let newPass = prompt("Enter new password:");
    if (newPass && newPass.trim() !== "") {
      currentUser.password = newPass.trim();
      saveCurrentUser();
      alert("Password changed successfully!");
    }
  });
  deleteAccountBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete your account?")) {
      let users = loadUsers();
      delete users[currentUser.username];
      saveUsers(users);
      alert("Account deleted.");
      currentUser = null;
      location.reload();
    }
  });
  settingsLogoutBtn.addEventListener("click", () => {
    currentUser = null;
    location.reload();
  });
  
  // --- Authentication ---
  registerBtn.addEventListener("click", () => {
    let username = authName.value.trim();
    let password = authPassword.value.trim();
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }
    let users = loadUsers();
    if (users[username]) {
      alert("User already registered! Please log in.");
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
    alert("Registration successful! Please log in.");
  });
  
  loginBtn.addEventListener("click", () => {
    let username = authName.value.trim();
    let password = authPassword.value.trim();
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }
    let users = loadUsers();
    if (!users[username]) {
      alert("User not found! Please register.");
      return;
    }
    if (users[username].password !== password) {
      alert("Incorrect password.");
      return;
    }
    currentUser = users[username];
    updateUserStats(currentUser);
    updateProfileDisplay();
    assignDailyTask();
    updateLeaderboard();
    authSection.classList.add("hidden");
    mainContent.classList.remove("hidden");
    navBar.classList.remove("hidden");
    showSection("profile-section");
    // If admin (Kirmada with password "ramram")
    if (currentUser.username === "Kirmada" && currentUser.password === "ramram") {
      adminPanel.classList.remove("hidden");
      updateAdminPanel();
    } else {
      adminPanel.classList.add("hidden");
    }
  });
});
