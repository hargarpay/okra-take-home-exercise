import "dotenv/config"
import { initiateDB } from "./startups/db";

import { scrapePages } from "./scrapers";

import "./models";

export const run = async () => {
    await initiateDB();
    await scrapePages();
}

void run();

