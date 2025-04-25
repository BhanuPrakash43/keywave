export const StatusCode = {
	SUCCESS: "10000",
	FAILURE: "10001",
	RETRY: "10002",
	INVALID_ACCESS_TOKEN: "10003",
	RATE_LIMIT: "10004",
};

export const ResponseStatus = {
	SUCCESS: 200,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	INTERNAL_ERROR: 500,
	RATE_LIMIT: 429,
};

export class ApiResponse {
	constructor(statusCode, status, message) {
		this.statusCode = statusCode;
		this.status = status;
		this.message = message;
	}

	prepare(res, response, headers = {}) {
		Object.entries(headers).forEach(([key, value]) =>
			res.append(key, value),
		);
		return res.status(this.status).json(ApiResponse.sanitize(response));
	}

	static sanitize(response) {
		const clone = { ...response };
		delete clone.status; 
		Object.keys(clone).forEach((key) => {
			if (typeof clone[key] === "undefined") delete clone[key];
		});
		return clone;
	}

	send(res, headers = {}) {
		return this.prepare(res, this, headers);
	}
}

export class InternalErrorResponse extends ApiResponse {
	constructor(message) {
		super(StatusCode.FAILURE, ResponseStatus.INTERNAL_ERROR, message);
	}
}

export class BadRequestResponse extends ApiResponse {
	constructor(message) {
		super(StatusCode.FAILURE, ResponseStatus.BAD_REQUEST, message);
	}
}

export class RateLimitResponse extends ApiResponse {
	constructor(message) {
		super(StatusCode.RATE_LIMIT, ResponseStatus.RATE_LIMIT, message);
	}
}

export class AuthFailureResponse extends ApiResponse {
	constructor(message) {
		super(StatusCode.FAILURE, ResponseStatus.UNAUTHORIZED, message);
	}
}

export class SuccessMsgResponse extends ApiResponse {
	constructor(message) {
		super(StatusCode.SUCCESS, ResponseStatus.SUCCESS, message);
	}
}

export class FailureMsgResponse extends ApiResponse {
	constructor(message) {
		super(StatusCode.FAILURE, ResponseStatus.SUCCESS, message);
	}
}

export class SuccessResponse {
	constructor(message = "success", data) {
		this.statusCode = StatusCode.SUCCESS;
		this.status = ResponseStatus.SUCCESS;
		this.message = message;
		this.data = data;
	}

	send(res, headers = {}) {
		return this.prepare(res, this, headers);
	}

	prepare(res, response, headers = {}) {
		Object.entries(headers).forEach(([key, value]) =>
			res.append(key, value),
		);
		return res.status(this.status).json(ApiResponse.sanitize(response));
	}
}

export class AccessTokenErrorResponse extends ApiResponse {
	constructor(message = "Access token invalid") {
		super(
			StatusCode.INVALID_ACCESS_TOKEN,
			ResponseStatus.UNAUTHORIZED,
			message,
		);
		this.instruction = "refresh_token";
	}

	send(res, headers = {}) {
		headers.instruction = this.instruction;
		return super.prepare(res, this, headers);
	}
}

export class NotFoundResponse extends ApiResponse {
	constructor(message = "Not Found") {
		super(StatusCode.FAILURE, ResponseStatus.NOT_FOUND, message);
	}

	send(res, headers = {}) {
		return super.prepare(res, this, headers);
	}
}
