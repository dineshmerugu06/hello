// Ponytail: native form controls hold the pricing state; this file only totals it and animates.
const form = document.querySelector("#pricing");
const total = () => {
  const plan = form.querySelector('input[name="plan"]:checked');
  const addons = [...form.querySelectorAll('input[name="addon"]:checked')];
  const sum = +plan.value + addons.reduce((s, a) => s + +a.value, 0);
  document.querySelector("#s-name").textContent = plan.dataset.name;
  document.querySelector("#s-price").textContent = `$${plan.value} /month`;
  document.querySelector("#s-addons").innerHTML =
    addons.map(a => `<li>+ ${a.dataset.name} — $${a.value} /month</li>`).join("");
  document.querySelector("#s-total").textContent = `$${sum} /month`;
};
form.addEventListener("change", total);
total();

// Self-check: Presence 119 + Brand 109 + Local 49 = 277.
console.assert(119 + 109 + 49 === 277, "pricing math");

if (!matchMedia("(prefers-reduced-motion: reduce)").matches && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  gsap.from(".hero h1, .hero p, .hero .btn", { y: 30, opacity: 0, duration: .7, ease: "power3.out", stagger: .08 });
  document.querySelectorAll("[data-reveal]").forEach(el => {
    if (el.closest(".hero")) return;
    gsap.from(el, { y: 24, opacity: 0, duration: .6, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" } });
  });
}
