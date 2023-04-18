
export enum DataSource {
    OKTA_BANK = "oktaBank"
}

export type FormatterType = {
    source: DataSource
}

export type Auth = {
    username: string;
} & FormatterType

export type Customer = {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    bvn: string;
} & FormatterType

export type Account = {
    accountId: string;
    balance: number;
    ledgerBalance: number;
    currency: string;

} & FormatterType


export enum TransactionType {
    CREDIT = "credit",
    DEBIT =  "debit"
}
export type Transaction = {
    type: TransactionType;
    amount: number;
    beneficiary: string;
    sender: string;
    transactionDate: Date,
    reference: string;
} & FormatterType

export interface IFormatter {
    format(): FormatterType
}

export interface ICustomerFormatter extends IFormatter{
    format(): Customer
}

export interface IAccountFormatter extends IFormatter{
    format(): Account
}

export interface ITransactionFormatter extends IFormatter{
    format(): Transaction
}

export interface IAuthFormatter extends IFormatter{
    format(): Auth
}