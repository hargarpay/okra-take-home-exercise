import { Request, Response } from "express";
import { ScrapeState } from "../models"
import { scrapePages } from "../scrapers";

export const initiateScrape = async (req: Request, res: Response) => {
    const scapeState = new ScrapeState()
    await scapeState.save()
    void scrapePages(scapeState._id);

    return res.status(200).json({
        message: `Scape initiated, make GET api call to /state/${scapeState._id} to check the state`,
        id: scapeState._id
    });
}


export const scrapeState = async (req: Request, res: Response) => {
    const requestId = req.params.id;

    const scapeState = await ScrapeState.findById(requestId);

    return res.status(200).json({
        message: `${scapeState?.phase} ${scapeState?.status}`
    });
}