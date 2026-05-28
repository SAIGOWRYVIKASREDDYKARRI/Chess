import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:5173/');
  
  // Wait for board to render
  await page.waitForSelector('[data-square="e2"]');
  
  // Get coordinates of e2 and e4
  const e2 = await page.$('[data-square="e2"]');
  const e4 = await page.$('[data-square="e4"]');
  
  const e2Box = await e2.boundingBox();
  const e4Box = await e4.boundingBox();
  
  // Drag and drop
  await page.mouse.move(e2Box.x + e2Box.width / 2, e2Box.y + e2Box.height / 2);
  await page.mouse.down();
  await page.mouse.move(e4Box.x + e4Box.width / 2, e4Box.y + e4Box.height / 2, { steps: 10 });
  await page.mouse.up();
  
  // Wait a bit to let React process
  await new Promise(r => setTimeout(r, 1000));
  
  await browser.close();
})();
