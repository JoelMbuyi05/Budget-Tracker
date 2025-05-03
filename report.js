import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBxaxtS9csJrcyPEF5JpDmt5wJXZzeHkLQ",
    authDomain: "budget-tracker-05.firebaseapp.com",
    projectId: "budget-tracker-05",
    storageBucket: "budget-tracker-05.appspot.com",
    messagingSenderId: "788472768916",
    appId: "1:788472768916:web:41ade188fdff9b0f35c781"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// References
const transactionRef = collection(db, "transactions");
const chartCanvas = document.getElementById("report-chart" );

// Load transactions and draw chart
async function loadAndDrawChart() {
    let categoryTotals = {};

    try {
        const snapshot = await getDocs(transactionRef);
        snapshot.forEach((docSnap) => {
            const transaction = docSnap.data();
            const category = transaction.category || "Uncategorized";
            categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
        });

        drawPieChart(categoryTotals);

    } catch (error) {
        console.error("Failed to load transactions:", error);
    }
}

// Draw Pie Chart
function drawPieChart(categoryTotals) {
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                label: "Expenses by Category",
                data: data,
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40"
                ]
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false
        }
    });
}

// Start
window.addEventListener("DOMContentLoaded", loadAndDrawChart);

function checkScreenSize() {
    const warning = document.getElementById('mobile-warning');
    const appContent = document.getElementById('app-content');

    if (window.innerWidth < 768) {
        warning.style.display = 'flex';   // show the mobile warning
        appContent.style.display = 'none'; // hide the app content
    } else {
        warning.style.display = 'none';  // hide the mobile warning
        appContent.style.display = 'block'; // show the app content
    }
}

// Check on page load
window.addEventListener('load', checkScreenSize);
// Check when resizing window
window.addEventListener('resize', checkScreenSize);

