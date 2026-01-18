const { chromium } = require('/var/www/rehab-care-link/server/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent('<html><body style="font-family:Arial,sans-serif;font-size:16px;">²âÊÔPDFÊä³ö</body></html>');
  const pdf = await page.pdf({ format: 'A4' });
  console.log('pdf-bytes', pdf.length);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });