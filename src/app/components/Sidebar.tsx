"use client"
import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
	FaImage,
	FaVideo,
	FaInfoCircle,
	FaNewspaper,
	FaSignOutAlt,
	FaChevronLeft,
	FaChevronRight,
	FaBriefcase,
	FaUsers,
	FaUpload,
} from "react-icons/fa"
import { BiCategoryAlt } from "react-icons/bi"
import { signOut } from "firebase/auth"
import { auth } from "../lib/firebase"

export default function Sidebar() {
	const [isCollapsed, setIsCollapsed] = useState(false)
	const pathname = usePathname()

	const navItems = [
		{ icon: <FaImage />, label: "Images", href: "/dashboard/Images" },
		{ icon: <FaVideo />, label: "Videos", href: "/dashboard/Videos" },
		{
			icon: <FaInfoCircle />,
			label: "Information",
			href: "/dashboard/Information",
		},
		{ icon: <FaNewspaper />, label: "News", href: "/dashboard/News" },
		{
			icon: <FaBriefcase />,
			label: "Job Posting",
			href: "/dashboard/Jobposting",
		},
		{
			icon: <BiCategoryAlt />,
			label: "Category",
			href: "/dashboard/Category",
		},
		{
			icon: <FaUsers />,
			label: "Users",
			href: "/dashboard/Users",
		},
		{
			icon: <FaUpload />,
			label: "Upload Data",
			href: "/dashboard/UploadData",
		},
	]

	const handleLogout = async () => {
		try {
			await signOut(auth)
			document.cookie =
				"user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
			window.location.href = "/"
		} catch (error) {
			console.error("Logout failed:", error)
		}
	}

	return (
		<div
			className={`h-screen ${
				isCollapsed ? "w-20" : "w-64"
			} bg-white text-black flex flex-col transition-all duration-300 relative shadow-md`}
		>
			{/* Toggle Button */}
			<button
				onClick={() => setIsCollapsed(!isCollapsed)}
				className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-200 border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-300 transition"
			>
				{isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
			</button>

			{/* Header */}
			<Link href={"/dashboard"}>
				<div className="p-6 border-b border-gray-200">
					<span
						className={`text-2xl font-bold transition-opacity duration-300 ${
							isCollapsed ? "opacity-0" : "opacity-100"
						}`}
					>
						Dashboard
					</span>
				</div>
			</Link>

			{/* Nav Links */}
			<div className="flex-1 p-4 space-y-3">
				{navItems.map((item, index) => {
					const isActive = pathname === item.href
					return (
						<Link
							key={index}
							href={item.href}
							className={`group flex items-center px-4 py-2 rounded-lg transition-all duration-300 border-l-4 ${
								isActive
									? "border-black bg-gray-200 text-black"
									: "border-transparent hover:border-black hover:bg-gray-100"
							}`}
						>
							<span
								className={`text-lg min-w-[20px] transition-colors duration-300 ${
									isActive
										? "text-black"
										: "text-gray-700 group-hover:text-black"
								}`}
							>
								{item.icon}
							</span>
							<span
								className={`ml-3 whitespace-nowrap transition-all duration-300 origin-left ${
									isCollapsed
										? "opacity-0 w-0 overflow-hidden"
										: "opacity-100 w-auto"
								}`}
							>
								{item.label}
							</span>
						</Link>
					)
				})}
			</div>

			{/* Logout */}
			<div className="p-4 border-t border-gray-200">
				<Link
					href="#"
					className="group flex items-center px-4 py-2 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-black hover:bg-red-50"
				>
					<span className="text-lg min-w-[20px] text-gray-700 group-hover:text-red-500 transition-colors duration-300">
						<FaSignOutAlt />
					</span>
					<button
						onClick={handleLogout}
						className={`ml-3 whitespace-nowrap transition-all duration-300 origin-left ${
							isCollapsed
								? "opacity-0 w-0 overflow-hidden"
								: "opacity-100 w-auto"
						}`}
					>
						Logout
					</button>
				</Link>
			</div>
		</div>
	)
}