/* ===================================================
   GLOBO AÇOS – WOW Edition v3.0
   Effects: Canvas sparks, Custom cursor, 3D tilt,
   Magnetic buttons, Typed text, Cinematic reveals
   =================================================== */
'use strict';

// =============================================
// CANVAS SPARK PARTICLES
// =============================================
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dpr = 1, particles = [], animId;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Spark {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -(Math.random() * 1.5 + 0.3);
      this.alpha = Math.random() * 0.7 + 0.1;
      this.size = Math.random() * 2.5 + 0.5;
      this.decay = Math.random() * 0.004 + 0.002;
      this.hue = Math.random() > 0.5 ? 210 : 140; // navy-blue or green
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy *= 0.995;
      this.alpha -= this.decay;
      if (this.alpha <= 0) this.reset(false);
    }
    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = `hsl(${this.hue}, 95%, 65%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    resize();
    const particleCount = Math.min(52, Math.max(26, Math.round((W * H) / 28000)));
    particles = Array.from({ length: particleCount }, () => new Spark());
    loop();
  }

  function loop() {
    if (document.hidden) { animId = null; return; }
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    animId = requestAnimationFrame(loop);
  }

  // Stop canvas when hero is not visible
  const hero = document.getElementById('hero');
  const heroObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animId) loop();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0.01 });
  heroObs.observe(hero);

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !animId && hero.getBoundingClientRect().bottom > 0) loop();
  });
  init();
})();

// =============================================
// CUSTOM CURSOR
// =============================================
(function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  }, { passive: true });

  function lerp(a, b, t) { return a + (b - a) * t; }

  let ringFrame = null;
  function animRing() {
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    if (Math.abs(rx - mx) > .2 || Math.abs(ry - my) > .2) ringFrame = requestAnimationFrame(animRing);
    else ringFrame = null;
  }

  document.addEventListener('mousemove', () => {
    if (!ringFrame) ringFrame = requestAnimationFrame(animRing);
  }, { passive: true });

  const hoverEls = document.querySelectorAll('a, button, .produto-card, .projeto-img, .filter-btn, input, textarea, select');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
})();

// =============================================
// NAVBAR SCROLL
// =============================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// =============================================
// HAMBURGER
// =============================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// =============================================
// TYPED TEXT EFFECT
// =============================================
(function initTyped() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'Do projeto à instalação, fabricamos e instalamos coberturas metálicas com tecnologia de ponta.',
    'Mão de obra 100% CLT, sem terceirização — controle total em cada obra.',
    'Telha zipada, lanternins, venezianas e exaustores com qualidade certificada.',
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false, pauseTimer = null;

  function type() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        pauseTimer = setTimeout(type, 2800);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        pauseTimer = setTimeout(type, 400);
        return;
      }
    }

    const speed = deleting ? 22 : 38;
    pauseTimer = setTimeout(type, speed);
  }

  // Start after hero animation
  setTimeout(type, 1200);
})();

// =============================================
// SMOOTH SCROLL
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const offset = navbar.offsetHeight + 16;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

// =============================================
// COUNTER ANIMATION
// =============================================
function animateCounter(el, target, duration = 2000) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4); // ease-out quart
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    animateCounter(el, parseInt(el.dataset.target, 10));
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

// =============================================
// CINEMATIC SCROLL REVEAL
// =============================================
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

// Assign reveal classes with staggered delays
function assignReveal(selector, type = 'reveal-up', stagger = 80) {
  document.querySelectorAll(selector).forEach((el, i) => {
    if (!el.style.transitionDelay) {
      el.style.transitionDelay = (i * stagger) + 'ms';
    }
    el.classList.add(type);
    revealObs.observe(el);
  });
}

assignReveal('.produto-card', 'reveal-up', 90);
assignReveal('.processo-step', 'reveal-up', 80);
assignReveal('.depoimento-card', 'reveal-scale', 100);
assignReveal('.feature-item', 'reveal-left', 70);
assignReveal('.mvv-item', 'reveal-right', 80);
assignReveal('.contato-item', 'reveal-left', 90);
assignReveal('.section-header', 'reveal-up', 0);
assignReveal('.sobre-card-main', 'reveal-left', 0);
assignReveal('.sobre-card-secondary', 'reveal-right', 100);
assignReveal('.sobre-content', 'reveal-right', 0);

// highlight underlines on scroll
const highlightObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.highlight').forEach(h => h.classList.add('underline-visible'));
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('section').forEach(s => highlightObs.observe(s));

// =============================================
// 3D TILT CARDS
// =============================================
(function initTilt() {
  const cards = document.querySelectorAll('.produto-card:not(.produto-card--cta)');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      const rotX = -dy * 8;
      const rotY = dx * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;

      // spotlight position for radial gradient
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  // Spotlight on all cards (including cta)
  document.querySelectorAll('.produto-card--cta, .projeto-img').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mx', mx + '%');
      el.style.setProperty('--my', my + '%');
    });
  });
})();

// =============================================
// MAGNETIC BUTTONS
// =============================================
(function initMagnetic() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--mx', mx + '%');
      btn.style.setProperty('--my', my + '%');

      // Subtle magnetic pull
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.18;
      const dy = (e.clientY - cy) * 0.18;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

// =============================================
// PARALLAX HERO GLOW (mouse)
// =============================================
(function initParallax() {
  const g1 = document.querySelector('.hero-glow-1');
  const g2 = document.querySelector('.hero-glow-2');
  if (!g1 || !g2) return;

  let ticking = false;
  document.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      g1.style.transform = `translate(${x}px, ${y}px)`;
      g2.style.transform = `translate(${-x * 0.6}px, ${-y * 0.6}px)`;
      ticking = false;
    });
  }, { passive: true });
})();

// =============================================
// PROJECTS FILTER (with animation)
// =============================================
(function initFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.projeto-item');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      items.forEach((item, i) => {
        const cats = (item.dataset.cat || 'all').split(' ');
        const show = filter === 'all' || cats.includes(filter);

        if (show) {
          item.classList.remove('hidden');
          item.style.animationDelay = (i * 60) + 'ms';
          item.style.animation = 'none';
          void item.offsetWidth; // reflow
          item.style.animation = 'filterIn .4s ease both';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();

// Inject filter animation keyframe
const filterStyle = document.createElement('style');
filterStyle.textContent = `
  @keyframes filterIn {
    from { opacity: 0; transform: scale(.94) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
`;
document.head.appendChild(filterStyle);

// =============================================
// ACTIVE NAV ON SCROLL
// =============================================
(function initActiveNav() {
  const navAs = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const getTargets = () => navAs
    .map(a => {
      const id = a.getAttribute('href')?.slice(1);
      return id ? { id, link: a, el: document.getElementById(id) } : null;
    })
    .filter(item => item && item.el);

  let ticking = false;

  function setActive(id) {
    navAs.forEach(a => {
      a.classList.toggle('active-link', a.getAttribute('href') === `#${id}`);
    });
  }

  function updateActiveNav() {
    ticking = false;
    const targets = getTargets();
    if (!targets.length) return;

    const headerOffset = (navbar?.offsetHeight || 0) + Math.round(window.innerHeight * 0.22);
    const currentY = window.scrollY + headerOffset;
    let activeId = targets[0].id;

    targets.forEach(({ id, el }) => {
      if (el.offsetTop <= currentY) activeId = id;
    });

    const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
    if (nearBottom) activeId = targets[targets.length - 1].id;

    setActive(activeId);
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateActiveNav);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  window.addEventListener('load', updateActiveNav);
  updateActiveNav();
})();

// =============================================
// CONTACT FORM → WHATSAPP
// =============================================
(function initForm() {
  const form = document.getElementById('contatoForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nome     = form.nome.value.trim();
    const email    = form.email.value.trim();
    const mensagem = form.mensagem.value.trim();

    if (!nome || !email || !mensagem) {
      [form.nome, form.email, form.mensagem].forEach(f => {
        if (!f.value.trim()) {
          f.style.borderColor = '#1a2b4a';
          f.style.boxShadow = '0 0 0 4px rgba(230,51,41,.15)';
          f.addEventListener('input', () => {
            f.style.borderColor = '';
            f.style.boxShadow = '';
          }, { once: true });
        }
      });
      return;
    }

    const empresa  = form.empresa?.value?.trim() || '';
    const telefone = form.telefone?.value?.trim() || '';
    const servico  = form.servico?.value || '';

    let msg = `Olá! Vim pelo site da Globo Aços.\n\n`;
    msg += `*Nome:* ${nome}\n`;
    if (empresa)  msg += `*Empresa:* ${empresa}\n`;
    msg += `*E-mail:* ${email}\n`;
    if (telefone) msg += `*Telefone:* ${telefone}\n`;
    if (servico)  msg += `*Interesse:* ${servico}\n`;
    msg += `\n*Mensagem:* ${mensagem}`;

    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    setTimeout(() => {
      success.classList.add('visible');
      window.open(`https://wa.me/5519989694232?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
      form.reset();
      btn.innerHTML = `Enviar Mensagem <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      btn.disabled = false;
    }, 700);
  });
})();




// =============================================
// MAPA 3D BRASIL — Three.


// =============================================
// MAPA BRASIL — SVG interativo
// =============================================
(function initMapaBrasil() {

  // ── DADOS ────────────────────────────────
  const OBRAS = {
    'americana':     { city: 'Americana/SP',      obras: [
      { title: 'Galpão Logístico',         desc: 'Telha zipada 12.000m² com lanternins integrados' },
      { title: 'Indústria Metalúrgica',    desc: 'Cobertura galvalume com exaustores eólicos' },
      { title: 'Centro de Distribuição',   desc: 'Venezianas industriais e telha zipada' },
      { title: 'Fábrica de Alimentos',     desc: 'Lanternins contínuos com ventilação passiva' },
    ]},
    'campinas':      { city: 'Campinas/SP',        obras: [
      { title: 'Indústria Alimentícia',    desc: '24 exaustores eólicos para controle térmico' },
      { title: 'Galpão Pré-Moldado',       desc: 'Telha zipada curva em estrutura especial' },
      { title: 'Parque Industrial',        desc: 'Cobertura metálica 8.500m²' },
    ]},
    'sao-paulo':     { city: 'São Paulo/SP',        obras: [
      { title: 'Centro Empresarial',       desc: 'Cobertura metálica arquitetônica 3.200m²' },
      { title: 'Galpão Zona Norte',        desc: 'Telha trapezoidal com exaustores eólicos' },
      { title: 'Planta Industrial',        desc: 'Venezianas industriais e lanternins' },
    ]},
    'ribeirao-preto':{ city: 'Ribeirão Preto/SP',  obras: [
      { title: 'Cooperativa Agrícola',     desc: 'Cobertura 15.000m² telha galvalume' },
      { title: 'Frigorífico Industrial',   desc: 'Isolamento térmico com telha zipada' },
    ]},
    'curitiba':      { city: 'Curitiba/PR',         obras: [
      { title: 'Complexo Logístico',       desc: 'Telha zipada 20.000m² fase 1 e 2' },
      { title: 'Indústria Automotiva',     desc: 'Lanternins e venezianas de grande porte' },
    ]},
    'belo-horizonte':{ city: 'Belo Horizonte/MG',  obras: [
      { title: 'Galpão Mineração',         desc: 'Cobertura reforçada com telha zipada' },
      { title: 'Centro Comercial',         desc: 'Cobertura arquitetônica vidro e metal' },
    ]},
    'goiania':       { city: 'Goiânia/GO',          obras: [
      { title: 'Agroindústria',            desc: 'Galpão 18.000m² telha galvalume' },
      { title: 'Frigorífico',              desc: 'Exaustores eólicos e venezianas industriais' },
    ]},
    'manaus':        { city: 'Manaus/AM',            obras: [
      { title: 'Zona Franca Industrial',   desc: 'Cobertura metálica 6.000m² telha zipada' },
    ]},
    'brasilia':      { city: 'Brasília/DF',          obras: [
      { title: 'Complexo Governamental',   desc: 'Cobertura arquitetônica especial 4.200m²' },
      { title: 'Centro de Convenções',     desc: 'Telha zipada com isolamento acústico' },
    ]},
    'recife':        { city: 'Recife/PE',            obras: [
      { title: 'Porto Industrial',         desc: 'Galpão portuário 9.000m² galvalume' },
    ]},
  };

  // ── ELEMENTOS ────────────────────────────
  const svg        = document.getElementById('brazilSvg');
  const mapaFloat  = document.getElementById('mapaFloat');
  const tooltip    = document.getElementById('mapaTooltip');
  const tooltipTxt = document.getElementById('mapaTooltipText');
  const panelEmpty   = document.getElementById('mapaPanelEmpty');
  const panelContent = document.getElementById('mapaPanelContent');
  const panelClose   = document.getElementById('mapaPanelClose');
  const panelCityName  = document.getElementById('panelCityName');
  const panelCityCount = document.getElementById('panelCityCount');
  const obrasList    = document.getElementById('mapaObrasList');

  if (!svg) return;

  const pins   = svg.querySelectorAll('.map-pin');
  const labels = svg.querySelectorAll('.map-label');

  // ── PARALLAX NO HOVER ────────────────────
  const mapaSection = document.getElementById('obras');
  mapaSection && mapaSection.addEventListener('mousemove', e => {
    const r   = mapaSection.getBoundingClientRect();
    const dx  = (e.clientX - r.left - r.width  / 2) / r.width;
    const dy  = (e.clientY - r.top  - r.height / 2) / r.height;
    if (mapaFloat) {
      mapaFloat.style.transform = `translate(${dx * 18}px, ${dy * 12}px)`;
    }
  }, { passive: true });
  mapaSection && mapaSection.addEventListener('mouseleave', () => {
    if (mapaFloat) mapaFloat.style.transform = '';
  });

  // ── TOOLTIP ──────────────────────────────
  function showTooltip(pin, e) {
    tooltipTxt.textContent = pin.dataset.city;
    const svgRect = svg.getBoundingClientRect();
    // Posição relativa ao container do mapa
    const x = e.clientX - svgRect.left + 12;
    const y = e.clientY - svgRect.top  - 36;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
    tooltip.classList.add('visible');
  }
  function hideTooltip() { tooltip.classList.remove('visible'); }

  // ── LABEL HOVER ──────────────────────────
  function showLabel(id) {
    labels.forEach(l => {
      l.classList.toggle('visible', l.dataset.for === id);
    });
  }
  function hideLabels() { labels.forEach(l => l.classList.remove('visible')); }

  // ── PAINEL ───────────────────────────────
  function openPanel(id) {
    const data = OBRAS[id];
    if (!data) return;

    panelCityName.textContent  = data.city;
    panelCityCount.textContent = data.obras.length + (data.obras.length === 1 ? ' obra' : ' obras');

    obrasList.innerHTML = '';
    data.obras.forEach((o, i) => {
      const card = document.createElement('div');
      card.className = 'obra-card';
      card.innerHTML = `
        <div class="obra-card-icon">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#3a9e48" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="#3a9e48" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="obra-card-body">
          <strong>${o.title}</strong>
          <span>${o.desc}</span>
        </div>
        <div class="obra-card-arrow">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>`;
      card.dataset.index = i;
      card.addEventListener('click', () => openLightbox(data.obras, i));
      obrasList.appendChild(card);
      // Stagger reveal
      setTimeout(() => card.classList.add('show'), 60 + i * 70);
    });

    panelEmpty.style.display   = 'none';
    panelContent.style.display = 'flex';
    panelContent.style.flexDirection = 'column';
  }

  function closePanel() {
    panelContent.style.display = 'none';
    panelEmpty.style.display   = 'flex';
  }

  panelClose && panelClose.addEventListener('click', closePanel);

  // ── PIN EVENTS ───────────────────────────
  pins.forEach(pin => {
    const id = pin.dataset.id;

    pin.addEventListener('mouseenter', e => {
      showLabel(id);
      showTooltip(pin, e);
      pin.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(58,158,72,.7))';
    });

    pin.addEventListener('mousemove', e => showTooltip(pin, e));

    pin.addEventListener('mouseleave', () => {
      hideLabels();
      hideTooltip();
      pin.style.filter = '';
    });

    pin.addEventListener('click', () => {
      // Visual: reseta todos os pins e destaca o selecionado
      pins.forEach(p => p.querySelector('.pin-dot')?.setAttribute('opacity', '.6'));
      pin.querySelector('.pin-dot')?.setAttribute('opacity', '1');
      openPanel(id);
    });
  });

  // ── LIGHTBOX ─────────────────────────────
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightboxImg');
  const lbTitle   = document.getElementById('lightboxTitle');
  const lbDesc    = document.getElementById('lightboxDesc');
  const lbCounter = document.getElementById('lightboxCounter');
  const lbClose   = document.getElementById('lightboxClose');
  const lbPrev    = document.getElementById('lightboxPrev');
  const lbNext    = document.getElementById('lightboxNext');
  let lbItems = [], lbIdx = 0;

  function openLightbox(items, idx) {
    lbItems = items; lbIdx = idx;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderLb();
  }

  function renderLb() {
    const o = lbItems[lbIdx];
    lbImg.classList.add('loading');
    // SVG placeholder preparado para fotos reais
    const enc = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const data = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='560'>
      <rect width='900' height='560' fill='%230d1520'/>
      <rect x='40' y='40' width='820' height='480' rx='16' fill='%23162238' stroke='%233a9e48' stroke-width='1.5' opacity='.6'/>
      <text x='450' y='250' font-family='Inter,sans-serif' font-size='24' fill='%23b0bec8' text-anchor='middle' font-weight='700'>${enc(o.title)}</text>
      <text x='450' y='290' font-family='Inter,sans-serif' font-size='15' fill='%237a8a9a' text-anchor='middle'>${enc(o.desc)}</text>
      <text x='450' y='345' font-family='Inter,sans-serif' font-size='13' fill='%233a9e48' text-anchor='middle'>Adicione as fotos das obras aqui</text>
    </svg>`;
    lbImg.src = data;
    lbTitle.textContent   = o.title;
    lbDesc.textContent    = o.desc;
    lbCounter.textContent = `${lbIdx + 1} / ${lbItems.length}`;
    setTimeout(() => lbImg.classList.remove('loading'), 60);
  }

  function closeLb() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
  lbClose.addEventListener('click', closeLb);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
  lbPrev.addEventListener('click', () => { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; renderLb(); });
  lbNext.addEventListener('click', () => { lbIdx = (lbIdx + 1) % lbItems.length; renderLb(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLb();
    if (e.key === 'ArrowLeft')  { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; renderLb(); }
    if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbItems.length; renderLb(); }
  });

})();
