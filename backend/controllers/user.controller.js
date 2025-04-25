import asyncHandler from "../helpers/asyncHandler.js";
import userRepo from "../database/repositories/userRepo.js";
import { AuthFailureError, BadRequestError } from "../core/ApiError.js";
import { RoleCode } from "../database/model/Role.model.js";
import bcrypt from "bcrypt";
import { createTokens } from "./auth/authUtils.js";
import { filterUserData } from "../helpers/utils.js";
import { SuccessResponse } from "../core/ApiResponse.js";
import { environment } from "../config.js";

const signUp = asyncHandler(async (req, res) => {
	const { email, username, password } = req.body;

	const existingUserEmail = await userRepo.findByEmail(email);
	if (existingUserEmail) {
		throw new BadRequestError("email already exists");
	}

	const existingUserUsername = await userRepo.findByUsername(username);
	if (existingUserUsername) {
		throw new BadRequestError("username already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await userRepo.create(
		{
			username,
			email,
			password: hashedPassword,
			avatarUrl: `https://s3bucket.bytenode.xyz/staticbucketstorage/public/images/avatar${
				// random number between 0 and 40
				Math.floor(Math.random() * (40 - 1 + 1)) + 1
			}.avif`,
		},
		RoleCode.USER,
	);

	const tokens = await createTokens(user);
	const userData = await filterUserData(user);

	new SuccessResponse("signup successful", {
		user: userData,
		tokens,
	}).send(res);
});

const login = asyncHandler(async (req, res) => {
	const { userId, password } = req.body;

	const user = await userRepo.findByEmailOrUsername(userId);
	if (!user) throw new BadRequestError("invalid email/username");

	if (!password) throw new BadRequestError("no credentials provided");

	const match = await bcrypt.compare(password, user.password);
	if (!match) throw new AuthFailureError("Invalid credentials");

	const { password: pass, status, ...filteredUser } = user;

	const tokens = await createTokens(user);

	const options = {
		httpOnly: true,
		secure: environment === "production",
	};

	res.cookie("accessToken", tokens.accessToken, options).cookie(
		"refreshToken",
		tokens.refreshToken,
		options,
	);

	new SuccessResponse("login successful", {
		user: filteredUser,
		tokens,
	}).send(res);
});

const logout = asyncHandler(async (req, res) => {
	const options = {
		httpOnly: true,
		secure: environment === "production",
	};

	res.clearCookie("accessToken", options).clearCookie(
		"refreshToken",
		options,
	);

	new SuccessResponse("logout successful", {}).send(res, {});
});

export { signUp, login, logout };
