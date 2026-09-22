(function () {
  'use strict';

  /* ---------- Imagens ausentes ---------- */
  // Logo: se o arquivo não existir, mostra o nome em texto.
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    function trocar() {
      var s = document.createElement('span');
      s.className = 'img-fallback';
      s.textContent = img.getAttribute('data-fallback');
      img.replaceWith(s);
    }
    img.addEventListener('error', trocar);
    if (img.complete && img.naturalWidth === 0) trocar();
  });
  // Fotos: tenta a imagem principal, depois as alternativas, depois o arquivo local
  // (pasta img/). Se nenhuma carregar, esconde a imagem e mantém o bloco de cor.
  document.querySelectorAll('img[data-foto]').forEach(function (img) {
    var fila = (img.getAttribute('data-alternativas') || '').split(/\s+/).filter(Boolean);
    var local = img.getAttribute('data-local');
    if (local) fila.push(local);
    function proxima() {
      var n = fila.shift();
      if (n) { img.src = n; } else { img.style.display = 'none'; }
    }
    img.addEventListener('error', proxima);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) proxima();
  });

  /* ---------- Header: sombra ao rolar ---------- */
  var topo = document.getElementById('topo');
  if (topo) {
    function aoRolar() { topo.classList.toggle('rolou', window.scrollY > 8); }
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  var botao = document.querySelector('.menu-botao');
  var menu = document.getElementById('menu');
  if (botao && menu) {
    function fechar() {
      menu.classList.remove('aberto');
      botao.setAttribute('aria-expanded', 'false');
    }
    botao.addEventListener('click', function () {
      var abrir = botao.getAttribute('aria-expanded') !== 'true';
      botao.setAttribute('aria-expanded', String(abrir));
      menu.classList.toggle('aberto', abrir);
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fechar); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('aberto') && !menu.contains(e.target) && !botao.contains(e.target)) fechar();
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) fechar(); });
  }

  /* ---------- Link ativo conforme a seção ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.menu ul a'));
  var alvos = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var esperando = false;
  function marcarAtivo() {
    esperando = false;
    var pos = window.scrollY + 160;
    var atual = 0;
    alvos.forEach(function (el, i) { if (el && el.offsetTop <= pos) atual = i; });
    var fim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (fim) atual = alvos.length - 1;
    links.forEach(function (l, i) { l.classList.toggle('ativo', i === atual); });
  }
  function agendar() { if (!esperando) { esperando = true; requestAnimationFrame(marcarAtivo); } }
  marcarAtivo();
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  window.addEventListener('load', marcarAtivo);

  /* ---------- Acordeão (FAQ) ---------- */
  document.querySelectorAll('.acordeao-item button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var abrir = btn.getAttribute('aria-expanded') !== 'true';
      // um item aberto por vez
      document.querySelectorAll('.acordeao-item button').forEach(function (outro) {
        outro.setAttribute('aria-expanded', 'false');
        document.getElementById(outro.getAttribute('aria-controls')).classList.remove('aberto');
      });
      btn.setAttribute('aria-expanded', String(abrir));
      document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('aberto', abrir);
    });
  });


  /* ---------- Animação dos cards ao rolar ---------- */
  var reduzMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduzMovimento && 'IntersectionObserver' in window) {
    var revelador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('vis');
        revelador.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

    // [seletor, intervalo entre cards (s), atraso inicial (s)]
    [
      ['.dados-visual .foto-a', 0, 0],
      ['.dados-visual .foto-b', 0, 0.15],
      ['.card-dado', 0, 0.3],
      ['.dados-texto .card-info', 0, 0.1],
      ['.porque-cards .servico', 0.12, 0],
      ['.passo', 0.14, 0],
      ['.bento-card', 0.14, 0],
      ['.acordeao-item', 0.1, 0]
    ].forEach(function (g) {
      document.querySelectorAll(g[0]).forEach(function (el, i) {
        el.classList.add('rev');
        el.style.setProperty('--d', (g[2] + i * g[1]).toFixed(2) + 's');
        revelador.observe(el);
      });
    });

    // linha condutora entre os passos do processo
    var passos = document.querySelector('.passos');
    if (passos) {
      var linhaObs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (!en.isIntersecting) return;
          passos.classList.add('vis-linha');
          linhaObs.unobserve(en.target);
        });
      }, { threshold: 0.4 });
      linhaObs.observe(passos);
    }
  } else if (document.querySelector('.passos')) {
    document.querySelector('.passos').classList.add('vis-linha');
  }


  /* ---------- Brilho que segue o mouse nos cards ---------- */
  document.querySelectorAll('.bento-card, .passo, .acordeao-item, .servico').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
