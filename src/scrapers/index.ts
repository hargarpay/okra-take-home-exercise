import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const saveToFile = (data: any, filename: string) => {
    fs.writeFileSync(path.join(__dirname, "..", "..", "data", `${filename}.json`), JSON.stringify(data, null, 2))
}
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
    saveToFile(customer, "customer")

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

    saveToFile(accounts, "accounts")
    // TODO: Create transaction object

    for(let i = 0; i < accounts.length; i++) {
        const {accountId} = accounts[i]
        const accountTransactions = [];
        await page.click(`main > section > section:nth-child(${i + 2}) a`);
        
        while(true){
            await page.waitForSelector("table > tbody")
    
            const transactionsInfo = await page.evaluate(() => {
                const transactionLists = document.querySelectorAll("table > tbody > tr.bg-white");
                const currentTotalEntities = document.querySelector("span > span:nth-child(2)").textContent;
                const totalEntities = document.querySelector("span > span:nth-child(3)").textContent;
    
                const transactions =  Array.from(transactionLists).map(transaction => {
                    const accountTransaction = {};
                    const transactionInfoList = transaction.querySelectorAll("td, th");
                    [
                        "type", "date", "description", "amount", "beneficiary", "sender"
                    ].forEach((key, index) => {
                        let value: number | string | Date = transactionInfoList[index].textContent;
                        accountTransaction[key] = value;
                    })
                    return accountTransaction;
                })

                return {next: parseInt(currentTotalEntities) < parseInt(totalEntities), transactions}
            })

            accountTransactions.push(...transactionsInfo.transactions);
            if(!transactionsInfo.next){
                break;
            }
            await page.click("button.rounded-r")
        }
        saveToFile(accountTransactions, `transactions-${accountId}`)
        await page.click("nav > div > a:nth-child(1)");
        await page.waitForSelector("main h1")

    }


    // await browser.close();
}


void scrapePages();