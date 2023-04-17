import mongoose, {Schema} from "mongoose";
import { DataSource } from "../services/IFormatter";
import { ModelName } from "./constants";

const AuthSchema = new Schema({
    source: {
        type: String,
        required: true,
        enum: DataSource
    },
    username: { type: String, required:  true},
    customer: { type: Schema.Types.ObjectId, ref: ModelName.CUSTOMER}
}, {
    timestamps: true,
    collection: "sagecoder_okra_authentications",
});

export const Auth = mongoose.model(ModelName.AUTH, AuthSchema);

