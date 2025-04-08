"use client"
import Link from "next/link"
import { useState } from "react"
import {
	signInWithEmailAndPassword,
	signInWithPopup,
} from "firebase/auth"
import { auth, provider } from "./lib/firebase"

export default function page() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")

	const handleEmailLogin = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password)
			document.cookie = `user=${JSON.stringify({
				email,
				password,
			})}; path=/;`
			window.location.href = "/dashboard"
		} catch (err) {
			setError("Invalid email or password")
		}
	}

	const handleGoogleLogin = async () => {
		try {
			await signInWithPopup(auth, provider)
			document.cookie = `user=${JSON.stringify({
				email,
				password,
			})}; path=/;`
			window.location.href = "/dashboard"
		} catch (err) {
			setError("Google sign-in failed")
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-white px-6">
			<div className="flex flex-col md:flex-row items-center max-w-5xl w-full shadow-lg rounded-lg p-8">
				{/* Left: Login Form */}
				<div className="w-full md:w-1/2 space-y-6">
					<div>
						<h2 className="text-2xl font-semibold">Log In</h2>
						<p className="text-sm text-gray-500">Welcome back!</p>
					</div>

					{error && <p className="text-red-500 text-sm">{error}</p>}

					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full border px-4 py-2 rounded-md placeholder-gray-400"
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full border px-4 py-2 rounded-md placeholder-gray-400"
					/>

					<div className="flex space-x-4">
						<button
							onClick={handleEmailLogin}
							className="bg-black text-white px-6 py-2 rounded-md"
						>
							Log in
						</button>
						<button
							onClick={handleGoogleLogin}
							className="bg-red-500 text-white px-6 py-2 rounded-md"
						>
							Log in with Google
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
