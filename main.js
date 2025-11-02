// Page navigation functions
function showPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(page + "-page").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Scroll progress bar
window.addEventListener("scroll", function () {
  const scrollProgress = document.querySelector(".scroll-progress");
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  const scrollPercentage = (scrollTop / scrollHeight) * 100;
  scrollProgress.style.width = scrollPercentage + "%";
});
