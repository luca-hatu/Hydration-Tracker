let dailyGoal = 64;
let currentIntake = 0;
let unit = localStorage.getItem("unit") || "oz";

document.addEventListener("DOMContentLoaded", function() {
    dailyGoal = localStorage.getItem("dailyGoal") || 64;
    currentIntake = localStorage.getItem("currentIntake") || 0;

    checkForDailyReset();
    const savedTheme = localStorage.getItem("theme") || "light";
    document.getElementById("theme").value = savedTheme;
    setTheme();

    document.getElementById("goal").value = dailyGoal;
    updateProgress();
    displayHistory();
    displayAchievements();
    requestNotificationPermission();
    setNotificationInterval();

    displayDailyTip();
    displayChart();
    const profile = JSON.parse(localStorage.getItem("profile"));
    if (profile) {
        document.getElementById("weight").value = profile.weight;
        document.getElementById("age").value = profile.age;
    }
});
document.getElementById("unit").value = unit;
updateProgress();

function logWater(amount) {
    currentIntake = parseInt(currentIntake) + amount;
    localStorage.setItem("currentIntake", currentIntake);
    updateProgress();
    checkAchievements();
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
    document.getElementById("progress-text").innerText = `${currentIntake} / ${dailyGoal} oz`;
    checkAchievements();
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
        listItem.textContent = `${entry.date}: ${entry.intake} oz`;
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