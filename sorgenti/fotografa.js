// Fotografa un sorgente HTML di sorgenti/ in un’immagine JPEG, con il Chromium di Playwright.
// La misura è quella della pagina (html, body); per l’immagine delle condivisioni 1200 × 630.
// Uso: node sorgenti/fotografa.js sorgenti/condivisione.html sito/img/condivisione.jpg
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

(async () => {
  const [src, out] = process.argv.slice(2).map(p => path.resolve(p));
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file://' + src);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, type: 'jpeg', quality: 88 });
  await browser.close();
})();
