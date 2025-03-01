document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const profileBtn = document.getElementById("profileBtn");
    const leaderboardBtn = document.getElementById("leaderboardBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const backBtn = document.getElementById("backBtn");

    let currentUser = JSON.parse(localStorage.getItem("user"));

    function updateUI() {
        document.getElementById("displayName").innerText = currentUser.name;
        document.getElementById("level").innerText = currentUser.level;
        document.getElementById("rank").innerText = currentUser.rank;
        document.getElementById("title").innerText = currentUser.title;
        document.getElementById("xp").innerText = currentUser.xp;
        document.getElementById("xpBar").value = currentUser.xp;
        document.getElementById("rank-bg").src = `images/${currentUser.rank.toLowerCase()}.jpg`;
    }

    loginBtn.addEventListener("click", function () {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === "Kirmada" && password === "ramram") {
            currentUser = { name: "Kirmada", level: 1, xp: 0, rank: "F", title: "Beginner" };
            localStorage.setItem("user", JSON.stringify(currentUser));
            document.getElementById("auth-screen").classList.add("hidden");
            document.getElementById("main-screen").classList.remove("hidden");
            updateUI();
        }
    });

    profileBtn.addEventListener("click", function () {
        hideAll();
        document.getElementById("profile").classList.remove("hidden");
    });

    leaderboardBtn.addEventListener("click", function () {
        hideAll();
        document.getElementById("leaderboard").classList.remove("hidden");
    });

    settingsBtn.addEventListener("click", function () {
        hideAll();
        document.getElementById("settings").classList.remove("hidden");
    });

    backBtn.addEventListener("click", function () {
        hideAll();
        document.getElementById("buttons").classList.remove("hidden");
    });

    function hideAll() {
        document.getElementById("profile").classList.add("hidden");
        document.getElementById("leaderboard").classList.add("hidden");
        document.getElementById("settings").classList.add("hidden");
        document.getElementById("buttons").classList.add("hidden");
        backBtn.classList.remove("hidden");
    }
});
