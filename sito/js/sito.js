/* ==========================================================================
   Fondazione La Rosa d'Oro ETS — il poco che si muove
   --------------------------------------------------------------------------
   1. il menu sotto i 1024 px (apertura del pannello, sottomenu a fisarmonica)
   2. lo scrollspy della home (le sette fasce), con le tre regole del briefing:
      - ogni voce ha una propria sezione osservata (data-spia)
      - vince la sezione più vicina al centro della fascia visibile
      - quando nessuna sezione è inquadrata, nessuna voce è accesa
   Nessun dato esce dal sito: qui non c'è nulla che registri o invii.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- 1. menu ---- */
  var menu = document.getElementById('menu-principale');
  var bottone = document.querySelector('.apri-menu');
  if (menu && bottone) {
    bottone.addEventListener('click', function () {
      var aperto = menu.classList.toggle('aperto');
      bottone.setAttribute('aria-expanded', aperto ? 'true' : 'false');
      bottone.textContent = aperto ? 'Chiudi' : 'Menu';
      document.body.classList.toggle('menu-aperto', aperto);
    });
  }
  var frecce = document.querySelectorAll('.voce .freccia');
  for (var i = 0; i < frecce.length; i++) {
    frecce[i].addEventListener('click', function (e) {
      var voce = e.currentTarget.closest('.voce');
      var aperta = voce.classList.toggle('aperta');
      e.currentTarget.setAttribute('aria-expanded', aperta ? 'true' : 'false');
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var aperte = document.querySelectorAll('.voce.aperta');
    for (var j = 0; j < aperte.length; j++) aperte[j].classList.remove('aperta');
    if (menu && menu.classList.contains('aperto')) bottone.click();
  });

  /* ---- 2. scrollspy ---- */
  var sezioni = Array.prototype.slice.call(document.querySelectorAll('[data-spia]'));
  if (!sezioni.length) return;

  var voci = {};
  var elementiVoce = document.querySelectorAll('.voce[data-voce]');
  for (var k = 0; k < elementiVoce.length; k++) voci[elementiVoce[k].getAttribute('data-voce')] = elementiVoce[k];

  var testa = document.querySelector('.testa-bassa');
  var barra = document.querySelector('.barra-fissa');
  var richiesto = false;

  function aggiorna() {
    richiesto = false;
    var alto = testa ? testa.getBoundingClientRect().bottom : 0;
    var basso = barra ? barra.getBoundingClientRect().top : window.innerHeight;
    var centro = (alto + basso) / 2;
    var vincente = null;
    var distanza = Infinity;
    for (var s = 0; s < sezioni.length; s++) {
      var r = sezioni[s].getBoundingClientRect();
      if (r.bottom <= alto || r.top >= basso) continue;          /* non è nella fascia */
      var d = Math.abs((r.top + r.bottom) / 2 - centro);          /* distanza dal centro */
      if (d < distanza) { distanza = d; vincente = sezioni[s].getAttribute('data-spia'); }
    }
    for (var chiave in voci) voci[chiave].classList.toggle('spia', chiave === vincente);
  }
  function chiedi() {
    if (richiesto) return;
    richiesto = true;
    window.requestAnimationFrame(aggiorna);
  }
  window.addEventListener('scroll', chiedi, { passive: true });
  window.addEventListener('resize', chiedi);
  aggiorna();
})();

/* ---- 3. musica su scelta (il pulsante appare solo se il file esiste) ---- */
(function () {
  'use strict';
  var bottoni = document.querySelectorAll('.ascolta[data-audio]');
  for (var i = 0; i < bottoni.length; i++) {
    (function (b) {
      var suono = new Audio();
      suono.preload = 'metadata';
      suono.src = b.getAttribute('data-audio');
      suono.addEventListener('canplay', function () { b.hidden = false; });
      b.addEventListener('click', function () {
        if (suono.paused) { suono.play(); b.classList.add('suona'); b.textContent = 'Ferma la musica'; }
        else { suono.pause(); suono.currentTime = 0; b.classList.remove('suona'); b.textContent = 'Ascolta · Chopin, valzer op. 69'; }
      });
      suono.addEventListener('ended', function () { b.classList.remove('suona'); b.textContent = 'Ascolta · Chopin, valzer op. 69'; });
    })(bottoni[i]);
  }
})();

/* ---- 4. il giardino dei ricordi: si sceglie l'immagine e si scrive il nome; la dedica è
        facoltativa. Il messaggio parte come email, il sito non conserva nulla ---- */
(function () {
  'use strict';
  var velo = document.getElementById('velo-dedica');
  if (!velo) return;
  var scelta = '';
  var campoFoto = velo.querySelector('.dedica-foto');
  var campoNome = velo.querySelector('#dedica-nome');
  var campoTesto = velo.querySelector('#dedica-testo');
  var invia = velo.querySelector('.invia');
  var bottoni = document.querySelectorAll('.pianta button[data-foto]');
  for (var i = 0; i < bottoni.length; i++) {
    bottoni[i].addEventListener('click', function (e) {
      scelta = e.currentTarget.getAttribute('data-foto');
      campoFoto.textContent = 'Immagine scelta: ' + scelta;
      campoNome.value = '';
      campoTesto.value = '';
      campoNome.classList.remove('manca');
      velo.hidden = false;
      campoNome.focus();
    });
  }
  velo.querySelector('.chiudi-dialogo').addEventListener('click', function () { velo.hidden = true; });
  velo.addEventListener('click', function (e) { if (e.target === velo) velo.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') velo.hidden = true; });
  campoNome.addEventListener('input', function () { campoNome.classList.remove('manca'); });
  invia.addEventListener('click', function (e) {
    var nome = campoNome.value.trim();
    if (!nome) {                                   /* il nome è l'unica cosa che serve */
      e.preventDefault();
      campoNome.classList.add('manca');
      campoNome.focus();
      return;
    }
    var dedica = campoTesto.value.trim();
    var indirizzo = invia.getAttribute('data-mailto');
    invia.href = 'mailto:' + indirizzo +
      '?subject=' + encodeURIComponent('Giardino dei ricordi — ' + nome) +
      '&body=' + encodeURIComponent('In memoria di: ' + nome + '\nImmagine scelta: ' + scelta +
        (dedica ? '\n\nDedica: ' + dedica : '\n\n(senza dedica)'));
  });
})();
