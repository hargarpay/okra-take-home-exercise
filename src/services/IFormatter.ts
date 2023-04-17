
type FormatterType = {
    source: "okta-bank"
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
    id: string;
    balance: number;
    ledgerBalance: number;

} & FormatterType


export type TransactionType = "credit" | "debit";
export type Transaction = {
    type: TransactionType;
    amount: number;
    beneficiary: string;
    sender: string;
    date: Date
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