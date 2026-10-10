// Stampa in PDF un sorgente HTML di sorgenti/ con il Chromium di Playwright.
// Il piede di pagina è nel sorgente stesso (@page, @bottom-left e @bottom-right).
// Uso: node sorgenti/stampa-pdf.js sorgenti/DAT-fac-simile.html sito/allegati/DAT-fac-simile.pdf
const path = require('path');
const { execFileSync } = require('child_process');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

(async () => {
  const [src, out] = process.argv.slice(2).map(p => path.resolve(p));
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + src);
  await page.evaluate(() => document.fonts.ready);
  const titolo = await page.title();
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  // titolo e autore nelle proprietà del PDF
  execFileSync('python3', ['-c', `
import sys
from pypdf import PdfReader, PdfWriter
w = PdfWriter(clone_from=PdfReader(sys.argv[1]))
w.add_metadata({'/Title': sys.argv[2], '/Author': "Fondazione La Rosa d'Oro ETS", '/Creator': "Fondazione La Rosa d'Oro ETS", '/Producer': ''})
w.write(sys.argv[1])`, out, titolo]);
})();
