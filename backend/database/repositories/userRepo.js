import { UserModel } from "../model/User.model.js";
import { RoleModel } from "../model/Role.model.js";
import { InternalError } from "../../core/ApiError.js";

const exists = async (id) => {
	const user = await UserModel.exists({ _id: id, status: true });
	return user !== null;
};

const findById = (id) => {
	return UserModel.findOne(id)
		.populate({
			path: "roles",
			match: { status: true },
			select: { code: 1 },
		})
		.lean();
};

const findByUsername = (username) => {
	return UserModel.findOne({ username })
		.populate({
			path: "roles",
			match: { status: true },
			select: { code: 1 },
		})
		.lean();
};

const findByEmail = (email) => {
	return UserModel.findOne({ email })
		.populate({
			path: "roles",
			match: { status: true },
			select: { code: 1 },
		})
		.lean();
};

const findByEmailOrUsername = (id) => {
	return UserModel.findOne({
		$or: [{ email: id }, { username: id }],
	})
		.select("+password")
		.populate({
			path: "roles",
			match: { status: true },
			select: { code: 1, _id: 0 },
		})
		.lean()
		.exec();
};

const findFieldsById = (id, ...fields) => {
	return UserModel.findOne({ _id: id, status: true })
		.select(fields.join(" "))
		.lean();
};

const create = async (user, roleCode) => {
	const role = await RoleModel.findOne({ code: roleCode })
		.select("+code")
		.lean();
	if (!role) throw new InternalError("role must be specified");

	user.roles = [role];

	const createdUser = await UserModel.create(user);
	return createdUser.toObject();
};

const update = async (user, accessTokenKey, refreshTokenKey) => {
	user.updatedAt = new Date();
	await UserModel.findByIdAndUpdate(
		user._id,
		{ $set: { ...user } },
		{ new: true },
	).lean();

	return { user };
};

const updateInfo = (user) => {
	user.updatedAt = new Date();
	return UserModel.findByIdAndUpdate(
		user._id,
		{ $set: { ...user } },
		{ new: true },
	).lean();
};

const searchAvailableUsers = (currentUser, searchTermUsernameOrEmail) => {
	return UserModel.aggregate([
		{
			$match: {
				_id: { $ne: currentUser._id },
				status: true,
				$or: [
					{
						username: {
							$regex: searchTermUsernameOrEmail,
							$options: "i",
						},
					},
					{
						email: {
							$regex: searchTermUsernameOrEmail,
							$options: "i",
						},
					},
				],
			},
		},
		{
			$project: {
				avatarUrl: 1,
				username: 1,
				email: 1,
			},
		},
	]);
};

export default {
	exists,
	findById,
	findByUsername,
	findByEmail,
	findByEmailOrUsername,
	findFieldsById,
	create,
	update,
	updateInfo,
	searchAvailableUsers,
};
