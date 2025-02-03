import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCnUfHW7ZFMlAr7dCT6rN3hPiACME9hYYA",
    authDomain: "sandbox-bb9f2.firebaseapp.com",
    databaseURL: "https://sandbox-bb9f2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sandbox-bb9f2",
    storageBucket: "sandbox-bb9f2.firebasestorage.app",
    messagingSenderId: "118199686299",
    appId: "1:118199686299:web:02eef1d189e541eb8aa23e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to handle user data in Firestore
async function handleUserData(user) {
    const userRef = doc(db, "users", user.uid);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log("User Data:", userData);
            document.getElementById('message').innerText = `Welcome back, ${userData.name}!`;
        } else {
            console.log("No user data found. Creating new user data...");
            await setDoc(userRef, { name: user.displayName || user.email, email: user.email, lastLogin: new Date() }, { merge: true });
            document.getElementById('message').innerText = `Welcome, ${user.displayName || user.email}!`;
        }
        window.location.href = "main.html";
    } catch (error) {
        console.error("Error handling user data:", error);
    }
}

// Email/Password Login
const submit = document.getElementById('submit');
if (submit) {
    submit.addEventListener("click", async function (event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in:", userCredential.user);
            document.getElementById('message').innerText = "Logged in successfully";
            await handleUserData(userCredential.user);
        } catch (error) {
            console.error("Login Error:", error.message);
            document.getElementById('message').innerText = "Invalid credentials. Please try again.";
        }
    });
} else {
    console.error("Error: Login submit button not found!");
}

// Google Login
const googleLoginButton = document.getElementById('google-login');
if (googleLoginButton) {
    googleLoginButton.addEventListener("click", async function (event) {
        event.preventDefault();
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Google user logged in:", result.user);
            document.getElementById('message').innerText = `Logged in successfully as ${result.user.displayName}`;
            await handleUserData(result.user);
        } catch (error) {
            console.error("Google Login Error:", error.message);
            document.getElementById('message').innerText = "Google login failed. Please try again.";
        }
    });
} else {
    console.error("Error: Google login button not found!");
}

// Monitor user authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user.uid);
    } else {
        console.log("No user is signed in.");
    }
});