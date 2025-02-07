let isFullScreen = false;
let timerInterval;
let isTimerRunning = false;
let endTime;
let remainingTime = 0; // Store remaining time when paused

const startButton = document.getElementById('start-timer');
const timeDisplay = document.getElementById('time-display');
const hoursInput = document.getElementById('set-hours');
const minutesInput = document.getElementById('set-minutes');
const secondsInput = document.getElementById('set-seconds');
const blockMessage = document.getElementById('block-message');
const endImage = document.getElementById('end-image');

startButton.addEventListener('click', startTimer);
document.addEventListener("fullscreenchange", handleFullScreenChange);

// Initialize input fields (optional)
hoursInput.value = 0;
minutesInput.value = 30;
secondsInput.value = 0;

function startTimer() {
    let hours = parseInt(hoursInput.value);
    let minutes = parseInt(minutesInput.value);
    let seconds = parseInt(secondsInput.value);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || hours < 0 || minutes < 0 || seconds < 0 || minutes >= 60 || seconds >= 60) {
        alert("Please enter valid hours, minutes, and seconds.");
        return;
    }

    let totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    
    if (totalSeconds === 0) {
        alert("Please enter a valid time greater than zero.");
        return;
    }
// enter full screen mode when the timer starts 
    if (!isTimerRunning) {
        isTimerRunning = true;
        startButton.disabled = true;
        blockMessage.style.display = 'block';
        blockPage();
        enterFullScreen();

        if (remainingTime === 0) {
            endTime = Date.now() + (totalSeconds * 1000);
        } else {
            endTime = Date.now() + (remainingTime * 1000);
        }

        updateDisplay();
        timerInterval = setInterval(updateDisplay, 1000);
    }
}

function updateDisplay() {
    const now = Date.now();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timeDisplay.textContent = "00:00:00";
        remainingTime = 0; // Reset remaining time
        timerFinished();
        return;
    }

    let totalSeconds = Math.round(timeLeft / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    remainingTime = totalSeconds; // Store remaining time for pause/resume
}
// when the timer is finished display the image for 4 seconds and then hide it 
function timerFinished() {
    unblockPage();
    isTimerRunning = false;
    startButton.disabled = false;

    if (blockMessage) blockMessage.style.display = 'none';

    setTimeout(() => {
        if (endImage) endImage.style.display = 'block';

        setTimeout(() => {
            if (endImage) endImage.style.display = 'none';  // Hide the image after 4 seconds
        }, 4000);
    }, 10);
}

function blockPage() {
    // Your existing blockPage function
}

function unblockPage() {
    // Your existing unblockPage function
    endImage.style.display = 'none';
}

function enterFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error("Error attempting to enable full-screen mode:", err);
        });
    }
}
// timer will be paused if the user exits full screen mode 
function handleFullScreenChange() {
    if (!document.fullscreenElement) {
        pauseTimer();
    }
}

function pauseTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startButton.disabled = false;
        alert("Timer paused. Re-enter full-screen to resume.");
    }
}
