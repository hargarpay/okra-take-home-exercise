import { Auth, ITransactionFormatter, Transaction, TransactionType } from "../IFormatter";

export type OkraBankTransaction = {
    type: TransactionType;
    date: string;
    description: string;
    amount: string;
    beneficiary: string;
    sender: string;
}

export class OkraBankTransactionFormatter implements ITransactionFormatter {
    private transaction: OkraBankTransaction;
    constructor(transaction: OkraBankTransaction) {
        this.transaction = transaction;
    }

    format(): Transaction {
        const { type, amount, date, beneficiary, sender } = this.transaction;
        return {
            source: "okta-bank",
            type,
            amount: Number.parseFloat(amount.substring(1)),
            date: new Date(date),
            beneficiary: beneficiary,
            sender: sender,
        }
    }


}