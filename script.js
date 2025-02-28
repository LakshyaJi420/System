// User Data (Stored in localStorage)
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    id: Date.now(),
    nickname: 'Guest',
    level: 1,
    xp: 0,
    rank: 'F',
    avatar: 'images/default-avatar.png',
    isAdmin: false
};

// Admin Credentials (Hardcoded)
const ADMIN_USER = 'Kirmada';
const ADMIN_PASS = 'ramram';

// Initialize
function init() {
    document.getElementById('nickname').textContent = currentUser.nickname;
    document.getElementById('level').textContent = currentUser.level;
    document.getElementById('xp').textContent = currentUser.xp;
    document.getElementById('rank').textContent = currentUser.rank;
    document.getElementById('avatarImg').src = currentUser.avatar;
    updateLeaderboard();
}

// Complete Task
function completeTask(taskType, xp) {
    currentUser.xp += xp;
    if (currentUser.xp >= 100) {
        currentUser.level++;
        currentUser.xp -= 100;
        alert(`🎉 Level Up! You're now Level ${currentUser.level}`);
    }
    updateRank();
    saveUser();
    init();
}

// Update Rank (F → E → D → C → B → A → S)
function updateRank() {
    const ranks = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
    const rankIndex = Math.min(Math.floor(currentUser.level / 5), ranks.length - 1);
    currentUser.rank = ranks[rankIndex];
}

// Admin Functions
function showAdminModal() {
    document.getElementById('adminModal').style.display = 'block';
}

function adminLogin() {
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        currentUser.isAdmin = true;
        alert('⚡ GOD MODE ACTIVATED!');
    } else {
        alert('❌ Invalid credentials!');
    }
    document.getElementById('adminModal').style.display = 'none';
}

// Save to localStorage
function saveUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Leaderboard (Simulated)
function updateLeaderboard() {
    // For simplicity, uses only the current user
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = `
        <div class="rank-entry">
            ${currentUser.nickname} - Level ${currentUser.level} (${currentUser.rank})
        </div>
    `;
}

// Initialize on load
init();
