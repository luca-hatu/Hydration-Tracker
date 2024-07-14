let dailyGoal = 64;
let currentIntake = 0;
let points = 0;
let unit = localStorage.getItem("unit") || "oz";
let currentStreak = localStorage.getItem("currentStreak") || 0;
let lastGoalMet = localStorage.getItem("lastGoalMet") || null;

document.addEventListener("DOMContentLoaded", function() {
    dailyGoal = localStorage.getItem("dailyGoal") || 64;
    currentIntake = localStorage.getItem("currentIntake") || 0;
    points = localStorage.getItem("points") || 0;

    checkForDailyReset();
    const savedTheme = localStorage.getItem("theme") || "light";
    document.getElementById("theme").value = savedTheme;
    setTheme();

    document.getElementById("goal").value = dailyGoal;
    updateProgress();
    displayHistory();
    displayAchievements();
    displayStreak();
    requestNotificationPermission();
    setNotificationInterval();
    displayStats();

    displayDailyTip();
    displayChart();
    const profile = JSON.parse(localStorage.getItem("profile"));
    if (profile) {
        document.getElementById("weight").value = profile.weight;
        document.getElementById("age").value = profile.age;
    }
    document.getElementById("unit").value = unit;
    updateProgress();
    updatePointsDisplay();
});

function logWater(amount) {
    currentIntake = parseInt(currentIntake) + amount;
    points += amount; 
    localStorage.setItem("currentIntake", currentIntake);
    localStorage.setItem("points", points);
    updateProgress();
    updatePointsDisplay();
}

function checkForDailyReset() {
    const lastReset = localStorage.getItem('lastReset');
    const today = new Date().toLocaleDateString();

    if (lastReset !== today) {
        saveToHistory();
        currentIntake = 0;
        localStorage.setItem('currentIntake', currentIntake);
        localStorage.setItem('lastReset', today);
        updateProgress();
    }
}

function logCustomWater() {
    const customAmount = parseInt(document.getElementById("custom-amount").value);
    if (!isNaN(customAmount) && customAmount > 0) {
        logWater(customAmount);
        document.getElementById("custom-amount").value = '';
    } else {
        alert("Please enter a valid number.");
    }
}

function setGoal() {
    dailyGoal = parseInt(document.getElementById("goal").value);
    if (!isNaN(dailyGoal) && dailyGoal > 0) {
        localStorage.setItem("dailyGoal", dailyGoal);
        updateProgress();
    } else {
        alert("Please enter a valid number.");
    }
}

function updateProgress() {
    const progressPercentage = (currentIntake / dailyGoal) * 100;
    document.getElementById("progress-bar").style.width = progressPercentage + "%";
    document.getElementById("progress-text").innerText = `${currentIntake} / ${dailyGoal} ${unit}`;

    if (currentIntake >= dailyGoal) {
        if (!localStorage.getItem('goalMet')) {
            points += 50; 
            localStorage.setItem('points', points);
            localStorage.setItem('goalMet', true);
            alert("Congratulations! You've met your daily goal and earned 50 bonus points!");
            triggerConfetti(); 
        }
    } else {
        localStorage.removeItem('goalMet');
    }

    updatePointsDisplay();
}

function triggerConfetti() {
    confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function updatePointsDisplay() {
    document.getElementById('points-display').innerText = `${points} Points`;
}

function saveToHistory() {
    let history = JSON.parse(localStorage.getItem('history')) || [];
    const today = new Date().toLocaleDateString();

    history.push({ date: today, intake: currentIntake });
    if (history.length > 7) history.shift();

    localStorage.setItem('history', JSON.stringify(history));
}

function displayHistory() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    history.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.date}: ${entry.intake} ${unit}`;
        historyList.appendChild(listItem);
    });
}

function requestNotificationPermission() {
    if (Notification.permission === "default") {
        Notification.requestPermission();
    }
}

function sendNotification() {
    if (Notification.permission === "granted") {
        new Notification("Time to drink water!");
    }
}

function setNotificationInterval() {
    const interval = 60 * 60 * 1000; 
    setInterval(sendNotification, interval);
}

function setTheme() {
    const theme = document.getElementById("theme").value;
    document.body.className = theme;
    localStorage.setItem("theme", theme);
}

function checkAchievements() {
    const achievements = JSON.parse(localStorage.getItem("achievements")) || [];
    const newAchievements = [];

    if (currentIntake >= dailyGoal) {
        newAchievements.push("Daily Goal Achieved");
    }
    if (currentIntake >= 100) {
        newAchievements.push("100 oz in a Day");
    }
    if (currentIntake >= 200) {
        newAchievements.push("200 oz in a Day");
    }

    newAchievements.forEach(achievement => {
        if (!achievements.includes(achievement)) {
            achievements.push(achievement);
        }
    });

    localStorage.setItem("achievements", JSON.stringify(achievements));
    displayAchievements();
}

function displayAchievements() {
    const achievements = JSON.parse(localStorage.getItem("achievements")) || [];
    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = '';

    achievements.forEach(achievement => {
        const listItem = document.createElement('li');
        const trophy = document.createElement('img');
        
        if (achievement === "Daily Goal Achieved") {
            trophy.src = "/images/medal1.png"; 
        } else if (achievement === "100 oz in a Day") {
            trophy.src = "/images/medal2.png"; 
        } else if (achievement === "200 oz in a Day") {
            trophy.src = "/images/medal3.png"; 
        }

        if (!trophy.src.includes("medal")) {
            console.error(`Image path not found: ${trophy.src}`);
        }

        listItem.appendChild(trophy);
        listItem.appendChild(document.createTextNode(achievement));
        achievementsList.appendChild(listItem);
    });
}

const tips = [
    "Drink a glass of water first thing in the morning.",
    "Carry a reusable water bottle with you.",
    "Add a slice of lemon or cucumber to your water for flavor.",
    "Drink water before, during, and after exercise.",
    "Set reminders to drink water throughout the day."
];

function displayDailyTip() {
    const tip = tips[new Date().getDate() % tips.length];
    document.getElementById("hydration-tip").innerText = tip;
}

function displayChart() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const labels = history.map(entry => entry.date);
    const data = history.map(entry => entry.intake);

    const ctx = document.getElementById('hydrationChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Water Intake (oz)',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        }
    });
}

function resetProgress() {
    currentIntake = 0;
    localStorage.setItem("currentIntake", currentIntake);
    updateProgress();
    displayAchievements();
}

function setUnit() {
    unit = document.getElementById("unit").value;
    localStorage.setItem("unit", unit);
    updateProgress();
}

function convertToUnit(amount, unit) {
    if (unit === "ml") {
        return amount * 29.5735;
    }
    return amount;
}

function saveProfile() {
    const weight = document.getElementById("weight").value;
    const age = document.getElementById("age").value;

    if (weight && age) {
        localStorage.setItem("profile", JSON.stringify({ weight, age }));
        alert("Profile saved!");
    } else {
        alert("Please enter valid information.");
    }
}

function suggestWaterIntake() {
    const age = parseInt(document.getElementById('age').value);
    const weight = parseInt(document.getElementById('weight').value);
    const gender = document.getElementById('gender').value;
    const activity = document.getElementById('activity').value;

    if (!isNaN(age) && !isNaN(weight) && gender && activity) {
        let baseIntake = weight * 0.5; 
        if (age > 55) baseIntake *= 0.9; 
        if (activity === 'moderate') baseIntake *= 1.2;
        if (activity === 'high') baseIntake *= 1.4;

        if (gender === 'male') {
            baseIntake *= 1.1; 
        }

        dailyGoal = Math.round(baseIntake);
        document.getElementById('goal').value = dailyGoal;
        localStorage.setItem('dailyGoal', dailyGoal);
        updateProgress();
        alert(`Suggested daily water intake: ${dailyGoal} oz`);
    } else {
        alert('Please fill out all profile fields correctly.');
    }
}

function resetPoints() {
    points = 0;
    localStorage.setItem("points", points);
    updatePointsDisplay();
}
function shareAchievement() {
    const shareData = {
        title: 'I achieved my daily hydration goal!',
        text: `I drank ${currentIntake} ${unit} of water today. Stay hydrated!`,
        url: window.location.href
    };

    navigator.share(shareData)
        .then(() => console.log('Share was successful.'))
        .catch((error) => console.error('Share failed:', error));
}
function checkStreak() {
    const today = new Date().toLocaleDateString();

    if (currentIntake >= dailyGoal) {
        if (lastGoalMet !== today) {
            currentStreak = parseInt(currentStreak) + 1;
            localStorage.setItem("currentStreak", currentStreak);
            localStorage.setItem("lastGoalMet", today);
            displayStreak();
            showConfetti();
        }
    }
}

function displayStreak() {
    document.getElementById("current-streak").innerText = `${currentStreak} days`;
}

function showConfetti() {
    const confettiElement = document.createElement('div');
    confettiElement.className = 'confetti';
    document.body.appendChild(confettiElement);

    confettiElement.style.position = 'fixed';
    confettiElement.style.top = '50%';
    confettiElement.style.left = '50%';
    confettiElement.style.transform = 'translate(-50%, -50%)';
    confettiElement.style.zIndex = '1000';
    confettiElement.style.width = '100px';
    confettiElement.style.height = '100px';
    confettiElement.style.pointerEvents = 'none';
    confettiElement.style.backgroundImage = 'url(confetti.gif)';
    confettiElement.style.backgroundSize = 'cover';
    confettiElement.style.animation = 'fadeOut 2s forwards';

    setTimeout(() => {
        confettiElement.remove();
    }, 2000);
}
function displayStats() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const today = new Date();
    
    const weeklyStats = calculateStats(history, 7);
    const monthlyStats = calculateStats(history, 30);

    document.getElementById("weekly-stats").innerText = `Average: ${weeklyStats.avg} oz, Total: ${weeklyStats.total} oz`;
    document.getElementById("monthly-stats").innerText = `Average: ${monthlyStats.avg} oz, Total: ${monthlyStats.total} oz`;
}

function calculateStats(history, days) {
    const now = new Date();
    const relevantHistory = history.filter(entry => {
        const entryDate = new Date(entry.date);
        const diffTime = Math.abs(now - entryDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
    });

    const total = relevantHistory.reduce((sum, entry) => sum + entry.intake, 0);
    const avg = relevantHistory.length ? (total / relevantHistory.length).toFixed(2) : 0;

    return { total, avg };
}