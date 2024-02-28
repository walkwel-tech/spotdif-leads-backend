import {Schema} from "mongoose";

const SupplierBadgeSchema = new Schema(
    {
        title: String,
        type: String,
        codeSnippet: String,
        imageUrl: String,
        order: Number,
        blogTitle: String,
        isActive: {
            type: Boolean,
            default: true
        }
    }, {
        timestamps: true
    }
)

export {SupplierBadgeSchema}
