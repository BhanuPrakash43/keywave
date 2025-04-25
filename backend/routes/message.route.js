import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { mongoIdPathValidator } from "../validators/mongoId.validator.js";
import { validate } from "../validators/validate.js";
import {
	deleteMessage,
	getAllMessages,
	sendMessage,
} from "../controllers/message.controller.js";
import { messagesValidator } from "../validators/messages.validator.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router
	.route("/:chatId")
	.get(mongoIdPathValidator("chatId"), validate, getAllMessages)
	.post(
		mongoIdPathValidator("chatId"),
		messagesValidator(),
		validate,
		upload.fields([{ name: "attachments", maxCount: 5 }]),
		sendMessage,
	);

router
	.route("/:messageId")
	.delete(mongoIdPathValidator("messageId"), validate, deleteMessage);

export default router;
