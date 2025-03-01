document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
});

let currentUser = null;

function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[username]) {
        alert("Username already exists!");
        return;
    }

    users[username] = { password, level: 1, xp: 0, rank: "F" };
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful!");
}

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || {};
    if (!users[username] || users[username].password !== password) {
        alert("Invalid credentials!");
        return;
    }

    localStorage.setItem("currentUser", username);
    checkAuth();
}

function checkAuth() {
    const username = localStorage.getItem("currentUser");
    if (!username) return;

    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("mainScreen").classList.remove("hidden");

    let users = JSON.parse(localStorage.getItem("users"));
    currentUser = users[username];

    document.getElementById("profileName").innerText = username;
    document.getElementById("profileLevel").innerText = currentUser.level;
    document.getElementById("profileXP").innerText = currentUser.xp;
    document.getElementById("profileRank").innerText = currentUser.rank;

    if (username === "kirmada") {
        document.getElementById("adminSection").classList.remove("hidden");
    }
}

function confirmTaskCompletion() {
    if (confirm("Are you really done? If not, you're lying to yourself!")) {
        alert("Task completed! XP awarded.");
    }
}

function showSection(section) {
    document.getElementById("profileSection").classList.add("hidden");
    document.getElementById("leaderboardSection").classList.add("hidden");
    document.getElementById("settingsSection").classList.add("hidden");
    document.getElementById(section).classList.remove("hidden");
}
