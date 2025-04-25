import { Schema, model } from "mongoose";

export const DOCUMENT_NAME = "User";

const schema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		maxlength: 200,
	},

	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		maxlength: 200,
	},

	password: {
		type: String,
		required: true,
		trim: true,
		select: false,
		maxlength: 200,
	},

	avatarUrl: {
		type: String,
		trim: true,
	},

	bio: {
		type: String,
		trim: true,
		maxlength: 200,
	},

	status: {
		type: Boolean,
		default: true,
	},

	roles: {
		type: [
			{
				type: Schema.Types.ObjectId,
				ref: "Role",
			},
		],
		required: true,
		select: false,
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

export const UserModel = model(DOCUMENT_NAME, schema);
