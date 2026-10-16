# -*- coding: utf-8 -*-
"""
I controlli delle dediche del giardino dei ricordi (sorgenti/giardino.py)
-------------------------------------------------------------------------
giardino.py chiede allo script del foglio le dediche spuntate e le scrive in dediche.json, accanto alla
pagina del giardino. Qui gira con un foglio e un sito finti, in una cartella temporanea: non chiede niente
in rete e non tocca sito/. Lo fa girare sorgenti/controlla.py, con gli altri controlli; da solo:

    python3 sorgenti/controlla-giardino.py

Ogni controllo dice che cosa deve succedere. Si scrive prima di cambiare giardino.py, si vede fallire,
e solo dopo si cambia giardino.py (CLAUDE.md, Elias 15.10).
"""
import contextlib, importlib.util, io, json, os, sys, tempfile

QUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("giardino", os.path.join(QUI, "giardino.py"))
giardino = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(giardino)

FOGLIO = "https://script.prova/exec"
SITO = "https://sito.prova/rosadoro"
DAL_FOGLIO = FOGLIO + "?giardino=1"
GIA_ONLINE = SITO + "/" + giardino.DOVE


def giro(risposte, commit="c1", evento="push"):
    """fa girare giardino.main() in una cartella finta. risposte: indirizzo → dati (None vale 404);
    un indirizzo che manca non risponde. Dà dediche.json com’è scritto (None se non c’è), «pubblica»
    com’è scritto per GitHub, quello che stampa e, se si ferma, il motivo"""
    with tempfile.TemporaryDirectory() as radice:
        with open(os.path.join(radice, "costruisci.py"), "w", encoding="utf-8") as f:
            f.write('FOGLIO = "%s"\n' % FOGLIO)
        uscita_github = os.path.join(radice, "uscita-github")

        def leggi(indirizzo):
            if indirizzo not in risposte:
                raise OSError("non risponde")
            return json.loads(json.dumps(risposte[indirizzo]))

        prima = giardino.RADICE, giardino.leggi, sys.argv, os.environ.get("GITHUB_OUTPUT")
        giardino.RADICE, giardino.leggi = radice, leggi
        sys.argv = ["giardino.py", SITO, commit, evento]
        os.environ["GITHUB_OUTPUT"] = uscita_github
        stampato, fermo = io.StringIO(), None
        try:
            with contextlib.redirect_stdout(stampato):
                giardino.main()
        except SystemExit as e:
            fermo = str(e)
        finally:
            giardino.RADICE, giardino.leggi, sys.argv = prima[:3]
            if prima[3] is None:
                os.environ.pop("GITHUB_OUTPUT", None)
            else:
                os.environ["GITHUB_OUTPUT"] = prima[3]
        percorso = os.path.join(radice, "sito", giardino.DOVE)
        scritto = json.load(open(percorso, encoding="utf-8")) if os.path.exists(percorso) else None
        pubblica = None
        if os.path.exists(uscita_github):
            for riga in open(uscita_github, encoding="utf-8"):
                if riga.startswith("pubblica="):
                    pubblica = riga.strip().split("=", 1)[1]
        return {"scritto": scritto, "pubblica": pubblica, "stampato": stampato.getvalue(), "fermo": fermo}


def dal_foglio(*dediche):
    return {"success": True, "dediche": list(dediche)}


def una(nome="Anna", dedica="", immagine="Rosa"):
    return {"nome": nome, "dedica": dedica, "immagine": immagine}


def dedica_pulita(testo):
    """la dedica come arriva nella pagina, dopo giardino.py"""
    return giardino.pulite([una(dedica=testo)])[0]["dedica"]


# ---- i controlli ----

controlli = []


def controllo(descrizione):
    def registra(prova):
        controlli.append((descrizione, prova))
        return prova
    return registra


@controllo("le dediche che il foglio dà finiscono in dediche.json, con il commit, e il sito si pubblica")
def _():
    g = giro({DAL_FOGLIO: dal_foglio(una("Anna", "Ti pensiamo", "Rosa"), una("Bruno", "", "Ulivo")), GIA_ONLINE: None})
    assert g["fermo"] is None, g["fermo"]
    assert g["scritto"] == {"versione": "c1", "dediche": [una("Anna", "Ti pensiamo", "Rosa"), una("Bruno", "", "Ulivo")]}, g["scritto"]
    assert g["pubblica"] == "true", g["pubblica"]


@controllo("nel sito arrivano solo il nome ricordato, la dedica e l’immagine: mai chi scrive né la sua email")
def _():
    con_altro = dict(una("Anna", "Ti pensiamo"), **{"Chi scrive": "Carla", "email": "carla@example.org", "Email": "carla@example.org"})
    g = giro({DAL_FOGLIO: dal_foglio(con_altro), GIA_ONLINE: None})
    assert g["scritto"]["dediche"] == [una("Anna", "Ti pensiamo")], g["scritto"]
    assert "carla" not in json.dumps(g["scritto"]).lower()


@controllo("una riga senza nome, o che non è una dedica, resta fuori; i testi troppo lunghi si accorciano")
def _():
    lunga = "parola " * 200
    g = giro({DAL_FOGLIO: dal_foglio(una(nome="  "), "testo", None, una("Anna", lunga, "x" * 200)), GIA_ONLINE: None})
    dediche = g["scritto"]["dediche"]
    assert [d["nome"] for d in dediche] == ["Anna"], dediche
    assert len(dediche[0]["dedica"]) <= giardino.MASSIMO["dedica"] and len(dediche[0]["immagine"]) <= giardino.MASSIMO["immagine"]


@controllo("apostrofo ’ e virgolette «» anche nelle parole di chi scrive")
def _():
    nome = giardino.pulite([una(nome="Giovanni D'Angelo")])[0]["nome"]
    assert nome == "Giovanni D’Angelo", nome
    d = dedica_pulita('Ci diceva sempre "coraggio" e l\'abbiamo imparato')
    assert d == "Ci diceva sempre «coraggio» e l’abbiamo imparato", d


@controllo("le virgolette messe intorno a tutta la dedica si tolgono: la pagina mette le sue")
def _():
    for scritta in ('"Ti vogliamo bene"', "«Ti vogliamo bene»", "“Ti vogliamo bene”", "'Ti vogliamo bene'"):
        assert dedica_pulita(scritta) == "Ti vogliamo bene", (scritta, dedica_pulita(scritta))


@controllo("una dedica che finisce con una citazione tiene le sue virgolette")
def _():
    for scritta in ('Come diceva lei: "sempre avanti"', "Come diceva lei: «sempre avanti»"):
        d = dedica_pulita(scritta)
        assert d == "Come diceva lei: «sempre avanti»", (scritta, d)
    d = dedica_pulita('"Ciao" ci diceva, e poi "a domani"')
    assert d == "«Ciao» ci diceva, e poi «a domani»", d


@controllo("l’apostrofo in fondo a una parola resta, come in «un po’»")
def _():
    d = dedica_pulita("Ci manchi più di un po'")
    assert d == "Ci manchi più di un po’", d


@controllo("se il foglio non risponde restano le dediche già pubblicate")
def _():
    gia = {"versione": "c0", "dediche": [una("Anna", "Ti pensiamo")]}
    g = giro({GIA_ONLINE: gia})
    assert g["fermo"] is None, g["fermo"]
    assert g["scritto"]["dediche"] == gia["dediche"], g["scritto"]
    assert "restano quelle già pubblicate" in g["stampato"], g["stampato"]


@controllo("se il foglio risponde con un errore restano le dediche già pubblicate")
def _():
    gia = {"versione": "c0", "dediche": [una("Anna")]}
    for risposta in ({"success": False}, {"success": True}, ["non", "un", "oggetto"]):
        g = giro({DAL_FOGLIO: risposta, GIA_ONLINE: gia})
        assert g["scritto"]["dediche"] == gia["dediche"], (risposta, g["scritto"])


@controllo("se non rispondono né il foglio né il sito, si ferma senza svuotare il giardino")
def _():
    g = giro({})
    assert g["fermo"], "doveva fermarsi"
    assert g["scritto"] is None, g["scritto"]


@controllo("la prima volta, senza dediche già pubblicate, scrive quelle del foglio")
def _():
    g = giro({DAL_FOGLIO: dal_foglio(una("Anna")), GIA_ONLINE: None})
    assert g["scritto"]["dediche"] == [una("Anna")] and g["pubblica"] == "true", g


@controllo("nel giro di ogni ora si ripubblica solo se le dediche o il commit sono cambiati")
def _():
    gia = {"versione": "c1", "dediche": [una("Anna")]}
    assert giro({DAL_FOGLIO: dal_foglio(una("Anna")), GIA_ONLINE: gia}, evento="schedule")["pubblica"] == "false"
    assert giro({DAL_FOGLIO: dal_foglio(una("Anna"), una("Bruno")), GIA_ONLINE: gia}, evento="schedule")["pubblica"] == "true"
    assert giro({DAL_FOGLIO: dal_foglio(una("Anna")), GIA_ONLINE: gia}, commit="c2", evento="schedule")["pubblica"] == "true"
    assert giro({DAL_FOGLIO: dal_foglio(una("Anna")), GIA_ONLINE: gia}, evento="push")["pubblica"] == "true"


# ---- si parte ----

def main():
    falliti = 0
    for descrizione, prova in controlli:
        try:
            prova()
            print("  ok  " + descrizione)
        except Exception as e:
            falliti += 1
            print("  NO  %s\n        %s" % (descrizione, (repr(e) if not str(e) else str(e)).splitlines()[0][:300]))
    if falliti:
        print("%d controlli del giardino su %d non passano" % (falliti, len(controlli)))
        sys.exit(1)
    print("Giardino: %d controlli passati su %d" % (len(controlli), len(controlli)))


if __name__ == "__main__":
    main()
