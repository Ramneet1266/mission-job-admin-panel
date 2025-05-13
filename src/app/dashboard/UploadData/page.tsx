"use client"
import { useState } from "react"

export default function UploadData() {
	const [file, setFile] = useState<File | null>(null)
	const [uploadStatus, setUploadStatus] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const handleFileChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const selectedFile = e.target.files?.[0]
		if (selectedFile && selectedFile.type === "text/csv") {
			setFile(selectedFile)
			setUploadStatus("")
		} else {
			setFile(null)
			setUploadStatus("Please select a valid CSV file.")
		}
	}

	const handleUpload = async () => {
		if (!file) {
			setUploadStatus("No file selected.")
			return
		}

		setIsLoading(true)
		setUploadStatus("Uploading...")

		const formData = new FormData()
		formData.append("csvFile", file)

		try {
			const response = await fetch("/api/upload-csv", {
				method: "POST",
				body: formData,
			})

			const result = await response.json()

			if (response.ok) {
				setUploadStatus("Data uploaded successfully!")
			} else {
				setUploadStatus(`Upload failed: ${result.error}`)
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "An unknown error occurred"
			setUploadStatus(`Upload failed: ${errorMessage}`)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">Upload Data</h1>
			<div className="bg-white p-6 rounded-lg shadow-md">
				<div className="mb-4">
					<label
						htmlFor="csvFile"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Select CSV File
					</label>
					<input
						type="file"
						id="csvFile"
						accept=".csv"
						onChange={handleFileChange}
						className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-100 file:text-gray-700
              hover:file:bg-gray-200"
					/>
				</div>
				<button
					onClick={handleUpload}
					disabled={isLoading || !file}
					className={`px-4 py-2 rounded-md text-white font-semibold
            ${
							isLoading || !file
								? "bg-gray-400 cursor-not-allowed"
								: "bg-blue-600 hover:bg-blue-700"
						}`}
				>
					{isLoading ? "Uploading..." : "Upload CSV"}
				</button>
				{uploadStatus && (
					<p
						className={`mt-4 text-sm ${
							uploadStatus.includes("successfully")
								? "text-green-600"
								: uploadStatus.includes("Uploading")
								? "text-blue-600"
								: "text-red-600"
						}`}
					>
						{uploadStatus}
					</p>
				)}
			</div>
		</div>
	)
}
