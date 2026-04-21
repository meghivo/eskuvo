(() => {
  const topbar = document.querySelector(".topbar");
  const topbarMenu = document.querySelector("[data-topbar-menu]");
  const menuToggle = topbarMenu?.querySelector(".menu-toggle");
  const menuLinks = topbarMenu ? Array.from(topbarMenu.querySelectorAll(".chip")) : [];
  const flap = document.getElementById("flapBig");
  const card = document.getElementById("cardBig");
  const envelope = document.getElementById("envelopeBig");
  const seal = document.getElementById("sealBig");

  if (!envelope) return;

  const easeInOut = (x) => x * x * (3 - 2 * x);

  function getProgress() {
    const rect = envelope.getBoundingClientRect();
    const viewH = window.innerHeight;

    const start = viewH * 0.85; 
    const end = viewH * 0.20;   

    const t = (rect.top - start) / (end - start);
    return Math.min(1, Math.max(0, t));
  }

  let raf = null;

  function animate() {
    raf = null;
    const p = getProgress();          
    
    // ==========================================
    // 1) FÜL NYITÁS & PECSÉT ELTŰNÉS
    // ==========================================
    const flapP = Math.min(1, p / 0.40);
    const flapE = easeInOut(flapP);
    
    const flapDeg = -180 * flapE; 
    if (flap) {
      flap.style.transform = `rotateX(${flapDeg}deg)`;
      flap.style.zIndex = flapDeg < -90 ? "1" : "5";
    }

    if (seal) {
      seal.style.opacity = String(1 - flapE);
      seal.style.transform = `translate(-50%, -50%) scale(${1 - flapE})`;
    }

    // ==========================================
    // 2) KÁRTYA KICSÚSZÁS ÉS MEGNŐVÉS (Álló formátumra)
    // ==========================================
    const cardP = Math.min(1, Math.max(0, (p - 0.20) / 0.80));
    
    let yTranslate = 0;
    let scale = 1;
    let rotate = 0;
    let cardZ = "2"; 
    let currentHeight = 94; // Alap magasság a borítékban

    if (cardP <= 0.5) {
      // 1. FÁZIS: Kihúzás + a kártya kinyúlik álló formátumúra
      const upP = cardP / 0.5;
      const upE = easeInOut(upP);
      
      yTranslate = -110 * upE; 
      currentHeight = 94 + (76 * upE); // 94%-ról 170%-ra nő, így a kép alja is előbukkan!
      scale = 1;               
      rotate = 0;
      cardZ = "2";             
    } else {
      // 2. FÁZIS: Ráejtés a borítékra
      const downP = (cardP - 0.5) / 0.5;
      const downE = easeInOut(downP);
      
      yTranslate = -110 + (95 * downE); 
      currentHeight = 170; // Fix teljes álló magasság
      scale = 1 + (0.15 * downE);       
      rotate = -3 * downE;              
      cardZ = "10";                     
    }

    if (card) {
      card.style.transform = `translateY(${yTranslate}%) scale(${scale}) rotateZ(${rotate}deg)`;
      card.style.height = `${currentHeight}%`; // A magasság dinamikus frissítése
      card.style.zIndex = cardZ;
    }
  }

  function onScroll() {
    if (!raf) raf = requestAnimationFrame(animate);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll(); 

  // ==========================================
  // ===== Reveal & Form 
  // ==========================================
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add("in");
      }
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  let setMenuOpen = () => {};
  let closeMenu = () => {};

  if (topbarMenu && menuToggle) {
    setMenuOpen = (open) => {
      topbarMenu.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    closeMenu = () => setMenuOpen(false);

    menuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = topbarMenu.classList.contains("is-open");
      setMenuOpen(!isOpen);
      requestAnimationFrame(() => menuToggle.blur());
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!topbarMenu.contains(event.target)) closeMenu();
    });

    window.addEventListener("resize", closeMenu);
  }

  if (topbar) {
    let lastScrollY = window.scrollY;
    let topbarTick = null;

    function updateTopbar() {
      topbarTick = null;
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;

      if (currentY <= 24) {
        topbar.classList.remove("is-hidden");
        closeMenu();
      } else if (delta > 8) {
        topbar.classList.add("is-hidden");
        closeMenu();
      } else if (delta < -8) {
        topbar.classList.remove("is-hidden");
        closeMenu();
      }

      lastScrollY = currentY;
    }

    window.addEventListener("scroll", () => {
      if (!topbarTick) topbarTick = requestAnimationFrame(updateTopbar);
    }, { passive: true });
  }

  const form = document.getElementById("rsvpForm");
  const msg = document.getElementById("formMsg");
  const carousels = document.querySelectorAll(".photo-carousel");
  const submittedLinks = document.getElementById("submittedLinks");
  const infoTabs = Array.from(document.querySelectorAll("[data-info-tab]"));
  const infoPanels = Array.from(document.querySelectorAll("[data-info-panel]"));

  for (const carousel of carousels) {
    const viewport = carousel.querySelector("[data-carousel-viewport]");
    const track = carousel.querySelector("[data-carousel-track]");
    const slides = Array.from(carousel.querySelectorAll(".photo-slide"));
    const prev = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const dotsWrap = carousel.querySelector("[data-carousel-dots]");
    const count = carousel.querySelector("[data-carousel-count]");

    if (!viewport || !track || !slides.length || !dotsWrap) continue;

    let index = 0;

    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `${i + 1}. kép`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
      return dot;
    });

    function update() {
      const left = viewport.clientWidth * index;
      viewport.scrollTo({ left, behavior: "smooth" });
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
      if (count) count.textContent = `${index + 1} / ${slides.length}`;
    }

    function goTo(nextIndex) {
      index = Math.max(0, Math.min(slides.length - 1, nextIndex));
      update();
    }

    prev?.addEventListener("click", () => goTo(index - 1));
    next?.addEventListener("click", () => goTo(index + 1));

    let scrollTimer = null;
    viewport.addEventListener("scroll", () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const nextIndex = Math.round(viewport.scrollLeft / viewport.clientWidth);
        if (nextIndex !== index) {
          index = nextIndex;
          dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
          if (count) count.textContent = `${index + 1} / ${slides.length}`;
        }
      }, 60);
    }, { passive: true });

    window.addEventListener("resize", () => update());
    update();
  }

  if (submittedLinks) {
    const endpoint = (submittedLinks.dataset.galleryEndpoint || "").trim();
    const gallery = document.getElementById("submittedGallery");
    const galleryStatus = document.getElementById("submittedGalleryStatus");
    function renderGallery(images) {
      if (!gallery) return;
      gallery.innerHTML = "";
      let renderedCount = 0;

      for (const image of images) {
        const card = document.createElement("a");
        card.className = "submitted-photo-card";
        card.href = image.fullUrl || image.webViewUrl || "#";
        card.target = "_blank";
        card.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.src = image.thumbnailUrl || image.imageUrl || image.fullUrl || "";
        img.alt = image.name || "Beküldött fotó";
        img.loading = "lazy";
        img.addEventListener("error", () => {
          card.style.display = "none";
          renderedCount -= 1;
          if (renderedCount <= 0 && galleryStatus) {
            galleryStatus.textContent = "Most még nincs megjeleníthető kép a galériában.";
          }
        });

        card.append(img);
        gallery.appendChild(card);
        renderedCount += 1;
      }

      return renderedCount;
    }

    async function loadSubmittedGallery() {
      if (!gallery || !galleryStatus) return;
      if (!endpoint) return;

      galleryStatus.textContent = "Képek betöltése...";

      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const payload = await response.json();
        const images = Array.isArray(payload.images) ? payload.images : [];

        if (!images.length) {
          galleryStatus.textContent = "Még nincs beküldött kép ebben a galériában.";
          gallery.innerHTML = "";
          return;
        }

        const renderedCount = renderGallery(images);
        galleryStatus.textContent = renderedCount
          ? ""
          : "Most még nincs megjeleníthető kép a galériában.";
      } catch (error) {
        galleryStatus.textContent = "A galéria most még nincs összekötve a Drive képekkel.";
      }
    }

    loadSubmittedGallery();
  }

  if (infoTabs.length && infoPanels.length) {
    function setInfoTab(tabName) {
      infoTabs.forEach((tab) => {
        const isActive = tab.dataset.infoTab === tabName;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      infoPanels.forEach((panel) => {
        const isActive = panel.dataset.infoPanel === tabName;
        panel.hidden = !isActive;
      });
    }

    infoTabs.forEach((tab) => {
      tab.addEventListener("click", () => setInfoTab(tab.dataset.infoTab));
    });
  }

  if (form) {
    form.addEventListener("submit", () => {
      msg.textContent = "Küldés...";
      setTimeout(() => {
        msg.textContent = "Köszönjük! A válaszodat rögzítettük 💙";
        form.reset();
      }, 900);
    });
  }
})();
