import mongoose, {Schema, SchemaType} from "mongoose";
import { DataSource } from "../services/IFormatter";
import { Account } from "./account";
import { ModelName } from "./constants";

const CustomerSchema = new Schema({
    source: {
        type: String,
        required: true,
        enum: DataSource
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
    },
    bvn: { type: String, required: true},
    phone: { type: String, required: true },
    accounts: [{
        type: Schema.Types.ObjectId,
        ref: ModelName.ACCOUNTS,
    }]
}, {
    timestamps: true,
    collection: "sagecoder_okra_customers",
});

CustomerSchema.index({bvn: 1})

export const Customer = mongoose.model(ModelName.CUSTOMER, CustomerSchema);

