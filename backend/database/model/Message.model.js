import { Schema, model } from "mongoose";

export const DOCUMENT_NAME = "Message";

const schema = new Schema({
	sender: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},

	content: {
		type: String,
		trim: false,
		maxlength: 100000,
	},

	attachments: {
		type: [
			{
				url: {
					type: String,
					trim: true,
				},
				localPath: {
					type: String,
					trim: true,
				},
			},
		],
		default: [],
		// maxlength: 30, 
	},

	chat: {
		type: Schema.Types.ObjectId,
		ref: "Chat",
		required: true,
	},

	createdAt: {
		type: Date,
		default: Date.now,
	},

	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

export const MessageModel = model(DOCUMENT_NAME, schema);
