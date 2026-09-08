# -*- coding: utf-8 -*-
"""
Fondazione La Rosa d'Oro ETS — l'assemblatore del sito
--------------------------------------------------------
Questo file contiene la mappa del sito (titoli, voci di menu, indirizzi)
e le parti comuni a tutte le pagine (header, footer, barra fissa).
Eseguendolo, scrive tutte le pagine dentro la cartella «sito/».

    python3 costruisci.py

Il committente non deve mai eseguirlo: lo faccio io e consegno la cartella
pronta. Serve perché un sito di cinquanta pagine senza database ha lo stesso
header in cinquanta file, e una modifica al menu va fatta una volta sola, qui.
"""
import os, re, shutil, datetime
from testi_pagine import TESTI

# --------------------------------------------------------------------------
# impostazioni
# --------------------------------------------------------------------------
DOMINIO = "https://larosadoro.org"      # [VERIFICARE] il dominio definitivo
ANTEPRIMA = True                          # True: le pagine chiedono ai motori di ricerca di non indicizzarle (indirizzo di prova)
LINK_PULITI = False                       # False: i collegamenti finiscono in «index.html», così il sito
                                          #        funziona anche aperto da una cartella sul computer.
                                          # True:  collegamenti puliti «/lasciti/», da attivare alla pubblicazione.
USCITA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sito")

ENTE = {
    "nome": "Fondazione La Rosa d'Oro ETS",
    "breve": "La Rosa d'Oro",
    "forma": "Ente del Terzo Settore",
    "sede": "Via Bianca di Savoia 17, 20122 Milano",
    "cf": "C.F. 14629350969",
    "runts": "RUNTS sez. g, rep. n. 170120",
    "atto": "Atto costitutivo 26 febbraio 2026",
    "email": "biodinamica@larosadoro.org",
    "tagline": "Costituita per destinare patrimoni al lavoro della terra, alla cura delle persone e all'accompagnamento.",
}

SEGNAPOSTO = "[Il testo di questa pagina si scrive al punto 4, con la regola dei tre registri: cosa siamo, cosa la Fondazione è costituita per fare, cosa stiamo facendo.]"

# --------------------------------------------------------------------------
# la mappa del sito — è la stessa del documento «I titoli del sito»
# --------------------------------------------------------------------------
# ogni pagina: cartella (indirizzo senza index.html), voce (breve), titolo (pieno),
# occhiello (la sezione), hero, tipo, e qualche dettaglio facoltativo.

# «intro» è la riga di orientamento che la home mostra nella fascia della sezione:
# per «In memoria» viene dal testo di Dacia (TESTI); per le altre è provvisoria,
# e si sostituisce con l'introduzione vera al punto 4. «casa» è la tavola incisa della fascia.
SEZIONI = [
    dict(chiave="in-memoria", voce="In memoria", titolo="In memoria", hero="lemniscata", casa="lemniscata",
         pagine=[
             dict(slug="fondo-di-memoria", voce="Donazione in memoria di…", titolo="Il fondo di memoria", riga=""),
             dict(slug="giardino-dei-ricordi", voce="Il giardino dei ricordi", titolo="Il giardino dei ricordi", riga=""),
             dict(slug="funerali", voce="Funerali", titolo="Funerali", riga="Non fiori ma opere di bene"),
             dict(slug="svuota-e-sorridi", voce="Gli Svuota e Sorridi", titolo="Gli Svuota e Sorridi", riga=""),
             dict(slug="io-sono-qui-per-te", voce="Io sono qui per te", titolo="Io sono qui per te", riga="Accompagnamento nel fine vita", hero="lemniscata"),
             dict(slug="elaborare-il-lutto", voce="Elaborare il lutto", titolo="Elaborare il lutto", riga="", nascosta=True),
         ]),
    dict(chiave="lasciti", voce="Lasciti", titolo="Lasciti", hero="rosa", tavola="interno", casa="rosa",
         intro="Il lascito testamentario e come si fa; perché farlo alla Rosa d'Oro, con i vantaggi fiscali; il testamento redatto con noi; il Dopo di Noi per chi ha un familiare fragile.",
         pagine=[
             dict(slug="il-lascito-testamentario", voce="Così volli che fosse", titolo="Così volli che fosse", riga="Il lascito testamentario"),
             dict(slug="perche-donare", voce="Perché donare alla Rosa d'Oro", titolo="Perché donare alla Rosa d'Oro", riga="Con i vantaggi fiscali"),
             dict(slug="il-tuo-testamento", voce="Redigi il tuo testamento con noi", titolo="Redigi il tuo testamento con noi", riga="I tipi di testamento, le DAT", tavola="lettera"),
             dict(slug="dopo-di-noi", voce="Il Dopo di Noi", titolo="Il Dopo di Noi", riga="La protezione dei fragili", art="Legge 112/2016"),
         ],
         rimandi=[dict(voce="Progetti", titolo="I progetti che un lascito può sostenere", verso="progetti")]),
    dict(chiave="progetti", voce="Progetti", titolo="Progetti", hero="avorio", tavola="paesaggio", casa="paesaggio",
         intro="I progetti seguono un ciclo di vita — da avviare, da sostenere, in corso, realizzati — accanto alle realtà amiche e alla porta per proporre il tuo.",
         pagine=[
             dict(slug="da-avviare", voce="Da avviare", titolo="Progetti da avviare", riga="In germe: cercano persone e competenze"),
             dict(slug="da-sostenere", voce="Da sostenere", titolo="Progetti da sostenere", riga="In raccolta"),
             dict(slug="in-corso", voce="In corso", titolo="Progetti in corso", riga="Finanziati, in esecuzione"),
             dict(slug="realizzati", voce="Realizzati", titolo="Progetti realizzati", riga="Conclusi"),
             dict(separa=True),
             dict(slug="progetti-amici", voce="Progetti amici", titolo="Progetti amici", riga="Realtà riconosciute, non della Fondazione", radice=True),
             dict(slug="presenta-il-tuo-progetto", voce="Presentaci il tuo progetto", titolo="Presentaci il tuo progetto", riga=""),
         ]),
    dict(chiave="eventi-e-formazione", voce="Eventi e formazione", titolo="Eventi e formazione", hero="avorio", casa="interno",
         intro="Gli incontri e i percorsi di formazione che la Fondazione è costituita per promuovere: in medicina, in agricoltura, nell'accompagnamento.",
         pagine=[
             dict(slug="eventi", voce="Eventi", titolo="Eventi", riga=""),
             dict(slug="formazione-medica", voce="Formazione medica", titolo="Formazione medica", riga=""),
             dict(slug="formazione-agricola", voce="Formazione agricola", titolo="Formazione agricola", riga=""),
             dict(slug="formazione-accompagnamento", voce="Formazione all'accompagnamento", titolo="Formazione all'accompagnamento", riga="", hero="lemniscata"),
         ]),
    dict(chiave="servizi", voce="Servizi", titolo="Servizi alle persone", hero="veli", casa="spighe",
         intro="Le attività di interesse generale previste dallo statuto: sostegno alle persone fragili, agricoltura sociale, ospitalità, consulenza e orientamento.",
         pagine=[
             dict(slug="persone-fragili", voce="Sostegno a persone fragili", titolo="Sostegno a persone fragili", riga="", art="Statuto, art. 3.1.b-c"),
             dict(slug="agricoltura-sociale", voce="Agricoltura sociale e laboratori terapeutici", titolo="Agricoltura sociale e laboratori terapeutici", riga="", art="Statuto, art. 3.1.s e 3.3", tavola="spighe"),
             dict(slug="ospitalita", voce="Ospitalità e residenzialità", titolo="Ospitalità e residenzialità", riga="", art="Statuto, art. 3.1.k, q"),
             dict(slug="consulenza", voce="Consulenza e orientamento", titolo="Consulenza e orientamento", riga="", art="Statuto, art. 3.6.d-e"),
         ],
         rimandi=[dict(voce="Accompagnamento e fine vita", titolo="Io sono qui per te", verso="in-memoria/io-sono-qui-per-te")]),
    dict(chiave="aziende-e-istituzioni", voce="Per aziende e istituzioni", titolo="Per aziende e istituzioni", hero="avorio", casa="portico",
         intro="Le forme di collaborazione che lo statuto prevede per aziende e istituzioni: partecipazione, sostegno ai progetti, iniziative condivise.",
         pagine=[
             dict(slug="aziende", voce="Aziende", titolo="Per le aziende", riga=""),
             dict(slug="istituzioni", voce="Istituzioni", titolo="Per le istituzioni", riga=""),
         ]),
    dict(chiave="professionisti", voce="Per professionisti", titolo="Per professionisti", hero="notte", notte=True, casa="emblema",
         intro="Otto strumenti previsti dallo statuto, per chi assiste una persona o una famiglia nel destinare un patrimonio: notai, commercialisti, avvocati, consulenti.",
         pagine=[
             dict(slug="esecutore-testamentario", voce="Esecutore testamentario e custode", titolo="Mandato di esecutore testamentario e custode", riga="", art="Statuto, art. 14 · artt. 700 ss. c.c."),
             dict(slug="vitalizio-filantropico", voce="Vitalizio filantropico", titolo="Vitalizio filantropico", riga="", art="Statuto, art. 14"),
             dict(slug="dopo-di-noi", voce="Dopo di Noi", titolo="Gestione del «Dopo di Noi»", riga="", art="Statuto, art. 14 · L. 112/2016", gemella="lasciti/dopo-di-noi"),
             dict(slug="family-office", voce="Family Office filantropico", titolo="Family Office filantropico (Advisory)", riga="", art="Statuto, art. 14"),
             dict(slug="fondi-di-scopo", voce="Fondi di scopo", titolo="Fondi di scopo e veicoli filantropici", riga="", art="Statuto, art. 8"),
             dict(slug="fondi-convertibili", voce="Fondi convertibili", titolo="Fondi convertibili", riga="", art="Statuto, art. 9"),
             dict(slug="riqualificazione-etica", voce="Fondi di riqualificazione etica", titolo="Fondi di riqualificazione etica", riga="", art="Statuto, art. 11",
                  avviso="Il testo pubblico di questa pagina va letto dal notaio prima della pubblicazione."),
             dict(slug="fondo-della-memoria", voce="Fondo della memoria", titolo="Fondo della memoria ed eredità solidale", riga="", art="Statuto, art. 12",
                  gemella="in-memoria/fondo-di-memoria"),
         ]),
]

# pagine fuori dal menu principale: barra in basso, menu secondario, footer
SERVIZIO = [
    dict(cartella="chi-siamo", voce="Chi siamo", titolo="Chi siamo", occhiello="La Fondazione", hero="rosa", dove="barra", tipo="chi-siamo"),
    dict(cartella="dona", voce="Dona ora", titolo="Sostieni la Fondazione", occhiello="Donazioni", hero="avorio", dove="barra"),
    dict(cartella="partnership", voce="Partnership e siti amici", titolo="Partnership e siti amici", occhiello="La Fondazione", hero="avorio", dove="secondario"),
    dict(cartella="documenti", voce="Documenti", titolo="Documenti", occhiello="La Fondazione", hero="avorio", dove="secondario"),
    dict(cartella="contatti", voce="Contatti", titolo="Contatti", occhiello="La Fondazione", hero="avorio", dove="secondario"),
    dict(cartella="privacy", voce="Privacy", titolo="Informativa sulla privacy", occhiello="Note legali", hero="avorio", dove="footer"),
    dict(cartella="cookie", voce="Cookie", titolo="Informativa sui cookie", occhiello="Note legali", hero="avorio", dove="footer"),
]
# «Lavora con noi» per ora rimanda ai Progetti da avviare
BARRA = [("Chi siamo", "chi-siamo"), ("Dona ora", "dona"), ("Lavora con noi", "progetti/da-avviare")]

# --------------------------------------------------------------------------
# dalla mappa all'elenco delle pagine
# --------------------------------------------------------------------------
PAGINE = {}   # cartella -> dati

def registra(cartella, **dati):
    dati["cartella"] = cartella
    PAGINE[cartella] = dati
    return dati

registra("", voce="Home", titolo=ENTE["breve"], occhiello="Fondazione · " + ENTE["forma"], hero="casa", tipo="home", notte=False)

for s in SEZIONI:
    registra(s["chiave"], voce=s["voce"], titolo=s["titolo"], occhiello=s["voce"], hero=s["hero"], tipo="sezione",
             sezione=s["chiave"], notte=s.get("notte", False), tavola=s.get("tavola"))
    for p in s["pagine"]:
        if p.get("separa"):
            continue
        cartella = p["slug"] if p.get("radice") else s["chiave"] + "/" + p["slug"]
        registra(cartella, voce=p["voce"], titolo=p["titolo"], occhiello=s["voce"], hero=p.get("hero", s["hero"]),
                 tipo="pagina", sezione=s["chiave"], notte=s.get("notte", False), art=p.get("art"), riga=p.get("riga", ""),
                 tavola=p.get("tavola"), avviso=p.get("avviso"), gemella=p.get("gemella"))

for p in SERVIZIO:
    registra(p["cartella"], voce=p["voce"], titolo=p["titolo"], occhiello=p["occhiello"], hero=p["hero"],
             tipo=p.get("tipo", "pagina"), sezione=None, notte=False)

# --------------------------------------------------------------------------
# collegamenti relativi: ogni pagina sa a che profondità sta
# --------------------------------------------------------------------------
def profondita(cartella):
    return 0 if cartella == "" else cartella.count("/") + 1

def verso(da, a):
    """collegamento dalla pagina «da» alla pagina «a» (entrambe come cartella)"""
    if LINK_PULITI:
        return "/" if a == "" else "/" + a + "/"
    su = "../" * profondita(da)
    return su + ("index.html" if a == "" else a + "/index.html")

def risorsa(da, percorso):
    return "../" * profondita(da) + percorso

def sfuggi(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

# --------------------------------------------------------------------------
# le parti comuni
# --------------------------------------------------------------------------
SPRITE = """<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="rosa" viewBox="0 0 200 200">
    <g fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round">
      <circle cx="100" cy="100" r="12"/>
      <path d="M100 88c9-7 20-3 21 8s-9 19-21 16"/><path d="M100 112c-9 7-20 3-21-8s9-19 21-16"/>
      <path d="M100 70c17-11 36-3 38 16s-15 33-38 30"/><path d="M100 130c-17 11-36 3-38-16s15-33 38-30"/>
      <path d="M100 52c25-15 52-3 55 24s-22 47-55 43"/><path d="M100 148c-25 15-52 3-55-24s22-47 55-43"/>
      <path d="M100 34c33-19 69-3 72 32s-29 62-72 57"/><path d="M100 166c-33 19-69 3-72-32s29-62 72-57"/>
      <circle cx="100" cy="100" r="86" stroke-width=".7" opacity=".55"/>
    </g>
  </symbol>
  <symbol id="rosa-piccola" viewBox="0 0 200 200">
    <g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round">
      <circle cx="100" cy="100" r="12"/>
      <path d="M100 70c17-11 36-3 38 16s-15 33-38 30"/><path d="M100 130c-17 11-36 3-38-16s15-33 38-30"/>
      <path d="M100 34c33-19 69-3 72 32s-29 62-72 57"/><path d="M100 166c-33 19-69 3-72-32s29-62 72-57"/>
    </g>
  </symbol>
</svg>"""

def emblema(classe="emblema", simbolo="rosa"):
    return '<svg class="%s" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><use href="#%s"/></svg>' % (classe, simbolo)

def logo(da):
    return ('<a class="logo" href="%s" aria-label="%s, home">%s'
            '<span class="nome">Fondazione <b>La Rosa d\'<i>Oro</i></b></span></a>'
            % (verso(da, ""), sfuggi(ENTE["nome"]), emblema("", "rosa-piccola")))

def sottomenu(s, da):
    righe = []
    for p in s["pagine"]:
        if p.get("nascosta"):
            continue
        if p.get("separa"):
            righe.append('<li class="separa" role="separator" aria-hidden="true"></li>')
            continue
        cartella = p["slug"] if p.get("radice") else s["chiave"] + "/" + p["slug"]
        attuale = ' class="attuale"' if cartella == da else ""
        riga = ('<span class="riga">%s</span>' % sfuggi(p["riga"])) if p.get("riga") else ""
        righe.append('<li%s><a href="%s">%s%s</a></li>' % (attuale, verso(da, cartella), sfuggi(p["voce"]), riga))
    return '<div class="sottomenu"><ul>%s</ul></div>' % "".join(righe)

def header(da, pagina):
    voci = []
    for s in SEZIONI:
        classi = ["voce"]
        if s.get("notte"):
            classi.append("pro")
        if pagina.get("sezione") == s["chiave"]:
            classi.append("attiva")
        voci.append(
            '<li class="%s" data-voce="%s"><a href="%s"%s>%s</a>'
            '<button class="freccia" type="button" aria-expanded="false" aria-label="Apri il sottomenu di %s">▾</button>%s</li>'
            % (" ".join(classi), s["chiave"], verso(da, s["chiave"]),
               ' aria-current="true"' if pagina.get("sezione") == s["chiave"] else "",
               sfuggi(s["voce"]), sfuggi(s["voce"]), sottomenu(s, da)))
    secondari = "".join('<li><a href="%s">%s</a></li>' % (verso(da, p["cartella"]), sfuggi(p["voce"]))
                        for p in SERVIZIO if p["dove"] == "secondario")
    return """<header class="testa">
  <div class="testa-alta"><div class="pagina"><nav aria-label="Menu secondario"><ul class="menu-sec">%s</ul></nav></div></div>
  <div class="testa-bassa"><div class="pagina">
    %s
    <button class="apri-menu" type="button" aria-expanded="false" aria-controls="menu-principale">Menu</button>
    <nav id="menu-principale" class="menu" aria-label="Menu principale">
      <ul>%s</ul>
      <ul class="menu-sec-mobile">%s</ul>
    </nav>
  </div></div>
</header>""" % (secondari, logo(da), "".join(voci), secondari)

def barra(da):
    voci = []
    for etichetta, cartella in BARRA:
        classe = ' class="dona"' if cartella == "dona" else ""
        voci.append('<a%s href="%s" aria-label="%s">%s</a>' % (classe, verso(da, cartella), sfuggi(etichetta), sfuggi(etichetta)))
    return '<nav class="barra-fissa" aria-label="Azioni principali">%s</nav>' % "".join(voci)

def footer(da):
    sito = "".join('<li><a href="%s">%s</a></li>' % (verso(da, s["chiave"]), sfuggi(s["voce"])) for s in SEZIONI)
    fond = "".join('<li><a href="%s">%s</a></li>' % (verso(da, p["cartella"]), sfuggi(p["voce"]))
                   for p in SERVIZIO if p["dove"] in ("barra", "secondario"))
    legali = " · ".join('<a href="%s">%s</a>' % (verso(da, p["cartella"]), sfuggi(p["titolo"]))
                        for p in SERVIZIO if p["dove"] == "footer")
    return """<footer class="pie">
  <div class="pagina">
    <div class="pie-alto">
      <div>%s<p class="tagline">%s</p></div>
      <div><h4>Il sito</h4><ul>%s</ul></div>
      <div><h4>La Fondazione</h4><ul>%s</ul></div>
      <div><h4>Scrivere</h4><ul><li><a href="mailto:%s">%s</a></li><li>%s</li></ul></div>
    </div>
    <hr class="separatore">
    <div class="pie-dati">
      <p>%s · %s · %s · %s · %s</p>
      <p>%s</p>
    </div>
  </div>
</footer>""" % (logo(da), sfuggi(ENTE["tagline"]), sito, fond, ENTE["email"], ENTE["email"], sfuggi(ENTE["sede"]),
                sfuggi(ENTE["nome"]), sfuggi(ENTE["forma"]), sfuggi(ENTE["cf"]), sfuggi(ENTE["runts"]), sfuggi(ENTE["atto"]), legali)

# --------------------------------------------------------------------------
# le hero
# --------------------------------------------------------------------------
def hero(da, p, sotto, classe_sotto="sotto"):
    tipo = p["hero"]
    occhiello = '<p class="occhiello">%s</p>' % sfuggi(p["occhiello"])
    fonte = ('<p class="fonte">%s</p>' % sfuggi(p["art"])) if p.get("art") else ""
    testo = '%s%s<h1>%s</h1><hr class="filo"><p class="%s">%s</p>' % (occhiello, fonte, sfuggi(p["titolo"]), classe_sotto, sotto)
    if tipo == "avorio":
        return '<section class="hero hero-avorio"><div class="riga"></div><div class="bordo"></div><div class="pagina">%s</div></section>' % testo
    if tipo == "rosa":
        return '<section class="hero hero-rosa">%s<div class="pagina">%s</div></section>' % (emblema(), testo)
    if tipo == "veli":
        return '<section class="hero hero-veli"><div class="caldo"></div><div class="freddo"></div><div class="incontro"></div><div class="grana"></div><div class="pagina">%s</div></section>' % testo
    if tipo == "lemniscata":
        return ('<section class="hero hero-lemniscata"><div class="tavola-sfondo"><img src="%s" alt="" width="1400" height="760"></div>'
                '<div class="velo"></div><div class="pagina">%s</div></section>' % (risorsa(da, "img/tavola-lemniscata-hero.svg"), testo))
    if tipo == "notte":
        return '<section class="hero hero-notte"><div class="fondo"></div><div class="luce"></div>%s<div class="grana"></div><div class="pagina">%s</div></section>' % (emblema(), testo)
    if tipo == "casa":
        return """<section class="hero hero-casa">
  <div class="destra"></div><div class="taglio"></div>
  <div class="pagina">
    <div class="dentro">%s</div>
    <div class="campo-foto">
      <div class="lastra">
        <!-- quando c'è la fotografia: <img src="img/tavolo-spighe-rosa.jpg" alt="…" width="1024" height="1024"> -->
        %s
        <span class="didascalia">La fotografia entra qui</span>
        <span class="squadra a"></span><span class="squadra b"></span>
      </div>
    </div>
  </div>
</section>""" % (testo, emblema())
    raise ValueError("hero sconosciuta: " + tipo)

# --------------------------------------------------------------------------
# i corpi delle pagine
# --------------------------------------------------------------------------
def gettoni(html, da):
    """sostituisce {→cartella}, {img:file} e {foto:NOME|didascalia|classe} nei testi"""
    html = re.sub(r"\{\u2192([a-z0-9\-/]*)\}", lambda m: verso(da, m.group(1)), html)
    html = re.sub(r"\{img:([^}]+)\}", lambda m: risorsa(da, "img/" + m.group(1)), html)
    def foto(m):
        nome, dida, classe = m.group(1), m.group(2), m.group(3)
        classe = (" " + classe) if classe else ""
        # se la fotografia è arrivata (img/foto/<nome>.jpg), entra al suo posto; altrimenti resta il posto segnato
        file = re.sub(r"[^a-z0-9]+", "-", nome.lower()).strip("-") + ".jpg"
        if os.path.exists(os.path.join(USCITA, "img", "foto", file)):
            return ('<figure class="foto%s"><img src="%s" alt="%s" loading="lazy"></figure>'
                    % (classe, risorsa(da, "img/foto/" + file), sfuggi(dida)))
        return ('<figure class="foto%s" data-file="%s"><span class="didascalia">%s · %s</span></figure>'
                % (classe, sfuggi(nome), sfuggi(dida), sfuggi(nome)))
    html = re.sub(r"\{foto:([^|}]+)\|([^|}]*)\|([^}]*)\}", foto, html)
    return html

def tavola_img(da, nome, alt, classe="tavola"):
    return '<figure class="%s"><img src="%s" alt="%s"><figcaption>Tavola incisa</figcaption></figure>' % (classe, risorsa(da, "img/tavola-%s.svg" % nome), sfuggi(alt))

TAVOLE_ALT = {
    "spighe": "Tre spighe di grano incise su avorio",
    "paesaggio": "Paesaggio di colline coltivate, inciso su avorio",
    "interno": "Interno architettonico inciso su avorio, con una finestra ad arco",
    "rosa": "Rosa vista dall'alto, incisa",
    "lemniscata": "Lemniscata disegnata dalla luce, incisa su avorio",
    "portico": "Portico a quattro colonne con la rosa nel timpano, inciso su avorio",
    "lettera": "Una lettera chiusa dal sigillo con la rosa, e una penna stilografica, incise su avorio",
}
TAVOLE_ALTE = ("spighe", "rosa")   # le tavole verticali: nella cornice della home stanno intere

def lato(da, p):
    """il menu laterale con le pagine della stessa sezione"""
    s = next(x for x in SEZIONI if x["chiave"] == p["sezione"])
    righe = ['<li%s><a href="%s">%s</a></li>' % (' class="attuale"' if da == s["chiave"] else "", verso(da, s["chiave"]), sfuggi(s["titolo"]))]
    for q in s["pagine"]:
        if q.get("separa"):
            righe.append('<li class="separa" role="separator" aria-hidden="true"></li>')
            continue
        cartella = q["slug"] if q.get("radice") else s["chiave"] + "/" + q["slug"]
        righe.append('<li%s><a href="%s">%s</a></li>' % (' class="attuale"' if cartella == da else "", verso(da, cartella), sfuggi(q["titolo"])))
    return '<aside class="lato"><p class="occhiello">%s</p><ul>%s</ul></aside>' % (sfuggi(s["voce"]), "".join(righe))

def corpo_pagina(da, p):
    avviso = ('<p class="avviso">%s</p>' % sfuggi(p["avviso"])) if p.get("avviso") else ""
    gemella = ""
    if p.get("gemella"):
        g = PAGINE[p["gemella"]]
        gemella = '<p>È lo stesso strumento visto dal lato del professionista: la pagina per le persone è <a class="link" href="%s">%s</a>.</p>' % (verso(da, g["cartella"]), sfuggi(g["titolo"]))
    tavola = tavola_img(da, p["tavola"], TAVOLE_ALT[p["tavola"]], "tavola stretta") if p.get("tavola") else ""
    if da in TESTI and TESTI[da].get("corpo"):
        contenuto = gettoni(TESTI[da]["corpo"], da)
    else:
        contenuto = '<p class="segnaposto">%s</p>' % sfuggi(SEGNAPOSTO)
    testo = '<article class="testo">%s%s%s%s</article>' % (avviso, contenuto, gemella, tavola)
    if p.get("sezione"):
        return '<main class="corpo"><div class="pagina"><div class="colonne">%s%s</div></div></main>' % (lato(da, p), testo)
    return '<main class="corpo"><div class="pagina">%s</div></main>' % testo

def corpo_sezione(da, p):
    s = next(x for x in SEZIONI if x["chiave"] == p["sezione"])
    schede = []
    for q in s["pagine"]:
        if q.get("separa"):
            continue
        cartella = q["slug"] if q.get("radice") else s["chiave"] + "/" + q["slug"]
        fonte = ('<p class="fonte">%s</p>' % sfuggi(q["art"])) if q.get("art") else ""
        riga = ('<p>%s</p>' % sfuggi(q["riga"])) if q.get("riga") else ""
        schede.append('<article class="scheda">%s<h3><a href="%s">%s</a></h3>%s<a class="vai" href="%s">Apri</a></article>'
                      % (fonte, verso(da, cartella), sfuggi(q["titolo"]), riga, verso(da, cartella)))
    for r in s.get("rimandi", []):
        schede.append('<article class="scheda rimando"><h3><a href="%s">%s</a></h3><p>Nella sezione %s</p><a class="vai" href="%s">Vai alla sezione</a></article>'
                      % (verso(da, r["verso"]), sfuggi(r["titolo"]), sfuggi(PAGINE[r["verso"]]["voce"]), verso(da, r["verso"])))
    tavola = tavola_img(da, p["tavola"], TAVOLE_ALT[p["tavola"]], "tavola-fascia") if p.get("tavola") else ""
    if da in TESTI and TESTI[da].get("corpo"):
        intro = gettoni(TESTI[da]["corpo"], da)
    else:
        intro = '<p class="segnaposto">%s</p>' % sfuggi("[L'introduzione della sezione si scrive al punto 4.]")
    return """<main class="corpo"><div class="pagina">
  <div class="testo">%s</div>
  %s
  <h2 class="schede-titolo">In questa sezione</h2>
  <div class="schede">%s</div>
</div></main>""" % (intro, tavola, "".join(schede))

def corpo_chi_siamo(da, p):
    return """<main class="corpo"><div class="pagina"><div class="colonne">
  <div><figure class="riquadro tavola-dentro"><img src="%s" alt="%s"><span class="squadra a"></span><span class="squadra b"></span></figure></div>
  <article class="testo">
    <p>La Fondazione La Rosa d'Oro è un Ente del Terzo Settore con sede a Milano, costituito il 26 febbraio 2026 e iscritto al Registro Unico Nazionale del Terzo Settore.</p>
    <p class="segnaposto">%s</p>
    <dl class="fatti">
      <div><dt>Denominazione</dt><dd>%s</dd></div>
      <div><dt>Sede</dt><dd>%s</dd></div>
      <div><dt>Codice fiscale</dt><dd>%s</dd></div>
      <div><dt>Iscrizione</dt><dd>%s</dd></div>
      <div><dt>Costituzione</dt><dd>%s, rep. 8190 / racc. 4764, Notaio F. Franco</dd></div>
      <div><dt>Presidente</dt><dd>Dacia Dalla Libera</dd></div>
      <div><dt>Vicepresidente</dt><dd>Elias Minotti</dd></div>
      <div><dt>Realtà collegata</dt><dd>Associazione Orizzonti Celesti (Svizzera), ente distinto che opera sul versante elvetico</dd></div>
      <div><dt>Statuto</dt><dd><a class="link" href="%s">Nella pagina Documenti</a></dd></div>
    </dl>
  </article>
</div></div></main>""" % (risorsa(da, "img/tavola-spighe.svg"), TAVOLE_ALT["spighe"], sfuggi("[Il resto del testo si scrive al punto 4.]"),
                          sfuggi(ENTE["nome"]), sfuggi(ENTE["sede"]), ENTE["cf"].replace("C.F. ", ""), sfuggi(ENTE["runts"]), sfuggi(ENTE["atto"]).replace("Atto costitutivo ", ""),
                          verso(da, "documenti"))

def tavola_porta(da, s):
    """l'immagine della fascia: una tavola incisa, o l'emblema in oro sulla fascia nera"""
    if s["casa"] == "emblema":
        return '<figure class="tavola-porta">%s</figure>' % emblema()
    classe = "tavola-porta intera" if s["casa"] in TAVOLE_ALTE else "tavola-porta"
    return '<figure class="%s"><img src="%s" alt="%s" loading="lazy"></figure>' % (classe, risorsa(da, "img/tavola-%s.svg" % s["casa"]), TAVOLE_ALT[s["casa"]])

def corpo_home(da, p):
    porte = []
    for s in SEZIONI:
        voci = []
        for q in s["pagine"]:
            if q.get("nascosta"):
                continue
            if q.get("separa"):
                voci.append('<li class="separa" aria-hidden="true"></li>')
                continue
            cartella = q["slug"] if q.get("radice") else s["chiave"] + "/" + q["slug"]
            riga = ('<span class="riga">%s</span>' % sfuggi(q["riga"])) if q.get("riga") else ""
            voci.append('<li><a href="%s">%s%s</a></li>' % (verso(da, cartella), sfuggi(q["voce"]), riga))
        intro = TESTI.get(s["chiave"], {}).get("sotto") or s.get("intro") or ""
        porte.append("""<section class="porta%s" data-spia="%s" id="porta-%s">
      <div class="dentro">%s<h3><a href="%s">%s</a></h3><p class="intro">%s</p><a class="vai" href="%s">Entra</a></div>
      %s
      <div class="pagine-porta"><p class="etichetta">In questa sezione</p><ul class="sotto-voci">%s</ul></div>
    </section>""" % (" nera" if s.get("notte") else "", s["chiave"], s["chiave"],
                     '<p class="occhiello">Otto strumenti statutari</p>' if s.get("notte") else "",
                     verso(da, s["chiave"]), sfuggi(s["titolo"]), sfuggi(intro), verso(da, s["chiave"]),
                     tavola_porta(da, s), "".join(voci)))
    return """<main>
  <section class="sezione" id="chi-siamo">
    <div class="pagina"><div class="due-colonne">
      <div class="testo">
        <p class="occhiello">Chi siamo</p>
        <h2>Una fondazione costituita nel 2026</h2>
        <p>La Fondazione La Rosa d'Oro è un Ente del Terzo Settore con sede a Milano, costituito il 26 febbraio 2026 e iscritto al Registro Unico Nazionale del Terzo Settore. Presidente Dacia Dalla Libera, vicepresidente Elias Minotti.</p>
        <p class="segnaposto">%s</p>
        <p><a class="vai" href="%s">Chi siamo</a></p>
      </div>
      <figure class="riquadro tavola-dentro"><img src="%s" alt="%s"><span class="squadra a"></span><span class="squadra b"></span></figure>
    </div></div>
  </section>
  <section class="sezione" id="cosa-offriamo">
    <div class="pagina"><div class="centrata">
      <p class="occhiello">Cosa offriamo</p>
      <h2>Servizi alle persone, strumenti per chi le assiste</h2>
      <p class="segnaposto">%s</p>
      <hr class="filo">
      <div class="rimandi"><a class="vai" href="%s">Servizi alle persone</a><a class="vai" href="%s">Per professionisti</a></div>
    </div></div>
  </section>
  <section class="sezione" id="le-porte">
    <div class="pagina">
      <p class="occhiello">Le porte del sito</p>
      <h2>Sette sezioni</h2>
      <div class="porte">%s</div>
    </div>
  </section>
</main>""" % (sfuggi("[Due o tre frasi si scrivono al punto 4.]"), verso(da, "chi-siamo"), risorsa(da, "img/tavola-spighe.svg"), TAVOLE_ALT["spighe"],
              sfuggi("[L'introduzione si scrive al punto 4: che cosa la Fondazione è costituita per fare.]"),
              verso(da, "servizi"), verso(da, "professionisti"), "".join(porte))

# --------------------------------------------------------------------------
# la pagina intera
# --------------------------------------------------------------------------
def pagina_html(da, p):
    scheda = ENTE["nome"] if da == "" else "%s — %s" % (p["titolo"], ENTE["nome"])
    descrizione = "%s — %s, %s, Milano." % (p["titolo"], ENTE["nome"], ENTE["forma"]) if da != "" else "%s, %s con sede a Milano, costituita nel 2026." % (ENTE["nome"], ENTE["forma"])
    url = DOMINIO + ("/" if da == "" else "/" + da + "/")
    if p["tipo"] == "home":
        sotto = sfuggi(ENTE["tagline"])
        corpo = corpo_home(da, p)
    elif p["tipo"] == "sezione":
        sotto = sfuggi("[Sottotitolo: si scrive al punto 4.]")
        corpo = corpo_sezione(da, p)
    elif p["tipo"] == "chi-siamo":
        sotto = "Ente del Terzo Settore con sede a Milano, costituito il 26 febbraio 2026."
        corpo = corpo_chi_siamo(da, p)
    else:
        sotto = sfuggi("[Sottotitolo: si scrive al punto 4.]")
        corpo = corpo_pagina(da, p)
    if da in TESTI and TESTI[da].get("sotto"):
        sotto = sfuggi(TESTI[da]["sotto"])
    if da in TESTI and TESTI[da].get("musica"):
        sotto += ('</p><button type="button" class="ascolta" data-audio="%s" hidden>Ascolta · Chopin, valzer op. 69'
                  '</button><p hidden>' % risorsa(da, "audio/valzer-op-69.mp3"))
    # il motto: la frase d'apertura tutta in un rigo, più grande ed evidente (Dacia, 6.9)
    classe_sotto = "sotto" + (" motto" if TESTI.get(da, {}).get("motto") else "") + (" unica" if TESTI.get(da, {}).get("unica") else "")
    classe_body = ' class="notte"' if p.get("notte") else ""
    return """<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title>
<meta name="description" content="%s">
<meta property="og:title" content="%s">
<meta property="og:type" content="website">
<meta property="og:url" content="%s">
<meta property="og:site_name" content="%s">
<meta property="og:locale" content="it_IT">
%s<!-- og:image: si aggiunge con il marchio, al punto 6 -->
<link rel="icon" href="%s" type="image/svg+xml">
<link rel="stylesheet" href="%s">
</head>
<body%s>
%s
%s
%s
%s
%s
%s
<script src="%s"></script>
</body>
</html>
""" % (sfuggi(scheda), sfuggi(descrizione), sfuggi(scheda), url, sfuggi(ENTE["nome"]),
       ('<meta name="robots" content="noindex, nofollow">\n' if ANTEPRIMA else ''),
       risorsa(da, "img/favicon.svg"), risorsa(da, "css/stile.css"), classe_body,
       SPRITE, header(da, p), hero(da, p, sotto, classe_sotto), corpo, footer(da), barra(da), risorsa(da, "js/sito.js"))

FAVICON = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#FBFBF9"/><g fill="none" stroke="#8D6E2A" stroke-width="7" stroke-linecap="round"><circle cx="100" cy="100" r="12"/><path d="M100 70c17-11 36-3 38 16s-15 33-38 30"/><path d="M100 130c-17 11-36 3-38-16s15-33 38-30"/><path d="M100 34c33-19 69-3 72 32s-29 62-72 57"/><path d="M100 166c-33 19-69 3-72-32s29-62 72-57"/></g></svg>"""

def costruisci():
    # via le pagine vecchie, restano css/js/font/img
    for nome in os.listdir(USCITA):
        percorso = os.path.join(USCITA, nome)
        if os.path.isdir(percorso) and nome not in ("css", "js", "font", "img"):
            shutil.rmtree(percorso)
        elif nome.endswith(".html"):
            os.remove(percorso)
    with open(os.path.join(USCITA, "img", "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(FAVICON)
    with open(os.path.join(USCITA, "robots.txt"), "w", encoding="utf-8") as f:
        f.write("User-agent: *\nDisallow: /\n" if ANTEPRIMA else "User-agent: *\nAllow: /\n")
    open(os.path.join(USCITA, ".nojekyll"), "w").close()
    conteggio = 0
    for cartella, p in PAGINE.items():
        dove = os.path.join(USCITA, cartella) if cartella else USCITA
        os.makedirs(dove, exist_ok=True)
        with open(os.path.join(dove, "index.html"), "w", encoding="utf-8") as f:
            f.write(pagina_html(cartella, p))
        conteggio += 1
    print("Scritte %d pagine in %s (%s)" % (conteggio, USCITA, datetime.date.today().isoformat()))

if __name__ == "__main__":
    costruisci()
