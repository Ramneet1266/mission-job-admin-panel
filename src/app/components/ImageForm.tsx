export default function ImageForm() {
	return (
		<div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
			<div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
				<h2 className="text-xl font-semibold text-black mb-6">
					Upload Image
				</h2>

				<form className="space-y-4">
					<div>
						<label className="block text-sm text-gray-600 mb-2">
							Choose Image
						</label>
						<input
							type="file"
							accept="image/*"
							className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition"
						/>
					</div>

					<button
						type="submit"
						className="w-full bg-black text-white py-2 rounded-full font-medium hover:bg-gray-800 transition shadow-md"
					>
						Upload
					</button>
				</form>
			</div>
		</div>
	)
}
