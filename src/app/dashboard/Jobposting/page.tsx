"use client"
import { Search, Plus, Pencil, Trash2, X } from "lucide-react"
import { useState, useEffect, FormEvent } from "react"
import { db } from "../../lib/firebase"
import {
	collection,
	onSnapshot,
	addDoc,
	setDoc,
	deleteDoc,
	doc,
} from "firebase/firestore"
import {
	getStorage,
	ref,
	uploadBytes,
	getDownloadURL,
} from "firebase/storage"

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
	categoryId: string
	tags: string[]
	status: string // Added status field
}

interface Category {
	id: string
	title: string
}

interface Tag {
	id: string
	tag: string
	createdAt: string
}

export default function PostingPage() {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [isClosing, setIsClosing] = useState<boolean>(false)
	const [posting, setPosting] = useState<JobPosting[]>([])
	const [searchTerm, setSearchTerm] = useState<string>("")
	const [editJob, setEditJob] = useState<JobPosting | null>(null)
	const [jobTitle, setJobTitle] = useState<string>("")
	const [jobDescription, setJobDescription] = useState<string>("")
	const [salary, setSalary] = useState<string>("")
	const [address, setAddress] = useState<string>("")
	const [city, setCity] = useState<string>("")
	const [postalCode, setPostalCode] = useState<string>("")
	const [state, setState] = useState<string>("")
	const [contactNumber, setContactNumber] = useState<string>("")
	const [category, setCategory] = useState<string>("")
	const [contactEmail, setContactEmail] = useState<string>("")
	const [jobCompany, setJobCompany] = useState<string>("")
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [tags, setTags] = useState<string[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [selectedCategory, setSelectedCategory] =
		useState<Category | null>(null)
	const [categoryTags, setCategoryTags] = useState<Tag[]>([])
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [status, setStatus] = useState<string>("Active") // Added status state

	const storage = getStorage()

	const fetchTagsForCategory = (categoryId: string) => {
		const tagsUnsubscribe = onSnapshot(
			collection(db, "categories", categoryId, "tags"),
			(snapshot) => {
				const tagsData: Tag[] = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Tag[]
				setCategoryTags(tagsData)
			},
			(error) => {
				console.error("Error fetching tags:", error.message)
				setCategoryTags([])
			}
		)
		return tagsUnsubscribe
	}

	const openModal = () => {
		setEditJob(null)
		setJobTitle("")
		setJobDescription("")
		setSalary("")
		setAddress("")
		setCity("")
		setPostalCode("")
		setState("")
		setContactNumber("")
		setCategory("")
		setContactEmail("")
		setJobCompany("")
		setImageFile(null)
		setTags([])
		setStatus("Active") // Default status for new job
		setSelectedCategory(null)
		setCategoryTags([])
		setIsModalOpen(true)
	}

	const openEditModal = (job: JobPosting) => {
		setEditJob(job)
		setJobTitle(job.jobTitle || "")
		setJobDescription(job.jobDescription || "")
		setSalary(job.salary || "")
		setAddress(job.address || "")
		setCity(job.city || "")
		setPostalCode(job.postalCode || "")
		setState(job.state || "")
		setContactNumber(job.contactNumber || "")
		setCategory(job.category || "")
		setContactEmail(job.contactEmail || "")
		setJobCompany(job.jobCompany || "")
		setImageFile(null)
		setTags(job.tags || [])
		setStatus(job.status || "Active") // Set status from job

		const jobCategory = categories.find(
			(cat) => cat.id === job.categoryId
		)
		setSelectedCategory(jobCategory || null)

		if (job.categoryId) {
			fetchTagsForCategory(job.categoryId)
		}

		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsClosing(true)
		setTimeout(() => {
			setIsModalOpen(false)
			setIsClosing(false)
			setEditJob(null)
			setSelectedCategory(null)
			setCategoryTags([])
		}, 300)
	}

	useEffect(() => {
		const unsubscribeCategories = onSnapshot(
			collection(db, "categories"),
			(snapshot) => {
				const categoryData = snapshot.docs.map((doc) => ({
					id: doc.id,
					title: doc.data().title || "Unknown",
				})) as Category[]
				setCategories(categoryData)

				const allPosting: JobPosting[] = []
				const categoryPromises = snapshot.docs.map((categoryDoc) => {
					const categoryId = categoryDoc.id
					const categoryTitle =
						categoryDoc.data().title || "Unknown Category"

					return new Promise<void>((resolve) => {
						onSnapshot(
							collection(db, "categories", categoryId, "posting"),
							(jobSnapshot) => {
								const jobs = jobSnapshot.docs.map((jobDoc) => ({
									id: jobDoc.id,
									jobTitle: jobDoc.data().jobTitle || "",
									jobDescription: jobDoc.data().jobDescription || "",
									salary: jobDoc.data().salary || "",
									address: jobDoc.data().address || "",
									city: jobDoc.data().city || "",
									postalCode: jobDoc.data().postalCode || "",
									state: jobDoc.data().state || "",
									contactNumber: jobDoc.data().contactNumber || "",
									category: categoryTitle,
									contactEmail: jobDoc.data().contactEmail || "",
									jobCompany: jobDoc.data().jobCompany || "",
									imageUrl: jobDoc.data().imageUrl || "",
									createdAt: jobDoc.data().createdAt || "",
									categoryId,
									tags: jobDoc.data().tags || [],
									status: jobDoc.data().status || "Active", // Fetch status
								})) as JobPosting[]
								allPosting.push(...jobs)
								resolve()
							},
							(error) => {
								console.error(
									`Error fetching jobs for category ${categoryId}:`,
									error.message
								)
								resolve()
							}
						)
					})
				})

				Promise.all(categoryPromises).then(() => {
					console.log("Fetched job postings:", allPosting)
					setPosting(allPosting)
				})
			},
			(error) => {
				console.error("Fetch Error for categories:", error.message)
				alert(`Failed to fetch categories: ${error.message}`)
			}
		)

		return () => unsubscribeCategories()
	}, [])

	useEffect(() => {
		let unsubscribe: (() => void) | undefined
		if (selectedCategory?.id) {
			unsubscribe = fetchTagsForCategory(selectedCategory.id)
		} else {
			setCategoryTags([])
			setSelectedTags([])
		}
		return () => {
			if (unsubscribe) unsubscribe()
		}
	}, [selectedCategory])

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			const newCategoryId =
				categories.find((cat) => cat.title === category)?.id ||
				"default-category-id"
			const oldCategoryId = editJob?.categoryId

			let imageUrl = editJob?.imageUrl || ""

			if (imageFile) {
				const storageRef = ref(storage, `jobImages/${imageFile.name}`)
				await uploadBytes(storageRef, imageFile)
				imageUrl = await getDownloadURL(storageRef)
				console.log("Job image uploaded, URL:", imageUrl)
			}

			if (!editJob && !imageUrl) throw new Error("No image uploaded")

			if (editJob) {
				if (oldCategoryId && oldCategoryId !== newCategoryId) {
					await deleteDoc(
						doc(
							db,
							"categories",
							oldCategoryId,
							"posting",
							editJob.id
						)
					)
					console.log(
						"Job deleted from old category:",
						oldCategoryId,
						editJob.id
					)

					const docRef = await addDoc(
						collection(db, "categories", newCategoryId, "posting"),
						{
							jobTitle,
							jobDescription,
							salary,
							address,
							city,
							postalCode,
							state,
							contactNumber,
							category,
							contactEmail,
							jobCompany,
							imageUrl,
							tags,
							createdAt: editJob.createdAt,
							status, // Include status
						}
					)
					console.log(
						"Job moved to new category with new ID:",
						newCategoryId,
						docRef.id
					)
				} else {
					await setDoc(
						doc(
							db,
							"categories",
							newCategoryId,
							"posting",
							editJob.id
						),
						{
							jobTitle,
							jobDescription,
							salary,
							address,
							city,
							postalCode,
							state,
							contactNumber,
							category,
							contactEmail,
							jobCompany,
							imageUrl,
							tags,
							createdAt: editJob.createdAt,
							status, // Include status
						}
					)
					console.log(
						"Job updated in same category:",
						newCategoryId,
						editJob.id
					)
				}
			} else {
				const docRef = await addDoc(
					collection(db, "categories", newCategoryId, "posting"),
					{
						jobTitle,
						jobDescription,
						salary,
						address,
						city,
						postalCode,
						state,
						contactNumber,
						category,
						contactEmail,
						jobCompany,
						imageUrl,
						tags,
						createdAt: new Date().toISOString(),
						status, // Include status
					}
				)
				console.log("Job posting added with ID:", docRef.id)
			}

			setJobTitle("")
			setJobDescription("")
			setSalary("")
			setAddress("")
			setCity("")
			setPostalCode("")
			setState("")
			setContactNumber("")
			setCategory("")
			setContactEmail("")
			setJobCompany("")
			setImageFile(null)
			setTags([])
			setStatus("Active") // Reset status
			closeModal()

			window.location.reload()
		} catch (error: any) {
			console.error("Firebase Error:", error.code, error.message)
			alert(`Failed to save job posting: ${error.message}`)
		}
	}

	const handleDelete = async (job: JobPosting) => {
		try {
			await deleteDoc(
				doc(db, "categories", job.categoryId, "posting", job.id)
			)
			console.log("Job posting deleted successfully:", job.id)
			window.location.reload()
		} catch (error: any) {
			console.error("Firebase Error:", error.code, error.message)
			alert(`Failed to delete job posting: ${error.message}`)
		}
	}

	const filteredJobs = posting.filter((job) => {
		const matchesSearch =
			(job.jobTitle?.toLowerCase() || "").includes(
				searchTerm.toLowerCase()
			) ||
			(job.jobCompany?.toLowerCase() || "").includes(
				searchTerm.toLowerCase()
			)
		const matchesCategory = selectedCategory
			? job.categoryId === selectedCategory.id
			: true
		const matchesTags =
			selectedTags.length > 0
				? selectedTags.some((tag) => job.tags.includes(tag))
				: true
		return matchesSearch && matchesCategory && matchesTags
	})

	return (
		<div className="p-6 bg-gray-100 min-h-screen font-sans">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-black">
					Job Postings
				</h1>
				<button
					onClick={openModal}
					className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-800 transition cursor-pointer"
				>
					<Plus size={16} />
					Create New
				</button>
			</div>

			<div className="mb-4">
				<h2 className="text-lg font-semibold text-gray-700 mb-2">
					Categories
				</h2>
				<div className="flex flex-wrap gap-2">
					{categories.map((cat) => (
						<button
							key={cat.id}
							onClick={() => {
								setSelectedCategory(
									cat === selectedCategory ? null : cat
								)
								setSelectedTags([])
							}}
							className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
								selectedCategory?.id === cat.id
									? "bg-black text-white border-gray-700"
									: "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
							}`}
						>
							{cat.title}
						</button>
					))}
				</div>
			</div>

			{selectedCategory && (
				<div className="mb-4">
					<h2 className="text-lg font-semibold text-gray-700 mb-2">
						Tags for {selectedCategory.title}
					</h2>
					<div className="flex flex-wrap gap-2">
						{categoryTags.length > 0 ? (
							categoryTags.map((tag) => {
								const isSelected = selectedTags.includes(tag.tag)
								return (
									<button
										key={tag.id}
										onClick={() => {
											setSelectedTags((prev) => {
												if (isSelected) {
													return prev.filter((t) => t !== tag.tag)
												} else if (prev.length < 3) {
													return [...prev, tag.tag]
												}
												return prev
											})
										}}
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
								No tags available for this category.
							</p>
						)}
					</div>
					<p className="text-xs text-gray-500 mt-1">
						Select up to 3 tags (currently selected:{" "}
						{selectedTags.length})
					</p>
				</div>
			)}

			<div className="bg-white rounded-2xl shadow-md p-4 mb-6">
				<div className="flex gap-4 items-center">
					<input
						type="text"
						placeholder="Search job postings by title or company..."
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
							<th className="px-4 py-3">Job Title</th>
							<th className="px-4 py-3">Company</th>
							<th className="px-4 py-3">Salary</th>
							<th className="px-4 py-3">Location</th>
							<th className="px-4 py-3">Category</th>
							<th className="px-4 py-3">Image</th>
							<th className="px-4 py-3">Date</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredJobs.length > 0 ? (
							filteredJobs.map((job) => (
								<tr
									key={job.id}
									className="hover:bg-gray-100 transition"
								>
									<td className="px-4 py-3">{job.jobTitle}</td>
									<td className="px-4 py-3">{job.jobCompany}</td>
									<td className="px-4 py-3">{job.salary}</td>
									<td className="px-4 py-3">{`${job.city}, ${job.state} ${job.postalCode}`}</td>
									<td className="px-4 py-3">{job.category}</td>
									<td className="px-4 py-3">
										<img
											src={job.imageUrl}
											alt={job.jobTitle}
											className="w-20 h-20 object-cover rounded"
										/>
									</td>
									<td className="px-4 py-3">
										{new Date(job.createdAt).toLocaleDateString()}
									</td>
									<td className="px-4 py-3">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												job.status === "Active"
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{job.status}
										</span>
									</td>
									<td className="px-4 py-3">
										<div className="flex gap-2 min-w-[120px]">
											<button
												onClick={() => openEditModal(job)}
												className="flex items-center px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow"
											>
												<Pencil size={14} className="mr-1" />
												Edit
											</button>
											<button
												onClick={() => handleDelete(job)}
												className="flex items-center px-2 py-1 text-xs font-medium bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow"
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
								<td colSpan={9} className="px-4 py-3 text-center">
									No job postings found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{isModalOpen && (
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
							{editJob
								? `Edit Job Posting: ${editJob.jobTitle}`
								: "Add New Job Posting"}
						</h2>
						<form
							onSubmit={handleSubmit}
							className="grid grid-cols-1 md:grid-cols-2 gap-6"
						>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Job Title
								</label>
								<input
									type="text"
									value={jobTitle}
									onChange={(e) => setJobTitle(e.target.value)}
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
									value={salary}
									onChange={(e) => setSalary(e.target.value)}
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
									value={jobDescription}
									onChange={(e) => setJobDescription(e.target.value)}
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
									value={address}
									onChange={(e) => setAddress(e.target.value)}
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
									value={city}
									onChange={(e) => setCity(e.target.value)}
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
									value={postalCode}
									onChange={(e) => setPostalCode(e.target.value)}
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
									value={state}
									onChange={(e) => setState(e.target.value)}
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
									value={contactNumber}
									onChange={(e) => setContactNumber(e.target.value)}
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
									value={contactEmail}
									onChange={(e) => setContactEmail(e.target.value)}
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
									value={jobCompany}
									onChange={(e) => setJobCompany(e.target.value)}
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
										setImageFile(e.target.files?.[0] || null)
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									required={!editJob}
								/>
								{editJob && (
									<p className="text-xs text-gray-500 mt-1">
										Current image:{" "}
										<a href={editJob.imageUrl} target="_blank">
											{editJob.imageUrl}
										</a>
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Category
								</label>
								<select
									value={category}
									onChange={(e) => {
										setCategory(e.target.value)
										const selected = categories.find(
											(cat) => cat.title === e.target.value
										)
										setSelectedCategory(selected || null)
										setTags([])
									}}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									required
								>
									<option value="">Select a category</option>
									{categories.map((cat) => (
										<option key={cat.id} value={cat.title}>
											{cat.title}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Status
								</label>
								<select
									value={status}
									onChange={(e) => setStatus(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									required
								>
									<option value="Active">Active</option>
									<option value="Non-Active">Non-Active</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Created At
								</label>
								<input
									type="text"
									value={
										editJob
											? new Date(
													editJob.createdAt
											  ).toLocaleDateString()
											: new Date().toLocaleDateString()
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
									disabled
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-semibold text-gray-700 mb-1">
									Tags
								</label>
								<div className="flex flex-wrap gap-2">
									{categoryTags.length > 0 ? (
										categoryTags.map((tag) => {
											const isSelected = tags.includes(tag.tag)
											return (
												<button
													type="button"
													key={tag.id}
													onClick={() => {
														setTags((prev) => {
															if (isSelected) {
																return prev.filter(
																	(t) => t !== tag.tag
																)
															} else if (prev.length < 3) {
																return [...prev, tag.tag]
															}
															return prev
														})
													}}
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
											{selectedCategory
												? "No tags available for this category."
												: "Select a category to view tags."}
										</p>
									)}
								</div>
								<p className="text-xs text-gray-500 mt-1">
									Select up to 3 tags (currently selected:{" "}
									{tags.length})
								</p>
							</div>
							<div className="md:col-span-2">
								<button
									type="submit"
									className="w-full bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
								>
									{editJob ? "Update Job Posting" : "Add Job Posting"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
