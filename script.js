(() => {
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

  const form = document.getElementById("rsvpForm");
  const msg = document.getElementById("formMsg");

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