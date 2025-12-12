// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  document.getElementById("theme-icon").textContent = isDark ? "☀️" : "🌙";
  document.getElementById("theme-text").textContent = isDark
    ? "Light Mode"
    : "Dark Mode";
  localStorage.setItem("darkMode", isDark);
}

// Load dark mode preference
window.addEventListener("load", function () {
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-icon").textContent = "☀️";
    document.getElementById("theme-text").textContent = "Light Mode";
  }
});

function showPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(page + "-page").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// thanh tiến trình cuộn
window.addEventListener("scroll", function () {
  const scrollProgress = document.querySelector(".scroll-progress");
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrollPercentage = (scrollTop / scrollHeight) * 100;
  scrollProgress.style.width = scrollPercentage + "%";
});

// kéo thả nhân vật
const character = document.getElementById("character");
let isDragging = false; // trạng thái đang kéo
let startX, startY;
let offsetX, offsetY;
let originalBottom, originalRight;

// lưu vị trí ban đầu
originalBottom = 30;
originalRight = 30;

// tạo sự kiện khi bắt đầu di chuột vào nhân vật
character.addEventListener("mousedown", function (e) {
  isDragging = true;
  character.classList.add("dragging");

  startX = e.clientX;
  startY = e.clientY;

  const rect = character.getBoundingClientRect();
  offsetX = startX - rect.left;
  offsetY = startY - rect.top;

  e.preventDefault();
});

document.addEventListener("mousemove", function (e) {
  if (!isDragging) {
    return;
  }

  let newX = e.clientX - offsetX;
  let newY = e.clientY - offsetY;

  const maxX = window.innerWidth - character.offsetWidth;
  const maxY = window.innerHeight - character.offsetHeight;

  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  character.style.left = newX + "px";
  character.style.top = newY + "px";
  character.style.bottom = "auto";
  character.style.right = "auto";
});

document.addEventListener("mouseup", function (e) {
  if (!isDragging) {
    return;
  }

  isDragging = false;
  character.classList.remove("dragging");
  character.classList.add("returning");

  character.style.left = "auto";
  character.style.top = "auto";
  character.style.bottom = originalBottom + "px";
  character.style.right = originalRight + "px";

  setTimeout(() => {
    character.classList.remove("returning");
  }, 600);
});

character.addEventListener("touchstart", function (e) {
  isDragging = true;
  character.classList.add("dragging");

  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;

  const rect = character.getBoundingClientRect();
  offsetX = startX - rect.left;
  offsetY = startY - rect.top;

  e.preventDefault();
});

document.addEventListener("touchmove", function (e) {
  if (!isDragging) {
    return;
  }

  const touch = e.touches[0];
  let newX = touch.clientX - offsetX;
  let newY = touch.clientY - offsetY;

  const maxX = window.innerWidth - character.offsetWidth;
  const maxY = window.innerHeight - character.offsetHeight;

  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  character.style.left = newX + "px";
  character.style.top = newY + "px";
  character.style.bottom = "auto";
  character.style.right = "auto";
});

document.addEventListener("touchend", function (e) {
  if (!isDragging) {
    return;
  }

  isDragging = false;
  character.classList.remove("dragging");
  character.classList.add("returning");

  character.style.left = "auto";
  character.style.top = "auto";
  character.style.bottom = originalBottom + "px";
  character.style.right = originalRight + "px";

  setTimeout(() => {
    character.classList.remove("returning");
  }, 600);
});

document.addEventListener("mousemove", function (e) {
  if (isDragging) {
    return;
  }

  const pupils = document.querySelectorAll(
    ".character-pupil-left, .character-pupil-right"
  );
  const characterRect = character.getBoundingClientRect();
  const characterCenterX = characterRect.left + characterRect.width / 2;
  const characterCenterY = characterRect.top + characterRect.height / 2;

  const angle = Math.atan2(
    e.clientY - characterCenterY,
    e.clientX - characterCenterX
  );
  const distance = 3;

  pupils.forEach((pupil) => {
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  });
});
