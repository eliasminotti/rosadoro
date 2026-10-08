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
- Dopo ogni modifica: `python3 costruisci.py`. Controlla anche il JavaScript
  con `node --check`; se segnala un errore, non si pubblica.
- La costruzione aggiorna da sola le date in `sito/sitemap.xml`.

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
  pubblica `sito/` su https://eliasminotti.github.io/rosadoro/ (indirizzo di
  prova, non indicizzato), con `.github/workflows/pages.yml`.
- Ogni lavoro si fa su un ramo suo e arriva sul ramo principale solo dopo
  l'approvazione di Elias.
- I messaggi di commit sono in italiano: una frase che dice che cosa cambia
  per chi guarda il sito.

## Dove sono le altre cose

- La lista del cantiere (che cosa resta, chi lo fa):
  https://claude.ai/code/artifact/8f94fdce-5ebc-4a4b-81b2-10122e7f9b73
- Su Google Drive: i testi nella cartella «Dacia»; la ricerca operativa in
  «SITO — operativa»; lo statuto (`Statuto Fondazione La Rosa D'Oro.pdf`) in
  «1 Atto cost e Statuto / regole e modelli», con la sua «ANALISI GIURIDICA».
