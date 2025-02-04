import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
<<<<<<< HEAD
        import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

        // Firebase configuration
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
        const db = getFirestore(app);
        const auth = getAuth(app);

        // Set up the week picker and chart
        const weekPicker = document.getElementById("week-picker");
        const analysisChartCanvas = document.getElementById("analysis-chart");
        let chart = null;

        weekPicker.addEventListener('change', () => {
            const selectedWeek = weekPicker.value;
            if (selectedWeek) {
                loadWeeklyAnalysis(selectedWeek);
            }
        });

        const loadWeeklyAnalysis = async (selectedWeek) => {
            const user = auth.currentUser;
            if (!user) {
                console.error("User is not authenticated.");
                return;
            }

            const userId = user.uid;

            // Calculate start and end dates for the selected week
            const startOfWeek = new Date(selectedWeek + "-01"); // First day of the selected week
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Last day of the selected week

            const blocksRef = collection(db, "users", userId, "assignedBlocks");
            const querySnapshot = await getDocs(blocksRef);
            
            const eventTimes = {};  // Store total time per event (in minutes)

            querySnapshot.forEach(doc => {
                const blockData = doc.data();
                const blockDate = new Date(blockData.date);
                
                if (blockDate >= startOfWeek && blockDate <= endOfWeek) {
                    const event = blockData.event;
                    const eventDuration = blockData.duration || 10;  // Default to 10 minutes if no duration

                    if (!eventTimes[event]) {
                        eventTimes[event] = 0;
                    }

                    eventTimes[event] += eventDuration;
                }
            });

            // Prepare data for the chart
            const labels = Object.keys(eventTimes);
            const data = Object.values(eventTimes);

            // Update chart
            if (chart) {
                chart.destroy();
            }

            chart = new Chart(analysisChartCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Time spent on each event (minutes)',
                        data: data,
                        borderColor: 'rgb(75, 192, 192)',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { 
                            title: { display: true, text: 'Event' }
                        },
                        y: {
                            title: { display: true, text: 'Minutes' },
                            beginAtZero: true
                        }
                    }
                }
            });
        };

        // Handle authentication state change
        onAuthStateChanged(auth, user => {
            if (user) {
                console.log("User logged in:", user.uid);
            } else {
                console.log("No user logged in");
            }
        });
=======
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

const weekPicker = document.getElementById("week-picker");
const analysisChartCanvas = document.getElementById("analysis-chart");
let chart = null;

weekPicker.addEventListener('change', () => {
    const selectedWeek = weekPicker.value;
    if (selectedWeek) {
        loadWeeklyAnalysis(selectedWeek);
    }
});

const loadWeeklyAnalysis = async (selectedWeek) => {
    const user = auth.currentUser;
    if (!user) {
        console.error("User is not authenticated.");
        return;
    }

    const userId = user.uid;
    const startOfWeek = new Date(selectedWeek + "-01");
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const blocksRef = collection(db, "users", userId, "assignedBlocks");
    const querySnapshot = await getDocs(blocksRef);

    const eventTimes = {};

    querySnapshot.forEach(doc => {
        const blockData = doc.data();
        const blockDate = new Date(blockData.date);

        if (blockDate >= startOfWeek && blockDate <= endOfWeek) {
            const event = blockData.event;
            const eventDuration = blockData.duration || 10;

            eventTimes[event] = (eventTimes[event] || 0) + eventDuration;
        }
    });

    updateChart(eventTimes);
};

const updateChart = (eventTimes) => {
    const labels = Object.keys(eventTimes);
    const data = Object.values(eventTimes);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(analysisChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time spent on each event (minutes)',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Event' } },
                y: { title: { display: true, text: 'Minutes' }, beginAtZero: true }
            }
        }
    });
};

onAuthStateChanged(auth, user => {
    console.log(user ? `User logged in: ${user.uid}` : "No user logged in");
});
>>>>>>> version-5
