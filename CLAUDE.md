# Sito della Fondazione La Rosa d'Oro ETS

Il sito della Fondazione, costruito da Claude per Elias (che decide) e Dacia
(che scrive: la voce dei testi è la sua). Si lavora e si risponde in italiano.
Prima di tutto leggi `LEGGIMI.txt` e `REGOLE-DI-QUALITA.txt`.

## Come è fatto

- `costruisci.py` è l'assemblatore: mappa del sito, menu, header, footer.
  `python3 costruisci.py` riscrive tutte le pagine dentro `sito/`.
- `testi_pagine.py` contiene i testi. I gettoni (`{→cartella}`, `{img:…}`,
  `{file:…}`, `{foto:…}`, `{verifica}`) sono spiegati in cima al file.
- `sito/css/stile.css` e `sito/js/sito.js` si modificano direttamente: la
  costruzione li lascia stare. Tutto il resto di `sito/` è generato: non si
  tocca a mano, si cambia `costruisci.py` o `testi_pagine.py` e si ricostruisce.
- Dopo ogni modifica: `python3 costruisci.py`, poi `python3 sorgenti/controlla.py`:
  sono gli stessi controlli che la pubblicazione fa prima di mettere online (pagine
  uguali ai testi, JavaScript senza errori, collegamenti interni, lo script del foglio provato
  con un foglio finto da `sorgenti/controlla-foglio.js`). Se uno non passa,
  non si pubblica: `pages.yml` si ferma e online resta la versione di prima.
- Le parti che fanno qualcosa (moduli, giardino dei ricordi, «Cancellami» e «togli la
  dedica», script del foglio) si cambiano con il controllo prima (Elias, 15.10): si
  scrive il controllo che dice che cosa deve succedere, si vede che fallisce, solo dopo
  si cambia il codice e si vede che passa. Il controllo resta e gira con gli altri in
  `python3 sorgenti/controlla.py`. I testi no: il loro controllo è il sì di Elias.
  Dove vanno: lo script del foglio in `sorgenti/controlla-foglio.js`, `giardino.py` in
  `sorgenti/controlla-giardino.py`, i moduli di `sito.js` in `sorgenti/controlla-moduli.js`
  (in un browser, con Playwright: gira nel cantiere, su GitHub si salta).
- La costruzione aggiorna da sola le date in `sito/sitemap.xml`. Le pagine che
  mostrano ancora un segnaposto restano fuori dalla mappa e chiedono ai motori
  di non indicizzarle; la costruzione le elenca alla fine.
- Il titolo della scheda (e di Google) viene da `TITOLI` in `testi_pagine.py`
  quando la pagina ha un titolo evocativo; altrimenti è il titolo della pagina.
- Il modulo della pagina Contatti scrive nel foglio Google «Contatti della
  Fondazione» quando `FOGLIO` in `costruisci.py` contiene l’indirizzo dello
  script del foglio (sorgenti/foglio-contatti.gs, pubblicato da Elias con il
  suo accesso Google; a ogni modifica si ripubblica come nuova versione).
  Forminit è spento dall’11.10.2026 (`FORMINIT` vuoto): se `FOGLIO` resta
  vuoto, al posto del modulo c’è il pulsante «Scrivici» che apre la posta.
- Le dediche del giardino dei ricordi vanno allo stesso script, nella scheda
  «Dediche» del foglio. Entrano nel giardino quando Elias o Dacia spuntano la
  casella «Nel giardino»: ogni ora la pubblicazione (`sorgenti/giardino.py`)
  le scrive in `dediche.json` accanto alla pagina. Non stanno nel repository.
- Chi dona a Lux e spunta la casella delle notizie arriva allo stesso script dal server di Lux
  (`tipo=lux`, solo dopo il pagamento, firmato con il segreto `SEGRETO_LUX` che Elias mette nelle
  proprietà dello script e in Vercel, mai in chat): riga «notizie» con Fonte «LUX», stessa email di
  conferma, stesso «Cancellami». Lux porta al riquadro delle notizie con `https://larosadoro.org/#notizie`:
  l’àncora `#notizie` non si cambia (la controlla `controlla.py`).
- Nella pagina Dona la carta con Stripe è il primo modo di donare, poi il bonifico (Elias, 19.10). PayPal si sceglie
  sulla stessa pagina di Stripe (Lux, 24.10): il pulsante Dona di PayPal non c’è più, perché Lux non legge più il conto
  PayPal e le ricevute partono solo da Stripe (lo controlla `controlla.py`); chi già dona ogni mese dal conto PayPal resta lì.
  `STRIPE` in `costruisci.py` è il Payment Link a importo libero che Elias crea nel pannello Stripe della
  Fondazione, lo stesso conto di Lux; la costruzione aggiunge `?locale=it&client_reference_id=sito-dona`, che
  separa le donazioni del sito da quelle di Lux. Vuoto, carta e PayPal spariscono da Dona (`{se-stripe}…{/se-stripe}`).
- Le ricevute delle donazioni con la carta e con PayPal le manda da solo il sistema di Lux, 37 giorni dopo, da quando Lux
  passa ai pagamenti veri, dopo l’apertura del sito (Lux, 20.10). `RICEVUTE` in `costruisci.py` è quel giorno
  («27 ottobre 2026»): acceso, Dona lo dice e l’informativa nomina Vercel, Supabase e Resend e porta quella data
  (`{se-ricevute}`, `{senza-ricevute}`, `{informativa-data}`); vuoto, la ricevuta si chiede scrivendoci. Quel giorno Elias
  cambia anche il messaggio di conferma del link Stripe.
- Il mensile con Stripe (Elias, 20.10): `MENSILE` in `costruisci.py` è il giorno da cui si dona ogni mese con i link di
  `MENSILI` (10, 25, 50, 100 euro al mese e «Altro importo», da 1 euro a quantità regolabile); `PORTALE` è il portale di
  Stripe dove chi dona ogni mese smette da sé. Acceso, Dona e informativa lo dicono (`{se-mensile}`, `{mensili}`,
  `{portale}`); spento, per ogni mese Dona propone il bonifico periodico (`{senza-mensile}`).
  Si accende solo dopo che Lux fa le ricevute anche dei pagamenti mensili, quindi con `RICEVUTE` acceso.
- La partita IVA della Fondazione è lo stesso numero del codice fiscale (`CF_PIVA` in `costruisci.py`; Agenzia delle
  Entrate, verifica del 19.10.2026: attiva, inizio attività 28.2.2026). Va nella home (art. 35 c.1 DPR 633/1972; dal
  1.1.2027 art. 68 c.1 del testo unico IVA, D.Lgs. 10/2026): la costruzione la scrive nel piede di ogni pagina
  («C.F. e P.IVA …») e come `vatID` nella scheda per i motori di ricerca, e `controlla.py` lo verifica su ogni pagina.
  Dove il numero serve solo come codice fiscale (5 per mille, lasciti, ricerca nel RUNTS) resta «codice fiscale».
- La sede legale è `SEDE` in `costruisci.py` (Via Bianca di Savoia 17, 20122 Milano: atto costitutivo, art. 2, e iscrizione
  al RUNTS). Sta nel piede di ogni pagina subito dopo «C.F. e P.IVA» («Sede legale: …», Elias, 23.10) e la scheda per i motori
  di ricerca la dà come `address`, senza orari né mappa: è lo studio del commercialista, non un ufficio aperto al pubblico.
  `controlla.py` verifica che piede e scheda dicano lo stesso indirizzo.
- Il modulo di «Presentaci il tuo progetto» va allo stesso script, nella scheda
  «Progetti» del foglio, con un avviso a segreteria@ (`{modulo-progetto}`).
- Il riquadro «Le notizie della Fondazione» in fondo a ogni pagina (`riquadro_notizie`
  in `costruisci.py`) e la casella delle notizie nel modulo dei progetti vanno allo stesso
  script: una riga «notizie» nella scheda dei Contatti e la stessa email di conferma.
  Solo le notizie della Fondazione: quelle di Orizzonti Celesti si chiedono solo a chi
  dona dalla Svizzera, nel ringraziamento.
- Due cose vanno da sole, senza la segreteria (Elias, 13.10): chi riceve le notizie si
  cancella con «Cancellami» (`?cancella=` sulla pagina Contatti; il collegamento di ciascuno
  è nella colonna «Per cancellarsi», da mettere in fondo a ogni email delle notizie), e chi
  scrive una dedica riceve un’email con il collegamento per toglierla (`?togli=` sulla pagina
  del giardino). Le colonne nuove del foglio le aggiunge lo script da sé.
- La protezione dei moduli dallo spam (Elias, 22.10): prima di scrivere o mandare qualcosa lo script del foglio
  controlla ogni invio (`controllaInvio`): campo trappola `sito_web`, link nel nome o nell’oggetto, meno di tre secondi
  dall’apertura della pagina, più di cinque invii in un’ora dallo stesso indirizzo, Cloudflare Turnstile. Spam e sospetti
  (invio senza JavaScript, link solo nel messaggio senza il «persona» di Turnstile) vanno nella scheda «Spam» del foglio,
  senza avvisi né email. Con il «persona» di Turnstile un link nel messaggio entra «da verificare», con l’avviso alla
  segreteria e nessuna email a chi scrive; così anche quando Cloudflare non risponde. Se Turnstile non si carica, il modulo
  non parte e la pagina mostra il riquadro per mandarci il messaggio dalla propria posta (Gmail, programma di posta, copia);
  lo stesso se lo script risponde «controllo» (Elias, 22.10).
  La conferma delle notizie parte al massimo una volta ogni tre giorni per indirizzo e non porta mai testo di chi compila.
  `TURNSTILE` in `costruisci.py` è la chiave pubblica del widget (account Cloudflare di Elias); la chiave segreta sta solo
  nelle proprietà dello script (`TURNSTILE_SEGRETO`) e si mette solo quando il sito con la chiave pubblica è già online:
  prima, ogni messaggio vero verrebbe rifiutato. Turnstile si carica solo quando si comincia a scrivere in un modulo:
  è l’unico script esterno del sito, chiesto da Elias; informativa e cookie ne parlano con `{se-turnstile}`.
- L’immagine delle condivisioni (`sito/img/condivisione.jpg`) si rifà da
  `sorgenti/condivisione.html` con `node sorgenti/fotografa.js`.

## Regole che non si discutono

- Ogni modifica si confronta con `REGOLE-DI-QUALITA.txt` prima di essere
  pubblicata. Le più facili da dimenticare: virgolette «» e apostrofo ’, mai
  " e '; nessun punto esclamativo; soltanto i cinque colori del sistema;
  corpo del testo mai sotto i 17 px; sul telefono niente sfondamenti.
- I testi di Dacia (In memoria, Lasciti) non si riscrivono senza chiedere.
  Le bozze di Claude sono provvisorie e si dichiarano come tali.
- Una frase da riscontrare porta `{verifica}`: nel sito appare il cartellino
  «da verificare» e resta finché Elias non la conferma.
- Le pagine ancora vuote mostrano il segnaposto della regola dei tre registri:
  cosa siamo, cosa la Fondazione è costituita per fare, cosa stiamo facendo.
  Un testo nuovo segue la stessa regola.
- `ANTEPRIMA` e `LINK_PULITI` in `costruisci.py` sono gli interruttori della
  pubblicazione: restano come sono finché Elias non dice di pubblicare.

## Rami e pubblicazione

- Il ramo principale è `claude/rosadoro-foundation-site-6hc5hu`: ogni push lì
  pubblica `sito/` su https://larosadoro.org/ con `.github/workflows/pages.yml`.
  Fino all’apertura le pagine chiedono ai motori di non indicizzarle (`ANTEPRIMA`);
  il vecchio indirizzo di prova https://eliasminotti.github.io/rosadoro/ porta lì.
- Ogni lavoro si fa su un ramo suo e arriva sul ramo principale solo dopo
  l'approvazione di Elias.
- Il sito pubblicato si controlla da solo con `.github/workflows/controlli.yml`
  (ogni mattina e dopo ogni pubblicazione). Quando qualcosa non va, su GitHub si
  apre la segnalazione «Problema sul sito della Fondazione» e sveglia subito la routine
  di Claude (segreto `ROUTINE_TOKEN`), che lo scrive a Elias nel thread «Gestione degli
  errori del sito» con un messaggio che comincia con «⚠️ Attenzione»: Elias vuole
  la notifica dell’app sul telefono, non le email di GitHub (14.10). La stessa routine
  fa un giro ogni mattina alle 7:18 e prepara la correzione.
  Una versione sbagliata già online si annulla con un revert della sua proposta;
  revert e correzioni passano dal sì di Elias come tutto il resto. Nessuna
  routine pubblica correzioni da sola (Elias, 14.10).
- I messaggi di commit sono in italiano: una frase che dice che cosa cambia
  per chi guarda il sito.

## Dove sono le altre cose

- La lista del cantiere (che cosa resta, chi lo fa):
  https://claude.ai/code/artifact/8f94fdce-5ebc-4a4b-81b2-10122e7f9b73
- Su Google Drive: i testi nella cartella «Dacia»; la ricerca operativa in
  «SITO — operativa»; lo statuto (`Statuto Fondazione La Rosa D'Oro.pdf`) in
  «1 Atto cost e Statuto / regole e modelli», con la sua «ANALISI GIURIDICA».
