// pages/signup.js
"use client"
import { useState } from "react"

export default function page() {
	const [agree, setAgree] = useState(false)

	return (
		<div className="min-h-screen flex items-center justify-center bg-white px-6">
			<div className="flex flex-col md:flex-row items-center max-w-5xl w-full shadow-lg rounded-lg p-8">
				{/* Left: Form */}
				<div className="w-full md:w-1/2 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">Sign Up</h2>
						<p className="text-sm text-gray-500">
							You are a step away from something great!
						</p>
					</div>

					<input
						type="email"
						placeholder="Email"
						className="w-full border px-4 py-2 rounded-md placeholder-gray-400"
					/>
					<input
						type="password"
						placeholder="Password"
						className="w-full border px-4 py-2 rounded-md placeholder-gray-400"
					/>

					<div className="flex space-x-4">
						<button className="bg-black text-white px-6 py-2 rounded-md">
							Log in
						</button>
					</div>
				</div>

				{/* Right: Illustration */}
				<div className="hidden md:block w-full md:w-1/2 text-center mt-8 md:mt-0">
					<img
						src="/images/bwink_msc_10_single_11.jpg"
						alt="Illustration"
						className="mx-auto w-96"
					/>
				</div>
			</div>
		</div>
	)
}
