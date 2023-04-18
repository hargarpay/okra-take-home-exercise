import { Page } from "puppeteer";
import { OkraBankAccount } from "../services/account/OkraBankFormatter";

export const scrapeAccounts = async (page: Page): Promise<OkraBankAccount[]> => {
    const accounts = await page.evaluate(() => {
        const main = document.querySelector("main > section") as Element;
        const accountList = main.querySelectorAll("section");

        return Array.from(accountList).map(account => {
            const accountInfoList = account.querySelectorAll("p");
            const accountInfo = {} as Record<string, string>;;
            ["balance", "ledgerBalance"].forEach((key, index) =>{
                const [, amount] = accountInfoList[index].textContent?.split(" ") as string[];
                accountInfo[key] = amount
            })
            const [,accountId] = account.querySelector("a")?.href.split("-") as string[];
            return {accountId, ...accountInfo};
        })
    }) as OkraBankAccount[]

    return accounts;
}