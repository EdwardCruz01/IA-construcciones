const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-menu a");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 80);
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

// Carrusel del hero: cambia cada 5 segundos y tambien con flechas.
const slides = document.querySelectorAll(".hero__slide");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
let currentSlide = 0;
let heroInterval;

const heroDots = document.querySelectorAll("#heroDots button");

function showSlide(index) {
  slides[currentSlide].classList.remove("active");
  heroDots[currentSlide].classList.remove("active");

  currentSlide = (index + slides.length) % slides.length;

  slides[currentSlide].classList.add("active");
  heroDots[currentSlide].classList.add("active");
}

heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    resetHeroCarousel();
  });
});

function startHeroCarousel() {
  heroInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5000);
}

function resetHeroCarousel() {
  clearInterval(heroInterval);
  startHeroCarousel();
}

prevSlide.addEventListener("click", () => {
  showSlide(currentSlide - 1);
  resetHeroCarousel();
});

nextSlide.addEventListener("click", () => {
  showSlide(currentSlide + 1);
  resetHeroCarousel();
});

startHeroCarousel();

// Animaciones al aparecer en pantalla.
const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

// Formulario: abre WhatsApp con datos basicos del cliente.
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const tipoProyecto = document.getElementById("tipoProyecto").value;
  const mensaje = document.getElementById("mensaje").value.trim();

  const whatsappMessage = [
    "Hola, quiero cotizar un proyecto con IA Construcciones.",
    nombre ? `Nombre: ${nombre}` : "",
    telefono ? `Telefono: ${telefono}` : "",
    correo ? `Correo: ${correo}` : "",
    tipoProyecto ? `Tipo de proyecto: ${tipoProyecto}` : "",
    mensaje ? `Mensaje: ${mensaje}` : "",
  ]
    .filter(Boolean)
    .join("%0A");

  window.open(`https://wa.me/51975862207?text=${whatsappMessage}`, "_blank");
});
const animatedImageCards = document.querySelectorAll(".service-card, .project-card");

animatedImageCards.forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("image-active");

    setTimeout(() => {
      card.classList.remove("image-active");
    }, 900);
  });
});