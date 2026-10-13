/**
 * Ritmo Run Club — Parallax Cinematográfico & Smooth Scroll Global
 * 
 * Orquestração Especialista:
 * 1. Scroll-Driven Blur Reveal no Texto Editorial:
 *    - O texto editorial (meta-tag, prefixo, sufixo, lead) emerge de um blur cinematográfico de 14px -> 0px
 *    - Opacidade de 0.15 -> 1.0 e translação de 20px -> 0px sincronizadas com a subida de #treinos
 * 2. Seam Lip com Frosted Glass Real sobrepondo a Hero:
 *    - .next__seam-lip com backdrop-filter: blur(24px) flutua 40px acima da linha divisória
 *    - Suaviza e desfoca a cena fotográfica e os corredores antes da transição para o branco sólido
 * 3. Transição de Cor Gradual & Docking com Respiro Total do Acento Agudo:
 *    - Título Branco (#title-white) na Hero e Título Laranja (#title-orange) em #treinos
 *    - clip-path com margem superior negativa de -25% (inset(-25% -10% ...)) garantindo folga total para o 'É' de ALÉM
 *    - Pouso contínuo em 0, 0, 0 sem reflow, sem appendChild e sem layout shifts
 * 4. Interatividade dos Filtros de Objetivos (Tabs de Pílulas):
 *    - Alternância de categorias e destaque nos cards do Bento Grid
 */

(() => {
  const hero = document.getElementById('hero');
  const heroBackdrop = document.getElementById('hero-backdrop');
  const heroTitleBox = document.getElementById('hero-title-box');
  const titleWhite = document.getElementById('title-white') || document.getElementById('title-layer-white');
  const titleOrange = document.getElementById('title-orange') || document.getElementById('title-layer-orange');
  const editorialSlot = document.getElementById('editorial-title-slot');
  const editorialPrefix = document.getElementById('editorial-prefix');
  const editorialSuffix = document.getElementById('editorial-suffix');
  const editorialLead = document.getElementById('editorial-lead');
  const nextSection = document.getElementById('treinos');
  const nextFullBlur = document.getElementById('next-full-blur');
  const layerFront = document.getElementById('layer-front') || document.querySelector('[data-depth="front"]');
  const layerMid = document.querySelector('[data-depth="mid"]');
  const heroAtmosphere = document.getElementById('hero-atmosphere');
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navDrawer = document.getElementById('nav-drawer');
  const drawerLinks = document.querySelectorAll('.nav__drawer-link');
  const heroBar = hero?.querySelector('.hero__bar');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const bentoCards = document.querySelectorAll('.bento-card');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Inicialização do Lenis Smooth Scroll Global
  let lenisInstance = null;
  if (typeof window.Lenis !== 'undefined' && !reduceMotion) {
    lenisInstance = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // 2. Controle da Navbar Flutuante em Pílula (Revela a partir de 50% da Hero)
  const updateNav = (scrollY) => {
    const currentY = scrollY !== undefined ? scrollY : window.scrollY;
    const heroH = hero?.offsetHeight || window.innerHeight;
    const triggerThreshold = heroH * 0.5;

    if (currentY >= triggerThreshold) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  };

  // 3. Menu Mobile Drawer Acessível
  if (navToggle && navDrawer) {
    const toggleMenu = (open) => {
      const isExpanded = open !== undefined ? open : navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(isExpanded));
      if (isExpanded) {
        navDrawer.removeAttribute('hidden');
      } else {
        navDrawer.setAttribute('hidden', '');
      }
    };

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    drawerLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('click', (e) => {
      if (nav && !nav.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  // 4. Seletor Interativo de Objetivos (Tabs de Filtro do Bento Grid)
  if (filterTabs.length > 0) {
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const filter = tab.getAttribute('data-filter') || 'all';

        bentoCards.forEach((card) => {
          const categories = card.getAttribute('data-category') || '';
          const categoryList = categories.split(',').map((c) => c.trim());
          if (filter === 'all' || categoryList.includes(filter)) {
            card.classList.remove('is-dimmed');
          } else {
            card.classList.add('is-dimmed');
          }
        });
      });
    });
  }

  // Se o usuário prefere movimento reduzido, desativa o parallax dinâmico
  if (!hero || reduceMotion) return;

  // 5. Configuração das Camadas Fotográficas da Hero
  const config = {
    bg:    { mx: 6,  my: 2, scroll: 0.08 },
    mid:   { mx: 14, my: 2, scroll: 0.04 },
    front: { mx: 24, my: 2, scroll: 0.02 },
  };

  const photoLayers = ['bg', 'mid', 'front'].map((depth) => {
    const el = document.querySelector(`[data-depth="${depth}"]`);
    return {
      el,
      depth,
      ...config[depth],
    };
  }).filter((item) => Boolean(item.el));

  // Estados de mouse e scroll
  const targetMouse = { x: 0, y: 0 };
  const currentMouse = { x: 0, y: 0 };
  let currentScrollY = window.scrollY;
  let isRunning = false;

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  // Geometria dinâmica e contínua para ancoragem sem salto / sem reflow
  function computeDockGeometry() {
    if (!editorialSlot || !heroTitleBox || !nextSection) return null;

    // Medição neutra (sem transform ativo) para geometria determinística
    const prevTransform = heroTitleBox.style.transform;
    heroTitleBox.style.transform = 'none';

    const scroll = window.scrollY;
    const titleRect = heroTitleBox.getBoundingClientRect();
    const titlePageTop = titleRect.top + scroll;
    const titleHeight = titleRect.height;

    const treinosRect = nextSection.getBoundingClientRect();
    const treinosPageTop = treinosRect.top + scroll;

    // Restaura a transformação anterior
    heroTitleBox.style.transform = prevTransform;

    // Posição de repouso desejada do topo do título na Hero em scroll = 0 (equivalente a clamp(60px, 11vh, 120px))
    const vh = window.innerHeight;
    const targetHeroTop = Math.min(Math.max(60, vh * 0.11), 120);

    // Distância necessária para o título sair do slot e repousar na Hero em scroll = 0
    const initialTy = targetHeroTop - titlePageTop;

    // Jornada de scroll até o pouso completo no slot (dockScroll)
    const dockScroll = Math.max(120, Math.abs(initialTy) * 0.68);

    return {
      titlePageTop,
      treinosPageTop,
      targetHeroTop,
      initialTy,
      dockScroll,
      titleHeight,
    };
  }

  let geom = computeDockGeometry();

  window.addEventListener('resize', () => {
    geom = computeDockGeometry();
    requestRender();
  }, { passive: true });

  if (document.fonts) {
    document.fonts.ready.then(() => {
      geom = computeDockGeometry();
      requestRender();
    });
  }

  function onMouseMove(e) {
    if (isTouchDevice) return;
    targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    requestRender();
  }

  function onMouseLeave() {
    targetMouse.x = 0;
    targetMouse.y = 0;
    requestRender();
  }

  function onScrollUpdate(scrollY) {
    currentScrollY = scrollY !== undefined ? scrollY : window.scrollY;
    updateNav(currentScrollY);
    requestRender();
  }

  if (lenisInstance) {
    lenisInstance.on('scroll', (e) => {
      onScrollUpdate(e.scroll);
    });
  } else {
    window.addEventListener('scroll', () => onScrollUpdate(window.scrollY), { passive: true });
  }
  updateNav(window.scrollY);

  function requestRender() {
    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    // Interpolação suave do mouse
    const lerpMouse = 0.065;
    currentMouse.x += (targetMouse.x - currentMouse.x) * lerpMouse;
    currentMouse.y += (targetMouse.y - currentMouse.y) * lerpMouse;

    const heroH = window.innerHeight;
    const effectiveScroll = Math.max(currentScrollY, 0);

    // Fade out suave da barra inferior da hero
    if (heroBar) {
      const barFade = Math.max(1 - (effectiveScroll / (heroH * 0.38)), 0);
      heroBar.style.opacity = barFade.toFixed(3);
      heroBar.style.pointerEvents = barFade < 0.08 ? 'none' : 'auto';
    }

    // Camadas fotográficas: recuo e parallax
    for (const layer of photoLayers) {
      const tx = -currentMouse.x * layer.mx;
      const ty = -currentMouse.y * layer.my + effectiveScroll * layer.scroll;
      layer.el.style.setProperty('--tx', `${tx.toFixed(2)}px`);
      layer.el.style.setProperty('--ty', `${ty.toFixed(2)}px`);
    }

    // 6. Orquestração Contínua do Título Único (Zero Salto / Zero Piscadinha)
    if (heroTitleBox && geom) {
      const dockScroll = geom.dockScroll;
      let progress = 1;
      let currentTy = 0;
      let mouseFactor = 0;

      if (effectiveScroll < dockScroll) {
        progress = Math.min(Math.max(effectiveScroll / dockScroll, 0), 1);
        currentTy = geom.initialTy * (1 - progress);
        mouseFactor = 1 - progress;
      }

      const tx = -currentMouse.x * 8 * mouseFactor;
      const ty = currentTy - (currentMouse.y * 2 * mouseFactor);

      // Posicionamento do container Laranja em #treinos
      heroTitleBox.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;

      // Medição das coordenadas reais em pixels diretamente dos elementos:
      const treinosRect = nextSection.getBoundingClientRect();
      const curtainTop = treinosRect.top; // Topo exato da cortina branca no viewport

      const orangeRect = titleOrange ? titleOrange.getBoundingClientRect() : heroTitleBox.getBoundingClientRect();
      const orangeTop = orangeRect.top;
      const orangeBottom = orangeRect.bottom;

      // O título branco acompanha exatamente o topo do laranja no viewport:
      if (titleWhite) {
        titleWhite.style.transform = `translate3d(${tx.toFixed(2)}px, ${orangeTop.toFixed(2)}px, 0)`;
      }

      // Corte do título Laranja (SÓ visível ABAIXO de curtainTop):
      if (titleOrange) {
        if (curtainTop <= orangeTop) {
          // 100% dentro de #treinos
          titleOrange.style.clipPath = 'none';
        } else if (curtainTop >= orangeBottom) {
          // 100% na Hero (ainda não entrou em #treinos)
          titleOrange.style.clipPath = 'inset(100% 0 0 0)';
        } else {
          // Corta de cima para baixo EXATAMENTE na linha curtainTop em pixels:
          const clipTopPx = curtainTop - orangeTop;
          titleOrange.style.clipPath = `inset(${clipTopPx.toFixed(2)}px -20% -25% -20%)`;
        }
      }

      // Corte do título Branco (SÓ visível ACIMA de curtainTop):
      if (titleWhite) {
        if (curtainTop >= orangeBottom) {
          // 100% na Hero
          titleWhite.style.clipPath = 'none';
        } else if (curtainTop <= orangeTop) {
          // 100% dentro de #treinos
          titleWhite.style.clipPath = 'inset(100% 0 0 0)';
        } else {
          // Corta de baixo para cima EXATAMENTE na linha curtainTop em pixels:
          const clipBottomPx = orangeBottom - curtainTop;
          titleWhite.style.clipPath = `inset(-25% -20% ${clipBottomPx.toFixed(2)}px -20%)`;
        }
      }

      // Controle do Full Blur que cobre toda a segunda seção e some no docking:
      if (nextFullBlur && geom) {
        // Enquanto o título desce, o blur sobrepõe toda a segunda seção.
        // Quando o CORRA ALÉM atinge a posição certa (progress de 0.75 a 1.0):
        // o blur desaparece suavemente revelando toda a seção!
        if (progress >= 1) {
          nextFullBlur.style.opacity = '0';
        } else if (progress > 0.75) {
          const fade = (1 - (progress - 0.75) / 0.25);
          nextFullBlur.style.opacity = fade.toFixed(2);
        } else {
          nextFullBlur.style.opacity = '1';
        }
      }

      // 7. Scroll-Driven Blur Reveal Suave no Texto Editorial (Emergência Cinematográfica de 6px a 0px)
      const revealStart = dockScroll * 0.10;
      const revealEnd = dockScroll * 0.88;
      let revealProgress = 0;
      if (effectiveScroll <= revealStart) {
        revealProgress = 0;
      } else if (effectiveScroll >= revealEnd) {
        revealProgress = 1;
      } else {
        revealProgress = (effectiveScroll - revealStart) / (revealEnd - revealStart);
      }

      // Varia suavemente de no máximo 6px até 0px (sem borrão excessivo)
      const blurVal = (1 - revealProgress) * 6; // De 6px até 0px
      const opacityVal = 0.35 + (revealProgress * 0.65); // De 0.35 até 1.0
      const transYVal = (1 - revealProgress) * 16; // De 16px até 0px

      const blurFilter = blurVal > 0.2 ? `blur(${blurVal.toFixed(1)}px)` : 'none';
      const textTransform = transYVal > 0.2 ? `translate3d(0, ${transYVal.toFixed(1)}px, 0)` : 'none';

      const editorialElements = [editorialPrefix, editorialSuffix, editorialLead];
      for (const el of editorialElements) {
        if (el) {
          el.style.filter = blurFilter;
          el.style.opacity = opacityVal.toFixed(2);
          el.style.transform = textTransform;
        }
      }

      // 8. Clipping Cirúrgico dos Corredores, Sombras e Névoa (Não invadem #treinos)
      const cutBottom = Math.max(0, window.innerHeight - curtainTop);
      if (layerFront) {
        layerFront.style.clipPath = cutBottom > 0 ? `inset(0 0 ${cutBottom.toFixed(1)}px 0)` : 'none';
      }
      if (layerMid) {
        layerMid.style.clipPath = cutBottom > 0 ? `inset(0 0 ${cutBottom.toFixed(1)}px 0)` : 'none';
      }
      if (heroAtmosphere) {
        heroAtmosphere.style.clipPath = cutBottom > 0 ? `inset(0 0 ${cutBottom.toFixed(1)}px 0)` : 'none';
      }

      // Fade out de segurança após estar completamente dentro de #treinos
      if (effectiveScroll > (dockScroll + 160)) {
        const fade = Math.max(0, 1 - (effectiveScroll - (dockScroll + 160)) / 200);
        if (layerFront) layerFront.style.opacity = fade.toFixed(3);
        if (heroAtmosphere) heroAtmosphere.style.opacity = fade.toFixed(3);
        if (heroBackdrop) heroBackdrop.style.opacity = fade.toFixed(3);
        if (titleWhite) titleWhite.style.opacity = fade.toFixed(3);
      } else {
        if (layerFront) layerFront.style.opacity = '1';
        if (heroAtmosphere) heroAtmosphere.style.opacity = '1';
        if (heroBackdrop) heroBackdrop.style.opacity = '1';
        if (titleWhite) titleWhite.style.opacity = '1';
      }
    }

    // Critério de parada do loop para economia de CPU/GPU quando estabilizar
    const mouseSettled =
      Math.abs(targetMouse.x - currentMouse.x) < 0.0005 &&
      Math.abs(targetMouse.y - currentMouse.y) < 0.0005;

    if (mouseSettled) {
      isRunning = false;
    } else {
      requestAnimationFrame(tick);
    }
  }

  // Listeners de mouse em window para capturar em qualquer ponto da viewport
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave);

  // Inicialização no carregamento
  onScrollUpdate(window.scrollY);
  requestRender();
})();
