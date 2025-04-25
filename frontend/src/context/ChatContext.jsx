import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
} from "react";
import {
	deleteChat,
	deleteMessage,
	getAllcurrentUserChats,
	getChatMessages,
	sendMessage,
} from "../api";
import { requestHandler } from "../utils";
import { useSocket } from "./SocketContext";

const chatContext = createContext();

export const useChat = () => useContext(chatContext);

export const ChatProvider = ({ children }) => {
	const [isConnected, setIsConnected] = useState(false); 
	const [searchedUsers, setSearchedUsers] = useState(null); 
	const [openAddChat, setOpenAddChat] = useState(false); 
	const [newChatUser, setNewChatUser] = useState(null); 
	const [currentUserChats, setCurrentUserChats] = useState([]); 
	const [loadingChats, setLoadingChats] = useState(false); 
	const [loadingMessages, setLoadingMessages] = useState(false); 
	const [messages, setMessages] = useState([]); 
	const [message, setMessage] = useState("");
	const [attachments, setAttachments] = useState([]); 
	const [activeLeftSidebar, setActiveLeftSidebar] = useState("recentChats");

	const [isChatSelected, setIsChatSelected] = useState(false);

	// ref to maintain the current selected chat
	const currentSelectedChat = useRef();

	const { socket, socketEvents } = useSocket();

	// get the current user chats
	const getCurrentUserChats = () => {
		requestHandler(
			async () => getAllcurrentUserChats(),
			setLoadingChats,
			(res) => {
				const { data } = res;
				setCurrentUserChats(data || []);
			},
			alert,
		);
	};

	// function to get current selected chat messages
	const getMessages = (chatId) => {
		if (!chatId) return alert("no chat selected");

		if (!socket) return alert("socket connection not available");

		socket.emit(socketEvents.JOIN_CHAT_EVENT, chatId);

		requestHandler(
			async () => await getChatMessages(chatId),
			setLoadingMessages,
			(res) => {
				const { data } = res;
				setMessages(data || []);
			},
			alert,
		);
	};

	// update last message of the current selected chat with new message
	const updateLastMessageOfCurrentChat = (chatId, message) => {
		const updatedChat = currentUserChats?.find(
			(chat) => chat._id === chatId,
		);

		if (!updatedChat) return;

		updatedChat.lastMessage = message;
		updatedChat.updatedAt = message?.updatedAt;

		setCurrentUserChats((prevChats) =>
			prevChats.map((chat) => (chat._id === chatId ? updatedChat : chat)),
		);
	};

	// delete message
	const deleteChatMessage = async (messageId) => {
		setMessages((prevMsgs) =>
			prevMsgs.filter(
				(msg) => msg._id.toString() !== messageId.toString(),
			),
		);
		await requestHandler(
			async () => await deleteMessage(messageId),
			null,
			(res) => {},
			alert,
		);
	};

	const deleteUserChat = async (chatId) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this chat? This action cannot be undone",
			)
		)
			return;

		const currentSelectedChatId = currentSelectedChat.current?._id;
		currentSelectedChat.current = null;

		setCurrentUserChats((prevChats) =>
			prevChats.filter((chat) => chat._id !== currentSelectedChatId),
		);

		setMessages((prevMessages) =>
			prevMessages.filter(
				(message) => message.chat !== currentSelectedChatId,
			),
		);

		// request the server to delete the sected chat
		await requestHandler(
			async () => await deleteChat(chatId),
			null,
			(res) => {},
			alert,
		);
	};

	// send message
	const sendChatMessage = async () => {
		if (!socket || !currentSelectedChat.current?._id) return;

		await requestHandler(
			async () =>
				await sendMessage(
					currentSelectedChat.current?._id,
					message,
					attachments,
				),
			null,
			(res) => {
				setMessage("");
				setAttachments([]);
				setMessages((prevMsgs) => [...prevMsgs, res.data]);

				updateLastMessageOfCurrentChat(
					currentSelectedChat.current?._id,
					res.data,
				);
			},
			alert,
		);
	};

	// handle on message received event from server
	// ie when a new message is sent to the server and the server sends a event to participants of chat with current message

	const onMessageReceived = (message) => {
		if (currentSelectedChat.current?._id === message.chat) {
			setMessages((prevMsgs) => [...prevMsgs, message]);
		}
		// update the last message of the current chat
		updateLastMessageOfCurrentChat(message.chat, message);
	};
	const onMessageDeleted = useCallback(
		(payload) => {
			setMessages((prevMsgs) =>
				prevMsgs.filter(
					(msg) =>
						msg._id.toString() !== payload.messageId.toString(),
				),
			);
		},
		[messages, currentUserChats],
	);

	// handle removing file from attachments
	const removeFileFromAttachments = (index) => {
		setAttachments((prevAttachments) => [
			...prevAttachments.slice(0, index),
			...prevAttachments.slice(index + 1),
		]);
	};

	useEffect(() => {
		if (!socket) return;

		socket.on(socketEvents.CONNECTED_EVENT, () => setIsConnected(true));
		socket.on(socketEvents.DISCONNECT_EVENT, () => setIsConnected(false));
		socket.on(socketEvents.MESSAGE_RECEIVED_EVENT, onMessageReceived);
		socket.on(socketEvents.MESSAGE_DELETE_EVENT, onMessageDeleted);

		return () => {
			socket.off(socketEvents.CONNECTED_EVENT);
			socket.off(socketEvents.DISCONNECT_EVENT);
			socket.off(socketEvents.MESSAGE_RECEIVED_EVENT, onMessageReceived);
			socket.off(socketEvents.MESSAGE_DELETE_EVENT, onMessageDeleted);
		};
	}, [socket, onMessageReceived]);

	return (
		<chatContext.Provider
			value={{
				searchedUsers,
				setSearchedUsers,
				openAddChat,
				setOpenAddChat,
				newChatUser,
				setNewChatUser,
				currentUserChats,
				setCurrentUserChats,
				loadingChats,
				setLoadingChats,
				getCurrentUserChats,
				messages,
				setMessages,
				loadingMessages,
				getMessages,
				currentSelectedChat,
				message,
				setMessage,
				attachments,
				setAttachments,
				sendChatMessage,
				removeFileFromAttachments,
				activeLeftSidebar,
				setActiveLeftSidebar,
				deleteChatMessage,
				deleteUserChat,
				isChatSelected,
				setIsChatSelected,
			}}
		>
			{children}
		</chatContext.Provider>
	);
};
