import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, collection, query, orderBy, serverTimestamp, addDoc, deleteDoc, updateDoc, getDocs} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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
const displayBudget = document.getElementById("display-budget");
const displayExpensGoal = document.getElementById("expense-limit");
const totalExpensesDisplay = document.getElementById("total-expenses");
const budgetLeftDisplay = document.getElementById("budget-left");
const warningContainer = document.getElementById("warning-container");
const transactionForm = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");
const notificationPopup = document.getElementById("notification-popup");
const notificationMessage = document.getElementById("notification-message");
const resetAllBtn = document.getElementById("reset-all-btn");

let currentExpenseGoal = 0;
let currentBudget = 0;
let editingTransactionId = null;

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

        //clear input fields
        budgetInput.value = "";
        expenseGoalInput.value = "";

        // update ui immediatly
        currentBudget = budget;
        currentExpenseGoal = expenseGoal;

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
    onSnapshot(query(transactionRef, orderBy("timestamp", "desc")), () => {
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
        if (editingTransactionId) {
            // update existing transaction
            await updateDoc(doc(db, "transactions", editingTransactionId), {
                amount,
                category,
                timestamp: serverTimestamp()
            });
            editingTransactionId = null;
            document.getElementById("add-transaction-btn").textContent = "Add Transaction";
        } else {
            // add new transaction
            await addDoc(transactionRef, {
                amount,
                category,
                timestamp: serverTimestamp()
            });
        }

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
    
    const querySnapshot = await getDocs(query(transactionRef, orderBy("timestamp", "desc")));
    querySnapshot.forEach((docSnap) => {
        const transaction = docSnap.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${transaction.category}</td>
            <td>R${transaction.amount.toFixed(2)}</td>
            <td>
                <button class="edit-btn" onclick="startEditTransaction('${docSnap.id}', '${transaction.category}', ${transaction.amount})">Edit</button>
                <button class="delete-btn" onclick="deleteTransaction('${docSnap.id}')">Delete</button>
            </td>
        `;

        transactionList.appendChild(tr);
    });
    
}
// Update Financial Summary
async function updateFinancialSummary() {
    let totalExpenses = 0;

    const snapshot = await getDocs(transactionRef);
    snapshot.forEach((docSnap) => {
        totalExpenses += docSnap.data().amount;
    });

    const budgetLeft = currentBudget - totalExpenses;

    if (totalExpenses >= currentExpenseGoal && currentExpenseGoal > 0) {
        budgetLeftDisplay.textContent = `Budget Left: R${budgetLeft.toFixed(2)}`;
    }else{
        budgetLeftDisplay.textContent = '';
    }

    if (currentExpenseGoal > 0) {
        const overAmount = totalExpenses - currentExpenseGoal;

        if (overAmount > 0) {
            showNotification(`⚠️ You've exceeded your expense goal by R${overAmount.toFixed(2)}!`, "error");
        } else if (totalExpenses === currentExpenseGoal) {
            showNotification(`✅ You've reached your Expense Goal! Budget Left: ${budgetLeft.toFixed(2)}`, "success");
        }
    }
}

// function for pop up notifications
    function showNotification(message, type){
        notificationMessage.textContent = message;
        notificationPopup.className = `notification-popup ${type}`;
        notificationPopup.style.display = "block";

        void notificationPopup.offsetWidth;
        
    //hide after 5 seconds
    setTimeout(() => {
        notificationPopup.style.display = "none";
    }, 5000);

}
// edit transaction function
window.startEditTransaction = function(transactionId, category, amount) {
    editingTransactionId = transactionId;
    document.getElementById("amount").value = amount;
    document.getElementById("category").value = category;
    document.getElementById("add-transaction-btn").textContent = "Update Transaction";
    document.getElementById("amount").focus();
};
//reset button 
async function resetAllData() {
    if (confirm("Are you sure you want to reset ALL data? This cannot be undone!")) {
        try {
            // Clear budget goals
            await setDoc(docRef, { budget: 0, expenseGoal: 0 });
            
            // Clear all transactions
            const snapshot = await getDocs(transactionRef);
            for (const docSnap of snapshot.docs) {
                await deleteDoc(doc(db, "transactions", docSnap.id));
            }
            
            // Reset UI
            currentBudget = 0;
            currentExpenseGoal = 0;
            displayBudget.textContent = `Total Budget: R0.00`;
            displayExpensGoal.textContent = `Expense Goal: R0.00`;
            budgetLeftDisplay.textContent = `Budget Left: R0.00`;
            transactionList.innerHTML = "";
            
            showNotification("All data has been reset successfully.", "success");
        } catch (error) {
            console.error("Error resetting data:", error);
            showNotification("Error resetting data. Please try again.", "error");
        }
    }
}

// add event listener
resetAllBtn?.addEventListener("click", resetAllData);

// Separate function to delete transaction
window.deleteTransaction = async function(transactionId) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        try {
            await deleteDoc(doc(db, "transactions", transactionId));
            console.log("Transaction removed successfully!");
            //loadTransactions(); // Reload after deletion
        } catch (error) {
            console.error("Error removing transaction:", error);
        }
    }
        
};

// Load on page
window.addEventListener("DOMContentLoaded", () => {
    setupRealTimeUpdates();
});

function checkScreenSize() {
    const warning = document.getElementById('mobile-warning');
    const mainContent = document.getElementById('main');

    if (window.innerWidth < 768) {
        warning.style.display = 'flex';   // show the mobile warning
        if(mainContent) mainContent.style.display = 'none'; // hide the app content
    } else {
        warning.style.display = 'none';  // hide the mobile warning
        if (mainContent) mainContent.style.display = 'block'; // show the app content
    }
}

// Check on page load
window.addEventListener('load', checkScreenSize);
// Check when resizing window
window.addEventListener('resize', checkScreenSize);


