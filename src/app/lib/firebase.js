// src/app/lib/firebase.js
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// Your Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyARXWKblkHfRWYNLY3EKri0eGwXGRaSCA0",
	authDomain: "postjob-b643c.firebaseapp.com",
	projectId: "postjob-b643c",
	storageBucket: "postjob-b643c.firebasestorage.app",
	messagingSenderId: "678507770777",
	appId: "1:678507770777:web:a5a07ee76c27d18d53d908",
	measurementId: "G-X6B4L33WV5",
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Initialize Firestore (works on both client and server)
const db = getFirestore(app)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

// Initialize Analytics only on the client side
let analytics = null
if (typeof window !== "undefined") {
	isSupported().then((supported) => {
		if (supported) {
			analytics = getAnalytics(app)
		}
	})
}

export { db, analytics }
