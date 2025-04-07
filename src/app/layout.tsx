// app/layout.tsx or app/RootLayout.tsx (Next.js App Router)
"use client"

import { usePathname } from "next/navigation"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"
import "./globals.css"

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const isHomePage = pathname === "/"

	return (
		<html lang="en">
			<body>
				{isHomePage ? (
					// Render children without Sidebar and Topbar
					<div>{children}</div>
				) : (
					// Normal layout with Sidebar and Topbar
					<div className="flex h-screen bg-gray-100">
						<Sidebar />
						<div className="flex-1 flex flex-col">
							<Topbar />
							<main className="p-4 overflow-y-auto">{children}</main>
						</div>
					</div>
				)}
			</body>
		</html>
	)
}
