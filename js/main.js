const PRICING = {
  models: [{ name: "Cube 2 m", price: "Do potwierdzenia" }],
  heaters: [
    { name: "Piec elektryczny", price: "Do potwierdzenia" },
    { name: "Piec na drewno", price: "Do potwierdzenia" },
  ],
  options: [
    { name: "Przeszklenie panoramiczne", price: "Do potwierdzenia" },
    { name: "LED pod ławkami", price: "Do potwierdzenia" },
    { name: "Ławki z osiki lub olchy", price: "Do potwierdzenia" },
  ],
  transport: [
    { name: "Transport 0–100 km", price: "Wycena po podaniu lokalizacji" },
    { name: "Transport 101–150 km", price: "Wycena po podaniu lokalizacji" },
  ],
}
const FORM_ENDPOINT = "https://example.pl/api/wycena",
  MAP_URL =
    "https://www.openstreetmap.org/export/embed.html?bbox=18.8%2C51.2%2C19.2%2C51.5&layer=mapnik",
  reduced = matchMedia("(prefers-reduced-motion: reduce)")
const header = document.querySelector("header"),
  menu = document.querySelector(".menu"),
  nav = document.querySelector("nav")
function closeMenu(focus = false) {
  menu.setAttribute("aria-expanded", "false")
  menu.querySelector(".sr").textContent = "Otwórz menu"
  nav.classList.remove("open")
  header.classList.remove("open")
  document.body.classList.remove("menu-open")
  if (focus) menu.focus()
}
menu.onclick = () => {
  const open = menu.getAttribute("aria-expanded") === "true"
  if (open) return closeMenu()
  menu.setAttribute("aria-expanded", "true")
  menu.querySelector(".sr").textContent = "Zamknij menu"
  nav.classList.add("open")
  header.classList.add("open")
  document.body.classList.add("menu-open")
}
nav.querySelectorAll("a").forEach((a) => (a.onclick = () => closeMenu()))
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) closeMenu(true)
})
addEventListener("resize", () => {
  if (innerWidth >= 900 && nav.classList.contains("open")) closeMenu(true)
})
const updateHeader = () =>
  header.classList.toggle("scrolled", scrollY > innerHeight * 0.72)
addEventListener("scroll", updateHeader, { passive: true })
updateHeader()
const video = document.querySelector("video")
if (!reduced.matches) {
  video.play().catch(() => {})
  new IntersectionObserver(
    ([e]) => (e.isIntersecting ? video.play().catch(() => {}) : video.pause()),
    { threshold: 0.1 },
  ).observe(video)
  const io = new IntersectionObserver(
    (entries, o) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible")
          o.unobserve(e.target)
        }
      }),
    { threshold: 0.1 },
  )
  document.querySelectorAll(".reveal").forEach((e) => io.observe(e))
  let tick = false
  addEventListener(
    "scroll",
    () => {
      if (innerWidth >= 768 && !tick) {
        requestAnimationFrame(() => {
          document.querySelector(".hero-mark").style.transform =
            `translateY(${scrollY * 0.13}px)`
          tick = false
        })
        tick = true
      }
    },
    { passive: true },
  )
} else {
  video.pause()
  document
    .querySelectorAll(".reveal")
    .forEach((e) => e.classList.add("visible"))
}
const tbody = document.querySelector("#pricing"),
  modelSelect = document.querySelector("#model"),
  heaterSelect = document.querySelector("#heater")
;[
  ["Model", PRICING.models],
  ["Piec", PRICING.heaters],
  ["Wyposażenie dodatkowe", PRICING.options],
  ["Dostawa", PRICING.transport],
].forEach(([label, rows]) => {
  tbody.insertAdjacentHTML(
    "beforeend",
    `<tr class="group"><td colspan="2">${label}</td></tr>`,
  )
  rows.forEach((r) =>
    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr><td>${r.name}</td><td>${r.price}</td></tr>`,
    ),
  )
})
PRICING.models.forEach((x) => modelSelect.add(new Option(x.name, x.name)))
PRICING.heaters.forEach((x) => heaterSelect.add(new Option(x.name, x.name)))
document.querySelectorAll("details").forEach(
  (d) =>
    (d.ontoggle = () => {
      if (d.open) document.querySelectorAll("details[open]").forEach((x) => {
          if (x !== d) x.open = false
        })
    }),
)
const dialog = document.querySelector("dialog"),
  dimg = dialog.querySelector("img")
let trigger
document.querySelectorAll(".gallery button").forEach(
  (b) =>
    (b.onclick = () => {
      trigger = b
      dimg.src = b.dataset.full
      dimg.alt = b.querySelector("img").alt
      dialog.showModal()
    }),
)
dialog.querySelector("button").onclick = () => dialog.close()
dialog.onclick = (e) => {
  if (e.target === dialog) dialog.close()
}
dialog.onclose = () => trigger?.focus()
const form = document.querySelector("#form"),
  status = form.querySelector(".status"),
  message = form.elements.message
message.oninput = () =>
  (document.querySelector("#count").textContent =
    `${message.value.length} / 500`)
const tests = {
  name: (f) =>
    f.value.trim().length >= 2 ? "" : "Wpisz imię (minimum 2 znaki).",
  phone: (f) =>
    /^[+()\d\s-]{7,20}$/.test(f.value.trim())
      ? ""
      : "Wpisz poprawny numer telefonu.",
  location: (f) =>
    f.value.trim().length >= 2 ? "" : "Wpisz miejscowość działki.",
  consent: (f) => (f.checked ? "" : "Zgoda jest wymagana."),
}
function validate(f) {
  const error = tests[f.name]?.(f) || ""
  f.setAttribute("aria-invalid", String(!!error))
  document.querySelector(`#${f.name}-error`).textContent = error
  return !error
}
Object.keys(tests).forEach(
  (n) => (form.elements[n].onblur = (e) => validate(e.target)),
)
form.onsubmit = async (e) => {
  e.preventDefault()
  if (form.elements.website.value) return
  const fields = Object.keys(tests).map((n) => form.elements[n]),
    valid = fields.map(validate).every(Boolean)
  if (!valid) {
    fields.find((f) => f.getAttribute("aria-invalid") === "true")?.focus()
    status.textContent = "Sprawdź zaznaczone pola."
    status.className = "status bad"
    return
  }
  const button = form.querySelector("[type=submit]")
  button.disabled = true
  button.textContent = "Wysyłanie…"
  status.textContent = ""
  status.className = "status"
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    })
    if (!res.ok) throw Error()
    form.reset()
    document.querySelector("#count").textContent = "0 / 500"
    status.textContent =
      "Dziękujemy za zapytanie. Wrócimy z informacjami o konfiguracji, cenie i dostawie."
  } catch {
    status.innerHTML =
      'Nie udało się wysłać formularza. Zadzwoń: <a href="tel:+48000000000">+48 000 000 000</a>.'
    status.className = "status bad"
  } finally {
    button.disabled = false
    button.textContent = "Poproś o wycenę"
  }
}
document.querySelector("#show-map").onclick = () => {
  const iframe = document.createElement("iframe")
  iframe.src = MAP_URL
  iframe.title = "Mapa obszaru dostaw Sauny Kwadra"
  iframe.loading = "lazy"
  document.querySelector("#map").replaceChildren(iframe)
}
document.querySelector("#year").textContent = new Date().getFullYear()
