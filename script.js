document.addEventListener("DOMContentLoaded", function() {
    loadUserData();
    loadTasks();
});

function showSection(section) {
    document.querySelectorAll("main section").forEach(s => s.classList.add("hidden"));
    document.getElementById(section).classList.remove("hidden");
}

function loadUserData() {
    let user = JSON.parse(localStorage.getItem("user")) || { name: "Guest", avatar: "images/default-avatar.png" };
    document.getElementById("user-name").innerText = user.name;
    document.getElementById("avatar").src = user.avatar;
}

function setAvatar() {
    let avatarUrl = prompt("Enter avatar URL:");
    if (avatarUrl) {
        document.getElementById("avatar").src = avatarUrl;
        let user = JSON.parse(localStorage.getItem("user")) || {};
        user.avatar = avatarUrl;
        localStorage.setItem("user", JSON.stringify(user));
    }
}

function loadTasks() {
    let tasks = ["Read a book", "Run 1 km", "Walk 30 minutes"];
    let taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    tasks.forEach(task => {
        let taskItem = document.createElement("div");
        taskItem.innerHTML = `<p>${task} <button onclick="completeTask('${task}')">Complete</button></p>`;
        taskList.appendChild(taskItem);
    });
}

function completeTask(task) {
    alert(task + " completed!");
    document.getElementById("task-list").innerHTML = "<p>New tasks will appear after timer ends.</p>";
    setTimeout(loadTasks, 10000);
}

function changeName() {
    let newName = prompt("Enter new name:");
    if (newName) {
        let user = JSON.parse(localStorage.getItem("user")) || {};
        user.name = newName;
        localStorage.setItem("user", JSON.stringify(user));
        document.getElementById("user-name").innerText = newName;
    }
}

function changePassword() {
    alert("Password change feature coming soon.");
}

function logout() {
    alert("Logged out!");
    localStorage.removeItem("user");
    location.reload();
}

function deleteAccount() {
    if (confirm("Are you sure you want to delete your account?")) {
        localStorage.removeItem("user");
        alert("Account deleted.");
        location.reload();
    }
}
