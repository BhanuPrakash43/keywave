import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ThemeContextWrapper from "./context/ThemeContextWrapper.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<Toaster />
			<ThemeContextWrapper>
				<AuthProvider>
					<App />
				</AuthProvider>
			</ThemeContextWrapper>
		</BrowserRouter>
	</React.StrictMode>,
);
