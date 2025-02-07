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
let barChart;

document.addEventListener("DOMContentLoaded", () => {
    const currentWeekElement = document.getElementById('current-week');
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    let selectedDate = new Date();

    const updateWeekDisplay = () => {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Set to Sunday

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

        currentWeekElement.textContent = `${startOfWeek.toISOString().split('T')[0]} - ${endOfWeek.toISOString().split('T')[0]}`;
        loadWeeklyData(startOfWeek, endOfWeek);
    };

    prevWeekBtn.addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() - 7);
        updateWeekDisplay();
    });

    nextWeekBtn.addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() + 7);
        updateWeekDisplay();
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateWeekDisplay();
        } else {
            console.error("User not logged in.");
        }
    });

    async function loadWeeklyData(startDate, endDate) {
        const user = auth.currentUser;
        if (!user) return;

        let eventCounts = {};
        let eventColors = {};
        let totalAssignedBlocks = 0;
        const totalWeeklyBlocks = 144 * 7; // 144 blocks per day * 7 days

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const formattedDate = d.toISOString().split('T')[0];
            const blocksRef = collection(db, "users", user.uid, "assignedBlocks", formattedDate, "blocks");
            const querySnapshot = await getDocs(blocksRef);

            querySnapshot.forEach(doc => {
                const { event, color } = doc.data();
                if (event) {
                    if (!eventCounts[event]) {
                        eventCounts[event] = 0;
                        eventColors[event] = color;
                    }
                    eventCounts[event] += 1;
                    totalAssignedBlocks++;
                }
            });
        }

        // Calculate unassigned blocks
        const unassignedBlocks = totalWeeklyBlocks - totalAssignedBlocks;
        eventCounts["Unassigned"] = unassignedBlocks;
        eventColors["Unassigned"] = "#d3d3d3";

        console.log("Weekly Event Counts:", eventCounts);
        renderBarChart(eventCounts, eventColors);
    }

    function renderBarChart(eventCounts, eventColors) {
        const ctx = document.getElementById("eventChart").getContext("2d");
        if (barChart) barChart.destroy(); // Destroy previous chart

        barChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(eventCounts),
                datasets: [{
                    label: "Time Spent (hours)",
                    data: Object.values(eventCounts).map(count => (count * 10) / 60), // Convert to hours
                    backgroundColor: Object.keys(eventCounts).map(event => eventColors[event] || "#888"),
                    borderColor: "#000",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: "Hours" }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
});
