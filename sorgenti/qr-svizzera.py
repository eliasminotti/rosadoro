# -*- coding: utf-8 -*-
"""
Il codice QR della QR-fattura svizzera per le donazioni a Orizzonti Celesti, da mandare per email a chi
ci scrive dalla Svizzera (dal 31.10.2026 non sta più sulla pagina Dona: Dacia ed Elias).
Chi lo inquadra con l'app della sua banca trova il bonifico già compilato: il conto, il nome
dell'associazione e la causale «Donazione»; l'importo lo sceglie chi dona.

Segue le regole svizzere della QR-fattura (Swiss Payment Standards, versione 0200): correzione
degli errori M, indirizzo strutturato (S), nessun riferimento (NON), la croce svizzera di 7 mm
al centro di un codice di 46 mm.

Si rifà con:   python3 sorgenti/qr-svizzera.py     (serve la libreria segno: pip install segno)
Scrive:        sorgenti/qr-orizzonti-celesti.svg (fuori dal sito pubblicato)
Deciso da Elias il 13.10.2026 («Svizzera: solo bonifico», in «SITO — operativa»). Una copia del codice, anche in PNG,
sta nella bozza in Gmail e nel documento su Drive «Donare dalla Svizzera».
"""
import os
import segno

IBAN = "CH6509000000167176924"
CREDITORE = ("Orizzonti Celesti", "Via Mezzavilla", "12", "6503", "Bellinzona", "CH")
CAUSALE = "Donazione"

QUI = os.path.dirname(os.path.abspath(__file__))
USCITA = os.path.join(QUI, "qr-orizzonti-celesti.svg")


def iban_giusto(iban):
    numeri = "".join(str(int(c, 36)) for c in iban[4:] + iban[:4])
    return int(numeri) % 97 == 1


def contenuto():
    righe = ["SPC", "0200", "1", IBAN, "S"] + list(CREDITORE)
    righe += [""] * 7                      # creditore finale: non c'è
    righe += ["", "CHF"]                   # importo libero, in franchi
    righe += [""] * 7                      # chi paga: lo mette la sua banca
    righe += ["NON", "", CAUSALE, "EPD"]
    return "\r\n".join(righe)


def svg(qr):
    righe = list(qr.matrix)
    n = len(righe)
    quadri = "".join("M%d %dh1v1h-1z" % (x, y) for y, riga in enumerate(righe) for x, v in enumerate(riga) if v)
    # la croce svizzera: 7 mm su 46, al centro; bordo bianco, quadrato nero, croce bianca
    lato = n * 7 / 46
    s = lato / 19.8
    o = (n - lato) / 2
    def r(x, y, w, h, colore):
        return '<rect x="%.3f" y="%.3f" width="%.3f" height="%.3f" fill="%s"/>' % (o + x * s, o + y * s, w * s, h * s, colore)
    croce = r(0, 0, 19.8, 19.8, "#fff") + r(0.7, 0.7, 18.4, 18.4, "#000") + r(8.3, 4, 3.3, 11, "#fff") + r(4.4, 7.9, 11, 3.3, "#fff")
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 %d %d" shape-rendering="crispEdges">'
            '<rect x="-4" y="-4" width="%d" height="%d" fill="#fff"/><path d="%s" fill="#000"/>%s</svg>\n'
            % (n + 8, n + 8, n + 8, n + 8, quadri, croce))


if __name__ == "__main__":
    assert iban_giusto(IBAN), "IBAN sbagliato"
    qr = segno.make(contenuto(), error="m", encoding="utf-8", boost_error=False)
    assert qr.version <= 25
    with open(USCITA, "w", encoding="utf-8") as f:
        f.write(svg(qr))
    print("Scritto %s (versione QR %s, %d moduli)" % (os.path.relpath(USCITA), qr.version, len(list(qr.matrix))))
