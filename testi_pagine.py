# -*- coding: utf-8 -*-
"""
I testi delle pagine, redazionati dai materiali di Dacia (settembre 2026).
La voce è la sua; la redazione (refusi, misura, registro) è concordata.

Gettoni usati nei testi, sostituiti dall'assemblatore:
  {→cartella}        collegamento relativo alla pagina indicata
  {img:file.svg}     percorso di un'immagine in img/
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
<p class="citazione">Le memorie più belle sono quelle che durano in eterno. Le memorie più belle sono quelle che plasmano la realtà.</p>
<p>Un fondo di memoria è una donazione o una raccolta fondi che commemora la vita di una persona speciale. Esso crea un ponte tra ciò che è stato e ciò che sarà, tra il mondo della materia e il mondo spirituale, tra il mondo del tuo agire e quello dei tuoi cari che non possono più compiere azione. Come un arcobaleno.</p>
{foto:ARCOBALENO1|Un arcobaleno|cielo}
<p>Scegliendo attivamente di onorare coloro che non ci sono più, crei un dialogo continuo di amore e memoria che arricchisce la tua vita e quella di chi ti circonda. Secondo alcune tradizioni spirituali e l'antroposofia, ad esempio, questo atto allevia anche le pene di chi è dipartito, magari prematuramente, lasciando in sospeso cose o situazioni.</p>
<h3>Apri un fondo per onorare il tuo caro e i suoi valori, sostenendo un progetto</h3>
<p>Trasforma il lutto in un aiuto concreto a favore di progetti e cause che erano vicini alla persona scomparsa, e che vivranno nel futuro grazie a un atto di amore e di gratitudine. La vita può cambiare irrimediabilmente con una perdita; attraverso un progetto concreto, però, l'essenza di chi non c'è più continua a toccare il mondo, con un legame che trascende la morte.</p>
<p class="citazione">Un gesto semplice e importante, che può permettere a noi di portare a termine oggi ciò che ieri è rimasto incompiuto.</p>
<p>Aprire un fondo in memoria di un nonno contadino, sostenendo progetti di agricoltura cosciente, può motivare le generazioni future a curarsi della terra e a rinnovare tradizioni antiche con pratiche sostenibili.</p>
<p class="citazione">Ci sono momenti in cui il passato pesa come un debito non saldato.</p>
<p>O ancora: una donna avrebbe voluto diventare violinista e, per le avversità della vita, non ha potuto farlo; dedicare il suo fondo a un progetto sulla musica è un modo per far perseguire ciò che in vita non è accaduto.</p>
{foto:BIMBA 1|Una bambina|ritratto}
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
<h3>Che cosa puoi donare</h3>
<ul>
<li>una somma di denaro;</li>
<li>titoli, azioni, buoni postali, fondi di investimento o il tuo TFR;</li>
<li>beni mobili: opere d'arte, gioielli, arredi, orologi, libri, oggetti d'antiquariato, collezioni;</li>
<li>aziende, attività e fondazioni del defunto;</li>
<li>beni immobili: appartamenti, terreni, fabbricati;</li>
<li>polizze vita: designare la Fondazione come beneficiaria è semplice e riservato, e le somme liquidate dall'assicuratore non entrano nell'asse ereditario (art. 1923 c.c.), fermi restando i diritti che la legge riserva ai legittimari sui premi versati;</li>
<li>la nuda proprietà.</li>
</ul>
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
<p>I contributi versati a un fondo di memoria della Fondazione sono detraibili o deducibili secondo l'art. 83 del Codice del Terzo Settore (D.Lgs. 117/2017). Per le persone: <strong>detrazione IRPEF del 30%</strong> dell'importo donato, su un massimo di 30.000 euro l'anno (vantaggio fino a 9.000 euro); in alternativa, <strong>deduzione dal reddito fino al 10%</strong> del reddito complessivo, con l'eccedenza riportabile nei quattro periodi d'imposta successivi. Per aziende, liberi professionisti e società: deduzione delle erogazioni in denaro fino al 10% del reddito dichiarato. Perché il beneficio valga, la donazione va fatta con strumenti tracciabili: bonifico, carta, versamento postale.</p>
<p class="citazione unica">Onoriamo la memoria di ieri dando ali ai sogni di domani.</p>
<p>Il fondo di memoria è previsto dallo statuto della Fondazione (art. 12, «Fondo della memoria ed eredità solidale»): lo trovi nella pagina <a class="link" href="{→documenti}">Documenti</a>; per i professionisti c'è la <a class="link" href="{→professionisti/fondo-della-memoria}">scheda dedicata</a>.</p>
<p>Ci sono anche altri modi per sostenere chi affronta un lutto: <a class="link" href="{→in-memoria/giardino-dei-ricordi}">il Giardino dei ricordi</a>, i <a class="link" href="{→in-memoria/funerali}">Funerali</a>, <a class="link" href="{→in-memoria/svuota-e-sorridi}">gli Svuota e Sorridi</a> e <a class="link" href="{→in-memoria/io-sono-qui-per-te}">Io sono qui per te</a>.</p>
""")

# ------------------------------------------------------- B · il giardino
TESTI["in-memoria/giardino-dei-ricordi"] = dict(
    sotto="Scegli un'immagine, scrivi il nome di chi vuoi ricordare: la posiamo nel giardino.",
    corpo="""
<p>Scorri la galleria e trova il fiore, l'oggetto o lo scorcio di natura che ti ispira di più. Scegli l'immagine e scrivi il nome della persona che vuoi ricordare — e, se vuoi, una dedica. Il nome arriva alla Fondazione e viene posato nel giardino, accanto all'immagine scelta.</p>
<div class="giardino" aria-label="Le immagini del giardino">
  <div class="pianta">{foto:FOTO APE|L'ape sul fiore|quadra}<button type="button" data-foto="L'ape sul fiore">Scegli questa immagine</button></div>
  <div class="pianta">{foto:ROSA|La rosa|quadra}<button type="button" data-foto="La rosa">Scegli questa immagine</button></div>
  <div class="pianta">{foto:GRANO PERSIANO|Il grano|quadra}<button type="button" data-foto="Il grano">Scegli questa immagine</button></div>
  <div class="pianta">{foto:NEVE1|La neve|quadra}<button type="button" data-foto="La neve">Scegli questa immagine</button></div>
  <div class="pianta">{foto:ARCOBALENO2|L'arcobaleno|quadra}<button type="button" data-foto="L'arcobaleno">Scegli questa immagine</button></div>
</div>
<figure class="dedica-esempio">
  {foto:FOTO APE|L'ape sul fiore, l'immagine dell'esempio|}
  <figcaption><strong>Nonna Clelia</strong><br>«Ci ha insegnato la pazienza dei fiori.» — <em>un esempio: il nome, e la dedica se si vuole</em></figcaption>
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
    <p class="nota">Il nome arriva alla Fondazione come messaggio e viene posato nel giardino a cura nostra.</p>
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
<p>È spesso difficile trovare la giusta distanza, e la giusta vicinanza, con chi ha subito un lutto. Sei l'azienda in cui la persona scomparsa lavorava, o un'associazione a cui ha dato molto in vita? Coinvolgi i tuoi dipendenti o i tuoi soci nel <a class="link" href="{→in-memoria/giardino-dei-ricordi}">Giardino dei ricordi</a>.</p>
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
<p>Stai attraversando la fase più delicata della vita e hai bisogno di una persona che ti aiuti? Accompagni un familiare al passaggio della soglia? <strong>Siamo qui per sostenere le persone in fin di vita, le loro famiglie e i loro cari, in modo concreto e spirituale, prendendo in considerazione tutto ciò che c'è attorno.</strong></p>
<p>Siamo qui per orientarti tra le decisioni e le scelte della fase finale della vita: dal funerale al testamento, fino a decidere chi si occuperà del tuo cane e del tuo gatto.</p>
<p>Hai voglia di liberare la casa e destinare i tuoi oggetti, ma non ne hai la forza? Siamo qui per te: il «riordino svedese» (Margareta Magnusson, <em>The Gentle Art of Swedish Death Cleaning</em>) accompagna un distacco graduale e sereno — e gli <a class="link" href="{→in-memoria/svuota-e-sorridi}">Svuota e Sorridi</a> possono darti una mano concreta.</p>
<h3>Un percorso con un counsellor</h3>
<p>Fai fatica a uscire dal lutto e a elaborarlo? Contattaci per un percorso con uno dei nostri counsellor. Il counsellor non cura — il lutto non è una malattia, è un processo naturale — ma offre uno spazio protetto, sicuro e non giudicante per esplorare le emozioni e ricostruire una quotidianità interrotta. Secondo le tue inclinazioni puoi scegliere chi lavora con piccole strategie di adattamento, con la meditazione, con l'arteterapia o con la scrittura espressiva. Sarai sostenuto in tutti i passaggi verso il futuro, per ricominciare a vivere.</p>
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
