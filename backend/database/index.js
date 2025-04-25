import mongoose from "mongoose";
import { db } from "../config.js";
import colorsUtils from "../helpers/colorsUtils.js";
import seedRoles from "../seeds/seedRoles.js";

const dbURI = `${db.url}/${db.name}`;

const options = {
	minPoolSize: db.minPoolSize,
	maxPoolSize: db.maxPoolSize,
	connectTimeoutMS: 60000,
	socketTimeoutMS: 45000,
};

mongoose.set("strictQuery", true);

function setRunValidators() {
	this.setOptions({ runValidators: true });
}

mongoose
	.plugin((schema) => {
		schema.pre("findOneAndUpdate", setRunValidators);
		schema.pre("updateMany", setRunValidators);
		schema.pre("updateOne", setRunValidators);
		schema.pre("update", setRunValidators);
	})
	.connect(dbURI, options)
	.then(() => {
		colorsUtils.log("success", "🛢  mongoose connection done");
	})
	.catch((e) => {
		console.error("mongoose connection error: " + e.message);
	});

mongoose.connection.on("connected", () => {
	colorsUtils.log(
		"success",
		"🔗 mongoose connection opened : " + mongoose.connection.host,
	);
});

mongoose.connection.once("open", async () => {
	await seedRoles();
});

mongoose.connection.on("disconnected", () => {
	colorsUtils.log("warning", "mongoose connection disconnected");
});

export const connection = mongoose.connection;
