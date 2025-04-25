import { Schema, model } from "mongoose";

export const DOCUMENT_NAME = "Chat";

const schema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		maxlength: 200,
	},

	isGroupChat: {
		type: Boolean,
		default: false,
		required: true,
	},

	lastMessage: {
		type: Schema.Types.ObjectId,
		ref: "Message",
	},

	participants: {
		type: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		required: true,
	},

	admin: {
		type: Schema.Types.ObjectId,
		ref: "User",
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

export const ChatModel = model(DOCUMENT_NAME, schema);
