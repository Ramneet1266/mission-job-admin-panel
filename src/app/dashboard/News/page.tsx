"use client"
import {
	Search,
	Plus,
	ArrowRightLeft,
	Pencil,
	Trash2,
	X,
} from "lucide-react"
import { useState } from "react"
import ImageForm from "../../components/ImageForm"

export default function page() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isClosing, setIsClosing] = useState(false)

	const openModal = () => {
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsClosing(true)
		setTimeout(() => {
			setIsModalOpen(false)
			setIsClosing(false)
		}, 300) // match with animation duration
	}

	return (
		<div className="p-6 bg-gray-100 min-h-screen font-sans">
			{/* Top Header */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-black">News</h1>

				<button
					onClick={() => setIsModalOpen(true)}
					className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-800 transition cursor-pointer"
				>
					<Plus size={16} />
					Create New
				</button>
			</div>

			{/* Search & Filters */}
			<div className="bg-white rounded-2xl shadow-md p-4 mb-6">
				<div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 items-center">
					<div className="col-span-2">
						<label className="text-sm text-gray-500">
							What are you looking for?
						</label>
						<input
							type="text"
							placeholder="Search for category, name, company, etc"
							className="w-full mt-1 px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
						/>
					</div>
					<div>
						<label className="text-sm text-gray-500">Category</label>
						<select className="w-full mt-1 px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black">
							<option>All</option>
							<option>Pending</option>
							<option>Shipped</option>
						</select>
					</div>
					<div className="flex gap-2 items-end">
						<div className="flex-1">
							<label className="text-sm text-gray-500">Status</label>
							<select className="w-full mt-1 px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black">
								<option>All</option>
								<option>Active</option>
								<option>Cancelled</option>
							</select>
						</div>
						<button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full mt-auto shadow-sm transition flex items-center gap-1">
							<Search size={16} />
							Search
						</button>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white shadow-md rounded-2xl overflow-x-auto">
				<table className="min-w-full text-sm text-left">
					<thead className="bg-gray-50">
						<tr className="text-gray-600 uppercase">
							<th className="px-4 py-3">ID</th>
							<th className="px-4 py-3">Shopify #</th>
							<th className="px-4 py-3">Date</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3">Customer</th>
							<th className="px-4 py-3">Email</th>
							<th className="px-4 py-3">Country</th>
							<th className="px-4 py-3">Shipping</th>
							<th className="px-4 py-3">Source</th>
							<th className="px-4 py-3">Order Type</th>
							<th className="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{[1, 2, 3, 4, 5].map((item, i) => (
							<tr
								key={i}
								className={`${
									i % 2 === 0 ? "bg-white" : "bg-gray-50"
								} hover:bg-gray-100 transition`}
							>
								<td className="px-4 py-3">10776{i}</td>
								<td className="px-4 py-3">17713</td>
								<td className="px-4 py-3">22 Jan 2020</td>
								<td className="px-4 py-3">Pending</td>
								<td className="px-4 py-3">Ahmed</td>
								<td className="px-4 py-3">ahmed.123@mail.com</td>
								<td className="px-4 py-3">Australia</td>
								<td className="px-4 py-3">Australia Post Api</td>
								<td className="px-4 py-3">ShopifyAU</td>
								<td className="px-4 py-3">Customer</td>
								<td className="px-4 py-3">
									<div className="flex gap-2">
										<button className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-gray-800 transition shadow">
											<Pencil size={14} className="mr-1" />
											Edit
										</button>
										<button className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-red-700 transition shadow">
											<Trash2 size={14} className="mr-1" />
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex justify-end mt-4 items-center gap-2">
				<button className="text-gray-500 text-sm px-3 py-1 rounded hover:text-black">
					1
				</button>
				<button className="text-gray-500 text-sm px-3 py-1 rounded hover:text-black">
					2
				</button>
				<button className="bg-black text-white text-sm px-3 py-1 rounded-full">
					3
				</button>
				<button className="text-gray-500 text-sm px-3 py-1 rounded hover:text-black">
					10
				</button>
			</div>
			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Overlay */}
					<div
						className="absolute inset-0 bg-black/30 backdrop-blur-sm"
						onClick={closeModal}
					/>

					{/* Modal Box */}
					<div
						className={`relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10 transition-all ${
							isClosing ? "animate-modal-out" : "animate-modal-pop"
						}`}
					>
						<button
							onClick={closeModal}
							className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-black"
						>
							<X size={20} />
						</button>

						<h2 className="text-xl font-bold mb-4">Upload News</h2>

						<form className="space-y-4">
							<div>
								<label className="text-sm font-medium">Title</label>
								<input
									type="text"
									className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
								/>
							</div>
							<div>
								<label className="text-sm font-medium">
									Information
								</label>
								<textarea className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" />
							</div>
							<div>
								<label className="text-sm font-medium">
									Upload Image
								</label>
								<input
									type="file"
									accept="image/*"
									className="mb-4 w-full border p-2 rounded"
									required
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
							>
								Submit
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
