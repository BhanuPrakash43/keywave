import { body, param } from "express-validator";

export const mongoIdPathValidator = (idName) => {
	return [
		param(idName)
			.notEmpty()
			.isMongoId()
			.withMessage("Invalid " + idName),
	];
};

export const mongoIdRequestBodyValidator = (idName) => {
	return [
		body(idName)
			.notEmpty()
			.isMongoId()
			.withMessage("Invalid " + idName),
	];
};
