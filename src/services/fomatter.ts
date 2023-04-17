import { Account, Auth, Customer, IAccountFormatter, IAuthFormatter, ICustomerFormatter, ITransactionFormatter, Transaction } from "./IFormatter";
export const getStandardisedCustomer = (rawData: ICustomerFormatter[]): Customer[] => {
    return rawData.map(rawDatum => rawDatum.format())
}

export const getStandardisedAuth = (rawData: IAuthFormatter[]): Auth[] => {
    return rawData.map(rawDatum => rawDatum.format());
}

export const getStandardisedTransaction = (rawData: ITransactionFormatter[]): Transaction[] => {
    return rawData.map(rawDatum => rawDatum.format());
}

export const getStandardisedAccount = (rawData: IAccountFormatter[]): Account[] => {
    return rawData.map(rawDatum => rawDatum.format())
}