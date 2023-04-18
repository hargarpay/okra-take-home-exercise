import puppeteer from "puppeteer";

import { OkraBankAuthFormatter } from "../services/auth/OkraBankFormatter";
import { OkraBankCustomerFormatter } from "../services/customer/OkraBankFormatter";
import { OkraBankAccountFormatter } from "../services/account/OkraBankFormatter";
import { getStandardisedAccount, getStandardisedAuth, getStandardisedCustomer, getStandardisedTransaction } from "../services/fomatter";
import { OkraBankTransactionFormatter } from "../services/transaction/OkraBankFormatter";
import { scrapeAuth } from "./auth";
import { scrapeCustomer } from "./customer";
import { scrapeAccounts } from "./account";
import { scrapeAccountTransactions } from "./transaction";
import { Account, Auth, Customer, Transaction } from "../models";
import { TransactionType } from "../services/IFormatter";

export const scrapePages = async ()  => {
    const browser = await puppeteer.launch({
        headless: process.env.NODE_ENV === 'production',
        defaultViewport: null
    });

    const page = await browser.newPage();

    page.on("dialog", async (dialog) => {
        await dialog.accept();
    })

    await page.goto('https://bankof.okra.ng/', {
        waitUntil: "domcontentloaded"
    });

    // TODO: Create auth object after initial login
    
    const credentials = {
        email: "ifeoluwa.odewale@gmail.com",
        password: process.env.USER_PASSWORD || "",
        otp: "12345"
    }

    const auth = await scrapeAuth(page, credentials);
    const [standardisedAuth] = getStandardisedAuth([new OkraBankAuthFormatter(auth)])

    const savedAuth = await Auth.findOneAndUpdate(
        { username: standardisedAuth.username, source: standardisedAuth.source}, 
        standardisedAuth,
        { new: true,upsert: true}
    );


    // TODO: Create customer object
    const customer = await scrapeCustomer(page);
    const [standardisedCustomer] = getStandardisedCustomer([new OkraBankCustomerFormatter(customer)])

    
    const savedCustomer = await Customer.findOneAndUpdate(
        {
            bvn: standardisedCustomer.bvn,
            email: standardisedCustomer.email,
            source: standardisedCustomer.source,
        }, 
        standardisedCustomer,
        { new: true, upsert: true}
    )

    savedAuth.customer = savedCustomer._id;
    await savedCustomer.save();

    // TODO: Create account object
    
    const accounts = await scrapeAccounts(page);
    const accountsFormatWrapper = accounts.map(account => new OkraBankAccountFormatter(account))

    const standardisedAccounts = getStandardisedAccount(accountsFormatWrapper);

    const savedAccounts = await Promise.all(
        standardisedAccounts.map(account => {
            return Account.findOneAndUpdate(
                {
                    accountId: account.accountId,
                    source: account.source,
                },
                account,
                { new: true, upsert: true}
            )
        })
    )

    savedCustomer.accounts = savedAccounts.map(account => account._id)
    savedCustomer.save();

    // // TODO: Create transaction object
    for(let i = 0; i < savedAccounts.length; i++) {
        const savedAccount = savedAccounts[i]
        await page.click(`main > section > section:nth-child(${i + 2}) a`);
        
        const accountTransactions = await scrapeAccountTransactions(page);

        const transactionsFormatWrapper = accountTransactions.map(transaction => new OkraBankTransactionFormatter(transaction))
        const standardisedTransactions = getStandardisedTransaction(transactionsFormatWrapper);

        const transactionRefernces = standardisedTransactions.map(transaction => transaction.reference);

        const existingTransactions = await Transaction.find({reference: {$in: transactionRefernces}})

        const transactionsObj = existingTransactions.reduce((obj, transaction) => {
            obj[transaction.reference] = true;
            return obj;
        }, {} as {[key: string]: boolean});

        const trsansactionToSave = standardisedTransactions.filter(({reference}) => !transactionsObj[reference])

        const savedTransactions = await Transaction.insertMany(trsansactionToSave);

        await page.click("nav > div > a:nth-child(1)");
        await page.waitForSelector("main h1")

        savedAccount.transactions = [
            ...savedAccount.transactions, 
            ...savedTransactions.map(trans => trans._id)
        ]
        await savedAccount.save();

        await Transaction.updateMany(
            {
                $or: [
                    {type: TransactionType.CREDIT, beneficiary: savedAccount.accountId},
                    {type: TransactionType.DEBIT, sender: savedAccount.accountId}
                ]
            }, 
            {
                $set: {account: savedAccount._id}
            }
        )

    }

    // TODO: Logout
    await Promise.all([
        page.click("nav > div > a:nth-child(2)"),
        page.waitForNavigation()
    ])
    await browser.close();
}