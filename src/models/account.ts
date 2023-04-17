import mongoose, {Schema} from "mongoose";
import { DataSource } from "../services/IFormatter";
import { ModelName } from "./constants";

const AccountSchema = new Schema({
    source: {
        type: String,
        required: true,
        enum: DataSource
    },
    accountId: { type: String, required:  true},
    balance: {type: Number, required: true},
    ledgerBalance: {type: Number, required: true},
    customer: {
        type: Schema.Types.ObjectId,
        ref: ModelName.CUSTOMER
    },
    currency: {
        type: String,
        required: true,
    },
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: ModelName.TRANSACTION
    }]
}, {
    timestamps: true,
    collection: "sagecoder_okra_accounts",
});

export const Account = mongoose.model(ModelName.ACCOUNTS, AccountSchema);

