import mongoose, {Schema} from "mongoose";
import { DataSource, TransactionType } from "../services/IFormatter";
import { ModelName } from "./constants";

const TransactionSchema = new Schema({
    source: {
        type: String,
        required: true,
        enum: DataSource
    },
    type: {
        type: String,
        required: true,
        enum: TransactionType
    },
    amount: {
        type: Number,
        required: true
    },
    beneficiary: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    transactionDate: {
        type: Date,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  ModelName.CUSTOMER
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  ModelName.ACCOUNTS
    }
}, {
    timestamps: true,
    collection: "sagecoder_okra_transactions",
});

TransactionSchema.index({beneficiary: 1})
TransactionSchema.index({sender: 1})


export const Transaction = mongoose.model(ModelName.TRANSACTION, TransactionSchema);

