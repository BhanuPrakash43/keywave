import express from "express";
import cors from "cors";
import { corsUrl, environment } from "./config.js";
import authRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import {
	ApiError,
	ErrorType,
	InternalError,
	RateLimitError,
} from "./core/ApiError.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { initSocketIo } from "./socket/index.js";
import path from "path";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";
import { fileURLToPath } from "url";
import { dirname } from "path";
import "./database/index.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// middleware to get the IP of client from the request
app.use(requestIp.mw());

// rate limiter
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, 
	max: 200,
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req, res) => {
		return requestIp.getClientIp(req) || "";
	},
	handler: (req, res, next, options) => {
		next(
			new RateLimitError(
				`You exceeded the request limit. Allowed ${
					options.max
				} requests per ${options.windowMs / 60000} minute.`,
			),
		);
	},
});

app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
	cors({
		origin: corsUrl,
		optionsSuccessStatus: 200,
		credentials: true,
	}),
);
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/health", (req, res) => {
	res.send("healthy running");
});

app.use("/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);

app.use("/public", express.static(path.join(__dirname, "..", "public")));

// socket.io server
const io = new SocketServer(httpServer, {
	pingTimeout: 60000,
	cors: {
		origin: corsUrl,
		credentials: true,
	},
});

initSocketIo(io);
app.set("io", io);

// error handling
app.use((err, req, res, next) => {
	if (err instanceof ApiError) {
		ApiError.handle(err, res);
		if (err.type === ErrorType.INTERNAL) {
			console.error(
				`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}\nError Stack: ${err.stack}`,
			);
		}
	} else {
		console.error(
			`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}\nError Stack: ${err.stack}`,
		);
		if (environment === "development") {
			return res.status(500).send(err.stack);
		}
		ApiError.handle(new InternalError(), res);
	}
});

export default httpServer;
