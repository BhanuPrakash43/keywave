import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import LoginModal from "../pages/LoginModal";
import RegisterModal from "../pages/RegisterModal";

function Navbar() {
	const [isLoginOpen, setLoginOpen] = useState(false);
	const [isRegisterOpen, setRegisterOpen] = useState(false);
	const [mobileMenu, setMobileMenu] = useState(false);

	return (
		<>
			<nav className="bg-gradient-to-r from-teal-800 via-gray-800 to-charcoal-800 text-white px-6 py-5 sm:py-3 md:py-3 shadow-xl fixed top-0 w-full z-50">
				<div className="w-full max-w-[1400px] mx-auto flex justify-between items-center">
					<Link
						to="/home"
						className="text-4xl py-1 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-500 tracking-wide hover:text-gray-200 transition-all duration-300 ease-in-out"
					>
						KeyWave
					</Link>

					<div className="flex items-center space-x-6">
						<button
							className="block md:hidden px-6 py-2 mx-2 text-black font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-cyan-500/50 border border-cyan-400 relative overflow-hidden"
							onClick={() => setLoginOpen(true)}
						>
							<span className="absolute inset-0 bg-white opacity-10 rounded-lg"></span>
							🚀 Sign In
						</button>

						<button
							className="hidden md:block mt-2 cursor-pointer"
							onClick={() => setMobileMenu(!mobileMenu)}
						>
							<GiHamburgerMenu className="text-3xl text-black" />
						</button>
					</div>
				</div>

				{mobileMenu && (
					<div className="absolute top-full right-4 mt-2 w-40 bg-white shadow-md rounded-lg p-3 hidden md:block z-50">
						<button
							className="w-full text-black font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all duration-300"
							onClick={() => {
								setLoginOpen(true);
								setMobileMenu(false);
							}}
						>
							🚀 Sign In
						</button>
					</div>
				)}
			</nav>

			<LoginModal
				isOpen={isLoginOpen}
				onClose={() => setLoginOpen(false)}
				onOpenRegister={() => setRegisterOpen(true)}
			/>

			<RegisterModal
				isOpen={isRegisterOpen}
				onClose={() => setRegisterOpen(false)}
				onOpenLogin={() => setLoginOpen(true)}
			/>
		</>
	);
}

export default Navbar;
