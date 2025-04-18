console.clear();

// Language list
const languageFlags = [
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', flag: '🇸🇦' },
  { code: 'cs-CZ', name: 'Czech (Czech Republic)', flag: '🇨🇿' },
  { code: 'da-DK', name: 'Danish (Denmark)', flag: '🇩🇰' },
  { code: 'de-DE', name: 'German (Germany)', flag: '🇩🇪' },
  { code: 'el-GR', name: 'Greek (Greece)', flag: '🇬🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
  { code: 'fi-FI', name: 'Finnish (Finland)', flag: '🇫🇮' },
  { code: 'fr-CA', name: 'French (Canada)', flag: '🇨🇦' },
  { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷' },
  { code: 'he-IL', name: 'Hebrew (Israel)', flag: '🇮🇱' },
  { code: 'hi-IN', name: 'Hindi (India)', flag: '🇮🇳' },
  { code: 'hu-HU', name: 'Hungarian (Hungary)', flag: '🇭🇺' },
  { code: 'it-IT', name: 'Italian (Italy)', flag: '🇮🇹' },
  { code: 'ja-JP', name: 'Japanese (Japan)', flag: '🇯🇵' },
];

// Load saved language or default to en-US
let selectedLang = localStorage.getItem("language") || "en-US";
document.getElementById("current-lang").innerText = selectedLang;

// Show language list on button click
document.getElementById("current-lang").addEventListener("click", () => {
  const dialog = document.getElementById("language-dialog");
  dialog.innerHTML = "<h3>Select Language</h3>";
  languageFlags.forEach(lang => {
    const btn = document.createElement("button");
    btn.innerText = `${lang.flag} ${lang.name}`;
    btn.onclick = () => {
      selectedLang = lang.code;
      localStorage.setItem("language", selectedLang);
      document.getElementById("current-lang").innerText = selectedLang;
      dialog.close();
    };
    dialog.appendChild(btn);
    dialog.appendChild(document.createElement("br"));
  });
  dialog.showModal();
});

// Auth Functions
function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    return showMessage("Please enter both username and password");
  }

  if (localStorage.getItem(username)) {
    showMessage("Username already exists!");
  } else {
    localStorage.setItem(username, password);
    showMessage("Registered successfully! You can now login.");
  }
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    return showMessage("Enter both fields");
  }

  const storedPassword = localStorage.getItem(username);

  if (storedPassword === password) {
    showMessage("Login successful!");
    document.getElementById("auth").style.display = "none";
    document.getElementById("clockSection").style.display = "block";
  } else {
    showMessage("Invalid credentials");
  }
}

function showMessage(msg) {
  document.getElementById("authMessage").innerText = msg;
}
