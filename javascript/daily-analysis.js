import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

let pieChart;

document.addEventListener("DOMContentLoaded", () => {
    const currentDateElement = document.getElementById('current-date');
    const prevDateBtn = document.getElementById('prev-date');
    const nextDateBtn = document.getElementById('next-date');
    let selectedDate = new Date();

    const updateDateDisplay = () => {
        currentDateElement.textContent = selectedDate.toISOString().split('T')[0];
        loadEventData();
    };

    prevDateBtn.addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() - 1);
        updateDateDisplay();
    });

    nextDateBtn.addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() + 1);
        updateDateDisplay();
    });

    onAuthStateChanged(auth, user => {
        if (user) {
            loadEventData();
        } else {
            console.error("User not logged in.");
        }
    });

    async function loadEventData() {
        const user = auth.currentUser;
        if (!user) return;

        const formattedDate = selectedDate.toISOString().split('T')[0];
        const blocksRef = collection(db, "users", user.uid, "assignedBlocks", formattedDate, "blocks");
        const querySnapshot = await getDocs(blocksRef);

        let eventCounts = {};
        let eventColors = {};
        let assignedBlocks = 0;

        querySnapshot.forEach(doc => {
            const { event, color } = doc.data();
            if (event) {
                eventCounts[event] = (eventCounts[event] || 0) + 1;
                eventColors[event] = color;
                assignedBlocks++;
            }
        });

        const unassignedBlocks = 144 - assignedBlocks;
        if (unassignedBlocks > 0) {
            eventCounts["Unassigned"] = unassignedBlocks;
            eventColors["Unassigned"] = "#d3d3d3"; 
        }

        renderPieChart(eventCounts, eventColors);
    }

    function renderPieChart(eventCounts, eventColors) {
        const ctx = document.getElementById("eventChart").getContext("2d");
        if (pieChart) pieChart.destroy(); 

        pieChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(eventCounts),
                datasets: [{
                    data: Object.values(eventCounts),
                    backgroundColor: Object.keys(eventCounts).map(event => eventColors[event])
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });
    }

    updateDateDisplay();
});