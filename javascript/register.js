//import necessary firebase modules 
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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
document.addEventListener("DOMContentLoaded", function () {

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const submit = document.getElementById('submit');
    submit.addEventListener("click", function (event) {
        event.preventDefault();
        // get user input values 
        const email = emailInput.value;
        const password = passwordInput.value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                
                const user = userCredential.user;
                document.getElementById('message').innerText = "Account Created. Login to continue";
                // display success message to the user 
                window.location.href = "login.html";
                // redirect to login page 
            })
            // handling errors during user creation
            .catch((error) => {
                const errorMessage = error.message;
                document.getElementById('message').innerText = "Invalid Credentials";
            });
    });

});
