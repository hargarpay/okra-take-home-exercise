import { Page } from "puppeteer";
import { OkraBankCustomer } from "../services/customer/OkraBankFormatter";

export const scrapeCustomer = async (page: Page): Promise<OkraBankCustomer> => {
    const customer = await page.evaluate(() => {
        const main = document.querySelector("main > div") as Element
        const welcomeMessage = main.querySelector("h1")?.textContent || "";
        // "Welcome back ".length === 13
        const fullname = welcomeMessage.substring(13, welcomeMessage.length - 1);
        const customerInfoList = main.querySelectorAll("p");
        const customerInfo = {} as Record<string, string>;
        Array.from(customerInfoList).forEach((paragraph) => {
            const [key, value] = paragraph?.textContent?.split(": ") as string[];
            customerInfo[key.trim().toLowerCase()] = value.trim();
        })
        return {fullname, ...customerInfo}
    }) as OkraBankCustomer

    return customer;
}