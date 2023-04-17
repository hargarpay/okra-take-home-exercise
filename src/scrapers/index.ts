import puppeteer from "puppeteer";

const scrapePages = async ()  => {
    const browser = await puppeteer.launch({
        headless: process.env.NODE_ENV === 'production',
        defaultViewport: null
    });

    const page = await browser.newPage();

    page.on("dialog", async (dialog) => {
        await dialog.accept();
    })

    // TODO: Create auth object after initial login
    await page.goto('https://bankof.okra.ng/', {
        waitUntil: "domcontentloaded"
    });
    await page.click("nav > a.bg-black")
    await page.waitForSelector("#email")

    const auth = {
        email: "ifeoluwa.odewale@gmail.com",
        password: "Ifeola@0411",
        otp: "12345"
    }

    await page.type("#email", auth.email)
    await page.type("#password", auth.password)
    await page.click("button[type=submit]")

    await page.waitForSelector("#otp");

    await page.type("#otp", auth.otp);

    await Promise.all([
        page.click("button[type=submit]"),
        page.waitForNavigation()
    ]);

    // TODO: Create customer obhect
    // TODO: Create account object
    // TODO: Create transaction object
    // await browser.close();
}


void scrapePages();