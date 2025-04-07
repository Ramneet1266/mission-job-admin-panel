import { FaBell, FaUserCircle } from "react-icons/fa"

export default function Topbar() {
	return (
		<header className="w-full bg-white shadow-sm px-4 sm:px-6 py-4 flex items-center justify-between">
			{/* Title hidden on small screens */}
			<h1 className="hidden sm:block text-lg font-semibold text-gray-800">
				Welcome back 👋
			</h1>

			<div className="flex items-center gap-3 sm:gap-4 ml-auto">
				<button
					aria-label="Notifications"
					className="text-gray-600 hover:text-blue-600 transition"
				>
					<FaBell className="h-5 w-5" />
				</button>
				<button
					aria-label="User Profile"
					className="text-gray-600 hover:text-blue-600 transition"
				>
					<FaUserCircle className="h-6 w-6" />
				</button>
			</div>
		</header>
	)
}
