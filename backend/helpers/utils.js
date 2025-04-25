import _ from "lodash";
import fs from "fs";
import colorsUtils from "./colorsUtils.js";
import { serverUrl } from "../config.js";

export async function filterUserData(user) {
	const data = _.pick(user, ["_id", "username", "roles", "avatarUrl"]);
	return data;
}

export const getStaticFilePath = (fileName) => {
	return `${serverUrl}/public/images/${fileName}`;
};

export const getLocalFilePath = (fileName) => {
	return `public/images/${fileName}`;
};

export const removeLocalFile = (path) => {
	fs.unlink(path, (err) => {
		if (err)
			colorsUtils.log("error", "failed to remove file - path : " + path);
		colorsUtils.log("success", "file removed path: " + path);
	});
};
