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
  const larghezza = () => dati.reduce((m, r) => Math.max(m, r.length), 0);
  const intervallo = (r, c, nr, nc) => ({
    getValues: () => Array.from({ length: nr || 1 }, (_, i) =>
      Array.from({ length: nc || 1 }, (_, j) => { const v = (dati[r - 1 + i] || [])[c - 1 + j]; return v === undefined ? '' : v; })),
    setValues(valori) {
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
    nome, dati,
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

function nuovoScript(proprieta) {
  const schede = { Contatti: foglioFinto('Contatti', [TITOLI_CONTATTI]) };
  const email = [];
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
  vm.createContext(contesto);
  vm.runInContext(SORGENTE, contesto, { filename: 'foglio-contatti.gs' });
  return { script: contesto, schede, email, prop };
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
