let dailyGoal = 64; 
let currentIntake = 0;

document.addEventListener("DOMContentLoaded", function() {
    dailyGoal = localStorage.getItem("dailyGoal") || 64;
    currentIntake = localStorage.getItem("currentIntake") || 0;

    document.getElementById("goal").value = dailyGoal;
    updateProgress();
});

function logWater(amount) {
    currentIntake = parseInt(currentIntake) + amount;
    localStorage.setItem("currentIntake", currentIntake);
    updateProgress();
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
