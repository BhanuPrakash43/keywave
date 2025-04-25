import pkg from "jsonwebtoken";
const { sign, verify } = pkg;

import { BadTokenError, InternalError, TokenExpiredError } from "./ApiError.js";
import { tokenInfo } from "../config.js";

export class JwtPayload {
	constructor(issuer, audience, subject, validity) {
		this.iss = issuer;
		this.aud = audience;
		this.sub = subject;
		this.iat = Math.floor(Date.now() / 1000);
		this.exp = this.iat + validity;
	}
}

export const generateToken = (payload) => {
	if (!tokenInfo.jwtSecretKey) {
		throw new InternalError("Required JWT secret key not found.");
	}

	const plainPayload = { ...payload };

	return new Promise((resolve, reject) => {
		sign(plainPayload, tokenInfo.jwtSecretKey, (err, token) => {
			if (err) return reject(err);
			resolve(token);
		});
	});
};

export const validateToken = (token) => {
	if (!token) {
		throw new InternalError("No token provided.");
	}

	return new Promise((resolve, reject) => {
		verify(token, tokenInfo.jwtSecretKey, (err, decoded) => {
			if (err) {
				if (err.name === "TokenExpiredError") {
					return reject(new TokenExpiredError());
				}
				return reject(new BadTokenError());
			}
			resolve(decoded);
		});
	});
};

export const decodeToken = (token) => {
	if (!token) {
		throw new InternalError("No token provided.");
	}

	const options = { ignoreExpiration: true };

	return new Promise((resolve, reject) => {
		verify(token, tokenInfo.jwtSecretKey, options, (err, decoded) => {
			if (err) return reject(new BadTokenError());
			resolve(decoded);
		});
	});
};

export default {
	generateToken,
	validateToken,
	decodeToken,
	JwtPayload,
};
