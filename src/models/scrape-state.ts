import mongoose, {Schema, Document} from "mongoose";
import { ModelName, ScrapePhase, ScrapePhaseStatus } from "./constants";

export interface IScrapePhase extends Document {
    phase: ScrapePhase;
    status: ScrapePhaseStatus;
}

const ScrapeStateSchema = new Schema({
    phase: {
        type: String,
        required: true,
        enum: ScrapePhase,
        default: ScrapePhase.REQUEST,
    },
    status: {
        type: String,
        required: true,
        enum: ScrapePhaseStatus,
        default: ScrapePhaseStatus.INITIATE,
    },
}, {
    timestamps: true,
    collection: "sagecoder_okra_scape_state",
});

export const ScrapeState = mongoose.model<IScrapePhase>(ModelName.SCRAPE_STATE, ScrapeStateSchema);

