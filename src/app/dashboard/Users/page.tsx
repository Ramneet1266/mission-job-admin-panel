"use client"
import { useState, useEffect } from "react"
import { db } from "../../lib/firebase"
import { collection, onSnapshot } from "firebase/firestore"

interface User {
	id: string
	name: string
	email: string
	phone: string
	fileUrl: string | null
}

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([])

	useEffect(() => {
		// Fetch users
		const unsubscribeUsers = onSnapshot(
			collection(db, "users"),
			(snapshot) => {
				const userData = snapshot.docs.map((doc) => ({
					id: doc.id,
					name: doc.data().name || "",
					email: doc.data().email || "",
					phone: doc.data().phone || "",
					fileUrl: doc.data().fileUrl || null,
				})) as User[]
				setUsers(userData)
			},
			(error) => {
				console.error("Fetch Error for users:", error.message)
				alert(`Failed to fetch users: ${error.message}`)
			}
		)

		return () => unsubscribeUsers()
	}, [])

	return (
		<div className="p-6 bg-gray-100 min-h-screen font-sans">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-black">
					Registered Users
				</h1>
			</div>

			<div className="bg-white shadow-md rounded-2xl overflow-x-auto">
				<table className="min-w-full text-sm text-left">
					<thead className="bg-gray-50">
						<tr className="text-gray-600 uppercase">
							<th className="px-4 py-3">Name</th>
							<th className="px-4 py-3">Email</th>
							<th className="px-4 py-3">Phone</th>
							<th className="px-4 py-3">Uploaded File</th>
						</tr>
					</thead>
					<tbody>
						{users.length > 0 ? (
							users.map((user) => (
								<tr
									key={user.id}
									className="hover:bg-gray-100 transition"
								>
									<td className="px-4 py-3">{user.name}</td>
									<td className="px-4 py-3">{user.email}</td>
									<td className="px-4 py-3">{user.phone}</td>
									<td className="px-4 py-3">
										{user.fileUrl ? (
											<a
												href={user.fileUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline"
											>
												View File
											</a>
										) : (
											<span className="text-gray-500">
												No file uploaded
											</span>
										)}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={4} className="px-4 py-3 text-center">
									No users found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
