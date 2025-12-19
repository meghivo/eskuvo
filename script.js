(() => {
  // Use the BIG envelope elements
  const flap = document.getElementById("flapBig");
  const card = document.getElementById("cardBig");
  const envelope = document.getElementById("envelopeBig");

  function easeInOut(x){
    return x * x * (3 - 2 * x); // smoothstep
  }

  function getProgress() {
    if (!envelope) return 0;

    const rect = envelope.getBoundingClientRect();
    const viewH = window.innerHeight;

    // Start when envelope is a bit below the top, end after it moves up
    const start = viewH * 0.70;   // begin while it's coming into view
    const end   = viewH * 0.05;   // finish when near top-ish

    const t = (rect.top - start) / (end - start);
    return Math.min(1, Math.max(0, t));
  }

  let raf = null;

  function animate() {
    raf = null;
    const p = getProgress();

    // flap: 0..0.55, card: 0.35..1
    const flapP = Math.min(1, p / 0.55);
    const cardP = Math.min(1, Math.max(0, (p - 0.35) / 0.65));

    // open flap
    const flapDeg = -160 * flapP;
    if (flap) flap.style.transform = `rotateX(${flapDeg}deg)`;

    // slide card out
    const from = 60;   // start deeper inside
    const to = -10;    // end higher (out)
    const y = from + (to - from) * easeInOut(cardP);
    if (card) card.style.transform = `translateY(${y}%)`;

    // fade seal a bit while opening
    if (envelope) {
      const seal = envelope.querySelector(".seal");
      if (seal) {
        const opacity = 1 - Math.min(1, Math.max(0, (p - 0.25) / 0.35));
        seal.style.opacity = String(0.15 + 0.85 * opacity);
        seal.style.transform = `translate(-50%, -50%) scale(${0.98 + 0.04 * opacity})`;
      }
    }
    const seal = document.querySelector(".seal");

    // progress 0..1 (ahogy eddig is számolod)
    if (seal) {
      const hide = progress > 0.15; // amikor már elkezd nyílni
      seal.style.opacity = hide ? "0" : "1";
      seal.style.transform = hide
        ? "translate(-50%, -50%) scale(.92)"
        : "translate(-50%, -50%) scale(1)";
      seal.style.transition = "opacity .25s ease, transform .25s ease";
}

  }

  function onScroll() {
    if (!raf) raf = requestAnimationFrame(animate);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Reveal sections
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add("in");
    }
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // RSVP -> Google Forms submit (no redirect)
const form = document.getElementById("rsvpForm");
const msg = document.getElementById("formMsg");

if (form) {
  form.addEventListener("submit", () => {
    // Nem preventDefault! Küldjük el a Google Formnak a hidden_iframe-be.
    msg.textContent = "Küldés...";

    // Kis késleltetés, hogy biztosan elinduljon a submit, majd UI visszajelzés
    setTimeout(() => {
      msg.textContent = "Köszönjük! A válaszodat rögzítettük 💙";
      form.reset();
    }, 900);
  });
}
})();
