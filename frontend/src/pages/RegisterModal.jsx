import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function RegisterModal({ isOpen, onClose, onOpenLogin }) {
	const emailRef = useRef();
	const usernameRef = useRef();
	const passwordRef = useRef();
	const confirmPasswordRef = useRef();

	const { register, authError } = useAuth();
	const navigate = useNavigate();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleFormSubmit = async (e) => {
		e.preventDefault();

		if (passwordRef.current.value !== confirmPasswordRef.current.value) {
			toast.error("Passwords do not match");
			return;
		}

		const user = {
			email: emailRef.current.value,
			username: usernameRef.current.value,
			password: passwordRef.current.value,
		};

		const success = await register(user);

		if (success) {
			toast.success("Account created successfully!");
			onClose();

			setTimeout(() => {
				onOpenLogin();
			}, 500);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
			<div className="bg-white bg-opacity-95 backdrop-blur-xl shadow-2xl rounded-lg mx-4 p-8 w-full max-w-md relative">
				<button
					onClick={onClose}
					className="absolute top-4 right-5 text-gray-500 hover:text-gray-900 text-3xl cursor-pointer"
				>
					&times;
				</button>

				<h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
					Create an Account ✨
				</h1>

				<form onSubmit={handleFormSubmit} className="space-y-5">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
							Email Address
						</label>
						<input
							type="email"
							id="email"
							placeholder="name@company.com"
							ref={emailRef}
							required
							className="w-full mt-1 px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
						/>
					</div>

					<div>
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700"
						>
							Username
						</label>
						<input
							type="text"
							id="username"
							placeholder="Enter your username"
							ref={usernameRef}
							required
							className="w-full mt-1 px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<div className="relative">
							<input
								type={showPassword ? "text" : "password"}
								id="password"
								placeholder="••••••••"
								ref={passwordRef}
								required
								className="w-full mt-1 px-4 py-2 pr-10 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
							>
								{showPassword ? (
									<AiOutlineEyeInvisible size={20} />
								) : (
									<AiOutlineEye size={20} />
								)}
							</button>
						</div>
					</div>

					<div>
						<label
							htmlFor="confirmPassword"
							className="block text-sm font-medium text-gray-700"
						>
							Confirm Password
						</label>
						<div className="relative">
							<input
								type={showConfirmPassword ? "text" : "password"}
								id="confirmPassword"
								placeholder="••••••••"
								ref={confirmPasswordRef}
								required
								className="w-full mt-1 px-4 py-2 pr-10 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
							/>
							<button
								type="button"
								onClick={() =>
									setShowConfirmPassword(!showConfirmPassword)
								}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
							>
								{showConfirmPassword ? (
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
						className="w-full py-2 text-white bg-indigo-600 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 transition cursor-pointer"
					>
						Sign Up
					</button>
				</form>

				<p className="mt-5 text-center text-gray-600 text-sm">
					Already have an account?{" "}
					<button
						onClick={() => {
							onClose();
							onOpenLogin();
						}}
						className="text-indigo-500 font-medium hover:underline cursor-pointer"
					>
						Sign In
					</button>
				</p>
				<p className="text-xs text-center mt-4 text-gray-400 dark:text-slate-500">
					Crafted with ☕ by Keywave Team
				</p>
			</div>
		</div>
	);
}

export default RegisterModal;
