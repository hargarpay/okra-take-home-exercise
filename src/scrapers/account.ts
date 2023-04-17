import { Page } from "puppeteer";
import { OkraBankAccount } from "../services/account/OkraBankFormatter";

export const scrapeAccounts = async (page: Page): Promise<OkraBankAccount[]> => {
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

    return accounts;
}