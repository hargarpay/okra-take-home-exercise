import "dotenv/config";
import express from "express";

import { initiateDB } from "./startups/db";
import "./models";
import { initiateScrape, scrapeState } from "./api/scraper";

const app = express();
export const run = async () => {
    await initiateDB();

    app.get('/initiate', initiateScrape);
    app.get('/state/:id', scrapeState);


    const PORT = process.env.PORT || "7000";
    app.listen(Number.parseInt(PORT), () => {
        console.log(`Server running on port ${PORT}`);
    })
}

void run();

