import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, collection, query, orderBy, serverTimestamp, addDoc, deleteDoc, getDocs} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBxaxtS9csJrcyPEF5JpDmt5wJXZzeHkLQ",
    authDomain: "budget-tracker-05.firebaseapp.com",
    projectId: "budget-tracker-05",
    storageBucket: "budget-tracker-05.firebasestorage.app",
    messagingSenderId: "788472768916",
    appId: "1:788472768916:web:41ade188fdff9b0f35c781"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//firestore reference // budget goals and expense goal////////////////
const docRef = doc(db, "budget", "user-budget");
const transactionRef = collection(db, "transactions");

console.log("Firebase Initialized");

//select input fields & button
const budgetInput = document.getElementById("budget-input");
const expenseGoalInput = document.getElementById("expense-goal-input");
const saveGoalsBtn = document.getElementById("save-goals-btn");

//Select UI display elements
const displayBudget = document.getElementById("display-budget");
const displayExpensGoal = document.getElementById("expense-limit");
const totalExpensesDisplay = document.getElementById("total-expenses");
const budgetLeftDisplay = document.getElementById("budget-left");
const warningContainer = document.getElementById("warning-container");
const transactionForm = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");

let currentExpenseGoal = 0;
let currentBudget = 0;

console.log("Save button: ", saveGoalsBtn);
console.log("UI elements selected");

//fucntion to save budget & expense goal to firestore
saveGoalsBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    const budget = Number(budgetInput.value);
    const expenseGoal = Number(expenseGoalInput.value);

    if (!budget || !expenseGoal){
        alert("Please enter both budget and expense goal.");
        return;
    }

    try { 
        //store in firestore 
        await setDoc(docRef, { budget, expenseGoal });


        // clear all old transactions (for fresh start)
        const snapshot = await getDocs(transactionRef);
        for (const docSnap of snapshot.docs) {
            await deleteDoc(doc(db, "transactions", docSnap.id));
        }

        //clear input fields
        budgetInput.value = "";
        expenseGoalInput.value = "";

        //manually refresh UI
        updateFinancialSummary();

    }catch (error){
        console.error("Error saving budget goals:", error);
        alert("Error saving. Check console")
    }
});

// Real-time listener setup
function setupRealTimeUpdates() {
    onSnapshot(docRef, (docSnap) => {
        if(docSnap.exists()) {
            const data = docSnap.data();
            currentBudget = data.budget;
            currentExpenseGoal = data.expenseGoal;

            displayBudget.textContent = `Total Budget: R${currentBudget.toFixed(2)}`;
            displayExpensGoal.textContent = `Expense Goal: R${currentExpenseGoal.toFixed(2)}`;

            updateFinancialSummary();
        }
    });

    onSnapshot(transactionRef, () => {
        loadTransactions();
        updateFinancialSummary();
    });
}


// Add transaction
transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amountInput = document.getElementById("amount");
    const categoryInput = document.getElementById("category");

    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value.trim();

    if (!amount || !category) {
        alert("Please fill in all fields");
        return;
    }

    try {
        await addDoc(transactionRef, {
            amount,
            category,
            timestamp: serverTimestamp()
        });

        amountInput.value = "";
        categoryInput.value = "";
    } catch (error) {
        console.error("Error adding transaction:", error);
        alert("Failed to add transaction");
    }
});

// Load transactions into table
async function loadTransactions() {
    transactionList.innerHTML = "";

    
    const querySnapshot = await getDocs(transactionRef);
    querySnapshot.forEach((docSnap) => {
        const transaction = docSnap.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${transaction.category}</td>
            <td>R${transaction.amount.toFixed(2)}</td>
            <td><button class="delete-btn" onclick="deleteTransaction('${docSnap.id}')">Delete</button></td>
        `;

        transactionList.appendChild(tr);
    });
    
}
// Update Financial Summary
async function updateFinancialSummary() {
    let totalExpenses = 0;

    const snapshot = await getDocs(transactionRef);
    snapshot.forEach((docSnap) => {
        const transaction = docSnap.data();
        totalExpenses += transaction.amount;
    });

    const budgetLeft = currentBudget - totalExpenses;

    totalExpensesDisplay.textContent = `Total Expenses: R${totalExpenses.toFixed(2)}`;
    budgetLeftDisplay.textContent = `Budget Left: R${budgetLeft.toFixed(2)}`;

    warningContainer.innerHTML = "";
    if (totalExpenses > currentExpenseGoal) {
        const warning = document.createElement("div");
        warning.style.color = "red";
        warning.style.fontWeight = "bold";
        warning.textContent = "You have exceeded your Expense Goal!";
        warningContainer.appendChild(warning);
    }else{
        document.getElementById("warning-message")?.remove();
    }
}
// Separate function to delete transaction
window.deleteTransaction = async function(transactionId) {
    try {
        await deleteDoc(doc(db, "transactions", transactionId));
        console.log("Transaction removed successfully!");
        //loadTransactions(); // Reload after deletion
    } catch (error) {
        console.error("Error removing transaction:", error);
    }
};

// Load on page
window.addEventListener("DOMContentLoaded", () => {
    setupRealTimeUpdates();
});

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


