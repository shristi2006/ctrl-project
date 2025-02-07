// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Open and Close Modal
  const openModal = () => {
    document.getElementById('goalModal').style.display = 'block';
    document.querySelector('.modal-overlay').style.display = 'block';
  };
  
  const closeModal = () => {
    document.getElementById('goalModal').style.display = 'none';
    document.querySelector('.modal-overlay').style.display = 'none';
  };
  
  document.getElementById('newGoalBtn').addEventListener('click', openModal);
  document.querySelector('.close-btn').addEventListener('click', closeModal);
  
  // Fetch Events from Firestore
  const eventDropdown = document.getElementById('eventSelect');
  
  const fetchEvents = async () => {
    const eventsRef = db.collection("events");
    const snapshot = await eventsRef.get();
    snapshot.forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = doc.data().name;
      eventDropdown.appendChild(option);
    });
  };
  
  fetchEvents();
  
  // Handle Goal Submission
  document.getElementById('goalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const goalName = document.getElementById('goalName').value;
    const eventId = document.getElementById('eventSelect').value;
    const timeBlocks = document.getElementById('timeBlocks').value;
    const repeat = document.getElementById('repeat').value;
  
    if (!goalName || !eventId || !timeBlocks) {
      alert("Please fill in all fields.");
      return;
    }
  
    const goalData = {
      name: goalName,
      eventId: eventId,
      timeBlocks: parseInt(timeBlocks),
      repeat: repeat,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
  
    await db.collection("goals").add(goalData);
    closeModal();
    loadGoals();
  });
  
  // Load Goals from Firestore
  const loadGoals = async () => {
    const goalList = document.getElementById('goalList');
    goalList.innerHTML = "";
  
    const goalsRef = db.collection("goals").orderBy("timestamp", "desc");
    const snapshot = await goalsRef.get();
    
    snapshot.forEach(doc => {
      const goal = doc.data();
      const goalItem = document.createElement("div");
      goalItem.classList.add("goal-item");
      goalItem.innerHTML = `
        <span>${goal.name} - ${goal.timeBlocks * 10} min - ${goal.repeat}</span>
        <button onclick="deleteGoal('${doc.id}')">Delete</button>
      `;
      goalList.appendChild(goalItem);
    });
  };
  
  // Delete Goal
  const deleteGoal = async (id) => {
    await db.collection("goals").doc(id).delete();
    loadGoals();
  };
  
  // Load goals initially
  loadGoals();
  