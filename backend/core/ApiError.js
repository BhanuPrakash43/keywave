import { environment } from "../config.js";
import {
	AccessTokenErrorResponse,
	AuthFailureResponse,
	BadRequestResponse,
	InternalErrorResponse,
	NotFoundResponse,
	RateLimitResponse,
} from "./ApiResponse.js";

export const ErrorType = {
	BAD_TOKEN: "BadTokenError",
	TOKEN_EXPIRED: "TokenExpiredError",
	UNAUTHORIZED: "AuthFailureError",
	ACCESS_TOKEN: "AccessTokenError",
	INTERNAL: "InternalError",
	NOT_FOUND: "NotFoundError",
	NO_ENTRY: "NoEntryError",
	NO_DATA: "NoDataError",
	BAD_REQUEST: "BadRequestError",
	RATE_LIMIT: "RateLimitError",
	FORBIDDEN: "ForbiddenError",
};

export class ApiError extends Error {
	constructor(type, message = "error", stack = "") {
		super(type);
		this.type = type;
		this.message = message;
		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	static handle(err, res) {
		switch (err.type) {
			case ErrorType.INTERNAL:
				return new InternalErrorResponse(err.message).send(res);

			case ErrorType.BAD_REQUEST:
				return new BadRequestResponse(err.message).send(res);

			case ErrorType.ACCESS_TOKEN:
				return new AccessTokenErrorResponse(err.message).send(res);

			case ErrorType.NOT_FOUND:
			case ErrorType.NO_ENTRY:
			case ErrorType.NO_DATA:
				return new NotFoundResponse(err.message).send(res);

			case ErrorType.TOKEN_EXPIRED:
			case ErrorType.BAD_TOKEN:
			case ErrorType.UNAUTHORIZED:
				return new AuthFailureResponse(err.message).send(res);

			case ErrorType.RATE_LIMIT:
				return new RateLimitResponse(err.message).send(res);

			default: {
				let message = err.message;
				if (environment === "production")
					message = "something went wrong";
				return new InternalErrorResponse(message).send(res);
			}
		}
	}
}

export class InternalError extends ApiError {
	constructor(message = "Internal Error") {
		super(ErrorType.INTERNAL, message);
	}
}

export class BadRequestError extends ApiError {
	constructor(message = "Bad Request Error") {
		super(ErrorType.BAD_REQUEST, message);
	}
}

export class RateLimitError extends ApiError {
	constructor(message = "Rate Limit Error") {
		super(ErrorType.RATE_LIMIT, message);
	}
}

export class AuthFailureError extends ApiError {
	constructor(message = "invalid credentials") {
		super(ErrorType.UNAUTHORIZED, message);
	}
}

export class BadTokenError extends ApiError {
	constructor(message = "Bad Token Error") {
		super(ErrorType.BAD_TOKEN, message);
	}
}

export class TokenExpiredError extends ApiError {
	constructor(message = "Token Expired Error") {
		super(ErrorType.TOKEN_EXPIRED, message);
	}
}

export class NoDataError extends ApiError {
	constructor(message = "No Data Error") {
		super(ErrorType.NO_DATA, message);
	}
}

export class NotFoundError extends ApiError {
	constructor(message = "Not Found") {
		super(ErrorType.NOT_FOUND, message);
	}
}

export class AccessTokenError extends ApiError {
	constructor(message = "Access Token Error") {
		super(ErrorType.ACCESS_TOKEN, message);
	}
}
