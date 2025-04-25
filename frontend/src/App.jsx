import Chat from "./pages/Chat";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { SocketProvider } from "./context/SocketContext";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import WebRtcContextProvider from "./context/WebRtcContext";
import Home from "./pages/Home";

function App() {
	const { token, user } = useAuth();

	return (
		<div className="App">
			<Routes>
				<Route
					path="/"
					element={
						token && user?._id ? (
							<Navigate to="/chat" />
						) : (
							<Navigate to="/home" />
						)
					}
				></Route>

				<Route
					exact
					path="/home"
					element={
						<PublicRoute>
							<Home />
						</PublicRoute>
					}
				/>
				<Route
					path="/chat"
					element={
						<PrivateRoute>
							<SocketProvider>
								<ChatProvider>
									<WebRtcContextProvider>
										<Chat />
									</WebRtcContextProvider>
								</ChatProvider>
							</SocketProvider>
						</PrivateRoute>
					}
				/>
			</Routes>
		</div>
	);
}

export default App;
