/**
 * Deutsch Mark Academy — Firebase Authentication Controller
 * Uses official Google Firebase modular CDN (Zero NPM packages)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC8pygZqn-yYbQYtmRgFIxVkJQb0fwXt-w",
  authDomain: "dma-msi.firebaseapp.com",
  projectId: "dma-msi",
  storageBucket: "dma-msi.firebasestorage.app",
  messagingSenderId: "16140264297",
  appId: "1:16140264297:web:d25347e39cdab360a8d3f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let currentUser = null;
let authStateListeners = [];

// Listen for authentication changes
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  authStateListeners.forEach(callback => callback(user));
});

export function onAuthChange(callback) {
  authStateListeners.push(callback);
  if (currentUser !== undefined) {
    callback(currentUser);
  }
}

export async function signUpStudent(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signInStudent(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutStudent() {
  await signOut(auth);
}

export function getCurrentStudent() {
  return auth.currentUser || currentUser;
}

export async function getStudentToken() {
  const user = getCurrentStudent();
  if (!user) return null;
  return await user.getIdToken();
}

