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

export default function postingPage() {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [isClosing, setIsClosing] = useState<boolean>(false)
	const [posting, setposting] = useState<JobPosting[]>([])
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
	const [imageUrl, setImageUrl] = useState<string>("")
	const [tags, setTags] = useState<string[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [selectedCategory, setSelectedCategory] =
		useState<Category | null>(null)
	const [categoryTags, setCategoryTags] = useState<Tag[]>([])

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
		setImageUrl("")
		setTags([])
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
		setImageUrl(job.imageUrl || "")
		setTags(job.tags || [])

		const jobCategory = categories.find(
			(cat) => cat.id === job.categoryId
		)
		setSelectedCategory(jobCategory || null)

		// Fetch tags from the subcollection like in the reference code
		const tagsUnsubscribe = onSnapshot(
			collection(db, "categories", job.categoryId, "tags"),
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
		setIsModalOpen(true)
		return () => tagsUnsubscribe() // Cleanup subscription
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

				const allposting: JobPosting[] = []
				const categoryPromises = snapshot.docs.map((categoryDoc) => {
					const categoryId = categoryDoc.id
					const categoryTitle =
						categoryDoc.data().title || "Unknown Category"

					return new Promise<void>((resolve) => {
						onSnapshot(
							collection(db, "categories", categoryId, "posting"), // Adjusted to "posting" as per your structure
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
								})) as JobPosting[]
								allposting.push(...jobs)
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
					console.log("Fetched job postings:", allposting)
					setposting(allposting)
				})
			},
			(error) => {
				console.error("Fetch Error for categories:", error.message)
				alert(`Failed to fetch categories: ${error.message}`)
			}
		)

		return () => unsubscribeCategories()
	}, [])

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		try {
			const categoryId =
				editJob?.categoryId ||
				categories.find((cat) => cat.title === category)?.id ||
				"default-category-id"
			if (editJob) {
				await setDoc(
					doc(db, "categories", categoryId, "posting", editJob.id),
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
					}
				)
				console.log("Job posting updated:", editJob.id)
			} else {
				const docRef = await addDoc(
					collection(db, "categories", categoryId, "posting"),
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
			setImageUrl("")
			setTags([])
			closeModal()
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
		} catch (error: any) {
			console.error("Firebase Error:", error.code, error.message)
			alert(`Failed to delete job posting: ${error.message}`)
		}
	}

	const filteredJobs = posting.filter(
		(job) =>
			(job.jobTitle?.toLowerCase() || "").includes(
				searchTerm.toLowerCase()
			) ||
			(job.jobCompany?.toLowerCase() || "").includes(
				searchTerm.toLowerCase()
			)
	)

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
								<td colSpan={7} className="px-4 py-3 text-center">
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
									Image URL
								</label>
								<input
									type="url"
									value={imageUrl}
									onChange={(e) => setImageUrl(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
									placeholder="Enter image URL"
									required
								/>
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
										if (selected && !editJob) {
											// Fetch tags for new job postings when category changes
											onSnapshot(
												collection(
													db,
													"categories",
													selected.id,
													"tags"
												),
												(snapshot) => {
													const tagsData: Tag[] = snapshot.docs.map(
														(doc) => ({
															id: doc.id,
															...doc.data(),
														})
													) as Tag[]
													setCategoryTags(tagsData)
												},
												(error) => {
													console.error(
														"Error fetching tags:",
														error.message
													)
												}
											)
										}
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
									Tags
								</label>
								<select
									multiple
									value={tags}
									onChange={(e) =>
										setTags(
											Array.from(
												e.target.selectedOptions,
												(option) => option.value
											)
										)
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
								>
									{categoryTags.length > 0 ? (
										categoryTags.map((tag) => (
											<option key={tag.id} value={tag.tag}>
												{tag.tag}
											</option>
										))
									) : (
										<option disabled>No tags available</option>
									)}
								</select>
								<p className="text-xs text-gray-500 mt-1">
									Hold Ctrl/Cmd to select multiple tags
								</p>
							</div>
							<div className="md:col-span-2">
								<button
									type="submit"
									className="w-full bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition duration-200 ease-in-out transform hover:scale-105"
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
