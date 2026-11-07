/* ==========================================================================
   Fondazione La Rosa d'Oro ETS — il poco che si muove
   --------------------------------------------------------------------------
   1. il menu sotto i 1024 px (apertura del pannello, sottomenu a fisarmonica)
   2. lo scrollspy della home (le sette fasce), con le tre regole del briefing:
      - ogni voce ha una propria sezione osservata (data-spia)
      - vince la sezione più vicina al centro della fascia visibile
      - quando nessuna sezione è inquadrata, nessuna voce è accesa
   Senza il permesso di chi visita, nulla lo registra. Escono dal sito soltanto la
   dedica del giardino (4), il messaggio del modulo dei Contatti (5), il progetto
   proposto (6) e l'email del riquadro delle notizie o dell'invito dopo la dedica (7),
   quando chi scrive li manda; con la chiave di Turnstile, il controllo di Cloudflare contro
   i programmi automatici, solo quando qualcuno comincia a scrivere in un modulo; e,
   con la proprietà di Google Analytics (GOOGLE_TAG in costruisci.py), la misura di
   Google, solo dopo «Accetta» nel banner dei cookie, mai nel giardino (8).
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
      var etichetta = b.textContent;          /* ogni pulsante dice la sua musica: Chopin, Mozart… */
      suono.preload = 'metadata';
      suono.src = b.getAttribute('data-audio');
      suono.addEventListener('canplay', function () { b.hidden = false; });
      b.addEventListener('click', function () {
        if (suono.paused) { suono.play(); b.classList.add('suona'); b.textContent = 'Ferma la musica'; }
        else { suono.pause(); suono.currentTime = 0; b.classList.remove('suona'); b.textContent = etichetta; }
      });
      suono.addEventListener('ended', function () { b.classList.remove('suona'); b.textContent = etichetta; });
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
/* le nostre email partono da segreteria@larosadoro.org: a un indirizzo nuovo qualche programma di posta le mette tra
   quelle indesiderate, e chi non le vede non conferma. Dopo ogni invio che fa partire un'email lo diciamo (Elias, 31.10) */
function seNonLaVedi(indirizzo) {
  return ' Se non la vedi entro qualche minuto, guarda nella posta indesiderata e aggiungi ' + indirizzo + ' ai tuoi contatti.';
}

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
    /* Turnstile subito, senza aspettare che si scriva: per l'invito alle notizie, che compare dopo la dedica */
    prepara: avvia,
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
function daCollegamento(riquadro, parametro, foglio, indirizzo, seNonRiesce, quandoRiesce) {
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
        if (risposta.success && quandoRiesce) quandoRiesce();
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

  /* dopo la dedica, sotto il ringraziamento, l'invito alle notizie (Dacia ed Elias, 4.11): con l'email appena scritta,
     una volta sola per visita (chi ha già risposto, sì o «Chiudi», non lo rivede), mai prima della dedica. La dedica
     parte senza niente delle notizie; l'iscrizione la manda il modulo dell'invito, come il riquadro (7) */
  var invito = document.getElementById('modulo-invito');
  var invitoMostrato = false;
  function nascondiInvito() {
    if (!invito) return;
    invito.hidden = true;
    velo.classList.remove('con-invito');
  }
  function mostraInvito() {
    if (!invito || invitoMostrato || !invito.protezione) return;
    invitoMostrato = true;
    invito.elements.email.value = campoPosta.value.trim();
    dopo.hidden = true;                            /* un solo «Chiudi», quello dell'invito, in fondo */
    invito.hidden = false;
    velo.classList.add('con-invito');
    invito.protezione.prepara();
  }
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
      nascondiInvito();
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
          (risposta.ricevuta ? ' Ti abbiamo mandato un’email con il collegamento per toglierla, se un giorno vorrai.' + seNonLaVedi(indirizzo) : ''));
        mostraInvito();
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

  /* i nomi posati nel giardino, ciascuno con l'immagine scelta, nell'ordine di dediche.json: le più recenti prima,
     e mai due sulla stessa immagine una dopo l'altra (lo decide giardino.py). Sotto l'immagine solo il nome e la prima
     riga della dedica, con i puntini, così la griglia resta regolare; toccandola, la dedica intera si apre nella
     pergamena (Dacia, 3.11) */
  var sezione = document.getElementById('nel-giardino');
  if (!sezione || !window.fetch) return;
  var immagini = {};
  var piante = document.querySelectorAll('.pianta');
  for (var k = 0; k < piante.length; k++) {
    var b = piante[k].querySelector('button[data-foto]'), img = piante[k].querySelector('img');
    if (b && img) immagini[b.getAttribute('data-foto')] = img.getAttribute('src');
  }

  var veloPergamena = document.getElementById('velo-pergamena');
  var apertaDa = null;
  if (veloPergamena) {
    document.body.appendChild(veloPergamena);
    var cornicePergamena = veloPergamena.querySelector('.foto');
    var nomePergamena = document.getElementById('pergamena-nome');
    var parolePergamena = veloPergamena.querySelector('.pergamena-dedica');
    var chiudiPergamena = veloPergamena.querySelector('.chiudi-dialogo');
    var chiudi = function () {
      if (veloPergamena.hidden) return;
      veloPergamena.hidden = true;
      if (apertaDa) apertaDa.focus();
    };
    chiudiPergamena.addEventListener('click', chiudi);
    veloPergamena.addEventListener('click', function (e) { if (e.target === veloPergamena) chiudi(); });
    document.addEventListener('keydown', function (e) {
      if (veloPergamena.hidden) return;
      if (e.key === 'Escape') chiudi();
      if (e.key === 'Tab') { e.preventDefault(); chiudiPergamena.focus(); }   /* «Chiudi» è l'unica cosa da toccare */
    });
  }
  function apriPergamena(d, bottone) {
    if (!veloPergamena) return;
    cornicePergamena.textContent = '';
    cornicePergamena.hidden = !immagini[d.immagine];
    if (immagini[d.immagine]) {
      var foto = document.createElement('img');
      foto.src = immagini[d.immagine];
      foto.alt = d.immagine;
      cornicePergamena.appendChild(foto);
    }
    nomePergamena.textContent = d.nome;
    parolePergamena.textContent = d.dedica ? '«' + d.dedica + '»' : '';
    parolePergamena.hidden = !d.dedica;
    apertaDa = bottone;
    veloPergamena.hidden = false;
    veloPergamena.scrollTop = 0;
    chiudiPergamena.focus();
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
        var bottone = document.createElement('button');
        bottone.type = 'button';
        bottone.className = 'leggi';
        bottone.setAttribute('aria-haspopup', 'dialog');
        var nome = document.createElement('strong');
        nome.textContent = d.nome;
        bottone.appendChild(nome);
        if (d.dedica) {
          var riga = document.createElement('span');          /* la prima riga; il foglio di stile la chiude con i puntini */
          riga.className = 'riga';
          riga.textContent = d.dedica;
          bottone.appendChild(riga);
        }
        bottone.addEventListener('click', function () { apriPergamena(d, bottone); });
        dida.appendChild(bottone);
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
          (risposta.conferma ? ' Per le notizie ti abbiamo mandato un’email: aprila e tocca «Confermo».' + seNonLaVedi(indirizzo) : ''));
        esito.focus();
        conta('messaggio_contatti');
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
    'Non siamo riusciti a confermare. Riprova tra poco, oppure scrivici a', function () { conta('iscrizione_notizie'); });
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
          (risposta.conferma ? ' Per le notizie ti abbiamo mandato un’email: aprila e tocca «Confermo».' + seNonLaVedi(indirizzo) : ''));
        esito.focus({ preventScroll: true });
        conta('progetto_inviato');
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

/* ---- 6b. il biglietto dei regali solidali (pagina «Regali solidali», dentro Dona; Elias, 6.11.2026) e la pergamena delle
        bomboniere solidali e dei funerali (7.11.2026): si sceglie l'occasione, l'immagine, i nomi e due righe, e il browser
        disegna il cartoncino in un canvas, con le proporzioni dei fogli A. Il biglietto si scarica in PDF A5 orizzontale, la
        pergamena in PDF A4 con quattro copie da tagliare; tutti e due anche in immagine, e dove il telefono lo permette
        «Manda» apre le app per condividerla. Niente parte dal sito: i nomi restano nel browser. Non dicono mai la cifra.
        Il PDF si scrive qui, senza librerie: una pagina con dentro l'immagine JPEG del canvas ---- */
(function () {
  'use strict';
  function cartoncino(modulo) {
    var pergamena = modulo.id === 'modulo-pergamena';
    var tela = modulo.querySelector('canvas');
    var ctx = tela.getContext && tela.getContext('2d');
    if (!ctx || !tela.toBlob || !window.Blob || !window.Promise || !window.URL || !URL.createObjectURL) return;
    var senza = document.getElementById(pergamena ? 'pergamena-senza-js' : 'biglietto-senza-js');
    if (senza) senza.hidden = true;
    modulo.hidden = false;

    var L = tela.width, A = tela.height;
    var AVORIO = '#FAF6EE', ANTRACITE = '#1C1C1C', ORO = '#B88F3D', ORO_SCURO = '#8D6E2A';
    /* i caratteri e l’altezza delle loro righe; la pergamena si stampa più piccola (quattro per foglio), e ha il corpo più grande */
    var STILE = pergamena
      ? { saluto: ['300 italic 120px "Cormorant Garamond"', 124], per: ['400 64px "Cormorant Garamond"', 74],
          corpo: ['400 42px "Instrument Sans"', 60], messaggio: ['italic 400 %px "Cormorant Garamond"', 0],
          firma: ['italic 400 60px "Cormorant Garamond"', 70], piede: ['500 24px "Instrument Sans"', 0] }
      : { saluto: ['300 italic 112px "Cormorant Garamond"', 118], per: ['400 66px "Cormorant Garamond"', 76],
          corpo: ['400 35px "Instrument Sans"', 54], messaggio: ['italic 400 %px "Cormorant Garamond"', 0],
          firma: ['italic 400 60px "Cormorant Garamond"', 70], piede: ['500 21px "Instrument Sans"', 0] };
    var el = modulo.elements;
    var esito = modulo.querySelector('.esito');
    var occasione = el.occasione;
    /* «In ricordo di una persona», nel biglietto: il campo con il suo nome si vede solo per questa occasione */
    var ricordo = el.ricordo, etichettaRicordo = modulo.querySelector('label[for="mb-ricordo"]');
    function opzione() { return occasione.options[occasione.selectedIndex]; }
    function inRicordo() { return !pergamena && opzione().hasAttribute('data-saluto-nome'); }

    /* l’apostrofo tipografico anche in ciò che scrive chi prepara il cartoncino (regole di qualità, punto 1) */
    function pulito(v) {
      return String(v || '').replace(/\s+/g, ' ').trim().replace(/([A-Za-zÀ-ÖØ-öø-ÿ])'(?=[A-Za-zÀ-ÖØ-öø-ÿ])/g, '$1’');
    }
    /* «I nostri clienti» diventa «Per i nostri clienti»; i nomi restano con la maiuscola */
    function minuscola(v) {
      return /^(il|lo|la|i|gli|le|l’|tutti|tutte|mio|mia|miei|mie|nostro|nostra|nostri|nostre|caro|cara|cari|care|amici|amiche)(\s|$)/i.test(v) || /^l’/i.test(v)
        ? v.charAt(0).toLowerCase() + v.slice(1) : v;
    }
    function scelto(nome) {
      var c = modulo.querySelector('input[name="' + nome + '"]:checked');
      return c ? c.value : '';
    }
    function testi() {
      var o = opzione();
      if (pergamena) {
        /* i nomi in grande, sotto l’occasione e la data («Sposi · 12 giugno 2027»); senza nomi, in grande l’occasione */
        var nomi = pulito(el.nomi.value), data = pulito(el.data.value), riga = o.getAttribute('data-riga');
        return {
          saluto: nomi || riga,
          per: nomi ? riga + (data ? ' · ' + data : '') : data,
          corpo: modulo.getAttribute('data-corpo'),
          messaggio: pulito(el.messaggio.value),
          firma: '',
          piede: modulo.getAttribute('data-piede')
        };
      }
      var voi = scelto('persone') === 'voi';
      var corpo = voi ? 'data-corpo-voi' : 'data-corpo-te';
      var per = minuscola(pulito(el.per.value).replace(/^per\s+/i, ''));
      var nome = inRicordo() ? pulito(ricordo.value) : '';
      return {
        saluto: nome ? o.getAttribute('data-saluto-nome').replace('{nome}', nome) : o.getAttribute('data-saluto').replace('{te}', voi ? 'voi' : 'te'),
        per: per ? 'Per ' + per : '',
        corpo: o.getAttribute(corpo) || modulo.getAttribute(corpo),
        messaggio: pulito(el.messaggio.value),
        firma: pulito(el.da.value),
        piede: modulo.getAttribute('data-piede')
      };
    }

    /* le righe di un testo nella larghezza data; una parola troppo lunga si spezza */
    function righe(testo, larghezza) {
      var fuori = [], riga = '';
      testo.split(' ').forEach(function (parola) {
        var prova = riga ? riga + ' ' + parola : parola;
        if (ctx.measureText(prova).width <= larghezza) { riga = prova; return; }
        if (riga) fuori.push(riga);
        riga = '';
        while (ctx.measureText(parola).width > larghezza) {
          var n = parola.length;
          while (n > 1 && ctx.measureText(parola.slice(0, n)).width > larghezza) n--;
          fuori.push(parola.slice(0, n));
          parola = parola.slice(n);
        }
        riga = parola;
      });
      if (riga) fuori.push(riga);
      return fuori;
    }
    function spaziato(testo, x, y, spazio) {
      for (var i = 0; i < testo.length; i++) {
        ctx.fillText(testo[i], x, y);
        x += ctx.measureText(testo[i]).width + spazio;
      }
    }

    function disegna() {
      var t = testi();
      ctx.fillStyle = AVORIO;
      ctx.fillRect(0, 0, L, A);
      /* la cornice: un filo d’oro e uno più chiaro */
      ctx.strokeStyle = ORO;
      ctx.globalAlpha = 0.75; ctx.lineWidth = 2; ctx.strokeRect(46, 46, L - 92, A - 92);
      ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.strokeRect(60, 60, L - 120, A - 120);
      ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(700, 210); ctx.lineTo(700, A - 210); ctx.stroke();
      ctx.globalAlpha = 1;
      /* la tavola incisa, a sinistra */
      var immagine = modulo.querySelector('input[name="immagine"]:checked + img');
      if (immagine && immagine.complete && immagine.naturalWidth) {
        var w = Number(immagine.getAttribute('width')), h = Number(immagine.getAttribute('height'));
        var scala = Math.min(500 / w, 640 / h);
        ctx.drawImage(immagine, 380 - w * scala / 2, A / 2 - h * scala / 2, w * scala, h * scala);
      }
      /* il testo, a destra: si misura, poi si centra in altezza */
      var x = 790, largo = 900, blocchi = [];
      function aggiungi(nome, testo, colore) {
        ctx.font = STILE[nome][0];
        righe(testo, largo).forEach(function (r) { blocchi.push({ font: STILE[nome][0], colore: colore, testo: r, alto: STILE[nome][1] }); });
      }
      aggiungi('saluto', t.saluto, ANTRACITE);
      blocchi.push({ spazio: 26 });
      if (t.per) {
        aggiungi('per', t.per, ORO_SCURO);
        blocchi.push({ spazio: 34 });
      }
      aggiungi('corpo', t.corpo, 'rgba(28,28,28,.8)');
      if (t.messaggio) {
        var corpo = 52, fatte;
        do {                                       /* due righe tue: al massimo quattro, il carattere si stringe se serve */
          ctx.font = STILE.messaggio[0].replace('%', corpo);
          fatte = righe(t.messaggio, largo);
          corpo -= 4;
        } while (fatte.length > 4 && corpo >= 36);
        blocchi.push({ spazio: 36 });
        fatte.slice(0, 5).forEach(function (r) { blocchi.push({ font: ctx.font, colore: ANTRACITE, testo: r, alto: Math.round((corpo + 4) * 1.22) }); });
      }
      if (t.firma) {
        blocchi.push({ spazio: 34 });
        aggiungi('firma', t.firma, ORO_SCURO);
      }
      var totale = blocchi.reduce(function (s, b) { return s + (b.spazio || b.alto); }, 0);
      var y = Math.max(110, (A - 70 - totale) / 2);
      ctx.textBaseline = 'alphabetic';
      blocchi.forEach(function (b) {
        if (b.spazio) { y += b.spazio; return; }
        ctx.font = b.font; ctx.fillStyle = b.colore;
        ctx.fillText(b.testo, x, y + b.alto * 0.78);
        y += b.alto;
      });
      ctx.font = STILE.piede[0]; ctx.fillStyle = ORO_SCURO;
      spaziato(t.piede.toUpperCase(), x, A - 112, 3);
      /* per chi usa un lettore di schermo, il cartoncino in parole */
      tela.setAttribute('aria-label', (pergamena ? 'Anteprima della pergamena: ' : 'Anteprima del biglietto: ') +
        [t.saluto, t.per, t.corpo, t.messaggio, t.firma, t.piede]
        .filter(Boolean).map(function (s) { return /[.!?…»]$/.test(s) ? s : s + '.'; }).join(' '));
    }

    var inAttesa = false;
    function ridisegna() {
      if (inAttesa) return;
      inAttesa = true;
      (window.requestAnimationFrame || setTimeout)(function () { inAttesa = false; disegna(); });
    }
    if (!pergamena) {
      var campoRicordo = function () { ricordo.hidden = etichettaRicordo.hidden = !inRicordo(); };
      occasione.addEventListener('change', function () {
        if (opzione().getAttribute('data-persone') === 'voi') modulo.querySelector('input[name="persone"][value="voi"]').checked = true;
        campoRicordo();
      });
      campoRicordo();
    }
    modulo.addEventListener('input', ridisegna);
    modulo.addEventListener('change', ridisegna);
    disegna();
    /* i caratteri del sito e le tavole arrivano dopo: appena ci sono, il cartoncino si ridisegna */
    if (document.fonts && document.fonts.load) {
      Promise.all(Object.keys(STILE).map(function (k) { return document.fonts.load(STILE[k][0].replace('%', '50')); }))
        .then(ridisegna, ridisegna);
    }
    var tavole = modulo.querySelectorAll('.immagine img');
    for (var i = 0; i < tavole.length; i++) if (!tavole[i].complete) tavole[i].addEventListener('load', ridisegna);

    /* il nome del file: «regalo-solidale-per-anna.pdf», in ricordo «donazione-in-ricordo-di-maria.pdf»;
       la pergamena «pergamena-solidale-chiara-e-luca.pdf», e al funerale «pergamena-in-ricordo-di-maria-bianchi.pdf» */
    function corto(v) {
      v = v.toLowerCase();
      if (v.normalize) v = v.normalize('NFD').replace(/[̀-ͯ]/g, '');
      return v.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '');
    }
    function nomeFile(estensione) {
      if (pergamena)
        return (modulo.getAttribute('data-file') + corto(pulito(el.nomi.value))).replace(/-(di-)?$/, '') + '.' + estensione;
      if (inRicordo()) {
        var nome = corto(pulito(ricordo.value));
        return opzione().getAttribute('data-file') + (nome ? '-di-' + nome : '') + '.' + estensione;
      }
      var per = corto(pulito(el.per.value).replace(/^per\s+/i, ''));
      return 'regalo-solidale' + (per ? '-per-' + per : '') + '.' + estensione;
    }
    function titolo() {
      return (pergamena ? modulo : opzione()).getAttribute('data-titolo') || 'Regalo solidale';
    }
    function jpeg() {
      disegna();
      return new Promise(function (fatto, errore) {
        try { tela.toBlob(function (b) { if (b) fatto(b); else errore(new Error('vuoto')); }, 'image/jpeg', 0.9); }
        catch (e) { errore(e); }
      });
    }
    /* il foglio e il disegno che ci stende l’immagine. Il biglietto: un A5 orizzontale (595,28 × 419,53 punti), tutto.
       La pergamena: un A4 orizzontale (841,89 × 595,28) con quattro copie, un margine di 8 mm che ogni stampante lascia
       e le linee grigie dove tagliare */
    function foglio() {
      if (!pergamena) return { misura: '595.28 419.53', disegno: 'q 595.28 0 0 419.53 0 0 cm /Im1 Do Q' };
      var margine = 22.68, alto = (595.28 - 2 * margine) / 2, largo = alto * L / A, x0 = (841.89 - 2 * largo) / 2;
      var copie = [], linee = [];
      function n(v) { return v.toFixed(2); }
      for (var r = 0; r < 2; r++) for (var c = 0; c < 2; c++) {
        var x = x0 + c * largo, y = margine + r * alto;
        copie.push('q ' + n(largo) + ' 0 0 ' + n(alto) + ' ' + n(x) + ' ' + n(y) + ' cm /Im1 Do Q');
        linee.push(n(x) + ' ' + n(y) + ' ' + n(largo) + ' ' + n(alto) + ' re');
      }
      return { misura: '841.89 595.28', disegno: copie.join('\n') + '\nq 0.75 G 0.4 w ' + linee.join(' ') + ' S Q' };
    }
    /* il PDF: catalogo, pagine, una pagina, l’immagine, il disegno che la stende e le informazioni sul documento */
    function pdf(immagine) {
      return immagine.arrayBuffer().then(function (dati) {
        var parti = [], scritti = 0, dove = [];
        function aggiungi(x) {
          var b = typeof x === 'string' ? new TextEncoder().encode(x) : x;
          parti.push(b); scritti += b.length;
        }
        function oggetto(n, testo) { dove[n] = scritti; aggiungi(n + ' 0 obj\n' + testo + '\nendobj\n'); }
        var jpg = new Uint8Array(dati), f = foglio();
        aggiungi('%PDF-1.4\n');
        aggiungi(new Uint8Array([37, 226, 227, 207, 211, 10]));   /* la riga che dice ai programmi che il file contiene dati binari */
        oggetto(1, '<< /Type /Catalog /Pages 2 0 R >>');
        oggetto(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
        oggetto(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + f.misura + '] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>');
        dove[4] = scritti;
        aggiungi('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + L + ' /Height ' + A +
                 ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>\nstream\n');
        aggiungi(jpg);
        aggiungi('\nendstream\nendobj\n');
        oggetto(5, '<< /Length ' + f.disegno.length + ' >>\nstream\n' + f.disegno + '\nendstream');
        oggetto(6, '<< /Title (' + titolo() + ') /Producer (larosadoro.org) >>');
        var tabella = scritti, voci = '';
        for (var n = 1; n <= 6; n++) voci += ('000000000' + dove[n]).slice(-10) + ' 00000 n \n';
        aggiungi('xref\n0 7\n0000000000 65535 f \n' + voci + 'trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n' + tabella + '\n%%EOF\n');
        return new Blob(parti, { type: 'application/pdf' });
      });
    }
    function scarica(blob, nome) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nome;
      a.hidden = true;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.parentNode.removeChild(a); }, 5000);
    }
    function nonRiesce() {
      scriviEsito(esito, 'Il tuo browser non riesce a preparare il file. Prova con un altro browser, oppure scrivici a', true,
                  'segreteria@larosadoro.org');
    }

    modulo.addEventListener('submit', function (e) {
      e.preventDefault();
      esito.hidden = true;
      jpeg().then(pdf).then(function (b) { scarica(b, nomeFile('pdf')); }, nonRiesce);
    });
    modulo.querySelector('[data-formato="jpg"]').addEventListener('click', function () {
      esito.hidden = true;
      jpeg().then(function (b) { scarica(b, nomeFile('jpg')); }, nonRiesce);
    });
    /* «Manda»: sul telefono apre le app per condividere l’immagine (WhatsApp, la posta…), dove il browser lo permette */
    var manda = modulo.querySelector('[data-formato="condividi"]');
    try {
      if (navigator.canShare && window.File && navigator.canShare({ files: [new File([''], 'prova.jpg', { type: 'image/jpeg' })] })) {
        manda.hidden = false;
        manda.addEventListener('click', function () {
          jpeg().then(function (b) {
            return navigator.share({ files: [new File([b], nomeFile('jpg'), { type: 'image/jpeg' })], title: titolo() });
          }).catch(function () { /* chi chiude la finestra non ha bisogno di avvisi */ });
        });
      }
    } catch (e) { /* resta nascosto */ }
  }
  ['modulo-biglietto', 'modulo-pergamena'].forEach(function (id) {
    var modulo = document.getElementById(id);
    if (modulo) cartoncino(modulo);
  });
})();

/* ---- 7. il riquadro delle notizie, nella fascia «Restiamo in contatto» prima del piede (o nel testo della pagina
        «Grazie»), e l'invito che compare nel giardino dopo la dedica: l'email va allo script del foglio, che scrive la
        richiesta nella scheda dei Contatti e manda l'email di conferma. Senza questo codice il riquadro parte lo stesso ---- */
(function () {
  'use strict';
  if (!window.fetch || !window.FormData || !window.Promise) return;
  ['modulo-notizie', 'modulo-invito'].forEach(function (id) {
    var modulo = document.getElementById(id);
    if (modulo) iscrizione(modulo);
  });

  function iscrizione(modulo) {
    var protetto = protezione(modulo);
    modulo.protezione = protetto;                  /* il giardino prepara Turnstile quando l'invito compare */
    var campi = modulo.querySelector('.campi');
    var esito = modulo.querySelector('.esito');
    var invia = modulo.querySelector('.invia');
    var dopo = modulo.querySelector('.righe.dopo');
    var etichetta = invia.textContent;
    var indirizzo = modulo.getAttribute('data-indirizzo');
    modulo.elements._sito.value = RADICE;
    function comeEmail() {
      return { oggetto: 'Notizie della Fondazione',
               testo: 'Vorrei ricevere le notizie della Fondazione per email, a questo indirizzo: ' + modulo.elements.email.value.trim() + '.' };
    }
    /* la pagina da cui ci si iscrive, per sapere quali punti del sito funzionano (l'invito la porta già scritta) */
    if (!modulo.elements.pagina.value && RADICE && location.href.indexOf(RADICE) === 0) {
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
          if (dopo) dopo.hidden = false;
          scriviEsito(esito, 'Grazie. Ti abbiamo mandato un’email: aprila e tocca «Confermo». Le notizie arrivano solo dopo la conferma.' + seNonLaVedi(indirizzo));
          esito.focus({ preventScroll: true });
        })
        .catch(function () {
          scriviEsito(esito, 'L’iscrizione non è partita. Riprova tra poco, oppure scrivici a', true, indirizzo);
        })
        .then(function () {
          invia.disabled = false;
          invia.textContent = etichetta;
        });
    });
  }
})();

/* ---- 8. la misura di Google Analytics, solo con il consenso (Elias, 1.11; linee guida del Garante del 10.6.2021).
        Con la proprietà di Google Analytics (GOOGLE_TAG in costruisci.py) ogni pagina ha il banner dei cookie, nascosto:
        compare finché non si sceglie. «Accetta» carica Google; «Rifiuta» e la X sono la stessa cosa, e Google non parte.
        La scelta resta nel browser per sei mesi; «Preferenze cookie», nel piede, riapre il banner. Ritirare il consenso
        cancella i cookie di Google e ricarica la pagina, perché Google non resti in memoria.
        A Google arrivano solo l'indirizzo della pagina senza i codici dei collegamenti delle email (resta il segno degli
        annunci) e, con il consenso, le azioni che contano: il messaggio dei Contatti (5), la conferma delle
        notizie (5), il progetto proposto (6), la donazione, quando si torna da Stripe sulla pagina «Grazie», e il PDF
        scaricato dalle pagine che informano (il fac-simile delle DAT, la guida al testamento: data-conta, sotto).
        Nel giardino dei ricordi (data-misura="no") Google non parte mai ---- */
var misuraGoogle = (function () {
  'use strict';
  var banner = document.getElementById('consenso-cookie');
  var id = banner && banner.getAttribute('data-google');
  if (!id) return null;
  var qui = document.body.getAttribute('data-misura');           /* "no" nel giardino, "donazione" nella pagina «Grazie» */
  var CHIAVE = 'rosadoro-cookie', VERSIONE = 1, SEI_MESI = 183 * 24 * 3600 * 1000;
  var TIENI = /^(gclid|gbraid|wbraid|gad_source|gad_campaignid|utm_[a-z_]+)$/;   /* i segni degli annunci, nient'altro */
  var ricordata = null, caricato = false, coda = [];

  function leggi() {
    var v = ricordata;
    try { v = JSON.parse(localStorage.getItem(CHIAVE)) || ricordata; } catch (e) { /* il browser non salva: vale la memoria */ }
    if (!v || (v.scelta !== 'si' && v.scelta !== 'no') || v.versione !== VERSIONE || !(Date.now() - v.quando < SEI_MESI)) return null;
    return v.scelta;
  }
  function salva(scelta) {
    ricordata = { scelta: scelta, quando: Date.now(), versione: VERSIONE };
    try { localStorage.setItem(CHIAVE, JSON.stringify(ricordata)); } catch (e) { /* vale per questa pagina */ }
  }
  /* l'indirizzo per Google: senza i codici dei collegamenti delle email (?conferma=, ?cancella=, ?togli=) né il segno di Stripe */
  function pulito(indirizzo) {
    var u;
    try { u = new URL(indirizzo); } catch (e) { return ''; }
    var resta = [];
    u.searchParams.forEach(function (v, k) { if (TIENI.test(k)) resta.push(encodeURIComponent(k) + '=' + encodeURIComponent(v)); });
    return u.origin + u.pathname + (resta.length ? '?' + resta.join('&') : '');
  }
  function carica() {
    if (caricato || qui === 'no') return;
    caricato = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    var dove = { page_location: pulito(location.href), page_referrer: document.referrer ? pulito(document.referrer) : '' };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('set', dove);
    window.gtag('config', id, { page_location: dove.page_location, page_referrer: dove.page_referrer,
      allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 180 * 24 * 3600 });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    coda.splice(0).forEach(function (evento) { window.gtag('event', evento); });
  }
  /* quello che Google salva nel browser: i cookie, sull'indirizzo del sito e sui domini sopra (Google li mette su
     «.larosadoro.org»), e «_gcl_ls» nella memoria del browser, per gli annunci */
  function cancellaGoogle() {
    var parti = location.hostname.split('.'), domini = [''];
    for (var i = 0; i < parti.length - 1; i++) domini.push('; domain=' + parti.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var nome = c.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl)/.test(nome)) return;
      domini.forEach(function (d) { document.cookie = nome + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d; });
    });
    try {
      Object.keys(localStorage).forEach(function (k) { if (/^(_ga|_gcl)/.test(k)) localStorage.removeItem(k); });
    } catch (e) { /* il browser non dà la memoria: Google non ci ha salvato niente */ }
  }
  function mostra(conFuoco) {
    banner.hidden = false;
    if (conFuoco) { banner.setAttribute('tabindex', '-1'); banner.focus(); }
  }
  function accetta() {
    salva('si');
    banner.hidden = true;
    carica();
  }
  function rifiuta() {
    salva('no');
    banner.hidden = true;
    coda = [];
    if (caricato) window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    cancellaGoogle();
    if (caricato) location.reload();
  }

  var bottoni = banner.querySelectorAll('[data-consenso]');
  for (var i = 0; i < bottoni.length; i++) bottoni[i].addEventListener('click', function () {
    if (this.getAttribute('data-consenso') === 'si') accetta(); else rifiuta();
  });
  banner.querySelector('.chiudi-consenso').addEventListener('click', rifiuta);   /* la X vale come «Rifiuta» */
  var preferenze = document.querySelectorAll('a.apri-consenso');
  for (var j = 0; j < preferenze.length; j++) preferenze[j].addEventListener('click', function (e) {
    e.preventDefault();
    mostra(true);
  });

  /* dopo il rifiuto non resta niente di Google, neppure il cookie che Google riscrive lasciando la pagina (visto il
     2.11.2026). Senza una scelta non si tocca niente: i cookie su «.larosadoro.org» li vedono anche gli altri siti
     della Fondazione, come Lux */
  var scelta = leggi();
  if (scelta === 'si') carica();
  else if (scelta === 'no') cancellaGoogle();
  if (scelta === null && qui !== 'no') mostra(false);

  function segna(evento) {
    if (qui === 'no' || leggi() === 'no') return;
    if (caricato) window.gtag('event', evento);
    else coda.push(evento);                       /* senza una scelta: parte solo se si accetta, in questa pagina */
  }
  /* tornando da Stripe la pagina «Grazie» ha ?session_id=cs_…: la donazione si conta una volta, poi il segno sparisce */
  if (qui === 'donazione' && /[?&]session_id=cs_(live|test)_[A-Za-z0-9]+/.test(location.search)) {
    segna('donazione_completata');
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.hash);
  }
  return { conta: segna };
})();
function conta(evento) { if (misuraGoogle) misuraGoogle.conta(evento); }
/* le pagine che informano hanno un passo concreto che conta per gli annunci (chat di Ad Grants, sì di Elias del 6.11.2026):
   scaricare il fac-simile delle DAT o la guida al testamento. Il collegamento porta data-conta con il nome dell'evento e
   apre il PDF in una scheda nuova, così la pagina resta aperta e l'evento fa in tempo a partire */
document.addEventListener('click', function (e) {
  var a = e.target && e.target.closest ? e.target.closest('a[data-conta]') : null;
  if (a) conta(a.getAttribute('data-conta'));
});
