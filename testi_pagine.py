# -*- coding: utf-8 -*-
"""
I testi delle pagine, redazionati dai materiali di Dacia (settembre 2026).
La voce è la sua; la redazione (refusi, misura, registro) è concordata.

Gettoni usati nei testi, sostituiti dall'assemblatore:
  {→cartella}        collegamento relativo alla pagina indicata
  {img:file.svg}     percorso di un'immagine in img/
  {file:nome.pdf}    percorso di un allegato da scaricare, in allegati/
  {foto:NOME|didascalia|classe}   posto di una fotografia non ancora consegnata
"""

TESTI = {}

# ---------------------------------------------------------------- la sezione
TESTI["in-memoria"] = dict(
    sotto="Modi concreti per onorare chi non c'è più e sostenere chi resta.",
    corpo="""
<p class="citazione">Ciò che resta — di una persona, di una casa, di un sogno — può diventare l'inizio di qualcosa.</p>
<p>In queste pagine trovi i modi in cui la Fondazione accompagna chi vive una perdita: un fondo per donare in memoria, un giardino di immagini a cui dedicare un pensiero, il funerale che diventa un'opera di bene, l'aiuto pratico per svuotare una casa, e una presenza accanto a chi si avvicina alla soglia.</p>
""")

# ------------------------------------------------------------ A · il fondo
TESTI["in-memoria/fondo-di-memoria"] = dict(
    sotto="Il ricordo diventa azione: onora il passato con un gesto nel presente.",
    motto=True,      # tutta in un rigo, più grande ed evidente (Dacia, 6.9)
    musica=True,
    corpo="""
<p class="citazione unica">Le memorie più belle sono quelle che durano in eterno.<br>Le memorie più belle sono quelle che plasmano la realtà.</p>
<p>Un fondo di memoria è una donazione o una raccolta fondi che commemora la vita di una persona speciale. Esso crea un ponte tra ciò che è stato e ciò che sarà, tra il mondo della materia e il mondo spirituale, tra il mondo del tuo agire e quello dei tuoi cari che non possono più compiere azione. Come un arcobaleno.</p>
{foto:ARCOBALENO1|Un arcobaleno|cielo}
<p>Scegliendo attivamente di onorare coloro che non ci sono più, crei un dialogo continuo di amore e memoria che arricchisce la tua vita e quella di chi ti circonda. Secondo alcune tradizioni spirituali e l'antroposofia, ad esempio, questo atto allevia anche le pene di chi è dipartito, magari prematuramente, lasciando in sospeso cose o situazioni.</p>
<h3>Apri un fondo per onorare il tuo caro e i suoi valori, sostenendo un progetto</h3>
<p>Trasforma il lutto in un aiuto concreto a favore di progetti e cause che erano vicini alla persona scomparsa, e che vivranno nel futuro grazie a un atto di amore e di gratitudine. La vita può cambiare irrimediabilmente con una perdita; attraverso un progetto concreto, però, l'essenza di chi non c'è più continua a toccare il mondo, con un legame che trascende la morte.</p>
<p class="citazione">Un gesto semplice e importante, che può permettere a noi di portare a termine oggi ciò che ieri è rimasto incompiuto.</p>
<p>Aprire un fondo in memoria di un nonno contadino, sostenendo progetti di agricoltura cosciente, può motivare le generazioni future a curarsi della terra e a rinnovare tradizioni antiche con pratiche sostenibili.</p>
<p class="citazione">Ci sono momenti in cui il passato pesa come un debito non saldato.</p>
<p>O ancora: una donna avrebbe voluto diventare violinista e, per le avversità della vita, non ha potuto farlo; dedicare il suo fondo a un progetto sulla musica è un modo per far perseguire ciò che in vita non è accaduto.</p>
<div class="box">
<p><strong>Ricordare aiuta.</strong> Chi raccoglie fondi in memoria di una persona cara racconta di trarne un beneficio reale: un senso dato alla perdita, un miglioramento del proprio benessere, legami rinsaldati e nuovi. Lo documenta il rapporto della fondazione britannica Marie Curie sul fundraising in memoria.</p>
<p><a class="link" href="https://www.mariecurie.org.uk/document/fundraising-in-memory-bereavement-impact-report" rel="noopener">Leggi il rapporto</a> &nbsp;·&nbsp; <a class="link" href="{→in-memoria/elaborare-il-lutto}">Elaborare il lutto: l'approfondimento</a></p>
</div>
<p class="citazione">Perché la memoria diventi un gesto concreto, crea un fondo con noi: le azioni parlano più delle parole.</p>
<h3>Aprire il fondo è semplice e veloce</h3>
<p>Decidi tu il come, la finalità, la visibilità oppure la riservatezza, fino all'anonimato. La Fondazione ti solleva dalle incombenze burocratiche, amministrative e contabili. Puoi farlo in tre modi:</p>
<ul>
<li>una donazione alla Fondazione, che la destina a uno dei suoi progetti o a borse di studio per corsi specifici (agricoltura, medicina…);</li>
<li>una donazione a un progetto specifico, tra quelli che trovi nella sezione <a class="link" href="{→progetti}">Progetti</a>;</li>
<li>la creazione di un fondo di memoria a nome del defunto, in cui decidi tu la destinazione — per la persona cara che se ne è andata, o per te stesso, per come vuoi essere ricordato.</li>
</ul>
<p class="citazione">Trasforma la perdita in speranza per il mondo.</p>
{foto:AURORA BOREALE|L'aurora boreale|ritratto}
<h3>Che cosa puoi donare</h3>
<ul>
<li>una somma di denaro;</li>
<li>titoli, azioni, buoni postali, fondi di investimento o il tuo TFR;</li>
<li>beni mobili: opere d'arte, gioielli, arredi, orologi, libri, oggetti d'antiquariato, collezioni;</li>
<li>aziende, attività e fondazioni del defunto;</li>
<li>beni immobili: appartamenti, terreni, fabbricati;</li>
<li>polizze vita: il capitale non entra nell'asse ereditario, perché il beneficiario designato acquista un diritto proprio verso l'assicuratore (art. 1920, comma 3, c.c.); restano salvi, rispetto ai premi versati, i diritti dei legittimari — collazione, imputazione e riduzione (art. 1923, comma 2, c.c.) — e per questo consigliamo sempre di valutare la designazione con un notaio;</li>
<li>la nuda proprietà.</li>
</ul>
<p>Per i beni diversi dal denaro serve un atto scritto con la descrizione dei beni e il loro valore (D.M. 28 novembre 2019): ti aiutiamo noi a prepararlo.</p>
<h3>Perché con la Rosa d'Oro</h3>
<ul>
<li>perché hai vantaggi fiscali, come persona e come azienda;</li>
<li>perché la nostra rete è ampia, e ampi gli aiuti;</li>
<li>perché personalizziamo gli aiuti secondo le <em>tue</em> esigenze;</li>
<li>perché siamo affidabili e professionali;</li>
<li>perché sei tu a scegliere cosa e come;</li>
<li>perché crediamo in progetti che migliorino il futuro del mondo, grazie alla saggezza e al lavoro dei nostri cari.</li>
</ul>
<h3>I vantaggi fiscali</h3>
<p>I contributi versati a un fondo di memoria della Fondazione sono detraibili o deducibili secondo l'art. 83 del Codice del Terzo Settore (D.Lgs. 117/2017). Per le persone: <strong>detrazione IRPEF del 30%</strong> dell'importo donato, su un massimo di 30.000 euro l'anno (vantaggio fino a 9.000 euro); in alternativa, <strong>deduzione dal reddito fino al 10%</strong> del reddito complessivo, con l'eccedenza riportabile nei quattro periodi d'imposta successivi. La scelta tra detrazione e deduzione vale per tutte le donazioni analoghe dell'anno, non solo per questa. Per aziende, liberi professionisti e società: deduzione delle erogazioni in denaro fino al 10% del reddito dichiarato. Perché il beneficio valga, la donazione in denaro va fatta con strumenti tracciabili: bonifico, carta, assegno bancario o circolare, bollettino postale; il contante non dà diritto all'agevolazione.</p>
<p class="citazione unica">Onoriamo la memoria di ieri dando ali ai sogni di domani.</p>
<p>Il fondo di memoria è previsto dallo statuto della Fondazione (art. 12, «Fondo della memoria ed eredità solidale»): lo trovi nella pagina <a class="link" href="{→documenti}">Documenti</a>; per i professionisti c'è la <a class="link" href="{→professionisti/fondo-della-memoria}">scheda dedicata</a>.</p>
<p>Ci sono anche altri modi per sostenere chi affronta un lutto: <a class="link" href="{→in-memoria/giardino-dei-ricordi}">il Giardino dei ricordi</a>, i <a class="link" href="{→in-memoria/funerali}">Funerali</a>, <a class="link" href="{→in-memoria/svuota-e-sorridi}">gli Svuota e Sorridi</a> e <a class="link" href="{→in-memoria/io-sono-qui-per-te}">Io sono qui per te</a>.</p>
""")

# ------------------------------------------------------- B · il giardino
TESTI["in-memoria/giardino-dei-ricordi"] = dict(
    sotto="Scegli un'immagine, scrivi il nome di chi vuoi ricordare: la posiamo nel giardino.",
    corpo="""
<p>Scorri la galleria e trova il fiore, l'oggetto o lo scorcio di natura che ti ispira di più, per il tuo caro. Puoi percepirne internamente il profumo. Scegli l'immagine e scrivi il nome della persona che vuoi ricordare — e, se vuoi, una dedica. Il nome arriva alla Fondazione e viene posato nel giardino, accanto all'immagine scelta, e lì resta, in un giardino di anime reso fecondo dal nostro Amore.</p>
<div class="giardino-cornice">
<div class="giardino" aria-label="Le immagini del giardino">
  <div class="pianta">{foto:FOTO APE|L'ape sul fiore|quadra}<button type="button" data-foto="L'ape sul fiore">Scegli questa immagine</button></div>
  <div class="pianta">{foto:STELLE DI BETLEMME|Le stelle di Betlemme|quadra}<button type="button" data-foto="Le stelle di Betlemme">Scegli questa immagine</button></div>
  <div class="pianta">{foto:ROSA BIANCA|La rosa bianca|quadra}<button type="button" data-foto="La rosa bianca">Scegli questa immagine</button></div>
  <div class="pianta">{foto:CAMPANELLINI|I campanellini|quadra}<button type="button" data-foto="I campanellini">Scegli questa immagine</button></div>
  <div class="pianta">{foto:SALICE|Il salice sull'acqua|quadra}<button type="button" data-foto="Il salice sull'acqua">Scegli questa immagine</button></div>
  <div class="pianta">{foto:NON TI SCORDAR DI ME|I nontiscordardimé|quadra}<button type="button" data-foto="I nontiscordardimé">Scegli questa immagine</button></div>
  <div class="pianta">{foto:FIORI DI CILIEGIO|I fiori di ciliegio|quadra}<button type="button" data-foto="I fiori di ciliegio">Scegli questa immagine</button></div>
  <div class="pianta">{foto:TARASSACO|Il tarassaco|quadra}<button type="button" data-foto="Il tarassaco">Scegli questa immagine</button></div>
  <div class="pianta">{foto:STELLA AZZURRA|La stella azzurra|quadra}<button type="button" data-foto="La stella azzurra">Scegli questa immagine</button></div>
  <div class="pianta">{foto:TULIPANO|Il tulipano|quadra}<button type="button" data-foto="Il tulipano">Scegli questa immagine</button></div>
  <div class="pianta">{foto:GIRASOLE|Il girasole|quadra}<button type="button" data-foto="Il girasole">Scegli questa immagine</button></div>
  <div class="pianta">{foto:SOFFIONI|I soffioni|quadra}<button type="button" data-foto="I soffioni">Scegli questa immagine</button></div>
  <div class="pianta">{foto:BOCCIOLO DI ROSA|Il bocciolo di rosa|quadra}<button type="button" data-foto="Il bocciolo di rosa">Scegli questa immagine</button></div>
  <div class="pianta">{foto:CORONA IMPERIALE|La corona imperiale|quadra}<button type="button" data-foto="La corona imperiale">Scegli questa immagine</button></div>
  <div class="pianta">{foto:CALLE|Le calle|quadra}<button type="button" data-foto="Le calle">Scegli questa immagine</button></div>
  <div class="pianta">{foto:ALLIUM|L'allium|quadra}<button type="button" data-foto="L'allium">Scegli questa immagine</button></div>
  <div class="pianta">{foto:FOGLIA CON LA PIOGGIA|La foglia dopo la pioggia|quadra}<button type="button" data-foto="La foglia dopo la pioggia">Scegli questa immagine</button></div>
  <div class="pianta">{foto:GERANIO|Il geranio|quadra}<button type="button" data-foto="Il geranio">Scegli questa immagine</button></div>
  <div class="pianta">{foto:DIGITALE|La digitale|quadra}<button type="button" data-foto="La digitale">Scegli questa immagine</button></div>
  <div class="pianta">{foto:IRIS|L'iris|quadra}<button type="button" data-foto="L'iris">Scegli questa immagine</button></div>
  <div class="pianta">{foto:GRANO|Il grano giovane|quadra}<button type="button" data-foto="Il grano giovane">Scegli questa immagine</button></div>
  <div class="pianta">{foto:MARGHERITE|Le margherite nel prato|quadra}<button type="button" data-foto="Le margherite nel prato">Scegli questa immagine</button></div>
</div>
<button type="button" class="scorri-freccia" aria-label="Scorri le immagini">»</button>
</div>
<figure class="dedica-esempio">
  {foto:FOTO APE|L'ape sul fiore, l'immagine dell'esempio|}
  <figcaption><strong>Nonna Clelia</strong><br>«Ci hai insegnato la laboriosità delle api e la bellezza paziente dello sbocciare dei fiori.» — <em>un esempio: il nome, e la dedica se si vuole</em></figcaption>
</figure>
<h3>Contattaci inoltre per</h3>
<ul>
<li><strong>un crowdfunding commemorativo</strong>: la donazione a progetti in memoria attraverso l'unione delle forze — basta una piccola donazione di ognuno per ricreare ciò che la persona scomparsa avrebbe voluto fare;</li>
<li><strong>eventi dedicati alla persona</strong>: gli zoom talk della memoria, tenuti da amici o da studiosi che vorresti invitare a parlare, e che la Fondazione può aiutarti a contattare;</li>
<li><strong>la pubblicizzazione di eventi</strong> virtuali o in presenza dedicati alla persona scomparsa;</li>
<li><strong>la creazione di una fiaba</strong> o di un racconto in memoria;</li>
<li><strong>la creazione di un'opera d'arte</strong> in memoria.</li>
</ul>
<p><a class="vai" href="{→contatti}">Contattaci</a></p>

<div class="velo-dialogo" id="velo-dedica" role="dialog" aria-modal="true" aria-labelledby="dedica-titolo" hidden>
  <div class="dialogo">
    <h3 id="dedica-titolo">Chi vuoi ricordare</h3>
    <p class="dedica-foto"></p>
    <label for="dedica-nome">Il nome</label>
    <input id="dedica-nome" type="text" autocomplete="off" placeholder="Il nome, o come lo chiamavi">
    <label for="dedica-testo">Una dedica <span>facoltativa</span></label>
    <textarea id="dedica-testo" placeholder="Poche parole, o nessuna"></textarea>
    <label class="consenso" for="dedica-consenso"><input id="dedica-consenso" type="checkbox"> <span>Sono un familiare, o comunque una persona che ha titolo a ricordarla, e acconsento a che il nome e la dedica siano posati nel giardino, visibili a chi lo visita.</span></label>
    <p class="nota">Il nome arriva alla Fondazione come messaggio e viene posato nel giardino a cura nostra: il sito non conserva nulla. Puoi chiederci in ogni momento di toglierlo, scrivendo a biodinamica@larosadoro.org. Non scrivere recapiti o dati di altre persone. Il modulo è per chi ha almeno 14 anni. <a class="link" href="{→privacy}">Come trattiamo i dati</a>.</p>
    <div class="righe">
      <button type="button" class="chiudi-dialogo">Annulla</button>
      <a class="invia" data-mailto="biodinamica@larosadoro.org" href="#">Invia</a>
    </div>
  </div>
</div>
""")

# ---------------------------------------------------------- C · funerali
TESTI["in-memoria/funerali"] = dict(
    sotto="Non fiori ma opere di bene.",
    corpo="""
<p>Al posto di ghirlande e fiori, per il funerale si possono raccogliere fondi per un progetto. Chi partecipa scrive un messaggio di vicinanza per coloro che restano, e sostiene con la propria donazione una causa:</p>
<div class="azioni">
  <a class="azione" href="{→dona}"><img src="{img:azione-candela.svg}" alt="Una candela accesa, incisa" width="200" height="240"><div><h4>Accendi una candela</h4><p>Sostieni progetti di medicina</p></div></a>
  <a class="azione" href="{→dona}"><img src="{img:azione-albero.svg}" alt="Un albero appena piantato, inciso" width="200" height="240"><div><h4>Pianta un albero</h4><p>Sostieni progetti per l'agricoltura</p></div></a>
  <a class="azione" href="{→dona}"><img src="{img:azione-fiore.svg}" alt="Un fiore che sboccia, inciso" width="200" height="240"><div><h4>Fai sbocciare un fiore</h4><p>Sostieni progetti che riguardano il sociale</p></div></a>
  <a class="azione" href="{→dona}"><img src="{img:azione-clessidra.svg}" alt="La clessidra alata, incisa" width="200" height="240"><div><h4>Gira la clessidra alata</h4><p>Sostieni progetti che riguardano il fine vita</p></div></a>
</div>
<p>Grazie ai ricordi, chi non c'è più rimane presente nella vita dei suoi cari: ricordarlo è un modo naturale per mantenere vivo il legame e, gradualmente, accettare l'assenza. E talvolta, per sostenere la famiglia, serve un gesto concreto.</p>
<h3>Un gesto concreto per la famiglia</h3>
<p>Vuoi essere tu a coprire le spese del funerale di un amico? O vorresti chiedere aiuto senza imbarazzo, permettendo a chi desidera sostenerti — ma non sa come — di farlo? Contattaci: apriremo noi la raccolta al posto tuo, per il funerale o per gli <a class="link" href="{→in-memoria/svuota-e-sorridi}">Svuota e Sorridi</a>.</p>
<p>È spesso difficile trovare la giusta distanza, e la giusta vicinanza, con chi ha subito un lutto.</p>
<p><strong>Sei l'azienda in cui la persona scomparsa lavorava, o un'associazione a cui ha dato molto in vita?</strong> Coinvolgi i tuoi dipendenti o i tuoi soci nel <a class="link" href="{→in-memoria/giardino-dei-ricordi}">Giardino dei ricordi</a>.</p>
<h3>L'elogio funebre</h3>
<p>Vuoi che qualcuno ti aiuti, o scriva per te, un elogio funebre per il tuo caro che ha passato la soglia? Abbiamo chi lo fa per te: <a class="link" href="{→contatti}">scrivici</a>.</p>
<h3>Un funerale laico</h3>
<p>Vuoi celebrare un funerale laico? Stiamo attivando i contatti giusti: <a class="link" href="{→contatti}">scrivici</a>.</p>
""")

# --------------------------------------------------- D · svuota e sorridi
TESTI["in-memoria/svuota-e-sorridi"] = dict(
    sotto="Riordina l'esterno mettendo ordine al tuo mondo interno. Apri spazio a un nuovo capitolo.",
    unica=True,      # tutta sulla stessa linea (Dacia, 7.9)
    corpo="""
<p>Svuotare la casa di una persona cara che non c'è più è uno dei momenti più intensi del lutto, e ha un profondo potere terapeutico: un atto pratico che fa da ponte tra il dolore e l'accettazione, trasformando un gesto materiale in un vero processo psicologico.</p>
<p class="citazione">Ogni scatola riempita è un piccolo rituale di congedo.</p>
<p>Farlo da soli, però, richiede spesso troppe energie: le case contengono gli oggetti di una vita intera, ed è difficile scegliere che cosa tenere e che cosa lasciare andare.</p>
<h3>Come funziona</h3>
<p>Un'équipe di volontari, empatici e delicati, arriva con un furgone direttamente alla casa e aiuta a creare un nuovo ordine: catalogare gli oggetti, alleggerire dal superfluo, fare spazio — fino allo smaltimento ecologico, alla pulizia profonda, all'imbiancare o allo spostare mobili. E ciò che può avere una seconda vita viene donato, perché abbia uno scopo: è da qui che nasce il sorriso del nome.</p>
<p>L'équipe si sta formando in queste settimane: <a class="link" href="{→contatti}">scrivici</a> per essere tra i primi a ricevere il servizio — o per unirti tu stesso ai volontari.</p>
<figure class="tavola"><img src="{img:tavola-interno.svg}" alt="La luce entra da una finestra ad arco in un interno inciso"><figcaption>Il nuovo che arriva</figcaption></figure>
<p class="citazione unica">Non restare fermo nel dolore: muoviti verso il futuro.</p>
""")

# ------------------------------------------------- E · io sono qui per te
TESTI["in-memoria/io-sono-qui-per-te"] = dict(
    sotto="Accanto a chi si avvicina alla soglia, e a chi gli vuole bene.",
    corpo="""
<p>Stai attraversando la fase più delicata della vita e hai bisogno di una persona che ti aiuti? Accompagni un familiare al passaggio della soglia?</p>
<p><strong>Siamo qui per sostenere le persone nel fine vita, le loro famiglie e i loro cari, in modo concreto e spirituale, prendendo in considerazione tutto quanto è attorno a te.</strong></p>
<p>Siamo qui per orientarti tra le decisioni e le scelte della fase finale della vita: dal funerale al testamento, fino a decidere chi si occuperà del tuo cane e del tuo gatto.</p>
<p>Hai voglia di liberare casa, destinare i vari oggetti, ma non ne hai la forza? Siamo qui per aiutarti a svuotare casa: il «riordino svedese» (Margareta Magnusson, <em>The Gentle Art of Swedish Death Cleaning</em>) accompagna un distacco graduale e sereno, e gli <a class="link" href="{→in-memoria/svuota-e-sorridi}">Svuota e Sorridi</a> possono darti una mano concreta.</p>
<h3>Un percorso con un counsellor</h3>
<p>Fai fatica a uscire dal lutto e a elaborarlo? <strong>Siamo qui per aiutarti. Contattaci per un percorso con uno dei nostri counsellor.</strong> Il counsellor non cura — il lutto non è una malattia, è un processo naturale — ma offre uno spazio protetto, sicuro e non giudicante per esplorare le emozioni e ricostruire una quotidianità interrotta. Secondo le tue inclinazioni puoi scegliere chi lavora con piccole strategie di adattamento, con la meditazione, con l'arteterapia o con la scrittura espressiva. Sarai sostenuto in tutti i passaggi verso il futuro, per ricominciare a vivere.</p>
<p><a class="vai" href="{→contatti}">Avvia la procedura per essere messo in contatto</a></p>
<p>Possiamo rispondere anche a qualsiasi altra domanda tu abbia riguardo alla morte, al morire e alle malattie. Non sei solo.</p>
<h3>Incontri e workshop</h3>
<p>Gli incontri dedicati al tema della morte sono un buon modo per approfondire, conoscere persone che vivono situazioni simili, porre domande e condividere. Se ti interessa organizzarne uno nella tua città, <a class="link" href="{→contatti}">contattaci</a> — e guarda la <a class="link" href="{→eventi-e-formazione/formazione-accompagnamento}">formazione all'accompagnamento</a> e gli <a class="link" href="{→eventi-e-formazione/eventi}">eventi</a>.</p>
<p>Per approfondire: <a class="link" href="{→in-memoria/elaborare-il-lutto}">Elaborare il lutto</a>.</p>
""")

# ------------------------------------------------------- approfondimento
TESTI["in-memoria/elaborare-il-lutto"] = dict(
    sotto="Un'esperienza universale, che in ognuno si manifesta in modo unico.",
    corpo="""
<p>Il lutto è una profonda risposta emotiva alla perdita, spesso fatta di tristezza, rabbia, confusione e persino senso di colpa. Il suo impatto può essere totale: tocca lo stato emotivo, la salute fisica, le relazioni, la qualità della vita. Comprendere questa complessità è fondamentale sia per chi è in lutto, sia per chi desidera sostenere chi ha subito una mancanza.</p>
<p>E tuttavia il lutto, per quanto difficile e tortuoso, può fare anche da catalizzatore di trasformazione: condurre verso connessioni più profonde con se stessi, con gli altri e con lo spirituale, fino a scoprire un nuovo senso per la vita che viene.</p>
<h3>Le cinque fasi</h3>
<p>Il modello di elaborazione del lutto teorizzato nel 1969 dalla psichiatra Elisabeth Kübler-Ross descrive cinque fasi che le persone attraversano davanti a una perdita:</p>
<ul>
<li><strong>Negazione</strong> — «Non può essere vero»: lo shock iniziale, un meccanismo di difesa contro un dolore troppo intenso;</li>
<li><strong>Rabbia</strong> — «Perché a me? È ingiusto!»: la collera può rivolgersi verso se stessi, gli altri o il defunto;</li>
<li><strong>Contrattazione</strong> — «Se faccio questo, andrà meglio»: si cerca di riprendere il controllo negoziando con la realtà;</li>
<li><strong>Depressione</strong> — «Non ha più senso»: il dolore profondo e il vuoto, la piena consapevolezza della mancanza;</li>
<li><strong>Accettazione</strong> — «Ora devo andare avanti»: non dimenticare, né essere felici per forza, ma integrare la perdita nella propria vita, trovando una nuova normalità.</li>
</ul>
<p>Le fasi non sono una sequenza obbligata: possono alternarsi, tornare, mancare. Il modello va letto come una mappa, non come un percorso uguale per tutti.</p>
<h3>Quando il processo si blocca</h3>
<p>Il lutto riguarda sia la perdita reale di una persona cara, sia perdite metaforiche: la fine di una relazione, un cambiamento drastico di vita. Si parla di <em>lutto complicato</em> quando l'elaborazione si blocca e il dolore non si attenua con il tempo: a differenza del lutto naturale, in cui la sofferenza acuta lascia gradualmente spazio all'integrazione del ricordo, la persona rimane a lungo trattenuta nelle prime fasi emotive, con un impatto invalidante sulla vita quotidiana.</p>
<p><strong>Ti riconosci in questo? Stai affrontando un lutto e hai delle domande?</strong> <a class="link" href="{→in-memoria/io-sono-qui-per-te}">Io sono qui per te</a>.</p>
""")


# ================================================================ LASCITI
# Dal documento «LASCITO» di Dacia (8 settembre 2026). Le frasi con {verifica}
# sono quelle che aspettano il riscontro di Elias prima della pubblicazione.
V = '<span class="da-verificare">da verificare</span>'

TESTI["lasciti"] = dict(
    sotto="Un futuro che aspetta di essere scritto.",
    corpo="""
<p class="citazione">C'è un futuro che aspetta di essere scritto. Diventa tu l'inchiostro.</p>
<p>Negli ultimi anni il testamento solidale ha acquisito una rilevanza crescente a livello internazionale. In Italia è ancora poco diffuso; in altri paesi europei, come il Regno Unito, la cultura del lascito solidale è ormai radicata, e quell'esperienza offre spunti per rendere questa scelta sempre più accessibile.</p>
<p>In queste pagine: che cos'è un lascito testamentario e come si fa; perché farlo alla Rosa d'Oro, con i vantaggi fiscali; come redigere il tuo testamento con noi; e il Dopo di Noi, per chi ha un familiare fragile da proteggere.</p>
""")

TESTI["lasciti/il-lascito-testamentario"] = dict(
    sotto="Il lascito testamentario: un gesto di amore, solidarietà e generosità.",
    corpo="""
<p>Il lascito testamentario è una disposizione inserita nel testamento con cui decidi, in vita, di destinare una parte o la totalità del tuo patrimonio — denaro, immobili, titoli, oggetti di valore — a persone, enti o organizzazioni non profit, dopo la tua morte.</p>
<p>La legge italiana permette a ciascuno di destinare liberamente una parte del proprio patrimonio, la cosiddetta <strong>quota disponibile</strong>, anche a organizzazioni non profit (artt. 536 e seguenti del codice civile). Nessuno viene penalizzato: i tuoi cari sono sempre tutelati dalla <strong>quota di legittima</strong>, che spetta di diritto ai parenti più stretti, al coniuge o alla persona unita civilmente. Le quote variano con la composizione della famiglia: con un solo figlio e senza coniuge, per esempio, metà del patrimonio spetta a lui per legge (art. 537 c.c.) e l'altra metà è disponibile, da destinare secondo le tue volontà; con il coniuge la ripartizione cambia (art. 542 c.c.). È solo un esempio: la base di calcolo è il patrimonio al netto dei debiti, più le donazioni fatte in vita (art. 556 c.c.), e il conto preciso lo fa un professionista.</p>
<p>Senza testamento, i beni si dividono secondo le regole della successione legittima, che possono assegnarli a persone meno vicine a te o, in mancanza di parenti entro il sesto grado (art. 572 c.c.), allo Stato (art. 586 c.c.).</p>
<p><strong>Fare un lascito testamentario significa operare con libertà e coscienza.</strong> Un testamento è un modo sicuro per garantire che i tuoi desideri vengano rispettati e che i tuoi ideali continuino a realizzarsi anche dopo di te.</p>
<p class="citazione">Dona a ciò che per te è vita.</p>
{foto:ROSA|Una rosa|ritratto}
<p>Esprimere le proprie ultime volontà con un lascito è un gesto semplice, privo di vincoli e sempre modificabile, che assicura il rispetto dei propri desideri e dei propri progetti. Ciò conta ancora di più in un momento difficile e di vulnerabilità, come una malattia: scegliere con libertà e coscienza come disporre delle proprie volontà e del proprio patrimonio, per quanto piccolo sia, risveglia e rafforza l'Io e promuove forze di guarigione. Studi dimostrano inoltre come la pianificazione anticipata delle cure (<em>Advance Care Planning</em>) riduca l'ansia e la depressione nei pazienti affetti da patologie gravi e croniche. Sentirsi parte di una comunità più grande — ampliando lo sguardo alla realtà sociale e spirituale che ci circonda e ci riguarda, in quanto esseri umani che hanno camminato su questa terra — aiuta a non sentirsi soli e isolati, ma parte di un tutto, eterno.</p>
<p class="citazione">«Nessun atto di gentilezza, per piccolo che sia, va mai perduto.» — Esopo</p>
<p>Uno studio pubblicato sul <em>New England Journal of Medicine</em> riporta inoltre che i familiari costretti a prendere decisioni di fine vita senza la guida di disposizioni anticipate hanno riportato tassi più elevati di depressione, ansia e sintomi da stress post-traumatico rispetto a coloro che disponevano di indicazioni chiare da seguire. {verifica} Facendo un testamento e compilando le DAT <strong>sollevi concretamente i tuoi cari</strong> da questo peso, dando loro la certezza di rispettare le tue volontà anziché dover intuire cosa potresti desiderare.</p>
<p class="citazione">Un lascito testamentario è un segno tangibile del tuo impegno verso gli altri.</p>
<h3>Che cosa puoi lasciare</h3>
<p>Un lascito solidale non richiede grandi patrimoni. Puoi lasciare:</p>
<ul>
<li>una somma di denaro;</li>
<li>titoli, azioni, buoni postali, fondi di investimento o il tuo TFR;</li>
<li>beni mobili: opere d'arte, gioielli, arredi, orologi, libri, oggetti d'antiquariato, collezioni;</li>
<li>beni immobili: appartamenti, terreni, fabbricati;</li>
<li>polizze vita: il capitale non entra nell'asse ereditario, perché il beneficiario designato acquista un diritto proprio verso l'assicuratore (art. 1920, comma 3, c.c.); restano salvi, rispetto ai premi versati, i diritti dei legittimari — collazione, imputazione e riduzione (art. 1923, comma 2, c.c.) — e per questo consigliamo sempre di valutare la designazione con un notaio;</li>
<li>la nuda proprietà.</li>
</ul>
<h3>I tre tipi di lascito</h3>
<ul>
<li><strong>residuale</strong>: una quota del patrimonio, o ciò che ne resta dopo i legati e la quota di legittima garantita ai parenti stretti;</li>
<li><strong>pecuniario</strong>: una somma di denaro determinata;</li>
<li><strong>specifico</strong>, o legato di specie: un bene preciso e identificato — un oggetto, un gioiello, un immobile.</li>
</ul>
<h3>Donazione o lascito?</h3>
<p>La donazione ha effetto subito, mentre sei in vita, e richiede l'atto notarile alla presenza di due testimoni. Il lascito ha effetto dopo la morte, resta modificabile finché vivi e non toglie nulla alla disponibilità dei tuoi beni.</p>
<p class="citazione unica">Lascia un segno concreto per un futuro bello, buono e giusto.</p>
<h3>Come fare un lascito alla Fondazione</h3>
<p>Perché sia valido, il lascito va inserito in un testamento redatto in una delle forme previste dalla legge: le trovi in <a class="link" href="{→lasciti/il-tuo-testamento}">Redigi il tuo testamento con noi</a>. <strong>Si può decidere in qualunque fase della vita, e non toglie nulla alla disponibilità dei beni durante la vita.</strong> <a class="link" href="{→contatti}">Contattaci</a>, oppure procedi così:</p>
<ol>
<li>scrivi per esteso la denominazione ufficiale, il codice fiscale e la sede legale della Fondazione: <strong>Fondazione La Rosa d'Oro ETS</strong>, codice fiscale <strong>14629350969</strong>, Via Bianca di Savoia 17, 20122 Milano;</li>
<li>decidi che cosa lasciare: una somma, un bene, un immobile, una quota;</li>
<li>verifica la quota disponibile: se ti serve un professionista per calcolarla con precisione, <a class="link" href="{→contatti}">contattaci</a>;</li>
<li>scegli la forma del testamento;</li>
<li>affida l'atto a un notaio (testamento pubblico), per evitare smarrimenti e contestazioni;</li>
<li>conserva il testamento in un luogo sicuro — depositato dal notaio, e affidato a una persona di fiducia — perché sia facilmente reperibile;</li>
<li>se vuoi, comunicaci il tuo impegno: ci dà l'opportunità di esprimerti la nostra gratitudine mentre sei in vita e di discutere i dettagli della tua visione. Su richiesta, inviamo il modulo di impegno da compilare.</li>
</ol>
<p>Molte persone evitano la pianificazione anticipata delle cure a causa del disagio nel discutere del tema della morte. È il tuo caso? <a class="link" href="{→in-memoria/io-sono-qui-per-te}">Contatta uno dei nostri counsellor</a>.</p>
""")

TESTI["lasciti/perche-donare"] = dict(
    sotto="Donare è posare la prima pietra: apre la strada a molte nuove vie.",
    corpo="""
<ul class="stelle">
<li><strong>Perché donare è posare la prima pietra: apre la strada a molte nuove vie.</strong> La tua donazione può finanziare un progetto preciso e locale, e fare una differenza tangibile: i tuoi familiari e amici avranno l'opportunità di visitare i progetti, dialogare con i responsabili e verificare direttamente l'impiego dei fondi. Non confluisce in un bilancio grande, generico e senza luogo, sottratto a ogni riscontro.</li>
<li><strong>Perché promuoviamo la pluralità e l'inclusione attiva.</strong> Crediamo che l'identità umana si declini al plurale: cresciamo nel confronto, ci evolviamo nella relazione e nelle sinergie. La Rosa d'Oro ha progetti propri e ne sostiene altri in linea con i suoi valori: chi ha un sogno in un dato ambito può <a class="link" href="{→progetti/presenta-il-tuo-progetto}">presentare il proprio progetto</a>, che viene valutato con un'analisi di fattibilità. Guarda i <a class="link" href="{→progetti}">progetti</a>.</li>
<li><strong>Perché lavoriamo sul campo e con il cuore</strong>: per sostenere la cultura del dono e comunità che crescono, e arrivare dove lo Stato spesso non arriva, rispondendo alle domande che ci vengono incontro dalle necessità concrete delle persone che incontriamo o che si rivolgono alla Fondazione.</li>
<li><strong>Perché favoriamo i giovani</strong>, catalizzatori del cambiamento sociale e dell'innovazione culturale. Promuovere il loro potenziale significa alimentare quell'identità plurale e aperta al futuro, fondamentale per l'evoluzione dell'umanità. Attraverso l'ascolto attivo e l'inclusione, trasformiamo le loro aspirazioni in concrete opportunità di crescita condivisa.</li>
<li><strong>Perché in futuro agricoltura, medicina e sociale possano funzionare meglio, e perché li vediamo come pilastri interconnessi di un unico ecosistema.</strong> Crediamo che il futuro risieda nella loro convergenza: coltivare la terra in modo sostenibile, curare la persona nella sua interezza e rigenerare i legami comunitari, per il benessere collettivo.</li>
<li><strong>Perché i progetti sono personalizzati (<em>tailor-made</em>) e su misura, costruiti sulla persona e sul territorio.</strong> Crediamo che la reale efficacia di un progetto risieda nella sua capacità di adattarsi plasticamente alle esigenze della comunità e alle vocazioni del luogo, il <em>genius loci</em>. Attraverso un'analisi profonda del contesto e una co-progettazione con gli attori locali, trasformiamo i bisogni specifici in opportunità di sviluppo uniche, sostenibili e durature, garantendo l'impatto a lungo termine dei progetti e integrandoli armoniosamente nel tessuto sociale ed economico locale.</li>
<li><strong>Perché, se lo vorrai, saremo onorati di celebrare il tuo sostegno</strong> — o di rendere omaggio alla memoria del tuo lascito — attraverso il nostro sito istituzionale e i canali ufficiali, perché tu sia ricordato, magari con una tua frase. Desideriamo esprimerti gratitudine, e soprattutto che il tuo impegno diventi una testimonianza viva per la comunità e trasmetta alle future generazioni il valore del tuo impatto sul territorio.</li>
<li><strong>Perché lavoriamo con notai e professionisti che condividono i nostri valori</strong>: lo statuto stesso della Fondazione è stato rivisto con loro. {verifica}</li>
<li><strong>Perché siamo una Fondazione con una struttura leggera e focalizzata su ciò che conta</strong>: la parte di ciò che doni e che va a finire in amministrazione è contenuta, e il bilancio — depositato ogni anno al Registro del Terzo settore, e quindi pubblico — lo mostra.</li>
<li><strong>Perché la tua donazione è meritevole e come tale gode di vantaggi fiscali.</strong> Tutte le donazioni sono fiscalmente deducibili o detraibili nei limiti previsti dalla legge. Conservando la ricevuta del pagamento tracciabile, potrai ridurre il tuo carico fiscale in sede di dichiarazione dei redditi.</li>
</ul>
<p>Vuoi condividere la tua storia? Vuoi conoscere la storia di chi ha già fatto questa scelta? <a class="link" href="{→contatti}">Scrivici</a>.</p>
<p>Vuoi iniziare un percorso biografico con uno dei nostri consulenti, per superare la paura della morte, sciogliere nodi, capire meglio quale può essere il tuo valore nel futuro e se, e che cosa, vuoi davvero donare? <a class="link" href="{→in-memoria/io-sono-qui-per-te}">Il percorso con i nostri counsellor</a>.</p>
<p>Il rendiconto dei lasciti ricevuti, e di come sono stati impiegati, è in corso d'opera: sarà pubblicato in questa pagina.</p>
<h3>I vantaggi fiscali</h3>
<p>I lasciti e le donazioni a favore degli enti del Terzo settore iscritti al RUNTS, come la Fondazione, <strong>non sono soggetti all'imposta sulle successioni e donazioni</strong>, né alle imposte ipotecaria e catastale, a condizione che siano usati per l'attività statutaria, con esclusivo perseguimento di finalità civiche, solidaristiche e di utilità sociale (art. 82, commi 1 e 2, del Codice del Terzo Settore, D.Lgs. 117/2017). La Fondazione, inoltre, non risponde in solido dell'imposta dovuta dagli altri eredi (art. 36, comma 5-bis, D.Lgs. 346/1990). Per gli altri beneficiari si applicano aliquote e franchigie che variano con il grado di parentela (artt. 7 e 56 del D.Lgs. 346/1990): il 4% per il coniuge e i parenti in linea retta, con una franchigia di un milione di euro per ciascun beneficiario; il 6% per fratelli e sorelle, con franchigia di 100.000 euro; il 6% senza franchigia per gli altri parenti fino al quarto grado, gli affini in linea retta e gli affini in linea collaterale fino al terzo grado; l'8% senza franchigia per tutti gli altri. Se il beneficiario è una persona con disabilità grave, la franchigia sale a 1.500.000 euro.</p>
<p class="citazione unica">Lascia un segno concreto per un futuro bello, buono e giusto.</p>
""")

TESTI["lasciti/il-tuo-testamento"] = dict(
    sotto="Facile, attraente, sociale, tempestivo: un gesto di pochi minuti.",
    corpo="""
<p>Compilare un testamento con noi è un gesto di pochi minuti. Ci ispiriamo a una strategia adottata con successo nel Regno Unito, il modello EAST — <em>Easy, Attractive, Social, Timely</em> — che favorisce l'adozione di comportamenti virtuosi: rendere il testamento solidale semplice significa ridurre le difficoltà burocratiche, agevolarne la compilazione e far crescere la cultura del dono. La Fondazione è qui per aiutarti in questo.</p>
<h3>I tipi di testamento</h3>
<h4>1. Il testamento olografo: il più semplice</h4>
<p>Deve essere scritto, datato (giorno, mese, anno) e firmato interamente a mano dal testatore — senza computer, macchina da scrivere o mano di terzi. Il suo vantaggio è la rapidità con cui si redige e si modifica. È consigliabile farne tre copie: una da conservare, una per il notaio, una per una persona fidata.</p>
<h4>2. Il testamento pubblico: il più sicuro</h4>
<p>È ricevuto dal notaio in presenza di due testimoni: il testatore espone le proprie volontà, che vengono messe per iscritto e firmate da testatore, testimoni e notaio, tenuti al più stretto riserbo. Questa forma protegge dai rischi di falsificazione, perdita o distruzione, perché l'atto è redatto dal notaio e conservato nel suo studio; una copia è registrata nel Registro generale dei testamenti, che lo rende rintracciabile anche senza conoscere il notaio.</p>
<h4>3. Il testamento segreto: il più intimo</h4>
<p>È redatto e chiuso in una busta sigillata, consegnata al notaio alla presenza di due testimoni: né il notaio né i testimoni ne conoscono il contenuto, che resta riservato fino all'apertura. Può essere scritto anche al computer o da terzi, ma deve essere firmato dal testatore.</p>
<h3>Modificare il testamento</h3>
<p>Il testamento può essere modificato o revocato in qualsiasi momento. Si può sostituire un testamento olografo con uno pubblico, e viceversa. Per le modifiche minori si può aggiungere un <em>codicillo</em>: un'aggiunta che integra o modifica le volontà espresse in precedenza. Per essere valide, le modifiche a un testamento olografo vanno scritte di proprio pugno, datate e firmate di nuovo.</p>
<h3>Le domande che un testamento aiuta a sciogliere</h3>
<ul>
<li>Chi prenderà le decisioni in caso di un incidente grave?</li>
<li>Chi vorresti che si prendesse cura del tuo animale, in caso di morte improvvisa?</li>
<li>Se entrambi i coniugi mancassero insieme, chi dovrebbe ereditare? E in caso di morte improvvisa, tutto al coniuge superstite, o preferisci che erediti anche qualcun altro?</li>
<li>Come desideri che vengano accuditi i tuoi figli, se mancassero entrambi i genitori?</li>
</ul>
<h3>La libertà del come</h3>
<p>Al testamento puoi affiancare le <strong>Disposizioni anticipate di trattamento</strong> (DAT), che riguardano le cure e non i beni: spesso si decidono nello stesso momento. Ne parliamo in una pagina a sé, <a class="link" href="{→lasciti/la-liberta-del-come}">La libertà del come</a>, dove trovi anche il fac-simile da scaricare.</p>
<div class="box">
<p><strong>Chi lascia, e perché.</strong> Un sondaggio italiano sul lascito solidale — «La prima cosa bella: cosa rende bella la vita e cosa far durare per sempre», del Comitato Testamento Solidale — racconta che ciò che si vorrebbe durasse per sempre sono i legami affettivi (67,7% delle indicazioni) e il sentirsi una brava persona (45,5%); che per lasciare un ricordo di sé quasi un intervistato su quattro pensa al lascito solidale (24,4%), con un picco tra i 25 e i 34 anni (30%); e che tra gli oggetti da tramandare vince l'album di fotografie (44%), poi una lettera scritta a mano (37%). {verifica}</p>
<p>Nel Regno Unito una parte sempre più significativa di chi fa testamento destina una quota a enti benefici: campagne di sensibilizzazione, agevolazioni fiscali, la fiducia nel non profit, e avvocati e notai che parlano del testamento solidale ai loro clienti. Secondo Rob Cope, direttore di Remember A Charity — un consorzio di oltre duecento enti benefici britannici — la chiave è stato il lavoro congiunto tra le organizzazioni, che ha trasformato il testamento solidale in una norma sociale. La Fondazione rema in questo senso. {verifica}</p>
<p><a class="link" href="{→contatti}">Sei un'organizzazione non profit e vorresti collaborare? Scrivici.</a> &nbsp;·&nbsp; <a class="link" href="{→contatti}">Sei un notaio o un avvocato e vuoi lavorare con noi? Scrivici.</a></p>
</div>
""")

TESTI["lasciti/dopo-di-noi"] = dict(
    sotto="Prima o poi, tutti abbiamo bisogno di un riparo. Custodisci la fragilità altrui.",
    corpo="""
<p class="citazione">Prima o poi, tutti abbiamo bisogno di un riparo. Custodisci la fragilità altrui.</p>
{foto:BIMBA 1|Una bambina di spalle, davanti al mare|ritratto}
<p>I bambini con disabilità sono bambini bisognosi di cure dell'anima. Hai un familiare con disabilità e vuoi tutelarlo per quando non ci sarai più?</p>
<p>La Fondazione è costituita per operare nel quadro della legge sul «Dopo di Noi» (legge 112/2016), a tutela delle persone con disabilità grave prive del sostegno familiare: per assicurare che il patrimonio della famiglia sia destinato esclusivamente al benessere della persona con disabilità; per co-progettare il percorso individuale con i servizi sociali e sanitari del territorio; per promuovere l'inserimento in micro-coabitazioni (gruppi appartamento) che ricreino l'ambiente familiare; per finanziare percorsi che sviluppino le competenze residue della persona — l'agricoltura sociale, l'arte; per favorire la cura dell'individuo: visite mediche, un'alimentazione adeguata, trattamenti olistici.</p>
<p>Queste attività possono svolgersi d'intesa con una persona di fiducia indicata dalla famiglia come referente non amministrativo, che aiuti a coordinare le scelte conoscendo la storia della famiglia. E puoi lasciare tu stesso indicazioni sulla vostra storia insieme e su ciò che ti piacerebbe per lui o per lei, un domani.</p>
<p class="citazione">La tutela delle fasce più vulnerabili è il pilastro su cui poggia una comunità solidale, equa e coesa.</p>
<p class="citazione">Accudire la fragilità è come prendersi cura di un germoglio.</p>
<p>Lo strumento è previsto dallo statuto della Fondazione (art. 14): lo trovi nella pagina <a class="link" href="{→documenti}">Documenti</a>. Per i professionisti c'è la <a class="link" href="{→professionisti/dopo-di-noi}">scheda sulla gestione del Dopo di Noi</a>.</p>
<p>Vuoi attivare un'équipe olistica per il tuo caro con disabilità? <a class="link" href="{→contatti}">Scrivici</a> e attiveremo i terapeuti più vicini a te.</p>
<p><a class="vai" href="{→contatti}">Vuoi saperne di più? Contattaci</a></p>
""")



# ------------------------------------------------------------ note legali
# Bozza scritta l'8 settembre 2026 sulla base della ricerca «Ricerca — privacy e GDPR sito»
# (cartella «SITO — operativa»). Da verificare da Elias; i punti aperti portano il cartellino.
TESTI["privacy"] = dict(
    sotto="Come trattiamo i tuoi dati, in parole semplici.",
    corpo="""
<p>Questa pagina spiega quali dati raccogliamo quando visiti il sito, scrivi alla Fondazione, dedichi un ricordo o fai una donazione; perché li raccogliamo, per quanto tempo li teniamo e quali sono i tuoi diritti. È scritta per essere letta, non solo per essere pubblicata: se qualcosa non è chiaro, scrivici.</p>

<h3>Chi è il titolare</h3>
<p>Il titolare del trattamento è la <strong>Fondazione La Rosa d'Oro ETS</strong>, con sede in via Bianca di Savoia 17, 20122 Milano, iscritta al Registro unico nazionale del Terzo settore (RUNTS, sezione g, rep. n. 170120), codice fiscale 14629350969. Per ogni domanda sui tuoi dati scrivi a <a class="link" href="mailto:biodinamica@larosadoro.org">biodinamica@larosadoro.org</a>. La Fondazione non ha nominato un responsabile della protezione dei dati: la legge non lo richiede per un ente con trattamenti di questa dimensione.</p>

<h3>Quando visiti il sito</h3>
<p>Il sito è fatto di sole pagine statiche. Non usa cookie di profilazione, né strumenti di analisi del traffico, né contenuti incorporati da terzi. I caratteri tipografici sono ospitati sui nostri stessi server. L'unico dato raccolto automaticamente è quello dei normali registri tecnici del servizio che ospita le pagine, GitHub Pages: indirizzo IP, data e ora, pagina richiesta, tipo di browser. Servono a far funzionare il sito e a proteggerlo da abusi. La base giuridica è il nostro legittimo interesse alla sicurezza del sito. Questi registri sono conservati da GitHub secondo le sue regole, per il tempo necessario a questo scopo. Ne parla anche l'<a class="link" href="{→cookie}">informativa sui cookie</a>.</p>

<h3>Quando ci scrivi</h3>
<p>Dal modulo dei <a class="link" href="{→contatti}">Contatti</a> ci arrivano il tuo nome, il tuo indirizzo di posta elettronica e il messaggio. Li usiamo solo per risponderti. La base giuridica è il rapporto che ci chiedi di avviare e il nostro legittimo interesse a rispondere a chi ci scrive. Conserviamo la corrispondenza per il tempo necessario a gestire la richiesta, e in seguito solo se ne nasce un rapporto con la Fondazione.</p>

<h3>Quando ci presenti un progetto</h3>
<p>Dal modulo <a class="link" href="{→progetti/presenta-il-tuo-progetto}">Presenta il tuo progetto</a> ci arrivano i dati di chi propone, la descrizione del progetto e il collegamento al documento che vuoi farci leggere. Li usiamo solo per valutare la proposta, e li conserviamo per la durata della valutazione; se il progetto entra tra quelli sostenuti, per la durata del rapporto. Non inserire nella proposta dati di altre persone senza il loro consenso.</p>

<h3>Quando dedichi un ricordo nel giardino</h3>
<p>Nel <a class="link" href="{→in-memoria/giardino-dei-ricordi}">giardino dei ricordi</a> scegli un'immagine e scrivi il nome di una persona che non c'è più, con una dedica facoltativa. Il messaggio arriva alla Fondazione per posta elettronica e il nome viene posato nel giardino a cura nostra: il sito non conserva nulla da sé. Pubblichiamo il nome della persona ricordata e la dedica, mai i tuoi recapiti. La base giuridica è il tuo consenso, che ci dai spuntando la casella nel modulo, con la dichiarazione di essere un familiare o comunque una persona che ha titolo a ricordarla.</p>
<p>In Italia i dati delle persone decedute hanno una tutela propria (art. 2-terdecies del Codice in materia di protezione dei dati personali): chi ha un interesse proprio, o agisce per ragioni familiari meritevoli di protezione, può chiederne la rimozione. Puoi chiedere in ogni momento di togliere una dedica, la tua o quella di un tuo caro scritta da altri, scrivendo a <a class="link" href="mailto:biodinamica@larosadoro.org">biodinamica@larosadoro.org</a>. Le pagine del giardino non sono offerte all'indicizzazione dei motori di ricerca.</p>

<h3>Quando fai una donazione</h3>
<p>Se doni con carta, Apple Pay o Google Pay, il pagamento avviene sulle pagine sicure di <strong>Stripe</strong> (Stripe Payments Europe Ltd, Irlanda). Se scegli PayPal, sulle pagine di <strong>PayPal</strong> (PayPal Europe S.à r.l. et Cie, S.C.A., Lussemburgo). In entrambi i casi il nostro sito non vede né conserva i dati della tua carta o del tuo conto: li raccolgono direttamente Stripe e PayPal, che trattano i dati del pagamento come titolari autonomi, secondo le loro informative (<a class="link" href="https://stripe.com/it/privacy" rel="noopener">Stripe</a>, <a class="link" href="https://www.paypal.com/it/legalhub/paypal/privacy-full" rel="noopener">PayPal</a>). Alla Fondazione arrivano il tuo nome, il tuo indirizzo di posta elettronica, l'importo, la data e la causale che hai scelto, oltre a un eventuale messaggio. Se doni con bonifico, ci arrivano i dati che la tua banca trasmette con il pagamento.</p>
<p>La base giuridica è il rapporto di donazione che scegli di avviare e gli obblighi di legge che ne derivano per la Fondazione, in particolare la tenuta delle scritture contabili e la rendicontazione della raccolta fondi prevista per gli enti del Terzo settore.</p>

<h3>La ricevuta e il codice fiscale</h3>
<p>Le donazioni alla Fondazione danno diritto a una detrazione o a una deduzione fiscale (art. 83 del Codice del Terzo settore). Per emettere la ricevuta che ti serve, ti chiediamo separatamente il codice fiscale, insieme al nome e all'indirizzo: la ricevuta è un obbligo nostro, non una condizione del pagamento, e per questo il codice fiscale non passa da Stripe né da PayPal. La base giuridica è l'obbligo di legge. Le ricevute e i documenti contabili sono conservati per <strong>dieci anni</strong>, come prevede il codice civile per le scritture contabili.</p>

<h3>Quando ti scriviamo noi</h3>
<p>A chi ha donato possiamo scrivere per ringraziare e per rendere conto di come è stato usato ciò che ha donato. Per altri messaggi, come le notizie sulle attività della Fondazione, ti chiediamo prima il consenso, e puoi ritirarlo in ogni momento con una riga di risposta.</p>

<h3>Chi tratta i dati insieme a noi</h3>
<p>Oltre alle persone della Fondazione, i tuoi dati sono trattati da alcuni fornitori, ciascuno per la sua parte:</p>
<ul>
<li><strong>GitHub</strong> (GitHub, Inc., Stati Uniti) ospita le pagine del sito e ne tiene i registri tecnici, per conto della Fondazione;</li>
<li><strong>Forminit</strong> (UXPLUS Ltd, Regno Unito) riceve i messaggi dei moduli e ce li recapita, per conto della Fondazione; i dati sono conservati cifrati su server in Irlanda; %(V)s</li>
<li><strong>Stripe</strong> e <strong>PayPal</strong> gestiscono i pagamenti come titolari autonomi, come detto sopra;</li>
<li>la <strong>banca</strong> della Fondazione, per i bonifici.</li>
</ul>
<p>Non vendiamo, non cediamo e non diffondiamo i tuoi dati. Possiamo comunicarli solo a chi la legge ci obbliga a comunicarli: per esempio al commercialista e agli organi di controllo, per la tenuta dei conti e il bilancio.</p>

<h3>Fuori dall'Unione europea</h3>
<p>GitHub tratta i registri tecnici negli Stati Uniti. Il trasferimento è coperto dal Data Privacy Framework tra Unione europea e Stati Uniti (decisione di esecuzione (UE) 2023/1795), al quale GitHub aderisce, e dalle clausole contrattuali standard della Commissione europea (decisione 2021/914). Forminit tratta i dati nel Regno Unito, Paese che l'Unione europea riconosce come adeguato (decisione rinnovata il 19 dicembre 2025), e li conserva in Irlanda. Stripe e PayPal, come titolari autonomi, rispondono in proprio delle garanzie sui trasferimenti, descritte nelle loro informative.</p>

<h3>Per quanto tempo</h3>
<ul>
<li>registri tecnici del sito: per il tempo necessario alla sicurezza, secondo le regole di GitHub;</li>
<li>messaggi dei moduli: per il tempo necessario a gestire la richiesta o la valutazione;</li>
<li>dediche nel giardino: finché la pagina resta in linea, o finché non ne chiedi la rimozione;</li>
<li>dati delle donazioni, ricevute e documenti contabili: dieci anni;</li>
<li>consenso a ricevere notizie: finché non lo ritiri.</li>
</ul>

<h3>I tuoi diritti</h3>
<p>Puoi chiederci in ogni momento di sapere quali dati abbiamo su di te, di correggerli, di cancellarli, di limitarne l'uso, di opporti al trattamento, di riceverli in un formato leggibile da una macchina; puoi ritirare un consenso che ci hai dato, senza che questo tocchi ciò che è stato fatto prima. Basta una riga a <a class="link" href="mailto:biodinamica@larosadoro.org">biodinamica@larosadoro.org</a>. Se ritieni che i tuoi dati siano trattati in modo scorretto, puoi rivolgerti al Garante per la protezione dei dati personali (<a class="link" href="https://www.garanteprivacy.it" rel="noopener">garanteprivacy.it</a>).</p>

<h3>Se hai meno di quattordici anni</h3>
<p>Il sito non si rivolge ai bambini e parla di temi che riguardano la perdita e la fine della vita. I moduli sono per chi ha almeno quattordici anni; per i più piccoli occorre l'intervento di chi esercita la responsabilità genitoriale (art. 2-quinquies del Codice in materia di protezione dei dati personali).</p>

<h3>Questa informativa</h3>
<p>È stata scritta l'8 settembre 2026, prima dell'apertura del sito, e verrà aggiornata quando cambierà qualcosa: per esempio se aggiungeremo un nuovo modo di donare o un nuovo fornitore. La data dell'ultimo aggiornamento sarà sempre indicata qui.</p>
""" % dict(V=V))

TESTI["cookie"] = dict(
    sotto="Questo sito non usa cookie. Ecco che cosa significa.",
    corpo="""
<p>Questo sito è composto solo da pagine statiche e <strong>non utilizza cookie di profilazione né altri strumenti di tracciamento</strong>. Per questo non trovi un banner da accettare: la legge lo richiede solo a chi traccia.</p>
<p>Non usiamo sistemi di analisi del traffico, né contenuti incorporati da terzi come video, mappe o pulsanti dei social. I caratteri tipografici sono ospitati sui nostri stessi server, così nessun altro sa che stai leggendo queste pagine.</p>
<p>L'unico dato raccolto automaticamente è quello dei normali registri tecnici del servizio che ospita il sito, GitHub Pages: indirizzo IP, data e ora, pagina richiesta, tipo di browser. Serve alla sola sicurezza del sito ed è trattato sulla base del nostro legittimo interesse, come previsto dalle linee guida del Garante per la protezione dei dati personali del 10 giugno 2021.</p>
<p>Quando doni con carta o con PayPal, il pagamento avviene sulle pagine di Stripe o di PayPal, che hanno le loro regole sui cookie: le trovi nelle loro informative, prima di pagare.</p>
<p>Se un giorno aggiungeremo strumenti che richiedono il consenso, questa pagina cambierà e comparirà il banner. Per tutto il resto, leggi l'<a class="link" href="{→privacy}">informativa sulla privacy</a>.</p>
""")


# ------------------------------------------------------------ Chi siamo (testo di Dacia, 14.9)
TESTI["chi-siamo"] = dict(
    sotto="Accanto alla vita, dalla terra al cielo.",
    motto=True,
    corpo="""
<figure class="logo-grande"><img src="{img:logo.jpg}" alt="Il logo della Fondazione: una rosa tra le spighe, in un cerchio d'oro" width="720" height="720"></figure>
<p>La <strong class="oro">Fondazione La Rosa d'Oro</strong> è un ente non profit riconosciuto dal Registro unico nazionale del Terzo settore, con sede a Milano, costituito il 26 febbraio 2026. Ciò che ci caratterizza è:</p>
<ul class="stelle">
<li>l'<strong class="oro">attenzione</strong> alle esigenze della persona, del territorio e del terreno agricolo, insieme all'<strong class="oro">ascolto</strong> profondo della persona e dei gruppi di persone, e la sensibilità;</li>
<li>la capacità di <strong class="oro">mediazione</strong>: facilitare il dialogo e risolvere i conflitti in ambito familiare e comunitario. Ciò avviene di pari passo con il networking, l'abilità relazionale e strategica di stabilire, sviluppare e mantenere relazioni a lungo termine con persone, aziende, istituzioni pubbliche e private, e di creare reti di comunità, grazie a cui si favorisce la sussidiarietà orizzontale. In particolare, la cooperazione a livello internazionale ci permette di ottenere risultati più forti;</li>
<li>l'<strong class="oro">operosità</strong> e la <strong class="oro">concretezza</strong>: far vivere nella pratica un progetto, un ideale, con impegno concreto, attivo e instancabile;</li>
<li>la <strong class="oro">responsabilità</strong>: rendersi protagonisti di piccoli grandi cambiamenti per il pianeta Terra;</li>
<li>il <strong class="oro">coraggio</strong> di operare per il bene comune, con spirito civico, altruistico e solidale, attraverso interventi e servizi sociali, agricoli, paesaggistici e sociosanitari;</li>
<li>lo spirito di <strong class="oro">innovazione</strong> e di <strong class="oro">ricerca</strong>: sostenere il progresso scientifico, artistico o sociale per creare un impatto positivo e nutrire l'anima;</li>
<li>la <strong class="oro">trasparenza</strong>: la gestione etica e rendicontabile del patrimonio, la coerenza tra gli scopi dichiarati e le azioni.</li>
</ul>
<p class="citazione">Coltiviamo la terra, accogliamo la vita, custodiamo il cammino fino alla fine.</p>
<p class="tre-parole">Fede, Amore e Speranza</p>
<p>La Fondazione non ha scopo di lucro e persegue finalità civiche, solidaristiche e di utilità sociale, con attività in ambito sociale e sociosanitario. Ha carattere <strong>operativo</strong>, in quanto promuove, crea e gestisce progetti offrendo beni e servizi in prima persona, ed <strong>erogativo</strong>, in quanto fornisce consulenze e risorse, materiali o immateriali, a terzi.</p>
<h3>Cosa offriamo</h3>
<div class="offerte">
<div class="box">
<h4>Assistenza alle persone</h4>
<p>L'accompagnamento medico-assistenziale e spirituale nel fine vita: il nostro impegno va oltre le cure mediche e assistenziali, e offre un accompagnamento che tocca anche la sfera spirituale, garantendo dignità, sollievo e calore umano in ogni fase della vita, fino agli istanti più delicati.</p>
<p>L'assistenza a persone fragili: anziani, persone con patologie croniche, con dipendenze, minori in difficoltà, persone con disturbi dello spettro autistico, con grave disabilità, con patologie neurologiche e neuropsichiatriche.</p>
<p>L'uso delle risorse agricole per migliorare le condizioni di salute e la qualità della vita — di bambini con patologie oncologiche, di giovani a rischio di esclusione sociale — perché il contatto con la terra aiuta a ritrovare una dimensione individuale e sociale e una propria identità produttiva: i ragazzi sono coinvolti nell'intera filiera e accompagnati verso la vita adulta e l'indipendenza economica. E l'agricoltura sociale: attività agricole produttive, biologiche, biodinamiche e rigenerative, per la tutela del paesaggio, della biodiversità e del suolo, che garantisce alimenti sani come strumento di prevenzione.</p>
<p class="citazione">Proteggiamo e custodiamo la Terra, perché un ambiente sano e un cibo sano significano una vita migliore per tutti.</p>
<p>La promozione e la tutela dei diritti umani, civili, sociali e politici, dei diritti dei consumatori e degli utenti delle attività di interesse generale, delle pari opportunità e delle iniziative di aiuto reciproco. La beneficenza, il sostegno a distanza, la cessione gratuita di alimenti o prodotti, l'erogazione di denaro, beni o servizi a sostegno di persone svantaggiate o di attività di interesse generale.</p>
<p><a class="vai" href="{→servizi}">I servizi</a></p>
</div>
<div class="box">
<h4>Assistenza alla natura</h4>
<p>Interventi e servizi per la salvaguardia e il miglioramento dell'ambiente e per l'uso accorto e razionale delle risorse naturali: bonifiche, ripristino idrogeologico, riforestazione, rinaturalizzazione; la creazione di aree verdi e parchi per la tutela della biodiversità.</p>
<p>La tutela e la valorizzazione del patrimonio culturale e paesaggistico; la riqualificazione di beni pubblici inutilizzati e di antiche ville abbandonate.</p>
<p><a class="vai" href="{→servizi/agricoltura-sociale}">Agricoltura sociale</a></p>
</div>
<div class="box">
<h4>Formazione e divulgazione</h4>
<p>La formazione per gli operatori del fine vita e per gli agricoltori; la formazione universitaria, post-universitaria e professionale; la formazione e l'aggiornamento continuo di personale sanitario, medico e di operatori delle discipline terapeutiche e del benessere, in particolare in ambito fitoterapico.</p>
<p>Attività culturali di interesse sociale con finalità educativa; la formazione extra-scolastica, per prevenire la dispersione scolastica e il bullismo e contrastare la povertà educativa. Percorsi educativi e formativi strutturati — corsi pluriennali, master, scuole di specializzazione, seminari, workshop e convegni — negli ambiti medico-terapeutico, socio-assistenziale, dell'educazione alimentare, dell'agricoltura e dell'agricoltura sociale, della rigenerazione territoriale.</p>
<p>Laboratori produttivi, artigianali e agricoli, residenziali e non, in cui il lavoro manuale e la realizzazione di manufatti sono strumento terapeutico e pedagogico. Attività culturali, artistiche e ricreative di interesse sociale.</p>
<p><a class="vai" href="{→eventi-e-formazione}">Eventi e formazione</a></p>
</div>
<div class="box">
<h4>Ricerca e promozione del futuro</h4>
<p>Ricerche sulle potenzialità di nuove piante medicinali e sull'effetto di nuove modalità di cura, per esempio in ambienti naturali e nel paesaggio; la valutazione del valore dell'assistenza medica con un approccio su corpo, mente e spirito, anche con pratiche artistiche o olistiche; la valutazione dell'impatto sociale degli interventi di riqualificazione.</p>
<p>Incubare, sostenere e promuovere progetti di altre realtà con una visione comune, con l'erogazione di beni e servizi. Sosteniamo in particolare il talento e la determinazione dei giovani: borse di studio e laboratori per le idee della prossima generazione, per aiutare a costruire i leader e i ricercatori del futuro.</p>
<p><a class="vai" href="{→progetti}">I progetti</a></p>
</div>
</div>
<p><a class="vai" href="{→progetti/da-sostenere}">Scopri i progetti che stiamo finanziando, e come puoi fare la tua parte</a></p>
<h3>La nostra storia</h3>
{foto:ASSISI 2025|La basilica di San Francesco ad Assisi, settembre 2025|ritratto oro}
<p>Tutto nasce ad Assisi, durante la festa di Michele, nel settembre del 2025. Si trovano lì un agricoltore, consulente bioforestale, e un medico, a parlare delle gioie e delle difficoltà nei reciproci campi. Osservano come sia la medicina sia l'agricoltura si trovino in uno spazio di transizione, in cui tanto deve essere fatto perché le due discipline lavorino davvero a favore dell'umano e per l'umano. Nello stesso tempo, dalle necessità portate dalle persone con cui entrambi hanno a che fare, arriva la domanda di aiuto: creare un ponte tra passato e futuro, facilitare la nascita di progetti e tutte quelle situazioni legate al lutto e alla successione, spesso complicate sul piano pratico e poco in linea con i desideri di chi non c'è più. Mentre camminano dalla basilica di San Francesco verso la Porziuncola, tra gli ulivi, il progetto sottilmente si crea.</p>
<div class="foto-riga">
{foto:ULIVI DI ASSISI|Gli ulivi sotto la collina di Assisi|oro}
{foto:SANTA CHIARA|La basilica di Santa Chiara|oro}
</div>
<p>Dopo profonde meditazioni durante le Notti Sante e valutazioni attente, i due lavorano alla creazione di una Fondazione, il cui statuto viene partorito il 7 gennaio 2026. Il 26 febbraio 2026 la Fondazione La Rosa d'Oro prende forma reale.</p>
<h3>I fondatori</h3>
<p><strong>Dr.ssa Dacia Dalla Libera</strong>, presidente. Medico chirurgo, neurologa ed esperta di medicina integrata (ayurveda, antroposofia); <em>quietude practitioner</em>, una figura di supporto spirituale e nel fine vita che offre cura emotiva e spirituale a chi affronta la morte, il fine vita e il lutto; formatrice.</p>
<p><strong>Elias Minotti</strong>, vicepresidente. Agricoltore, tecnico, formatore e consulente negli ambiti agricolo, agroalimentare e forestale, della gestione ambientale, paesaggistica e del verde in genere.</p>
<p>Per conoscere il nostro statuto: <a class="link" href="{→documenti}">la pagina Documenti</a>.</p>
<p class="citazione unica">Ammirare il Bello, Custodire il Vero, Venerare il Nobile, Decidere il Bene.</p>
""")


# ------------------------------------------------------------ La libertà del come (le DAT), pagina a sé: prova del 14.9 su richiesta di Dacia, da confermare con Elias
TESTI["lasciti/la-liberta-del-come"] = dict(
    sotto="Le Disposizioni anticipate di trattamento: esprimi le tue volontà sulle cure, finché puoi.",
    corpo="""
<p class="citazione">Crediamo che la dignità e l'autodeterminazione debbano essere garantite in ogni momento della vita.</p>
<p>Le DAT riguardano le cure, non i beni, e si possono fare anche senza un testamento. Tramite lo strumento formale delle <strong>Disposizioni anticipate di trattamento</strong> (DAT), ciascuno ha la possibilità di esprimere in modo chiaro e consapevole le proprie volontà in ambito sanitario, assicurando che le proprie preferenze vengano rispettate qualora dovesse sopraggiungere una temporanea o permanente incapacità di comunicare. È un'importantissima tutela della propria libertà, spesso poco conosciuta.</p>
<p>Le DAT, dette anche testamento biologico e regolate dalla legge 219/2017, permettono a una persona maggiorenne e capace di intendere e di volere di esprimere in anticipo le proprie volontà sulle cure: accertamenti diagnostici, scelte terapeutiche, trattamenti di sostegno vitale come la nutrizione e l'idratazione artificiali. Hanno effetto quando non si è più in grado di autodeterminarsi. Come per il testamento, anche in questo caso i tuoi cari saranno sollevati dal dover prendere decisioni complesse in momenti di dolore, in cui è facile perdere la lucidità, e saranno ridotti i potenziali conflitti tra i membri della famiglia.</p>
<p>Si redigono per atto pubblico, per scrittura privata autenticata da un notaio, oppure per scrittura privata consegnata di persona all'ufficio dello stato civile del proprio Comune; sono esenti da bollo e da ogni tassa; si possono revocare o modificare in qualsiasi momento, con le stesse forme. Puoi indicare un <strong>fiduciario</strong> — la cosiddetta delega sanitaria — cioè una persona di fiducia che faccia le tue veci con i medici e faccia valere la tua volontà. Con il tuo consenso, le DAT sono inserite nella Banca dati nazionale del Ministero della Salute (legge 205/2017, art. 1, comma 418), accessibile ai medici in caso di necessità. Se in futuro dovessi cambiare idea, potrai modificarle in qualsiasi momento, esattamente come per il <a class="link" href="{→lasciti/il-tuo-testamento}">testamento</a>.</p>
<p>Avere una disposizione anticipata di trattamento, in genere, significa che eviterai:</p>
<ul class="stelle">
<li>dolore inutile;</li>
<li>procedure inutili;</li>
<li>un ricovero ospedaliero non desiderato.</li>
</ul>
<p>Consigliamo inoltre di specificare:</p>
<ul class="stelle">
<li>dove desideri soggiornare durante le cure di fine vita: in un hospice (puoi scrivere anche quale), in una struttura di cure palliative, a casa con o senza cure palliative, o in un altro luogo — per esempio quanto previsto dal progetto «Pianeta Verde», quando sarà attivo;</li>
<li>se richiedi un'assistenza spirituale: puoi indicare anche la Fondazione e la sua équipe del Pianeta Verde;</li>
<li>se consenti qualsiasi visitatore, o limiti l'accesso ad alcuni cari o a nessuno, nel momento del passaggio della soglia e nelle settimane che lo precedono.</li>
</ul>
<p>Se una malattia cronica, progressiva e invalidante è già presente, lo strumento complementare è la <strong>Pianificazione condivisa delle cure</strong> (art. 5 della stessa legge): un dialogo continuativo tra il paziente, il medico curante e, se lo desidera, i familiari o il fiduciario, per definire insieme un percorso di cura proporzionato alle fasi della malattia.</p>
<p><strong>Attraverso una disposizione anticipata di trattamento puoi comunicare ai medici cosa desideri — o non desideri — finché sei in grado di farlo. Garantisci che i tuoi desideri più intimi e familiari vengano rispettati.</strong></p>
<p class="citazione unica">Esprimi le tue volontà in merito alle cure di fine vita.</p>
<p>La Fondazione ha preparato un fac-simile per le DAT, da compilare e portare al notaio o al Comune: <a class="link" href="{file:DAT-modulo-bozza.pdf}">scarica il modulo (PDF)</a>. È una bozza in lettura: non sostituisce il colloquio con il tuo medico.</p>
<p class="citazione">Hai dubbi su cosa decidere? Scrivici e chiedi un confronto con un medico.</p>
<p><a class="vai" href="{→contatti}">Scrivici</a></p>
""")


# ------------------------------------------------------------ Per aziende e istituzioni (testi di Dacia, 15.9)
TESTI["aziende-e-istituzioni/aziende"] = dict(
    sotto="La tua azienda può sostenere uno dei progetti della Fondazione La Rosa d'Oro.",
    corpo="""
<p class="citazione">«La bontà è l'unico investimento che non fallisce mai.» — Henry David Thoreau</p>
<p>Ci sono molti modi in cui un'azienda può camminare con noi. Eccone alcuni.</p>
<ul class="stelle">
<li><strong>Cause related marketing</strong>: entra nel cuore dei tuoi clienti coinvolgendoli in un gesto concreto di solidarietà al momento dell'acquisto di un prodotto o di un servizio.</li>
<li><strong>Donazioni in natura</strong>: dona i prodotti invenduti, le eccedenze di magazzino o gli oggetti provenienti da eventi e allestimenti, per sostenere i progetti e le iniziative.</li>
<li><strong>Il benessere delle persone</strong>: rafforza le relazioni e il benessere della comunità aziendale con iniziative di formazione, consulenza alla persona e volontariato aziendale.</li>
<li><strong>Il team building solidale</strong>, per rafforzare il senso di appartenenza: attività di gruppo — uscite con famiglie e bambini (eventi culturali, sportivi, nella natura) o visite alle strutture della Fondazione; e il donare insieme — sostegno a distanza, <em>match giving</em>, <em>payroll giving</em>, raccolte di doni (Back to School, Uovo Sospeso e altre).</li>
<li><strong>Consulenza e sostegno psicologico</strong> per le persone dell'azienda, sui temi dell'adolescenza, della genitorialità, del contrasto alla violenza di genere, del benessere digitale, del benessere alimentare in <em>smart working</em>. Alcune azioni possibili: counselling e coaching per l'empowerment relazionale, familiare e lavorativo; uno sportello online dedicato; corsi di leadership per sviluppare una leadership positiva, comunicazioni autentiche e un ambiente di lavoro sereno.</li>
</ul>
<p>Tutto questo si riflette sulla reputazione del marchio: la percezione che il pubblico ha della tua azienda.</p>
<p class="citazione">Promuovi il benessere olistico dei dipendenti, integrando salute fisica, mentale, emotiva, sociale e finanziaria, attraverso strategie di welfare evolute.</p>
<h3>I vantaggi fiscali</h3>
<p>Le donazioni agli enti del Terzo settore sono deducibili o detraibili nei limiti di legge (art. 83 del Codice del Terzo settore). E il welfare aziendale gode di un regime di favore, disciplinato dal Testo unico delle imposte sui redditi (TUIR), che trasforma la spesa per il benessere in un risparmio per l'azienda e per il dipendente. {verifica}</p>
<ul class="stelle">
<li><strong>Per l'azienda: costi certi e deducibilità.</strong> Su premi e aumenti in busta paga l'azienda paga contributi aggiuntivi per circa il 30–35%; con il welfare aziendale questo sovraccarico scompare: 1.000 euro stanziati in servizi costano all'azienda esattamente 1.000 euro. Le somme investite in servizi di utilità sociale o di benessere sono deducibili dal reddito d'impresa (artt. 95 e 100 del TUIR), a patto che siano rivolte alla generalità dei dipendenti o a categorie omogenee, e regolate da un accordo o da un regolamento aziendale. {verifica}</li>
<li><strong>Per il dipendente: valore lordo uguale a valore netto.</strong> I beni e i servizi erogati con un piano di welfare non concorrono a formare il reddito da lavoro dipendente: 1.000 euro di credito welfare sono 1.000 euro di servizi, senza tasse e senza contributi. {verifica}</li>
<li><strong>I fringe benefit.</strong> I benefit in beni o voucher (buoni spesa, rimborsi delle bollette, carte carburante) seguono le regole dell'art. 51, comma 3, del TUIR, con soglie di esenzione di 1.000 euro l'anno per la generalità dei dipendenti e di 2.000 euro per chi ha figli fiscalmente a carico. {verifica}</li>
<li><strong>La conversione del premio di risultato.</strong> Convertire in welfare un premio legato alla produttività azzera anche la tassazione sostitutiva prevista per i premi in denaro e la quota di contributi a carico del lavoratore: il dipendente riceve il 100% del valore in servizi. {verifica}</li>
</ul>
<p class="citazione unica">La Fondazione La Rosa d'Oro: una realtà viva e vera.</p>
<p class="citazione">La responsabilità dell'azienda va oltre il business: investire nel futuro della comunità è il modo più autentico per restituire valore.</p>
<p><a class="vai" href="{→contatti}">Parliamone: scrivici</a></p>
""")

TESTI["aziende-e-istituzioni/istituzioni"] = dict(
    sotto="Sei un'istituzione pubblica? Collabora con noi.",
    corpo="""
<p class="citazione">«Ci guadagniamo da vivere con ciò che otteniamo, ma costruiamo una vita con ciò che doniamo.» — attribuita a Winston Churchill</p>
<p>Le fondazioni private, filantropiche o bancarie, possono collaborare con le istituzioni nel modello del partenariato pubblico-privato sociale, per moltiplicare l'impatto degli interventi sul territorio. Questa sinergia unisce la capillarità e la legittimità delle istituzioni con la flessibilità, l'innovazione e le risorse delle fondazioni. Ecco le principali attività e i modi in cui operare insieme.</p>
<h3>1. Rigenerazione urbana e beni comuni</h3>
<ul class="stelle">
<li><strong>Co-progettazione di spazi pubblici</strong>: il recupero di aree dismesse, parchi, periferie o beni culturali dimenticati, per restituirli alla cittadinanza come centri sociali, culturali o sportivi.</li>
<li><strong>Patti di collaborazione</strong>: accordi di amministrazione condivisa in cui istituzioni, fondazioni e cittadini gestiscono insieme un bene comune, come una biblioteca di quartiere o un giardino pubblico.</li>
</ul>
<h3>2. Welfare di comunità e contrasto alle fragilità</h3>
<ul class="stelle">
<li><strong>Lotta alla povertà educativa</strong>: bandi congiunti, come il fondo nazionale per il contrasto della povertà educativa minorile, per sostenere scuole, doposcuola e centri giovanili nei contesti svantaggiati.</li>
<li><strong>Inclusione sociale e socio-sanitaria</strong>: progetti di housing sociale per persone in difficoltà economica, anziani o persone con disabilità, in cui il Comune offre la struttura o le autorizzazioni e la fondazione finanzia la ristrutturazione e i servizi di assistenza.</li>
</ul>
<h3>3. Formazione in ambito agricolo, sanitario e nell'accompagnamento alla morte</h3>
<ul class="stelle">
<li>la formazione dei volontari e della cittadinanza;</li>
<li>percorsi di reinserimento e di riallenamento;</li>
<li><strong>strategie nazionali e standard professionali</strong>: allineare i moduli formativi della fondazione alle linee guida istituzionali, perché medici, infermieri e specialisti ricevano competenze certificate e omogenee;</li>
<li><strong>campagne di sensibilizzazione</strong>: collaborare per sciogliere il tabù della morte con eventi pubblici, convegni e tavoli di lavoro istituzionali;</li>
<li><strong>un modello di finanziamento misto</strong>: l'ente pubblico copre i costi strutturali o concede i patrocini, la fondazione sostiene i costi vivi, le borse di studio o le tecnologie didattiche.</li>
</ul>
<h3>4. Innovazione e ricerca</h3>
<ul class="stelle">
<li><strong>Sostegno alla ricerca scientifica</strong>: il co-finanziamento di borse di studio, laboratori universitari o progetti di ricerca biomedica, agricola e tecnologica.</li>
<li><strong>Sperimentazione di nuove politiche</strong>, con progetti pilota per provare un servizio innovativo, per esempio un nuovo modello di assistenza domiciliare: se il progetto funziona, l'istituzione pubblica può assorbirlo e trasformarlo in una politica strutturale.</li>
</ul>
<h3>5. Cultura, arte e valorizzazione del territorio</h3>
<ul class="stelle">
<li><strong>Grandi eventi e mostre</strong>: l'organizzazione e la promozione di festival culturali, rassegne d'arte o restauri di monumenti che il solo bilancio comunale o statale non riuscirebbe a coprire.</li>
<li><strong>Turismo sostenibile</strong>: percorsi turistici, culturali e spirituali per valorizzare i piccoli borghi e le aree interne, compresi i cammini, come la via Francigena.</li>
</ul>
<p><a class="vai" href="{→contatti}">Parliamone: scrivici</a></p>
""")

# ------------------------------------------------------------ Formazione all'accompagnamento (testo iniziale di Dacia, 15.9)
TESTI["eventi-e-formazione/formazione-accompagnamento"] = dict(
    sotto="Stare accanto a chi si trova nell'ultimo tratto della vita: competenze emotive, pratiche e spirituali.",
    corpo="""
{foto:DUE MANI|Due mani che si tengono|ritratto oro}
<p>La formazione per l'accompagnamento alla morte, o al fine vita, è un percorso multidisciplinare rivolto a professionisti sanitari, volontari e cittadini che desiderano acquisire competenze emotive, pratiche e spirituali per stare accanto a chi si trova nell'ultimo tratto della vita.</p>
<p>I percorsi formativi sono diversi:</p>
<ul class="stelle">
<li><strong>Quietude Italia</strong>;</li>
<li>la formazione per la cittadinanza e il volontariato;</li>
<li>la formazione online sulle DAT, le <a class="link" href="{→lasciti/la-liberta-del-come}">Disposizioni anticipate di trattamento</a>.</li>
</ul>
<p><a class="vai" href="{→contatti}">Vuoi partecipare? Scrivici</a></p>
""")

# ------------------------------------------------------------ Il 5 per mille (15.9: Elias conferma che l'iscrizione è completata dal commercialista)
TESTI["cinque-per-mille"] = dict(
    sotto="Una firma, nessun costo: una parte delle tue imposte al lavoro della Fondazione.",
    corpo="""
<p>Il 5 per mille è una quota dell'IRPEF che lo Stato destina comunque: con una firma puoi decidere che vada alla Fondazione La Rosa d'Oro. Non costa nulla, e non sostituisce l'8 per mille né il 2 per mille, che restano scelte separate.</p>
<h3>Come si fa</h3>
<ol>
<li>Nella dichiarazione dei redditi (modello 730 o modello Redditi), oppure nella scheda allegata alla Certificazione unica se non sei tenuto a presentare la dichiarazione, cerca il riquadro <strong>«Sostegno degli enti del Terzo settore iscritti nel RUNTS»</strong>.</li>
<li>Firma nel riquadro.</li>
<li>Scrivi il codice fiscale della Fondazione: <strong class="oro">14629350969</strong>.</li>
</ol>
<p>Se ti affidi a un CAF o a un commercialista, basta dirgli: «Il 5 per mille alla Fondazione La Rosa d'Oro, codice fiscale 14629350969».</p>
<p>La Fondazione è iscritta nell'elenco degli enti beneficiari del 5 per mille. Le somme ricevute vengono rendicontate come prevede la legge, e il rendiconto sarà pubblicato nella pagina <a class="link" href="{→documenti}">Documenti</a>.</p>
<p class="citazione unica">Una firma che non ti costa nulla, e che a qualcuno cambia molto.</p>
""")

# il segno «da verificare», sostituito nei testi dei Lasciti
for k in ("lasciti/perche-donare", "lasciti/il-tuo-testamento", "lasciti/il-lascito-testamentario", "aziende-e-istituzioni/aziende"):
    TESTI[k]["corpo"] = TESTI[k]["corpo"].replace("{verifica}", V)


# ------------------------------------------------------------ News (voce nel menu, 15.9)
TESTI["news"] = dict(
    sotto="Le novità della Fondazione: incontri, progetti, notizie.",
    corpo="""
<p class="segnaposto">[Qui arrivano le novità, una sotto l'altra, con la data: la più recente in alto. Le prime si scrivono quando ci sono.]</p>
""")


# ------------------------------------------------------------ Per aziende e istituzioni: la pagina d'ingresso (citazione, Dacia 16.9)
TESTI["aziende-e-istituzioni"] = dict(
    corpo="""
<p>Le forme di collaborazione che lo statuto prevede per aziende e istituzioni: partecipazione, sostegno ai progetti, iniziative condivise.</p>
<p class="citazione">«Il valore di un uomo si misura da ciò che dà, e non da ciò che è capace di ricevere.» — attribuita ad Albert Einstein</p>
""")

# ------------------------------------------------------------ Lavora con noi (testo di Dacia, 16.9)
TESTI["lavora-con-noi"] = dict(
    sotto="Condividi i nostri valori? Il tuo talento può fare la differenza.",
    motto=True,
    corpo="""
<p class="citazione">Condividi i nostri valori? Sei un professionista qualificato? Il tuo talento può fare la differenza: unisciti al team della Fondazione.</p>
<p>Siamo alla ricerca delle seguenti figure:</p>
<ul class="stelle">
<li><strong>avvocati, notai, commercialisti</strong> — vedi i <a class="link" href="{→professionisti}">progetti dedicati</a>;</li>
<li><strong>counsellor</strong> — vedi i <a class="link" href="{→in-memoria/io-sono-qui-per-te}">progetti dedicati</a>;</li>
<li><strong>celebranti laici di funerali</strong> — vedi i <a class="link" href="{→in-memoria/funerali}">progetti dedicati</a>;</li>
<li><strong>team per i traslochi</strong> — vedi i <a class="link" href="{→in-memoria/svuota-e-sorridi}">progetti dedicati</a>;</li>
<li><strong>volontari</strong> — operatori socio-sanitari, infermieri, medici, fisioterapisti, psicologi, <em>quietude practitioner</em> — interessati e qualificati per assistere nel delicato momento del fine vita.</li>
</ul>
<p>Unisciti alla nostra Fondazione per costruire insieme un futuro migliore e generare un impatto positivo concreto sulla comunità.</p>
<p>Se sei interessato a collaborare con noi, inviaci oggi stesso la tua candidatura, accompagnata da una lettera di presentazione: <a class="link" href="mailto:biodinamica@larosadoro.org">biodinamica@larosadoro.org</a>.</p>
<p><a class="vai" href="{→contatti}">Scrivici</a></p>
""")
