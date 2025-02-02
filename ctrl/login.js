import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCnUfHW7ZFMlAr7dCT6rN3hPiACME9hYYA",
    authDomain: "sandbox-bb9f2.firebaseapp.com",
    databaseURL: "https://sandbox-bb9f2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sandbox-bb9f2",
    storageBucket: "sandbox-bb9f2.firebasestorage.app",
    messagingSenderId: "118199686299",
    appId: "1:118199686299:web:02eef1d189e541eb8aa23e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Submit Button
const submit = document.getElementById('submit');
submit.addEventListener("click", function(event){
    event.preventDefault();

    // Get input values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log("User logged in:", user); // Check user info
        alert('Logged in successfully');
        
        // Store or fetch user data from Firestore
        const userRef = doc(db, "users", user.uid);
        getDoc(userRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                // User data exists in Firestore
                const userData = docSnap.data();
                console.log("User Data:", userData);

                // You can display user data, for example:
                document.getElementById('message').innerText = `Welcome back, ${userData.name}!`;
                window.location.href = "main.html";
            } else {
                // No user data found, you can create it
                console.log("No user data found. Creating new user data...");
                setDoc(userRef, { name: user.email, lastLogin: new Date() }, { merge: true })
                .then(() => {
                    console.log("User data saved to Firestore");
                }).catch((error) => {
                    console.error("Error writing document: ", error);
                });
            }
        }).catch((error) => {
            console.error("Error fetching user data: ", error);
        });
    })
    .catch((error) => {
        // Handle errors
        const errorMessage = error.message;
        document.getElementById('message').innerText = errorMessage; // Show error message
    });
});

// Monitor user auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user);
        // You can retrieve user data here or update UI based on auth state
    } else {
        console.log("No user is signed in.");
    }
});
