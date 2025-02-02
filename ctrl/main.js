document.addEventListener("DOMContentLoaded", function () {
    const grid = document.querySelector(".grid");
    const table = document.createElement("table");
    table.classList.add("time-grid");

    const headerRow = document.createElement("tr");

    for (let hour = 0; hour < 24; hour++) {
        const timeCell = document.createElement("th");
        timeCell.textContent = hour.toString().padStart(2, '0') + ":00";
        headerRow.appendChild(timeCell);
    }

    table.appendChild(headerRow);

    const totalRows = Math.ceil(144 / 24);
    let buttonIndex = 0;
    for (let i = 1; i <= totalRows; i++) {
        const row = document.createElement("tr");

        for (let j = 0; j < 24 && buttonIndex < 144; j++) {
            const cell = document.createElement("td");
            const button = document.createElement("button");
            button.classList.add("button");
            button.dataset.index = buttonIndex; // Unique index for each button
            cell.appendChild(button);
            row.appendChild(cell);
            buttonIndex++;
        }

        table.appendChild(row);
    }
    grid.appendChild(table);

    let isMouseDown = false;
    let selectedBlocks = new Set();
    let startBlockIndex = null;

    const gridItems = document.querySelectorAll('.button');

    // Add selection to blocks
    function addSelection(item) {
        if (!selectedBlocks.has(item)) {
            selectedBlocks.add(item);
            item.classList.add('highlighted');
        }
    }

    // Remove selection from blocks
    function removeSelection(item) {
        if (selectedBlocks.has(item)) {
            selectedBlocks.delete(item);
            item.classList.remove('highlighted');
        }
    }

    // Logic for mouse down and mouse up
    gridItems.forEach(item => {
        item.addEventListener('mousedown', (event) => {
            isMouseDown = true;
             // Clear previous selections
            addSelection(item);
            startBlockIndex = parseInt(item.dataset.index); // Store the starting block index
        });

        item.addEventListener('mouseover', () => {
            if (isMouseDown) {
                const currentBlockIndex = parseInt(item.dataset.index);
                const block = gridItems[currentBlockIndex];
                
                // Check if the block is already selected
                if (selectedBlocks.has(block)) {
                    removeSelection(block); // Unselect the block
                } else {
                    addSelection(block); // Add the block to the selection
                }
            }
        });
        

        item.addEventListener('mouseup', (event) => {
            if (isMouseDown) {
                showEventPopup(event);
            }
            isMouseDown = false;
        });
        selectedBlocks.clear();
    });

    document.addEventListener('mouseup', () => {
        if (isMouseDown) {
            showEventPopup();
        }
        isMouseDown = false;
    });

    // Event creation logic
    const newEventBtn = document.getElementById('new-event-btn');
    const newEventForm = document.getElementById('new-event-form');
    const createEventBtn = document.getElementById('create-event-btn');
    const eventsContainer = document.getElementById('events-container');

    newEventBtn.addEventListener('click', function () {
        newEventForm.style.display = 'block';
    });

    createEventBtn.addEventListener('click', function () {
        const eventName = document.getElementById('event-name').value;
        const eventColor = document.getElementById('event-color').value;

        if (eventName && eventColor) {
            const newEventButton = document.createElement('button');
            newEventButton.textContent = eventName;
            newEventButton.style.backgroundColor = eventColor;
            newEventButton.classList.add('event-button');

            eventsContainer.appendChild(newEventButton);
        }

        newEventForm.style.display = 'none';
    });

    // Event selection popup
    const eventPopup = document.createElement('div');
    eventPopup.classList.add('event-popup');
    document.body.appendChild(eventPopup);

    function showEventPopup(event) {
        if (selectedBlocks.size === 0) return;

        eventPopup.innerHTML = '';
        const eventButtons = document.querySelectorAll('.event-button');
        if (eventButtons.length === 0) return;

        eventButtons.forEach(eventBtn => {
            const eventOption = document.createElement('button');
            eventOption.textContent = eventBtn.textContent;
            eventOption.style.backgroundColor = eventBtn.style.backgroundColor;

            eventOption.addEventListener('click', function () {
                // Assign event to all selected blocks at once
                selectedBlocks.forEach(block => {
                    block.style.backgroundColor = eventBtn.style.backgroundColor;
                    block.dataset.event = eventBtn.textContent; // Store event name in block
                });

                // Close the popup after assigning the event
                selectedBlocks.clear();
                eventPopup.style.display = 'none';
            });

            eventPopup.appendChild(eventOption);
        });

        eventPopup.style.top = `${event.clientY + 10}px`;
        eventPopup.style.left = `${event.clientX + 10}px`;
        eventPopup.style.display = 'block';
    }

    document.addEventListener('click', function (event) {
        if (!event.target.classList.contains('button') && !event.target.classList.contains('event-popup')) {
            eventPopup.style.display = 'none';
        }
    });


    // Date navigation
    const currentDateElement = document.getElementById('current-date');
    let currentDate = new Date();

    function updateDateDisplay() {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        currentDateElement.textContent = formattedDate;
    }

    document.getElementById('prev-date').addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
    });

    document.getElementById('next-date').addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
    });

    updateDateDisplay(); // Initial date display
});
document.addEventListener("DOMContentLoaded", function () {
    const currentDateElement = document.getElementById('current-date');
    let currentDate = new Date();

    function updateDateDisplay() {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        currentDateElement.textContent = formattedDate;
    }

    document.getElementById('prev-date').addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
    });

    document.getElementById('next-date').addEventListener('click', function () {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
    });

    updateDateDisplay(); // Initial date display


    // Function to collect event data (counts and colors)
    function collectEventData() {
        const buttons = document.querySelectorAll('.button');
        const eventData = {};

        buttons.forEach(button => {
            const event = button.dataset.event;
            if (event) {
                if (!eventData[event]) {
                    eventData[event] = {
                        count: 0,
                        color: button.style.backgroundColor // Store the color
                    };
                }
                eventData[event].count++;
            }
        });

        return eventData;
    }

    // Save event data to localStorage and navigate to analysis.html
    document.querySelector('.analysis-button').addEventListener('click', function () {
        const eventData = collectEventData();
        localStorage.setItem('eventData', JSON.stringify(eventData)); // Store data in localStorage
        window.location.href = 'analysis.html'; // Navigate to the analysis page
    });
});