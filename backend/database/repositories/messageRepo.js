import { MessageModel } from "../model/Message.model.js";

const chatMessageCommonAggregator = () => {
	return [
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
	];
};

const getMessageById = (id) => {
	return MessageModel.findById(id);
};

const getMessagesOfChatId = (chatId) => {
	return MessageModel.find({ chatId });
};

const deleteMessageById = (id) => {
	return MessageModel.findByIdAndDelete(id);
};

const deleteAllMessagesOfChatId = (chatId) => {
	return MessageModel.deleteMany({ chat: chatId });
};

const getAllMessagesAggregated = (chatId) => {
	return MessageModel.aggregate([
		{
			$match: {
				chat: chatId,
			},
		},
		{
			$sort: {
				createdAt: 1,
			},
		},
		...chatMessageCommonAggregator(),
	]);
};

const getLastMessage = (chatId) => {
	return MessageModel.findOne({ chat: chatId })
		.sort({ createdAt: -1 })
		.exec();
};

const createMessage = (userId, chatId, content, attachemntFiles) => {
	return MessageModel.create({
		sender: userId,
		content: content,
		chat: chatId,
		attachments: attachemntFiles,
	});
};

const getStructuredMessages = (messageId) => {
	return MessageModel.aggregate([
		{
			$match: {
				_id: messageId,
			},
		},
		...chatMessageCommonAggregator(),
	]);
};

export default {
	chatMessageCommonAggregator,
	getMessageById,
	getMessagesOfChatId,
	deleteMessageById,
	deleteAllMessagesOfChatId,
	getAllMessagesAggregated,
	getLastMessage,
	createMessage,
	getStructuredMessages,
};
