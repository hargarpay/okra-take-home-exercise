export enum ModelName {
    ACCOUNTS = "Account",
    AUTH = "Auth",
    CUSTOMER = "Customer",
    TRANSACTION = "Transaction",
    SCRAPE_STATE = "ScrapeState"
}


export enum ScrapePhase {
    REQUEST = "Request",
    ACCOUNTS = "Account",
    AUTH = "Auth",
    CUSTOMER = "Customer",
    TRANSACTION = "Transaction",
}

export enum ScrapePhaseStatus {
    INITIATE = "Initiate",
    PROCESSING = "Processing",
    COMPLETE = "Complete",
    FAILED = "Failed",
}