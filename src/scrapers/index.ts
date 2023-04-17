import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { OkraBankAuth, OkraBankAuthFormatter } from "../services/auth/OkraBankFormatter";
import { OkraBankCustomer, OkraBankCustomerFormatter } from "../services/customer/OkraBankFormatter";
import { OkraBankAccount, OkraBankAccountFormatter } from "../services/account/OkraBankFormatter";
import { getStandardisedAccount, getStandardisedAuth, getStandardisedCustomer, getStandardisedTransaction } from "../services/fomatter";
import { OkraBankTransaction, OkraBankTransactionFormatter } from "../services/transaction/OkraBankFormatter";

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

    const credentials = {
        email: "ifeoluwa.odewale@gmail.com",
        password: "Ifeola@0411",
        otp: "12345"
    }

    await page.type("#email", credentials.email)
    await page.type("#password", credentials.password)
    await page.click("button[type=submit]")

    await page.waitForSelector("#otp");

    await page.type("#otp", credentials.otp);

    await Promise.all([
        page.click("button[type=submit]"),
        page.waitForNavigation()
    ])
    await page.waitForSelector("main h1")

    const auth: OkraBankAuth = await page.evaluate(() => {
        const firstname = document.querySelector("nav  div > a").textContent;
        return {firstname}
    })
    const [standardisedAuth] = getStandardisedAuth([new OkraBankAuthFormatter(auth)])

    saveToFile(auth, "auth");
    saveToFile(standardisedAuth, "auth-standardised");


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
        return {fullname, ...customerInfo}
    }) as OkraBankCustomer
    const [standardisedCustomer] = getStandardisedCustomer([new OkraBankCustomerFormatter(customer)])

    saveToFile(customer, "customer");
    saveToFile(standardisedCustomer, "customer-standardised")

    // TODO: Create account object
    const accounts = await page.evaluate(() => {
        const main = document.querySelector("main > section");
        const accountList = main.querySelectorAll("section");

        return Array.from(accountList).map(account => {
            const accountInfoList = account.querySelectorAll("p");
            const accountInfo = {};
            ["balance", "ledgerBalance"].forEach((key, index) =>{
                const [, amount] = accountInfoList[index].textContent.split(" ");
                accountInfo[key] = amount
            })
            const [,accountId] = account.querySelector("a").href.split("-");
            return {accountId, ...accountInfo};
        })
    }) as OkraBankAccount[]

    const accountsFormatWrapper = accounts.map(account => new OkraBankAccountFormatter(account))
    const standardisedAccounts = getStandardisedAccount(accountsFormatWrapper)
    saveToFile(accounts, "accounts")
    saveToFile(standardisedAccounts, "accounts-standardised")
    // TODO: Create transaction object
    for(let i = 0; i < standardisedAccounts.length; i++) {
        const { id: accountId } = standardisedAccounts[i]
        const accountTransactions: OkraBankTransactionFormatter[] = [];
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
                        accountTransaction[key] = transactionInfoList[index].textContent;
                    })
                    return accountTransaction;
                })

                return {next: parseInt(currentTotalEntities) < parseInt(totalEntities), transactions}
            })
            const transactionsFormatWraooer = (transactionsInfo.transactions as OkraBankTransaction[] )
            .map((transaction) => new OkraBankTransactionFormatter(transaction))

            accountTransactions.push(...transactionsFormatWraooer);
            if(!transactionsInfo.next){
                break;
            }
            await page.click("button.rounded-r")
        }

        const standardisedTransactions = getStandardisedTransaction(accountTransactions);
        saveToFile(accountTransactions, `transactions-${accountId}`)
        saveToFile(standardisedTransactions, `transactions-${accountId}-standardised`)
        await page.click("nav > div > a:nth-child(1)");
        await page.waitForSelector("main h1")

    }

    // TODO: Logout
    await Promise.all([
        page.click("nav > div > a:nth-child(2)"),
        page.waitForNavigation()
    ])
    await browser.close();
}


void scrapePages();