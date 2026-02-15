(() => {
  const flap = document.getElementById("flapBig");
  const card = document.getElementById("cardBig");
  const envelope = document.getElementById("envelopeBig");

  if (!envelope) return;

  const seal = envelope.querySelector(".seal");

  // smoothstep
  const easeInOut = (x) => x * x * (3 - 2 * x);

  function getProgress() {
    const rect = envelope.getBoundingClientRect();
    const viewH = window.innerHeight;

    // mikor induljon / érjen véget
    const start = viewH * 0.75; // amikor elkezd bejönni
    const end = viewH * 0.10;   // amikor közel a tetejéhez

    const t = (rect.top - start) / (end - start);
    return Math.min(1, Math.max(0, t));
  }

  let raf = null;

  function animate() {
    raf = null;

    const p = getProgress();          // 0..1
    const pe = easeInOut(p);

    // 1) FLAP nyitás (3D)
    // kicsi késleltetés, hogy "először nyíljon, aztán csússzon"
    const flapP = Math.min(1, p / 0.55);
    const flapE = easeInOut(flapP);
    const flapDeg = -175 * flapE; // -160 helyett kicsit többet nyit
    if (flap) flap.style.transform = `rotateX(${flapDeg}deg)`;

    // 2) CARD csúszás
    // induljon mélyebbről, és a végén jöjjön kicsit ki
    const cardP = Math.min(1, Math.max(0, (p - 0.25) / 0.75));
    const cardE = easeInOut(cardP);

    const fromY = 72;   // mélyen bent
    const toY = -12;    // kint feljebb
    const y = fromY + (toY - fromY) * cardE;

    // kis "depth" (translateZ) hogy tényleg előrébb jöjjön
    if (card) card.style.transform = `translateY(${y}%) translateZ(20px)`;

    // 3) SEAL eltűnés finoman
    if (seal) {
      // ahogy indul a nyitás, tűnjön el
      const hideP = Math.min(1, Math.max(0, (p - 0.10) / 0.25));
      const hideE = easeInOut(hideP);

      seal.style.opacity = String(1 - hideE);
      seal.style.transform = `translate(-50%, -50%) scale(${1 - 0.08 * hideE})`;
      seal.style.transition = "opacity .2s ease, transform .2s ease";
    }
  }

  function onScroll() {
    if (!raf) raf = requestAnimationFrame(animate);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // ===== reveal on scroll (maradhat) =====
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add("in");
      }
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // ===== RSVP (maradhat) =====
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
