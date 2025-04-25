import { validationResult } from "express-validator";
import { BadRequestError } from "../core/ApiError.js";

const validate = (req, res, next) => {
	try {
		const errors = validationResult(req);

		if (errors.isEmpty()) {
			return next();
		}

		const extractedErrors = errors.array().map((err) => ({
			[err.param]: err.msg,
		}));

		const errorMsg = extractedErrors
			.map((err) => Object.values(err).join(", "))
			.join(", ");

		next(new BadRequestError(errorMsg));
	} catch (error) {
		next(error);
	}
};

export { validate };
