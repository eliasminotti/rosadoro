/* ==========================================================================
   Fondazione La Rosa d'Oro ETS — il poco che si muove
   --------------------------------------------------------------------------
   1. il menu sotto i 1024 px (apertura del pannello, sottomenu a fisarmonica)
   2. lo scrollspy della home (le sette fasce), con le tre regole del briefing:
      - ogni voce ha una propria sezione osservata (data-spia)
      - vince la sezione più vicina al centro della fascia visibile
      - quando nessuna sezione è inquadrata, nessuna voce è accesa
   Nulla registra chi visita. Esce dal sito soltanto il messaggio del modulo
   dei Contatti (5), quando chi scrive lo invia, con la pagina da cui arriva.
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
  var consenso = velo.querySelector('#dedica-consenso');
  var rigaConsenso = consenso ? consenso.parentNode : null;
  var invia = velo.querySelector('.invia');
  var bottoni = document.querySelectorAll('.pianta button[data-foto]');
  for (var i = 0; i < bottoni.length; i++) {
    bottoni[i].addEventListener('click', function (e) {
      scelta = e.currentTarget.getAttribute('data-foto');
      campoFoto.textContent = 'Immagine scelta: ' + scelta;
      campoNome.value = '';
      campoTesto.value = '';
      campoNome.classList.remove('manca');
      if (consenso) { consenso.checked = false; rigaConsenso.classList.remove('manca'); }
      velo.hidden = false;
      campoNome.focus();
    });
  }
  velo.querySelector('.chiudi-dialogo').addEventListener('click', function () { velo.hidden = true; });
  var freccia = document.querySelector('.scorri-freccia'), striscia = document.querySelector('.giardino');
  if (freccia && striscia) freccia.addEventListener('click', function () { striscia.scrollBy({ left: striscia.clientWidth * 0.8, behavior: 'smooth' }); });
  velo.addEventListener('click', function (e) { if (e.target === velo) velo.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') velo.hidden = true; });
  campoNome.addEventListener('input', function () { campoNome.classList.remove('manca'); });
  if (consenso) consenso.addEventListener('change', function () { rigaConsenso.classList.remove('manca'); });
  invia.addEventListener('click', function (e) {
    var nome = campoNome.value.trim();
    if (!nome) {                                   /* il nome è l'unica cosa che serve */
      e.preventDefault();
      campoNome.classList.add('manca');
      campoNome.focus();
      return;
    }
    if (consenso && !consenso.checked) {           /* e il consenso alla pubblicazione */
      e.preventDefault();
      rigaConsenso.classList.add('manca');
      consenso.focus();
      return;
    }
    var dedica = campoTesto.value.trim();
    var indirizzo = invia.getAttribute('data-mailto');
    invia.href = 'mailto:' + indirizzo +
      '?subject=' + encodeURIComponent('Giardino dei ricordi — ' + nome) +
      '&body=' + encodeURIComponent('In memoria di: ' + nome + '\nImmagine scelta: ' + scelta +
        (dedica ? '\n\nDedica: ' + dedica : '\n\n(senza dedica)') +
        '\n\nConsenso alla pubblicazione: sì, da familiare o persona che ha titolo a ricordare.');
  });
})();

/* ---- 5. il modulo dei Contatti: il messaggio va al foglio «Contatti della Fondazione» (lo script
        Google del foglio lo scrive e avvisa la segreteria) oppure, finché il foglio non è acceso,
        a Forminit. La risposta compare nella pagina; se qualcosa va storto, resta l'indirizzo di posta.
        Senza questo codice il modulo parte lo stesso, e il servizio mostra la sua conferma ---- */
(function () {
  'use strict';
  var modulo = document.getElementById('modulo-contatti');
  if (!modulo || !window.fetch || !window.FormData) return;
  var campi = modulo.querySelector('.campi');
  var esito = modulo.querySelector('.esito');
  var invia = modulo.querySelector('.invia');
  var indirizzo = modulo.getAttribute('data-indirizzo');
  var foglio = !!modulo.elements._sito;              /* il modulo del foglio ha i campi nascosti in più */

  if (foglio) {
    /* l'indirizzo del sito, per il collegamento di conferma delle notizie, e la pagina da cui
       arriva chi scrive: la dice il browser stesso (document.referrer), solo se è una pagina del sito */
    var sito = location.origin + location.pathname.replace(/contatti\/(index\.html)?$/, '');
    modulo.elements._sito.value = sito;
    if (document.referrer.indexOf(sito) === 0) {
      var da = document.referrer.slice(sito.length).split(/[?#]/)[0]
        .replace(/index\.html$/, '').replace(/\/$/, '');
      if (da !== 'contatti') modulo.elements.pagina.value = da || 'home';
    }
  }

  function dici(dove, testo, errore, posta) {
    dove.textContent = testo;
    dove.classList.toggle('errore', !!errore);
    if (posta) {                                   /* l'alternativa sicura: scrivere per posta */
      var a = document.createElement('a');
      a.className = 'link';
      a.href = 'mailto:' + indirizzo;
      a.textContent = indirizzo;
      dove.appendChild(document.createTextNode(' '));
      dove.appendChild(a);
      dove.appendChild(document.createTextNode('.'));
    }
    dove.hidden = false;
  }
  modulo.addEventListener('submit', function (e) {
    e.preventDefault();
    if (invia.disabled) return;
    invia.disabled = true;
    invia.textContent = 'Un momento…';
    esito.hidden = true;
    var dati = new FormData(modulo);
    if (foglio) dati.append('_js', '1');
    fetch(modulo.action, { method: 'POST', body: dati, headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (risposta) {
        if (risposta && (risposta.error === 'FI_SCHEMA_FORMAT_EMAIL' || risposta.error === 'email')) {
          dici(esito, 'Controlla la tua email: l’indirizzo non sembra completo.', true);
          return;
        }
        if (!risposta || !risposta.success) throw new Error('non arrivato');
        modulo.reset();
        campi.hidden = true;
        dici(esito, 'Grazie, il tuo messaggio è arrivato. Ti rispondiamo di persona, all’indirizzo che ci hai lasciato.' +
          (risposta.conferma ? ' Per le notizie ti abbiamo mandato un’email: aprila e tocca «Confermo».' : ''));
        esito.focus();
      })
      .catch(function () {
        dici(esito, 'Il messaggio non è partito. Riprova tra poco, oppure scrivici a', true, true);
      })
      .then(function () {
        invia.disabled = false;
        invia.textContent = 'Scrivici';
      });
  });

  /* chi apre il collegamento dell'email di conferma arriva qui con ?conferma=…: tocca «Confermo»
     e il foglio segna la data. Il pulsante serve perché i programmi che controllano i collegamenti
     nella posta non confermino al posto della persona */
  var conferma = document.getElementById('conferma-notizie');
  var codice = (location.search.match(/[?&]conferma=([A-Za-z0-9_.\-]+)/) || [])[1];
  if (!foglio || !conferma || !codice) return;
  var si = conferma.querySelector('.invia');
  var esitoConferma = conferma.querySelector('.esito');
  conferma.hidden = false;
  si.addEventListener('click', function () {
    if (si.disabled) return;
    si.disabled = true;
    si.textContent = 'Un momento…';
    esitoConferma.hidden = true;
    fetch(modulo.action + '?conferma=' + encodeURIComponent(codice))
      .then(function (r) { return r.json(); })
      .then(function (risposta) {
        if (!risposta || !risposta.testo) throw new Error('nessuna risposta');
        dici(esitoConferma, risposta.testo, !risposta.success);
        if (risposta.success) si.hidden = true;
        esitoConferma.focus();
      })
      .catch(function () {
        dici(esitoConferma, 'Non siamo riusciti a confermare. Riprova tra poco, oppure scrivici a', true, true);
      })
      .then(function () {
        si.disabled = false;
        si.textContent = 'Confermo';
      });
  });
})();
