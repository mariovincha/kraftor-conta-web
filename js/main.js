// Kraftor contabilidad · web — comportamiento de la landing

// Datos de contacto: cambiarlos aquí y se actualizan en toda la página
const CONTACTO = {
  whatsapp: '51958317486', // con código de país y sin espacios, ej. '51987654321'. Vacío = el formulario usa el correo
  correo: 'contabilidad@kraftor.com',
  // Redes sociales: pegar el enlace cuando exista; las vacías no se muestran
  redes: {
    facebook: '',
    instagram: '',
    tiktok: '',
    linkedin: '',
  },
};

const waLink = (texto = '') =>
  `https://wa.me/${CONTACTO.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;

// Enlaces de WhatsApp y correo
document.querySelectorAll('[data-wa]').forEach((a) => {
  if (!CONTACTO.whatsapp) return; // sin número, los botones llevan al formulario
  a.href = waLink('Hola, quisiera información sobre sus servicios de contabilidad.');
  a.target = '_blank';
  a.rel = 'noopener';
});
document.querySelectorAll('[data-wa-text]').forEach((el) => {
  if (CONTACTO.whatsapp) el.textContent = `WhatsApp · +${CONTACTO.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4')}`;
});
document.querySelectorAll('[data-mail]').forEach((el) => {
  el.textContent = CONTACTO.correo;
  el.closest('a').href = `mailto:${CONTACTO.correo}`;
});

// Redes sociales: se muestran solo las que tienen enlace
let hayRedes = false;
document.querySelectorAll('[data-red]').forEach((a) => {
  const url = CONTACTO.redes[a.dataset.red];
  if (!url) return;
  a.href = url;
  a.hidden = false;
  hayRedes = true;
});
if (hayRedes) document.querySelector('.social').hidden = false;

// Banner principal: carrusel (avanza solo, pausa con el mouse o el teclado, flechas, pestañas y deslizar)
(() => {
  const hc = document.querySelector('.hc');
  if (!hc) return;
  const DUR = 7000;
  const slides = [...hc.querySelectorAll('.hc-slide')];
  const tabs = [...hc.querySelectorAll('.hc-tab')];
  hc.style.setProperty('--dur', DUR + 'ms');
  let cur = 0, timer;

  // Las fotos 2 y 3 se cargan después de la página, para que la primera aparezca rápido
  const loadPhotos = () => hc.querySelectorAll('img[data-src]').forEach((img) => {
    img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  });
  if (document.readyState === 'complete') loadPhotos();
  else window.addEventListener('load', loadPhotos);

  function go(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach((el, k) => {
      el.classList.toggle('on', k === cur);
      el.setAttribute('aria-hidden', k !== cur);
      el.inert = k !== cur; // los botones de los banners ocultos no reciben foco
    });
    tabs.forEach((el, k) => {
      el.classList.toggle('on', k === cur);
      const bar = el.querySelector('i');
      bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; // reinicia la barra
    });
    clearTimeout(timer);
    if (!hc.classList.contains('paused')) timer = setTimeout(() => go(cur + 1), DUR);
  }
  const pause = () => { hc.classList.add('paused'); clearTimeout(timer); };
  // Quien prefiere menos movimiento: no avanza solo
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resume = () => { if (still) return; hc.classList.remove('paused'); go(cur); };
  hc.addEventListener('mouseenter', pause);
  hc.addEventListener('mouseleave', resume);
  hc.addEventListener('focusin', pause);
  hc.addEventListener('focusout', (e) => { if (!hc.contains(e.relatedTarget)) resume(); });
  hc.addEventListener('click', (e) => {
    const t = e.target.closest('.hc-tab'); if (t) return go(+t.dataset.i);
    const a = e.target.closest('[data-step]'); if (a) go(cur + +a.dataset.step);
  });
  let x0 = null;
  hc.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  hc.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
  });
  if (still) hc.classList.add('paused');
  go(0);
})();

// Menú en celular
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
menuBtn.addEventListener('click', () => {
  const abierto = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', abierto);
});
navLinks.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

// Formulario: arma el mensaje y lo abre en WhatsApp (o en el correo si no hay número)
const form = document.getElementById('contact-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const texto = [
    `Hola, soy ${d.nombre}. Quisiera un diagnóstico gratis.`,
    d.negocio && `Negocio: ${d.negocio}`,
    `Tipo: ${d.tipo}`,
    `WhatsApp: ${d.telefono}`,
    d.mensaje && `Mensaje: ${d.mensaje}`,
  ].filter(Boolean).join('\n');

  if (CONTACTO.whatsapp) {
    window.open(waLink(texto), '_blank', 'noopener');
  } else {
    location.href = `mailto:${CONTACTO.correo}?subject=${encodeURIComponent('Diagnóstico gratis · ' + (d.negocio || d.nombre))}&body=${encodeURIComponent(texto)}`;
  }
  form.classList.add('sent');
});

document.getElementById('year').textContent = new Date().getFullYear();
