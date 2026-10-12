/**
 * @OnlyCurrentDoc
 *
 * Fondazione La Rosa d’Oro ETS — lo script del foglio «Contatti della Fondazione»
 * ---------------------------------------------------------------------------
 * Riceve i messaggi del modulo dei Contatti del sito e li scrive nel foglio,
 * una riga per messaggio. Poi:
 *   - manda l’avviso alla segreteria, con «Rispondi» che va a chi ha scritto;
 *   - se la persona ha chiesto le notizie, le manda un’email per confermare
 *     l’indirizzo (doppia conferma): il collegamento porta alla pagina Contatti
 *     del sito, dove si tocca «Confermo». Le notizie vanno solo a chi conferma.
 * Riceve anche le dediche del giardino dei ricordi, nella scheda «Dediche»
 * (la crea da sé al primo arrivo), e avvisa la segreteria. Una dedica entra nel
 * giardino quando si spunta la sua casella «Nel giardino»: il sito chiede ogni
 * ora le dediche spuntate (?giardino=1) e le posa nella pagina. Togliendo la
 * spunta, la dedica esce dal giardino alla pubblicazione successiva.
 *
 * Dove sta: nel foglio, dal menu Estensioni → Apps Script. Si pubblica come
 * «App web», eseguita come il proprietario del foglio, accessibile a chiunque:
 * l’indirizzo che Google dà alla pubblicazione va in FOGLIO, in costruisci.py.
 * Dopo ogni modifica di questo file: Distribuisci → Gestisci distribuzioni →
 * matita → Versione: nuova versione. L’indirizzo resta lo stesso.
 *
 * L’originale sta nel repository del sito, in sorgenti/foglio-contatti.gs:
 * si cambia lì e si ricopia qui. Accanto c’è foglio-contatti-appsscript.json,
 * il manifesto del progetto (permessi e servizio Gmail), che va in appsscript.json.
 */

var SCHEDA = 'Contatti';                          // il nome della scheda dove arrivano le righe
var AVVISI_A = 'segreteria@larosadoro.org';       // chi riceve l’avviso di ogni messaggio
var MITTENTE = 'Fondazione La Rosa d’Oro';        // il nome che compare come mittente
var DA = 'segreteria@larosadoro.org';             // l’indirizzo da cui partono le email di conferma: deve essere
                                                  // tra gli indirizzi «Invia come» della posta del proprietario del foglio
var SITI = ['https://larosadoro.org/', 'https://eliasminotti.github.io/rosadoro/'];   // i soli indirizzi del sito
                                                  // a cui portano i collegamenti di conferma; il primo vale se il modulo non dice da dove arriva
var FUSO = 'Europe/Rome';
var GIORNI_CONFERMA = 30;                         // per quanti giorni vale il collegamento di conferma

// i nomi delle colonne, come sono scritti nella prima riga del foglio
var C = {
  arrivato: 'Arrivato il', fonte: 'Fonte', pagina: 'Pagina', richiesta: 'Richiesta',
  nome: 'Nome', email: 'Email', messaggio: 'Messaggio', interessi: 'Interessi',
  consenso: 'Consenso alle notizie', testoConsenso: 'Testo del consenso',
  confermata: 'Email confermata il', ente: 'Ente', stato: 'Stato'
};

var MASSIMO = { nome: 200, email: 254, oggetto: 200, messaggio: 8000, pagina: 200, versione: 60,
                ricordo: 120, dedica: 600, immagine: 80 };

// la scheda delle dediche del giardino dei ricordi, con i nomi delle sue colonne
var SCHEDA_DEDICHE = 'Dediche';
var D = {
  arrivata: 'Arrivata il', ricordo: 'In memoria di', dedica: 'Dedica', immagine: 'Immagine',
  nome: 'Chi scrive', email: 'Email', consenso: 'Consenso', giardino: 'Nel giardino'
};

var EMAIL = /^[^@\s,;<>"()\[\]]+@[^@\s,;<>"()\[\]]+\.[^@\s,;<>"()\[\]]+$/;


/* ---- 1. il messaggio che arriva dal sito ---- */

function doPost(e) {
  var p = (e && e.parameter) || {};
  var conJs = p._js === '1';                       // il sito con JavaScript vuole una risposta JSON
  try {
    if (p._gotcha) return rispondi(conJs, { success: true, dedica: p.tipo === 'dedica' });   // la trappola: si finge di accettare
    if (p.tipo === 'dedica') return riceviDedica(p, conJs);
    var nome = pulisci(p.nome, MASSIMO.nome);
    var email = pulisci(p.email, MASSIMO.email).toLowerCase();
    var oggetto = pulisci(p.oggetto, MASSIMO.oggetto);
    var messaggio = pulisci(p.messaggio, MASSIMO.messaggio, true);
    var pagina = pulisci(p.pagina, MASSIMO.pagina).replace(/[^a-z0-9\/\-_.]/gi, '');
    var notizie = p.notizie === 'si' || p.notizie === 'sì';
    var versione = pulisci(p.consenso, MASSIMO.versione);
    var sito = SITI.indexOf(p._sito) >= 0 ? p._sito : SITI[0];

    if (!EMAIL.test(email)) return rispondi(conJs, { success: false, error: 'email' });
    if (!nome || !messaggio) return rispondi(conJs, { success: false, error: 'campi' });

    var adesso = new Date();
    var riga = {};
    riga[C.arrivato] = adesso;
    riga[C.fonte] = 'Sito';
    riga[C.pagina] = pagina ? testo(pagina) : '';
    riga[C.richiesta] = 'contatto';
    riga[C.nome] = testo(nome);
    riga[C.email] = testo(email);
    riga[C.messaggio] = testo(oggetto ? 'Oggetto: ' + oggetto + '\n\n' + messaggio : messaggio);
    riga[C.consenso] = notizie ? 'sì' : 'no';
    riga[C.testoConsenso] = notizie ? testo(versione) : '';
    riga[C.ente] = 'Fondazione';
    riga[C.stato] = 'da rispondere';
    scriviRiga(riga);

    avvisaLaSegreteria({ nome: nome, email: email, oggetto: oggetto, messaggio: messaggio,
                         pagina: pagina, notizie: notizie, quando: adesso });
    var conferma = notizie ? chiediConferma(email, sito) : false;
    return rispondi(conJs, { success: true, conferma: conferma });
  } catch (errore) {
    console.error(errore);
    return rispondi(conJs, { success: false });
  }
}

function scriviRiga(riga) {
  var foglio = SpreadsheetApp.getActive().getSheetByName(SCHEDA);
  if (!foglio) throw new Error('Manca la scheda «' + SCHEDA + '»');
  var blocco = LockService.getScriptLock();
  blocco.waitLock(20000);                          // due messaggi insieme non si scrivono sulla stessa riga
  try {
    var titoli = foglio.getRange(1, 1, 1, foglio.getLastColumn()).getValues()[0];
    var valori = titoli.map(function (t) { return riga.hasOwnProperty(t) ? riga[t] : ''; });
    foglio.getRange(foglio.getLastRow() + 1, 1, 1, valori.length).setValues([valori]);
    SpreadsheetApp.flush();
  } finally {
    blocco.releaseLock();
  }
}

function avvisaLaSegreteria(m) {
  var righe = [
    'Nuovo messaggio dal modulo dei Contatti del sito.',
    '',
    'Nome: ' + m.nome,
    'Email: ' + m.email,
    m.oggetto ? 'Oggetto: ' + m.oggetto : null,
    m.pagina ? 'Arrivato dalla pagina: ' + m.pagina : null,
    'Notizie per email: ' + (m.notizie ? 'sì, in attesa che confermi l’indirizzo' : 'no'),
    'Quando: ' + Utilities.formatDate(m.quando, FUSO, 'dd/MM/yyyy HH:mm'),
    '',
    m.messaggio,
    '',
    '—',
    'Per rispondere basta «Rispondi»: la risposta va a ' + m.email + '.',
    'Il messaggio è anche nel foglio «Contatti della Fondazione»: ' + SpreadsheetApp.getActive().getUrl()
  ].filter(function (r) { return r !== null; });
  MailApp.sendEmail({
    to: AVVISI_A,
    replyTo: m.email,
    name: 'Sito della Fondazione',
    subject: 'Messaggio dal sito: ' + m.nome + (m.oggetto ? ' · ' + m.oggetto : ''),
    body: righe.join('\n')
  });
}


/* ---- 2. la dedica del giardino dei ricordi ---- */

function riceviDedica(p, conJs) {
  var ricordo = pulisci(p.ricordo, MASSIMO.ricordo);
  var dedica = pulisci(p.dedica, MASSIMO.dedica, true);
  var immagine = pulisci(p.immagine, MASSIMO.immagine);
  var nome = pulisci(p.nome, MASSIMO.nome);
  var email = pulisci(p.email, MASSIMO.email).toLowerCase();
  if (!EMAIL.test(email)) return rispondi(conJs, { success: false, error: 'email', dedica: true });
  if (!ricordo || !nome || p.consenso !== 'si') return rispondi(conJs, { success: false, error: 'campi', dedica: true });

  var adesso = new Date();
  var riga = {};
  riga[D.arrivata] = adesso;
  riga[D.ricordo] = testo(ricordo);
  riga[D.dedica] = testo(dedica);
  riga[D.immagine] = testo(immagine);
  riga[D.nome] = testo(nome);
  riga[D.email] = testo(email);
  riga[D.consenso] = 'sì';
  riga[D.giardino] = false;                       // la casella: la spunta chi legge la dedica
  scriviDedica(riga);

  avvisaPerLaDedica({ ricordo: ricordo, dedica: dedica, immagine: immagine, nome: nome, email: email, quando: adesso });
  return rispondi(conJs, { success: true, dedica: true });
}

/* la scheda «Dediche»: se non c’è ancora, nasce qui, con i titoli delle colonne */
function schedaDediche() {
  var libro = SpreadsheetApp.getActive();
  var foglio = libro.getSheetByName(SCHEDA_DEDICHE);
  if (foglio) return foglio;
  foglio = libro.insertSheet(SCHEDA_DEDICHE);
  var titoli = Object.keys(D).map(function (k) { return D[k]; });
  foglio.getRange(1, 1, 1, titoli.length).setValues([titoli]).setFontWeight('bold');
  foglio.setFrozenRows(1);
  return foglio;
}

function scriviDedica(riga) {
  var blocco = LockService.getScriptLock();
  blocco.waitLock(20000);
  try {
    var foglio = schedaDediche();
    var titoli = foglio.getRange(1, 1, 1, foglio.getLastColumn()).getValues()[0];
    var valori = titoli.map(function (t) { return riga.hasOwnProperty(t) ? riga[t] : ''; });
    var n = foglio.getLastRow() + 1;
    foglio.getRange(n, 1, 1, valori.length).setValues([valori]);
    var cGiardino = titoli.indexOf(D.giardino);
    if (cGiardino >= 0) foglio.getRange(n, cGiardino + 1).insertCheckboxes();
    SpreadsheetApp.flush();
  } finally {
    blocco.releaseLock();
  }
}

function avvisaPerLaDedica(m) {
  var righe = [
    'Nuova dedica dal giardino dei ricordi del sito.',
    '',
    'In memoria di: ' + m.ricordo,
    'Immagine scelta: ' + (m.immagine || '(nessuna)'),
    'Dedica: ' + (m.dedica || '(senza dedica)'),
    '',
    'Chi scrive: ' + m.nome + ', ' + m.email,
    'Ha dichiarato di essere un familiare, o comunque una persona che ha titolo a ricordarla, e ha acconsentito alla pubblicazione del nome e della dedica.',
    'Quando: ' + Utilities.formatDate(m.quando, FUSO, 'dd/MM/yyyy HH:mm'),
    '',
    '—',
    'La dedica entra nel giardino quando spunti la sua casella «Nel giardino», nella scheda «Dediche» del foglio: il sito la mostra entro un’ora. Per toglierla, togli la spunta.',
    'Per rispondere a chi ha scritto basta «Rispondi»: la risposta va a ' + m.email + '.',
    'Il foglio: ' + SpreadsheetApp.getActive().getUrl()
  ];
  MailApp.sendEmail({
    to: AVVISI_A,
    replyTo: m.email,
    name: 'Sito della Fondazione',
    subject: 'Dedica per il giardino: ' + m.ricordo,
    body: righe.join('\n')
  });
}

/* le dediche con la casella «Nel giardino» spuntata, le più recenti prima: solo il nome ricordato,
   la dedica e l’immagine, mai chi scrive. Le chiede il sito, a ogni pubblicazione e ogni ora */
function dedicheNelGiardino() {
  var foglio = SpreadsheetApp.getActive().getSheetByName(SCHEDA_DEDICHE);
  if (!foglio || foglio.getLastRow() < 2) return { success: true, dediche: [] };
  var dati = foglio.getDataRange().getValues();
  var titoli = dati[0];
  var cRicordo = titoli.indexOf(D.ricordo), cDedica = titoli.indexOf(D.dedica),
      cImmagine = titoli.indexOf(D.immagine), cGiardino = titoli.indexOf(D.giardino);
  if (cRicordo < 0 || cGiardino < 0) return { success: true, dediche: [] };
  var dediche = [];
  for (var i = dati.length - 1; i >= 1; i--) {
    var spunta = dati[i][cGiardino];
    if (spunta !== true && String(spunta).trim().toLowerCase() !== 'sì') continue;
    var ricordo = String(dati[i][cRicordo]).trim();
    if (!ricordo) continue;
    dediche.push({
      nome: ricordo.slice(0, MASSIMO.ricordo),
      dedica: cDedica < 0 ? '' : String(dati[i][cDedica]).trim().slice(0, MASSIMO.dedica),
      immagine: cImmagine < 0 ? '' : String(dati[i][cImmagine]).trim().slice(0, MASSIMO.immagine)
    });
  }
  return { success: true, dediche: dediche };
}


/* ---- 3. la conferma dell’indirizzo per le notizie ---- */

function chiediConferma(email, sito) {
  // senza il nome di chi scrive: il modulo è aperto a tutti, e l’email di conferma non deve portare
  // a un indirizzo qualsiasi parole scritte da altri
  var memoria = CacheService.getScriptCache();
  var chiave = 'conferma-' + firma(email).slice(0, 32);
  if (memoria.get(chiave)) return true;            // una sola email di conferma ogni sei ore per indirizzo
  var quando = String(Math.floor(Date.now() / 1000));
  var codice = base64url(email) + '.' + quando + '.' + firma(email + '|' + quando);
  var collegamento = sito + 'contatti/index.html?conferma=' + codice;
  manda({
    to: email,
    subject: 'Conferma la tua email per le notizie della Fondazione',
    body: [
      'Buongiorno,',
      '',
      'ci hai scritto dal sito della Fondazione La Rosa d’Oro e hai chiesto di ricevere, ogni tanto, le nostre notizie per email. Per confermare che questo indirizzo è tuo apri il collegamento qui sotto e tocca «Confermo»:',
      '',
      collegamento,
      '',
      'Se la richiesta non viene da te, o hai cambiato idea, non fare niente: non ti manderemo notizie. Al messaggio che ci hai scritto rispondiamo comunque di persona.',
      '',
      'Fondazione La Rosa d’Oro ETS',
      AVVISI_A
    ].join('\n')
  });
  memoria.put(chiave, '1', 6 * 60 * 60);
  return true;
}

/* la pagina Contatti del sito, quando si tocca «Confermo», chiede qui con ?conferma=…;
   la pubblicazione del sito chiede le dediche del giardino con ?giardino=1 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.giardino) {
    return ContentService.createTextOutput(JSON.stringify(dedicheNelGiardino())).setMimeType(ContentService.MimeType.JSON);
  }
  if (p.conferma) {
    var esito = confermaNotizie(String(p.conferma));
    return ContentService.createTextOutput(JSON.stringify(esito)).setMimeType(ContentService.MimeType.JSON);
  }
  return pagina('Il modulo del sito',
    '<p>Questo indirizzo riceve i messaggi del modulo dei Contatti. Per scriverci, passa dal <a href="' + SITI[0] + '">sito della Fondazione</a>.</p>');
}

function confermaNotizie(codice) {
  var parti = codice.split('.');
  var email;
  try { email = Utilities.newBlob(Utilities.base64DecodeWebSafe(conUguali(parti[0]))).getDataAsString().toLowerCase(); }
  catch (x) { email = ''; }
  if (parti.length !== 3 || !email || firma(email + '|' + parti[1]) !== parti[2]) {
    return { success: false, testo: 'Il collegamento non è valido. Scrivici a ' + AVVISI_A + '.' };
  }
  if (Date.now() / 1000 - Number(parti[1]) > GIORNI_CONFERMA * 24 * 60 * 60) {
    return { success: false, testo: 'Il collegamento è scaduto. Scrivici di nuovo dal modulo qui sotto e spunta ancora la casella delle notizie.' };
  }
  var foglio = SpreadsheetApp.getActive().getSheetByName(SCHEDA);
  var blocco = LockService.getScriptLock();
  blocco.waitLock(20000);
  try {
    var dati = foglio.getDataRange().getValues();
    var titoli = dati[0];
    var cEmail = titoli.indexOf(C.email), cConsenso = titoli.indexOf(C.consenso),
        cConfermata = titoli.indexOf(C.confermata), cRichiesta = titoli.indexOf(C.richiesta),
        cStato = titoli.indexOf(C.stato);
    var trovate = 0;
    for (var i = 1; i < dati.length; i++) {
      if (String(dati[i][cEmail]).trim().toLowerCase() !== email) continue;
      if (dati[i][cConsenso] !== 'sì') continue;
      trovate++;
      if (!dati[i][cConfermata]) foglio.getRange(i + 1, cConfermata + 1).setValue(new Date());
      if (dati[i][cRichiesta] === 'notizie') foglio.getRange(i + 1, cStato + 1).setValue('iscritto');
    }
    SpreadsheetApp.flush();
    if (!trovate) return { success: false, testo: 'Non troviamo la tua richiesta. Scrivici a ' + AVVISI_A + '.' };
    return { success: true, testo: 'Grazie, il tuo indirizzo è confermato. Ti scriveremo solo quando avremo qualcosa da raccontarti.' };
  } finally {
    blocco.releaseLock();
  }
}


/* ---- 4. da eseguire una volta dall’editor, prima di pubblicare ---- */

function prepara() {
  segreto();
  var foglio = SpreadsheetApp.getActive().getSheetByName(SCHEDA);
  if (!foglio) throw new Error('Manca la scheda «' + SCHEDA + '»');
  var titoli = foglio.getRange(1, 1, 1, foglio.getLastColumn()).getValues()[0];
  var mancano = Object.keys(C).map(function (k) { return C[k]; })
                      .filter(function (t) { return titoli.indexOf(t) < 0; });
  if (mancano.length) throw new Error('Nella prima riga mancano le colonne: ' + mancano.join(', '));
  schedaDediche();
  console.log('Tutto pronto: ora si pubblica come App web.');
}


/* ---- 5. gli attrezzi ---- */

function rispondi(conJs, dati) {
  if (conJs) return ContentService.createTextOutput(JSON.stringify(dati)).setMimeType(ContentService.MimeType.JSON);
  // senza JavaScript il browser mostra questa pagina
  if (dati.dedica) {
    if (dati.success) {
      return pagina('Grazie', '<p>La tua dedica è arrivata. La leggiamo e la posiamo nel giardino, accanto all’immagine che hai scelto.</p>' +
        '<p>Per tornare al sito usa il tasto «Indietro» del browser.</p>');
    }
    return pagina('La dedica non è partita', '<p>' + (dati.error === 'email'
      ? 'Controlla la tua email: l’indirizzo non sembra completo.'
      : 'Controlla di aver scritto il nome da ricordare, il tuo nome e la tua email, e di aver spuntato la casella.') +
      ' Torna indietro con il tasto «Indietro» del browser, oppure scrivici a ' + AVVISI_A + '.</p>');
  }
  if (dati.success) {
    return pagina('Grazie', '<p>Il tuo messaggio è arrivato. Ti rispondiamo di persona, all’indirizzo che ci hai lasciato.</p>' +
      (dati.conferma ? '<p>Per le notizie ti abbiamo mandato un’email: aprila e tocca «Confermo».</p>' : '') +
      '<p>Per tornare al sito usa il tasto «Indietro» del browser.</p>');
  }
  return pagina('Il messaggio non è partito', '<p>' + (dati.error === 'email'
    ? 'Controlla la tua email: l’indirizzo non sembra completo.'
    : 'Controlla di aver scritto il nome, l’email e il messaggio.') +
    ' Torna indietro con il tasto «Indietro» del browser, oppure scrivici a ' + AVVISI_A + '.</p>');
}

function pagina(titolo, corpo) {
  var html = '<!doctype html><html lang="it"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"><title>' + titolo + '</title>' +
    '<style>body{margin:0;background:#FAF6EE;color:#1C1C1C;font:17px/1.6 Helvetica,Arial,sans-serif}' +
    'main{max-width:560px;margin:0 auto;padding:48px 20px}' +
    'h1{font:400 34px/1.2 Georgia,serif;margin:0 0 20px}a{color:#8D6E2A}' +
    'button{font:500 12px/16px Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:15px 28px;' +
    'border:1px solid #1C1C1C;background:#1C1C1C;color:#FAF6EE;cursor:pointer}button:disabled{opacity:.6}' +
    '#esito:not(:empty){border-left:1px solid #B88F3D;padding:2px 0 2px 20px}</style></head>' +
    '<body><main><h1>' + titolo + '</h1>' + corpo + '<p><small>Fondazione La Rosa d’Oro ETS</small></p></main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle(titolo)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* manda un’email a chi ha scritto, dall’indirizzo DA, con il servizio Gmail (permesso: solo inviare).
   Se il servizio non è acceso o l’invio non riesce, parte come prima, dal proprietario del foglio,
   con le risposte che vanno ad AVVISI_A: la conferma arriva comunque */
function manda(m) {
  if (typeof Gmail !== 'undefined') {
    try {
      var b64 = function (t) { return Utilities.base64Encode(t, Utilities.Charset.UTF_8); };
      // nelle intestazioni le lettere accentate e l’apostrofo ’ viaggiano in codice
      var parole = function (t) { return /^[ -~]*$/.test(t) ? t : '=?UTF-8?B?' + b64(t) + '?='; };
      var intestazioni = [
        'From: ' + parole(MITTENTE) + ' <' + DA + '>',
        'To: ' + m.to,
        'Reply-To: ' + AVVISI_A,
        'Subject: ' + parole(m.subject),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64'
      ];
      var corpo = b64(m.body).replace(/(.{76})/g, '$1\r\n');
      var grezzo = intestazioni.join('\r\n') + '\r\n\r\n' + corpo;
      Gmail.Users.Messages.send({ raw: Utilities.base64EncodeWebSafe(grezzo) }, 'me');
      return;
    } catch (errore) {
      console.error(errore);
    }
  }
  MailApp.sendEmail({ to: m.to, replyTo: AVVISI_A, name: MITTENTE, subject: m.subject, body: m.body });
}

/* toglie gli spazi in eccesso e taglia i testi troppo lunghi */
function pulisci(v, massimo, aCapo) {
  var s = String(v == null ? '' : v).replace(/\r\n?/g, '\n');
  s = aCapo ? s.replace(/[^\S\n]+/g, ' ') : s.replace(/\s+/g, ' ');
  return s.trim().slice(0, massimo);
}

/* l’apostrofo davanti dice al foglio «questo è testo»: niente formule, date o numeri inventati */
function testo(s) {
  return s ? "'" + s : '';
}

function segreto() {
  var prop = PropertiesService.getScriptProperties();
  var s = prop.getProperty('SEGRETO');
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    prop.setProperty('SEGRETO', s);
  }
  return s;
}

function firma(testoDaFirmare) {
  return base64url(Utilities.computeHmacSha256Signature(testoDaFirmare, segreto(), Utilities.Charset.UTF_8));
}

function base64url(v) {
  var s = typeof v === 'string' ? Utilities.base64EncodeWebSafe(v, Utilities.Charset.UTF_8) : Utilities.base64EncodeWebSafe(v);
  return s.replace(/=+$/, '');
}

function conUguali(s) {
  s = String(s || '');
  while (s.length % 4) s += '=';
  return s;
}
