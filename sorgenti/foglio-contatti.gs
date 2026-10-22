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
 * Riceve i progetti della pagina «Presentaci il tuo progetto», nella scheda
 * «Progetti» (anche questa nasce da sé), e avvisa la segreteria.
 * Riceve infine le iscrizioni alle notizie dal riquadro in fondo alle pagine:
 * una riga nella scheda dei Contatti, con la richiesta «notizie», e la stessa
 * email di conferma. Chi presenta un progetto può chiedere le notizie con una
 * casella, come nei Contatti.
 * E riceve le iscrizioni di chi dona a Lux e spunta la casella delle notizie: le manda il server di Lux,
 * solo dopo che il pagamento è confermato, firmate con il segreto SEGRETO_LUX (nelle proprietà dello
 * script e in Vercel). Diventano righe «notizie» con Fonte «LUX», con la stessa email di conferma.
 * Due cose vanno da sole, senza passare dalla segreteria:
 *   - chi riceve le notizie si cancella con il collegamento «Cancellami» (è
 *     nell’email di conferma, e nella colonna «Per cancellarsi», da mettere in
 *     fondo a ogni email delle notizie);
 *   - chi scrive una dedica riceve un’email con il collegamento per toglierla.
 * Prima di scrivere o mandare qualcosa, ogni invio dei moduli passa dal controllo contro i programmi automatici
 * (Elias, 22.10): campo trappola, link nel nome o nell’oggetto, troppa fretta, troppi invii dallo stesso indirizzo,
 * Cloudflare Turnstile. Spam e sospetti vanno nella scheda «Spam», senza avvisi né email (vedi controllaInvio).
 * Le colonne nuove le aggiunge lo script stesso, la prima volta che servono.
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
var MINUTI_LUX = 10;                              // per quanti minuti vale la firma di una richiesta di Lux
var GIORNI_TRA_CONFERME = 3;                      // al massimo un’email di conferma delle notizie per indirizzo ogni tre giorni

// la protezione dei moduli dai programmi automatici (Elias, 22.10)
var SECONDI_MINIMI = 3;                           // un modulo mandato prima, dall’apertura della pagina, non l’ha scritto una persona
var INVII_ORA = 5;                                // invii in un’ora dallo stesso indirizzo, da tutti i moduli insieme; oltre, spam
var TRAPPOLE = ['sito_web', '_gotcha'];           // i campi trappola: le persone non li vedono, i programmi li riempiono
var TURNSTILE = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';   // dove Cloudflare verifica le risposte di
                                                  // Turnstile; la chiave segreta sta nelle proprietà dello script, TURNSTILE_SEGRETO.
                                                  // Si mette solo quando il sito con la chiave pubblica è già online: da quel
                                                  // momento un invio senza la risposta di Turnstile non entra
// in quali campi un link o del codice è spam (il nome, l’oggetto, il titolo) e in quali è solo sospetto (il testo).
// Nei progetti «documento» è fatto apposta per un collegamento
var CAMPI = {
  contatto: { nome: ['nome', 'oggetto'], testo: ['messaggio'] },
  progetto: { nome: ['progetto', 'nome', 'ente'], testo: ['descrizione', 'bisogno'] },
  dedica: { nome: ['ricordo', 'nome'], testo: ['dedica'] },
  notizie: { nome: [], testo: [] }
};
var LINK = /https?:\/\/|www\.|href\s*=|<\s*a\b|<\/?[a-z][a-z0-9]*(\s[^<>]*)?\/?>/i;

// i nomi delle colonne, come sono scritti nella prima riga del foglio
var C = {
  arrivato: 'Arrivato il', fonte: 'Fonte', pagina: 'Pagina', richiesta: 'Richiesta',
  nome: 'Nome', email: 'Email', messaggio: 'Messaggio', interessi: 'Interessi',
  consenso: 'Consenso alle notizie', testoConsenso: 'Testo del consenso',
  confermata: 'Email confermata il', ente: 'Ente', stato: 'Stato',
  ritirato: 'Consenso ritirato il', cancella: 'Per cancellarsi'
};

var MASSIMO = { nome: 200, email: 254, oggetto: 200, messaggio: 8000, pagina: 200, versione: 60,
                ricordo: 120, dedica: 600, immagine: 80,
                progetto: 200, fase: 80, descrizione: 8000, bisogno: 2000, documento: 500, ente: 200 };

// la scheda delle dediche del giardino dei ricordi, con i nomi delle sue colonne
var SCHEDA_DEDICHE = 'Dediche';
var D = {
  arrivata: 'Arrivata il', ricordo: 'In memoria di', dedica: 'Dedica', immagine: 'Immagine',
  nome: 'Chi scrive', email: 'Email', consenso: 'Consenso', giardino: 'Nel giardino',
  codice: 'Codice', tolta: 'Tolta il', stato: 'Stato'
};

// la scheda dei progetti proposti dal sito, con i nomi delle sue colonne
var SCHEDA_PROGETTI = 'Progetti';
var P = {
  arrivato: 'Arrivato il', progetto: 'Progetto', fase: 'A che punto è', descrizione: 'Che cosa fa',
  bisogno: 'Di che cosa ha bisogno', documento: 'Documento', nome: 'Chi lo propone', ente: 'Ente o gruppo',
  email: 'Email', stato: 'Stato'
};
// le risposte possibili ad «A che punto è», le stesse del modulo del sito (FASI in costruisci.py)
var FASI = ['Un’idea', 'Un progetto in corso di realizzazione', 'Un progetto che esiste già',
            'Una realtà consolidata che cerca nuovi sviluppi'];

// la scheda dello spam: gli invii scartati dal controllo, con il perché
var SCHEDA_SPAM = 'Spam';
var S = { arrivato: 'Arrivato il', modulo: 'Modulo', perche: 'Perché', nome: 'Nome', email: 'Email', contenuto: 'Contenuto' };

var EMAIL = /^[^@\s,;<>"()\[\]]+@[^@\s,;<>"()\[\]]+\.[^@\s,;<>"()\[\]]+$/;


/* ---- 1. il messaggio che arriva dal sito ---- */

function doPost(e) {
  var p = (e && e.parameter) || {};
  var conJs = p._js === '1';                       // il sito con JavaScript vuole una risposta JSON
  try {
    if (p.tipo === 'lux') return riceviDaLux(p);   // firmata dal server di Lux: il controllo dei moduli non serve
    var modulo = CAMPI.hasOwnProperty(p.tipo) ? p.tipo : 'contatto';
    var controllo = controllaInvio(p, modulo);
    if (controllo.spam) {
      mettiNelloSpam(p, modulo, controllo.spam);
      // senza la risposta di Turnstile la pagina lo deve sapere, e propone di scrivere dalla propria posta;
      // a un programma si finge di accettare
      return rispondi(conJs, { success: !controllo.controllo, error: controllo.controllo ? 'controllo' : undefined,
                               dedica: modulo === 'dedica', progetto: modulo === 'progetto', iscrizione: modulo === 'notizie' });
    }
    var verifica = controllo.verifica || '';
    // l’iscrizione dal riquadro è solo un indirizzo, e senza l’email di conferma non serve: si chiede di riprovare
    if (verifica && modulo === 'notizie') return rispondi(conJs, { success: false, error: 'controllo', iscrizione: true });
    if (modulo === 'dedica') return riceviDedica(p, conJs, verifica);
    if (modulo === 'progetto') return riceviProgetto(p, conJs, verifica);
    if (modulo === 'notizie') return riceviIscrizione(p, conJs);
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
    riga[C.stato] = verifica ? 'da verificare' : 'da rispondere';
    if (notizie) riga[C.cancella] = collegamentoPerCancellarsi(email, sito);
    scriviRiga(riga);

    avvisaLaSegreteria({ nome: nome, email: email, oggetto: oggetto, messaggio: messaggio,
                         pagina: pagina, notizie: notizie, quando: adesso, verifica: verifica });
    var conferma = notizie && !verifica ? chiediConferma(email, sito, 'contatto') : false;
    return rispondi(conJs, { success: true, conferma: conferma });
  } catch (errore) {
    console.error(errore);
    return rispondi(conJs || p.tipo === 'lux', { success: false });   // al server di Lux sempre in JSON
  }
}

function scriviRiga(riga) {
  var foglio = SpreadsheetApp.getActive().getSheetByName(SCHEDA);
  if (!foglio) throw new Error('Manca la scheda «' + SCHEDA + '»');
  var blocco = LockService.getScriptLock();
  blocco.waitLock(20000);                          // due messaggi insieme non si scrivono sulla stessa riga
  try {
    var titoli = titoliCon(foglio, C);
    var valori = titoli.map(function (t) { return riga.hasOwnProperty(t) ? riga[t] : ''; });
    foglio.getRange(foglio.getLastRow() + 1, 1, 1, valori.length).setValues([valori]);
    SpreadsheetApp.flush();
  } finally {
    blocco.releaseLock();
  }
}

/* i titoli della prima riga. Le colonne che la scheda non ha ancora nascono qui: in mezzo alle altre,
   dopo quella che le precede nell’elenco; in fondo, se sono le ultime dell’elenco, così le colonne
   aggiunte a mano da chi usa il foglio restano dove sono */
function titoliCon(foglio, colonne) {
  var nomi = Object.keys(colonne).map(function (k) { return colonne[k]; });
  var ultima = foglio.getLastColumn();
  var titoli = ultima ? foglio.getRange(1, 1, 1, ultima).getValues()[0] : [];
  nomi.forEach(function (nome, i) {
    if (titoli.indexOf(nome) >= 0) return;
    var inMezzo = nomi.slice(i + 1).some(function (n) { return titoli.indexOf(n) >= 0; });
    var dopo = inMezzo && i > 0 ? titoli.indexOf(nomi[i - 1]) : -1;
    if (dopo >= 0) {
      foglio.insertColumnAfter(dopo + 1);
      titoli.splice(dopo + 1, 0, nome);
      foglio.getRange(1, dopo + 2).setValue(nome);
    } else {
      titoli.push(nome);
      foglio.getRange(1, titoli.length).setValue(nome).setFontWeight(foglio.getRange(1, 1).getFontWeight());
    }
  });
  return titoli;
}

/* il controllo di ogni invio dei moduli del sito, prima di scrivere o mandare qualcosa (Elias, 22.10).
   Spam: il campo trappola è pieno, c’è un link o del codice nel nome o nell’oggetto, il modulo è partito meno di
   SECONDI_MINIMI secondi dopo l’apertura della pagina (lo dice sito.js in _tempo), lo stesso indirizzo ha già scritto
   INVII_ORA volte nell’ultima ora, o Cloudflare dice che la risposta di Turnstile non vale. Sospetto: un invio senza
   JavaScript; con Turnstile acceso, un invio senza la sua risposta; un link solo nel testo del messaggio, se Turnstile
   non ha detto «persona». Spam e sospetti tornano come { spam: perché } e vanno nella scheda «Spam», senza avvisi né
   email; senza la risposta di Turnstile anche { controllo: true }, perché la pagina proponga di scrivere dalla propria
   posta e nessun messaggio vero si perda in silenzio. Torna { verifica: perché } quando Turnstile ha detto «persona» ma
   c’è un link nel testo, o quando Cloudflare non risponde: il messaggio entra «da verificare», con l’avviso alla
   segreteria ma senza email a chi l’ha scritto (Elias, 22.10) */
function controllaInvio(p, modulo) {
  var campi = CAMPI[modulo];
  var campo = function (nome) { return String(p[nome] == null ? '' : p[nome]); };
  var conLink = function (nomi) { return nomi.some(function (n) { return LINK.test(campo(n)); }); };
  if (TRAPPOLE.some(function (t) { return campo(t).trim(); })) return { spam: 'spam: trappola' };
  if (conLink(campi.nome)) return { spam: 'spam: link nel nome o nell’oggetto' };
  if (campo('_tempo') && !(Number(campo('_tempo')) >= SECONDI_MINIMI)) return { spam: 'spam: troppo in fretta' };
  if (troppiInvii(pulisci(p.email, MASSIMO.email).toLowerCase())) return { spam: 'spam: troppi invii in un’ora' };
  if (p._js !== '1') return { spam: 'sospetto: senza JavaScript' };
  var turnstile = verificaTurnstile(campo('_turnstile'));
  if (turnstile === 'no') return { spam: 'spam: Turnstile dice che non è una persona' };
  if (turnstile === 'non so' && !campo('_turnstile')) return { spam: 'sospetto: senza risposta di Turnstile', controllo: true };
  if (conLink(campi.testo)) {
    return turnstile === 'sì' ? { verifica: 'c’è un link nel testo, anche se Turnstile dice che chi scrive è una persona' }
                              : { spam: 'sospetto: link nel messaggio' };
  }
  if (turnstile === 'non so') return { verifica: 'Cloudflare non ha risposto alla verifica di Turnstile' };
  return {};
}

/* conta gli invii di un indirizzo nell’ultima ora, da tutti i moduli insieme: oltre INVII_ORA sono troppi */
function troppiInvii(email) {
  if (!email) return false;
  var memoria = CacheService.getScriptCache();
  var chiave = 'invii-' + firma(email).slice(0, 32);
  var invii = Number(memoria.get(chiave) || 0);
  memoria.put(chiave, String(invii + 1), 60 * 60);
  return invii >= INVII_ORA;
}

/* la risposta di Turnstile, verificata con Cloudflare: «sì» se è una persona; «no» se la risposta non vale, perché un
   programma l’ha inventata; «non so» se manca, è scaduta o Cloudflare non risponde. «Spento» finché nelle proprietà
   dello script manca la chiave segreta TURNSTILE_SEGRETO: allora Turnstile non conta */
function verificaTurnstile(risposta) {
  var segreto = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SEGRETO');
  if (!segreto) return 'spento';
  if (!risposta) return 'non so';
  try {
    var esito = JSON.parse(UrlFetchApp.fetch(TURNSTILE, {
      method: 'post', payload: { secret: segreto, response: risposta.slice(0, 2048) }, muteHttpExceptions: true
    }).getContentText());
    if (esito.success === true) return 'sì';
    return (esito['error-codes'] || []).indexOf('invalid-input-response') >= 0 ? 'no' : 'non so';
  } catch (errore) {
    console.error(errore);
    return 'non so';
  }
}

/* l’invio scartato, nella scheda «Spam»: il perché, il nome e l’email di chi l’ha mandato e il resto, tutto come testo.
   Un messaggio vero finito qui per sbaglio si legge e si risponde da qui */
function mettiNelloSpam(p, modulo, perche) {
  var tecnici = ['nome', 'email', 'tipo', 'consenso', '_js', '_sito', '_tempo', '_turnstile'];
  var resto = Object.keys(p).filter(function (k) { return tecnici.indexOf(k) < 0 && String(p[k]).trim(); })
    .map(function (k) { return k + ': ' + pulisci(p[k], 2000, true); }).join('\n');
  var riga = {};
  riga[S.arrivato] = new Date();
  riga[S.modulo] = modulo;
  riga[S.perche] = perche;
  riga[S.nome] = testo(pulisci(p.nome, MASSIMO.nome));
  riga[S.email] = testo(pulisci(p.email, MASSIMO.email).toLowerCase());
  riga[S.contenuto] = testo(resto.slice(0, MASSIMO.messaggio));
  scriviNellaScheda(SCHEDA_SPAM, S, riga);
}

/* in cima agli avvisi alla segreteria per i messaggi «da verificare»: perché, e che cosa fare */
function righeDaVerificare(verifica) {
  if (!verifica) return [];
  return ['Da verificare: ' + verifica + '.',
          'Per questo a chi ha scritto non è partita nessuna email. Se è una persona vera, rispondi pure, e nel foglio cambia lo stato.',
          ''];
}

function avvisaLaSegreteria(m) {
  var righe = righeDaVerificare(m.verifica).concat([
    'Nuovo messaggio dal modulo dei Contatti del sito.',
    '',
    'Nome: ' + m.nome,
    'Email: ' + m.email,
    m.oggetto ? 'Oggetto: ' + m.oggetto : null,
    m.pagina ? 'Arrivato dalla pagina: ' + m.pagina : null,
    'Notizie per email: ' + (!m.notizie ? 'no' : m.verifica ? 'sì, ma l’email di conferma non è partita: se è una persona vera, invitala a iscriversi dal riquadro in fondo alle pagine del sito'
                                                          : 'sì, in attesa che confermi l’indirizzo'),
    'Quando: ' + Utilities.formatDate(m.quando, FUSO, 'dd/MM/yyyy HH:mm'),
    '',
    m.messaggio,
    '',
    '—',
    'Per rispondere basta «Rispondi»: la risposta va a ' + m.email + '.',
    'Il messaggio è anche nel foglio «Contatti della Fondazione»: ' + SpreadsheetApp.getActive().getUrl()
  ]).filter(function (r) { return r !== null; });
  MailApp.sendEmail({
    to: AVVISI_A,
    replyTo: m.email,
    name: 'Sito della Fondazione',
    subject: (m.verifica ? 'Da verificare · ' : '') + 'Messaggio dal sito: ' + m.nome + (m.oggetto ? ' · ' + m.oggetto : ''),
    body: righe.join('\n')
  });
}


/* ---- 2. la dedica del giardino dei ricordi ---- */

function riceviDedica(p, conJs, verifica) {
  var ricordo = pulisci(p.ricordo, MASSIMO.ricordo);
  var dedica = pulisci(p.dedica, MASSIMO.dedica, true);
  var immagine = pulisci(p.immagine, MASSIMO.immagine);
  var nome = pulisci(p.nome, MASSIMO.nome);
  var email = pulisci(p.email, MASSIMO.email).toLowerCase();
  var sito = SITI.indexOf(p._sito) >= 0 ? p._sito : SITI[0];
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
  var codice = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  riga[D.codice] = testo(codice);                 // per il collegamento che la toglie
  riga[D.stato] = verifica ? 'da verificare' : '';
  scriviNellaScheda(SCHEDA_DEDICHE, D, riga, D.giardino);

  avvisaPerLaDedica({ ricordo: ricordo, dedica: dedica, immagine: immagine, nome: nome, email: email, quando: adesso, verifica: verifica });
  var ricevuta = verifica ? false : mandaLaRicevuta(email, sito, codice);
  return rispondi(conJs, { success: true, dedica: true, ricevuta: ricevuta });
}

/* a chi scrive la dedica: la ricevuta, con il collegamento per toglierla. Senza il nome ricordato né la dedica,
   per la stessa ragione dell’email di conferma: il modulo è aperto a tutti. Al massimo tre ogni sei ore
   per indirizzo, perché nessuno usi il modulo per riempire la posta di altri */
function mandaLaRicevuta(email, sito, codice) {
  var memoria = CacheService.getScriptCache();
  var chiave = 'ricevuta-' + firma(email).slice(0, 32);
  var mandate = Number(memoria.get(chiave) || 0);
  if (mandate >= 3) return false;
  manda({
    to: email,
    subject: 'La tua dedica nel giardino dei ricordi',
    body: [
      'Buongiorno,',
      '',
      'la tua dedica per il giardino dei ricordi della Fondazione La Rosa d’Oro è arrivata. La leggiamo e la posiamo nel giardino, accanto all’immagine che hai scelto.',
      '',
      'Se un giorno vorrai toglierla, apri questo collegamento e tocca «Togli la dedica»:',
      '',
      sito + 'in-memoria/giardino-dei-ricordi/index.html?togli=' + codice + '.' + firma('togli|' + codice),
      '',
      'Se la dedica non l’hai scritta tu, apri lo stesso collegamento per toglierla, oppure rispondi a questa email.',
      '',
      'Fondazione La Rosa d’Oro ETS',
      AVVISI_A
    ].join('\n')
  });
  memoria.put(chiave, String(mandate + 1), 6 * 60 * 60);
  return true;
}

/* chi ha scritto la dedica la toglie dal giardino: la casella si svuota, la data va in «Tolta il»
   (finché c’è, la dedica non torna nel giardino anche se qualcuno rispunta la casella) e la segreteria
   lo sa. Il sito la toglie alla pubblicazione successiva, entro un’ora */
function togliDedica(collegamento) {
  var parti = collegamento.split('.');
  if (parti.length !== 2 || !parti[0] || firma('togli|' + parti[0]) !== parti[1]) {
    return { success: false, testo: 'Il collegamento non è valido. Scrivici a ' + AVVISI_A + '.' };
  }
  var foglio = SpreadsheetApp.getActive().getSheetByName(SCHEDA_DEDICHE);
  if (!foglio) return { success: false, testo: 'Non troviamo la dedica. Scrivici a ' + AVVISI_A + '.' };
  var blocco = LockService.getScriptLock();
  blocco.waitLock(20000);
  var ricordo;
  try {
    var titoli = titoliCon(foglio, D);
    var dati = foglio.getDataRange().getValues();
    var cCodice = titoli.indexOf(D.codice), cGiardino = titoli.indexOf(D.giardino),
        cTolta = titoli.indexOf(D.tolta), cRicordo = titoli.indexOf(D.ricordo);
    for (var i = 1; i < dati.length; i++) {
      if (String(dati[i][cCodice]).trim() !== parti[0]) continue;
      if (!dati[i][cTolta]) {
        foglio.getRange(i + 1, cGiardino + 1).setValue(false);
        foglio.getRange(i + 1, cTolta + 1).setValue(new Date());
        ricordo = String(dati[i][cRicordo]);
      }
      SpreadsheetApp.flush();
      break;
    }
    if (i >= dati.length) {
      return { success: false, testo: 'Non troviamo più la dedica: forse l’abbiamo già tolta. Se la vedi ancora nel giardino, scrivici a ' + AVVISI_A + '.' };
    }
  } finally {
    blocco.releaseLock();
  }
  if (ricordo) {
    MailApp.sendEmail({
      to: AVVISI_A,
      name: 'Sito della Fondazione',
      subject: 'Dedica tolta dal giardino: ' + ricordo,
      body: ['La dedica per «' + ricordo + '» è stata tolta dal giardino con il collegamento mandato a chi l’aveva scritta.',
             'Nella scheda «Dediche» la casella «Nel giardino» è vuota e c’è la data in «Tolta il». Per rimetterla, cancella la data e spunta di nuovo la casella.',
             '',
             'Il foglio: ' + SpreadsheetApp.getActive().getUrl()].join('\n')
    });
  }
  return { success: true, testo: 'Fatto: la dedica esce dal giardino entro un’ora.' };
}

/* una scheda del foglio («Dediche», «Progetti»): se non c’è ancora, nasce qui, con i titoli delle colonne */
function scheda(nome, colonne) {
  var libro = SpreadsheetApp.getActive();
  var foglio = libro.getSheetByName(nome);
  if (foglio) return foglio;
  foglio = libro.insertSheet(nome);
  var titoli = Object.keys(colonne).map(function (k) { return colonne[k]; });
  foglio.getRange(1, 1, 1, titoli.length).setValues([titoli]).setFontWeight('bold');
  foglio.setFrozenRows(1);
  return foglio;
}

function schedaDediche() {
  return scheda(SCHEDA_DEDICHE, D);
}

/* scrive la riga in fondo alla scheda; con «casella», quella colonna diventa una casella da spuntare */
function scriviNellaScheda(nome, colonne, riga, casella) {
  var blocco = LockService.getScriptLock();
  blocco.waitLock(20000);
  try {
    var foglio = scheda(nome, colonne);
    var titoli = titoliCon(foglio, colonne);
    var valori = titoli.map(function (t) { return riga.hasOwnProperty(t) ? riga[t] : ''; });
    var n = foglio.getLastRow() + 1;
    foglio.getRange(n, 1, 1, valori.length).setValues([valori]);
    var c = casella ? titoli.indexOf(casella) : -1;
    if (c >= 0) foglio.getRange(n, c + 1).insertCheckboxes();
    SpreadsheetApp.flush();
  } finally {
    blocco.releaseLock();
  }
}

function avvisaPerLaDedica(m) {
  var righe = righeDaVerificare(m.verifica).concat([
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
  ]);
  MailApp.sendEmail({
    to: AVVISI_A,
    replyTo: m.email,
    name: 'Sito della Fondazione',
    subject: (m.verifica ? 'Da verificare · ' : '') + 'Dedica per il giardino: ' + m.ricordo,
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
      cImmagine = titoli.indexOf(D.immagine), cGiardino = titoli.indexOf(D.giardino), cTolta = titoli.indexOf(D.tolta);
  if (cRicordo < 0 || cGiardino < 0) return { success: true, dediche: [] };
  var dediche = [];
  for (var i = dati.length - 1; i >= 1; i--) {
    var spunta = dati[i][cGiardino];
    if (spunta !== true && String(spunta).trim().toLowerCase() !== 'sì') continue;
    if (cTolta >= 0 && dati[i][cTolta]) continue;   // tolta da chi l’ha scritta
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


/* ---- 3. il progetto proposto dalla pagina «Presentaci il tuo progetto» ---- */

function riceviProgetto(p, conJs, verifica) {
  var progetto = pulisci(p.progetto, MASSIMO.progetto);
  var fase = pulisci(p.fase, MASSIMO.fase);
  if (FASI.indexOf(fase) < 0) fase = '';
  var descrizione = pulisci(p.descrizione, MASSIMO.descrizione, true);
  var bisogno = pulisci(p.bisogno, MASSIMO.bisogno, true);
  var documento = pulisci(p.documento, MASSIMO.documento);
  var nome = pulisci(p.nome, MASSIMO.nome);
  var ente = pulisci(p.ente, MASSIMO.ente);
  var email = pulisci(p.email, MASSIMO.email).toLowerCase();
  var notizie = p.notizie === 'si' || p.notizie === 'sì';
  var sito = SITI.indexOf(p._sito) >= 0 ? p._sito : SITI[0];
  if (!EMAIL.test(email)) return rispondi(conJs, { success: false, error: 'email', progetto: true });
  if (!progetto || !descrizione || !nome) return rispondi(conJs, { success: false, error: 'campi', progetto: true });

  var adesso = new Date();
  var riga = {};
  riga[P.arrivato] = adesso;
  riga[P.progetto] = testo(progetto);
  riga[P.fase] = testo(fase);
  riga[P.descrizione] = testo(descrizione);
  riga[P.bisogno] = testo(bisogno);
  riga[P.documento] = testo(documento);
  riga[P.nome] = testo(nome);
  riga[P.ente] = testo(ente);
  riga[P.email] = testo(email);
  riga[P.stato] = verifica ? 'da verificare' : 'da leggere';
  scriviNellaScheda(SCHEDA_PROGETTI, P, riga);
  if (notizie) iscriviAlleNotizie({ nome: nome, email: email, pagina: 'progetti/presenta-il-tuo-progetto',
                                    versione: pulisci(p.consenso, MASSIMO.versione), sito: sito, stato: verifica ? 'da verificare' : '' });

  avvisaPerIlProgetto({ progetto: progetto, fase: fase, descrizione: descrizione, bisogno: bisogno, documento: documento,
                        nome: nome, ente: ente, email: email, notizie: notizie, quando: adesso, verifica: verifica });
  var conferma = notizie && !verifica ? chiediConferma(email, sito, 'progetto') : false;
  return rispondi(conJs, { success: true, progetto: true, conferma: conferma });
}

function avvisaPerIlProgetto(m) {
  var righe = righeDaVerificare(m.verifica).concat([
    'Nuovo progetto dalla pagina «Presentaci il tuo progetto» del sito.',
    '',
    'Progetto: ' + m.progetto,
    m.fase ? 'A che punto è: ' + m.fase : null,
    'Chi lo propone: ' + m.nome + (m.ente ? ' (' + m.ente + ')' : '') + ', ' + m.email,
    m.documento ? 'Documento: ' + m.documento : null,
    'Quando: ' + Utilities.formatDate(m.quando, FUSO, 'dd/MM/yyyy HH:mm'),
    !m.notizie ? null : m.verifica ? 'Notizie per email: sì, ma l’email di conferma non è partita: se è una persona vera, invitala a iscriversi dal riquadro in fondo alle pagine del sito'
                                   : 'Notizie per email: sì, in attesa che confermi l’indirizzo',
    '',
    'Che cosa fa:',
    m.descrizione,
    m.bisogno ? '' : null,
    m.bisogno ? 'Di che cosa ha bisogno:' : null,
    m.bisogno || null,
    '',
    '—',
    'Per rispondere basta «Rispondi»: la risposta va a ' + m.email + '.',
    'Il progetto è anche nella scheda «Progetti» del foglio: ' + SpreadsheetApp.getActive().getUrl()
  ]).filter(function (r) { return r !== null; });
  MailApp.sendEmail({
    to: AVVISI_A,
    replyTo: m.email,
    name: 'Sito della Fondazione',
    subject: (m.verifica ? 'Da verificare · ' : '') + 'Progetto dal sito: ' + m.progetto,
    body: righe.join('\n')
  });
}


/* ---- 4. l’iscrizione alle notizie dal riquadro in fondo alle pagine ---- */

function riceviIscrizione(p, conJs) {
  var email = pulisci(p.email, MASSIMO.email).toLowerCase();
  var pagina = pulisci(p.pagina, MASSIMO.pagina).replace(/[^a-z0-9\/\-_.]/gi, '');
  var sito = SITI.indexOf(p._sito) >= 0 ? p._sito : SITI[0];
  if (!EMAIL.test(email)) return rispondi(conJs, { success: false, error: 'email', iscrizione: true });
  if (p.notizie !== 'si' && p.notizie !== 'sì') return rispondi(conJs, { success: false, error: 'campi', iscrizione: true });
  iscriviAlleNotizie({ nome: '', email: email, pagina: pagina, versione: pulisci(p.consenso, MASSIMO.versione), sito: sito });
  var conferma = chiediConferma(email, sito, 'iscrizione');
  return rispondi(conJs, { success: true, conferma: conferma, iscrizione: true });
}

/* una riga nella scheda dei Contatti con la richiesta «notizie»: quando la persona tocca «Confermo»,
   la conferma segna la data e lo stato diventa «iscritto» */
function iscriviAlleNotizie(m) {
  var riga = {};
  riga[C.arrivato] = new Date();
  riga[C.fonte] = m.fonte || 'Sito';
  riga[C.pagina] = m.pagina ? testo(m.pagina) : '';
  riga[C.richiesta] = 'notizie';
  riga[C.nome] = m.nome ? testo(m.nome) : '';
  riga[C.email] = testo(m.email);
  riga[C.consenso] = 'sì';
  riga[C.testoConsenso] = testo(m.versione);
  riga[C.ente] = 'Fondazione';
  riga[C.stato] = m.stato || 'da confermare';
  riga[C.cancella] = collegamentoPerCancellarsi(m.email, m.sito);
  scriviRiga(riga);
}

/* l’iscrizione di chi dona a Lux e spunta la casella delle notizie. Il server di Lux la manda solo dopo che
   il pagamento è confermato, con l’email, la versione del consenso, l’ora in secondi («quando») e la firma:
   HMAC-SHA256 di «lux|email|quando|consenso» con il segreto SEGRETO_LUX, in base64url senza «=». Lux non manda
   il nome né i dati del pagamento. Poi è un’iscrizione come quelle del sito: stessa email di conferma, stesso
   «Cancellami». Risponde sempre in JSON */
function riceviDaLux(p) {
  var email = pulisci(p.email, MASSIMO.email).toLowerCase();
  var versione = pulisci(p.consenso, MASSIMO.versione);
  var sito = SITI.indexOf(p._sito) >= 0 ? p._sito : SITI[0];      // _sito solo per le prove prima dell’apertura
  if (!firmaDiLux(email, String(p.quando || ''), versione, String(p.firma || ''))) return rispondi(true, { success: false, error: 'firma' });
  if (!EMAIL.test(email)) return rispondi(true, { success: false, error: 'email' });
  iscriviAlleNotizie({ fonte: 'LUX', nome: '', email: email, pagina: 'lux.larosadoro.org', versione: versione, sito: sito });
  var conferma = chiediConferma(email, sito, 'lux');
  return rispondi(true, { success: true, conferma: conferma });
}

/* la firma vale se viene dal segreto di Lux, se è di non più di MINUTI_LUX fa e se non è già stata usata */
function firmaDiLux(email, quando, versione, firmaArrivata) {
  var chiave = PropertiesService.getScriptProperties().getProperty('SEGRETO_LUX');
  if (!chiave || !firmaArrivata || !/^\d{9,11}$/.test(quando)) return false;
  if (Math.abs(Date.now() / 1000 - Number(quando)) > MINUTI_LUX * 60) return false;
  var giusta = base64url(Utilities.computeHmacSha256Signature(['lux', email, quando, versione].join('|'), chiave, Utilities.Charset.UTF_8));
  if (giusta !== firmaArrivata) return false;
  var memoria = CacheService.getScriptCache();
  var usata = 'lux-' + firmaArrivata;
  if (memoria.get(usata)) return false;
  memoria.put(usata, '1', 2 * MINUTI_LUX * 60 + 60);   // oltre il tempo in cui la firma vale: non torna buona
  return true;
}


/* ---- 5. la conferma dell’indirizzo per le notizie, e la cancellazione ---- */

// la prima frase dell’email di conferma e l’ultima, secondo da dove arriva la richiesta
var PERCHE = {
  contatto: ['ci hai scritto dal sito della Fondazione La Rosa d’Oro e hai chiesto', 'Al messaggio che ci hai scritto rispondiamo comunque di persona.'],
  progetto: ['ci hai presentato un progetto dal sito della Fondazione La Rosa d’Oro e hai chiesto', 'Al progetto rispondiamo comunque di persona.'],
  iscrizione: ['dal sito della Fondazione La Rosa d’Oro hai chiesto', ''],
  lux: ['donando a Lux, il progetto della Fondazione La Rosa d’Oro per un uso consapevole del digitale, hai chiesto', '']
};

function chiediConferma(email, sito, motivo) {
  var perche = PERCHE[motivo] || PERCHE.contatto;
  // senza il nome di chi scrive: il modulo è aperto a tutti, e l’email di conferma non deve portare
  // a un indirizzo qualsiasi parole scritte da altri
  if (confermaRecente(email)) return true;         // una sola email di conferma ogni GIORNI_TRA_CONFERME giorni per indirizzo
  var quando = String(Math.floor(Date.now() / 1000));
  var codice = base64url(email) + '.' + quando + '.' + firma(email + '|' + quando);
  var collegamento = sito + 'contatti/index.html?conferma=' + codice;
  manda({
    to: email,
    subject: 'Conferma la tua email per le notizie della Fondazione',
    body: [
      'Buongiorno,',
      '',
      perche[0] + ' di ricevere, ogni tanto, le nostre notizie per email. Per confermare che questo indirizzo è tuo apri il collegamento qui sotto e tocca «Confermo»:',
      '',
      collegamento,
      '',
      'Se la richiesta non viene da te, o hai cambiato idea, non fare niente: non ti manderemo notizie.' + (perche[1] ? ' ' + perche[1] : ''),
      '',
      'Quando vorrai smettere di ricevere le notizie, ti basterà aprire questo collegamento e toccare «Cancellami»:',
      '',
      collegamentoPerCancellarsi(email, sito),
      '',
      'Fondazione La Rosa d’Oro ETS',
      AVVISI_A
    ].join('\n')
  });
  segnaConferma(email);
  return true;
}

/* quando è partita l’ultima email di conferma per un indirizzo: sta nelle proprietà dello script, perché la memoria
   temporanea di Google dura al massimo sei ore, con l’indirizzo firmato e non in chiaro. Le date più vecchie di
   GIORNI_TRA_CONFERME giorni si cancellano quando se ne scrive una nuova */
function confermaRecente(email) {
  var quando = Number(PropertiesService.getScriptProperties().getProperty('conferma-' + firma(email).slice(0, 32)) || 0);
  return Date.now() / 1000 - quando < GIORNI_TRA_CONFERME * 24 * 60 * 60;
}

function segnaConferma(email) {
  var prop = PropertiesService.getScriptProperties();
  var adesso = Math.floor(Date.now() / 1000);
  try {
    var tutte = prop.getProperties();
    Object.keys(tutte).forEach(function (k) {
      if (k.indexOf('conferma-') === 0 && adesso - Number(tutte[k]) >= GIORNI_TRA_CONFERME * 24 * 60 * 60) prop.deleteProperty(k);
    });
    prop.setProperty('conferma-' + firma(email).slice(0, 32), String(adesso));
  } catch (errore) {
    console.error(errore);                         // se le proprietà sono piene, la conferma è partita lo stesso
  }
}

/* il collegamento per cancellarsi dalle notizie: non scade, e vale per tutte le richieste di quell’indirizzo.
   Porta alla pagina Contatti del sito, dove si tocca «Cancellami» */
function collegamentoPerCancellarsi(email, sito) {
  if (SITI.indexOf(sito) < 0) sito = SITI[0];
  return sito + 'contatti/index.html?cancella=' + base64url(email) + '.' + firma('cancella|' + email);
}

/* la pagina Contatti del sito, quando si tocca «Confermo», chiede qui con ?conferma=…, e con ?cancella=…
   quando si tocca «Cancellami»; la pagina del giardino, con ?togli=…, quando si tocca «Togli la dedica».
   La pubblicazione del sito chiede le dediche del giardino con ?giardino=1 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.giardino) {
    return ContentService.createTextOutput(JSON.stringify(dedicheNelGiardino())).setMimeType(ContentService.MimeType.JSON);
  }
  var esito = p.conferma ? confermaNotizie(String(p.conferma))
            : p.cancella ? cancellaNotizie(String(p.cancella))
            : p.togli ? togliDedica(String(p.togli)) : null;
  if (esito) return ContentService.createTextOutput(JSON.stringify(esito)).setMimeType(ContentService.MimeType.JSON);
  return pagina('Il modulo del sito',
    '<p>Questo indirizzo riceve i messaggi dei moduli del sito. Per scriverci, passa dal <a href="' + SITI[0] + '">sito della Fondazione</a>.</p>');
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
    return { success: false, testo: 'Il collegamento è scaduto. Iscriviti di nuovo dal riquadro «Le notizie della Fondazione», in fondo alla pagina.' };
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
    return { success: true, testo: 'Grazie, il tuo indirizzo è confermato. Ti scriveremo solo quando avremo qualcosa da raccontarti. In fondo a ogni email trovi il collegamento per cancellarti.' };
  } finally {
    blocco.releaseLock();
  }
}

/* «Cancellami»: in tutte le righe di quell’indirizzo il consenso diventa «ritirato», con la data;
   le iscrizioni dal riquadro passano allo stato «cancellato». Se non c’è più niente da cancellare,
   la risposta è la stessa: le notizie comunque non arrivano */
function cancellaNotizie(codice) {
  var parti = codice.split('.');
  var email;
  try { email = Utilities.newBlob(Utilities.base64DecodeWebSafe(conUguali(parti[0]))).getDataAsString().toLowerCase(); }
  catch (x) { email = ''; }
  if (parti.length !== 2 || !email || firma('cancella|' + email) !== parti[1]) {
    return { success: false, testo: 'Il collegamento non è valido. Scrivici a ' + AVVISI_A + ', e ti cancelliamo noi.' };
  }
  var foglio = SpreadsheetApp.getActive().getSheetByName(SCHEDA);
  var blocco = LockService.getScriptLock();
  blocco.waitLock(20000);
  try {
    var titoli = titoliCon(foglio, C);
    var dati = foglio.getDataRange().getValues();
    var cEmail = titoli.indexOf(C.email), cConsenso = titoli.indexOf(C.consenso), cRitirato = titoli.indexOf(C.ritirato),
        cRichiesta = titoli.indexOf(C.richiesta), cStato = titoli.indexOf(C.stato);
    var adesso = new Date();
    for (var i = 1; i < dati.length; i++) {
      if (String(dati[i][cEmail]).trim().toLowerCase() !== email) continue;
      if (dati[i][cConsenso] !== 'sì') continue;
      foglio.getRange(i + 1, cConsenso + 1).setValue('ritirato');
      foglio.getRange(i + 1, cRitirato + 1).setValue(adesso);
      if (dati[i][cRichiesta] === 'notizie') foglio.getRange(i + 1, cStato + 1).setValue('cancellato');
    }
    SpreadsheetApp.flush();
  } finally {
    blocco.releaseLock();
  }
  return { success: true, testo: 'Fatto: non ti manderemo più le notizie. Se cambi idea, puoi iscriverti di nuovo dal riquadro in fondo alla pagina.' };
}


/* ---- 6. da eseguire una volta dall’editor, prima di pubblicare ---- */

function prepara() {
  segreto();
  var foglio = SpreadsheetApp.getActive().getSheetByName(SCHEDA);
  if (!foglio) throw new Error('Manca la scheda «' + SCHEDA + '»');
  titoliCon(foglio, C);
  titoliCon(schedaDediche(), D);
  titoliCon(scheda(SCHEDA_PROGETTI, P), P);
  titoliCon(scheda(SCHEDA_SPAM, S), S);
  console.log('Tutto pronto: ora si pubblica come App web.');
}

/* il segreto che lo script condivide con il server di Lux: la prima volta lo crea e lo mette nelle proprietà
   dello script (SEGRETO_LUX), poi lo scrive nel registro dell’esecuzione, da dove Elias lo copia in Vercel.
   Non va mai in chat né nel repository. Rieseguita, mostra lo stesso segreto; per cambiarlo, si cancella
   SEGRETO_LUX in Impostazioni progetto → Proprietà script, si riesegue e si aggiorna Vercel */
function segretoPerLux() {
  var prop = PropertiesService.getScriptProperties();
  var s = prop.getProperty('SEGRETO_LUX');
  if (!s) {
    s = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
    prop.setProperty('SEGRETO_LUX', s);
  }
  console.log('Il segreto per Lux, da copiare in Vercel: ' + s);
}


/* ---- 7. gli attrezzi ---- */

function rispondi(conJs, dati) {
  if (conJs) return ContentService.createTextOutput(JSON.stringify(dati)).setMimeType(ContentService.MimeType.JSON);
  // senza JavaScript il browser mostra questa pagina
  if (dati.dedica) {
    if (dati.success) {
      return pagina('Grazie', '<p>La tua dedica è arrivata. La leggiamo e la posiamo nel giardino, accanto all’immagine che hai scelto.</p>' +
        (dati.ricevuta ? '<p>Ti abbiamo mandato un’email con il collegamento per toglierla, se un giorno vorrai.</p>' : '') +
        '<p>Per tornare al sito usa il tasto «Indietro» del browser.</p>');
    }
    return pagina('La dedica non è partita', '<p>' + (dati.error === 'email'
      ? 'Controlla la tua email: l’indirizzo non sembra completo.'
      : 'Controlla di aver scritto il nome da ricordare, il tuo nome e la tua email, e di aver spuntato la casella.') +
      ' Torna indietro con il tasto «Indietro» del browser, oppure scrivici a ' + AVVISI_A + '.</p>');
  }
  if (dati.iscrizione) {
    if (dati.success) {
      return pagina('Grazie', '<p>Ti abbiamo mandato un’email: aprila e tocca «Confermo». Le notizie arrivano solo dopo la conferma.</p>' +
        '<p>Per tornare al sito usa il tasto «Indietro» del browser.</p>');
    }
    return pagina('L’iscrizione non è partita', '<p>' + (dati.error === 'email'
      ? 'Controlla la tua email: l’indirizzo non sembra completo.'
      : 'Qualcosa non ha funzionato.') +
      ' Torna indietro con il tasto «Indietro» del browser, oppure scrivici a ' + AVVISI_A + '.</p>');
  }
  if (dati.progetto) {
    if (dati.success) {
      return pagina('Grazie', '<p>Il tuo progetto è arrivato. Lo leggiamo con attenzione e ti rispondiamo di persona, all’indirizzo che ci hai lasciato.</p>' +
        (dati.conferma ? '<p>Per le notizie ti abbiamo mandato un’email: aprila e tocca «Confermo».</p>' : '') +
        '<p>Per tornare al sito usa il tasto «Indietro» del browser.</p>');
    }
    return pagina('Il progetto non è partito', '<p>' + (dati.error === 'email'
      ? 'Controlla la tua email: l’indirizzo non sembra completo.'
      : 'Controlla di aver scritto il nome del progetto, che cosa fa, il tuo nome e la tua email.') +
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
