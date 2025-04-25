import { useState } from "react";
import Navbar from "../components/Navbar";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

function Home() {
	const [isLoginOpen, setLoginOpen] = useState(false);
	const [isRegisterOpen, setRegisterOpen] = useState(false);

	return (
		<>
			<Navbar />

			<div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
				<h1 className="text-6xl font-extrabold text-indigo-600 drop-shadow-md">
					Welcome To KeyWave 🔑🌊
				</h1>
				<p className="text-2xl text-gray-700 mt-4 max-w-2xl">
					Secure, private, and effortless messaging.
					<br />
					Your conversations, encrypted—forever.
				</p>
				<button
					onClick={() => setLoginOpen(true)}
					className="mt-6 px-12 py-4 text-xl font-semibold text-white bg-indigo-600 rounded-full shadow-lg transform hover:scale-105 hover:bg-indigo-700 transition-all duration-300 cursor-pointer"
				>
					Start Chatting 🚀
				</button>
				<p className="mt-4 text-gray-500 text-lg">
					Log in to unlock secure messaging.
				</p>
			</div>

			<LoginModal
				isOpen={isLoginOpen}
				onClose={() => setLoginOpen(false)}
				onOpenRegister={() => {
					setLoginOpen(false);
					setRegisterOpen(true);
				}}
			/>

			<RegisterModal
				isOpen={isRegisterOpen}
				onClose={() => setRegisterOpen(false)}
				onOpenLogin={() => {
					setRegisterOpen(false);
					setLoginOpen(true);
				}}
			/>
		</>
	);
}

export default Home;
