import { ChatModel } from "../model/Chat.model.js";

const commonChatAggregation = () => {
	return [
		{
			$lookup: {
				from: "users",
				foreignField: "_id",
				localField: "participants",
				as: "participants",
				pipeline: [
					{
						$project: {
							password: 0,
							status: 0,
							createdAt: 0,
							updatedAt: 0,
							roles: 0,
						},
					},
				],
			},
		},
		{
			$lookup: {
				from: "messages",
				foreignField: "_id",
				localField: "lastMessage",
				as: "lastMessage",
				pipeline: [
					{
						$lookup: {
							from: "users",
							foreignField: "_id",
							localField: "sender",
							as: "sender",
							pipeline: [
								{
									$project: {
										username: 1,
										avatarUrl: 1,
										email: 1,
									},
								},
							],
						},
					},
					{
						$addFields: {
							sender: { $first: "$sender" },
						},
					},
				],
			},
		},
		{
			$addFields: {
				lastMessage: { $first: "$lastMessage" },
			},
		},
	];
};

const getExistingOneToOneChat = async (userId, receiverId) => {
	return await ChatModel.aggregate([
		{
			$match: {
				isGroupChat: false,
				$and: [
					{ participants: { $elemMatch: { $eq: userId } } },
					{ participants: { $elemMatch: { $eq: receiverId } } },
				],
			},
		},
		...commonChatAggregation(),
	]);
};

const createNewOneToOneChat = (userId, receiverId) => {
	return ChatModel.create({
		name: "One on one chat",
		participants: [userId, receiverId],
		admin: userId,
	});
};

const createNewGroupChat = (currentUserId, groupName, members) => {
	return ChatModel.create({
		name: groupName,
		isGroupChat: true,
		participants: members,
		admin: currentUserId,
	});
};

const getChatByChatId = (chatId) => {
	return ChatModel.findById(chatId).lean();
};

const getChatByChatIdAggregated = (chatId) => {
	return ChatModel.aggregate([
		{
			$match: {
				_id: chatId,
			},
		},
		...commonChatAggregation(),
	]);
};

const getCurrentUserAllChats = (currentUserId) => {
	return ChatModel.aggregate([
		{
			$match: {
				participants: { $elemMatch: { $eq: currentUserId } },
			},
		},
		{
			$sort: {
				updatedAt: -1,
			},
		},
		...commonChatAggregation(),
	]);
};

const getAggregatedGroupChat = (chatId) => {
	return ChatModel.aggregate([
		{
			$match: {
				_id: chatId,
				isGroupChat: true,
			},
		},
		...commonChatAggregation(),
	]);
};

const updateChatFields = (chatId, queryFields) => {
	return ChatModel.findByIdAndUpdate(chatId, queryFields, { new: true });
};

const deleteChatById = (chatId) => {
	return ChatModel.findByIdAndDelete(chatId);
};

export default {
	commonChatAggregation,
	getExistingOneToOneChat,
	createNewOneToOneChat,
	createNewGroupChat,
	getChatByChatId,
	getChatByChatIdAggregated,
	getCurrentUserAllChats,
	getAggregatedGroupChat,
	updateChatFields,
	deleteChatById,
};
