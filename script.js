Document.addEventListener("DOMContentLoaded", () => {
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

  const adminSection = document.getElementById("admin-section");
  const adminUsersList = document.getElementById("adminUsersList");

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

  // Update user stats: level up, rank, and assign title based on XP and level
  function updateUserStats(user) {
    // Level up: every (current level * 50) XP needed to level up
    while (user.xp >= user.level * 50) {
      user.xp -= user.level * 50;
      user.level++;
    }
    // Rank determination
    if (user.level < 5) {
      user.rank = "E Rank";
    } else if (user.level < 9) {
      user.rank = "A Rank";
    } else {
      user.rank = "S Rank";
    }
    // Title assignment (inspired by Solo Leveling)
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

  // Update global leaderboard (exclude admin "Kirmada")
  function updateLeaderboard() {
    const users = loadUsers();
    const userArray = Object.values(users)
      .filter(user => user.username !== "Kirmada")
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

  // Admin Panel: List all users (except admin) with options to delete, award XP, or assign an urgent task
  function updateAdminPanel() {
    const users = loadUsers();
    const userArray = Object.values(users).filter(user => user.username !== "Kirmada");
    adminUsersList.innerHTML = "";
    userArray.forEach(user => {
      const userDiv = document.createElement("div");
      userDiv.className = "admin-user";
      userDiv.innerHTML = `<strong>${user.username}</strong> - Level: ${user.level}, XP: ${user.xp}`;
      
      // Delete user button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete User";
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
          deleteUser(user.username);
          updateAdminPanel();
          updateLeaderboard();
        }
      });
      userDiv.appendChild(deleteBtn);
      
      // Award XP button
      const awardBtn = document.createElement("button");
      awardBtn.textContent = "Award XP";
      awardBtn.addEventListener("click", () => {
        const xpAmount = parseInt(prompt(`Enter XP amount to award to ${user.username}:`));
        if (!isNaN(xpAmount)) {
      
