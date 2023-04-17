import { Customer, DataSource, ICustomerFormatter } from "../IFormatter";

export type OkraBankCustomer = {
    fullname: string;
    address: string;
    bvn: string;
    phone: string;
    email: string;

}

export class OkraBankCustomerFormatter implements ICustomerFormatter {
    private customer: OkraBankCustomer;
    constructor(customer: OkraBankCustomer) {
        this.customer = customer;
    }

    format(): Customer {
        const { fullname, email, phone, bvn } = this.customer;
        const [firstname, lastname] = fullname.split("")

        return {
            source: DataSource.OKTA_BANK,
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: email,
            phone: phone,
            bvn: bvn
        }
    }
}