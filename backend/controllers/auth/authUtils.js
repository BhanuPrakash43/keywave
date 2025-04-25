import { Types } from "mongoose";
import { tokenInfo } from "../../config.js";
import { AuthFailureError, InternalError } from "../../core/ApiError.js";
import { generateToken, JwtPayload } from "../../core/JWT.js";

export const splitAccessToken = (token) => {
	if (!token) throw new AuthFailureError("missing authorization token");

	if (!token.startsWith("Bearer "))
		throw new AuthFailureError("invalid authorization token");

	return token.split(" ")[1];
};

export const createTokens = async (user) => {
	const accessToken = await generateToken(
		new JwtPayload(
			tokenInfo.issuer,
			tokenInfo.audience,
			user._id.toString(),
			tokenInfo.accessTokenValidity,
		)
	);

	if (!accessToken) throw new InternalError("Error creating access token");

	const refreshToken = await generateToken(
		new JwtPayload(
			tokenInfo.issuer,
			tokenInfo.audience,
			user._id.toString(),
			tokenInfo.refreshTokenValidity,
		)
	);

	if (!refreshToken) throw new InternalError("Error creating refresh token");

	return {
		accessToken,
		refreshToken,
	};
};

export const validateTokenData = (payload) => {
	if (
		!payload ||
		!payload.iss ||
		!payload.aud ||
		!payload.sub ||
		payload.iss !== tokenInfo.issuer ||
		payload.aud !== tokenInfo.audience ||
		!Types.ObjectId.isValid(payload.sub)
	)
		throw new AuthFailureError("invalid access token");

	return true;
};
