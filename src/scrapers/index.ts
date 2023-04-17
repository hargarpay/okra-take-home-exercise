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
    ])

    await page.waitForSelector("main h1")
    // TODO: Create customer object
    const customer = await page.evaluate(() => {
        const main = document.querySelector("main > div")
        const welcomeMessage = main.querySelector("h1").textContent;
        // "Welcome back ".length === 13
        const fullname = welcomeMessage.substring(13, welcomeMessage.length - 1);
        const customerInfoList = main.querySelectorAll("p");
        const customerInfo = {}
        Array.from(customerInfoList).forEach((paragraph) => {
            const [key, value] = paragraph.textContent.split(": ");
            customerInfo[key.trim().toLowerCase()] = value.trim();
        })

        return {fullname, ...customerInfo};
    })
    console.log(customer)

    // TODO: Create account object
    const accounts = await page.evaluate(() => {
        const main = document.querySelector("main > section");
        const accountList = main.querySelectorAll("section");

        return Array.from(accountList).map(account => {
            const accountInfoList = account.querySelectorAll("p");
            const accountInfo = {};
            ["balance", "ledgerBalance"].forEach((key, index) =>{
                const [, amount] = accountInfoList[index].textContent.split(" ");
                accountInfo[key] = Number.parseFloat(amount)
            })
            const [,accountId] = account.querySelector("a").href.split("-")
            return {accountId, ...accountInfo};
        })

    })

    console.log(accounts)

    // TODO: Create transaction object
    // await browser.close();
}


void scrapePages();