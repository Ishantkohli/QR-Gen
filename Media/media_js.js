document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu");
  const toggle = document.querySelector(".toggle");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("active");
    });
  }
});