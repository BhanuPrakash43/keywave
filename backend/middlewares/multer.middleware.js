import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "..", "..", "public", "images"));
	},

	filename: function (req, file, cb) {
		let fileExtension = "";
		if (file.originalname.split(".").length > 1) {
			fileExtension = file.originalname.substring(
				file.originalname.lastIndexOf("."),
			);
		}

		console.log(file);

		const filenameWithoutExtension = file.originalname
			.split(" ")
			.join("-")
			.split(".")
			.slice(0, -1)
			.join(".");

		cb(
			null,
			filenameWithoutExtension +
				Date.now() +
				Math.ceil(Math.random() * 1e3) +
				fileExtension,
		);
	},
});

export const upload = multer({
	storage,
	limits: {
		fileSize: 50 * 1024 * 1024,
	},
});
