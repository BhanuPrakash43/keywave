import cookie from "cookie";
import { ChatEventEnum } from "../constants/index.js";
import { BadTokenError } from "../core/ApiError.js";
import JWT from "../core/JWT.js";
import userRepo from "../database/repositories/userRepo.js";
import colorsUtils from "../helpers/colorsUtils.js";
import { Types } from "mongoose";

// handles the join chat event ie; when a user joins a room
const mountJoinChatEvent = (socket) => {
	socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
		colorsUtils.log("info", "user joined a chat room. chatId: " + chatId);
		socket.join(chatId); // join the user to a chat between or group chat
	});
};

// handle the start Typing event
const mountStartTypingEvent = (socket) => {
	socket.on(ChatEventEnum.START_TYPING_EVENT, (chatId) => {
		socket.in(chatId).emit(ChatEventEnum.START_TYPING_EVENT, chatId);
	});
};

// handle the stop Typing event
const mountStopTypingEvent = (socket) => {
	socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
		socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
	});
};

// function to initialize the socket io
const initSocketIo = (io) => {
	io.on("connection", async (socket) => {
		try {
			// get the token from the cookies or the handshake auth header
			const cookies = cookie.parse(
				socket.handshake.headers?.cookie || "",
			);
			let token = cookies?.accessToken || socket.handshake.auth?.token;

			// throw an error if the token is not found
			if (!token) {
				throw new BadTokenError("Token not found");
			}

			// decode the token
			const decodedToken = await JWT.validateToken(token);

			// get user info
			const userId = new Types.ObjectId(decodedToken.sub);
			const user = await userRepo.findById(userId);

			if (!user) {
				throw new BadTokenError("Invalid token");
			}

			socket.user = user;
			socket.join(user._id.toString());
			socket.emit(ChatEventEnum.CONNECTED_EVENT);
			colorsUtils.log(
				"info",
				"🤝 User connected. userId: " + user._id.toString(),
			);

			mountJoinChatEvent(socket);
			mountStartTypingEvent(socket);
			mountStopTypingEvent(socket);

			// disconnect event
			socket.on(ChatEventEnum.DISCONNECTED_EVENT, () => {
				if (socket.user?._id) {
					socket.leave(socket.user._id.toString());
				}
			});
		} catch (error) {
			socket.emit(
				ChatEventEnum.SOCKET_ERROR_EVENT,
				"Something went wrong while connecting to socket",
			);
		}
	});
};

const emitSocketEvent = (req, roomId, event, payload) => {
	const io = req.app.get("io");
	io.in(roomId).emit(event, payload);
};

export { initSocketIo, emitSocketEvent };
