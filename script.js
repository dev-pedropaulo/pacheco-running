/**
 * Pacheco Running — Assessoria Esportiva
 * Parallax Cinematográfico & Smooth Scroll Global
 * 
 * Orquestração Especialista:
 * 1. Scroll-Driven Blur Reveal no Texto Editorial:
 *    - O texto editorial (prefixo, sufixo, lead) emerge de um blur suave de 6px -> 0px
 *    - Opacidade de 0.35 -> 1.0 e translação de 16px -> 0px sincronizadas com a subida de #treinos
 * 2. Transição de Cor Milimétrica & Docking Perfeito:
 *    - Título Branco (#title-white) na Hero e Título Laranja (#title-orange) em #treinos
 *    - clip-path calculado em pixels reais contra curtainTop no viewport
 *    - Pouso contínuo sem reflow, sem appendChild e sem layout shifts
 * 3. Full Blur Cobertura da Segunda Seção:
 *    - .next__full-blur sobrepõe a segunda seção durante a rolagem e dissipa suavemente no docking
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
  let closeMobileDrawer = null;
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
    closeMobileDrawer = () => toggleMenu(false);

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('click', (e) => {
      if (nav && !nav.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  // 4. Rolagem Suave Cinemática para Botões e Links da Navbar
  const smoothScrollToTarget = (targetSelector) => {
    if (!targetSelector || targetSelector === '#' || targetSelector === '#topo') {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    let targetElement = null;
    try {
      targetElement = document.querySelector(targetSelector);
    } catch (err) {
      targetElement = null;
    }

    if (!targetElement) return;

    const navHeight = nav ? nav.offsetHeight : 76;
    const offset = -(navHeight + 24);

    if (lenisInstance) {
      lenisInstance.scrollTo(targetElement, {
        offset: offset,
        duration: 1.2,
      });
    } else {
      const rect = targetElement.getBoundingClientRect();
      const targetPos = rect.top + window.scrollY + offset;
      window.scrollTo({
        top: Math.max(0, targetPos),
        behavior: 'smooth',
      });
    }
  };

  // Interceptar cliques em todos os links e botões da Navbar e navegação
  const navActionLinks = document.querySelectorAll(
    '#nav a[href^="#"], #nav-drawer a[href^="#"], .nav a[href^="#"], .nav__drawer a[href^="#"], .footer a[href^="#"], a.btn[href^="#"]'
  );

  navActionLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;

      e.preventDefault();

      if (closeMobileDrawer) {
        closeMobileDrawer();
      }

      smoothScrollToTarget(href);

      if (href !== '#' && history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });

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
      // O corte só se inicia quando a cortina de #treinos realmente atinge a base de cada elemento
      if (layerFront) {
        const frontRect = layerFront.getBoundingClientRect();
        const cutFront = Math.max(0, frontRect.bottom - curtainTop);
        layerFront.style.clipPath = cutFront > 0 ? `inset(0 0 ${cutFront.toFixed(1)}px 0)` : 'none';
      }
      if (layerMid) {
        const midRect = layerMid.getBoundingClientRect();
        const cutMid = Math.max(0, midRect.bottom - curtainTop);
        layerMid.style.clipPath = cutMid > 0 ? `inset(0 0 ${cutMid.toFixed(1)}px 0)` : 'none';
      }
      if (heroAtmosphere) {
        const atmoRect = heroAtmosphere.getBoundingClientRect();
        const cutAtmo = Math.max(0, atmoRect.bottom - curtainTop);
        heroAtmosphere.style.clipPath = cutAtmo > 0 ? `inset(0 0 ${cutAtmo.toFixed(1)}px 0)` : 'none';
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

/* ==========================================================================
   Player de Vídeo Customizado — "Histórias que Correm"
   ========================================================================== */
(function initCustomVideoPlayer() {
  const player = document.getElementById('custom-video-player');
  const video = document.getElementById('video-elaine');
  if (!player || !video) return;

  const bigPlayBtn = document.getElementById('player-big-play');
  const playBtn = document.getElementById('player-play-btn');
  const iconPlay = playBtn ? playBtn.querySelector('.icon-play') : null;
  const iconPause = playBtn ? playBtn.querySelector('.icon-pause') : null;

  const progressBar = document.getElementById('player-progress-bar');
  const progressFill = document.getElementById('player-progress-fill');
  const progressThumb = document.getElementById('player-progress-thumb');
  const progressBuffered = document.getElementById('player-progress-buffered');

  const currentTimeEl = document.getElementById('player-current-time');
  const totalTimeEl = document.getElementById('player-total-time');

  const muteBtn = document.getElementById('player-mute-btn');
  const iconVolHigh = muteBtn ? muteBtn.querySelector('.icon-vol-high') : null;
  const iconVolMuted = muteBtn ? muteBtn.querySelector('.icon-vol-muted') : null;

  const fsBtn = document.getElementById('player-fs-btn');

  // Formata segundos em mm:ss
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Atualiza botões de Play / Pause
  function updatePlayState(isPlaying) {
    if (isPlaying) {
      player.classList.add('is-playing');
      if (iconPlay) iconPlay.style.display = 'none';
      if (iconPause) iconPause.style.display = 'block';
      if (playBtn) playBtn.setAttribute('aria-label', 'Pausar vídeo');
    } else {
      player.classList.remove('is-playing');
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
      if (playBtn) playBtn.setAttribute('aria-label', 'Reproduzir vídeo');
    }
  }

  // Alterna Play / Pause
  function togglePlay() {
    if (video.paused || video.ended) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  video.addEventListener('play', () => updatePlayState(true));
  video.addEventListener('pause', () => updatePlayState(false));
  video.addEventListener('ended', () => {
    updatePlayState(false);
    video.currentTime = 0;
    if (progressFill) progressFill.style.width = '0%';
    if (progressThumb) progressThumb.style.left = '0%';
    if (currentTimeEl) currentTimeEl.textContent = '00:00';
  });

  // Clique no botão de Play Gigante
  if (bigPlayBtn) {
    bigPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }

  // Clique no botão Play/Pause da barra inferior
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }

  // Clique no próprio frame de vídeo para pausar/retomar (exceto se clicar nos controles)
  player.addEventListener('click', (e) => {
    if (e.target.closest('#player-controls')) return;
    togglePlay();
  });

  // Atualização contínua do progresso do vídeo
  video.addEventListener('timeupdate', () => {
    if (isDragging) return;
    const duration = video.duration || 0;
    const current = video.currentTime || 0;
    const pct = duration > 0 ? (current / duration) * 100 : 0;

    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressThumb) progressThumb.style.left = `${pct}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
    if (progressBar) progressBar.setAttribute('aria-valuenow', Math.round(pct));
  });

  // Buffer de carregamento
  video.addEventListener('progress', () => {
    if (video.buffered.length > 0 && video.duration > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const pct = (bufferedEnd / video.duration) * 100;
      if (progressBuffered) progressBuffered.style.width = `${Math.min(pct, 100)}%`;
    }
  });

  // Metadados carregados (duração total)
  function onMetadataReady() {
    if (video.duration && !isNaN(video.duration)) {
      if (totalTimeEl) totalTimeEl.textContent = formatTime(video.duration);
    }
  }

  if (video.readyState >= 1) {
    onMetadataReady();
  } else {
    video.addEventListener('loadedmetadata', onMetadataReady);
  }

  // Scrubber / Barra de Progresso Interativa (Seek com clique e arrasto)
  let isDragging = false;

  function seekTo(clientX) {
    if (!progressBar || !video.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
    const pct = pos * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressThumb) progressThumb.style.left = `${pct}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(video.currentTime);
  }

  if (progressBar) {
    progressBar.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDragging = true;
      progressBar.classList.add('is-dragging');
      seekTo(e.clientX);

      const onMouseMove = (ev) => {
        if (isDragging) seekTo(ev.clientX);
      };

      const onMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          progressBar.classList.remove('is-dragging');
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    // Suporte a toque no celular
    progressBar.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      if (!e.touches || !e.touches[0]) return;
      isDragging = true;
      progressBar.classList.add('is-dragging');
      seekTo(e.touches[0].clientX);

      const onTouchMove = (ev) => {
        if (isDragging && ev.touches && ev.touches[0]) {
          seekTo(ev.touches[0].clientX);
        }
      };

      const onTouchEnd = () => {
        isDragging = false;
        progressBar.classList.remove('is-dragging');
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };

      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }, { passive: true });

    // Acessibilidade via teclado na barra de progresso (Setas esquerda/direita)
    progressBar.addEventListener('keydown', (e) => {
      if (!video.duration) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
      }
    });
  }

  // Controle de Áudio (Mute / Unmute)
  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      if (video.muted) {
        if (iconVolHigh) iconVolHigh.style.display = 'none';
        if (iconVolMuted) iconVolMuted.style.display = 'block';
        muteBtn.setAttribute('aria-label', 'Ativar áudio');
      } else {
        if (iconVolHigh) iconVolHigh.style.display = 'block';
        if (iconVolMuted) iconVolMuted.style.display = 'none';
        muteBtn.setAttribute('aria-label', 'Silenciar áudio');
      }
    });
  }

  // Controle de Tela Cheia (Fullscreen)
  if (fsBtn) {
    fsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      if (!isFullscreen) {
        if (player.requestFullscreen) {
          player.requestFullscreen().catch(() => {});
        } else if (player.webkitRequestFullscreen) {
          player.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    });
  }

  // Ocultação inteligente de controles ao reproduzir com reaparecimento por movimento
  let controlsTimeout = null;
  function showControlsTemporarily() {
    player.classList.add('show-controls');
    clearTimeout(controlsTimeout);
    if (!video.paused && !video.ended) {
      controlsTimeout = setTimeout(() => {
        player.classList.remove('show-controls');
      }, 2500);
    }
  }

  player.addEventListener('mousemove', showControlsTemporarily);
  player.addEventListener('touchstart', showControlsTemporarily, { passive: true });
})();

/* ==========================================================================
   Esteira Interativa da Comunidade (Duas Fileiras com Formatos e Sentidos Opostos)
   ========================================================================== */
(function initCommunityStream() {
  const tracks = document.querySelectorAll('.community-track');
  if (!tracks.length) return;

  tracks.forEach((track) => {
    const cards = track.querySelectorAll('.stream-card');
    cards.forEach((card) => {
      card.addEventListener('focus', () => {
        track.style.animationPlayState = 'paused';
      });
      card.addEventListener('blur', () => {
        track.style.animationPlayState = 'running';
      });
    });
  });
})();

/* ==========================================================================
   Efeito Parallax da Comunidade (Palavra COMUNIDADE Passando Por Trás das Pessoas)
   ========================================================================== */
(function initCommunityParallax() {
  const stage = document.getElementById('community-parallax-stage');
  const bgLayer = document.getElementById('community-bg-layer');
  const frontLayer = document.getElementById('community-front-layer');
  const titleContainer = document.getElementById('community-title-container');

  if (!stage || !bgLayer || !titleContainer) return;

  // Respeita acessibilidade de movimento reduzido
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  function updateCommunityParallax() {
    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight;

    // Só calcula quando o banner estiver visível na janela (ou margem de 120px)
    if (rect.bottom >= -120 && rect.top <= vh + 120) {
      // Progresso de entrada e saída: 0 quando surge embaixo, 1 quando sai em cima
      const progress = (vh - rect.top) / (vh + rect.height);
      // Fator centralizado: -1 (embaixo) -> 0 (centro) -> +1 (topo)
      const centerFactor = (progress - 0.5) * 2;

      // Parallax do cenário e das pessoas: excursão vertical suave
      const bgY = centerFactor * 50;

      // Parallax da palavra COMUNIDADE que flutua por trás dos atletas
      const titleY = centerFactor * -40;

      const layerTransform = `translate3d(0, ${bgY.toFixed(2)}px, 0) scale(1.04)`;
      bgLayer.style.transform = layerTransform;
      if (frontLayer) {
        frontLayer.style.transform = layerTransform;
      }
      titleContainer.style.transform = `translate3d(0, ${titleY.toFixed(2)}px, 0)`;
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateCommunityParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Execução inicial
  updateCommunityParallax();
})();
