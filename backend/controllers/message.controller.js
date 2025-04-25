import {
	AuthFailureError,
	BadRequestError,
	InternalError,
	NotFoundError,
} from "../core/ApiError.js";
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse.js";
import { Types } from "mongoose";
import chatRepo from "../database/repositories/chatRepo.js";
import messageRepo from "../database/repositories/messageRepo.js";
import asyncHandler from "../helpers/asyncHandler.js";
import {
	getLocalFilePath,
	getStaticFilePath,
	removeLocalFile,
} from "../helpers/utils.js";
import { emitSocketEvent } from "../socket/index.js";
import { ChatEventEnum } from "../constants/index.js";

export const getAllMessages = asyncHandler(async (req, res) => {
	const { chatId } = req.params;
	const currentUser = req.user;

	const selectedChat = await chatRepo.getChatByChatId(
		new Types.ObjectId(chatId),
	);

	if (!selectedChat) {
		throw new NotFoundError("no chat found to retrieve messages");
	}

	if (selectedChat.participants?.includes(currentUser?._id)) {
		throw new AuthFailureError("you don't own the chat !");
	}

	const messages = await messageRepo.getAllMessagesAggregated(
		new Types.ObjectId(chatId),
	);

	if (!messages) {
		throw new InternalError("error while retrieving messages");
	}

	return new SuccessResponse(
		"messages retrieved successfully",
		messages,
	).send(res);
});

export const sendMessage = asyncHandler(async (req, res) => {
	const { content } = req.body;
	const { chatId } = req.params;

	const currentUserId = req.user?._id;
	const files = req.files || { attachments: [] };

	if (!chatId) {
		throw new BadRequestError("no chat id provided");
	}

	if (!content && !files.attachments?.length) {
		throw new BadRequestError("no content provided");
	}

	const selectedChat = await chatRepo.getChatByChatId(
		new Types.ObjectId(chatId),
	);

	if (!selectedChat) {
		throw new NotFoundError("No chat found");
	}

	const attachmentFiles = [];

	files.attachments?.forEach((attachment) => {
		attachmentFiles.push({
			url: getStaticFilePath(attachment.filename),
			localPath: getLocalFilePath(attachment.filename),
		});
	});

	const message = await messageRepo.createMessage(
		new Types.ObjectId(currentUserId),
		new Types.ObjectId(chatId),
		content || "",
		attachmentFiles,
	);

	const updatedChat = await chatRepo.updateChatFields(
		new Types.ObjectId(chatId),
		{
			lastMessage: message._id,
		},
	);

	const structuredMessage = await messageRepo.getStructuredMessages(
		message._id,
	);

	if (!structuredMessage.length) {
		throw new InternalError("error creating message: " + message._id);
	}

	updatedChat.participants.forEach((participantId) => {
		if (participantId.toString() === currentUserId.toString()) return;

		emitSocketEvent(
			req,
			participantId.toString(),
			ChatEventEnum.MESSAGE_RECEIVED_EVENT,
			structuredMessage[0],
		);
	});

	return new SuccessResponse(
		"message sent successfully",
		structuredMessage[0],
	).send(res);
});

export const deleteMessage = asyncHandler(async (req, res) => {
	const { messageId } = req.params;
	const currentUserId = req.user?._id;

	if (!messageId) {
		throw new BadRequestError("no message id provided");
	}

	const existingMessage = await messageRepo.getMessageById(
		new Types.ObjectId(messageId),
	);

	if (!existingMessage) {
		throw new BadRequestError("invalid message id, message not found");
	}

	const existingChat = await chatRepo.getChatByChatId(existingMessage?.chat);

	if (!existingChat) {
		throw new InternalError("Internal Error: chat not found");
	}

	if (
		!existingChat?.participants?.some(
			(participantId) =>
				participantId.toString() === currentUserId.toString(),
		)
	) {
		throw new AuthFailureError("you don't own the message");
	}

	if (!(existingMessage.sender.toString() === currentUserId.toString())) {
		throw new AuthFailureError("you don't own the message");
	}

	if (existingMessage?.attachments?.length > 0) {
		existingMessage.attachments.forEach(({ localPath }) => {
			removeLocalFile(localPath);
		});
	}

	const deletedMsg = await messageRepo.deleteMessageById(existingMessage._id);

	if (!deletedMsg) {
		throw new InternalError("Internal Error: Couldn't delete message");
	}

	let lastMessage;
	if (
		existingChat?.lastMessage?.toString() === existingMessage._id.toString()
	) {
		lastMessage = await messageRepo.getLastMessage(existingChat._id);

		await chatRepo.updateChatFields(existingChat._id, {
			$set: { lastMessage: lastMessage?._id },
		});
	}

	existingChat.participants.forEach((participantId) => {
		if (participantId.toString() === currentUserId.toString()) return;

		emitSocketEvent(
			req,
			participantId.toString(),
			ChatEventEnum.MESSAGE_DELETE_EVENT,
			{
				messageId: existingMessage._id,
			},
		);
	});

	return new SuccessMsgResponse("message deleted successfully").send(res);
});
