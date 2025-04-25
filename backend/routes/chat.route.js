import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
	addNewUserToGroup,
	createGroupChat,
	createOrGetExistingChat,
	deleteChat,
	getCurrentUserChats,
	getGroupChatDetails,
	searchAvailableusers,
} from "../controllers/chat.controller.js";
import { mongoIdPathValidator } from "../validators/mongoId.validator.js";
import { validate } from "../validators/validate.js";
import {
	createGroupChatValidator,
	updateGroupChatValidator,
} from "../validators/groupChat.validator.js";

const router = Router();

router.use(verifyJWT);

router.route("/users").get(searchAvailableusers);

router
	.route("/c/:receiverId")
	.post(
		mongoIdPathValidator("receiverId"),
		validate,
		createOrGetExistingChat,
	);

router
	.route("/group")
	.post(createGroupChatValidator(), validate, createGroupChat);

router
	.route("/group/:chatId")
	.get(mongoIdPathValidator("chatId"), validate, getGroupChatDetails)
	.put(updateGroupChatValidator(), validate, addNewUserToGroup);

router.route("/").get(getCurrentUserChats);

router
	.route("/:chatId")
	.delete(mongoIdPathValidator("chatId"), validate, deleteChat);

export default router;
