import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isValidJSON, requestHandler } from "../utils";
import { loginUser, logoutUser, registerUser } from "../api";

const AuthContext = createContext({});

// create a hook to access the AuthContext
const useAuth = () => useContext(AuthContext);

// create a component that will handle authentication related functions
const AuthProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState(
		isValidJSON(localStorage.getItem("user"))
			? JSON.parse(localStorage.getItem("user"))
			: null,
	);
	const [token, setToken] = useState(
		isValidJSON(localStorage.getItem("token"))
			? JSON.parse(localStorage.getItem("token"))
			: null,
	);
	const [authMessage, setAuthMessage] = useState(null);
	const [authError, setAuthError] = useState(null);

	const navigate = useNavigate();

	// handle user login
	const login = async (data) => {
		await requestHandler(
			() => loginUser(data),
			setIsLoading,
			(res) => {
				const { data } = res;
				setUser(data.user); 
				setToken(data.tokens.accessToken);
				localStorage.setItem("user", JSON.stringify(data.user));
				localStorage.setItem(
					"token",
					JSON.stringify(data.tokens.accessToken),
				);
				navigate("/chat");
			},

			setAuthError,
		);
	};

	const register = async (data) => {
		let isSuccess = false;

		await requestHandler(
			() => registerUser(data),
			setIsLoading,
			() => {
				setAuthMessage("Registration successful");
				isSuccess = true;
			},
			setAuthError,
		);

		return isSuccess;
	};

	// handle user logout
	const logout = async () => {
		await requestHandler(
			() => logoutUser(),
			setIsLoading,
			() => {
				setUser(null);
				setToken(null);
				localStorage.clear();
				navigate("/home");
			},
			setAuthError,
		);
	};

	// Clear authError after 10 seconds
	useEffect(() => {
		if (authError) {
			const timer = setTimeout(() => {
				setAuthError(null);
			}, 2000); // 2 seconds

			return () => clearTimeout(timer);
		}
	}, [authError]);

	// provide the authentication related data function through context
	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				login,
				register,
				logout,
				isLoading,
				authMessage,
				authError,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, useAuth, AuthProvider };
