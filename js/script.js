const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 60);
});

menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("active");
  menuToggle.setAttribute("aria-expanded", isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll("#heroDots button");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
let currentSlide = 0;
let heroInterval;

function showSlide(index) {
  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function startCarousel() {
  heroInterval = setInterval(() => showSlide(currentSlide + 1), 5200);
}

function resetCarousel() {
  clearInterval(heroInterval);
  startCarousel();
}

prevSlide.addEventListener("click", () => { showSlide(currentSlide - 1); resetCarousel(); });
nextSlide.addEventListener("click", () => { showSlide(currentSlide + 1); resetCarousel(); });
dots.forEach((dot, index) => dot.addEventListener("click", () => { showSlide(index); resetCarousel(); }));
startCarousel();

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
revealItems.forEach((item) => revealObserver.observe(item));

const techButton = document.getElementById("toggleTech");
const techPanel = document.getElementById("techPanel");
techButton.addEventListener("click", () => {
  techPanel.classList.toggle("open");
  techButton.textContent = techPanel.classList.contains("open") ? "Ocultar detalles técnicos" : "Ver detalles técnicos";
});

const modalData = {
  tipoA: {
    title: "Departamento Tipo A",
    text: "Distribución compacta y funcional para inversión o primera vivienda. Incluye sala comedor, cocina integrada, dormitorios optimizados y acabados modernos.",
    images: ["imagenes/proyectos/depa-vertical.jpg", "imagenes/proyectos/torre-departamentos.jpg"]
  },
  tipoB: {
    title: "Departamento Tipo B",
    text: "Opción familiar con mejor amplitud social, dormitorios bien iluminados y espacios adaptables para trabajo o estudio.",
    images: ["imagenes/proyectos/torre-detalle-1.jpg", "imagenes/proyectos/torre-detalle-3.jpg"]
  },
  tipoC: {
    title: "Departamento Tipo C",
    text: "Formato premium referencial con vista, mayor área útil y acabados superiores. Datos finales editables según planos reales.",
    images: ["imagenes/proyectos/torre-detalle-2.jpg", "imagenes/proyectos/plano-tecnico.jpg"]
  }
};

const modal = document.getElementById("infoModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

document.querySelectorAll("[data-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const data = modalData[button.dataset.modal];
    modalBody.innerHTML = `
      <h2>${data.title}</h2>
      <p>${data.text}</p>
      <div class="modal-gallery">
        ${data.images.map((src) => `<img src="${src}" alt="${data.title}">`).join("")}
      </div>
    `;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  });
});

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });

document.querySelectorAll(".gateway-card, .services-card, .vertical-photo, .stacked-photos img").forEach((item) => {
  item.addEventListener("click", () => {
    item.classList.add("image-active");
    setTimeout(() => item.classList.remove("image-active"), 850);
  });
});

const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const tipoProyecto = document.getElementById("tipoProyecto").value;
  const mensaje = document.getElementById("mensaje").value.trim();
  const whatsappMessage = [
    "Hola, quiero recibir información sobre Torre 89 e IA Construcciones.",
    nombre ? `Nombre: ${nombre}` : "",
    telefono ? `Teléfono: ${telefono}` : "",
    correo ? `Correo: ${correo}` : "",
    tipoProyecto ? `Interés: ${tipoProyecto}` : "",
    mensaje ? `Mensaje: ${mensaje}` : ""
  ].filter(Boolean).join("%0A");
  window.open(`https://wa.me/51975862207?text=${whatsappMessage}`, "_blank");
});

const floatingWhatsapp = document.getElementById("floatingWhatsapp");
let dragStart = null;
let moved = false;

function pointerDown(event) {
  const point = event.touches ? event.touches[0] : event;
  const rect = floatingWhatsapp.getBoundingClientRect();
  dragStart = { x: point.clientX, y: point.clientY, offsetX: point.clientX - rect.left, offsetY: point.clientY - rect.top };
  moved = false;
  floatingWhatsapp.classList.add("dragging");
}

function pointerMove(event) {
  if (!dragStart) return;
  const point = event.touches ? event.touches[0] : event;
  const dx = Math.abs(point.clientX - dragStart.x);
  const dy = Math.abs(point.clientY - dragStart.y);
  if (dx + dy > 6) moved = true;
  const x = Math.min(window.innerWidth - 68, Math.max(8, point.clientX - dragStart.offsetX));
  const y = Math.min(window.innerHeight - 68, Math.max(8, point.clientY - dragStart.offsetY));
  floatingWhatsapp.style.left = `${x}px`;
  floatingWhatsapp.style.top = `${y}px`;
  floatingWhatsapp.style.right = "auto";
  floatingWhatsapp.style.bottom = "auto";
  event.preventDefault();
}

function pointerUp() {
  dragStart = null;
  floatingWhatsapp.classList.remove("dragging");
}

floatingWhatsapp.addEventListener("mousedown", pointerDown);
window.addEventListener("mousemove", pointerMove, { passive: false });
window.addEventListener("mouseup", pointerUp);
floatingWhatsapp.addEventListener("touchstart", pointerDown, { passive: true });
window.addEventListener("touchmove", pointerMove, { passive: false });
window.addEventListener("touchend", pointerUp);
floatingWhatsapp.addEventListener("click", (event) => {
  if (moved) {
    event.preventDefault();
    moved = false;
  }
});
