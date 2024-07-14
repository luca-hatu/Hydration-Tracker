let dailyGoal = 64; 
let currentIntake = 0;

document.addEventListener("DOMContentLoaded", function() {
    dailyGoal = localStorage.getItem("dailyGoal") || 64;
    currentIntake = localStorage.getItem("currentIntake") || 0;

    checkForDailyReset();

    document.getElementById("goal").value = dailyGoal;
    updateProgress();
});

function logWater(amount) {
    currentIntake = parseInt(currentIntake) + amount;
    localStorage.setItem("currentIntake", currentIntake);
    updateProgress();
}
function checkForDailyReset() {
    const lastReset = localStorage.getItem('lastReset');
    const today = new Date().toLocaleDateString();

    if (lastReset !== today) {
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