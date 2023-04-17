import { Auth, DataSource, IAuthFormatter } from "../IFormatter";

export type OkraBankAuth = {
    firstname: string 
}

export class OkraBankAuthFormatter implements IAuthFormatter {
    private auth: OkraBankAuth;
    constructor(auth: OkraBankAuth) {
        this.auth = auth;
    }

    format(): Auth {
        return {
            source: DataSource.OKTA_BANK,
            username: this.auth.firstname
        }
    }
}