# -*- coding: utf-8 -*-
"""
I controlli del sito
--------------------
Prima di pubblicare (lo fa il workflow .github/workflows/pages.yml a ogni pubblicazione;
se un controllo fallisce non si pubblica niente e online resta la versione di prima):

    python3 sorgenti/controlla.py

  - la costruzione: i testi e l'assemblatore ridanno esattamente le pagine di sito/
    (nessuno ha dimenticato «python3 costruisci.py», nessuna pagina è stata cambiata a mano);
  - il JavaScript: nessun errore di sintassi (a settembre uno ha spento menu e dedica per giorni);
  - i collegamenti interni: ogni pagina, immagine, file e ancora richiamati esiste;
  - gli indirizzi del sito che usano altri siti (per esempio Lux) ci sono ancora;
  - lo script del foglio fa quello che deve, provato con un foglio finto (sorgenti/controlla-foglio.js).

Sul sito pubblicato (lo fa il workflow .github/workflows/controlli.yml ogni mattina e dopo ogni pubblicazione):

    python3 sorgenti/controlla.py --in-rete [--collegamenti]

  - il sito di prova e larosadoro.org rispondono, e i loro certificati non stanno per scadere;
  - lo script del foglio «Contatti della Fondazione» risponde (moduli e giardino);
  - con --collegamenti (il lunedì e dopo ogni pubblicazione) anche i collegamenti verso altri siti.

Usa solo Python, più node per il JavaScript.
"""
import html.parser, json, os, re, shutil, socket, ssl, subprocess, sys, tempfile, time
import urllib.error, urllib.parse, urllib.request

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITO = os.path.join(RADICE, "sito")
SITO_DI_PROVA = "https://eliasminotti.github.io/rosadoro/"
DEDICHE = os.path.join("in-memoria", "giardino-dei-ricordi", "dediche.json")   # la scrive la pubblicazione, non la costruzione
CERTIFICATO_MINIMO = 10          # giorni: GitHub rinnova i certificati molto prima; sotto i 10 il rinnovo si è inceppato
NAVIGATORE = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 rosadoro-controlli"

problemi, avvisi = [], []


def impostazione(nome):
    """il valore di una impostazione di costruisci.py (DOMINIO, FOGLIO), senza eseguirlo"""
    sorgente = open(os.path.join(RADICE, "costruisci.py"), encoding="utf-8").read()
    return re.search(r'^%s = "([^"]*)"' % nome, sorgente, re.M).group(1)


# --------------------------------------------------------------------------
# prima di pubblicare
# --------------------------------------------------------------------------
def controlla_costruzione():
    with tempfile.TemporaryDirectory() as tmp:
        for nome in ("costruisci.py", "testi_pagine.py"):
            shutil.copy(os.path.join(RADICE, nome), tmp)
        shutil.copytree(SITO, os.path.join(tmp, "sito"), ignore=lambda d, fs: [f for f in fs if f == "dediche.json"])
        esito = subprocess.run([sys.executable, "costruisci.py"], cwd=tmp, capture_output=True, text=True)
        if esito.returncode != 0:
            problemi.append("La costruzione si ferma con un errore:\n" + (esito.stderr or esito.stdout).strip()[-1500:])
            return
        nuove = elenco(os.path.join(tmp, "sito"))
        vecchie = elenco(SITO) - {DEDICHE}
        diverse = sorted(nuove ^ vecchie)
        for rel in sorted(nuove & vecchie):
            if leggi_per_confronto(os.path.join(tmp, "sito", rel)) != leggi_per_confronto(os.path.join(SITO, rel)):
                diverse.append(rel)
        if diverse:
            problemi.append("Le pagine di sito/ non corrispondono ai testi: manca «python3 costruisci.py» prima del commit, "
                            "oppure una pagina è stata cambiata a mano. Pagine diverse (%d): %s"
                            % (len(diverse), ", ".join(sorted(diverse)[:20]) + (" …" if len(diverse) > 20 else "")))
        else:
            print("Costruzione: le %d pagine corrispondono ai testi" % len([f for f in nuove if f.endswith(".html")]))


def elenco(cartella):
    return {os.path.relpath(os.path.join(d, f), cartella) for d, _, fs in os.walk(cartella) for f in fs}


def leggi_per_confronto(percorso):
    dati = open(percorso, "rb").read()
    if percorso.endswith("sitemap.xml"):      # la data di costruzione cambia ogni giorno: non conta
        dati = re.sub(rb"<lastmod>[^<]*</lastmod>", b"", dati)
    return dati


def controlla_javascript():
    if not shutil.which("node"):
        problemi.append("Manca node: il JavaScript non si può controllare")
        return
    cartella = os.path.join(SITO, "js")
    for nome in sorted(os.listdir(cartella)):
        if nome.endswith(".js"):
            esito = subprocess.run(["node", "--check", os.path.join(cartella, nome)], capture_output=True, text=True)
            if esito.returncode != 0:
                problemi.append("Errore di sintassi nel JavaScript (js/%s):\n%s" % (nome, esito.stderr.strip()[-1500:]))
            else:
                print("JavaScript: js/%s senza errori di sintassi" % nome)


class Pagina(html.parser.HTMLParser):
    """raccoglie da una pagina gli id (le ancore) e gli indirizzi richiamati"""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ancore, self.ids, self.indirizzi = set(), set(), []

    def handle_starttag(self, tag, attributi):
        for nome, valore in attributi:
            if valore is None:
                continue
            if nome in ("id", "name"):
                self.ancore.add(valore)
                if nome == "id":
                    self.ids.add(valore)
            elif nome in ("href", "src", "poster", "data-audio") or (nome == "action" and tag == "form") \
                    or (nome == "content" and tag == "meta" and valore.startswith("http")):
                self.indirizzi.append(valore.strip())
            elif nome == "srcset":
                self.indirizzi += [parte.strip().split()[0] for parte in valore.split(",") if parte.strip()]


# gli indirizzi di questo sito che altri siti usano: una pagina che cambia non li deve rompere
DA_FUORI = (
    ("index.html", "notizie", "la pagina «Perché donare» di Lux, per il riquadro «Le notizie della Fondazione»"),
)

ESTERNO = re.compile(r"^(https?:|mailto:|tel:|javascript:|data:|//)", re.I)


def leggi_pagine():
    pagine = {}
    for d, _, fs in os.walk(SITO):
        for f in fs:
            if f.endswith(".html"):
                p = Pagina()
                p.feed(open(os.path.join(d, f), encoding="utf-8").read())
                pagine[os.path.relpath(os.path.join(d, f), SITO)] = p
    return pagine


def destinazione(da_cartella, percorso):
    """il file del sito a cui porta un indirizzo interno"""
    base = SITO if percorso.startswith("/") else da_cartella
    dove = os.path.normpath(os.path.join(base, urllib.parse.unquote(percorso.lstrip("/"))))
    if percorso.endswith("/") or os.path.isdir(dove):
        dove = os.path.join(dove, "index.html")
    return dove


def controlla_collegamenti_interni(pagine):
    dominio = impostazione("DOMINIO").rstrip("/")
    rotti, contati = [], 0
    for rel, p in sorted(pagine.items()):
        # la pagina «non trovata» si apre da qualsiasi indirizzo: i suoi collegamenti partono dalla radice del sito
        cartella = SITO if rel == "404.html" else os.path.dirname(os.path.join(SITO, rel))
        for indirizzo in p.indirizzi:
            # gli indirizzi completi sul dominio (canonical, immagine di condivisione) devono avere la loro pagina qui
            interno = indirizzo[len(dominio):] or "/" if indirizzo.startswith(dominio) else indirizzo
            if not interno or ESTERNO.match(interno):
                continue
            contati += 1
            percorso, _, ancora = interno.split("?")[0].partition("#")
            dove = destinazione(cartella, percorso) if percorso else os.path.join(SITO, rel)
            if not dove.startswith(SITO) or not os.path.isfile(dove):
                rotti.append("%s → %s (il file non c’è)" % (rel, indirizzo))
            elif ancora and dove.endswith(".html"):
                bersaglio = pagine.get(os.path.relpath(dove, SITO))
                if bersaglio is not None and ancora not in bersaglio.ancore:
                    rotti.append("%s → %s (l’ancora #%s non c’è)" % (rel, indirizzo, ancora))
    # i caratteri e le immagini richiamati dal foglio di stile
    css = os.path.join(SITO, "css")
    for nome in os.listdir(css):
        if nome.endswith(".css"):
            for _, indirizzo in re.findall(r"url\(\s*(['\"]?)(.*?)\1\s*\)", open(os.path.join(css, nome), encoding="utf-8").read()):
                if ESTERNO.match(indirizzo) or indirizzo.startswith("#"):
                    continue
                contati += 1
                if not os.path.isfile(destinazione(css, indirizzo.split("?")[0].split("#")[0])):
                    rotti.append("css/%s → %s (il file non c’è)" % (nome, indirizzo))
    for r in rotti:
        problemi.append("Collegamento interno rotto: " + r)
    print("Collegamenti interni: %d controllati, %d rotti" % (contati, len(rotti)))


def controlla_indirizzi_da_fuori(pagine):
    for rel, ancora, chi in DA_FUORI:
        p = pagine.get(rel)
        if p is None or ancora not in p.ids:      # da un altro sito il browser cerca l’id, non il name di un campo
            problemi.append("Manca l’indirizzo %s#%s, che usa %s" % (rel, ancora, chi))
    print("Indirizzi usati da altri siti: %d controllati" % len(DA_FUORI))


def controlla_script_del_foglio():
    if not shutil.which("node"):
        problemi.append("Manca node: lo script del foglio non si può controllare")
        return
    esito = subprocess.run(["node", os.path.join(RADICE, "sorgenti", "controlla-foglio.js")], capture_output=True, text=True)
    uscita = (esito.stdout + esito.stderr).strip()
    if esito.returncode != 0:
        problemi.append("Lo script del foglio non fa quello che deve (node sorgenti/controlla-foglio.js):\n" + uscita[-2500:])
    else:
        print(uscita.splitlines()[-1])


# --------------------------------------------------------------------------
# sul sito pubblicato
# --------------------------------------------------------------------------
def apri(indirizzo, tentativi=2):
    """(codice, testo) dell'indirizzo; codice 0 se non risponde. Due tentativi, a mezzo minuto di distanza."""
    for tentativo in range(tentativi):
        try:
            richiesta = urllib.request.Request(indirizzo, headers={"User-Agent": NAVIGATORE, "Cache-Control": "no-cache"})
            with urllib.request.urlopen(richiesta, timeout=30) as r:
                return r.status, r.read(400000).decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            codice, testo = e.code, ""
        except Exception as e:
            codice, testo = 0, str(e)
        if tentativo + 1 < tentativi:
            time.sleep(30)
    return codice, testo


def controlla_sito_pubblicato():
    dominio = impostazione("DOMINIO").rstrip("/") + "/"
    for indirizzo, atteso in ((SITO_DI_PROVA, "La Rosa d"), (dominio, "")):
        codice, testo = apri(indirizzo)
        if codice != 200:
            problemi.append("%s non risponde (%s)" % (indirizzo, codice or testo))
        elif atteso and atteso not in testo:
            problemi.append("%s risponde, ma senza la pagina della Fondazione" % indirizzo)
        else:
            print("Risponde: %s" % indirizzo)
    for indirizzo in (SITO_DI_PROVA + "css/stile.css", SITO_DI_PROVA + "js/sito.js"):
        codice, testo = apri(indirizzo)
        if codice != 200:
            problemi.append("%s non risponde (%s)" % (indirizzo, codice or testo))
    for host in sorted({urllib.parse.urlsplit(u).hostname for u in (SITO_DI_PROVA, dominio)}):
        try:
            contesto = ssl.create_default_context()
            with socket.create_connection((host, 443), timeout=30) as s, contesto.wrap_socket(s, server_hostname=host) as t:
                scadenza = ssl.cert_time_to_seconds(t.getpeercert()["notAfter"])
            giorni = int((scadenza - time.time()) // 86400)
            if giorni < CERTIFICATO_MINIMO:
                problemi.append("Il certificato di %s scade fra %d giorni" % (host, giorni))
            else:
                print("Certificato di %s: valido ancora %d giorni" % (host, giorni))
        except Exception as e:
            problemi.append("Il certificato di %s non si controlla (%s)" % (host, e))


def controlla_foglio():
    foglio = impostazione("FOGLIO")
    if not foglio:
        return
    codice, testo = apri(foglio + "?giardino=1")
    try:
        risposta = json.loads(testo)
    except ValueError:
        risposta = None
    if codice != 200 or not (isinstance(risposta, dict) and risposta.get("success") is True):
        problemi.append("Lo script del foglio «Contatti della Fondazione» non risponde come dovrebbe (%s): "
                        "moduli, notizie e giardino potrebbero non funzionare" % (codice or testo))
    else:
        print("Lo script del foglio risponde")


def controlla_collegamenti_esterni(pagine):
    dominio, foglio = impostazione("DOMINIO").rstrip("/"), impostazione("FOGLIO")
    indirizzi = sorted({i for p in pagine.values() for i in p.indirizzi
                        if re.match(r"https?://", i) and not i.startswith(dominio) and i != foglio})
    for indirizzo in indirizzi:
        codice, testo = apri(indirizzo)
        if codice in (404, 410) or codice == 0:
            problemi.append("Collegamento verso un altro sito che non si apre: %s (%s)" % (indirizzo, codice or testo))
        elif codice >= 400:
            # molti siti rispondono male ai programmi ma bene alle persone: da guardare, non è un guasto
            avvisi.append("%s risponde %d ai programmi: da aprire a mano" % (indirizzo, codice))
    print("Collegamenti verso altri siti: %d controllati" % len(indirizzi))


def main():
    if "--in-rete" in sys.argv:
        controlla_sito_pubblicato()
        controlla_foglio()
        if "--collegamenti" in sys.argv:
            controlla_collegamenti_esterni(leggi_pagine())
    else:
        controlla_costruzione()
        controlla_javascript()
        pagine = leggi_pagine()
        controlla_collegamenti_interni(pagine)
        controlla_indirizzi_da_fuori(pagine)
        controlla_script_del_foglio()
    for a in avvisi:
        print("Da guardare: " + a)
    if problemi:
        print("\n%d problemi:" % len(problemi))
        for p in problemi[:40]:
            print("- " + p)
        if len(problemi) > 40:
            print("- e altri %d" % (len(problemi) - 40))
        sys.exit(1)
    print("Tutto a posto")


if __name__ == "__main__":
    main()
