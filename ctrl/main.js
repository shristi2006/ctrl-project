import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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
let userId = null;

document.addEventListener("DOMContentLoaded", () => {
    //ensuring that firebase is loaded properly before running code
    onAuthStateChanged(auth, user => {
        if (user) {
            userId = user.uid;
            updateDateDisplay(user);
            loadUserEvents(user.uid);
            console.log("User logged in:", userId);
        } else {
            console.error("No user logged in");
        }
    });

    //table and grid creation ----------------------------------
    const grid = document.querySelector(".grid");
    const table = document.createElement("table");
    table.classList.add("time-grid");

    // Create table header (time slots)
    const headerRow = document.createElement("tr");
    for (let hour = 0; hour < 24; hour++) {
        const timeCell = document.createElement("th");
        timeCell.textContent = hour.toString().padStart(2, '0') + ":00";
        headerRow.appendChild(timeCell);
    }
    table.appendChild(headerRow);

    // Create time blocks
    let buttonIndex = 0;
    const totalRows = Math.ceil(144 / 24); // 144 blocks, 24 per row
    for (let i = 1; i <= totalRows; i++) {
        const row = document.createElement("tr");

        for (let j = 0; j < 24 && buttonIndex < 144; j++) {
            const cell = document.createElement("td");
            const button = document.createElement("button");
            button.classList.add("button");
            button.dataset.index = buttonIndex;
            cell.appendChild(button);
            row.appendChild(cell);
            buttonIndex++;
        }
        table.appendChild(row);
    }
    grid.appendChild(table);

    //Date Navigation------------------------------------------------------------------------------
    const currentDateElement = document.getElementById('current-date');
    let currentDate = new Date();
    const maxDate = new Date();
    let formattedDateString = null;

    const updateDateDisplay = (user) => {

        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        currentDateElement.textContent = formattedDate;

        formattedDateString = currentDate.toISOString().split('T')[0];

        updateDatabaseWithTodayBlocks(user.uid, formattedDateString);
        getBlocksForDate(user.uid, formattedDateString);
    };

    document.getElementById('prev-date').addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay(auth.currentUser);
    });

    document.getElementById('next-date').addEventListener('click', () => {
        if (currentDate < maxDate) {
            currentDate.setDate(currentDate.getDate() + 1);
            updateDateDisplay(auth.currentUser);
        }
    });

    const loadUserBlocks = (userId, selectedDate) => {
        document.querySelectorAll("[data-index]").forEach(block => {
            block.style.backgroundColor = null;
            block.dataset.event = "";
        });

        const blocksRef = collection(db, "users", userId, "assignedBlocks", selectedDate, "blocks");
        getDocs(blocksRef)
            .then(snapshot => {
                if (snapshot.empty) {
                    console.log("No blocks found for this date");
                } else {
                    snapshot.forEach(doc => {
                        const blockData = doc.data();
                        const blockIndex = doc.id;
                        const blockElement = document.querySelector(`[data-index='${blockIndex}']`);

                        if (blockElement) {
                            blockElement.style.backgroundColor = blockData.color;
                            blockElement.dataset.event = blockData.event;
                        }
                    });
                }
            })
            .catch(error => {
                console.error("Error fetching blocks: ", error);
            });
    };

    const getBlocksForDate = (userId, selectedDate) => {
        loadUserBlocks(userId, selectedDate);
    };

    const updateDatabaseWithTodayBlocks = (userId, selectedDate) => {
        const blocksRef = collection(db, "users", userId, "assignedBlocks", selectedDate, "blocks");
        getDocs(blocksRef).then(snapshot => {
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    const blockData = doc.data();
                    const blockIndex = doc.id;
                    const blockElement = document.querySelector(`[data-index='${blockIndex}']`);

                    if (blockElement) {
                        blockElement.style.backgroundColor = blockData.color;
                        blockElement.dataset.event = blockData.event;
                    }
                });
            }
        }).catch(error => {
            console.error("Error updating today's blocks: ", error);
        });
    };

    // Event creation--------------------------------------------------------------
    const newEventBtn = document.getElementById("new-event-btn");
    const newEventForm = document.getElementById("new-event-form");
    const createEventBtn = document.getElementById("create-event-btn");
    const eventsContainer = document.getElementById("events-container");

    const existingEvents = new Set();

    // Show event creation form
    newEventBtn.addEventListener("click", () => {
        newEventForm.style.display = "block";
    });

    // Add event to UI
    const addEventToUI = event => {
        if (existingEvents.has(event.name)) return;

        existingEvents.add(event.name);

        const newEventButton = document.createElement("button");
        newEventButton.textContent = event.name;
        newEventButton.style.backgroundColor = event.color;
        newEventButton.classList.add("event-button");
        eventsContainer.appendChild(newEventButton);
    };

    // Create and save event in Firestore
    createEventBtn.addEventListener("click", async () => {
        const eventName = document.getElementById("event-name").value.trim();
        const eventColor = document.getElementById("event-color").value;

        if (!eventName || !eventColor) return;

        const user = auth.currentUser;
        if (!user) {
            console.error("User not logged in.");
            return;
        }

        const userId = user.uid;

        if (existingEvents.has(eventName)) {
            alert("Event already exists!");
            return;
        }

        const eventRef = doc(db, "users", userId, "events", eventName);
        const eventData = { name: eventName, color: eventColor };

        try {
            await setDoc(eventRef, eventData);
            console.log("Event stored in Firestore!");
            addEventToUI(eventData);
        } catch (error) {
            console.error("Error storing event:", error);
        }

        newEventForm.style.display = "none";
    });

    // Load user events
    const loadUserEvents = async userId => {
        const eventsRef = collection(db, "users", userId, "events");
        const querySnapshot = await getDocs(eventsRef);
        querySnapshot.forEach(doc => addEventToUI(doc.data()));
    };

    //selection of blocks-----------------------------------------------------
    let isMouseDown = false;
    let selectedBlocks = new Set();
    let startBlockIndex = null;

    // Event listener for block selection
    const gridItems = document.querySelectorAll('.button');
    gridItems.forEach(item => {
        item.style.backgroundColor = null;
        item.dataset.event = null;
    });

    const addSelection = item => {
        if (!selectedBlocks.has(item)) {
            selectedBlocks.add(item);
            item.classList.add('highlighted');
        }
    };

    const removeSelection = item => {
        if (selectedBlocks.has(item)) {
            selectedBlocks.delete(item);
            item.classList.remove('highlighted');
        }
    };

    gridItems.forEach(item => {
        item.addEventListener('mousedown', event => {
            isMouseDown = true;
            addSelection(item);
            startBlockIndex = parseInt(item.dataset.index);
        });

        item.addEventListener('mouseover', () => {
            if (isMouseDown) {
                const currentBlockIndex = parseInt(item.dataset.index);
                const block = gridItems[currentBlockIndex];

                if (selectedBlocks.has(block)) {
                    removeSelection(block);
                } else {
                    addSelection(block);
                }
            }
        });

        item.addEventListener('mouseup', () => {
            if (isMouseDown) {
                showEventPopup();
            }
            isMouseDown = false;
        });
    });

    //mouseup event to close popup
    document.addEventListener('mouseup', () => {
        if (isMouseDown) {
            showEventPopup();
        }
        isMouseDown = false;
    });


    // Event popup for assigning events to blocks-------------------------------------------------------
    const eventPopup = document.createElement('div');
    eventPopup.classList.add('event-popup');
    document.body.appendChild(eventPopup);

    const showEventPopup = () => {
        if (selectedBlocks.size === 0) return;

        eventPopup.innerHTML = '';
        const eventButtons = document.querySelectorAll('.event-button');
        if (eventButtons.length === 0) return;

        eventButtons.forEach(eventBtn => {
            const eventOption = document.createElement('button');
            eventOption.textContent = eventBtn.textContent;
            eventOption.style.backgroundColor = eventBtn.style.backgroundColor;

            eventOption.addEventListener('click', () => {
                selectedBlocks.forEach(block => {
                    block.style.backgroundColor = eventBtn.style.backgroundColor;
                    block.dataset.event = eventBtn.textContent;
                    block.classList.remove('highlighted');

                    const blockRef = doc(db, "users", userId, "assignedBlocks", formattedDateString, "blocks", block.dataset.index);
                    setDoc(blockRef, {
                        event: eventBtn.textContent,
                        color: eventBtn.style.backgroundColor
                    }).then(() => {
                        console.log("Block assigned successfully!");
                    }).catch(error => {
                        console.error("Error saving data:", error);
                    });
                });

                selectedBlocks.clear();
                eventPopup.style.display = 'none';
            });

            eventPopup.appendChild(eventOption);
        });

        eventPopup.style.top = `${event.clientY + 10}px`;
        eventPopup.style.left = `${event.clientX + 10}px`;
        eventPopup.style.display = 'block';
    };

    // Close popup when clicking outside
    document.addEventListener('click', event => {
        if (!event.target.classList.contains('button') && !event.target.classList.contains('event-popup')) {
            eventPopup.style.display = 'none';
        }
    });
});