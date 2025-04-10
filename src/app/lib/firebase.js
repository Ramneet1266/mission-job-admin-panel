// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { doc, getFirestore, setDoc } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDhI-xmTn7pNDYzISS1WbnfGGAfDLoU2PM",
	authDomain: "missonjobportal.firebaseapp.com",
	projectId: "missonjobportal",
	storageBucket: "missonjobportal.firebasestorage.app",
	messagingSenderId: "631191077926",
	appId: "1:631191077926:web:0242f41393e65d4ad712e7",
	measurementId: "G-229FSW9WDT",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)

// Initialize Firestore (works on both client and server)
const db = getFirestore(app)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

export { db }
