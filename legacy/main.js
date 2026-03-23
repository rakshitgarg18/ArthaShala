document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const hotspots = document.querySelectorAll('.hotspot');
    const modal = document.getElementById('decision-modal');
    const sendBtn = document.querySelector('.send-btn');
    const coachInput = document.querySelector('.coach-input');

    // Language Selection Logic
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('lang-screen').classList.remove('active');
            document.getElementById('simulation-screen').classList.add('active');
            console.log('Language selected:', btn.dataset.lang);
        });
    });

    // Coach Chat Logic
    sendBtn.addEventListener('click', () => {
        const text = coachInput.value;
        if (text) {
            addCoachMessage(text);
            coachInput.value = '';
            setTimeout(() => {
                respondToUser(text);
            }, 1000);
        }
    });

    // Hotspot Interaction Logic
    hotspots.forEach(spot => {
        spot.addEventListener('click', () => {
            const type = spot.dataset.type;
            showDecision(type);
        });
    });
}

function addCoachMessage(text, isUser = true) {
    const body = document.querySelector('.coach-body');
    const msg = document.createElement('p');
    msg.className = 'coach-message';
    msg.style.background = isUser ? '#fff' : '#f0fdf4';
    msg.style.border = isUser ? '1px solid #eee' : 'none';
    msg.innerText = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
}

function respondToUser(text) {
    const responses = [
        "That's a great question! Based on your current 12 bags of grain, I recommend holding 4 bags for the monsoon season.",
        "Quantum analysis suggests that grain prices will rise by 5% in the next village market cycle.",
        "Remember to set aside ₹ 500 for your micro-loan repayment this week to maintain a high credit score."
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];
    addCoachMessage(reply, false);
}

function toggleOffline() {
    const pill = document.querySelector('.status');
    if (pill.innerText.includes('Offline')) {
        pill.innerText = '📡 Online Sync...';
        pill.className = 'stat-pill status online-sync';
        setTimeout(() => {
            pill.innerText = '✅ Data Synced';
            addCoachMessage("Quantum sync complete! Your farm data is now backed up safely.", false);
        }, 2000);
    } else {
        pill.innerText = '📶 Offline Active';
        pill.className = 'stat-pill status offline-sync';
    }
}

function showDecision(type) {
    const modal = document.getElementById('decision-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const actionBtn = modal.querySelector('.option-btn');

    if (type === 'market') {
        title.innerText = "Village Market Analysis";
        desc.innerText = "Quantum Coach Advice: Our models show a 75% chance of prices dropping next week due to monsoon patterns. Sell now for optimal profit.";
        actionBtn.innerText = "Sell Now (+ ₹ 1,200)";
        actionBtn.onclick = () => {
            updateStats(1200, 50, -2);
            closeModal();
            addCoachMessage("Transaction complete! You've earned 50 Reward Points for following the Quantum advice.", false);
        };
    } else if (type === 'farm') {
        title.innerText = "Risk-Assessed Loan";
        desc.innerText = "You are eligible for a zero-interest micro-loan of ₹ 2,000 for organic fertilizer. Risk level: LOW.";
        actionBtn.innerText = "Apply for Loan (+ ₹ 2,000)";
        actionBtn.onclick = () => {
            updateStats(2000, 20, 0);
            closeModal();
            addCoachMessage("Loan approved! Your repayment schedule has been added to the calendar.", false);
        };
    } else {
        title.innerText = "Community Savings (SI)";
        desc.innerText = "By contributing ₹ 100 now, you unlock a 1.2x multiplier on your reward points next month.";
        actionBtn.innerText = "Contribute ₹ 100";
        actionBtn.onclick = () => {
            updateStats(-100, 100, 0);
            closeModal();
            addCoachMessage("Thank you for contributing to the बचत गट. You earned 100 bonus points!", false);
        };
    }

    modal.style.display = 'flex';
}

function updateStats(cash, pts, bags) {
    const balancePill = document.querySelector('.balance');
    const rewardsPill = document.querySelector('.rewards');
    const cropsPill = document.querySelector('.crops');

    let currentCash = parseInt(balancePill.innerText.replace(/[^0-9]/g, ''));
    let currentPts = parseInt(rewardsPill.innerText.replace(/[^0-9]/g, ''));
    let currentBags = parseInt(cropsPill.innerText.replace(/[^0-9]/g, ''));

    balancePill.innerText = `💰 ₹ ${currentCash + cash}`;
    rewardsPill.innerText = `⭐ ${currentPts + pts} Pts`;
    cropsPill.innerText = `🌾 ${currentBags + bags} Bags`;

    // Pulse effect on update
    [balancePill, rewardsPill, cropsPill].forEach(pill => {
        pill.style.transform = 'scale(1.2)';
        setTimeout(() => pill.style.transform = '', 300);
    });
}

function closeModal() {
    document.getElementById('decision-modal').style.display = 'none';
}

// Global scope for onclick
function simulateVoice() {
    const wave = document.getElementById('voice-wave');
    wave.style.display = 'block';
    addCoachMessage("Listening... (Voice-to-Text activated)", true);
    setTimeout(() => {
        wave.style.display = 'none';
        addCoachMessage("I noticed you mentioned 'Crop Insurance'. Quantum analysis shows a 10% subsidy available this month.", false);
    }, 3000);
}

function showMission() {
    document.getElementById('mission-modal').style.display = 'flex';
}

function closeMission() {
    document.getElementById('mission-modal').style.display = 'none';
}

window.closeModal = closeModal;
window.toggleOffline = toggleOffline;
window.simulateVoice = simulateVoice;
window.showMission = showMission;
window.closeMission = closeMission;
 
