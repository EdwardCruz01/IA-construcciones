const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-links a");
const loaderPhrases = [
  "Preparando espacios modernos para vivir e invertir.",
  "Cargando detalles de Torre 89.",
  "Optimizando recorridos 360 para tu visita.",
  "Conectando departamentos, oficinas y salón VIP.",
  "La buena inversión empieza con una buena vista."
];

const preloader = document.getElementById("preloader");
const acceptCookies = document.getElementById("acceptCookies");
const loaderPhrase = document.getElementById("loaderPhrase");
const loaderProgress = document.getElementById("loaderProgress");

if (loaderPhrase) {
  const firstPhraseIndex = Math.floor(Math.random() * loaderPhrases.length);
  loaderPhrase.textContent = loaderPhrases[firstPhraseIndex];

  setTimeout(() => {
    const nextPhrases = loaderPhrases.filter((_, index) => index !== firstPhraseIndex);
    loaderPhrase.textContent = nextPhrases[Math.floor(Math.random() * nextPhrases.length)];
  }, 1500);
}

function hidePreloader() {
  if (!preloader) return;
  localStorage.setItem("torre89_cookies_ok", "1");
  preloader.classList.add("hide");
  setTimeout(() => preloader.remove(), 520);
}

if (preloader) {
  const alreadyAccepted = localStorage.getItem("torre89_cookies_ok") === "1";
  if (alreadyAccepted) {
    preloader.classList.add("hide");
    setTimeout(() => preloader.remove(), 300);
  } else {
    let loaderValue = 0;
    const loaderTimer = setInterval(() => {
      loaderValue = Math.min(loaderValue + Math.random() * 9, 92);
      if (loaderProgress) loaderProgress.style.width = `${loaderValue}%`;
      if (loaderValue >= 92) clearInterval(loaderTimer);
    }, 380);
    window.addEventListener("load", () => {
      if (loaderProgress) loaderProgress.style.width = "100%";
    });
    acceptCookies?.addEventListener("click", hidePreloader);
  }
}

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
const musicVolume = document.getElementById("musicVolume");

if (musicPlayer && backgroundAudio && musicToggle) {
  const initialVolume = 0.2;
  backgroundAudio.volume = initialVolume;
  if (musicVolume) musicVolume.value = String(initialVolume);
  let musicHideTimer;

  function expandMusicControls() {
    musicPlayer.classList.add("expanded");
    clearTimeout(musicHideTimer);
  }

  function scheduleHideMusicControls() {
    clearTimeout(musicHideTimer);
    musicHideTimer = setTimeout(() => musicPlayer.classList.remove("expanded"), 1300);
  }

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

    musicPlayer.addEventListener("pointerdown", expandMusicControls);
    musicPlayer.addEventListener("mouseenter", expandMusicControls);
    musicPlayer.addEventListener("mouseleave", scheduleHideMusicControls);
    document.addEventListener("pointerdown", (event) => {
      if (!musicPlayer.contains(event.target)) musicPlayer.classList.remove("expanded");
    });

    musicVolume.addEventListener("input", () => {
      backgroundAudio.volume = Number(musicVolume.value);
      expandMusicControls();
      paintVolume();
    });

    musicVolume.addEventListener("change", scheduleHideMusicControls);

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

const reelVideos = document.querySelectorAll(".reel-video");

function playReelVideo(video) {
  video.muted = true;
  video.playsInline = true;
  if (video.readyState < 2) video.load();
  video.play().catch(() => {});
}

const reelObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      playReelVideo(video);
    } else {
      video.pause();
    }
  });
}, { threshold: 0.28 });

reelVideos.forEach((video) => {
  reelObserver.observe(video);
  video.addEventListener("loadeddata", () => playReelVideo(video), { once: true });
});

["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
  window.addEventListener(eventName, () => {
    reelVideos.forEach(playReelVideo);
  }, { once: true, passive: true });
});

const techButton = document.getElementById("toggleTech");
const techPanel = document.getElementById("techPanel");
techButton.addEventListener("click", () => {
  const isOpen = techPanel.classList.toggle("open");
  techButton.textContent = isOpen ? "Ocultar detalles técnicos" : "Ver detalles técnicos";

  if (isOpen) {
    setTimeout(() => {
      techPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }
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

const progressSlides = document.querySelectorAll(".progress-slide");
const progressDots = document.querySelectorAll("#progressDots button");
const progressPrev = document.getElementById("progressPrev");
const progressNext = document.getElementById("progressNext");
let progressIndex = 0;
let progressTimer;

function showProgressSlide(index) {
  if (!progressSlides.length) return;
  progressSlides[progressIndex].classList.remove("active");
  progressDots[progressIndex]?.classList.remove("active");
  progressIndex = (index + progressSlides.length) % progressSlides.length;
  progressSlides[progressIndex].classList.add("active");
  progressDots[progressIndex]?.classList.add("active");
}

function startProgressCarousel() {
  clearInterval(progressTimer);
  if (progressSlides.length > 1) {
    progressTimer = setInterval(() => showProgressSlide(progressIndex + 1), 5200);
  }
}

progressPrev?.addEventListener("click", () => { showProgressSlide(progressIndex - 1); startProgressCarousel(); });
progressNext?.addEventListener("click", () => { showProgressSlide(progressIndex + 1); startProgressCarousel(); });
progressDots.forEach((dot, index) => dot.addEventListener("click", () => { showProgressSlide(index); startProgressCarousel(); }));
startProgressCarousel();

document.querySelectorAll("[data-viewer-src]").forEach((button) => {
  button.addEventListener("click", () => {
    const viewer = document.getElementById("depaViewer360");
    document.querySelectorAll("[data-viewer-src]").forEach((item) => item.classList.toggle("active", item === button));
    if (viewer && viewer.src !== button.dataset.viewerSrc) viewer.src = button.dataset.viewerSrc;
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
  if (track.dataset.cloned !== "true") {
    track.innerHTML += track.innerHTML;
    track.dataset.cloned = "true";
  }

  track.addEventListener("pointerdown", () => track.classList.add("promo-paused"));
  track.addEventListener("pointerup", () => {
    setTimeout(() => track.classList.remove("promo-paused"), 800);
  });
  track.addEventListener("pointerleave", () => track.classList.remove("promo-paused"));
});

document.querySelectorAll("[data-service-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const text = button.nextElementSibling;
    button.classList.toggle("active");
    if (text) text.classList.toggle("open");
  });
});

const modalData = {
  tipoA: {
    title: "Departamento Tipo II",
    count: "8 departamentos disponibles",
    area: "103.8 m²",
    normalPrice: "$134,000.00",
    presalePrice: "$129,900.00",
    text: "Distribución funcional para vivir o invertir, con ambientes optimizados y acabados modernos.",
    images: ["imagenes/proyectos/depa interior 1.jpg", "imagenes/proyectos/cocina 1.jpg"]
  },
  tipoB: {
    title: "Departamento Tipo III",
    count: "7 departamentos disponibles",
    area: "113.7 m²",
    normalPrice: "$138,000.00",
    presalePrice: "$133,900.00",
    text: "Opción familiar con mayor amplitud social, dormitorios bien iluminados y espacios adaptables.",
    images: ["imagenes/proyectos/depa interior 2.jpg", "imagenes/proyectos/interior 5.jpg"]
  },
  tipoC: {
    title: "Departamento Tipo IV",
    count: "4 departamentos disponibles",
    area: "208.5 m²",
    normalPrice: "$200,000.00",
    presalePrice: "$193,900.00",
    text: "Formato premium con mayor área útil, mejor amplitud y acabados superiores para una experiencia residencial más exclusiva.",
    images: ["imagenes/proyectos/interior 6.jpg", "imagenes/proyectos/depa interior 1.jpg"]
  }
};

const modal = document.getElementById("infoModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

const promoData = {
  promo1: { category: "Promociones venta de departamentos", title: "Promo 1", separation: "20%", benefit: "Gratis los accesorios para sus muebles bajos de cocina." },
  promo2: { category: "Promociones venta de departamentos", title: "Promo 2", separation: "40%", benefit: "Gratis equipamos la lavandería con lavadora y mueble." },
  promo3: { category: "Promociones venta de departamentos", title: "Promo 3", separation: "60%", benefit: "Gratis le damos el mueble de entretenimiento para la sala." },
  promo4: { category: "Promociones venta de departamentos", title: "Promo 4", separation: "80%", benefit: "Gratis su cocina + campana empotrada." },
  promo5: { category: "Promociones venta de departamentos", title: "Promo 5", separation: "100%", benefit: "Gratis refrigeradora + horno empotrado + horno microondas empotrado." },
  office1: { category: "Promoción oficinas", title: "Oficina equipada", conditionLabel: "Incluye", separation: "Implementación", benefit: "Primer mes con asesoría para distribuir mobiliario, puntos de trabajo y presentación corporativa." },
  office2: { category: "Promoción oficinas", title: "Servicios incluidos", conditionLabel: "Incluye", separation: "Todo listo", benefit: "WiFi, luz, agua y limpieza de áreas comunes incluidos para iniciar operaciones con mayor comodidad." },
  office3: { category: "Promoción oficinas", title: "Plan trimestral", conditionLabel: "Condición", separation: "Ahorro", benefit: "Tarifa preferencial para empresas o profesionales que separen alquiler por tres meses anticipados." },
  event1: { category: "Promoción Salón VIP", title: "Reserva tu fecha", conditionLabel: "Incluye", separation: "Decoración", benefit: "Decoración base y coordinación inicial incluida para reuniones privadas, familiares o presentaciones." },
  event2: { category: "Promoción Salón VIP", title: "Evento corporativo", conditionLabel: "Incluye", separation: "Preferencial", benefit: "Tarifa especial para capacitaciones, reuniones empresariales y actividades institucionales." },
  event3: { category: "Promoción Salón VIP", title: "Horas adicionales", conditionLabel: "Incluye", separation: "Paquete VIP", benefit: "Horas extra con precio preferencial para eventos que necesiten extender la reserva." }
};

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
      <a class="btn btn-primary modal-reserve" href="#contacto">Reserva ya</a>
    `;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  });
});

document.querySelectorAll("[data-promo-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    const data = promoData[button.dataset.promoModal];
    modalBody.innerHTML = `
      <div class="modal-depa-header promo-modal-content">
        <span>${data.category || "Promoción Torre 89"}</span>
        <h2>${data.title}</h2>
        <div class="modal-depa-summary">
          <div><small>${data.conditionLabel || "Separación"}</small><strong>${data.separation}</strong></div>
          <div><small>Beneficio</small><strong>${data.benefit}</strong></div>
        </div>
        <p>Promoción sujeta a disponibilidad y validación comercial. IA Construcciones confirmará condiciones finales al momento de la reserva.</p>
        <a class="btn btn-primary modal-reserve" href="#contacto">Quiero esta promoción</a>
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
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
  if (event.target.closest(".modal-reserve")) closeModal();
});

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
  const pais = document.getElementById("paisContacto").value;
  const region = document.getElementById("regionContacto").value.trim();
  const distrito = document.getElementById("distritoContacto").value.trim();
  const tipoProyecto = document.getElementById("tipoProyecto").value;
  const mensaje = document.getElementById("mensaje").value.trim();
  const whatsappMessage = [
    "Hola, quiero recibir información sobre Torre 89 e IA Construcciones.",
    nombre ? `Nombre: ${nombre}` : "",
    telefono ? `Teléfono: ${telefono}` : "",
    correo ? `Correo: ${correo}` : "",
    pais ? `País: ${pais}` : "",
    region ? `Región/Departamento: ${region}` : "",
    distrito ? `Distrito: ${distrito}` : "",
    tipoProyecto ? `Interés: ${tipoProyecto}` : "",
    mensaje ? `Mensaje: ${mensaje}` : ""
  ].filter(Boolean).join("\n");
  window.open(`https://wa.me/955042736?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
});

const floatingWhatsapp = document.getElementById("floatingWhatsapp");

function makeDraggable(element, size = 68) {
  if (!element) return;
  let dragStart = null;
  let moved = false;

  function pointerDown(event) {
    if (event.target.matches("input")) return;
    const point = event.touches ? event.touches[0] : event;
    const rect = element.getBoundingClientRect();
    dragStart = { x: point.clientX, y: point.clientY, offsetX: point.clientX - rect.left, offsetY: point.clientY - rect.top };
    moved = false;
    element.classList.add("dragging");
  }

  function pointerMove(event) {
    if (!dragStart) return;
    const point = event.touches ? event.touches[0] : event;
    const dx = Math.abs(point.clientX - dragStart.x);
    const dy = Math.abs(point.clientY - dragStart.y);
    if (dx + dy > 6) moved = true;
    const x = Math.min(window.innerWidth - size, Math.max(8, point.clientX - dragStart.offsetX));
    const y = Math.min(window.innerHeight - size, Math.max(8, point.clientY - dragStart.offsetY));
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
    event.preventDefault();
  }

  function pointerUp() {
    dragStart = null;
    element.classList.remove("dragging");
  }

  element.addEventListener("mousedown", pointerDown);
  window.addEventListener("mousemove", pointerMove, { passive: false });
  window.addEventListener("mouseup", pointerUp);
  element.addEventListener("touchstart", pointerDown, { passive: true });
  window.addEventListener("touchmove", pointerMove, { passive: false });
  window.addEventListener("touchend", pointerUp);
  element.addEventListener("click", (event) => {
    if (moved) {
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }
  });
}

makeDraggable(floatingWhatsapp);
makeDraggable(musicPlayer, 76);

