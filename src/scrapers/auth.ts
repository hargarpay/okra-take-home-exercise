import { Page } from "puppeteer";
import { OkraBankAuth } from "../services/auth/OkraBankFormatter";
import { Credentials } from "./types";

export const scrapeAuth = async (page: Page, credentials:  Credentials):  Promise<OkraBankAuth>  => {
    await page.click("nav > a.bg-black")
    await page.waitForSelector("#email")

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

    return auth;

}