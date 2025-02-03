import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

    // Your web app's Firebase configuration
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
    document.addEventListener("DOMContentLoaded", function () {

    // Input elements
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Submit for Email/Password Registration
    const submit = document.getElementById('submit');
    submit.addEventListener("click", function(event) {
        event.preventDefault();

        // Get email and password values
        const email = emailInput.value;
        const password = passwordInput.value;

        // Create a new user with email and password
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            document.getElementById('message').innerText = "Account Created. Login to continue";
            window.location.href = "login.html";
        })
        .catch((error) => {
            const errorMessage = error.message;
            document.getElementById('message').innerText = "Invalid Credentials";
        });
    });

    });
