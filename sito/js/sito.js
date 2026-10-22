/* ==========================================================================
   Fondazione La Rosa d'Oro ETS — il poco che si muove
   --------------------------------------------------------------------------
   1. il menu sotto i 1024 px (apertura del pannello, sottomenu a fisarmonica)
   2. lo scrollspy della home (le sette fasce), con le tre regole del briefing:
      - ogni voce ha una propria sezione osservata (data-spia)
      - vince la sezione più vicina al centro della fascia visibile
      - quando nessuna sezione è inquadrata, nessuna voce è accesa
   Nulla registra chi visita. Escono dal sito soltanto la dedica del giardino (4),
   il messaggio del modulo dei Contatti (5), il progetto proposto (6) e l'email
   del riquadro delle notizie in fondo alle pagine (7), quando chi scrive li manda;
   e, con la chiave di Turnstile, il controllo di Cloudflare contro i programmi
   automatici, solo quando qualcuno comincia a scrivere in un modulo.
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

/* l'indirizzo del sito, letto da quello di questo file (…/js/sito.js): lo script del foglio lo usa per
   il collegamento dell'email di conferma delle notizie, e lo accetta solo se è uno dei due indirizzi del sito */
var RADICE = (function () {
  var s = document.currentScript;
  return s && s.src ? s.src.replace(/js\/sito\.js(\?.*)?$/, '') : '';
})();

/* l'esito di un modulo, sotto il pulsante: con un indirizzo, la frase finisce con l'email da scrivere a mano,
   l'alternativa sicura quando l'invio non riesce */
function scriviEsito(dove, testo, errore, indirizzo) {
  dove.textContent = testo;
  dove.classList.toggle('errore', !!errore);
  if (indirizzo) {
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

/* la protezione dei moduli dai programmi automatici (Elias, 22.10). Ogni modulo manda allo script del foglio da quanti
   secondi è aperta la pagina (_tempo: chi manda un modulo in meno di tre secondi non è una persona) e, se il modulo ha
   la chiave di Cloudflare Turnstile (data-turnstile, da TURNSTILE in costruisci.py), la risposta di Turnstile
   (_turnstile), che lo script verifica con Cloudflare. Turnstile si carica solo quando qualcuno comincia a scrivere in
   un modulo: prima, nessuna pagina del sito si collega a Cloudflare. Se non si carica, o non risponde entro ATTESA,
   il modulo non parte: compare il riquadro per mandarci il messaggio dalla propria posta (dallaPosta, più sotto), e lo
   stesso riquadro compare se lo script risponde che manca la risposta di Turnstile. Un messaggio vero non va perso */
var APERTA = Date.now();
var ATTESA = 8000;
var turnstilePronto = null;                       /* il caricamento di Turnstile, uno per pagina */

function caricaTurnstile() {
  if (!turnstilePronto) turnstilePronto = new Promise(function (fatto) {
    window.turnstileCaricato = function () { fatto(window.turnstile || null); };
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=turnstileCaricato';
    s.async = true;
    s.onerror = function () { fatto(null); };
    document.head.appendChild(s);
  });
  return turnstilePronto;
}

function protezione(modulo) {
  var chiave = modulo.getAttribute('data-turnstile');
  var risposta = '', fallito = false, avviato = false, widget = null, attese = [];
  function arriva(r) {
    risposta = r || '';
    if (!r) fallito = true;
    attese.splice(0).forEach(function (f) { f(risposta); });
  }
  function avvia() {
    if (avviato || !chiave) return;
    avviato = true;
    caricaTurnstile().then(function (turnstile) {
      if (!turnstile) return arriva('');
      var posto = document.createElement('div');
      posto.className = 'controllo';
      modulo.querySelector('.campi').appendChild(posto);
      try {
        widget = turnstile.render(posto, {
          sitekey: chiave, language: 'it', appearance: 'interaction-only', 'response-field': false,
          size: posto.clientWidth < 300 ? 'compact' : 'normal',
          callback: function (r) { fallito = false; arriva(r); },
          'error-callback': function () { arriva(''); },
          'expired-callback': function () { risposta = ''; }      /* Turnstile ne prepara un'altra da sé */
        });
      } catch (e) { arriva(''); }
    });
  }
  if (chiave) modulo.addEventListener('focusin', avvia);
  return {
    /* i dati del modulo con i campi della protezione, quando la risposta di Turnstile c'è o l'attesa è finita;
       null se il modulo ha la chiave di Turnstile ma la risposta non è arrivata */
    campi: function (dati) {
      dati.append('_js', '1');
      dati.append('_tempo', String(Math.round((Date.now() - APERTA) / 1000)));
      if (!chiave) return Promise.resolve(dati);
      avvia();
      return new Promise(function (fatto) {
        if (risposta || fallito) return fatto(risposta);
        attese.push(fatto);
        setTimeout(function () { fatto(risposta); }, ATTESA);
      }).then(function (r) { if (!r) return null; dati.append('_turnstile', r); return dati; });
    },
    /* dopo ogni invio: una risposta di Turnstile vale una volta sola, e Turnstile ne prepara un'altra */
    dopo: function () {
      if (widget === null || !risposta) return;
      risposta = '';
      try { window.turnstile.reset(widget); } catch (e) { /* alla prossima volta, senza */ }
    }
  };
}

/* manda un modulo allo script del foglio e dà la sua risposta; quando ha finito, la protezione si prepara al prossimo.
   Senza la risposta di Turnstile il modulo non parte, e la risposta è quella dello script in quel caso: «controllo» */
function mandaAlFoglio(modulo, protetto, indirizzo) {
  var riquadro = modulo.querySelector('.dalla-posta');
  if (riquadro) riquadro.hidden = true;
  return protetto.campi(new FormData(modulo))
    .then(function (dati) {
      if (!dati) return { success: false, error: 'controllo' };
      return fetch(indirizzo, { method: 'POST', body: dati, headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); });
    })
    .then(function (risposta) { protetto.dopo(); return risposta; },
          function (errore) { protetto.dopo(); throw errore; });
}

/* quando manca il controllo contro i programmi automatici, il riquadro per mandarci lo stesso il messaggio dalla propria
   posta (Elias, 22.10): con Gmail, con il programma di posta del computer (il mailto spesso apre un programma che la
   persona non usa) o copiandolo con l'indirizzo, da incollare dove si vuole. Nessuna email parte da sola.
   contenuto() dà { oggetto, testo } da quello che c'è nel modulo in quel momento. Un collegamento troppo lungo rischia
   di non aprirsi: oltre LUNGHEZZA i due collegamenti accorciano il testo, e la copia resta intera */
var LUNGHEZZA = 1800;

function collegamentoDiPosta(base, indirizzo, oggetto, testo) {
  function fatto(t) {
    return base === 'gmail'
      ? 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(indirizzo) + '&su=' + encodeURIComponent(oggetto) + '&body=' + encodeURIComponent(t)
      : 'mailto:' + indirizzo + '?subject=' + encodeURIComponent(oggetto) + '&body=' + encodeURIComponent(t);
  }
  var nota = '\n\n[…] Il messaggio è più lungo: per averlo intero torna alla pagina del sito, tocca «Copia il messaggio» e incollalo qui.';
  var collegamento = fatto(testo), n = testo.length;
  while (collegamento.length > LUNGHEZZA && n > 0) {
    n = Math.floor(n * 0.9);
    collegamento = fatto(testo.slice(0, n).replace(/\s+\S*$/, '') + nota);
  }
  return collegamento;
}

function copia(testo) {
  function aMano() {
    var t = document.createElement('textarea');
    t.value = testo;
    t.setAttribute('readonly', '');
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    var fatto = false;
    try { fatto = document.execCommand('copy'); } catch (e) { /* resta false */ }
    document.body.removeChild(t);
    if (!fatto) throw new Error('copia non riuscita');
  }
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(testo).catch(aMano);
  return new Promise(function (fatto) { aMano(); fatto(); });
}

function dallaPosta(modulo, indirizzo, contenuto) {
  var riquadro = modulo.querySelector('.dalla-posta');
  if (!riquadro) {
    riquadro = document.createElement('div');
    riquadro.className = 'dalla-posta';
    riquadro.tabIndex = -1;
    riquadro.innerHTML = '<p>Il controllo anti-spam non si è caricato nel tuo browser. Puoi mandarci lo stesso il messaggio dalla tua email.</p>' +
      '<p class="pulsanti"><a class="scelta" data-posta="gmail" target="_blank" rel="noopener">Scrivi con Gmail</a>' +
      '<a class="scelta" data-posta="programma">Apri il tuo programma di posta</a>' +
      '<button type="button" class="scelta">Copia il messaggio</button></p>';
    var esito = modulo.querySelector('.esito');
    esito.parentNode.insertBefore(riquadro, esito.nextSibling);
    var aggiorna = function () {
      var c = contenuto();
      var collegamenti = riquadro.querySelectorAll('a[data-posta]');
      for (var i = 0; i < collegamenti.length; i++) {
        collegamenti[i].href = collegamentoDiPosta(collegamenti[i].getAttribute('data-posta'), indirizzo, c.oggetto, c.testo);
      }
    };
    riquadro.aggiorna = aggiorna;
    riquadro.addEventListener('click', function (e) {
      if (e.target.closest('a[data-posta]')) aggiorna();             /* con il testo di adesso, se nel frattempo è cambiato */
    });
    var pulsante = riquadro.querySelector('button');
    pulsante.addEventListener('click', function () {
      var c = contenuto();
      copia('A: ' + indirizzo + '\nOggetto: ' + c.oggetto + '\n\n' + c.testo)
        .then(function () { pulsante.textContent = 'Copiato'; }, function () { /* resta il pulsante */ });
    });
  }
  riquadro.querySelector('button').textContent = 'Copia il messaggio';
  riquadro.aggiorna();
  modulo.querySelector('.esito').hidden = true;
  riquadro.hidden = false;
  riquadro.focus({ preventScroll: true });
}

/* chi apre un collegamento delle nostre email arriva su una pagina con ?conferma=…, ?cancella=… o ?togli=…:
   compare il riquadro, e la richiesta allo script del foglio parte solo quando la persona tocca il pulsante,
   perché i programmi che controllano i collegamenti nella posta non lo facciano al posto suo */
function daCollegamento(riquadro, parametro, foglio, indirizzo, seNonRiesce) {
  var codice = (location.search.match(new RegExp('[?&]' + parametro + '=([A-Za-z0-9_.\\-]+)')) || [])[1];
  if (!riquadro || !codice || !foglio || !window.fetch) return;
  var pulsante = riquadro.querySelector('.invia');
  var esito = riquadro.querySelector('.esito');
  var etichetta = pulsante.textContent;
  riquadro.hidden = false;
  riquadro.scrollIntoView({ block: 'center' });     /* sul telefono il riquadro starebbe sotto il menu della sezione */
  pulsante.addEventListener('click', function () {
    if (pulsante.disabled) return;
    pulsante.disabled = true;
    pulsante.textContent = 'Un momento…';
    esito.hidden = true;
    fetch(foglio + '?' + parametro + '=' + encodeURIComponent(codice))
      .then(function (r) { return r.json(); })
      .then(function (risposta) {
        if (!risposta || !risposta.testo) throw new Error('nessuna risposta');
        scriviEsito(esito, risposta.testo, !risposta.success);
        if (risposta.success) pulsante.hidden = true;
        esito.focus();
      })
      .catch(function () {
        scriviEsito(esito, seNonRiesce, true, indirizzo);
      })
      .then(function () {
        pulsante.disabled = false;
        pulsante.textContent = etichetta;
      });
  });
}

/* ---- 4. il giardino dei ricordi: si sceglie l'immagine e si scrive il nome; la dedica è
        facoltativa. Il modulo la manda allo script del foglio della Fondazione, come i Contatti;
        se il foglio non è acceso, o il browser è troppo vecchio, si apre la posta.
        I nomi che la Fondazione ha posato nel giardino arrivano da dediche.json, accanto alla
        pagina: lo scrive la pubblicazione del sito (sorgenti/giardino.py). Chi ha scritto una dedica
        la toglie dal collegamento dell'email che riceve (?togli=…) ---- */
(function () {
  'use strict';
  var velo = document.getElementById('velo-dedica');
  var modulo = document.getElementById('modulo-dedica');
  if (!velo || !modulo) return;
  document.body.appendChild(velo);                 /* fuori dal testo della pagina, così il velo copre anche la barra in basso */
  var scelta = '';
  var campi = modulo.querySelector('.campi');
  var esito = modulo.querySelector('.esito');
  var dopo = modulo.querySelector('.righe.dopo');
  var campoFoto = modulo.querySelector('.dedica-foto');
  var campoNome = modulo.elements.ricordo;
  var campoTesto = modulo.elements.dedica;
  var campoMittente = modulo.elements.nome;
  var campoPosta = modulo.elements.email;
  var consenso = modulo.elements.consenso;
  var rigaConsenso = consenso.parentNode;
  var invia = modulo.querySelector('.invia');
  var indirizzo = modulo.getAttribute('data-indirizzo');
  var foglio = modulo.getAttribute('action');
  var conFoglio = !!(foglio && window.fetch && window.FormData && window.Promise);
  var protetto = conFoglio ? protezione(modulo) : null;
  if (modulo.elements._sito) modulo.elements._sito.value = RADICE;   /* per il collegamento che toglie la dedica */
  if (conFoglio) daCollegamento(document.getElementById('togli-dedica'), 'togli', foglio, indirizzo,
    'Non siamo riusciti a toglierla. Riprova tra poco, oppure scrivici a');

  var bottoni = document.querySelectorAll('.pianta button[data-foto]');
  for (var i = 0; i < bottoni.length; i++) {
    bottoni[i].addEventListener('click', function (e) {
      scelta = e.currentTarget.getAttribute('data-foto');
      campoFoto.textContent = 'Immagine scelta: ' + scelta;
      modulo.elements.immagine.value = scelta;
      campoNome.value = '';                        /* il tuo nome e la tua email restano, per una seconda dedica */
      campoTesto.value = '';
      consenso.checked = false;
      [campoNome, campoMittente, campoPosta].forEach(function (c) { c.classList.remove('manca'); });
      rigaConsenso.classList.remove('manca');
      campi.hidden = false;
      esito.hidden = true;
      dopo.hidden = true;
      velo.hidden = false;
      campoNome.focus();
    });
  }
  var chiudi = velo.querySelectorAll('.chiudi-dialogo');
  for (var j = 0; j < chiudi.length; j++) chiudi[j].addEventListener('click', function () { velo.hidden = true; });
  var freccia = document.querySelector('.scorri-freccia'), striscia = document.querySelector('.giardino');
  if (freccia && striscia) freccia.addEventListener('click', function () { striscia.scrollBy({ left: striscia.clientWidth * 0.8, behavior: 'smooth' }); });
  velo.addEventListener('click', function (e) { if (e.target === velo) velo.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') velo.hidden = true; });
  [campoNome, campoMittente, campoPosta].forEach(function (c) {
    c.addEventListener('input', function () { c.classList.remove('manca'); });
  });
  consenso.addEventListener('change', function () { rigaConsenso.classList.remove('manca'); });

  /* la dedica scritta come email: senza il foglio parte dal programma di posta di chi scrive, e serve al riquadro
     per mandarla dalla propria posta quando manca il controllo contro i programmi automatici */
  function comeEmail() {
    var nome = campoNome.value.trim(), dedica = campoTesto.value.trim();
    return { oggetto: 'Giardino dei ricordi — ' + nome,
             testo: 'In memoria di: ' + nome + '\nImmagine scelta: ' + scelta +
               (dedica ? '\n\nDedica: ' + dedica : '\n\n(senza dedica)') +
               '\n\nChi scrive: ' + campoMittente.value.trim() + ', ' + campoPosta.value.trim() +
               '\n\nConsenso alla pubblicazione: sì, da familiare o persona che ha titolo a ricordare.' };
  }
  function perPosta() {
    var c = comeEmail();
    location.href = 'mailto:' + indirizzo + '?subject=' + encodeURIComponent(c.oggetto) + '&body=' + encodeURIComponent(c.testo);
  }

  modulo.addEventListener('submit', function (e) {
    e.preventDefault();
    if (invia.disabled) return;
    var primo = null;
    function controlla(campo, giusto) {
      campo.classList.toggle('manca', !giusto);
      if (!giusto && !primo) primo = campo;
    }
    var nome = campoNome.value.trim(), dedica = campoTesto.value.trim();
    controlla(campoNome, !!nome);                   /* il nome è la cosa che serve */
    controlla(campoMittente, !!campoMittente.value.trim());
    controlla(campoPosta, /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(campoPosta.value.trim()));
    rigaConsenso.classList.toggle('manca', !consenso.checked);    /* e il consenso alla pubblicazione */
    if (!consenso.checked && !primo) primo = consenso;
    if (primo) { primo.focus(); return; }
    if (!conFoglio) { perPosta(); return; }

    invia.disabled = true;
    invia.textContent = 'Un momento…';
    esito.hidden = true;
    mandaAlFoglio(modulo, protetto, foglio)
      .then(function (risposta) {
        if (risposta && risposta.error === 'controllo') { dallaPosta(modulo, indirizzo, comeEmail); return; }
        if (risposta && risposta.error === 'email') {
          scriviEsito(esito, 'Controlla la tua email: l’indirizzo non sembra completo.', true);
          return;
        }
        if (!risposta || !risposta.success) throw new Error('non arrivata');
        campi.hidden = true;
        dopo.hidden = false;
        scriviEsito(esito, 'Grazie. La dedica per ' + nome + ' è arrivata: la leggiamo e la posiamo nel giardino, accanto all’immagine che hai scelto.' +
          (risposta.ricevuta ? ' Ti abbiamo mandato un’email con il collegamento per toglierla, se un giorno vorrai.' : ''));
        esito.focus({ preventScroll: true });
      })
      .catch(function () {
        scriviEsito(esito, 'La dedica non è partita. Riprova tra poco, oppure scrivici a', true, indirizzo);
      })
      .then(function () {
        invia.disabled = false;
        invia.textContent = 'Manda la dedica';
      });
  });

  /* i nomi posati nel giardino, ciascuno con l'immagine scelta: le più recenti prima */
  var sezione = document.getElementById('nel-giardino');
  if (!sezione || !window.fetch) return;
  var immagini = {};
  var piante = document.querySelectorAll('.pianta');
  for (var k = 0; k < piante.length; k++) {
    var b = piante[k].querySelector('button[data-foto]'), img = piante[k].querySelector('img');
    if (b && img) immagini[b.getAttribute('data-foto')] = img.getAttribute('src');
  }
  fetch('dediche.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (dati) {
      var dediche = (dati && dati.dediche) || [];
      var lista = sezione.querySelector('.dediche');
      dediche.forEach(function (d) {
        if (!d || !d.nome) return;
        var figura = document.createElement('figure');
        figura.className = 'dedica';
        if (immagini[d.immagine]) {
          var cornice = document.createElement('div');
          cornice.className = 'foto quadra';
          var foto = document.createElement('img');
          foto.src = immagini[d.immagine];
          foto.alt = d.immagine;
          foto.loading = 'lazy';
          cornice.appendChild(foto);
          figura.appendChild(cornice);
        }
        var dida = document.createElement('figcaption');
        var nome = document.createElement('strong');
        nome.textContent = d.nome;
        dida.appendChild(nome);
        if (d.dedica) {
          var parole = document.createElement('span');
          parole.textContent = '«' + d.dedica + '»';
          dida.appendChild(parole);
        }
        figura.appendChild(dida);
        lista.appendChild(figura);
      });
      if (lista.children.length) sezione.hidden = false;
    })
    .catch(function () { /* senza le dediche il giardino resta com'è */ });
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
  var protetto = foglio && window.Promise ? protezione(modulo) : null;

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
    scriviEsito(dove, testo, errore, posta ? indirizzo : '');
  }
  function comeEmail() {
    var el = modulo.elements;
    return { oggetto: el.oggetto.value.trim() || 'Messaggio dal sito',
             testo: el.messaggio.value.trim() + '\n\n' + el.nome.value.trim() +
               (el.notizie && el.notizie.checked ? '\n\nVorrei ricevere anche le notizie della Fondazione per email.' : '') };
  }
  modulo.addEventListener('submit', function (e) {
    e.preventDefault();
    if (invia.disabled) return;
    invia.disabled = true;
    invia.textContent = 'Un momento…';
    esito.hidden = true;
    (protetto ? mandaAlFoglio(modulo, protetto, modulo.action)
      : fetch(modulo.action, { method: 'POST', body: new FormData(modulo), headers: { 'Accept': 'application/json' } })
          .then(function (r) { return r.json(); }))
      .then(function (risposta) {
        if (risposta && risposta.error === 'controllo') { dallaPosta(modulo, indirizzo, comeEmail); return; }
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

  /* dai collegamenti delle email delle notizie: «Confermo» segna la data della conferma nel foglio,
     «Cancellami» ritira il consenso */
  if (!foglio) return;
  daCollegamento(document.getElementById('conferma-notizie'), 'conferma', modulo.action, indirizzo,
    'Non siamo riusciti a confermare. Riprova tra poco, oppure scrivici a');
  daCollegamento(document.getElementById('cancella-notizie'), 'cancella', modulo.action, indirizzo,
    'Non siamo riusciti a cancellarti. Riprova tra poco, oppure scrivici a');
})();

/* ---- 6. il modulo «Presentaci il tuo progetto»: il progetto va allo stesso script del foglio,
        nella scheda «Progetti», e la risposta compare nella pagina. Se qualcosa va storto,
        resta l'indirizzo di posta. Senza questo codice il modulo parte lo stesso ---- */
(function () {
  'use strict';
  var modulo = document.getElementById('modulo-progetto');
  if (!modulo || !window.fetch || !window.FormData || !window.Promise) return;
  var protetto = protezione(modulo);
  var campi = modulo.querySelector('.campi');
  var esito = modulo.querySelector('.esito');
  var invia = modulo.querySelector('.invia');
  var indirizzo = modulo.getAttribute('data-indirizzo');
  if (modulo.elements._sito) modulo.elements._sito.value = RADICE;
  function comeEmail() {
    var el = modulo.elements, v = function (n) { return el[n] ? String(el[n].value || '').trim() : ''; };
    var fase = modulo.querySelector('input[name="fase"]:checked');
    return { oggetto: 'Progetto: ' + v('progetto'),
             testo: ['Il progetto: ' + v('progetto'), fase ? 'A che punto è: ' + fase.value : null, '', 'Che cosa fa:', v('descrizione'),
                     v('bisogno') ? '\nDi che cosa ha bisogno:\n' + v('bisogno') : null, v('documento') ? '\nDocumento: ' + v('documento') : null,
                     '', v('nome') + (v('ente') ? ', ' + v('ente') : ''),
                     el.notizie && el.notizie.checked ? '\nVorrei ricevere anche le notizie della Fondazione per email.' : null]
               .filter(function (r) { return r !== null; }).join('\n') };
  }

  modulo.addEventListener('submit', function (e) {
    e.preventDefault();
    if (invia.disabled) return;
    invia.disabled = true;
    invia.textContent = 'Un momento…';
    esito.hidden = true;
    mandaAlFoglio(modulo, protetto, modulo.action)
      .then(function (risposta) {
        if (risposta && risposta.error === 'controllo') { dallaPosta(modulo, indirizzo, comeEmail); return; }
        if (risposta && risposta.error === 'email') {
          scriviEsito(esito, 'Controlla la tua email: l’indirizzo non sembra completo.', true);
          return;
        }
        if (!risposta || !risposta.success) throw new Error('non arrivato');
        modulo.reset();
        campi.hidden = true;
        scriviEsito(esito, 'Grazie, il tuo progetto è arrivato. Lo leggiamo con attenzione e ti rispondiamo di persona, all’indirizzo che ci hai lasciato.' +
          (risposta.conferma ? ' Per le notizie ti abbiamo mandato un’email: aprila e tocca «Confermo».' : ''));
        esito.focus({ preventScroll: true });
      })
      .catch(function () {
        scriviEsito(esito, 'Il progetto non è partito. Riprova tra poco, oppure scrivici a', true, indirizzo);
      })
      .then(function () {
        invia.disabled = false;
        invia.textContent = 'Manda il progetto';
      });
  });
})();

/* ---- 7. il riquadro «Le notizie della Fondazione» in fondo alle pagine: l'email va allo script del
        foglio, che scrive la richiesta nella scheda dei Contatti e manda l'email di conferma. Senza
        questo codice il modulo parte lo stesso ---- */
(function () {
  'use strict';
  var modulo = document.getElementById('modulo-notizie');
  if (!modulo || !window.fetch || !window.FormData || !window.Promise) return;
  var protetto = protezione(modulo);
  var campi = modulo.querySelector('.campi');
  var esito = modulo.querySelector('.esito');
  var invia = modulo.querySelector('.invia');
  var indirizzo = modulo.getAttribute('data-indirizzo');
  modulo.elements._sito.value = RADICE;
  function comeEmail() {
    return { oggetto: 'Notizie della Fondazione',
             testo: 'Vorrei ricevere le notizie della Fondazione per email, a questo indirizzo: ' + modulo.elements.email.value.trim() + '.' };
  }
  /* la pagina da cui ci si iscrive, per sapere quali punti del sito funzionano */
  if (RADICE && location.href.indexOf(RADICE) === 0) {
    var qui = location.href.slice(RADICE.length).split(/[?#]/)[0].replace(/index\.html$/, '').replace(/\/$/, '');
    modulo.elements.pagina.value = qui || 'home';
  }

  modulo.addEventListener('submit', function (e) {
    e.preventDefault();
    if (invia.disabled) return;
    invia.disabled = true;
    invia.textContent = 'Un momento…';
    esito.hidden = true;
    mandaAlFoglio(modulo, protetto, modulo.action)
      .then(function (risposta) {
        if (risposta && risposta.error === 'controllo') { dallaPosta(modulo, indirizzo, comeEmail); return; }
        if (risposta && risposta.error === 'email') {
          scriviEsito(esito, 'Controlla la tua email: l’indirizzo non sembra completo.', true);
          return;
        }
        if (!risposta || !risposta.success) throw new Error('non arrivato');
        modulo.reset();
        campi.hidden = true;
        scriviEsito(esito, 'Grazie. Ti abbiamo mandato un’email: aprila e tocca «Confermo». Le notizie arrivano solo dopo la conferma.');
        esito.focus({ preventScroll: true });
      })
      .catch(function () {
        scriviEsito(esito, 'L’iscrizione non è partita. Riprova tra poco, oppure scrivici a', true, indirizzo);
      })
      .then(function () {
        invia.disabled = false;
        invia.textContent = 'Iscrivimi';
      });
  });
})();
