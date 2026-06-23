const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-links a");

function closeMenu() {
  navMenu.classList.remove("active");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 60);
});

menuToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("active");
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

document.addEventListener("pointerdown", (event) => {
  if (!navMenu.classList.contains("active")) return;
  if (navMenu.contains(event.target) || menuToggle.contains(event.target)) return;
  closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navMenu.classList.contains("active")) closeMenu();
});

const slides = document.querySelectorAll(".hero-slide");
const dots = document.querySelectorAll("#heroDots button");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
let currentSlide = 0;
let heroTimer;

function getSlideDuration(slide) {
  const video = slide.querySelector("video");
  if (video && Number.isFinite(video.duration) && video.duration > 0) {
    return Math.max(video.duration * 1000, 4200);
  }
  return 5200;
}

function playActiveSlideMedia() {
  slides.forEach((slide, index) => {
    const video = slide.querySelector("video");
    if (!video) return;

    if (index === currentSlide) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

function showSlide(index) {
  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
  playActiveSlideMedia();
}

function startCarousel() {
  clearTimeout(heroTimer);
  const activeSlide = slides[currentSlide];
  const activeVideo = activeSlide.querySelector("video");

  if (activeVideo && (!Number.isFinite(activeVideo.duration) || activeVideo.duration <= 0)) {
    activeVideo.addEventListener("loadedmetadata", startCarousel, { once: true });
    heroTimer = setTimeout(() => {
      showSlide(currentSlide + 1);
      startCarousel();
    }, 15000);
    return;
  }

  heroTimer = setTimeout(() => {
    showSlide(currentSlide + 1);
    startCarousel();
  }, getSlideDuration(activeSlide));
}

function resetCarousel() {
  clearTimeout(heroTimer);
  startCarousel();
}

prevSlide.addEventListener("click", () => { showSlide(currentSlide - 1); resetCarousel(); });
nextSlide.addEventListener("click", () => { showSlide(currentSlide + 1); resetCarousel(); });
dots.forEach((dot, index) => dot.addEventListener("click", () => { showSlide(index); resetCarousel(); }));
slides.forEach((slide, index) => {
  const video = slide.querySelector("video");
  if (!video) return;
  video.addEventListener("ended", () => {
    if (currentSlide !== index) return;
    showSlide(currentSlide + 1);
    resetCarousel();
  });
});
playActiveSlideMedia();
startCarousel();

const visitCounter = document.getElementById("visitCounter");

async function getVisitCountFromSupabase() {
  // Listo para conectar luego:
  // 1. Crea una tabla en Supabase, por ejemplo "site_visits".
  // 2. Reemplaza esta función con una llamada fetch a tu Edge Function o REST endpoint.
  // 3. Devuelve el total real desde la base de datos.
  return null;
}

async function initVisitCounter() {
  if (!visitCounter) return;

  const supabaseCount = await getVisitCountFromSupabase();
  if (typeof supabaseCount === "number") {
    animateCounter(visitCounter, supabaseCount);
    return;
  }

  const key = "torre89_demo_visits";
  const currentCount = Number(localStorage.getItem(key) || "1840") + 1;
  localStorage.setItem(key, currentCount);
  animateCounter(visitCounter, currentCount);
}

function animateCounter(element, target) {
  const start = Math.max(0, target - 80);
  const duration = 900;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const value = Math.floor(start + (target - start) * progress);
    element.textContent = value.toLocaleString("es-PE");
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

initVisitCounter();

const musicPlayer = document.getElementById("musicPlayer");
const backgroundAudio = document.getElementById("backgroundAudio");
const musicToggle = document.getElementById("musicToggle");
const musicIcon = musicToggle ? musicToggle.querySelector(".music-icon") : null;
const musicProgress = document.getElementById("musicProgress");
const musicVolume = document.getElementById("musicVolume");

if (musicPlayer && backgroundAudio && musicToggle) {
  backgroundAudio.volume = musicVolume ? Number(musicVolume.value) : 0.45;

  const tryPlayMusic = async () => {
    try {
      await backgroundAudio.play();
      musicPlayer.classList.remove("music-error");
    } catch (error) {
      musicPlayer.classList.remove("playing");
    }
  };

  tryPlayMusic();

  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, tryPlayMusic, { once: true, passive: true });
  });

  musicToggle.addEventListener("click", async () => {
    try {
      if (backgroundAudio.paused) {
        await backgroundAudio.play();
      } else {
        backgroundAudio.pause();
      }
    } catch (error) {
      musicPlayer.classList.add("music-error");
      if (musicIcon) musicIcon.textContent = "!";
    }
  });

  if (musicVolume) {
    const paintVolume = () => {
      const value = Number(musicVolume.value) * 100;
      musicVolume.style.background = `linear-gradient(90deg, var(--gold-2) ${value}%, rgba(255, 255, 255, 0.24) ${value}%)`;
    };

    musicVolume.addEventListener("input", () => {
      backgroundAudio.volume = Number(musicVolume.value);
      paintVolume();
    });

    paintVolume();
  }

  backgroundAudio.addEventListener("play", () => {
    musicPlayer.classList.add("playing");
    musicToggle.setAttribute("aria-label", "Pausar música");
    if (musicIcon) musicIcon.textContent = "Ⅱ";
  });

  backgroundAudio.addEventListener("pause", () => {
    musicPlayer.classList.remove("playing");
    musicToggle.setAttribute("aria-label", "Reproducir música");
    if (musicIcon) musicIcon.textContent = "▶";
  });

  backgroundAudio.addEventListener("timeupdate", () => {
    if (!musicProgress || !backgroundAudio.duration) return;
    const percent = (backgroundAudio.currentTime / backgroundAudio.duration) * 100;
    musicProgress.style.width = `${Math.min(percent, 100)}%`;
  });

  backgroundAudio.addEventListener("error", () => {
    musicPlayer.classList.add("music-error");
    if (musicIcon) musicIcon.textContent = "!";
  });
}

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

const dayNightToggle = document.getElementById("dayNightToggle");
const dayNightPhotos = document.querySelectorAll(".day-night-photo");

if (dayNightToggle) {
  dayNightToggle.addEventListener("click", () => {
    const isNight = document.body.classList.toggle("night-view");
    dayNightToggle.textContent = isNight ? "Vista de día" : "Vista de noche";
    dayNightToggle.setAttribute("aria-pressed", String(isNight));

    dayNightPhotos.forEach((photo) => {
      photo.style.opacity = "0";
      setTimeout(() => {
        photo.src = isNight ? photo.dataset.night : photo.dataset.day;
        photo.style.opacity = "1";
      }, 240);
    });
  });
}

document.querySelectorAll("[data-build-state]").forEach((button) => {
  button.addEventListener("click", () => {
    const state = button.dataset.buildState;
    document.querySelectorAll("[data-build-state]").forEach((item) => item.classList.toggle("active", item === button));

    document.querySelectorAll(".construction-photos img").forEach((photo) => {
      photo.style.opacity = "0";
      photo.style.transform = "scale(0.985)";
      setTimeout(() => {
        photo.src = state === "done" ? photo.dataset.done : photo.dataset.work;
        photo.style.opacity = "1";
        photo.style.transform = "scale(1)";
      }, 240);
    });
  });
});

document.querySelectorAll("[data-finance-option]").forEach((button) => {
  button.addEventListener("click", () => {
    const option = button.dataset.financeOption;
    document.querySelectorAll("[data-finance-option]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    document.querySelectorAll("[data-finance-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.financePanel === option);
    });
  });
});

document.querySelectorAll("[data-promo] .promo-track").forEach((track) => {
  track.innerHTML += track.innerHTML;
});

const modalData = {
  tipoA: {
    title: "Departamento Tipo II",
    count: "8 departamentos disponibles",
    area: "103.8 m²",
    normalPrice: "$134,000.00",
    presalePrice: "$129,900.00",
    text: "Distribución funcional para vivir o invertir, con ambientes optimizados y acabados modernos.",
    images: ["imagenes/proyectos/depa-vertical.jpg", "imagenes/proyectos/torre-departamentos.jpg"]
  },
  tipoB: {
    title: "Departamento Tipo III",
    count: "7 departamentos disponibles",
    area: "113.7 m²",
    normalPrice: "$138,000.00",
    presalePrice: "$133,900.00",
    text: "Opción familiar con mayor amplitud social, dormitorios bien iluminados y espacios adaptables.",
    images: ["imagenes/proyectos/torre-detalle-1.jpg", "imagenes/proyectos/torre-detalle-3.jpg"]
  },
  tipoC: {
    title: "Departamento Tipo IV",
    count: "4 departamentos disponibles",
    area: "208.5 m²",
    normalPrice: "$200,000.00",
    presalePrice: "$193,900.00",
    text: "Formato premium con mayor área útil, mejor amplitud y acabados superiores para una experiencia residencial más exclusiva.",
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
      <div class="modal-depa-header">
        <span>Torre 89</span>
        <h2>${data.title}</h2>
        <p>${data.text}</p>
      </div>
      <div class="modal-depa-summary">
        <div><small>Cantidad</small><strong>${data.count}</strong></div>
        <div><small>Área</small><strong>${data.area}</strong></div>
      </div>
      <div class="modal-price-grid">
        <div class="price-card">
          <small>Precio normal</small>
          <strong>${data.normalPrice}</strong>
        </div>
        <div class="price-card price-card-featured">
          <small>Precio preventa</small>
          <strong>${data.presalePrice}</strong>
        </div>
      </div>
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
  window.open(`https://wa.me/955042736?text=${whatsappMessage}`, "_blank");
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
