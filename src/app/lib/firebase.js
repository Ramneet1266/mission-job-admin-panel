// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCn0l763gouCq9QbnmdGsk8GlaIeSgDxMk",
	authDomain: "missionjobadminpanel-d55bb.firebaseapp.com",
	projectId: "missionjobadminpanel-d55bb",
	storageBucket: "missionjobadminpanel-d55bb.firebasestorage.app",
	messagingSenderId: "573621079107",
	appId: "1:573621079107:web:525fa444fc6297bdb158f6",
	measurementId: "G-HZK3GL56XK",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
// Initialize Firebase

// Initialize Firestore (works on both client and server)
const db = getFirestore(app)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()

export { db, analytics }
