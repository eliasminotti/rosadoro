/*
 * I controlli dei moduli nelle pagine (sito/js/sito.js)
 * -----------------------------------------------------
 * Apre le pagine di sito/ in un browser vero (Chromium, con Playwright), compila i moduli come farebbe
 * una persona e guarda che cosa parte verso lo script del foglio e che cosa compare nella pagina.
 * Le pagine si aprono dalla cartella, sotto un indirizzo finto; lo script del foglio è finto anche lui:
 * non parte niente verso Google né verso altri siti. Lo fa girare sorgenti/controlla.py, con gli altri
 * controlli; da solo:
 *
 *     node sorgenti/controlla-moduli.js
 *
 * Dove Playwright non c’è (per esempio su GitHub, dove la pubblicazione non installa niente) i controlli
 * si saltano e lo dice; girano nel cantiere di Claude, prima di ogni modifica di sito.js.
 *
 * Ogni controllo dice che cosa deve succedere. Si scrive prima di cambiare sito.js, si vede fallire,
 * e solo dopo si cambia sito.js (CLAUDE.md, Elias 15.10).
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

let playwright = null;
for (const dove of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
  try { playwright = require(dove); break; } catch (e) { /* si prova il prossimo */ }
}

const RADICE = path.join(__dirname, '..');
const SITO = path.join(RADICE, 'sito');
const ORIGINE = 'https://sito.prova/';              // l’indirizzo finto da cui si aprono le pagine di sito/
const FOGLIO = 'https://script.google.com/';        // lo script del foglio (FOGLIO in costruisci.py)
const CONSENSO = 'v2 novembre 2026';   // la versione del testo della casella delle notizie (CONSENSO_NOTIZIE in costruisci.py)
const SEGRETERIA = 'segreteria@larosadoro.org';
const TIPI = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf' };


/* ---- il browser, il sito dalla cartella, lo script del foglio finto e Turnstile finto ---- */

let browser;

const CHIAVE = 'chiave-di-prova';                   // la chiave pubblica di Turnstile (TURNSTILE in costruisci.py), finta
/* Turnstile finto: dà subito una risposta, e una nuova dopo ogni reset */
const TURNSTILE_FINTO = `(function () {
  var widget = [];
  window.turnstile = {
    render: function (dove, o) {
      var w = { o: o, volte: 0 }, n = widget.push(w);
      setTimeout(function () { o.callback('risposta-' + n + '-0'); }, 30);
      return 'w' + n;
    },
    reset: function (id) {
      var n = Number(String(id).slice(1)), w = widget[n - 1];
      if (!w) return;
      w.volte++;
      setTimeout(function () { w.o.callback('risposta-' + n + '-' + w.volte); }, 30);
    },
    getResponse: function () {}, remove: function () {}
  };
  window.chiaviTurnstile = function () { return widget.map(function (w) { return w.o.sitekey; }); };
  var pronto = new URL(document.currentScript.src).searchParams.get('onload');
  if (pronto && window[pronto]) window[pronto]();
})();`;

/* Google finto (gtag.js di Google Analytics): conta quante volte si carica e manda quello che manda il vero, una misura a
   Google Analytics, un'immagine a google.com e una cornice di Google Tag Manager, così la regola di sicurezza della pagina
   si prova con tutto quello che Google chiede di caricare. Come il vero, salva i suoi cookie e, con il collegamento a
   Google Ads, «_gcl_ls» nella memoria del browser; e quando si lascia la pagina riscrive il cookie della sessione, anche
   se la pagina l'ha appena cancellato (visto con il vero gtag.js il 2.11.2026) */
const GTAG_FINTO = `(function () {
  window.__gtag = (window.__gtag || 0) + 1;
  var dominio = '; path=/; domain=.' + location.hostname;
  document.cookie = '_ga=GA1.1.123.456' + dominio;
  document.cookie = '_ga_PROVA1234=GS2.1.s1' + dominio;
  try { localStorage.setItem('_gcl_ls', '{"schema":"gcl","value":{"value":{"gclid":"prova"}}}'); } catch (e) {}
  addEventListener('pagehide', function () { document.cookie = '_ga_PROVA1234=GS2.1.s2' + dominio; });
  try { fetch('https://region1.google-analytics.com/g/collect?v=2&tid=prova', { method: 'POST', mode: 'no-cors', keepalive: true }); } catch (e) {}
  var immagine = new Image();
  immagine.src = 'https://www.google.com/ads/ga-audiences?v=1&prova=1';
  var cornice = document.createElement('iframe');
  cornice.src = 'https://www.googletagmanager.com/static/service_worker/prova/sw_iframe.html';
  cornice.style.display = 'none';
  document.body.appendChild(cornice);
})();`;
const VERSO_GOOGLE = /^https:\/\/([a-z0-9-]+\.)*(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|google\.[a-z]{2,3}|doubleclick\.net|googleadservices\.com|googlesyndication\.com)\//;
const ID_GOOGLE = 'G-PROVA1234';                    // la proprietà di Google Analytics (GOOGLE_TAG in costruisci.py), finta
const SCELTA = 'rosadoro-cookie';                   // dove sito.js ricorda la scelta sul banner dei cookie

/* il sito costruito con la misura di Google Analytics accesa (GOOGLE_TAG e MISURA in costruisci.py), in una cartella a parte:
   i controlli della misura girano anche quando nel sito vero la misura è spenta */
let sitoGoogle = null;
function conGoogle() {
  if (sitoGoogle) return sitoGoogle;
  const cartella = fs.mkdtempSync(path.join(os.tmpdir(), 'rosadoro-google-'));
  for (const f of ['costruisci.py', 'testi_pagine.py']) fs.copyFileSync(path.join(RADICE, f), path.join(cartella, f));
  fs.cpSync(SITO, path.join(cartella, 'sito'), { recursive: true, filter: f => !f.endsWith('dediche.json') });
  execFileSync('python3', ['-c', 'import costruisci as c\nc.GOOGLE_TAG = "' + ID_GOOGLE + '"\nc.MISURA = "3 novembre 2026"\nc.costruisci()'],
    { cwd: cartella, stdio: 'pipe' });
  sitoGoogle = path.join(cartella, 'sito');
  return sitoGoogle;
}

/* i campi di un modulo mandato con FormData (multipart/form-data) */
function campiDi(richiesta) {
  const tipo = richiesta.headers()['content-type'] || '';
  const confine = (tipo.match(/boundary=(.+)$/) || [])[1];
  const corpo = richiesta.postDataBuffer();
  if (!confine || !corpo) return {};
  const campi = {};
  for (const parte of corpo.toString('utf8').split('--' + confine)) {
    const nome = (parte.match(/name="([^"]*)"/) || [])[1];
    if (nome === undefined) continue;
    campi[nome] = parte.slice(parte.indexOf('\r\n\r\n') + 4).replace(/\r\n$/, '');
  }
  return campi;
}

/* apre una pagina del sito. foglio(richiesta) dice che cosa risponde lo script: un oggetto (diventa JSON)
   oppure null, e allora la richiesta non arriva (rete giù). dediche: il contenuto di dediche.json.
   turnstile: 'passa' mette la chiave di Turnstile nei moduli e risponde con Turnstile finto; 'non si carica' mette
   la chiave ma Cloudflare non risponde; senza, i moduli non hanno la chiave.
   sito: la cartella da cui si aprono le pagine (conGoogle() per quella con Google Analytics acceso). scelta: la scelta
   sui cookie già fatta nel browser, 'si' o 'no' (oppure com'è salvata), null per nessuna. schermo: { width, height } */
async function apri(percorso, { foglio = () => ({ success: true }), dediche = null, referer, turnstile, sito = SITO, scelta = 'no', schermo } = {}) {
  const contesto = await browser.newContext(Object.assign({ permissions: ['clipboard-read', 'clipboard-write'] }, schermo ? { viewport: schermo } : {}));
  const allo = [], fuori = [], avvisi = [], cloudflare = [], google = [];
  if (scelta !== null) {
    const salvata = JSON.stringify(typeof scelta === 'object' ? scelta : { scelta, quando: Date.now(), versione: 1 });
    await contesto.addInitScript(([chiave, valore]) => {
      try { if (location.origin === 'https://sito.prova' && localStorage.getItem(chiave) === null) localStorage.setItem(chiave, valore); } catch (e) { /* niente */ }
    }, [SCELTA, salvata]);
  }
  await contesto.route('**/*', async route => {
    const richiesta = route.request();
    const indirizzo = richiesta.url();
    if (indirizzo.startsWith('https://challenges.cloudflare.com/')) {
      cloudflare.push(indirizzo);
      if (turnstile !== 'passa') return route.abort();
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: TURNSTILE_FINTO });
    }
    if (indirizzo.startsWith(FOGLIO)) {
      const inviato = { metodo: richiesta.method(), indirizzo, campi: richiesta.method() === 'POST' ? campiDi(richiesta) : {} };
      allo.push(inviato);
      const risposta = foglio(inviato);
      if (risposta === null) return route.abort();
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(risposta) });
    }
    if (VERSO_GOOGLE.test(indirizzo)) {
      google.push(indirizzo);
      if (indirizzo.startsWith('https://www.googletagmanager.com/gtag/js')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: GTAG_FINTO });
      return route.fulfill({ status: 204, body: '' });
    }
    if (!indirizzo.startsWith(ORIGINE)) {
      fuori.push(indirizzo);
      return route.abort();
    }
    let rel = decodeURIComponent(new URL(indirizzo).pathname).replace(/^\//, '');
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    if (rel.endsWith('dediche.json')) {
      return dediche === null ? route.fulfill({ status: 404, body: '' })
        : route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(dediche) });
    }
    const file = path.join(sito, rel);
    if (!file.startsWith(sito) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: '' });
    let corpo = fs.readFileSync(file);
    if (file.endsWith('.html')) {
      corpo = corpo.toString('utf8').replace(/ data-turnstile="[^"]*"/g, '');
      if (turnstile) corpo = corpo.replace(/(<form class="(?:modulo|dialogo)[^"]*" id="modulo-[a-z]+")/g, '$1 data-turnstile="' + CHIAVE + '"');
    }
    return route.fulfill({ status: 200, contentType: TIPI[path.extname(file)] || 'application/octet-stream', body: corpo });
  });
  /* le violazioni della regola di sicurezza della pagina (Content-Security-Policy): quello che il browser ha bloccato */
  await contesto.addInitScript(() => {
    window.__violazioni = [];
    document.addEventListener('securitypolicyviolation', e => window.__violazioni.push(e.violatedDirective + ' ← ' + e.blockedURI));
  });
  const page = await contesto.newPage();
  page.on('dialog', d => { avvisi.push(d.message()); d.dismiss(); });
  const errori = [];
  page.on('pageerror', e => errori.push(String(e)));
  await page.goto(ORIGINE + percorso, referer ? { referer } : {});
  const violazioni = () => page.evaluate(() => window.__violazioni || []);
  return { page, allo, fuori, avvisi, errori, cloudflare, google, violazioni, chiudi: () => contesto.close() };
}

async function esitoDi(page, dove) {
  const esito = page.locator(dove + ' .esito');
  await esito.waitFor({ state: 'visible', timeout: 5000 });
  return (await esito.textContent()).replace(/\s+/g, ' ').trim();
}


/* ---- i controlli ---- */

const controlli = [];
function controllo(descrizione, prova) { controlli.push({ descrizione, prova }); }

controllo('il modulo dei Contatti manda allo script i campi giusti, con la pagina da cui si arriva, e dice grazie', async () => {
  const p = await apri('contatti/index.html', { foglio: () => ({ success: true, conferma: true }), referer: ORIGINE + 'lasciti/index.html' });
  try {
    await p.page.fill('#mc-nome', 'Carla Rossi');
    await p.page.fill('#mc-posta', 'carla@example.org');
    await p.page.fill('#mc-oggetto', 'lascito');
    await p.page.fill('#mc-messaggio', 'Vorrei sapere come funziona.');
    await p.page.check('#mc-notizie');
    await p.page.click('#modulo-contatti .invia');
    const esito = await esitoDi(p.page, '#modulo-contatti');
    assert.strictEqual(p.allo.length, 1, 'richieste allo script: ' + p.allo.length);
    const c = p.allo[0].campi;
    assert.strictEqual(p.allo[0].metodo, 'POST');
    assert.deepStrictEqual([c.nome, c.email, c.oggetto, c.messaggio, c.notizie, c.consenso, c.pagina, c._sito, c._js, c.sito_web],
      ['Carla Rossi', 'carla@example.org', 'lascito', 'Vorrei sapere come funziona.', 'si', CONSENSO, 'lasciti', ORIGINE, '1', '']);
    assert.ok(/^\d+$/.test(c._tempo), 'manca da quanti secondi la pagina è aperta: ' + c._tempo);
    assert.ok(!('tipo' in c), 'il modulo dei Contatti non ha «tipo»');
    assert.ok(!('_turnstile' in c), 'senza la chiave di Turnstile non c’è la sua risposta');
    assert.deepStrictEqual(p.cloudflare, []);
    assert.ok(esito.startsWith('Grazie, il tuo messaggio è arrivato.') && esito.includes('tocca «Confermo»') && esito.includes('posta indesiderata'), esito);
    assert.ok(await p.page.locator('#modulo-contatti .campi').isHidden(), 'i campi dovevano sparire');
  } finally { await p.chiudi(); }
});

controllo('se lo script dice che l’email non va, i Contatti lo dicono e lasciano il messaggio dov’è', async () => {
  const p = await apri('contatti/index.html', { foglio: () => ({ success: false, error: 'email' }) });
  try {
    await p.page.fill('#mc-nome', 'Carla');
    await p.page.fill('#mc-posta', 'carla@example.org');
    await p.page.fill('#mc-messaggio', 'Un messaggio');
    await p.page.click('#modulo-contatti .invia');
    assert.strictEqual(await esitoDi(p.page, '#modulo-contatti'), 'Controlla la tua email: l’indirizzo non sembra completo.');
    assert.strictEqual(await p.page.inputValue('#mc-messaggio'), 'Un messaggio');
    assert.ok(await p.page.locator('#modulo-contatti .campi').isVisible());
    assert.strictEqual((await p.page.textContent('#modulo-contatti .invia')).trim(), 'Scrivici');
  } finally { await p.chiudi(); }
});

controllo('se lo script non risponde, i Contatti danno l’indirizzo di posta', async () => {
  const p = await apri('contatti/index.html', { foglio: () => null });
  try {
    await p.page.fill('#mc-nome', 'Carla');
    await p.page.fill('#mc-posta', 'carla@example.org');
    await p.page.fill('#mc-messaggio', 'Un messaggio');
    await p.page.click('#modulo-contatti .invia');
    const esito = await esitoDi(p.page, '#modulo-contatti');
    assert.strictEqual(esito, 'Il messaggio non è partito. Riprova tra poco, oppure scrivici a ' + SEGRETERIA + '.');
    assert.strictEqual(await p.page.getAttribute('#modulo-contatti .esito a', 'href'), 'mailto:' + SEGRETERIA);
  } finally { await p.chiudi(); }
});

controllo('il riquadro delle notizie manda l’email con la pagina in cui si trova e chiede di confermare', async () => {
  for (const [percorso, pagina] of [['index.html', 'home'], ['lasciti/index.html', 'lasciti'], ['dona/grazie/index.html', 'dona/grazie']]) {
    const p = await apri(percorso, { foglio: () => ({ success: true, conferma: true, iscrizione: true }) });
    try {
      await p.page.fill('#mn-posta', 'lettore@example.org');
      await p.page.click('#modulo-notizie .invia');
      const esito = await esitoDi(p.page, '#modulo-notizie');
      const c = p.allo[0].campi;
      assert.deepStrictEqual([c.tipo, c.notizie, c.email, c.consenso, c.pagina, c._sito, c._js],
        ['notizie', 'si', 'lettore@example.org', CONSENSO, pagina, ORIGINE, '1'], percorso);
      assert.strictEqual(esito, 'Grazie. Ti abbiamo mandato un’email: aprila e tocca «Confermo». Le notizie arrivano solo dopo la conferma.' +
        ' Se non la vedi entro qualche minuto, guarda nella posta indesiderata e aggiungi segreteria@larosadoro.org ai tuoi contatti.');
    } finally { await p.chiudi(); }
  }
});

/* ---- il riquadro delle notizie più in vista (Elias e Dacia, 4.11): una fascia «Restiamo in contatto» subito prima del piede,
        una volta sola per pagina, con una riga che in alcune pagine parla di quella pagina; nella pagina «Grazie» il riquadro sta
        dentro il testo, subito dopo il ringraziamento. Niente che si apre da solo ---- */

const CONSENSO_TESTO = 'Vorrei ricevere periodicamente le notizie della Fondazione per email. Potrò cancellarmi quando lo desidero.';
const RIGA_NOTIZIE = 'Ogni tanto ti scriviamo che cosa fa la Fondazione: i progetti che nascono, gli incontri, il giardino che cresce. Le notizie non ti chiedono di donare.';

controllo('il riquadro delle notizie sta una volta sola per pagina: nella fascia «Restiamo in contatto» subito prima del piede, e nella pagina «Grazie» dentro il testo', async () => {
  const pagine = [
    ['index.html', 'fascia', 'Restiamo in contatto', RIGA_NOTIZIE],
    ['lasciti/index.html', 'fascia', 'Restiamo in contatto', RIGA_NOTIZIE],
    ['news/index.html', 'fascia', 'Restiamo in contatto', 'Le novità arrivano qui, una alla volta. Se vuoi, te le mandiamo anche per email.'],
    ['eventi-e-formazione/index.html', 'fascia', 'Restiamo in contatto', 'Ti scriviamo quando c’è un incontro o un percorso nuovo.'],
    ['eventi-e-formazione/formazione-accompagnamento/index.html', 'fascia', 'Restiamo in contatto',
     'Vuoi sapere quando ci sono novità su Quietude Italia e sugli altri percorsi della Fondazione?'],
    ['progetti/in-corso/index.html', 'fascia', 'Restiamo in contatto', 'Ti raccontiamo i progetti quando partono e come procedono.'],
    [GIARDINO, 'fascia', 'Restiamo in contatto', RIGA_NOTIZIE],
    ['contatti/index.html', 'fascia', 'Restiamo in contatto', RIGA_NOTIZIE],
    ['dona/grazie/index.html', 'testo', 'Vuoi sapere che cosa nasce dalla tua donazione?',
     'Ogni tanto ti raccontiamo i progetti, gli incontri e come usiamo ciò che riceviamo. Le notizie non ti chiedono di donare.']
  ];
  for (const [percorso, dove, titolo, riga] of pagine) {
    const p = await apri(percorso, { dediche: { versione: 'x', dediche: [] } });
    try {
      const m = await p.page.evaluate(() => {
        const r = document.getElementById('notizie');
        const piede = document.querySelector('footer.pie');
        const testo = s => (s || '').replace(/\s+/g, ' ').trim();
        const vai = document.querySelector('main .vai');
        return {
          moduli: document.querySelectorAll('#modulo-notizie').length, ancore: document.querySelectorAll('#notizie').length,
          dentro: !!(r && r.querySelector('#modulo-notizie')), nelPiede: !!(piede && piede.querySelector('#modulo-notizie')),
          primaDelPiede: !!(piede && r && piede.previousElementSibling === r), nelTesto: !!(r && r.closest('main')),
          titolo: r && r.querySelector('h2') ? testo(r.querySelector('h2').textContent) : '',
          riga: r && r.querySelector('.riga') ? testo(r.querySelector('.riga').textContent) : '',
          consenso: r && r.querySelector('.consenso-notizie') ? testo(r.querySelector('.consenso-notizie').textContent) : '',
          primaDelLink: !!(r && vai && (r.compareDocumentPosition(vai) & Node.DOCUMENT_POSITION_FOLLOWING)),
          rimanda: /riquadro in fondo/.test(document.querySelector('main') ? document.querySelector('main').textContent : '')
        };
      });
      assert.strictEqual(m.moduli, 1, percorso + ': moduli delle notizie nella pagina: ' + m.moduli);
      assert.strictEqual(m.ancore, 1, percorso + ': #notizie nella pagina: ' + m.ancore);
      assert.ok(m.dentro, percorso + ': il modulo non sta dentro #notizie, dove porta il collegamento di Lux');
      assert.ok(!m.nelPiede, percorso + ': il riquadro è ancora dentro il piede');
      if (dove === 'fascia') {
        assert.ok(m.primaDelPiede, percorso + ': la fascia delle notizie non sta subito prima del piede');
      } else {
        assert.ok(m.nelTesto && !m.primaDelPiede, percorso + ': il riquadro doveva stare dentro il testo della pagina');
        assert.ok(m.primaDelLink, percorso + ': il riquadro doveva venire prima di «Torna alla home»');
      }
      assert.strictEqual(m.titolo, titolo, percorso);
      assert.strictEqual(m.riga, riga, percorso);
      assert.strictEqual(m.consenso, CONSENSO_TESTO, percorso + ': la frase del consenso deve restare quella di Dacia');
      assert.ok(!m.rimanda, percorso + ': il testo rimanda ancora al «riquadro in fondo»');
    } finally { await p.chiudi(); }
  }
});

controllo('sul telefono la fascia delle notizie e il riquadro della pagina «Grazie» stanno nello schermo, con il testo ad almeno 17 px', async () => {
  for (const schermo of [{ width: 320, height: 640 }, { width: 390, height: 844 }]) {
    for (const percorso of ['index.html', 'dona/grazie/index.html']) {
      const p = await apri(percorso, { schermo });
      try {
        await p.page.locator('#notizie').scrollIntoViewIfNeeded();
        const m = await p.page.evaluate(() => {
          const r = document.getElementById('notizie'), b = r.getBoundingClientRect();
          const corpi = Array.prototype.map.call(r.querySelectorAll('.riga, .consenso-notizie, input[type="email"], .nota'),
            e => parseFloat(getComputedStyle(e).fontSize));
          const pulsante = r.querySelector('.invia').getBoundingClientRect();
          return { sinistra: b.left, destra: b.right, largo: document.documentElement.scrollWidth, corpi,
                   pulsante: pulsante.right };
        });
        const w = schermo.width + ' px, ' + percorso + ': ';
        assert.ok(m.sinistra >= 0 && m.destra <= schermo.width, w + 'il riquadro esce dallo schermo');
        assert.ok(m.pulsante <= schermo.width, w + '«Iscrivimi» esce dallo schermo');
        assert.ok(m.largo <= schermo.width, w + 'la pagina si allarga a ' + m.largo);
        assert.ok(m.corpi.length >= 4 && m.corpi.every(c => c >= 17), w + 'testo sotto i 17 px: ' + m.corpi.join(', '));
      } finally { await p.chiudi(); }
    }
  }
});

controllo('il modulo «Presentaci il tuo progetto» manda i campi giusti e dice grazie', async () => {
  const p = await apri('progetti/presenta-il-tuo-progetto/index.html', { foglio: () => ({ success: true, progetto: true, conferma: false }) });
  try {
    await p.page.fill('#mp-progetto', 'Orto in comune');
    await p.page.check('#mp-fase-2');
    await p.page.fill('#mp-descrizione', 'Un orto per il quartiere.');
    await p.page.fill('#mp-bisogno', 'Un terreno');
    await p.page.fill('#mp-nome', 'Paolo');
    await p.page.fill('#mp-ente', 'Associazione del quartiere');
    await p.page.fill('#mp-posta', 'paolo@example.org');
    await p.page.click('#modulo-progetto .invia');
    const esito = await esitoDi(p.page, '#modulo-progetto');
    const c = p.allo[0].campi;
    assert.deepStrictEqual([c.tipo, c.progetto, c.fase, c.descrizione, c.bisogno, c.documento, c.nome, c.ente, c.email, c.consenso, c._sito, c._js],
      ['progetto', 'Orto in comune', 'Un progetto in corso di realizzazione', 'Un orto per il quartiere.', 'Un terreno', '',
       'Paolo', 'Associazione del quartiere', 'paolo@example.org', CONSENSO, ORIGINE, '1']);
    assert.ok(!('notizie' in c), 'la casella delle notizie non era spuntata');
    assert.strictEqual(esito, 'Grazie, il tuo progetto è arrivato. Lo leggiamo con attenzione e ti rispondiamo di persona, all’indirizzo che ci hai lasciato.');
  } finally { await p.chiudi(); }
});

const GIARDINO = 'in-memoria/giardino-dei-ricordi/index.html';

async function scegliImmagine(page) {
  const bottone = page.locator('.pianta button[data-foto]').first();
  const foto = await bottone.getAttribute('data-foto');
  await bottone.click();
  await page.locator('#velo-dedica').waitFor({ state: 'visible' });
  return foto;
}

controllo('la dedica manda l’immagine scelta, il nome da ricordare e chi scrive, e dice grazie', async () => {
  const p = await apri(GIARDINO, { foglio: () => ({ success: true, dedica: true, ricevuta: true }) });
  try {
    const foto = await scegliImmagine(p.page);
    await p.page.fill('#dedica-nome', 'Nonna Lina');
    await p.page.fill('#dedica-testo', 'Ti pensiamo ogni giorno');
    await p.page.fill('#dedica-mittente', 'Carla');
    await p.page.fill('#dedica-posta', 'carla@example.org');
    await p.page.check('#dedica-consenso');
    await p.page.click('#modulo-dedica .invia');
    const esito = await esitoDi(p.page, '#modulo-dedica');
    const c = p.allo[0].campi;
    assert.deepStrictEqual([c.tipo, c.ricordo, c.dedica, c.immagine, c.nome, c.email, c.consenso, c._sito, c._js],
      ['dedica', 'Nonna Lina', 'Ti pensiamo ogni giorno', foto, 'Carla', 'carla@example.org', 'si', ORIGINE, '1']);
    assert.ok(esito.startsWith('Grazie. La dedica per Nonna Lina è arrivata') && esito.includes('collegamento per toglierla') && esito.includes('posta indesiderata'), esito);
  } finally { await p.chiudi(); }
});

/* ---- dopo la dedica, l'invito alle notizie (Dacia ed Elias, 4.11): sotto il ringraziamento, nella stessa finestra, con l'email
        appena scritta; parte solo con «Sì, iscrivimi», «Chiudi» chiude e basta. Compare una volta sola per visita, mai prima
        della dedica, mai se la dedica non è partita. La dedica parte senza niente delle notizie ---- */

const INVITO = '#modulo-invito';
const RIGA_INVITO = 'Se vuoi, possiamo raccontarti ogni tanto che cosa fa la Fondazione: i progetti che nascono, gli incontri, il giardino che cresce.';
const GRAZIE_NOTIZIE = 'Grazie. Ti abbiamo mandato un’email: aprila e tocca «Confermo». Le notizie arrivano solo dopo la conferma.' +
  ' Se non la vedi entro qualche minuto, guarda nella posta indesiderata e aggiungi segreteria@larosadoro.org ai tuoi contatti.';
const RISPOSTE = i => (i.campi.tipo === 'dedica' ? { success: true, dedica: true, ricevuta: true } : { success: true, conferma: true, iscrizione: true });

async function mandaDedica(page, nome = 'Nonna Lina', posta = 'carla@example.org') {
  await scegliImmagine(page);
  await page.fill('#dedica-nome', nome);
  await page.fill('#dedica-mittente', 'Carla');
  await page.fill('#dedica-posta', posta);
  await page.check('#dedica-consenso');
  await page.click('#modulo-dedica .invia');
  return esitoDi(page, '#modulo-dedica');
}

/* il «Chiudi» che si vede nella finestra della dedica: uno solo */
async function chiudiLaDedica(page) {
  const chiudi = page.locator('#velo-dedica .chiudi-dialogo:visible');
  assert.strictEqual(await chiudi.count(), 1, 'nella finestra si vedono ' + (await chiudi.count()) + ' pulsanti «Chiudi»');
  await chiudi.click();
  assert.ok(await page.locator('#velo-dedica').isHidden(), '«Chiudi» non chiude la finestra');
}

controllo('dopo la dedica compare l’invito alle notizie con l’email già scritta, e l’iscrizione parte solo con «Sì, iscrivimi»', async () => {
  const p = await apri(GIARDINO, { foglio: RISPOSTE });
  try {
    await scegliImmagine(p.page);
    assert.ok(await p.page.locator(INVITO).isHidden(), 'l’invito si vede prima della dedica');
    await p.page.click('#velo-dedica .chiudi-dialogo:visible');
    const esito = await mandaDedica(p.page);
    assert.ok(esito.startsWith('Grazie. La dedica per Nonna Lina è arrivata'), esito);
    assert.strictEqual(p.allo.length, 1);
    assert.ok(!('notizie' in p.allo[0].campi) && p.allo[0].campi.tipo === 'dedica', 'la dedica porta con sé qualcosa delle notizie');
    await p.page.locator(INVITO).waitFor({ state: 'visible', timeout: 2000 });
    const testo = (await p.page.locator(INVITO + ' .campi').textContent()).replace(/\s+/g, ' ');
    assert.ok(testo.includes(RIGA_INVITO), testo);
    assert.ok(testo.includes(CONSENSO_TESTO), 'manca la frase del consenso: ' + testo);
    assert.strictEqual(await p.page.inputValue('#invito-posta'), 'carla@example.org', 'l’email non è già scritta');
    assert.strictEqual((await p.page.textContent(INVITO + ' .invia')).trim(), 'Sì, iscrivimi');
    assert.ok(await p.page.locator('#modulo-dedica .righe.dopo').isHidden(), 'due «Chiudi»: quello della dedica doveva lasciare il posto all’invito');
    await p.page.waitForTimeout(300);
    assert.strictEqual(p.allo.length, 1, 'le notizie sono partite senza il tocco');
    await p.page.click(INVITO + ' .invia');
    assert.strictEqual(await esitoDi(p.page, INVITO), GRAZIE_NOTIZIE);
    const c = p.allo[1].campi;
    assert.deepStrictEqual([c.tipo, c.notizie, c.email, c.consenso, c.pagina, c._sito, c._js, c.sito_web],
      ['notizie', 'si', 'carla@example.org', CONSENSO, 'in-memoria/giardino-dei-ricordi/dopo-la-dedica', ORIGINE, '1', '']);
    assert.ok(/^\d+$/.test(c._tempo), c._tempo);
    assert.ok(await p.page.locator(INVITO + ' .campi').isHidden());
    await chiudiLaDedica(p.page);
    // una seconda dedica: l'invito non torna, la persona ha già risposto
    await mandaDedica(p.page, 'Zio Piero');
    await p.page.waitForTimeout(300);
    assert.ok(await p.page.locator(INVITO).isHidden(), 'l’invito torna dopo che la persona si è già iscritta');
    assert.strictEqual(p.allo.length, 3);
    await chiudiLaDedica(p.page);
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

controllo('chi non vuole le notizie tocca «Chiudi» e non parte niente; l’invito non torna alla dedica dopo, e si può cambiare l’email', async () => {
  const p = await apri(GIARDINO, { foglio: RISPOSTE });
  try {
    await mandaDedica(p.page);
    await p.page.locator(INVITO).waitFor({ state: 'visible', timeout: 2000 });
    await chiudiLaDedica(p.page);
    await p.page.waitForTimeout(300);
    assert.strictEqual(p.allo.length, 1, 'chiudendo è partito qualcosa');
    await mandaDedica(p.page, 'Zio Piero');
    await p.page.waitForTimeout(300);
    assert.ok(await p.page.locator(INVITO).isHidden(), 'l’invito torna dopo un «Chiudi»: diventa insistente');
    await chiudiLaDedica(p.page);
    assert.strictEqual(p.allo.length, 2);
  } finally { await p.chiudi(); }
  const q = await apri(GIARDINO, { foglio: RISPOSTE });
  try {
    await mandaDedica(q.page);
    await q.page.locator(INVITO).waitFor({ state: 'visible', timeout: 2000 });
    await q.page.fill('#invito-posta', 'altra@example.org');
    await q.page.click(INVITO + ' .invia');
    await esitoDi(q.page, INVITO);
    assert.strictEqual(q.allo[1].campi.email, 'altra@example.org');
  } finally { await q.chiudi(); }
});

controllo('se la dedica non parte, l’invito alle notizie non compare', async () => {
  for (const foglio of [() => null, () => ({ success: false, error: 'email', dedica: true })]) {
    const p = await apri(GIARDINO, { foglio });
    try {
      await mandaDedica(p.page);
      await p.page.waitForTimeout(300);
      assert.ok(await p.page.locator(INVITO).isHidden(), 'l’invito compare anche se la dedica non è partita');
    } finally { await p.chiudi(); }
  }
});

controllo('sul telefono la dedica con l’invito sta nello schermo, il testo è ad almeno 17 px e «Sì, iscrivimi» si raggiunge', async () => {
  for (const schermo of [{ width: 320, height: 640 }, { width: 390, height: 844 }]) {
    const p = await apri(GIARDINO, { schermo, foglio: RISPOSTE });
    try {
      await mandaDedica(p.page);
      await p.page.locator(INVITO).waitFor({ state: 'visible', timeout: 2000 });
      const m = await p.page.evaluate(() => {
        const d = document.getElementById('modulo-dedica').getBoundingClientRect(), i = document.getElementById('modulo-invito').getBoundingClientRect();
        const corpi = Array.prototype.map.call(document.querySelectorAll('#modulo-invito .campi p, #invito-posta'), e => parseFloat(getComputedStyle(e).fontSize));
        return { sinistra: Math.min(d.left, i.left), destra: Math.max(d.right, i.right), attaccati: Math.abs(i.top - d.bottom) < 2,
                 largo: document.documentElement.scrollWidth, corpi };
      });
      const w = schermo.width + ' px: ';
      assert.ok(m.sinistra >= 0 && m.destra <= schermo.width, w + 'la finestra esce dallo schermo');
      assert.ok(m.attaccati, w + 'il ringraziamento e l’invito non stanno insieme, come un foglio solo');
      assert.ok(m.largo <= schermo.width, w + 'la pagina si allarga a ' + m.largo);
      assert.ok(m.corpi.length >= 3 && m.corpi.every(c => c >= 17), w + 'testo sotto i 17 px: ' + m.corpi.join(', '));
      await p.page.locator(INVITO + ' .invia').click();
      await esitoDi(p.page, INVITO);
      assert.strictEqual(p.allo.length, 2, w + 'l’iscrizione non è partita');
    } finally { await p.chiudi(); }
  }
});

controllo('con Turnstile l’invito dopo la dedica manda una sua risposta di Turnstile, e la regola di sicurezza non blocca niente', async () => {
  const p = await apri(GIARDINO, { turnstile: 'passa', foglio: RISPOSTE });
  try {
    await mandaDedica(p.page);
    await p.page.locator(INVITO).waitFor({ state: 'visible', timeout: 2000 });
    await p.page.click(INVITO + ' .invia');
    await esitoDi(p.page, INVITO);
    assert.deepStrictEqual(p.allo.map(a => [a.campi.tipo, a.campi._turnstile]), [['dedica', 'risposta-1-0'], ['notizie', 'risposta-2-0']]);
    assert.deepStrictEqual(await p.violazioni(), []);
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

controllo('senza il consenso alla pubblicazione la dedica non parte, e la casella si segna', async () => {
  const p = await apri(GIARDINO);
  try {
    await scegliImmagine(p.page);
    await p.page.fill('#dedica-nome', 'Nonna Lina');
    await p.page.fill('#dedica-mittente', 'Carla');
    await p.page.fill('#dedica-posta', 'carla@example.org');
    await p.page.click('#modulo-dedica .invia');
    await p.page.waitForTimeout(300);
    assert.strictEqual(p.allo.length, 0, 'la dedica è partita senza consenso');
    const riga = p.page.locator('#dedica-consenso').locator('xpath=..');
    assert.ok((await riga.getAttribute('class') || '').includes('manca'), 'la casella del consenso non è segnata');
  } finally { await p.chiudi(); }
});

controllo('il giardino mostra i nomi di dediche.json con la loro immagine, e li scrive come testo', async () => {
  const p = await apri(GIARDINO, { dediche: { versione: 'x', dediche: [] } });
  const foto = await p.page.locator('.pianta button[data-foto]').first().getAttribute('data-foto');
  await p.chiudi();
  const strano = '<img src=x onerror=alert(1)>';
  const q = await apri(GIARDINO, { dediche: { versione: 'x', dediche: [
    { nome: 'Nonna Lina', dedica: 'Ti pensiamo', immagine: foto },
    { nome: strano, dedica: '<b>ciao</b>', immagine: 'nessuna' }] } });
  try {
    await q.page.locator('#nel-giardino').waitFor({ state: 'visible', timeout: 5000 });
    const figure = q.page.locator('#nel-giardino .dedica');
    assert.strictEqual(await figure.count(), 2);
    assert.strictEqual(await figure.nth(0).locator('strong').textContent(), 'Nonna Lina');
    assert.strictEqual(await figure.nth(0).locator('.riga').textContent(), 'Ti pensiamo');
    assert.strictEqual(await figure.nth(0).locator('img').count(), 1, 'manca l’immagine scelta');
    assert.strictEqual(await figure.nth(1).locator('strong').textContent(), strano);
    assert.strictEqual(await figure.nth(1).locator('img, b').count(), 0, 'una dedica è diventata codice della pagina');
    assert.deepStrictEqual(q.avvisi, []);
  } finally { await q.chiudi(); }
});

/* le dediche di prova per la griglia e la pergamena (Dacia, 3.11): una lunga su più righe, una corta, una senza parole,
   un nome lunghissimo */
const LUNGA = 'Grazie per il tuo cuore grande, per il tuo esempio e coraggio, per le tue spalle forti\nE come diceva la nostra canzone\nTi voglio bene';
async function conDediche(schermo) {
  const p = await apri(GIARDINO, { dediche: { versione: 'x', dediche: [] } });
  const foto = await p.page.locator('.pianta button[data-foto]').evaluateAll(b => b.slice(0, 3).map(x => x.getAttribute('data-foto')));
  await p.chiudi();
  const q = await apri(GIARDINO, { schermo, dediche: { versione: 'x', dediche: [
    { nome: 'Stefano', dedica: LUNGA, immagine: foto[0] },
    { nome: 'Renato', dedica: 'Grazie', immagine: foto[1] },
    { nome: 'Pippo', dedica: '', immagine: foto[2] },
    { nome: 'Nonna Clelia e nonno Giuseppe, con tutto il nostro amore di sempre', dedica: 'Ci mancate', immagine: foto[0] }] } });
  await q.page.locator('#nel-giardino .dedica').first().waitFor({ state: 'visible', timeout: 5000 });
  q.foto = foto;
  return q;
}

controllo('sotto ogni immagine il nome e la prima riga della dedica, con i puntini e senza virgolette, e le dediche hanno tutte la stessa altezza (Dacia, 3.11)', async () => {
  for (const schermo of [{ width: 1280, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
    const p = await conDediche(schermo);
    try {
      const m = await p.page.evaluate(() => {
        const figure = [...document.querySelectorAll('#nel-giardino .dedica')];
        const riga = figure[0].querySelector('.riga'), dentro = riga;
        const corpo = el => parseFloat(getComputedStyle(el).fontSize);
        return {
          alte: figure.map(f => Math.round(f.getBoundingClientRect().height)),
          riga: riga ? riga.getBoundingClientRect().height : 0,
          corpoRiga: riga ? corpo(riga) : 0,
          corpoNome: corpo(figure[0].querySelector('strong')),
          nome: figure[3].querySelector('strong').getBoundingClientRect().height,
          puntini: dentro ? getComputedStyle(dentro).textOverflow : '',
          tagliata: dentro ? dentro.scrollWidth > dentro.clientWidth : false,
          prima: riga ? getComputedStyle(riga, '::before').content : '',
          dopo: riga ? getComputedStyle(riga, '::after').content : '',
          largo: document.documentElement.scrollWidth
        };
      });
      const w = schermo.width + ' px: ';
      assert.ok(Math.max(...m.alte) - Math.min(...m.alte) <= 1, w + 'le dediche hanno altezze diverse ' + m.alte.join(', '));
      assert.ok(m.riga > 0 && m.riga <= m.corpoRiga * 1.6, w + 'la dedica non sta in una riga (' + m.riga + ' px)');
      assert.ok(m.nome <= m.corpoNome * 1.6, w + 'il nome lungo non sta in una riga (' + m.nome + ' px)');
      assert.strictEqual(m.puntini, 'ellipsis', w + 'la riga tagliata non finisce con i puntini');
      assert.ok(m.tagliata, w + 'la dedica lunga non è tagliata');
      assert.deepStrictEqual([m.prima, m.dopo], ['none', 'none'], w + 'virgolette intorno alla prima riga: dopo i puntini la » resta staccata');
      assert.ok(m.corpoRiga >= 17 && m.corpoNome >= 17, w + 'testo sotto i 17 px');
      assert.ok(m.largo <= schermo.width, w + 'la pagina si allarga a ' + m.largo);
      assert.deepStrictEqual(p.errori, []);
    } finally { await p.chiudi(); }
  }
});

/* tocca un punto della pagina, come una persona: al centro di ciò che si vede (la dedica intera si tocca, anche sopra la foto) */
async function tocca(page, dove) {
  await dove.scrollIntoViewIfNeeded();
  const r = await dove.boundingBox();
  await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
}

controllo('toccando una dedica si apre la pergamena con l’immagine, il nome e la dedica intera; si chiude con «Chiudi», con Esc e toccando fuori', async () => {
  const p = await conDediche();
  try {
    const pergamena = p.page.locator('#velo-pergamena');
    assert.ok(await pergamena.isHidden(), 'la pergamena è aperta prima di toccare una dedica');
    await tocca(p.page, p.page.locator('#nel-giardino .dedica').nth(0).locator('img'));
    await pergamena.waitFor({ state: 'visible', timeout: 2000 });
    assert.strictEqual(await pergamena.getAttribute('role'), 'dialog');
    assert.strictEqual(await pergamena.getAttribute('aria-modal'), 'true');
    assert.strictEqual(await p.page.locator('#pergamena-nome').textContent(), 'Stefano');
    const parole = p.page.locator('#velo-pergamena .pergamena-dedica');
    assert.strictEqual(await parole.textContent(), '«' + LUNGA + '»');
    assert.strictEqual(await parole.evaluate(e => getComputedStyle(e).whiteSpace), 'pre-line', 'gli a capo di chi scrive si perdono');
    const src = await p.page.locator('.pianta button[data-foto="' + p.foto[0] + '"]').evaluate(b => b.closest('.pianta').querySelector('img').src);
    assert.strictEqual(await p.page.locator('#velo-pergamena img').evaluate(i => i.src), src, 'non è l’immagine scelta');
    assert.strictEqual(await p.page.evaluate(() => document.activeElement && document.activeElement.textContent), 'Chiudi');
    await p.page.keyboard.press('Tab');
    assert.strictEqual(await p.page.evaluate(() => document.activeElement && document.activeElement.textContent), 'Chiudi', 'il tasto Tab esce dalla pergamena');
    await p.page.keyboard.press('Escape');
    assert.ok(await pergamena.isHidden(), 'Esc non chiude la pergamena');
    assert.strictEqual(await p.page.evaluate(() => document.activeElement && document.activeElement.closest('.dedica') &&
      document.activeElement.closest('.dedica').querySelector('strong').textContent), 'Stefano', 'chiusa la pergamena, non si torna alla dedica');
    // con la tastiera, e senza parole: solo il nome
    await p.page.locator('#nel-giardino .dedica').nth(2).locator('button').focus();
    await p.page.keyboard.press('Enter');
    await pergamena.waitFor({ state: 'visible', timeout: 2000 });
    assert.strictEqual(await p.page.locator('#pergamena-nome').textContent(), 'Pippo');
    assert.ok(await parole.isHidden(), 'senza dedica la pergamena mostra le virgolette vuote');
    await p.page.locator('#velo-pergamena button.chiudi-dialogo').click();
    assert.ok(await pergamena.isHidden(), '«Chiudi» non chiude la pergamena');
    await tocca(p.page, p.page.locator('#nel-giardino .dedica').nth(1).locator('strong'));
    await pergamena.waitFor({ state: 'visible', timeout: 2000 });
    assert.strictEqual(await parole.textContent(), '«Grazie»');
    await p.page.mouse.click(4, 4);
    assert.ok(await pergamena.isHidden(), 'toccando fuori la pergamena resta aperta');
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

controllo('nella pergamena il nome e la dedica restano testo, e sul telefono la pergamena sta nello schermo', async () => {
  const strano = '<img src=x onerror=alert(1)>';
  for (const schermo of [{ width: 320, height: 640 }, { width: 390, height: 844 }]) {
    const p = await apri(GIARDINO, { schermo, dediche: { versione: 'x', dediche: [{ nome: strano, dedica: '<b>ciao</b> ' + LUNGA.repeat(3), immagine: 'nessuna' }] } });
    try {
      await p.page.locator('#nel-giardino .dedica').first().waitFor({ state: 'visible', timeout: 5000 });
      await p.page.locator('#nel-giardino .dedica button').first().click();
      await p.page.locator('#velo-pergamena').waitFor({ state: 'visible', timeout: 2000 });
      assert.strictEqual(await p.page.locator('#pergamena-nome').textContent(), strano);
      assert.strictEqual(await p.page.locator('#velo-pergamena .pergamena-dedica b, #pergamena-nome img').count(), 0, 'la dedica è diventata codice');
      const m = await p.page.evaluate(() => {
        const r = document.querySelector('#velo-pergamena .pergamena').getBoundingClientRect();
        return { sinistra: r.left, destra: r.right, corpo: parseFloat(getComputedStyle(document.querySelector('#velo-pergamena .pergamena-dedica')).fontSize),
                 largo: document.documentElement.scrollWidth };
      });
      const w = schermo.width + ' px: ';
      assert.ok(m.sinistra >= 0 && m.destra <= schermo.width, w + 'la pergamena esce dallo schermo');
      assert.ok(m.corpo >= 17, w + 'la dedica nella pergamena è sotto i 17 px');
      assert.ok(m.largo <= schermo.width, w + 'la pagina si allarga a ' + m.largo);
      await p.page.locator('#velo-pergamena button.chiudi-dialogo').click();   // anche una dedica lunghissima lascia raggiungere «Chiudi»
      assert.ok(await p.page.locator('#velo-pergamena').isHidden());
      assert.deepStrictEqual(p.avvisi, []);
    } finally { await p.chiudi(); }
  }
});

controllo('senza dediche il giardino non mostra la sezione dei nomi', async () => {
  for (const dediche of [{ versione: 'x', dediche: [] }, null]) {
    const p = await apri(GIARDINO, { dediche });
    try {
      await p.page.waitForTimeout(300);
      assert.ok(await p.page.locator('#nel-giardino').isHidden(), JSON.stringify(dediche));
    } finally { await p.chiudi(); }
  }
});

/* i collegamenti delle email portano a contatti/?conferma=… (dal 31.10, più corti) e quelli già partiti a
   contatti/index.html?conferma=…: tutti e due devono aprire il riquadro */
for (const [percorso, parametro, riquadro, testo] of [
  ['contatti/', 'conferma', '#conferma-notizie', 'Grazie, il tuo indirizzo è confermato.'],
  ['contatti/', 'cancella', '#cancella-notizie', 'Fatto: non ti manderemo più le notizie.'],
  ['in-memoria/giardino-dei-ricordi/', 'togli', '#togli-dedica', 'Fatto: la dedica esce dal giardino entro un’ora.'],
  ['contatti/index.html', 'conferma', '#conferma-notizie', 'Grazie, il tuo indirizzo è confermato.'],
  ['contatti/index.html', 'cancella', '#cancella-notizie', 'Fatto: non ti manderemo più le notizie.'],
  [GIARDINO, 'togli', '#togli-dedica', 'Fatto: la dedica esce dal giardino entro un’ora.']]) {
  controllo('con ' + percorso + '?' + parametro + '= la pagina mostra il riquadro e chiede allo script solo quando si tocca il pulsante', async () => {
    const p = await apri(percorso + '?' + parametro + '=abc123.firma_-9', { foglio: () => ({ success: true, testo }) });
    try {
      await p.page.locator(riquadro).waitFor({ state: 'visible', timeout: 5000 });
      await p.page.waitForTimeout(300);
      assert.strictEqual(p.allo.length, 0, 'lo script è stato chiamato prima del tocco: un programma che controlla la posta lo farebbe al posto della persona');
      await p.page.click(riquadro + ' .invia');
      assert.strictEqual(await esitoDi(p.page, riquadro), testo);
      assert.strictEqual(p.allo.length, 1);
      assert.strictEqual(p.allo[0].metodo, 'GET');
      assert.strictEqual(new URL(p.allo[0].indirizzo).searchParams.get(parametro), 'abc123.firma_-9');
      assert.ok(await p.page.locator(riquadro + ' .invia').isHidden(), 'fatto, il pulsante doveva sparire');
    } finally { await p.chiudi(); }
  });
}

controllo('senza ?conferma=, ?cancella= o ?togli= i riquadri restano nascosti', async () => {
  for (const [percorso, riquadri] of [['contatti/index.html', ['#conferma-notizie', '#cancella-notizie']], [GIARDINO, ['#togli-dedica']]]) {
    const p = await apri(percorso);
    try {
      for (const r of riquadri) assert.ok(await p.page.locator(r).isHidden(), r);
    } finally { await p.chiudi(); }
  }
});

/* ---- la protezione dai programmi automatici (Elias, 22.10) ---- */

const PAGINE_CON_MODULI = [['contatti/index.html', ['#modulo-contatti', '#modulo-notizie']], [GIARDINO, ['#modulo-dedica', '#modulo-invito', '#modulo-notizie']],
  ['progetti/presenta-il-tuo-progetto/index.html', ['#modulo-progetto', '#modulo-notizie']], ['index.html', ['#modulo-notizie']],
  ['dona/grazie/index.html', ['#modulo-notizie']]];

controllo('ogni modulo ha il campo trappola «sito_web»: vuoto, invisibile, fuori dal giro del tasto Tab', async () => {
  for (const [percorso, moduli] of PAGINE_CON_MODULI) {
    const p = await apri(percorso, { dediche: { versione: 'x', dediche: [] } });
    try {
      for (const m of moduli) {
        const trappola = p.page.locator(m + ' input[name="sito_web"]');
        assert.strictEqual(await trappola.count(), 1, percorso + ' ' + m + ': manca la trappola');
        assert.strictEqual(await trappola.getAttribute('type'), 'text', 'una trappola «hidden» i programmi la saltano');
        assert.ok(await trappola.isHidden(), percorso + ' ' + m + ': la trappola si vede');
        assert.strictEqual(await trappola.getAttribute('tabindex'), '-1');
        assert.strictEqual(await trappola.getAttribute('autocomplete'), 'off');
        assert.strictEqual(await trappola.inputValue(), '');
      }
    } finally { await p.chiudi(); }
  }
});

/* ---- la regola di sicurezza dentro le pagine (Content-Security-Policy, revisione del 27.10): il browser carica script,
        stili, immagini e caratteri solo dal sito, Turnstile solo da Cloudflare, e i moduli parlano solo con lo script del
        foglio. Qui si guarda che la regola ci sia in ogni pagina e che niente di quello che le pagine fanno la violi ---- */

controllo('la regola di sicurezza (CSP) e quella sul referrer stanno in ogni pagina, e moduli, Turnstile, dediche, musica e pagina «non trovata» non le violano', async () => {
  const prove = [
    ['contatti/index.html', { turnstile: 'passa', foglio: () => ({ success: true }) }, async p => {
      await p.page.fill('#mc-nome', 'Carla');
      await p.page.fill('#mc-posta', 'carla@example.org');
      await p.page.fill('#mc-messaggio', 'Un messaggio');
      await p.page.click('#modulo-contatti .invia');
      await esitoDi(p.page, '#modulo-contatti');
      assert.strictEqual(p.allo.length, 1, 'il messaggio non è partito');
      assert.strictEqual(p.cloudflare.length, 1, 'Turnstile non si è caricato');
    }],
    [GIARDINO, { dediche: { versione: 'x', dediche: [{ nome: 'Nonna Lina', dedica: 'Ti pensiamo', immagine: 'La rosa bianca' }] } }, async p => {
      await p.page.locator('#nel-giardino .dedica').first().waitFor({ state: 'visible', timeout: 5000 });
      await p.page.locator('#nel-giardino .dedica button').first().click();        /* la pergamena, con l’immagine */
      await p.page.locator('#velo-pergamena img').waitFor({ state: 'visible', timeout: 2000 });
      await p.page.waitForLoadState('networkidle');
    }],
    ['in-memoria/fondo-di-memoria/index.html', {}, async p => {
      await p.page.waitForLoadState('networkidle');            /* il valzer di Chopin: la musica deve poter partire */
    }],
    ['404.html', {}, async p => {
      assert.strictEqual(await p.page.evaluate(() => document.querySelector('base') && document.querySelector('base').href), ORIGINE,
        'la pagina «non trovata» non ha scritto la sua base: lo script dentro la pagina è bloccato');
    }]
  ];
  for (const [percorso, opzioni, prova] of prove) {
    const p = await apri(percorso, opzioni);
    try {
      const regole = await p.page.evaluate(() => ({
        csp: (document.querySelector('meta[http-equiv="Content-Security-Policy"]') || {}).content || '',
        referrer: (document.querySelector('meta[name="referrer"]') || {}).content || ''
      }));
      assert.ok(regole.csp.includes("default-src 'self'"), percorso + ': manca la regola di sicurezza nella pagina');
      assert.strictEqual(regole.referrer, 'strict-origin-when-cross-origin', percorso + ': manca la regola sul referrer');
      await prova(p);
      assert.deepStrictEqual(await p.violazioni(), [], percorso + ': la regola di sicurezza ha bloccato qualcosa');
      assert.deepStrictEqual(p.errori, [], percorso + ': errori del JavaScript');
    } finally { await p.chiudi(); }
  }
});

/* ---- la musica su scelta: il valzer di Chopin nel fondo di memoria e nel giardino, il Lacrimosa di Mozart nei Funerali
        (Dacia ed Elias, 1.11). Ogni pulsante dice la sua musica, parte solo col tocco, e quando si ferma torna a dire la sua ---- */

controllo('la musica: ogni pagina ha il suo pulsante, che parte al tocco, si ferma e torna a dire la sua musica', async () => {
  const pagine = [
    ['in-memoria/fondo-di-memoria/index.html', 'audio/valzer-op-69.mp3', 'Ascolta · Chopin, valzer op. 69'],
    ['in-memoria/funerali/index.html', 'audio/lacrimosa.mp3', 'Ascolta · Mozart, Lacrimosa']
  ];
  for (const [percorso, file, etichetta] of pagine) {
    const p = await apri(percorso);
    try {
      const b = p.page.locator('.ascolta[data-audio]');
      assert.strictEqual(await b.count(), 1, percorso + ': il pulsante della musica non c’è');
      assert.ok((await b.getAttribute('data-audio')).endsWith(file), percorso + ': il pulsante non porta a ' + file);
      await b.waitFor({ state: 'visible', timeout: 5000 });
      assert.strictEqual((await b.textContent()).trim(), etichetta, percorso + ': il pulsante non dice la sua musica');
      await b.click();
      await p.page.waitForFunction(() => document.querySelector('.ascolta').classList.contains('suona'), null, { timeout: 5000 });
      assert.strictEqual((await b.textContent()).trim(), 'Ferma la musica', percorso + ': mentre suona il pulsante non dice «Ferma la musica»');
      await b.click();
      assert.strictEqual((await b.textContent()).trim(), etichetta, percorso + ': fermata la musica, il pulsante non torna a dire la sua');
      assert.deepStrictEqual(await p.violazioni(), [], percorso + ': la regola di sicurezza ha bloccato la musica');
      assert.deepStrictEqual(p.errori, [], percorso + ': errori del JavaScript');
    } finally { await p.chiudi(); }
  }
});

controllo('con Turnstile: nessuna pagina chiama Cloudflare finché nessuno scrive in un modulo', async () => {
  for (const [percorso] of PAGINE_CON_MODULI) {
    const p = await apri(percorso, { turnstile: 'passa', dediche: { versione: 'x', dediche: [] } });
    try {
      await p.page.waitForLoadState('networkidle');
      assert.deepStrictEqual(p.cloudflare, [], percorso);
      assert.deepStrictEqual(p.errori, [], percorso);
    } finally { await p.chiudi(); }
  }
});

controllo('con Turnstile: Turnstile si carica quando si comincia a scrivere, e il messaggio parte con la sua risposta', async () => {
  const p = await apri('contatti/index.html', { turnstile: 'passa', foglio: () => ({ success: true }) });
  try {
    await p.page.fill('#mc-nome', 'Carla');
    await p.page.waitForFunction(() => window.chiaviTurnstile && window.chiaviTurnstile().length === 1);
    assert.strictEqual(p.cloudflare.length, 1, 'Turnstile caricato ' + p.cloudflare.length + ' volte');
    assert.ok(p.cloudflare[0].includes('render=explicit'), p.cloudflare[0]);
    assert.deepStrictEqual(await p.page.evaluate(() => window.chiaviTurnstile()), [CHIAVE]);
    await p.page.fill('#mc-posta', 'carla@example.org');
    await p.page.fill('#mc-messaggio', 'Un messaggio');
    await p.page.click('#modulo-contatti .invia');
    assert.ok((await esitoDi(p.page, '#modulo-contatti')).startsWith('Grazie, il tuo messaggio è arrivato.'));
    assert.strictEqual(p.allo[0].campi._turnstile, 'risposta-1-0');
    assert.ok(/^\d+$/.test(p.allo[0].campi._tempo));
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

controllo('con Turnstile: una seconda dedica parte con una risposta nuova, perché ognuna vale una volta sola', async () => {
  const p = await apri(GIARDINO, { turnstile: 'passa', foglio: () => ({ success: true, dedica: true, ricevuta: true }) });
  try {
    for (const nome of ['Nonna Lina', 'Zio Piero']) {
      await scegliImmagine(p.page);
      await p.page.fill('#dedica-nome', nome);
      await p.page.fill('#dedica-mittente', 'Carla');
      await p.page.fill('#dedica-posta', 'carla@example.org');
      await p.page.check('#dedica-consenso');
      await p.page.click('#modulo-dedica .invia');
      await esitoDi(p.page, '#modulo-dedica');
      await chiudiLaDedica(p.page);
    }
    assert.deepStrictEqual(p.allo.map(a => a.campi._turnstile), ['risposta-1-0', 'risposta-1-1']);
  } finally { await p.chiudi(); }
});

const AVVISO_POSTA = 'Il controllo anti-spam non si è caricato nel tuo browser. Puoi mandarci lo stesso il messaggio dalla tua email.';

/* il riquadro per mandare il messaggio dalla propria posta: il testo, i due collegamenti e che cosa c’è dentro */
async function dallaPosta(page, dove) {
  const riquadro = page.locator(dove + ' .dalla-posta');
  await riquadro.waitFor({ state: 'visible', timeout: 15000 });
  const gmail = page.locator(dove + ' .dalla-posta a', { hasText: 'Scrivi con Gmail' });
  const posta = page.locator(dove + ' .dalla-posta a', { hasText: 'Apri il tuo programma di posta' });
  const g = new URL(await gmail.getAttribute('href'));
  const m = await posta.getAttribute('href');
  const campiPosta = new URLSearchParams(m.slice(m.indexOf('?') + 1).replace(/\+/g, '%2B'));
  return {
    testo: (await riquadro.locator('p').first().textContent()).replace(/\s+/g, ' ').trim(),
    gmail: { href: g.href, host: g.host, view: g.searchParams.get('view'), a: g.searchParams.get('to'), oggetto: g.searchParams.get('su'),
             corpo: g.searchParams.get('body'), target: await gmail.getAttribute('target') },
    posta: { href: m, a: m.slice(7, m.indexOf('?')), oggetto: campiPosta.get('subject'), corpo: campiPosta.get('body') },
    copia: page.locator(dove + ' .dalla-posta button', { hasText: 'Copia il messaggio' })
  };
}

controllo('con Turnstile: se Turnstile non si carica, il messaggio non parte e compare il riquadro per mandarlo dalla propria posta', async () => {
  const p = await apri('contatti/index.html', { turnstile: 'non si carica', foglio: () => ({ success: true }) });
  try {
    await p.page.fill('#mc-nome', 'Carla Rossi');
    await p.page.fill('#mc-posta', 'carla@example.org');
    await p.page.fill('#mc-oggetto', 'lascito');
    await p.page.fill('#mc-messaggio', 'Vorrei sapere come funziona.');
    await p.page.click('#modulo-contatti .invia');
    const r = await dallaPosta(p.page, '#modulo-contatti');
    assert.strictEqual(r.testo, AVVISO_POSTA);
    assert.strictEqual(p.allo.length, 0, 'senza Turnstile il modulo non deve partire');
    assert.deepStrictEqual([r.gmail.host, r.gmail.view, r.gmail.a, r.gmail.oggetto, r.gmail.target],
      ['mail.google.com', 'cm', SEGRETERIA, 'lascito', '_blank']);
    assert.ok(r.gmail.corpo.includes('Vorrei sapere come funziona.') && r.gmail.corpo.includes('Carla Rossi'), r.gmail.corpo);
    assert.deepStrictEqual([r.posta.a, r.posta.oggetto, r.posta.corpo], [SEGRETERIA, 'lascito', r.gmail.corpo]);
    await r.copia.click();
    await p.page.waitForFunction(() => /Copiato/.test(document.querySelector('#modulo-contatti .dalla-posta button').textContent));
    const copiato = await p.page.evaluate(() => navigator.clipboard.readText());
    assert.strictEqual(copiato, 'A: ' + SEGRETERIA + '\nOggetto: lascito\n\n' + r.gmail.corpo);
    assert.strictEqual(await p.page.inputValue('#mc-messaggio'), 'Vorrei sapere come funziona.', 'il testo resta nel modulo');
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

controllo('con un messaggio lunghissimo i pulsanti della posta lo accorciano, e «Copia il messaggio» lo copia intero', async () => {
  const p = await apri('contatti/index.html', { turnstile: 'non si carica' });
  const lungo = 'Una riga di prova, con parole accentate: perché sì. '.repeat(120).trim();
  try {
    await p.page.fill('#mc-nome', 'Carla');
    await p.page.fill('#mc-posta', 'carla@example.org');
    await p.page.fill('#mc-messaggio', lungo);
    await p.page.click('#modulo-contatti .invia');
    const r = await dallaPosta(p.page, '#modulo-contatti');
    assert.ok(r.gmail.href.length <= 2000 && r.posta.href.length <= 2000, 'collegamenti troppo lunghi: ' + r.gmail.href.length + ', ' + r.posta.href.length);
    assert.ok(r.gmail.corpo.includes('«Copia il messaggio»'), 'il testo accorciato deve dire dove trovarlo intero');
    await r.copia.click();
    await p.page.waitForFunction(() => /Copiato/.test(document.querySelector('#modulo-contatti .dalla-posta button').textContent));
    assert.ok((await p.page.evaluate(() => navigator.clipboard.readText())).includes(lungo), 'la copia deve avere il testo intero');
  } finally { await p.chiudi(); }
});

controllo('con Turnstile: anche la dedica, se Turnstile non si carica, si può mandare dalla propria posta', async () => {
  const p = await apri(GIARDINO, { turnstile: 'non si carica' });
  try {
    await scegliImmagine(p.page);
    await p.page.fill('#dedica-nome', 'Nonna Lina');
    await p.page.fill('#dedica-testo', 'Ti pensiamo ogni giorno');
    await p.page.fill('#dedica-mittente', 'Carla');
    await p.page.fill('#dedica-posta', 'carla@example.org');
    await p.page.check('#dedica-consenso');
    await p.page.click('#modulo-dedica .invia');
    const r = await dallaPosta(p.page, '#modulo-dedica');
    assert.strictEqual(p.allo.length, 0);
    assert.strictEqual(r.gmail.oggetto, 'Giardino dei ricordi — Nonna Lina');
    assert.ok(r.gmail.corpo.includes('In memoria di: Nonna Lina') && r.gmail.corpo.includes('Ti pensiamo ogni giorno'), r.gmail.corpo);
  } finally { await p.chiudi(); }
});

controllo('con Turnstile: il riquadro delle notizie e il modulo dei progetti mandano la risposta di Turnstile', async () => {
  const p = await apri('progetti/presenta-il-tuo-progetto/index.html', { turnstile: 'passa',
    foglio: i => (i.campi.tipo === 'notizie' ? { success: false, error: 'controllo', iscrizione: true } : { success: true, progetto: true }) });
  try {
    await p.page.fill('#mp-progetto', 'Orto in comune');
    await p.page.check('#mp-fase-1');
    await p.page.fill('#mp-descrizione', 'Un orto per il quartiere.');
    await p.page.fill('#mp-nome', 'Paolo');
    await p.page.fill('#mp-posta', 'paolo@example.org');
    await p.page.click('#modulo-progetto .invia');
    await esitoDi(p.page, '#modulo-progetto');
    await p.page.fill('#mn-posta', 'lettore@example.org');
    await p.page.click('#modulo-notizie .invia');
    const r = await dallaPosta(p.page, '#modulo-notizie');
    assert.deepStrictEqual(p.allo.map(a => [a.campi.tipo, a.campi._turnstile]), [['progetto', 'risposta-1-0'], ['notizie', 'risposta-2-0']]);
    assert.strictEqual(r.testo, AVVISO_POSTA, 'se lo script dice che manca Turnstile, compare lo stesso riquadro');
    assert.strictEqual(r.gmail.oggetto, 'Notizie della Fondazione');
    assert.ok(r.gmail.corpo.includes('lettore@example.org'), r.gmail.corpo);
  } finally { await p.chiudi(); }
});

controllo('aprendo le pagine con i moduli nessuna richiesta esce dal sito, e il JavaScript non dà errori', async () => {
  for (const percorso of ['index.html', 'contatti/index.html', GIARDINO, 'progetti/presenta-il-tuo-progetto/index.html', 'dona/index.html']) {
    const p = await apri(percorso, { dediche: { versione: 'x', dediche: [] } });
    try {
      await p.page.waitForLoadState('networkidle');
      assert.deepStrictEqual(p.fuori, [], percorso + ': richieste fuori dal sito');
      assert.deepStrictEqual(p.google, [], percorso + ': richieste a Google senza consenso');
      assert.deepStrictEqual(p.allo, [], percorso + ': lo script del foglio chiamato senza che nessuno abbia scritto');
      assert.deepStrictEqual(p.errori, [], percorso + ': errori del JavaScript');
    } finally { await p.chiudi(); }
  }
});


/* ---- i cookie di Google Analytics, solo con il consenso (Elias, 1.11.2026; linee guida del Garante, provv. 231 del 10.6.2021):
        un banner con «Accetta» e «Rifiuta» dello stesso peso, la X che vale come rifiuto, «Preferenze cookie» nel piede per
        cambiare idea; Google parte solo dopo «Accetta». Con il consenso si contano le azioni che contano per gli annunci:
        il messaggio dei Contatti, la conferma delle notizie, il progetto proposto, la donazione tornando da Stripe ---- */

const BANNER = '#consenso-cookie';
const MESE = 30 * 24 * 3600 * 1000;

function apriConGoogle(percorso, opzioni = {}) {
  return apri(percorso, Object.assign({ sito: conGoogle(), scelta: null }, opzioni));
}

/* quello che la pagina ha dato a Google: le righe di window.dataLayer, come liste */
function datiPerGoogle(page) {
  return page.evaluate(() => (window.dataLayer || []).map(riga =>
    JSON.parse(JSON.stringify(Array.prototype.slice.call(riga).map(x => (x instanceof Date ? 'data' : x))))));
}
async function eventiPerGoogle(page) {
  return (await datiPerGoogle(page)).filter(r => r[0] === 'event').map(r => r[1]);
}
function sceltaSalvata(page) {
  return page.evaluate(k => { const v = localStorage.getItem(k); return v ? JSON.parse(v).scelta : null; }, SCELTA);
}
const accetta = page => page.locator(BANNER + ' button', { hasText: 'Accetta' });
const rifiuta = page => page.locator(BANNER + ' button', { hasText: 'Rifiuta' });

controllo('Google: senza una scelta compare il banner, con «Accetta» e «Rifiuta» dello stesso peso, e Google non parte', async () => {
  const p = await apriConGoogle('index.html');
  try {
    await p.page.locator(BANNER).waitFor({ state: 'visible', timeout: 5000 });
    assert.strictEqual(await accetta(p.page).count(), 1, 'manca «Accetta»');
    assert.strictEqual(await rifiuta(p.page).count(), 1, 'manca «Rifiuta»');
    const peso = b => b.evaluate(e => {
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      return [e.className, s.backgroundColor, s.color, s.fontSize, s.fontWeight, s.padding, s.borderTopColor, Math.round(r.height)].join(' | ');
    });
    assert.strictEqual(await peso(accetta(p.page)), await peso(rifiuta(p.page)), '«Accetta» e «Rifiuta» devono avere lo stesso peso');
    assert.strictEqual(await p.page.locator(BANNER + ' button.chiudi-consenso').count(), 1, 'manca la X per chiudere');
    assert.ok(/cookie\/(index\.html)?$/.test(await p.page.getAttribute(BANNER + ' a.link', 'href')), 'manca il collegamento all’informativa sui cookie');
    const corpo = await p.page.locator(BANNER + ' p').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize));
    assert.ok(corpo >= 17, 'il testo del banner è sotto i 17 px: ' + corpo);
    await p.page.keyboard.press('Tab');
    assert.ok(await p.page.evaluate(() => !!document.activeElement.closest('#consenso-cookie')), 'con la tastiera il banner deve venire per primo');
    await p.page.waitForLoadState('networkidle');
    assert.deepStrictEqual(p.google, [], 'Google è partito senza il consenso');
    assert.strictEqual(await p.page.evaluate(() => typeof window.dataLayer), 'undefined', 'senza consenso la pagina prepara i dati per Google');
    assert.strictEqual(await p.page.evaluate(() => document.cookie), '', 'senza consenso ci sono cookie');
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

controllo('Google: «Rifiuta» e la X chiudono il banner, Google non parte e la scelta vale anche nelle altre pagine', async () => {
  for (const come of ['Rifiuta', 'la X']) {
    const p = await apriConGoogle('index.html');
    try {
      await p.page.locator(BANNER).waitFor({ state: 'visible', timeout: 5000 });
      await (come === 'la X' ? p.page.locator(BANNER + ' button.chiudi-consenso') : rifiuta(p.page)).click();
      assert.ok(await p.page.locator(BANNER).isHidden(), come + ': il banner resta');
      assert.strictEqual(await sceltaSalvata(p.page), 'no', come + ': la scelta non è ricordata come rifiuto');
      await p.page.goto(ORIGINE + 'lasciti/index.html');
      await p.page.waitForLoadState('networkidle');
      assert.ok(await p.page.locator(BANNER).isHidden(), come + ': il banner ricompare nella pagina dopo');
      assert.deepStrictEqual(p.google, [], come + ': Google è partito');
      assert.deepStrictEqual(p.errori, []);
    } finally { await p.chiudi(); }
  }
});

controllo('Google: «Accetta» fa partire Google solo adesso, senza i codici dei collegamenti delle email, e vale nelle altre pagine', async () => {
  const p = await apriConGoogle('contatti/index.html?conferma=abc123.firma_-9&gclid=prova-gclid', { referer: ORIGINE + 'contatti/?cancella=segreto.x' });
  try {
    await p.page.locator(BANNER).waitFor({ state: 'visible', timeout: 5000 });
    await p.page.waitForTimeout(300);
    assert.deepStrictEqual(p.google, [], 'Google è partito prima di «Accetta»');
    await accetta(p.page).click();
    await p.page.waitForFunction(() => window.__gtag === 1, null, { timeout: 5000 });
    assert.ok(await p.page.locator(BANNER).isHidden(), 'dopo «Accetta» il banner resta');
    assert.strictEqual(await sceltaSalvata(p.page), 'si');
    assert.ok(p.google[0].startsWith('https://www.googletagmanager.com/gtag/js?id=' + ID_GOOGLE), p.google[0]);
    const dati = await datiPerGoogle(p.page);
    const consenso = dati.findIndex(r => r[0] === 'consent' && r[1] === 'default');
    const config = dati.findIndex(r => r[0] === 'config');
    assert.ok(consenso >= 0 && config > consenso, 'il consenso deve arrivare a Google prima della configurazione');
    assert.deepStrictEqual(dati[consenso][2], { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied' });
    const c = dati[config];
    assert.strictEqual(c[1], ID_GOOGLE);
    assert.strictEqual(c[2].page_location, ORIGINE + 'contatti/index.html?gclid=prova-gclid', 'l’indirizzo per Google tiene solo il segno degli annunci');
    assert.strictEqual(c[2].page_referrer, ORIGINE + 'contatti/');
    assert.strictEqual(c[2].allow_google_signals, false, 'Google Signals deve restare spento');
    assert.strictEqual(c[2].allow_ad_personalization_signals, false, 'la pubblicità personalizzata deve restare spenta');
    assert.ok(c[2].cookie_expires > 0 && c[2].cookie_expires <= 183 * 24 * 3600, 'i cookie di Google devono durare al massimo sei mesi');
    const tutto = JSON.stringify(dati);
    assert.ok(!tutto.includes('abc123') && !tutto.includes('segreto'), 'a Google arriva il codice di un collegamento delle email');
    await p.page.waitForLoadState('networkidle');
    assert.deepStrictEqual(await p.violazioni(), [], 'la regola di sicurezza blocca Google');
    await p.page.goto(ORIGINE + 'lasciti/index.html');
    await p.page.waitForFunction(() => window.__gtag === 1, null, { timeout: 5000 });
    assert.ok(await p.page.locator(BANNER).isHidden(), 'dopo «Accetta» il banner non deve ricomparire');
    await p.page.waitForLoadState('networkidle');
    assert.deepStrictEqual(await p.violazioni(), [], 'la regola di sicurezza blocca Google');
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

controllo('Google: «Preferenze cookie» nel piede riapre la scelta; «Rifiuta» dopo «Accetta» cancella i cookie di Google e Google non riparte', async () => {
  const p = await apriConGoogle('lasciti/index.html', { scelta: 'si' });
  try {
    await p.page.waitForFunction(() => window.__gtag === 1, null, { timeout: 5000 });
    assert.ok(await p.page.locator(BANNER).isHidden(), 'con la scelta già fatta il banner non deve comparire');
    const piede = p.page.locator('.pie a.apri-consenso');
    assert.strictEqual((await piede.textContent()).trim(), 'Preferenze cookie');
    assert.ok(/cookie\/(index\.html)?#preferenze$/.test(await piede.getAttribute('href')), 'senza JavaScript «Preferenze cookie» porta all’informativa');
    await p.page.evaluate(() => {
      document.cookie = '_ga=GA1.1.123.456; path=/';
      document.cookie = '_ga_PROVA1234=GS1.1.1; path=/';
      document.cookie = '_gcl_au=1.1.1; path=/';
      document.cookie = '_gid=GA1.1.9; path=/; domain=.sito.prova';
      document.cookie = 'altro=resta; path=/';
    });
    await piede.click();
    await p.page.locator(BANNER).waitFor({ state: 'visible', timeout: 5000 });
    assert.ok(await p.page.evaluate(() => !!document.activeElement.closest('#consenso-cookie')), 'riaperto, il banner deve avere il fuoco');
    await Promise.all([p.page.waitForEvent('load'), rifiuta(p.page).click()]);
    await p.page.waitForLoadState('networkidle');
    assert.strictEqual(await p.page.evaluate(() => document.cookie), 'altro=resta', 'i cookie di Google devono sparire, anche quello che Google riscrive lasciando la pagina');
    assert.deepStrictEqual(await p.page.evaluate(() => Object.keys(localStorage).filter(k => /^_g/.test(k))), [], 'quello che Google ha salvato nella memoria del browser deve sparire');
    assert.strictEqual(await sceltaSalvata(p.page), 'no');
    assert.strictEqual(await p.page.evaluate(() => typeof window.__gtag), 'undefined', 'dopo il rifiuto Google è ancora nella pagina');
    assert.ok(await p.page.locator(BANNER).isHidden());
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

/* compila e manda il modulo dei Contatti, conferma le notizie dal collegamento dell'email, manda un progetto, torna da Stripe:
   le quattro azioni che contano. Dà gli eventi arrivati a Google e le richieste partite verso Google */
async function quattroAzioni(scelta) {
  const eventi = [], google = [];
  const giro = async (percorso, opzioni, fai) => {
    const p = await apriConGoogle(percorso, Object.assign({ scelta }, opzioni));
    try {
      await fai(p.page);
      await p.page.waitForLoadState('networkidle');
      eventi.push(...await eventiPerGoogle(p.page));
      google.push(...p.google);
      assert.deepStrictEqual(p.errori, [], percorso);
    } finally { await p.chiudi(); }
  };
  await giro('contatti/index.html', { foglio: () => ({ success: true }) }, async page => {
    await page.fill('#mc-nome', 'Carla');
    await page.fill('#mc-posta', 'carla@example.org');
    await page.fill('#mc-messaggio', 'Un messaggio');
    await page.click('#modulo-contatti .invia');
    await esitoDi(page, '#modulo-contatti');
  });
  await giro('contatti/?conferma=abc123.firma_-9', { foglio: () => ({ success: true, testo: 'Grazie, il tuo indirizzo è confermato.' }) }, async page => {
    await page.locator('#conferma-notizie').waitFor({ state: 'visible', timeout: 5000 });
    await page.click('#conferma-notizie .invia');
    await esitoDi(page, '#conferma-notizie');
  });
  await giro('progetti/presenta-il-tuo-progetto/index.html', { foglio: () => ({ success: true, progetto: true }) }, async page => {
    await page.fill('#mp-progetto', 'Orto in comune');
    await page.check('#mp-fase-1');
    await page.fill('#mp-descrizione', 'Un orto per il quartiere.');
    await page.fill('#mp-nome', 'Paolo');
    await page.fill('#mp-posta', 'paolo@example.org');
    await page.click('#modulo-progetto .invia');
    await esitoDi(page, '#modulo-progetto');
  });
  await giro('dona/grazie/?session_id=cs_live_a1B2c3D4', {}, async page => {
    await page.waitForTimeout(300);
  });
  return { eventi, google };
}

controllo('Google: con il consenso si contano il messaggio, la conferma delle notizie, il progetto e la donazione; senza, nulla parte', async () => {
  const si = await quattroAzioni('si');
  assert.deepStrictEqual(si.eventi, ['messaggio_contatti', 'iscrizione_notizie', 'progetto_inviato', 'donazione_completata']);
  const no = await quattroAzioni('no');
  assert.deepStrictEqual(no.eventi, [], 'senza consenso si contano eventi');
  assert.deepStrictEqual(no.google, [], 'senza consenso partono richieste verso Google');
});

/* i passi concreti delle pagine che informano (chat di Ad Grants, con il sì di Elias del 6.11.2026): scaricare il modulo
   delle DAT e la guida da stampare al testamento olografo. Il PDF si apre in una scheda nuova: la pagina resta aperta e
   l'evento fa in tempo a partire. Dà gli eventi arrivati a Google e le richieste partite verso Google */
async function scaricaPdf(percorso, scelta, pdf) {
  const p = await apriConGoogle(percorso, { scelta });
  try {
    const link = p.page.locator('a[href$="/' + pdf + '"]');
    assert.strictEqual(await link.count(), 1, percorso + ': manca il collegamento a ' + pdf);
    assert.strictEqual(await link.getAttribute('target'), '_blank', percorso + ': il PDF deve aprirsi in una scheda nuova, sennò l’evento si perde');
    assert.ok(/\bnoopener\b/.test(await link.getAttribute('rel') || ''), percorso + ': manca rel="noopener"');
    const chiesto = p.page.context().waitForEvent('request', r => r.url().endsWith('/' + pdf), { timeout: 5000 });
    await link.click();
    await chiesto;
    await p.page.waitForTimeout(300);
    const eventi = await eventiPerGoogle(p.page);
    assert.deepStrictEqual(p.errori, [], percorso);
    return { eventi, google: p.google };
  } finally { await p.chiudi(); }
}

controllo('Google: con il consenso si conta chi scarica il modulo delle DAT o la guida al testamento; senza, nulla parte', async () => {
  const casi = [
    ['lasciti/la-liberta-del-come/index.html', 'DAT-fac-simile.pdf', 'scarica_modulo_dat'],
    ['documenti/index.html', 'DAT-fac-simile.pdf', 'scarica_modulo_dat'],
    ['lasciti/come-fare-testamento/index.html', 'guida-testamento-olografo.pdf', 'scarica_guida_testamento'],
  ];
  for (const [percorso, pdf, evento] of casi) {
    const si = await scaricaPdf(percorso, 'si', pdf);
    assert.deepStrictEqual(si.eventi, [evento], percorso);
    const no = await scaricaPdf(percorso, 'no', pdf);
    assert.deepStrictEqual(no.eventi, [], percorso + ': senza consenso si contano eventi');
    assert.deepStrictEqual(no.google, [], percorso + ': senza consenso partono richieste verso Google');
  }
});

controllo('Google: un modulo che non arriva, o una conferma che non riesce, non si conta', async () => {
  const p = await apriConGoogle('contatti/?conferma=abc123', { scelta: 'si', foglio: i => (i.metodo === 'GET' ? { success: false, testo: 'Questo collegamento non vale più.' } : { success: false, error: 'email' }) });
  try {
    await p.page.waitForFunction(() => window.__gtag === 1, null, { timeout: 5000 });
    await p.page.click('#conferma-notizie .invia');
    await esitoDi(p.page, '#conferma-notizie');
    await p.page.fill('#mc-nome', 'Carla');
    await p.page.fill('#mc-posta', 'carla@example.org');
    await p.page.fill('#mc-messaggio', 'Un messaggio');
    await p.page.click('#modulo-contatti .invia');
    await esitoDi(p.page, '#modulo-contatti');
    assert.deepStrictEqual(await eventiPerGoogle(p.page), []);
  } finally { await p.chiudi(); }
});

controllo('Google: la pagina di ringraziamento conta la donazione una volta sola, e solo se si arriva da Stripe', async () => {
  const senza = await apriConGoogle('dona/grazie/', { scelta: 'si' });
  try {
    await senza.page.waitForFunction(() => window.__gtag === 1, null, { timeout: 5000 });
    assert.deepStrictEqual(await eventiPerGoogle(senza.page), [], 'senza il segno di Stripe non è una donazione');
    assert.strictEqual(await senza.page.evaluate(() => document.querySelector('meta[name="robots"]') && document.querySelector('meta[name="robots"]').content), 'noindex, follow');
  } finally { await senza.chiudi(); }
  const p = await apriConGoogle('dona/grazie/?session_id=cs_live_a1B2c3D4', { scelta: 'si' });
  try {
    await p.page.waitForFunction(() => window.__gtag === 1, null, { timeout: 5000 });
    assert.deepStrictEqual(await eventiPerGoogle(p.page), ['donazione_completata']);
    assert.strictEqual(await p.page.evaluate(() => location.search), '', 'il segno di Stripe deve sparire dall’indirizzo');
    await p.page.reload();
    await p.page.waitForFunction(() => window.__gtag === 1, null, { timeout: 5000 });
    assert.deepStrictEqual(await eventiPerGoogle(p.page), [], 'ricaricando la pagina la donazione si conta due volte');
  } finally { await p.chiudi(); }
});

controllo('Google: chi torna da Stripe senza aver ancora scelto vede il banner; se accetta lì, la donazione si conta', async () => {
  const p = await apriConGoogle('dona/grazie/?session_id=cs_test_a1B2c3D4');
  try {
    await p.page.locator(BANNER).waitFor({ state: 'visible', timeout: 5000 });
    await p.page.waitForTimeout(300);
    assert.deepStrictEqual(p.google, []);
    await accetta(p.page).click();
    await p.page.waitForFunction(() => window.__gtag === 1, null, { timeout: 5000 });
    assert.deepStrictEqual(await eventiPerGoogle(p.page), ['donazione_completata']);
  } finally { await p.chiudi(); }
});

controllo('Google: nel giardino dei ricordi niente banner e niente Google, neppure con il consenso', async () => {
  for (const scelta of [null, 'si']) {
    const p = await apriConGoogle(GIARDINO, { scelta, dediche: { versione: 'x', dediche: [] } });
    try {
      await p.page.waitForLoadState('networkidle');
      assert.ok(await p.page.locator(BANNER).isHidden(), 'il banner nel giardino (' + scelta + ')');
      assert.deepStrictEqual(p.google, [], 'Google nel giardino (' + scelta + ')');
      assert.deepStrictEqual(p.errori, []);
    } finally { await p.chiudi(); }
  }
});

controllo('Google: la scelta vale sei mesi, poi il banner ricompare', async () => {
  for (const [fa, ricompare] of [[5 * MESE, false], [7 * MESE, true]]) {
    for (const scelta of ['si', 'no']) {
      const p = await apriConGoogle('index.html', { scelta: { scelta, quando: Date.now() - fa, versione: 1 } });
      try {
        await p.page.waitForLoadState('networkidle');
        assert.strictEqual(await p.page.locator(BANNER).isVisible(), ricompare, scelta + ' di ' + fa / MESE + ' mesi fa');
        if (ricompare) assert.deepStrictEqual(p.google, [], 'una scelta scaduta non vale come consenso');
      } finally { await p.chiudi(); }
    }
  }
});

controllo('Google: sul telefono il banner non sfonda la pagina e lascia libera la barra in basso', async () => {
  for (const schermo of [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const p = await apriConGoogle('index.html', { schermo });
    try {
      await p.page.locator(BANNER).waitFor({ state: 'visible', timeout: 5000 });
      const m = await p.page.evaluate(() => {
        const b = document.getElementById('consenso-cookie').getBoundingClientRect();
        const barra = document.querySelector('.barra-fissa').getBoundingClientRect();
        return { largo: document.documentElement.scrollWidth, basso: b.bottom, barra: barra.top, alto: b.height };
      });
      assert.ok(m.largo <= schermo.width, schermo.width + ' px: la pagina si allarga a ' + m.largo);
      assert.ok(m.basso <= m.barra + 1, schermo.width + ' px: il banner copre la barra in basso');
      assert.ok(m.alto <= schermo.height * 0.6, schermo.width + ' px: il banner è troppo alto (' + Math.round(m.alto) + ' px)');
    } finally { await p.chiudi(); }
  }
});


/* ---- il biglietto del regalo solidale (pagina /regalo-solidale/): lo disegna il browser, in PDF o in immagine ---- */

const REGALO = 'dona/regali-solidali/index.html';
const BIGLIETTO = '#modulo-biglietto';

/* il file che il pulsante fa scaricare: nome e contenuto */
async function scarica(page, pulsante) {
  const [arrivo] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.click(pulsante)]);
  const file = await arrivo.path();
  return { nome: arrivo.suggestedFilename(), dati: fs.readFileSync(file) };
}

/* che cosa dice il biglietto, come lo legge chi usa un lettore di schermo (aria-label dell'anteprima) */
async function dettoDalBiglietto(page) {
  await page.waitForFunction(s => (document.querySelector(s + ' canvas').getAttribute('aria-label') || '').length > 20, BIGLIETTO);
  return (await page.getAttribute(BIGLIETTO + ' canvas', 'aria-label')).replace(/\s+/g, ' ');
}

controllo('il regalo solidale: il biglietto si prepara nella pagina e si scarica in PDF e in immagine, senza mandare niente a nessuno', async () => {
  const p = await apri(REGALO);
  try {
    await p.page.locator(BIGLIETTO).waitFor({ state: 'visible', timeout: 5000 });
    assert.ok(await p.page.locator('#biglietto-senza-js').isHidden(), 'con JavaScript la nota per chi non ce l’ha deve sparire');
    assert.strictEqual(await p.page.inputValue('#mb-occasione'), 'natale', 'l’occasione già scelta è il Natale');
    await p.page.fill('#mb-per', 'Anna');
    await p.page.fill('#mb-da', 'Marco');
    await p.page.fill('#mb-messaggio', "Con l'affetto di sempre");
    await p.page.check('#modulo-biglietto input[name="immagine"][value="albero"]', { force: true });
    const detto = await dettoDalBiglietto(p.page);
    for (const parte of ['Buon Natale', 'Per Anna', 'pensando a te', 'Con l’affetto di sempre', 'Marco', 'Fondazione La Rosa d’Oro'])
      assert.ok(detto.includes(parte), 'il biglietto non dice «' + parte + '»: ' + detto);
    assert.ok(!/\d+\s*(euro|€)/.test(detto), 'sul biglietto non va la cifra: ' + detto);

    const pdf = await scarica(p.page, BIGLIETTO + ' button[type="submit"]');
    assert.strictEqual(pdf.nome, 'regalo-solidale-per-anna.pdf');
    const testo = pdf.dati.toString('latin1');
    assert.ok(testo.startsWith('%PDF-1.'), 'non è un PDF');
    assert.ok(testo.trimEnd().endsWith('%%EOF'), 'il PDF non si chiude');
    assert.ok(testo.includes('/MediaBox [0 0 595.28 419.53]'), 'il foglio non è un A5 orizzontale');
    assert.ok(/\/Subtype \/Image \/Width (\d+) \/Height (\d+)/.test(testo), 'nel PDF manca l’immagine del biglietto');
    const [, largo, alto] = testo.match(/\/Width (\d+) \/Height (\d+)/).map(Number);
    assert.ok(largo >= 1600 && Math.abs(largo / alto - 210 / 148) < 0.01, 'l’immagine è troppo piccola o non è un A5: ' + largo + '×' + alto);
    const inizio = testo.indexOf('stream\n', testo.indexOf('/Subtype /Image')) + 7;
    assert.strictEqual(pdf.dati.readUInt16BE(inizio), 0xFFD8, 'l’immagine nel PDF non è un JPEG');
    const voci = testo.slice(testo.lastIndexOf('\nxref\n') + 1).split('\n').slice(3, 9);
    for (const [n, voce] of voci.entries()) {
      assert.ok(testo.startsWith((n + 1) + ' 0 obj', Number(voce.slice(0, 10))), 'la tabella del PDF non porta all’oggetto ' + (n + 1));
    }

    const jpg = await scarica(p.page, BIGLIETTO + ' button[data-formato="jpg"]');
    assert.strictEqual(jpg.nome, 'regalo-solidale-per-anna.jpg');
    assert.strictEqual(jpg.dati.readUInt16BE(0), 0xFFD8, 'l’immagine non è un JPEG');

    assert.deepStrictEqual(p.allo, [], 'niente deve partire verso lo script del foglio');
    assert.deepStrictEqual(p.fuori, [], 'niente deve partire verso altri siti');
    assert.deepStrictEqual(p.errori, []);
    assert.deepStrictEqual(await p.violazioni(), [], 'il biglietto viola la regola di sicurezza della pagina');
  } finally { await p.chiudi(); }
});

controllo('il biglietto parla a più persone con il «voi», cambia con l’occasione e senza nomi resta giusto', async () => {
  const p = await apri(REGALO);
  try {
    await p.page.locator(BIGLIETTO).waitFor({ state: 'visible', timeout: 5000 });
    let detto = await dettoDalBiglietto(p.page);
    assert.ok(detto.includes('Buon Natale') && detto.includes('pensando a te'), detto);
    assert.ok(!/Per \S/.test(detto.replace('Per il', '')), 'senza un nome non va «Per …»: ' + detto);
    await p.page.fill('#mb-per', 'I nostri clienti');
    await p.page.fill('#mb-da', 'Studio Rossi');
    await p.page.check('#modulo-biglietto input[name="persone"][value="voi"]');
    await p.page.selectOption('#mb-occasione', 'compleanno');
    await p.page.waitForFunction(s => /voi/.test(document.querySelector(s + ' canvas').getAttribute('aria-label')), BIGLIETTO);
    detto = await dettoDalBiglietto(p.page);
    for (const parte of ['Buon compleanno', 'Per i nostri clienti', 'pensando a voi', 'Studio Rossi'])
      assert.ok(detto.includes(parte), 'il biglietto non dice «' + parte + '»: ' + detto);
    assert.ok(!detto.includes('Buon Natale') && !detto.includes('pensando a te'), detto);
    const pdf = await scarica(p.page, BIGLIETTO + ' button[type="submit"]');
    assert.strictEqual(pdf.nome, 'regalo-solidale-per-i-nostri-clienti.pdf');
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

controllo('il biglietto in ricordo di una persona: il suo nome, una donazione in memoria e non un regalo, e il campo solo per questa occasione', async () => {
  const p = await apri(REGALO);
  try {
    await p.page.locator(BIGLIETTO).waitFor({ state: 'visible', timeout: 5000 });
    assert.ok(await p.page.locator('#mb-ricordo').isHidden(), 'a Natale il campo «In ricordo di» non serve');
    await p.page.selectOption('#mb-occasione', 'ricordo');
    await p.page.locator('#mb-ricordo').waitFor({ state: 'visible', timeout: 2000 });
    assert.ok(await p.page.isChecked('#modulo-biglietto input[name="persone"][value="voi"]'), 'il biglietto in ricordo parla alla famiglia, con il «voi»');
    let detto = await dettoDalBiglietto(p.page);
    assert.ok(detto.startsWith('Anteprima del biglietto: In ricordo.'), 'senza un nome il saluto è «In ricordo»: ' + detto);
    await p.page.fill('#mb-ricordo', 'Maria');
    await p.page.fill('#mb-per', 'La famiglia Rossi');
    await p.page.fill('#mb-da', 'Gli amici del coro');
    await p.page.waitForFunction(s => /Gli amici del coro/.test(document.querySelector(s + ' canvas').getAttribute('aria-label')), BIGLIETTO);
    detto = await dettoDalBiglietto(p.page);
    for (const parte of ['In ricordo di Maria', 'Per la famiglia Rossi', 'donazione in memoria', 'pensando a voi', 'Gli amici del coro'])
      assert.ok(detto.includes(parte), 'il biglietto non dice «' + parte + '»: ' + detto);
    assert.ok(!/regalo/i.test(detto), 'un biglietto in ricordo non parla di regalo: ' + detto);
    const pdf = await scarica(p.page, BIGLIETTO + ' button[type="submit"]');
    assert.strictEqual(pdf.nome, 'donazione-in-ricordo-di-maria.pdf');
    assert.ok(!/regalo/i.test(pdf.dati.toString('latin1').match(/\/Title \(([^)]*)\)/)[1]), 'il titolo del PDF in ricordo non parla di regalo');
    await p.page.selectOption('#mb-occasione', 'natale');
    await p.page.locator('#mb-ricordo').waitFor({ state: 'hidden', timeout: 2000 });
    await p.page.waitForFunction(s => /Buon Natale/.test(document.querySelector(s + ' canvas').getAttribute('aria-label')), BIGLIETTO);
    detto = await dettoDalBiglietto(p.page);
    assert.ok(!detto.includes('Maria') && detto.includes('Questo regalo'), 'tornati a Natale il nome della persona ricordata non resta: ' + detto);
    const jpg = await scarica(p.page, BIGLIETTO + ' button[data-formato="jpg"]');
    assert.strictEqual(jpg.nome, 'regalo-solidale-per-la-famiglia-rossi.jpg');
    assert.deepStrictEqual(p.allo, [], 'niente deve partire verso lo script del foglio');
    assert.deepStrictEqual(p.fuori, [], 'niente deve partire verso altri siti');
    assert.deepStrictEqual(p.errori, []);
  } finally { await p.chiudi(); }
});

/* ---- la pergamena delle bomboniere solidali, e quella in ricordo nella pagina dei funerali: quattro per foglio A4 ---- */

const BOMBONIERE = 'dona/bomboniere-solidali/index.html';
const FUNERALI = 'in-memoria/funerali/index.html';
const PERGAMENA = '#modulo-pergamena';

async function dettoDallaPergamena(page) {
  await page.waitForFunction(s => (document.querySelector(s + ' canvas').getAttribute('aria-label') || '').length > 20, PERGAMENA);
  return (await page.getAttribute(PERGAMENA + ' canvas', 'aria-label')).replace(/\s+/g, ' ');
}

/* un PDF A4 orizzontale con la stessa pergamena quattro volte, e la tabella interna che porta agli oggetti giusti */
function pdfDaQuattro(dati) {
  const testo = dati.toString('latin1');
  assert.ok(testo.startsWith('%PDF-1.') && testo.trimEnd().endsWith('%%EOF'), 'non è un PDF intero');
  assert.ok(testo.includes('/MediaBox [0 0 841.89 595.28]'), 'il foglio non è un A4 orizzontale');
  assert.strictEqual((testo.match(/\/Im1 Do/g) || []).length, 4, 'nel foglio non ci sono quattro pergamene');
  const [, largo, alto] = testo.match(/\/Width (\d+) \/Height (\d+)/).map(Number);
  assert.ok(largo >= 1600 && Math.abs(largo / alto - 210 / 148) < 0.01, 'l’immagine è troppo piccola o non ha le proporzioni di un A6: ' + largo + '×' + alto);
  const inizio = testo.indexOf('stream\n', testo.indexOf('/Subtype /Image')) + 7;
  assert.strictEqual(dati.readUInt16BE(inizio), 0xFFD8, 'l’immagine nel PDF non è un JPEG');
  const voci = testo.slice(testo.lastIndexOf('\nxref\n') + 1).split('\n').slice(3, 9);
  for (const [n, voce] of voci.entries())
    assert.ok(testo.startsWith((n + 1) + ' 0 obj', Number(voce.slice(0, 10))), 'la tabella del PDF non porta all’oggetto ' + (n + 1));
  return testo;
}

controllo('le bomboniere solidali: la pergamena con i nomi e la data, quattro per foglio A4, senza mandare niente a nessuno', async () => {
  const p = await apri(BOMBONIERE);
  try {
    await p.page.locator(PERGAMENA).waitFor({ state: 'visible', timeout: 5000 });
    assert.ok(await p.page.locator('#pergamena-senza-js').isHidden(), 'con JavaScript la nota per chi non ce l’ha deve sparire');
    assert.strictEqual(await p.page.inputValue('#mp-occasione'), 'matrimonio', 'l’occasione già scelta è il matrimonio');
    assert.ok(!(await p.page.$$eval('#mp-occasione option', o => o.map(x => x.value))).includes('funerale'), 'il funerale non sta fra le bomboniere');
    assert.ok(await p.page.$('a[href*="client_reference_id=sito-bomboniera"]'), 'il pulsante per donare porta a Stripe con il segno «sito-bomboniera»');
    await p.page.fill('#mp-nomi', 'Chiara e Luca');
    await p.page.fill('#mp-data', '12 giugno 2027');
    await p.page.fill('#mp-messaggio', "Grazie di essere con noi");
    await p.page.waitForFunction(s => /Grazie di essere con noi/.test(document.querySelector(s + ' canvas').getAttribute('aria-label')), PERGAMENA);
    let detto = await dettoDallaPergamena(p.page);
    for (const parte of ['Chiara e Luca', 'Sposi · 12 giugno 2027', 'Al posto della bomboniera', 'Grazie di essere con noi', 'Fondazione La Rosa d’Oro'])
      assert.ok(detto.includes(parte), 'la pergamena non dice «' + parte + '»: ' + detto);
    assert.ok(!/\d+\s*(euro|€)/.test(detto) && !/regalo/i.test(detto), 'sulla pergamena non vanno la cifra né il regalo: ' + detto);

    const pdf = await scarica(p.page, PERGAMENA + ' button[type="submit"]');
    assert.strictEqual(pdf.nome, 'pergamena-solidale-chiara-e-luca.pdf');
    pdfDaQuattro(pdf.dati);
    const jpg = await scarica(p.page, PERGAMENA + ' button[data-formato="jpg"]');
    assert.strictEqual(jpg.nome, 'pergamena-solidale-chiara-e-luca.jpg');
    assert.strictEqual(jpg.dati.readUInt16BE(0), 0xFFD8, 'l’immagine non è un JPEG');

    await p.page.selectOption('#mp-occasione', 'battesimo');
    await p.page.fill('#mp-nomi', 'Sofia');
    await p.page.waitForFunction(s => /Sofia/.test(document.querySelector(s + ' canvas').getAttribute('aria-label')), PERGAMENA);
    detto = await dettoDallaPergamena(p.page);
    assert.ok(detto.includes('Il battesimo · 12 giugno 2027') && !detto.includes('Sposi'), detto);

    assert.deepStrictEqual(p.allo, [], 'niente deve partire verso lo script del foglio');
    assert.deepStrictEqual(p.fuori, [], 'niente deve partire verso altri siti');
    assert.deepStrictEqual(p.errori, []);
    assert.deepStrictEqual(await p.violazioni(), [], 'la pergamena viola la regola di sicurezza della pagina');
  } finally { await p.chiudi(); }
});

controllo('la pergamena al posto dei fiori, nella pagina dei funerali: il nome di chi si ricorda, mai bomboniere né feste', async () => {
  const p = await apri(FUNERALI);
  try {
    await p.page.locator(PERGAMENA).waitFor({ state: 'visible', timeout: 5000 });
    assert.strictEqual(await p.page.inputValue('#mp-occasione'), 'funerale');
    assert.ok(await p.page.locator('#mp-occasione').isHidden(), 'con un’occasione sola la scelta dell’occasione non serve');
    let detto = await dettoDallaPergamena(p.page);
    assert.ok(detto.startsWith('Anteprima della pergamena: In ricordo.'), 'senza un nome la pergamena dice «In ricordo»: ' + detto);
    await p.page.fill('#mp-nomi', 'Maria Bianchi');
    await p.page.fill('#mp-data', '1940 – 2026');
    await p.page.waitForFunction(s => /1940/.test(document.querySelector(s + ' canvas').getAttribute('aria-label')), PERGAMENA);
    detto = await dettoDallaPergamena(p.page);
    for (const parte of ['Maria Bianchi', 'In ricordo · 1940 – 2026', 'Al posto dei fiori', 'in sua memoria'])
      assert.ok(detto.includes(parte), 'la pergamena non dice «' + parte + '»: ' + detto);
    assert.ok(!/bombonier|regalo|festa|festeggi/i.test(detto), 'la pergamena in ricordo non parla di feste: ' + detto);
    const pdf = await scarica(p.page, PERGAMENA + ' button[type="submit"]');
    assert.strictEqual(pdf.nome, 'pergamena-in-ricordo-di-maria-bianchi.pdf');
    const testo = pdfDaQuattro(pdf.dati);
    assert.ok(!/bombonier|regalo/i.test(testo.match(/\/Title \(([^)]*)\)/)[1]), 'il titolo del PDF in ricordo non parla di bomboniere');
    assert.deepStrictEqual(p.allo, [], 'niente deve partire verso lo script del foglio');
    assert.deepStrictEqual(p.fuori, [], 'niente deve partire verso altri siti');
    assert.deepStrictEqual(p.errori, []);
    assert.deepStrictEqual(await p.violazioni(), [], 'la pergamena viola la regola di sicurezza della pagina');
  } finally { await p.chiudi(); }
});

controllo('la pergamena sul telefono: niente sfondamenti, l’anteprima sta nello schermo', async () => {
  for (const pagina of [BOMBONIERE, FUNERALI]) {
    for (const schermo of [{ width: 320, height: 640 }, { width: 390, height: 844 }]) {
      const p = await apri(pagina, { schermo });
      try {
        await p.page.locator(PERGAMENA).waitFor({ state: 'visible', timeout: 5000 });
        const m = await p.page.evaluate(s => ({
          largo: document.documentElement.scrollWidth,
          tela: document.querySelector(s + ' canvas').getBoundingClientRect().width,
        }), PERGAMENA);
        assert.ok(m.largo <= schermo.width, pagina + ', ' + schermo.width + ' px: la pagina si allarga a ' + m.largo);
        assert.ok(m.tela > 200 && m.tela <= schermo.width, pagina + ', ' + schermo.width + ' px: l’anteprima è larga ' + m.tela);
      } finally { await p.chiudi(); }
    }
  }
});

controllo('il biglietto sul telefono: niente sfondamenti, l’anteprima sta nello schermo', async () => {
  for (const schermo of [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const p = await apri(REGALO, { schermo });
    try {
      await p.page.locator(BIGLIETTO).waitFor({ state: 'visible', timeout: 5000 });
      const m = await p.page.evaluate(s => ({
        largo: document.documentElement.scrollWidth,
        tela: document.querySelector(s + ' canvas').getBoundingClientRect().width,
      }), BIGLIETTO);
      assert.ok(m.largo <= schermo.width, schermo.width + ' px: la pagina si allarga a ' + m.largo);
      assert.ok(m.tela > 200 && m.tela <= schermo.width, schermo.width + ' px: l’anteprima è larga ' + m.tela);
    } finally { await p.chiudi(); }
  }
});


/* ---- si parte ---- */

(async () => {
  if (!playwright) {
    console.log('Moduli nel browser: saltati, qui non c’è Playwright (girano nel cantiere di Claude)');
    return;
  }
  try {
    browser = await playwright.chromium.launch();
  } catch (e) {
    console.log('Moduli nel browser: saltati, Chromium non si apre (' + String(e.message || e).split('\n')[0].slice(0, 120) + ')');
    return;
  }
  let falliti = 0;
  for (const { descrizione, prova } of controlli) {
    try {
      await prova();
      console.log('  ok  ' + descrizione);
    } catch (e) {
      falliti++;
      console.log('  NO  ' + descrizione + '\n        ' + String(e.message || e).split('\n')[0].slice(0, 300));
    }
  }
  await browser.close();
  if (sitoGoogle) fs.rmSync(path.dirname(sitoGoogle), { recursive: true, force: true });
  console.log(falliti ? '%d controlli dei moduli su %d non passano' : 'Moduli nel browser: %d controlli passati su %d',
              falliti || controlli.length, controlli.length);
  process.exitCode = falliti ? 1 : 0;
})();
