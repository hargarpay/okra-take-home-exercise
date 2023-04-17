import puppeteer from "puppeteer";

const scrapePages = async ()  => {
    const browser = await puppeteer.launch({
        headless: process.env.NODE_ENV !== 'production',
        defaultViewport: null
    });

    const page = await browser.newPage();

    // TODO: Create auth object after initial login
    // TODO: Create customer obhect
    // TODO: Create account object
    // TODO: Create transaction object
    await browser.close();
}


void scrapePages();