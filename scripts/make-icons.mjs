// Renders the app icons from the logo artwork (run once: node scripts/make-icons.mjs).
// Needs Playwright's Chromium; the generated PNGs are committed, so this is only for changes.
import { writeFile } from 'node:fs/promises';
import { art } from '../js/core/art.js';

const logo = art('logo', '').replace('<svg ', '<svg width="120" height="120" ');
await writeFile(new URL('../icons/favicon.svg', import.meta.url), logo + '\n');

let chromium;
try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }
const browser = await chromium.launch();
const page = await browser.newPage();
const render = async (file, size, padding, background) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${background}">`
    + `<div style="width:${size - padding * 2}px;height:${size - padding * 2}px">${logo.replace('width="120" height="120"', 'width="100%" height="100%"')}</div></body></html>`);
  await page.screenshot({ path: new URL(`../icons/${file}`, import.meta.url).pathname, omitBackground: background === 'transparent' });
};
await render('icon-192.png', 192, 6, 'transparent');
await render('icon-512.png', 512, 16, 'transparent');
await render('icon-maskable-512.png', 512, 92, '#faf9f5');
await render('apple-touch-icon.png', 180, 18, '#faf9f5');
await browser.close();
console.log('icons written');
