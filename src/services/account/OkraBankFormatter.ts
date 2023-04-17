import { Account, DataSource, IAccountFormatter } from "../IFormatter";

export type OkraBankAccount = {
    accountId: string;
    balance: string;
    ledgerBalance: string;
}

export class OkraBankAccountFormatter implements IAccountFormatter {
    private account: OkraBankAccount;
    constructor(account: OkraBankAccount) {
        this.account = account;
    }

    format(): Account {
        return {
            source: DataSource.OKTA_BANK,
            currency: "USD",
            accountId: this.account.accountId,
            balance: Number.parseFloat(this.account.balance),
            ledgerBalance: Number.parseFloat(this.account.ledgerBalance),
        }
    }
}