import { Schema, model } from "mongoose";

export const DOCUMENT_NAME = "Role";

export const RoleCode = {
	ADMIN: "ADMIN",
	USER: "USER",
};

const schema = new Schema({
	code: {
		type: String,
		required: true,
		enum: Object.values(RoleCode),
	},
	status: { type: Boolean, default: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export const RoleModel = model(DOCUMENT_NAME, schema);
