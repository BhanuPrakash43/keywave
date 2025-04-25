import { useRef, useState } from "react";
import { BsFillChatRightTextFill } from "../assets";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function LoginModal({ isOpen, onClose, onOpenRegister }) {
	const userIdRef = useRef();
	const passwordRef = useRef();
	const { login, authError } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		const user = {
			userId: userIdRef.current.value,
			password: passwordRef.current.value,
		};

		await login(user);
		setIsLoading(false);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
			<div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-lg shadow-2xl p-8 w-full max-w-md mx-4 relative">
				<button
					onClick={onClose}
					className="absolute top-4 right-5 text-gray-500 hover:text-black dark:hover:text-white text-3xl"
				>
					&times;
				</button>

				<h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
					Welcome Back 👋
				</h1>

				<form onSubmit={handleFormSubmit} className="space-y-4">
					<div>
						<label className="block mb-1 text-sm font-medium text-gray-700 dark:text-slate-300">
							Email or Username
						</label>
						<input
							type="text"
							placeholder="Enter your email or username"
							ref={userIdRef}
							required
							className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-backgroundDark1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
						/>
					</div>

					<div>
						<label className="block mb-1 text-sm font-medium text-gray-700 dark:text-slate-300">
							Password
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Enter your password"
								ref={passwordRef}
								required
								className="w-full px-4 py-2 pr-10 text-gray-900 dark:text-white bg-gray-100 dark:bg-backgroundDark1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
							>
								{showPassword ? (
									<AiOutlineEyeInvisible size={20} />
								) : (
									<AiOutlineEye size={20} />
								)}
							</button>
						</div>
					</div>

					{authError && (
						<p className="text-red-500 text-sm text-center">
							{authError}
						</p>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full py-2 text-white bg-indigo-600 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 transition cursor-pointer"
					>
						{isLoading ? "Signing in..." : "Sign In"}
					</button>
				</form>

				<p className="mt-5 text-center text-sm text-gray-600 dark:text-slate-400">
					Don’t have an account?{" "}
					<button
						onClick={() => {
							onClose();
							onOpenRegister();
						}}
						className="text-primary font-medium hover:underline"
					>
						Sign Up
					</button>
				</p>

				<p className="text-xs text-center mt-4 text-gray-400 dark:text-slate-500">
					Crafted with ☕ by Keywave Team
				</p>
			</div>
		</div>
	);
}

export default LoginModal;
