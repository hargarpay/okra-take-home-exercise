import { Page } from "puppeteer";
import { OkraBankTransaction } from "../services/transaction/OkraBankFormatter";

export const scrapeAccountTransactions = async (page: Page): Promise<OkraBankTransaction[]> => {
    const accountTransactions: OkraBankTransaction[] = []
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
        }) as {next: boolean, transactions: OkraBankTransaction[]}

        accountTransactions.push(...transactionsInfo.transactions);
        if(!transactionsInfo.next){
            break;
        }
        await page.click("button.rounded-r")
    }

    return accountTransactions;
}