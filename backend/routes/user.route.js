import express from "express";
import { login, logout, signUp } from "../controllers/user.controller.js";
import {
	userLoginValidator,
	userRegisterValidator,
} from "../validators/user.validator.js";
import { validate } from "../validators/validate.js";

const router = express.Router();

router.post("/register", userRegisterValidator(), validate, signUp);
router.post("/login", userLoginValidator(), validate, login);
router.post("/logout", logout);

export default router;
