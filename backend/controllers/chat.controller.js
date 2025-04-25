import asyncHandler from "../helpers/asyncHandler.js";
import userRepo from "../database/repositories/userRepo.js";
import {
	AuthFailureError,
	BadRequestError,
	InternalError,
	NoDataError,
	NotFoundError,
} from "../core/ApiError.js";
import chatRepo from "../database/repositories/chatRepo.js";
import { SuccessMsgResponse, SuccessResponse } from "../core/ApiResponse.js";
import { Types } from "mongoose";
import { emitSocketEvent } from "../socket/index.js";
import { ChatEventEnum } from "../constants/index.js";
import { removeLocalFile } from "../helpers/utils.js";
import messageRepo from "../database/repositories/messageRepo.js";

const searchAvailableusers = asyncHandler(async (req, res) => {
	const userId = req.query.userId;

	if (!userId)
		throw new BadRequestError(
			"invalid search, provide a username or email",
		);

	const users = await userRepo.searchAvailableUsers(req.user, userId);

	if (!users.length) {
		throw new NoDataError("no users found");
	}

	return new SuccessResponse("found Users", {
		users,
	}).send(res);
});

const createOrGetExistingChat = asyncHandler(async (req, res) => {
	const { receiverId } = req.params;

	const currentUserId = req.user?._id;

	const receiver = await userRepo.findById(new Types.ObjectId(receiverId));

	if (!receiver) {
		throw new BadRequestError("receiver does not exist");
	}

	if (receiver._id.toString() === currentUserId.toString()) {
		throw new BadRequestError("you cannot chat with yourself");
	}

	const chat = await chatRepo.getExistingOneToOneChat(
		currentUserId,
		new Types.ObjectId(receiverId),
	);

	if (chat.length) {
		return new SuccessResponse("chat retrieved successfully", {
			existing: true,
			...chat[0],
		}).send(res);
	}

	const newChatInstance = await chatRepo.createNewOneToOneChat(
		currentUserId,
		new Types.ObjectId(receiverId),
	);

	const newChatId = newChatInstance._id;

	const createdChat = await chatRepo.getChatByChatIdAggregated(newChatId);

	if (!createdChat.length) {
		throw new InternalError(
			"unable to create a chat one to one chat instance",
		);
	}

	createdChat[0]?.participants?.forEach((participant) => {
		if (participant._id?.toString() === req.user?._id.toString()) return; // no need to emit event for current user

		emitSocketEvent(
			req,
			participant._id?.toString(),
			ChatEventEnum.NEW_CHAT_EVENT,
			createdChat[0],
		);
	});

	return new SuccessResponse("chat created successfully", {
		existing: false,
		...createdChat[0],
	}).send(res);
});

const getCurrentUserChats = async (req, res) => {
	const currentUserId = req.user?._id;
	const chats = await chatRepo.getCurrentUserAllChats(currentUserId);

	return new SuccessResponse(
		"user chats fetched successfully",
		chats || [],
	).send(res);
};

const createGroupChat = asyncHandler(async (req, res) => {
	const { name, participants } = req.body;
	const currentUserId = req.user?._id;

	if (participants?.includes(currentUserId.toString())) {
		throw new BadRequestError(
			"invalid participants, container the current user",
		);
	}

	const members = [...new Set([...participants, req.user._id.toString()])];

	if (members.length < 3) {
		throw new BadRequestError("invalid participants length");
	}

	const createdGroupChat = await chatRepo.createNewGroupChat(
		currentUserId,
		name,
		members,
	);

	const chatRes = await chatRepo.getAggregatedGroupChat(createdGroupChat._id);

	const groupChat = chatRes[0];

	groupChat?.participants?.forEach((participant) => {
		if (participant._id?.toString() === currentUserId?.toString()) return;

		emitSocketEvent(
			req,
			participant._id?.toString(),
			ChatEventEnum.NEW_CHAT_EVENT,
			groupChat,
		);
	});

	return new SuccessResponse(
		"group chat created successfully",
		groupChat,
	).send(res);
});

const getGroupChatDetails = asyncHandler(async (req, res) => {
	const { chatId } = req.params;

	const chatRes = await chatRepo.getAggregatedGroupChat(
		new Types.ObjectId(chatId),
	);

	const groupChatDetails = chatRes[0];

	if (!groupChatDetails) {
		throw new NoDataError("group chat not found!");
	}

	return new SuccessResponse(
		"group chat fetched successfully",
		groupChatDetails,
	).send(res);
});

const addNewUserToGroup = asyncHandler(async (req, res) => {
	const { chatId } = req.params;
	const { newParticipantId } = req.body;
	const currentUserId = req.user?._id;
	if (!chatId) {
		throw new BadRequestError("no chatId provided");
	}

	const existingGroupChat = await chatRepo.getChatByChatId(
		new Types.ObjectId(chatId),
	);

	if (!existingGroupChat) {
		throw new NotFoundError("no group chat found ");
	}

	if (existingGroupChat.admin?.toString() !== currentUserId?.toString()) {
		throw new BadRequestError("only admin's can add new user");
	}

	const existingParticipants = existingGroupChat.participants;

	if (
		existingParticipants.some(
			(participant) => participant.toString() === newParticipantId,
		)
	) {
		throw new BadRequestError("user already exists in the group");
	}

	await chatRepo.updateChatFields(new Types.ObjectId(chatId), {
		$push: { participants: newParticipantId },
	});

	const aggregatedChat = await chatRepo.getAggregatedGroupChat(
		new Types.ObjectId(chatId),
	);

	const updatedChat = aggregatedChat[0];

	if (!updatedChat) {
		throw new InternalError("Internal Server Error");
	}

	return new SuccessResponse(
		"participant added successfully",
		updatedChat,
	).send(res);
});

const deleteChat = asyncHandler(async (req, res) => {
	const { chatId } = req.params;
	const currentUserId = req.user?._id;

	const existingChat = await chatRepo.getChatByChatId(
		new Types.ObjectId(chatId),
	);

	if (!existingChat) {
		throw new NotFoundError("chat not found");
	}

	if (!existingChat.isGroupChat) {
		if (existingChat.admin.toString() !== currentUserId.toString()) {
			throw new AuthFailureError("only admins can delete the group ");
		}
	}

	if (
		!existingChat?.participants?.some(
			(participantId) =>
				participantId.toString() === currentUserId.toString(),
		)
	) {
		throw new AuthFailureError("you cannot delete other's chat");
	}

	await chatRepo.deleteChatById(existingChat._id);

	const existingMessages = await messageRepo.getMessagesOfChatId(
		existingChat._id,
	);

	let attachments = [];

	existingMessages.forEach((message) => {
		if (message.attachments && message.attachments.length > 0) {
			attachments.push(message.attachments);
		}
	});

	attachments.forEach((attachment) => {
		attachment.forEach(({ localPath }) => {
			removeLocalFile(localPath);
		});
	});

	await messageRepo.deleteAllMessagesOfChatId(existingChat._id);

	existingChat.participants.forEach((participantId) => {
		if (participantId.toString() === currentUserId.toString()) return;

		emitSocketEvent(
			req,
			participantId.toString(),
			ChatEventEnum.LEAVE_CHAT_EVENT,
			existingChat,
		);
	});

	return new SuccessMsgResponse("chat deleted successfully").send(res);
});

export {
	searchAvailableusers,
	createOrGetExistingChat,
	getCurrentUserChats,
	createGroupChat,
	getGroupChatDetails,
	addNewUserToGroup,
	deleteChat,
};
