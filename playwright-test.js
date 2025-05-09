const { chromium } = require('playwright');

async function runTest() {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://www.example.com');
    console.log(await page.title());
    await browser.close();
  } catch (error) {
    console.error('运行出错:', error);
  }
}

runTest(); 