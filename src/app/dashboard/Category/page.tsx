"use client"
import { Search, Plus, Pencil, Trash2, X } from "lucide-react"
import { useState, useEffect } from "react"
import { db } from "../../lib/firebase"
import {
	collection,
	onSnapshot,
	deleteDoc,
	doc,
	addDoc,
	updateDoc,
} from "firebase/firestore"
import {
	getStorage,
	ref,
	uploadBytes,
	getDownloadURL,
} from "firebase/storage"

interface Category {
	id: string
	title: string
	information?: string
	createdAt: string
}

interface JobPosting {
	id: string
	jobTitle: string
	jobDescription: string
	salary: string
	address: string
	city: string
	postalCode: string
	state: string
	contactNumber: string
	category: string
	contactEmail: string
	jobCompany: string
	imageUrl: string
	createdAt: string
	tags: string[]
	date: string // New field
	status: string // New field
}

interface Tag {
	id: string
	tag: string
	createdAt: string
}

export default function Page() {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [isTagsModalOpen, setIsTagsModalOpen] =
		useState<boolean>(false)
	const [isJobModalOpen, setIsJobModalOpen] = useState<boolean>(false)
	const [isClosing, setIsClosing] = useState<boolean>(false)
	const [categories, setCategories] = useState<Category[]>([])
	const [searchTerm, setSearchTerm] = useState<string>("")
	const [editCategory, setEditCategory] = useState<Category | null>(
		null
	)
	const [selectedCategory, setSelectedCategory] =
		useState<Category | null>(null)
	const [formData, setFormData] = useState({
		title: "",
		information: "",
	})
	const [tagsData, setTagsData] = useState({ tag: "" })
	const [jobData, setJobData] = useState({
		jobTitle: "",
		jobDescription: "",
		salary: "",
		address: "",
		city: "",
		postalCode: "",
		state: "",
		contactNumber: "",
		contactEmail: "",
		jobCompany: "",
		imageUrl: "",
		tags: [] as string[],
		date: "", // New field
		status: "Active", // New field with default value
	})
	const [jobImageFile, setJobImageFile] = useState<File | null>(null)
	const [categoryTags, setCategoryTags] = useState<Tag[]>([])

	const storage = getStorage()

	const openModal = () => {
		setEditCategory(null)
		setFormData({ title: "", information: "" })
		setIsModalOpen(true)
	}

	const openEditModal = (category: Category) => {
		setEditCategory(category)
		setFormData({
			title: category.title,
			information: category.information || "",
		})
		setIsModalOpen(true)
	}

	const openTagsModal = (category: Category) => {
		setSelectedCategory(category)
		setTagsData({ tag: "" })
		setIsTagsModalOpen(true)
	}

	const openJobModal = (category: Category) => {
		setSelectedCategory(category)
		setJobData({
			jobTitle: "",
			jobDescription: "",
			salary: "",
			address: "",
			city: "",
			postalCode: "",
			state: "",
			contactNumber: "",
			contactEmail: "",
			jobCompany: "",
			imageUrl: "",
			tags: [],
			date: "", // Initialize new field
			status: "Active", // Initialize new field
		})
		setJobImageFile(null)
		const tagsUnsubscribe = onSnapshot(
			collection(db, "categories", category.id, "tags"),
			(snapshot) => {
				const tagsData: Tag[] = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Tag[]
				setCategoryTags(tagsData)
			},
			(error) => {
				console.error("Error fetching tags:", error.message)
			}
		)
		setIsJobModalOpen(true)
		return () => tagsUnsubscribe()
	}

	const closeModal = () => {
		setIsClosing(true)
		setTimeout(() => {
			setIsModalOpen(false)
			setIsTagsModalOpen(false)
			setIsJobModalOpen(false)
			setIsClosing(false)
			setEditCategory(null)
			setSelectedCategory(null)
			setCategoryTags([])
		}, 300)
	}

	useEffect(() => {
		const unsubscribe = onSnapshot(
			collection(db, "categories"),
			(snapshot) => {
				const categoryData: Category[] = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Category[]
				console.log("Real-time categories:", categoryData)
				setCategories(categoryData)
			},
			(error: unknown) => {
				const errorMessage =
					error instanceof Error ? error.message : String(error)
				console.error("Error fetching categories:", error)
				alert(`Failed to fetch categories: ${errorMessage}`)
			}
		)
		return () => unsubscribe()
	}, [])

	const handleDelete = async (id: string) => {
		try {
			await deleteDoc(doc(db, "categories", id))
			console.log("Category deleted successfully:", id)
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("Error deleting category:", error)
			alert(`Failed to delete category: ${errorMessage}`)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			if (editCategory) {
				await updateDoc(doc(db, "categories", editCategory.id), {
					...formData,
					createdAt: editCategory.createdAt,
				})
				console.log("Category updated successfully:", editCategory.id)
			} else {
				await addDoc(collection(db, "categories"), {
					...formData,
					createdAt: new Date().toISOString(),
				})
				console.log("Category added successfully")
			}
			closeModal()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("Error saving category:", error)
			alert(`Failed to save category: ${errorMessage}`)
		}
	}

	const handleTagsSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedCategory) return
		try {
			await addDoc(
				collection(db, "categories", selectedCategory.id, "tags"),
				{
					tag: tagsData.tag,
					createdAt: new Date().toISOString(),
				}
			)
			console.log(
				"Tag added successfully for category:",
				selectedCategory.id
			)
			closeModal()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("Error saving tag:", error)
			alert(`Failed to save tag: ${errorMessage}`)
		}
	}

	const handleJobSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedCategory) return
		try {
			let imageUrl = jobData.imageUrl

			if (jobImageFile) {
				const storageRef = ref(
					storage,
					`jobImages/${jobImageFile.name}`
				)
				await uploadBytes(storageRef, jobImageFile)
				imageUrl = await getDownloadURL(storageRef)
				console.log("Job image uploaded, URL:", imageUrl)
			}

			if (!imageUrl) throw new Error("No image uploaded")

			await addDoc(
				collection(db, "categories", selectedCategory.id, "posting"),
				{
					jobTitle: jobData.jobTitle,
					jobDescription: jobData.jobDescription,
					salary: jobData.salary,
					address: jobData.address,
					city: jobData.city,
					postalCode: jobData.postalCode,
					state: jobData.state,
					contactNumber: jobData.contactNumber,
					category: selectedCategory.title,
					contactEmail: jobData.contactEmail,
					jobCompany: jobData.jobCompany,
					imageUrl: imageUrl,
					tags: jobData.tags,
					createdAt: new Date().toISOString(),
					date: jobData.date, // New field
					status: jobData.status, // New field
				}
			)
			console.log(
				"Job posting added successfully for category:",
				selectedCategory.id
			)
			closeModal()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			console.error("Error saving job posting:", error)
			alert(`Failed to save job posting: ${errorMessage}`)
		}
	}

	const filteredCategories = categories.filter((cat) =>
		cat.title.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<div className="p-6 bg-gray-100 min-h-screen font-sans">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-black">Categories</h1>
				<button
					onClick={openModal}
					className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-800 transition cursor-pointer"
				>
					<Plus size={16} />
					Create New
				</button>
			</div>

			<div className="bg-white rounded-2xl shadow-md p-4 mb-6">
				<div className="flex gap-4 items-center">
					<input
						type="text"
						placeholder="Search categories by title..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="flex-1 px-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
					/>
					<button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full shadow-sm transition flex items-center gap-1">
						<Search size={16} />
						Search
					</button>
				</div>
			</div>

			<div className="bg-white shadow-md rounded-2xl overflow-x-auto">
				<table className="min-w-full text-sm text-left">
					<thead className="bg-gray-50">
						<tr className="text-gray-600 uppercase">
							<th className="px-4 py-3">Title</th>
							<th className="px-4 py-3">Information</th>
							<th className="px-4 py-3">Tags</th>
							<th className="px-4 py-3">Job Postings</th>
							<th className="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredCategories.length > 0 ? (
							filteredCategories.map((cat) => (
								<tr
									key={cat.id}
									className="hover:bg-gray-100 transition"
								>
									<td className="px-4 py-3">{cat.title}</td>
									<td className="px-4 py-3">
										{cat.information || "N/A"}
									</td>
									<td className="px-4 py-3">
										<button
											onClick={() => openTagsModal(cat)}
											className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-gray-800 transition shadow"
										>
											<Plus size={14} className="mr-1" />
											Add Tags
										</button>
									</td>
									<td className="px-4 py-3">
										<button
											onClick={() => openJobModal(cat)}
											className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-gray-800 transition shadow"
										>
											<Plus size={14} className="mr-1" />
											Add Job Posting
										</button>
									</td>
									<td className="px-4 py-3">
										<div className="flex gap-2">
											<button
												onClick={() => openEditModal(cat)}
												className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-gray-800 transition shadow"
											>
												<Pencil size={14} className="mr-1" />
												Edit
											</button>
											<button
												onClick={() => handleDelete(cat.id)}
												className="flex items-center px-2 py-1 text-xs font-medium bg-black text-white rounded-full hover:bg-red-700 transition shadow"
											>
												<Trash2 size={14} className="mr-1" />
												Delete
											</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={5} className="px-4 py-3 text-center">
									No categories found. Click "Create New" to add one.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Category Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/30 backdrop-blur-sm"
						onClick={closeModal}
					/>
					<div
						className={`relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10 transition-all ${
							isClosing ? "animate-modal-out" : "animate-modal-pop"
						}`}
					>
						<button
							className="absolute top-2 right-2 text-gray-400 hover:text-black transition"
							onClick={closeModal}
						>
							<X />
						</button>
						<h2 className="text-xl font-semibold mb-4">
							{editCategory ? "Edit Category" : "Add New Category"}
						</h2>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Category Title
								</label>
								<input
									type="text"
									value={formData.title}
									onChange={(e) =>
										setFormData({
											...formData,
											title: e.target.value,
										})
									}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
									placeholder="Enter category title"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Information
								</label>
								<textarea
									value={formData.information}
									onChange={(e) =>
										setFormData({
											...formData,
											information: e.target.value,
										})
									}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
									placeholder="Enter category information (optional)"
									rows={3}
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-black text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-800 transition"
							>
								{editCategory ? "Update Category" : "Add Category"}
							</button>
						</form>
					</div>
				</div>
			)}

			{/* Tags Modal */}
			{isTagsModalOpen && selectedCategory && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/30 backdrop-blur-sm"
						onClick={closeModal}
					/>
					<div
						className={`relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10 transition-all ${
							isClosing ? "animate-modal-out" : "animate-modal-pop"
						}`}
					>
						<button
							className="absolute top-2 right-2 text-gray-400 hover:text-black transition"
							onClick={closeModal}
						>
							<X />
						</button>
						<h2 className="text-xl font-semibold mb-4">
							Add Tag for {selectedCategory.title}
						</h2>
						<form onSubmit={handleTagsSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Tag
								</label>
								<input
									type="text"
									value={tagsData.tag}
									onChange={(e) =>
										setTagsData({ ...tagsData, tag: e.target.value })
									}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
									placeholder="Enter tag"
									required
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-black text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-800 transition"
							>
								Add Tag
							</button>
						</form>
					</div>
				</div>
			)}

			{/* Enhanced Job Posting Modal */}
			{isJobModalOpen && selectedCategory && (
				<div className="fixed inset-0 z-50 flex items-center justify-center px-4">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-md"
						onClick={closeModal}
					/>
					<div
						className={`relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10 transition-all transform ${
							isClosing ? "animate-modal-out" : "animate-modal-pop"
						}`}
					>
						<button
							className="absolute top-4 right-4 text-gray-500 hover:text-black transition-transform hover:scale-110"
							onClick={closeModal}
						>
							<X size={24} />
						</button>
						<h2 className="text-3xl font-bold text-gray-800 mb-6">
							Add Job Posting for {selectedCategory.title}
						</h2>
						<form
							onSubmit={handleJobSubmit}
							className="grid grid-cols-1 md:grid-cols-2 gap-6"
						>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Job Title
								</label>
								<input
									type="text"
									value={jobData.jobTitle}
									onChange={(e) =>
										setJobData({
											...jobData,
											jobTitle: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter job title"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Salary
								</label>
								<input
									type="text"
									value={jobData.salary}
									onChange={(e) =>
										setJobData({ ...jobData, salary: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter salary (e.g., $50,000)"
									required
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Job Description
								</label>
								<textarea
									value={jobData.jobDescription}
									onChange={(e) =>
										setJobData({
											...jobData,
											jobDescription: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter job description"
									rows={4}
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Address
								</label>
								<input
									type="text"
									value={jobData.address}
									onChange={(e) =>
										setJobData({
											...jobData,
											address: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter address"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									City
								</label>
								<input
									type="text"
									value={jobData.city}
									onChange={(e) =>
										setJobData({ ...jobData, city: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter city"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Postal Code
								</label>
								<input
									type="text"
									value={jobData.postalCode}
									onChange={(e) =>
										setJobData({
											...jobData,
											postalCode: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter postal code"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									State
								</label>
								<input
									type="text"
									value={jobData.state}
									onChange={(e) =>
										setJobData({ ...jobData, state: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter state"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Contact Number
								</label>
								<input
									type="text"
									value={jobData.contactNumber}
									onChange={(e) =>
										setJobData({
											...jobData,
											contactNumber: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter contact number"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Contact Email
								</label>
								<input
									type="email"
									value={jobData.contactEmail}
									onChange={(e) =>
										setJobData({
											...jobData,
											contactEmail: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter contact email"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Job Company
								</label>
								<input
									type="text"
									value={jobData.jobCompany}
									onChange={(e) =>
										setJobData({
											...jobData,
											jobCompany: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter company name"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Upload Job Image
								</label>
								<input
									type="file"
									accept="image/*"
									onChange={(e) =>
										setJobImageFile(e.target.files?.[0] || null)
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Category
								</label>
								<input
									type="text"
									value={selectedCategory.title}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
									disabled
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Posting Date
								</label>
								<input
									type="date"
									value={jobData.date}
									onChange={(e) =>
										setJobData({
											...jobData,
											date: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Status
								</label>
								<select
									value={jobData.status}
									onChange={(e) =>
										setJobData({
											...jobData,
											status: e.target.value,
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									required
								>
									<option value="Active">Active</option>
									<option value="Non-Active">Non-Active</option>
								</select>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Tags
								</label>
								<div className="flex flex-wrap gap-2">
									{categoryTags.length > 0 ? (
										categoryTags.map((tag) => {
											const isSelected = jobData.tags.includes(
												tag.tag
											)
											return (
												<button
													type="button"
													key={tag.id}
													onClick={() =>
														setJobData((prev) => ({
															...prev,
															tags: isSelected
																? prev.tags.filter(
																		(t) => t !== tag.tag
																  )
																: [...prev.tags, tag.tag],
														}))
													}
													className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
														isSelected
															? "bg-black text-white border-gray-700"
															: "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
													}`}
												>
													{tag.tag}
												</button>
											)
										})
									) : (
										<p className="text-sm text-gray-500">
											No tags available for this category. Add tags
											first.
										</p>
									)}
								</div>
								<p className="text-xs text-gray-500 mt-1">
									Click to select/deselect tags (currently selected:{" "}
									{jobData.tags.length})
								</p>
							</div>
							<div className="md:col-span-2">
								<button
									type="submit"
									className="w-full bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
								>
									Add Job Posting
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
