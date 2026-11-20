import { chromium, type Browser } from 'playwright';
export const PREVIEW = 'http://localhost:4391';
export const PROD = 'http://localhost:4392';
let browser: Browser | undefined;
export async function getBrowser() { return (browser ??= await chromium.launch()); }
export async function closeBrowser() { await browser?.close(); browser = undefined; }
