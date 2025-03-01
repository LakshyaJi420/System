document.addEventListener("DOMContentLoaded", () => {
    // ---------------- Authentication ----------------
    const authScreen = document.getElementById("authScreen");
    const mainScreen = document.getElementById("mainScreen");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");

    // ---------------- Main Elements ----------------
    const rankBackground = document.getElementById("rankBackground");
    const countdownEl = document.getElementById("countdown");
    const taskEls = document.querySelectorAll(".task");
    const completeTaskBtn = document.getElementById("completeTaskBtn");

    const profileSection = document.getElementById("profileSection");
    const leaderboardSection = document.getElementById("leaderboardSection");
    const settingsSection = document.getElementById("settingsSection");
    const adminSection = document.getElementById("adminPanel");
    const navButtons = document.querySelectorAll(".nav-btn");
    const backBtn = document.getElementById("backBtn");

    // Profile Elements
    const displayName = document.getElementById("profileName");
    const displayLevel = document.getElementById("profileLevel");
    const displayXP = document.getElementById("profileXP");
    const displayRank = document.getElementById("profileRank");
    const displayTitle = document.getElementById("profileTitle");
    const xpBar = document.getElementById("xpBar");
    const avatarImg = document.getElementById("avatar");
    const setAvatarBtn = document.getElementById("setAvatarBtn");
    const diaryList = document.getElementById("diaryList");
    const openDiaryBtn = document.getElementById("openDiaryBtn");

    // Settings Buttons
    const changeNameBtn = document.getElementById("changeNameBtn");
    const changePasswordBtn = document.getElementById("changePasswordBtn");
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    const settingsLogoutBtn = document.getElementById("settingsLogoutBtn");

    // Admin Buttons
    const awardXPBtn = document.getElementById("awardXPBtn");
    const deleteUserBtn = document.getElementById("deleteUserBtn");
    const urgentQuestBtn = document.getElementById("urgentQuestBtn");
    const adminControls = document.getElementById("adminPanel");

    // ---------------- Data & Constants ----------------
    const TASK_DURATION = 12 * 60 * 60 * 1000; // 12 hours
    const dailyTaskPool = [
        { task: "Read a book for 30 minutes", xp: 20 },
        { task: "Run 1 km", xp: 15 },
        { task: "Walk for 30 minutes", xp: 10 },
        { task: "Do 15 push-ups", xp: 10 },
        { task: "Meditate for 10 minutes", xp: 10 }
    ];
    let dailyTasks = []; // Will hold 3 tasks
    let taskTimer; // Countdown timer
    let countdownEnd; // Timestamp for reset

    let currentUser = null;

    // ---------------- Utility Functions ----------------
    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }
    function loadUsers() {
        return JSON.parse(localStorage.getItem("users")) || {};
    }
    function saveCurrentUser() {
        let users = loadUsers();
        users[currentUser.name] = currentUser;
        saveUsers(users);
    }
    function updateUserStats(user) {
        // Level up: every (current level * 50) XP required
        while (user.xp >= user.level * 50) {
            user.xp -= user.level * 50;
            user.level++;
            addDiaryEntry(`Leveled up to ${user.level} and earned title ${getTitle(user.level)}`);
        }
        // Update Rank based on level thresholds:
        if (user.level < 5) user.rank = "F";
        else if (user.level < 8) user.rank = "E";
        else if (user.level < 12) user.rank = "D";
        else if (user.level < 17) user.rank = "C";
        else if (user.level < 23) user.rank = "B";
        else if (user.level < 30) user.rank = "A";
        else user.rank = "S";
        user.title = getTitle(user.level);
    }
    function getTitle(level) {
        if (level < 5) return "Lost Wanderer";
        else if (level < 8) return "Rising Beginner";
        else if (level < 12) return "Iron Will";
        else if (level < 17) return "Swift Shadow";
        else if (level < 23) return "Awakened One";
        else if (level < 30) return "Dominant Force";
        else return "Monarch of Shadow";
    }
    function updateProfileDisplay() {
        displayName.innerText = currentUser.name;
        displayLevel.innerText = currentUser.level;
        displayXP.innerText = currentUser.xp;
        displayRank.innerText = currentUser.rank;
        displayTitle.innerText = currentUser.title;
        xpBar.value = currentUser.xp;
    }
    function updateBackground() {
        // Background image based on rank; expect images named f.jpg, e.jpg, d.jpg, c.jpg, b.jpg, a.jpg, s.jpg
        rankBackground.src = `images/${currentUser.rank.toLowerCase()}.jpg`;
    }
    function updateLeaderboard() {
        const users = loadUsers();
        const leaderboardList = document.getElementById("leaderboardList");
        leaderboardList.innerHTML = "";
        let userArray = Object.values(users)
            .filter(u => u.name && u.name.toLowerCase() !== "kirmada")
            .sort((a, b) => (b.level === a.level ? b.xp - a.xp : b.level - a.level));
        userArray.forEach(u => {
            let li = document.createElement("li");
            li.innerText = `${u.name} - Level: ${u.level}, XP: ${u.xp}, Rank: ${u.rank}, Title: ${u.title}`;
            leaderboardList.appendChild(li);
        });
    }
    function addDiaryEntry(entry) {
        let li = document.createElement("li");
        li.innerText = entry;
        diaryList.appendChild(li);
    }
    function resetDailyTasks() {
        dailyTasks = [];
        // Randomly select 3 distinct tasks from the pool
        while (dailyTasks.length < 3) {
            let randomTask = dailyTaskPool[Math.floor(Math.random() * dailyTaskPool.length)];
            if (!dailyTasks.find(t => t.task === randomTask.task)) {
                dailyTasks.push({ ...randomTask, completed: false });
            }
        }
        localStorage.setItem("dailyTasks", JSON.stringify(dailyTasks));
        // Set timer for next reset (set to midnight or every 12 hours)
        // For simplicity, we use a 12-hour countdown from now:
        countdownEnd = Date.now() + TASK_DURATION;
        startCountdown();
        renderTasks();
    }
    function renderTasks() {
        document.querySelectorAll(".task").forEach((el, index) => {
            if (dailyTasks[index]) {
                el.innerText = dailyTasks[index].task + (dailyTasks[index].completed ? " (Completed)" : "");
            }
        });
    }
    function startCountdown() {
        if (taskTimer) clearInterval(taskTimer);
        taskTimer = setInterval(() => {
            let remaining = countdownEnd - Date.now();
            if (remaining <= 0) {
                clearInterval(taskTimer);
                resetDailyTasks();
            } else {
                let hours = Math.floor(remaining / (1000 * 60 * 60));
                let minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((remaining % (1000 * 60)) / 1000);
                document.getElementById("countdown").innerText = `${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
            }
        }, 1000);
    }
    function confirmTaskCompletion() {
        // Show a confirmation popup with options "Done" and "Not Yet"
        if (confirm("Are you really done? If not, you're lying to yourself!\nPress OK for Done, Cancel for Not Yet.")) {
            completeAllTasks();
        }
    }
    function completeAllTasks() {
        dailyTasks.forEach(task => {
            if (!task.completed) {
                task.completed = true;
                currentUser.xp += task.xp;
            }
        });
        updateUserStats(currentUser);
        saveCurrentUser();
        localStorage.setItem("dailyTasks", JSON.stringify(dailyTasks));
        renderTasks();
        updateProfileDisplay();
        updateBackground();
        alert("Task completed! New tasks will appear after the timer resets.");
    }

    // ---------------- Navigation ----------------
    function showSection(sectionId) {
        document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
        document.getElementById(sectionId).classList.remove("hidden");
        document.getElementById("navButtons").classList.add("hidden");
        backBtn.classList.remove("hidden");
    }
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            showSection(btn.getAttribute("data-section"));
        });
    });
    backBtn.addEventListener("click", () => {
        document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
        document.getElementById("navButtons").classList.remove("hidden");
        backBtn.classList.add("hidden");
    });

    // ---------------- Set Avatar ----------------
    const setAvatarBtn = document.getElementById("setAvatarBtn");
    const avatarImg = document.getElementById("avatar");

    function setAvatar() {
        let avatarUrl = prompt("Enter avatar URL (leave blank to use default):");
        if (!avatarUrl || avatarUrl.trim() === "") {
            avatarUrl = "images/default-avatar.png";
        }
        avatarImg.src = avatarUrl;
        if (currentUser) {
            currentUser.avatar = avatarUrl;
            saveCurrentUser();
        } else {
            let tempUser = JSON.parse(localStorage.getItem("user")) || {};
            tempUser.avatar = avatarUrl;
            localStorage.setItem("user", JSON.stringify(tempUser));
        }
    }
    setAvatarBtn.addEventListener("click", setAvatar);

    // ---------------- Settings ----------------
    changeNameBtn.addEventListener("click", () => {
        let newName = prompt("Enter new username:");
        if (newName && newName.trim() !== "" && newName.trim() !== currentUser.name) {
            let users = loadUsers();
            if (users[newName]) {
                alert("Username already taken.");
                return;
            }
            delete users[currentUser.name];
            currentUser.name = newName.trim();
            users[currentUser.name] = currentUser;
            saveUsers(users);
            alert("Username changed successfully!");
            updateProfileDisplay();
            updateLeaderboard();
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
        if (confirm("Are you sure you want to delete your account? This cannot be restored.")) {
            let users = loadUsers();
            delete users[currentUser.name];
            saveUsers(users);
            alert("Account deleted.");
            localStorage.removeItem("currentUser");
            location.reload();
        }
    });
    settingsLogoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        location.reload();
    });

    // ---------------- Admin Controls (Only for Kirmada) ----------------
    // These buttons are visible if currentUser.name === "kirmada" and password is "ramram"
    function setupAdminControls() {
        if (currentUser.name.toLowerCase() === "kirmada" && currentUser.password === "ramram") {
            adminControls.innerHTML = "";
            let awardBtn = document.createElement("button");
            awardBtn.className = "action-btn";
            awardBtn.innerText = "Give XP";
            awardBtn.addEventListener("click", () => {
                let targetName = prompt("Enter username to award XP:");
                let xpAmount = parseInt(prompt("Enter XP amount:"));
                if (targetName && !isNaN(xpAmount)) {
                    let users = loadUsers();
                    if (users[targetName]) {
                        users[targetName].xp += xpAmount;
                        updateUserStats(users[targetName]);
                        saveUsers(users);
                        updateLeaderboard();
                        alert(`Awarded ${xpAmount} XP to ${targetName}.`);
                    } else {
                        alert("User not found.");
                    }
                }
            });
            let deleteBtn = document.createElement("button");
            deleteBtn.className = "action-btn";
            deleteBtn.innerText = "Delete User";
            deleteBtn.addEventListener("click", () => {
                let targetName = prompt("Enter username to delete:");
                if (targetName) {
                    let users = loadUsers();
                    if (users[targetName]) {
                        if (confirm(`Are you sure you want to delete ${targetName}?`)) {
                            delete users[targetName];
                            saveUsers(users);
                            updateLeaderboard();
                            alert(`User ${targetName} deleted.`);
                        }
                    } else {
                        alert("User not found.");
                    }
                }
            });
            let urgentBtn = document.createElement("button");
            urgentBtn.className = "action-btn";
            urgentBtn.innerText = "Send Urgent Quest";
            urgentBtn.addEventListener("click", () => {
                let targetName = prompt("Enter username for urgent quest:");
                let xpReward = parseInt(prompt("Enter XP reward for urgent quest:"));
                if (targetName && !isNaN(xpReward)) {
                    let users = loadUsers();
                    if (users[targetName]) {
                        users[targetName].dailyTask = {
                            task: `URGENT: Complete your quest immediately! (XP: ${xpReward})`,
                            xp: xpReward,
                            assignedAt: Date.now(),
                            completed: false,
                            urgent: true
                        };
                        saveUsers(users);
                        updateLeaderboard();
                        alert(`Urgent quest sent to ${targetName}.`);
                    } else {
                        alert("User not found.");
                    }
                }
            });
            adminControls.appendChild(awardBtn);
            adminControls.appendChild(deleteBtn);
            adminControls.appendChild(urgentBtn);
            document.getElementById("adminPanel").classList.remove("hidden");
        } else {
            document.getElementById("adminPanel").classList.add("hidden");
        }
    }

    // ---------------- Authentication ----------------
    function checkAuth() {
        const username = localStorage.getItem("currentUser");
        if (!username) return;

        authScreen.classList.add("hidden");
        mainScreen.classList.remove("hidden");

        let users = loadUsers();
        currentUser = users[username];
        updateUserStats(currentUser);
        updateProfileDisplay();
        updateBackground();
        updateLeaderboard();
        resetDailyTasks();
        setupAdminControls();
    }

    registerBtn.addEventListener("click", () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }
        let users = loadUsers();
        if (users[username]) {
            alert("User already exists! Please log in.");
            return;
        }
        users[username] = { name: username, password, level: 1, xp: 0, rank: "F", avatar: "images/default-avatar.png", diary: [] };
        saveUsers(users);
        alert("Registration successful! Please log in.");
    });

    loginBtn.addEventListener("click", () => {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        let users = loadUsers();
        if (!users[username] || users[username].password !== password) {
            alert("Invalid credentials!");
            return;
        }
        localStorage.setItem("currentUser", username);
        checkAuth();
    });

    // ---------------- Initialize ----------------
    if (localStorage.getItem("currentUser")) {
        checkAuth();
    } else {
        authScreen.classList.remove("hidden");
        mainScreen.classList.add("hidden");
    }
});
