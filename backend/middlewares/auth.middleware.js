import asyncHandler from "../helpers/asyncHandler.js";
import {
	AccessTokenError,
	AuthFailureError,
	BadTokenError,
	TokenExpiredError,
} from "../core/ApiError.js";
import JWT from "../core/JWT.js";
import userRepo from "../database/repositories/userRepo.js";
import { Types } from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
	const token =
		req.cookies?.accessToken ||
		req.header("Authorization")?.replace("Bearer ", "");

	if (!token) {
		throw new BadTokenError("No token provided");
	}

	try {
		const decodedToken = await JWT.decodeToken(token);
		const userData = await userRepo.findById(
			new Types.ObjectId(decodedToken.sub),
		);

		if (!userData) {
			throw new AuthFailureError();
		}

		req.user = userData;

		next();
	} catch (error) {
		if (error instanceof TokenExpiredError)
			throw new AccessTokenError(error.message);
		throw error;
	}
});
