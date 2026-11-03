# -*- coding: utf-8 -*-
"""
Le dediche del giardino dei ricordi, per la pubblicazione del sito
------------------------------------------------------------------
Chiede allo script del foglio «Contatti della Fondazione» (FOGLIO in costruisci.py) le dediche
che la Fondazione ha posato nel giardino, cioè quelle con la casella «Nel giardino» spuntata,
e le scrive in sito/in-memoria/giardino-dei-ricordi/dediche.json, che la pagina legge (sito.js).

Lo usa il workflow di pubblicazione (.github/workflows/pages.yml), a ogni push e ogni ora.
Le dediche non entrano mai nel repository: stanno nel foglio e nel sito pubblicato, e una
dedica tolta dal giardino sparisce dal sito alla pubblicazione successiva.

    python3 sorgenti/giardino.py [indirizzo del sito pubblicato] [commit] [evento]

Se lo script del foglio non risponde, tiene le dediche già pubblicate. Scrive in $GITHUB_OUTPUT
«pubblica=true» quando c'è qualcosa da pubblicare: sempre, tranne che nel giro di ogni ora
(evento «schedule») se le dediche e il commit sono gli stessi del sito già pubblicato.
"""
import json, os, re, sys, urllib.request, urllib.error

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOVE = "in-memoria/giardino-dei-ricordi/dediche.json"
MASSIMO = {"nome": 120, "dedica": 600, "immagine": 80}


def leggi(url):
    """il JSON a quell'indirizzo; None se l'indirizzo non c'è (404); un errore se non risponde"""
    richiesta = urllib.request.Request(url, headers={"User-Agent": "rosadoro-pubblicazione", "Cache-Control": "no-cache"})
    try:
        with urllib.request.urlopen(richiesta, timeout=60) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def tipografia(t):
    """l'apostrofo ’ e le virgolette «» del sito anche nelle parole di chi scrive"""
    t = re.sub(r"(?<=\w)'(?=\w)", "’", t)
    if not re.search(r"(?<!\w)'", t):             # se non c’è una parola tra apici, anche in fondo: «un po’»
        t = re.sub(r"(?<=\w)'", "’", t)
    if t.count('"') % 2 == 0:
        aperte = [False]
        def virgoletta(m):
            aperte[0] = not aperte[0]
            return "«" if aperte[0] else "»"
        t = re.sub(r'"', virgoletta, t)
    return t


# le coppie di virgolette che possono stare intorno a tutta la dedica e, per ciascuna, quelle che dentro
# dicono che c’è un’altra citazione: un apostrofo dopo una lettera (l’amore, un po’) non conta
VIRGOLETTE = (('"', '"', r'"'), ("«", "»", r"[«»]"), ("“", "”", r"[“”]"),
              ("'", "'", r"‘|(?<!\w)['’]"), ("‘", "’", r"‘|(?<!\w)['’]"))
DOPPIE = '"«»“”'


def senza_virgolette_intorno(t):
    """toglie le virgolette messe intorno a tutta la dedica, perché la pagina mette le sue «», e una virgoletta
    sola rimasta all’inizio o in fondo; lascia quelle di una citazione dentro la dedica, anche se è in fondo"""
    for aperta, chiusa, altre in VIRGOLETTE:
        if len(t) >= 2 and t[0] == aperta and t[-1] == chiusa and not re.search(altre, t[1:-1]):
            return t[1:-1].strip()
    if t and sum(t.count(c) for c in DOPPIE) == 1 and (t[0] in DOPPIE or t[-1] in DOPPIE):
        return t.strip(DOPPIE).strip()
    return t


def pulite(dediche):
    uscita = []
    for d in dediche if isinstance(dediche, list) else []:
        if not isinstance(d, dict):
            continue
        nome = str(d.get("nome") or "").strip()[:MASSIMO["nome"]]
        if not nome:
            continue
        dedica = senza_virgolette_intorno(str(d.get("dedica") or "").strip()[:MASSIMO["dedica"]].strip())
        immagine = str(d.get("immagine") or "").strip()[:MASSIMO["immagine"]]
        uscita.append({"nome": tipografia(nome), "dedica": tipografia(dedica), "immagine": immagine})
    return uscita


def distanziate(dediche):
    """le dediche nell’ordine del foglio, le più recenti prima, ma due sulla stessa immagine mai una dopo l’altra
    (Dacia, 3.11): a ogni posto va la prima dedica rimasta con un’immagine diversa da quella di prima, purché le
    altre si possano ancora distanziare. Se un’immagine ha più dediche di quante le altre possano separarne, si
    alterna lei con le altre finché si può: le dediche vicine sulla stessa immagine restano il meno possibile.
    Le dediche senza immagine contano ognuna per sé"""
    resto = [(d["immagine"] or ("", i), d) for i, d in enumerate(dediche)]
    uscita, prima = [], None

    def si_puo(conti, quante, prima):
        # quante dediche restano, e la prima di loro non può avere l’immagine «prima»
        return all(n <= (quante // 2 if k == prima else (quante + 1) // 2) for k, n in conti.items())

    while resto:
        conti = {}
        for k, _ in resto:
            conti[k] = conti.get(k, 0) + 1
        scelta = None
        for i, (k, _) in enumerate(resto):
            if k == prima:
                continue
            conti[k] -= 1
            if si_puo(conti, len(resto) - 1, k):
                scelta = i
            conti[k] += 1
            if scelta is not None:
                break
        if scelta is None:
            # non si può distanziarle tutte: prima l’immagine con più dediche, se non è quella di prima
            piu = max(conti, key=lambda k: conti[k])
            diverse = [i for i, (k, _) in enumerate(resto) if k != prima]
            scelta = next((i for i in diverse if resto[i][0] == piu), diverse[0] if diverse else 0)
        prima, d = resto.pop(scelta)
        uscita.append(d)
    return uscita


def main():
    sito = (sys.argv[1] if len(sys.argv) > 1 else "").rstrip("/")
    commit = sys.argv[2] if len(sys.argv) > 2 else ""
    evento = sys.argv[3] if len(sys.argv) > 3 else ""
    sorgente = open(os.path.join(RADICE, "costruisci.py"), encoding="utf-8").read()
    foglio = re.search(r'^FOGLIO = "([^"]*)"', sorgente, re.M).group(1)

    # le dediche già pubblicate: il confronto, e la riserva se il foglio non risponde
    pubblicate, sito_muto = None, not sito
    if sito:
        try:
            pubblicate = leggi(sito + "/" + DOVE)     # None se non ci sono ancora
        except Exception as e:
            print("Il sito pubblicato non risponde (%s)" % e)
            sito_muto = True

    dediche = []
    if foglio:
        try:
            risposta = leggi(foglio + "?giardino=1")
            if not (isinstance(risposta, dict) and risposta.get("success") is True and "dediche" in risposta):
                raise ValueError("risposta inattesa")
            dediche = distanziate(pulite(risposta["dediche"]))
        except Exception as e:
            # lo script del foglio non risponde, o non è ancora la versione con il giardino: restano le dediche di prima
            print("Il foglio non dà le dediche (%s): restano quelle già pubblicate" % e)
            if sito_muto:
                # nessuno dei due risponde: meglio non pubblicare che svuotare il giardino
                raise SystemExit("Né il foglio né il sito rispondono: non si pubblica, riprova più tardi.")
            dediche = distanziate(pulite((pubblicate or {}).get("dediche", [])))

    uscita = {"versione": commit, "dediche": dediche}
    percorso = os.path.join(RADICE, "sito", DOVE)
    os.makedirs(os.path.dirname(percorso), exist_ok=True)
    with open(percorso, "w", encoding="utf-8") as f:
        json.dump(uscita, f, ensure_ascii=False, separators=(",", ":"))

    uguale = (pubblicate is not None and pubblicate.get("dediche") == dediche
              and pubblicate.get("versione") == commit)
    pubblica = evento != "schedule" or not uguale
    print("%d dediche nel giardino; %s" % (len(dediche), "si pubblica" if pubblica else "niente di nuovo da pubblicare"))
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write("pubblica=%s\n" % ("true" if pubblica else "false"))


if __name__ == "__main__":
    main()
