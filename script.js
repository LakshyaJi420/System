/* script.js */

// Initialize user data (persisted in localStorage)
let user = {
  nickname: localStorage.getItem('nickname') || "Guest",
  avatar: localStorage.getItem('avatar') || "default-avatar.png",
  xp: parseInt(localStorage.getItem('xp')) || 0,
  level: parseInt(localStorage.getItem('level')) || 1,
};

// Rank thresholds (example values)
const ranks = [
  { threshold: 0, rank: 'F' },
  { threshold: 100, rank: 'E' },
  { threshold: 200, rank: 'D' },
  { threshold: 300, rank: 'C' },
  { threshold: 400, rank: 'B' },
  { threshold: 500, rank: 'A' },
  { threshold: 600, rank: 'S' }
];

// Determine title based on level
function getTitle(level) {
  if (level >= 100) return "Monarch of Shadow";
  if (level >= 50) return "Elite Master";
  if (level >= 20) return "Seasoned Warrior";
  return "Newbie";
}

// Calculate level from XP (e.g., every 100 XP equals a new level)
function calculateLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

// Determine rank based on XP
function getRank(xp) {
  let rank = 'F';
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (xp >= ranks[i].threshold) {
      rank = ranks[i].rank;
      break;
    }
  }
  return rank;
}

// Update the user profile display
function updateProfileDisplay() {
  document.getElementById('nickname').innerText = user.nickname;
  document.getElementById('avatar').src = user.avatar;
  user.level = calculateLevel(user.xp);
  document.getElementById('level').innerText = user.level;
  document.getElementById('xp').innerText = user.xp;
  document.getElementById('rank').innerText = getRank(user.xp);
  document.getElementById('title').innerText = getTitle(user.level);
}

// Save user data to localStorage
function saveUserData() {
  localStorage.setItem('nickname', user.nickname);
  localStorage.setItem('avatar', user.avatar);
  localStorage.setItem('xp', user.xp);
  localStorage.setItem('level', user.level);
}

// When a task checkbox is checked, add the corresponding XP
document.querySelectorAll('.task-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', function () {
    if (this.checked) {
      let xpToAdd = parseInt(this.closest('li').getAttribute('data-xp'));
      user.xp += xpToAdd;
      updateProfileDisplay();
      saveUserData();
      updateLeaderboard();
      // Simple animation: flash background
      this.closest('li').style.backgroundColor = "#d4edda";
      setTimeout(() => {
        this.closest('li').style.backgroundColor = "";
      }, 500);
    }
  });
});

// Reset all tasks (uncheck checkboxes)
document.getElementById('reset-tasks').addEventListener('click', function () {
  document.querySelectorAll('.task-checkbox').forEach(cb => (cb.checked = false));
});

// Update profile when user clicks "Update Profile"
document.getElementById('update-profile').addEventListener('click', function () {
  const newNickname = document.getElementById('nickname-input').value.trim();
  const newAvatar = document.getElementById('avatar-input').value.trim();
  if (newNickname) {
    user.nickname = newNickname;
  }
  if (newAvatar) {
    user.avatar = newAvatar;
  }
  updateProfileDisplay();
  saveUserData();
  updateLeaderboard();
});

// Simulated Leaderboard (using localStorage to store sample users)
// In a real system, this data would come from a backend.
function updateLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = "";
  let sampleUsers = JSON.parse(localStorage.getItem('sampleUsers')) || [];

  // Add or update current user in sampleUsers
  let exists = sampleUsers.some(u => u.nickname === user.nickname);
  if (!exists) {
    sampleUsers.push({ ...user });
  } else {
    sampleUsers = sampleUsers.map(u => u.nickname === user.nickname ? { ...user } : u);
  }

  // Sort users by XP in descending order
  sampleUsers.sort((a, b) => b.xp - a.xp);
  localStorage.setItem('sampleUsers', JSON.stringify(sampleUsers));

  sampleUsers.forEach(u => {
    let li = document.createElement('li');
    li.innerText = `${u.nickname} - Level: ${calculateLevel(u.xp)} - XP: ${u.xp} - Rank: ${getRank(u.xp)}`;
    leaderboard.appendChild(li);
  });
}

// Admin Login & Controls
document.getElementById('admin-login-btn').addEventListener('click', function () {
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;
  if (username === "Kirmada" && password === "ramram") {
    alert("Admin login successful!");
    document.getElementById('admin-controls').classList.remove('hidden');
  } else {
    alert("Incorrect admin credentials.");
  }
});

// Admin Control: Add XP to current user (example: add 100 XP or a custom value)
document.getElementById('admin-add-xp').addEventListener('click', function () {
  const xpToAdd = parseInt(prompt("Enter XP to add:", "100"));
  if (!isNaN(xpToAdd)) {
    user.xp += xpToAdd;
    updateProfileDisplay();
    saveUserData();
    updateLeaderboard();
  }
});

// Admin Control: Delete user data (resets current user's info)
document.getElementById('admin-delete-user').addEventListener('click', function () {
  if (confirm("Are you sure you want to delete current user data?")) {
    localStorage.removeItem('nickname');
    localStorage.removeItem('avatar');
    localStorage.removeItem('xp');
    localStorage.removeItem('level');
    user = {
      nickname: "Guest",
      avatar: "default-avatar.png",
      xp: 0,
      level: 1
    };
    updateProfileDisplay();
    updateLeaderboard();
  }
});

// On page load, update displays
updateProfileDisplay();
updateLeaderboard();
