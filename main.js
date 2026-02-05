// dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    document.getElementById("theme-icon").textContent = isDark ? "☀️" : "🌙";
    document.getElementById("theme-text").textContent = isDark ? "Light Mode" : "Dark Mode";
    localStorage.setItem("darkMode", isDark);
}


window.addEventListener("load", function () {
    // Load trạng thái Dark Mode cũ
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
        document.body.classList.add("dark-mode");
        document.getElementById("theme-icon").textContent = "☀️";
        document.getElementById("theme-text").textContent = "Light Mode";
    }

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0); 
    
    const scrollProgress = document.querySelector(".scroll-progress");
    if(scrollProgress) {
        scrollProgress.style.width = "0%";
    }

    // Kích hoạt animation 
    triggerScrollAnimation();
});


function showPage(page) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.getElementById(page + "-page").classList.add("active");
    
    window.scrollTo({ top: 0, behavior: "auto" }); 
    
    const scrollProgress = document.querySelector(".scroll-progress");
    if(scrollProgress) {
        scrollProgress.style.width = "0%";
    }
    
    // Reset animation cho trang mới
    setTimeout(triggerScrollAnimation, 100);
}

// SCROLL PROGRESS
window.addEventListener("scroll", function () {
    const scrollProgress = document.querySelector(".scroll-progress");
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight > 0) {
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = scrollPercentage + "%";
    } else {
        scrollProgress.style.width = "0%";
    }
});

//SCROLL REVEAL
function triggerScrollAnimation() {
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, {
        threshold: 0.1 
    });

    reveals.forEach((element) => {
        observer.observe(element);
    });
}