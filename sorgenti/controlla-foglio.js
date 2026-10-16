/*
 * I controlli dello script del foglio «Contatti della Fondazione» (sorgenti/foglio-contatti.gs)
 * -------------------------------------------------------------------------------------------
 * Lo script gira su Google, non qui: questo file lo carica in node con un foglio finto, una posta
 * finta e gli attrezzi di Google rifatti a mano, e controlla che cosa succede quando arriva una
 * richiesta. Non tocca il foglio vero e non manda email. Lo fa girare sorgenti/controlla.py,
 * con gli altri controlli; da solo:
 *
 *     node sorgenti/controlla-foglio.js
 *
 * Ogni controllo dice che cosa deve succedere. Si scrive prima di cambiare lo script, si vede
 * fallire, e solo dopo si cambia lo script (CLAUDE.md, Elias 15.10).
 */
'use strict';
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SORGENTE = fs.readFileSync(path.join(__dirname, 'foglio-contatti.gs'), 'utf8');
// la prima riga della scheda «Contatti» come è nel foglio vero (15.10.2026)
const TITOLI_CONTATTI = ['Arrivato il', 'Fonte', 'Pagina', 'Richiesta', 'Nome', 'Email', 'Messaggio', 'Interessi',
  'Consenso alle notizie', 'Testo del consenso', 'Email confermata il', 'Ente', 'Stato', 'Risposto il',
  'Da cancellare entro', 'Note', 'Consenso ritirato il'];


/* ---- gli attrezzi di Google, rifatti quanto basta ---- */

function foglioFinto(nome, righe) {
  const dati = righe.map(r => r.slice());
  const scritti = [];                         // i valori come lo script li manda, prima che Google tolga l’apostrofo
  const larghezza = () => dati.reduce((m, r) => Math.max(m, r.length), 0);
  const intervallo = (r, c, nr, nc) => ({
    getValues: () => Array.from({ length: nr || 1 }, (_, i) =>
      Array.from({ length: nc || 1 }, (_, j) => { const v = (dati[r - 1 + i] || [])[c - 1 + j]; return v === undefined ? '' : v; })),
    setValues(valori) {
      valori.forEach(riga => scritti.push(...riga));
      valori.forEach((riga, i) => riga.forEach((v, j) => {
        while (dati.length < r + i) dati.push([]);
        // come Google: l’apostrofo davanti dice «questo è testo» e nella cella non resta
        dati[r - 1 + i][c - 1 + j] = typeof v === 'string' && v[0] === "'" ? v.slice(1) : v;
      }));
      return this;
    },
    setValue(v) { return this.setValues([[v]]); },
    setFontWeight() { return this; },
    getFontWeight: () => 'bold',
    insertCheckboxes() { return this; }
  });
  return {
    nome, dati, scritti,
    getName: () => nome,
    getLastRow: () => dati.length,
    getLastColumn: larghezza,
    getRange: intervallo,
    getDataRange: () => intervallo(1, 1, dati.length, larghezza()),
    insertColumnAfter(c) { dati.forEach(r => { while (r.length < c) r.push(''); r.splice(c, 0, ''); }); },
    setFrozenRows() {}
  };
}

function byteGoogle(buffer) {                 // Google dà i byte con il segno, come Java
  return Array.from(buffer).map(b => (b > 127 ? b - 256 : b));
}

function buffer(v) {
  return typeof v === 'string' ? Buffer.from(v, 'utf8') : Buffer.from(v.map(b => b & 255));
}

function nuovoScript(proprieta, opzioni) {
  const schede = { Contatti: foglioFinto('Contatti', [TITOLI_CONTATTI]) };
  const email = [];
  const gmail = [];                           // con opzioni.gmail: le email che partono da segreteria@ con il servizio Gmail
  const memoria = {};
  const prop = Object.assign({}, proprieta);
  const contesto = {
    console: { log() {}, error() {} },
    SpreadsheetApp: {
      getActive: () => ({
        getSheetByName: n => schede[n] || null,
        insertSheet: n => (schede[n] = foglioFinto(n, [])),
        getUrl: () => 'https://docs.google.com/spreadsheets/d/finto'
      }),
      flush() {}
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    CacheService: { getScriptCache: () => ({ get: k => (k in memoria ? memoria[k] : null), put: (k, v) => { memoria[k] = v; } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => (k in prop ? prop[k] : null), setProperty: (k, v) => { prop[k] = v; } }) },
    MailApp: { sendEmail: m => email.push(m) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: testo => ({ testo, setMimeType() { return this; } })
    },
    HtmlService: { createHtmlOutput: html => ({ html, setTitle() { return this; }, addMetaTag() { return this; } }) },
    Utilities: {
      Charset: { UTF_8: 'UTF-8' },
      getUuid: () => crypto.randomUUID(),
      formatDate: d => d.toISOString(),
      computeHmacSha256Signature: (valore, chiave) =>
        byteGoogle(crypto.createHmac('sha256', Buffer.from(chiave, 'utf8')).update(Buffer.from(valore, 'utf8')).digest()),
      base64Encode: v => buffer(v).toString('base64'),
      base64EncodeWebSafe: v => buffer(v).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
      base64DecodeWebSafe: s => byteGoogle(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')),
      newBlob: byte => ({ getDataAsString: () => buffer(byte).toString('utf8') })
    }
  };
  if (opzioni && opzioni.gmail) contesto.Gmail = { Users: { Messages: { send: (m, chi) => gmail.push({ raw: m.raw, chi }) } } };
  vm.createContext(contesto);
  vm.runInContext(SORGENTE, contesto, { filename: 'foglio-contatti.gs' });
  return { script: contesto, schede, email, gmail, prop };
}

function json(uscita) {
  assert.ok(uscita && typeof uscita.testo === 'string', 'la risposta non è JSON: ' + JSON.stringify(uscita).slice(0, 200));
  return JSON.parse(uscita.testo);
}

/* le righe di una scheda come oggetti {titolo: valore} */
function righe(foglio) {
  const [titoli, ...resto] = foglio.dati;
  return resto.map(r => Object.fromEntries(titoli.map((t, i) => [t, r[i] === undefined ? '' : r[i]])));
}


/* ---- le richieste del server di Lux, come le manda (il testo dato a LUX il 15.10) ---- */

const SEGRETO_LUX = 'segreto-di-prova-per-i-controlli-0123456789abcdef';
const CONSENSO = 'v1 ottobre 2026';

function richiestaDiLux(email, opzioni) {
  const o = Object.assign({ segreto: SEGRETO_LUX, quando: Math.floor(Date.now() / 1000), consenso: CONSENSO }, opzioni);
  const quando = String(o.quando);
  const firma = crypto.createHmac('sha256', o.segreto)
    .update(['lux', email, quando, o.consenso].join('|'), 'utf8')
    .digest('base64url');
  const parametri = { tipo: 'lux', email, consenso: o.consenso, quando, firma };
  if (o._sito) parametri._sito = o._sito;
  return { parameter: parametri };
}

function data(v) {             // le date nascono dentro lo script: «instanceof Date» qui fuori non le riconosce
  return Object.prototype.toString.call(v) === '[object Date]';
}

function parametro(collegamento, nome) {
  return new URL(collegamento).searchParams.get(nome);
}


/* ---- i controlli ---- */

const controlli = [];
function controllo(descrizione, prova) { controlli.push({ descrizione, prova }); }

controllo('una donazione di Lux con la casella spuntata diventa una riga «notizie» con Fonte «LUX»', () => {
  const { script, schede } = nuovoScript({ SEGRETO_LUX });
  const risposta = json(script.doPost(richiestaDiLux('donatrice@example.org')));
  assert.strictEqual(risposta.success, true, JSON.stringify(risposta));
  const tutte = righe(schede.Contatti);
  assert.strictEqual(tutte.length, 1);
  const r = tutte[0];
  assert.strictEqual(r['Fonte'], 'LUX');
  assert.strictEqual(r['Pagina'], 'lux.larosadoro.org');
  assert.strictEqual(r['Richiesta'], 'notizie');
  assert.strictEqual(r['Email'], 'donatrice@example.org');
  assert.strictEqual(r['Nome'], '');
  assert.strictEqual(r['Consenso alle notizie'], 'sì');
  assert.strictEqual(r['Testo del consenso'], CONSENSO);
  assert.strictEqual(r['Ente'], 'Fondazione');
  assert.strictEqual(r['Stato'], 'da confermare');
  assert.ok(String(r['Per cancellarsi']).startsWith('https://larosadoro.org/contatti/index.html?cancella='), r['Per cancellarsi']);
});

controllo('chi arriva da Lux riceve la stessa email di conferma del sito, con la frase su Lux', () => {
  const { script, email } = nuovoScript({ SEGRETO_LUX });
  script.doPost(richiestaDiLux('donatrice@example.org'));
  assert.strictEqual(email.length, 1, 'email partite: ' + email.length);
  const m = email[0];
  assert.strictEqual(m.to, 'donatrice@example.org');
  assert.strictEqual(m.subject, 'Conferma la tua email per le notizie della Fondazione');
  assert.ok(m.body.includes('donando a Lux, il progetto della Fondazione La Rosa d’Oro per un uso consapevole del digitale, hai chiesto di ricevere, ogni tanto, le nostre notizie per email.'), m.body);
  assert.ok(m.body.includes('https://larosadoro.org/contatti/index.html?conferma='), m.body);
  assert.ok(m.body.includes('https://larosadoro.org/contatti/index.html?cancella='), m.body);
});

controllo('«Confermo» e «Cancellami» funzionano sulla riga di Lux come su quelle del sito', () => {
  const { script, schede, email } = nuovoScript({ SEGRETO_LUX });
  script.doPost(richiestaDiLux('donatrice@example.org'));
  const conferma = email[0].body.match(/https:\S+\?conferma=\S+/)[0];
  assert.strictEqual(json(script.doGet({ parameter: { conferma: parametro(conferma, 'conferma') } })).success, true);
  let r = righe(schede.Contatti)[0];
  assert.ok(data(r['Email confermata il']), 'manca la data della conferma');
  assert.strictEqual(r['Stato'], 'iscritto');
  const cancella = r['Per cancellarsi'];
  assert.strictEqual(json(script.doGet({ parameter: { cancella: parametro(cancella, 'cancella') } })).success, true);
  r = righe(schede.Contatti)[0];
  assert.strictEqual(r['Consenso alle notizie'], 'ritirato');
  assert.strictEqual(r['Stato'], 'cancellato');
  assert.ok(data(r['Consenso ritirato il']), 'manca la data del ritiro');
});

controllo('una firma sbagliata non scrive niente e non manda email', () => {
  const { script, schede, email } = nuovoScript({ SEGRETO_LUX });
  const risposta = json(script.doPost(richiestaDiLux('donatrice@example.org', { segreto: 'un-altro-segreto' })));
  assert.deepStrictEqual([risposta.success, risposta.error], [false, 'firma']);
  assert.strictEqual(righe(schede.Contatti).length, 0);
  assert.strictEqual(email.length, 0);
});

controllo('senza SEGRETO_LUX nelle proprietà dello script nessuna richiesta di Lux passa', () => {
  const { script, schede, email } = nuovoScript({});
  const risposta = json(script.doPost(richiestaDiLux('donatrice@example.org', { segreto: '' })));
  assert.deepStrictEqual([risposta.success, risposta.error], [false, 'firma']);
  assert.strictEqual(righe(schede.Contatti).length, 0);
  assert.strictEqual(email.length, 0);
});

controllo('una firma di più di dieci minuti fa non vale', () => {
  const { script, schede } = nuovoScript({ SEGRETO_LUX });
  const risposta = json(script.doPost(richiestaDiLux('donatrice@example.org', { quando: Math.floor(Date.now() / 1000) - 11 * 60 })));
  assert.deepStrictEqual([risposta.success, risposta.error], [false, 'firma']);
  assert.strictEqual(righe(schede.Contatti).length, 0);
});

controllo('la stessa firma vale una volta sola', () => {
  const { script, schede } = nuovoScript({ SEGRETO_LUX });
  const richiesta = richiestaDiLux('donatrice@example.org');
  assert.strictEqual(json(script.doPost(richiesta)).success, true);
  const seconda = json(script.doPost(richiesta));
  assert.deepStrictEqual([seconda.success, seconda.error], [false, 'firma']);
  assert.strictEqual(righe(schede.Contatti).length, 1);
});

controllo('un indirizzo non valido, anche firmato, torna indietro con «email»', () => {
  const { script, schede, email } = nuovoScript({ SEGRETO_LUX });
  const risposta = json(script.doPost(richiestaDiLux('non-è-un-indirizzo')));
  assert.deepStrictEqual([risposta.success, risposta.error], [false, 'email']);
  assert.strictEqual(righe(schede.Contatti).length, 0);
  assert.strictEqual(email.length, 0);
});

controllo('per le prove, con _sito i collegamenti portano al sito di prova', () => {
  const { script, schede, email } = nuovoScript({ SEGRETO_LUX });
  script.doPost(richiestaDiLux('donatrice@example.org', { _sito: 'https://eliasminotti.github.io/rosadoro/' }));
  assert.ok(String(righe(schede.Contatti)[0]['Per cancellarsi']).startsWith('https://eliasminotti.github.io/rosadoro/contatti/'));
  assert.ok(email[0].body.includes('https://eliasminotti.github.io/rosadoro/contatti/index.html?conferma='));
});

controllo('segretoPerLux crea il segreto una volta sola, lungo, e non tocca quello dei collegamenti', () => {
  const { script, prop } = nuovoScript({ SEGRETO: 'quello-dei-collegamenti' });
  script.segretoPerLux();
  const primo = prop.SEGRETO_LUX;
  assert.ok(typeof primo === 'string' && primo.length >= 40, 'segreto troppo corto: ' + primo);
  script.segretoPerLux();
  assert.strictEqual(prop.SEGRETO_LUX, primo);
  assert.strictEqual(prop.SEGRETO, 'quello-dei-collegamenti');
  const { script: altro, prop: altre } = nuovoScript({});
  altro.segretoPerLux();
  assert.notStrictEqual(altre.SEGRETO_LUX, primo);
});

controllo('le iscrizioni dal riquadro del sito restano con Fonte «Sito»', () => {
  const { script, schede } = nuovoScript({ SEGRETO_LUX });
  const risposta = json(script.doPost({ parameter: { tipo: 'notizie', notizie: 'si', email: 'lettore@example.org', consenso: CONSENSO,
    pagina: 'home', _sito: 'https://eliasminotti.github.io/rosadoro/', _js: '1' } }));
  assert.strictEqual(risposta.success, true);
  const r = righe(schede.Contatti)[0];
  assert.deepStrictEqual([r['Fonte'], r['Richiesta'], r['Pagina']], ['Sito', 'notizie', 'home']);
});


/* ---- i moduli del sito: Contatti, dediche, progetti, riquadro delle notizie ---- */

const PROVA = 'https://eliasminotti.github.io/rosadoro/';
const SEGRETERIA = 'segreteria@larosadoro.org';

function dalSito(parametri) {            // come li manda sito.js: con _js e l’indirizzo del sito
  return { parameter: Object.assign({ _js: '1', _sito: PROVA }, parametri) };
}

function messaggio(altro) {
  return dalSito(Object.assign({ nome: 'Carla Rossi', email: 'Carla@Example.org', oggetto: 'lascito',
    messaggio: 'Vorrei sapere come funziona.', pagina: 'lasciti' }, altro));
}

function dedica(altro) {
  return dalSito(Object.assign({ tipo: 'dedica', ricordo: 'Nonna Lina', dedica: 'Ti pensiamo ogni giorno', immagine: 'Rosa',
    nome: 'Carla', email: 'carla@example.org', consenso: 'si' }, altro));
}

function progetto(altro) {
  return dalSito(Object.assign({ tipo: 'progetto', progetto: 'Orto in comune', fase: 'Un’idea', descrizione: 'Un orto per il quartiere.',
    bisogno: 'Un terreno', documento: '', nome: 'Paolo', ente: 'Associazione del quartiere', email: 'paolo@example.org' }, altro));
}

function giardino(script) {
  return json(script.doGet({ parameter: { giardino: '1' } })).dediche;
}

function spunta(foglio, riga, valore) {         // riga: 1 è la prima dopo i titoli
  foglio.dati[riga][foglio.dati[0].indexOf('Nel giardino')] = valore;
}

function codiceDa(corpo, parametro) {
  const trovato = corpo.match(new RegExp('\\?' + parametro + '=(\\S+)'));
  assert.ok(trovato, 'nell’email manca il collegamento ?' + parametro + '=');
  return trovato[1];
}

controllo('un messaggio dei Contatti diventa una riga «contatto» e la segreteria riceve l’avviso, con «Rispondi» a chi ha scritto', () => {
  const { script, schede, email } = nuovoScript({});
  const risposta = json(script.doPost(messaggio()));
  assert.deepStrictEqual([risposta.success, risposta.conferma], [true, false]);
  const r = righe(schede.Contatti)[0];
  assert.deepStrictEqual([r['Fonte'], r['Richiesta'], r['Pagina'], r['Nome'], r['Email'], r['Consenso alle notizie'], r['Stato']],
    ['Sito', 'contatto', 'lasciti', 'Carla Rossi', 'carla@example.org', 'no', 'da rispondere']);
  assert.strictEqual(r['Messaggio'], 'Oggetto: lascito\n\nVorrei sapere come funziona.');
  assert.ok(!r['Per cancellarsi'], 'senza la casella delle notizie non serve il collegamento per cancellarsi');
  assert.strictEqual(email.length, 1, 'email partite: ' + email.length);
  assert.deepStrictEqual([email[0].to, email[0].replyTo, email[0].subject],
    [SEGRETERIA, 'carla@example.org', 'Messaggio dal sito: Carla Rossi · lascito']);
});

controllo('con la casella delle notizie la riga ha il consenso e parte l’email di conferma, una sola ogni sei ore per indirizzo', () => {
  const { script, schede, email } = nuovoScript({});
  assert.strictEqual(json(script.doPost(messaggio({ notizie: 'si', consenso: CONSENSO }))).conferma, true);
  const r = righe(schede.Contatti)[0];
  assert.deepStrictEqual([r['Consenso alle notizie'], r['Testo del consenso']], ['sì', CONSENSO]);
  assert.ok(String(r['Per cancellarsi']).startsWith(PROVA + 'contatti/index.html?cancella='), r['Per cancellarsi']);
  const conferme = () => email.filter(m => m.to === 'carla@example.org');
  assert.strictEqual(conferme().length, 1);
  assert.ok(conferme()[0].body.includes('ci hai scritto dal sito della Fondazione La Rosa d’Oro'), conferme()[0].body);
  script.doPost(messaggio({ notizie: 'si', consenso: CONSENSO, messaggio: 'Un secondo messaggio.' }));
  assert.strictEqual(conferme().length, 1, 'la seconda richiesta non deve mandare un’altra email di conferma');
  assert.strictEqual(righe(schede.Contatti).length, 2);
});

controllo('senza nome o messaggio il messaggio non entra («campi»), con un’email sbagliata nemmeno («email»)', () => {
  const { script, schede, email } = nuovoScript({});
  assert.strictEqual(json(script.doPost(messaggio({ nome: '  ' }))).error, 'campi');
  assert.strictEqual(json(script.doPost(messaggio({ messaggio: '' }))).error, 'campi');
  assert.strictEqual(json(script.doPost(messaggio({ email: 'carla@example' }))).error, 'email');
  assert.strictEqual(json(script.doPost(messaggio({ email: 'carla@example.org, altro@example.org' }))).error, 'email');
  assert.strictEqual(righe(schede.Contatti).length, 0);
  assert.strictEqual(email.length, 0);
});

controllo('la trappola per i programmi (_gotcha) finge di accettare e non scrive niente', () => {
  const { script, schede, email } = nuovoScript({});
  for (const richiesta of [messaggio({ _gotcha: 'spam' }), dedica({ _gotcha: 'spam' }), progetto({ _gotcha: 'spam' })]) {
    assert.strictEqual(json(script.doPost(richiesta)).success, true);
  }
  assert.strictEqual(righe(schede.Contatti).length, 0);
  assert.ok(!schede.Dediche && !schede.Progetti, 'non doveva nascere nessuna scheda');
  assert.strictEqual(email.length, 0);
});

controllo('quello che si scrive nei moduli resta testo nel foglio: niente formule', () => {
  const { script, schede } = nuovoScript({});
  script.doPost(messaggio({ nome: '=IMPORTXML("https://example.org","//a")', messaggio: '+39 333 1234567' }));
  const nome = schede.Contatti.scritti.find(v => String(v).includes('IMPORTXML'));
  assert.strictEqual(nome[0], "'", 'il nome arriva al foglio come formula: ' + nome);
  assert.strictEqual(schede.Contatti.scritti.find(v => String(v).includes('333'))[0], "'");
});

controllo('un a capo nel nome non entra nell’oggetto dell’avviso alla segreteria', () => {
  const { script, email } = nuovoScript({});
  script.doPost(messaggio({ nome: 'Carla\r\nBcc: altro@example.org' }));
  assert.ok(!/[\r\n]/.test(email[0].subject), JSON.stringify(email[0].subject));
});

controllo('se il modulo dice un indirizzo del sito che non è uno dei due veri, i collegamenti portano a larosadoro.org', () => {
  const { script, schede, email } = nuovoScript({});
  script.doPost(messaggio({ notizie: 'si', consenso: CONSENSO, _sito: 'https://malevolo.example/' }));
  assert.ok(String(righe(schede.Contatti)[0]['Per cancellarsi']).startsWith('https://larosadoro.org/contatti/'));
  assert.ok(!email.some(m => m.body.includes('malevolo')), 'un’email porta all’indirizzo sbagliato');
});

controllo('una dedica entra nella scheda «Dediche» con «Nel giardino» vuota, e la segreteria riceve l’avviso', () => {
  const { script, schede, email } = nuovoScript({});
  const risposta = json(script.doPost(dedica()));
  assert.deepStrictEqual([risposta.success, risposta.dedica, risposta.ricevuta], [true, true, true]);
  assert.ok(schede.Dediche, 'la scheda «Dediche» doveva nascere');
  const r = righe(schede.Dediche)[0];
  assert.deepStrictEqual([r['In memoria di'], r['Dedica'], r['Immagine'], r['Chi scrive'], r['Email'], r['Consenso'], r['Nel giardino']],
    ['Nonna Lina', 'Ti pensiamo ogni giorno', 'Rosa', 'Carla', 'carla@example.org', 'sì', false]);
  assert.ok(/^[0-9a-f]{12}$/.test(r['Codice']), 'codice: ' + r['Codice']);
  const avviso = email.find(m => m.to === SEGRETERIA);
  assert.ok(avviso, 'manca l’avviso alla segreteria');
  assert.deepStrictEqual([avviso.subject, avviso.replyTo], ['Dedica per il giardino: Nonna Lina', 'carla@example.org']);
  assert.ok(avviso.body.includes('Ti pensiamo ogni giorno'));
});

controllo('chi scrive la dedica riceve l’email con il collegamento per toglierla, senza il nome ricordato né la dedica', () => {
  const { script, email } = nuovoScript({});
  script.doPost(dedica());
  const ricevuta = email.find(m => m.to === 'carla@example.org');
  assert.ok(ricevuta, 'manca la ricevuta');
  assert.strictEqual(ricevuta.subject, 'La tua dedica nel giardino dei ricordi');
  assert.ok(ricevuta.body.includes(PROVA + 'in-memoria/giardino-dei-ricordi/index.html?togli='), ricevuta.body);
  assert.ok(!ricevuta.body.includes('Nonna Lina') && !ricevuta.body.includes('Ti pensiamo'),
    'il modulo è aperto a tutti: la ricevuta non deve portare a un indirizzo qualsiasi parole scritte da altri');
});

controllo('al massimo tre ricevute ogni sei ore allo stesso indirizzo', () => {
  const { script, email } = nuovoScript({});
  const esiti = [1, 2, 3, 4].map(n => json(script.doPost(dedica({ ricordo: 'Nome ' + n }))).ricevuta);
  assert.deepStrictEqual(esiti, [true, true, true, false]);
  assert.strictEqual(email.filter(m => m.to === 'carla@example.org').length, 3);
});

controllo('senza consenso, senza il nome da ricordare o senza chi scrive, la dedica non entra', () => {
  const { script, schede, email } = nuovoScript({});
  for (const altro of [{ consenso: '' }, { ricordo: ' ' }, { nome: '' }]) {
    const risposta = json(script.doPost(dedica(altro)));
    assert.deepStrictEqual([risposta.success, risposta.error], [false, 'campi'], JSON.stringify(altro));
  }
  assert.strictEqual(json(script.doPost(dedica({ email: 'carla' }))).error, 'email');
  assert.ok(!schede.Dediche || righe(schede.Dediche).length === 0);
  assert.strictEqual(email.length, 0);
});

controllo('nel giardino vanno solo le dediche spuntate, le più recenti prima, e mai chi le ha scritte', () => {
  const { script, schede } = nuovoScript({});
  script.doPost(dedica({ ricordo: 'Nonna Lina' }));
  script.doPost(dedica({ ricordo: 'Zio Piero', dedica: '', immagine: 'Ulivo' }));
  script.doPost(dedica({ ricordo: 'Marta' }));
  assert.deepStrictEqual(giardino(script), [], 'una dedica nuova non va nel giardino da sola');
  spunta(schede.Dediche, 1, true);
  spunta(schede.Dediche, 2, 'sì');               // scritto a mano invece della spunta
  const nel = giardino(script);
  assert.deepStrictEqual(nel, [{ nome: 'Zio Piero', dedica: '', immagine: 'Ulivo' },
                               { nome: 'Nonna Lina', dedica: 'Ti pensiamo ogni giorno', immagine: 'Rosa' }]);
  assert.ok(!JSON.stringify(nel).includes('carla') && !JSON.stringify(nel).includes('Carla'));
});

controllo('«Togli la dedica» la toglie dal giardino, segna la data e avvisa la segreteria; rispuntarla non la rimette', () => {
  const { script, schede, email } = nuovoScript({});
  script.doPost(dedica());
  spunta(schede.Dediche, 1, true);
  const codice = codiceDa(email.find(m => m.to === 'carla@example.org').body, 'togli');
  const prima = email.length;
  const esito = json(script.doGet({ parameter: { togli: codice } }));
  assert.strictEqual(esito.success, true, esito.testo);
  const r = righe(schede.Dediche)[0];
  assert.strictEqual(r['Nel giardino'], false);
  assert.ok(data(r['Tolta il']), 'manca la data in «Tolta il»');
  assert.strictEqual(email.length, prima + 1);
  assert.deepStrictEqual([email[prima].to, email[prima].subject], [SEGRETERIA, 'Dedica tolta dal giardino: Nonna Lina']);
  spunta(schede.Dediche, 1, true);
  assert.deepStrictEqual(giardino(script), [], 'finché c’è «Tolta il» la dedica non torna nel giardino');
  assert.strictEqual(json(script.doGet({ parameter: { togli: codice } })).success, true);
  assert.strictEqual(email.length, prima + 1, 'la seconda volta non c’è niente di nuovo da dire alla segreteria');
});

controllo('un collegamento per togliere con la firma sbagliata non tocca niente', () => {
  const { script, schede, email } = nuovoScript({});
  script.doPost(dedica());
  spunta(schede.Dediche, 1, true);
  const codice = codiceDa(email.find(m => m.to === 'carla@example.org').body, 'togli').split('.')[0];
  for (const falso of [codice + '.firmafalsa', codice, '']) {
    const esito = json(script.doGet({ parameter: { togli: falso || 'x.y' } }));
    assert.strictEqual(esito.success, false, falso);
  }
  assert.strictEqual(giardino(script).length, 1);
});

controllo('senza JavaScript chi manda la dedica vede la pagina di ringraziamento', () => {
  const { script } = nuovoScript({});
  const pagina = script.doPost({ parameter: Object.assign({}, dedica().parameter, { _js: '' }) });
  assert.ok(pagina && typeof pagina.html === 'string' && pagina.html.includes('La tua dedica è arrivata'), JSON.stringify(pagina).slice(0, 200));
});

controllo('un progetto entra nella scheda «Progetti» e la segreteria riceve l’avviso', () => {
  const { script, schede, email } = nuovoScript({});
  const risposta = json(script.doPost(progetto()));
  assert.deepStrictEqual([risposta.success, risposta.progetto, risposta.conferma], [true, true, false]);
  const r = righe(schede.Progetti)[0];
  assert.deepStrictEqual([r['Progetto'], r['A che punto è'], r['Chi lo propone'], r['Ente o gruppo'], r['Email'], r['Stato']],
    ['Orto in comune', 'Un’idea', 'Paolo', 'Associazione del quartiere', 'paolo@example.org', 'da leggere']);
  assert.strictEqual(righe(schede.Contatti).length, 0, 'senza la casella delle notizie nessuna riga nei Contatti');
  assert.strictEqual(email.length, 1);
  assert.deepStrictEqual([email[0].to, email[0].replyTo, email[0].subject], [SEGRETERIA, 'paolo@example.org', 'Progetto dal sito: Orto in comune']);
});

controllo('«A che punto è» accetta solo le risposte del modulo', () => {
  const { script, schede } = nuovoScript({});
  script.doPost(progetto({ fase: 'Una risposta inventata' }));
  assert.strictEqual(righe(schede.Progetti)[0]['A che punto è'], '');
});

controllo('chi presenta un progetto e chiede le notizie ha anche la riga «notizie» e l’email di conferma', () => {
  const { script, schede, email } = nuovoScript({});
  assert.strictEqual(json(script.doPost(progetto({ notizie: 'si', consenso: CONSENSO }))).conferma, true);
  const r = righe(schede.Contatti)[0];
  assert.deepStrictEqual([r['Richiesta'], r['Pagina'], r['Nome'], r['Stato']], ['notizie', 'progetti/presenta-il-tuo-progetto', 'Paolo', 'da confermare']);
  const conferma = email.find(m => m.to === 'paolo@example.org');
  assert.ok(conferma && conferma.body.includes('ci hai presentato un progetto'), conferma && conferma.body);
});

controllo('senza nome del progetto, descrizione o nome di chi lo propone, il progetto non entra', () => {
  const { script, schede, email } = nuovoScript({});
  for (const altro of [{ progetto: '' }, { descrizione: ' ' }, { nome: '' }]) {
    assert.strictEqual(json(script.doPost(progetto(altro))).error, 'campi', JSON.stringify(altro));
  }
  assert.ok(!schede.Progetti || righe(schede.Progetti).length === 0);
  assert.strictEqual(email.length, 0);
});

controllo('il riquadro delle notizie senza la casella «sì» non iscrive nessuno', () => {
  const { script, schede, email } = nuovoScript({});
  const risposta = json(script.doPost(dalSito({ tipo: 'notizie', email: 'lettore@example.org', consenso: CONSENSO })));
  assert.deepStrictEqual([risposta.success, risposta.error], [false, 'campi']);
  assert.strictEqual(righe(schede.Contatti).length, 0);
  assert.strictEqual(email.length, 0);
});

controllo('«Cancellami» ritira il consenso in tutte le righe di quell’indirizzo, e il messaggio resta da rispondere', () => {
  const { script, schede, email } = nuovoScript({});
  script.doPost(messaggio({ notizie: 'si', consenso: CONSENSO }));
  script.doPost(dalSito({ tipo: 'notizie', notizie: 'si', email: 'carla@example.org', consenso: CONSENSO, pagina: 'home' }));
  const cancella = codiceDa(email.find(m => m.to === 'carla@example.org').body, 'cancella');
  assert.strictEqual(json(script.doGet({ parameter: { cancella } })).success, true);
  const [contatto, iscrizione] = righe(schede.Contatti);
  assert.deepStrictEqual([contatto['Consenso alle notizie'], contatto['Stato']], ['ritirato', 'da rispondere']);
  assert.deepStrictEqual([iscrizione['Consenso alle notizie'], iscrizione['Stato']], ['ritirato', 'cancellato']);
});

controllo('«Confermo» e «Cancellami» con la firma sbagliata non toccano niente', () => {
  const { script, schede, email } = nuovoScript({});
  script.doPost(dalSito({ tipo: 'notizie', notizie: 'si', email: 'lettore@example.org', consenso: CONSENSO }));
  const corpo = email[0].body;
  const conferma = codiceDa(corpo, 'conferma'), cancella = codiceDa(corpo, 'cancella');
  const altroIndirizzo = script.base64url('altro@example.org');
  for (const [nome, codice] of [['conferma', conferma.slice(0, -2) + 'xx'], ['conferma', altroIndirizzo + conferma.slice(conferma.indexOf('.'))],
                                ['cancella', cancella.slice(0, -2) + 'xx'], ['cancella', altroIndirizzo + cancella.slice(cancella.indexOf('.'))]]) {
    assert.strictEqual(json(script.doGet({ parameter: { [nome]: codice } })).success, false, nome + ' ' + codice);
  }
  const r = righe(schede.Contatti)[0];
  assert.deepStrictEqual([r['Consenso alle notizie'], r['Stato'], r['Email confermata il']], ['sì', 'da confermare', '']);
});

controllo('un collegamento di conferma di più di trenta giorni fa è scaduto', () => {
  const { script, schede } = nuovoScript({});
  script.doPost(dalSito({ tipo: 'notizie', notizie: 'si', email: 'lettore@example.org', consenso: CONSENSO }));
  const quando = String(Math.floor(Date.now() / 1000) - 31 * 24 * 60 * 60);
  const vecchio = script.base64url('lettore@example.org') + '.' + quando + '.' + script.firma('lettore@example.org|' + quando);
  const esito = json(script.doGet({ parameter: { conferma: vecchio } }));
  assert.strictEqual(esito.success, false);
  assert.ok(esito.testo.includes('scaduto'), esito.testo);
  assert.strictEqual(righe(schede.Contatti)[0]['Email confermata il'], '');
});

controllo('con il servizio Gmail acceso l’email di conferma parte da segreteria@, con il nome della Fondazione', () => {
  const { script, email, gmail } = nuovoScript({}, { gmail: true });
  script.doPost(dalSito({ tipo: 'notizie', notizie: 'si', email: 'lettore@example.org', consenso: CONSENSO }));
  assert.strictEqual(email.length, 0, 'la conferma non doveva partire dal proprietario del foglio');
  assert.strictEqual(gmail.length, 1);
  const grezzo = Buffer.from(gmail[0].raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  const [intestazioni, corpo] = grezzo.split('\r\n\r\n');
  const riga = nome => (intestazioni.split('\r\n').find(r => r.startsWith(nome + ': ')) || '').slice(nome.length + 2);
  const parola = t => t.replace(/=\?UTF-8\?B\?([^?]+)\?=/g, (_, b) => Buffer.from(b, 'base64').toString('utf8'));
  assert.strictEqual(parola(riga('From')), 'Fondazione La Rosa d’Oro <segreteria@larosadoro.org>');
  assert.deepStrictEqual([riga('To'), riga('Reply-To')], ['lettore@example.org', SEGRETERIA]);
  assert.strictEqual(parola(riga('Subject')), 'Conferma la tua email per le notizie della Fondazione');
  assert.ok(Buffer.from(corpo.replace(/\r\n/g, ''), 'base64').toString('utf8').includes(PROVA + 'contatti/index.html?conferma='));
});

controllo('l’indirizzo dello script aperto nel browser rimanda al sito', () => {
  const { script } = nuovoScript({});
  const pagina = script.doGet({ parameter: {} });
  assert.ok(pagina.html.includes('href="https://larosadoro.org/"'), pagina.html.slice(0, 200));
});


/* ---- si parte ---- */

let falliti = 0;
for (const { descrizione, prova } of controlli) {
  try {
    prova();
    console.log('  ok  ' + descrizione);
  } catch (e) {
    falliti++;
    console.log('  NO  ' + descrizione + '\n        ' + String(e.message || e).split('\n')[0].slice(0, 300));
  }
}
console.log(falliti ? '%d controlli dello script del foglio su %d non passano' : 'Script del foglio: %d controlli passati su %d',
            falliti || controlli.length, controlli.length);
process.exit(falliti ? 1 : 0);
