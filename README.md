# Budget-Tracker
A web-based budget tracker that helps you track your income and expenses using Firebase. It includes warnings when you overspend and provides a visual report chart of your budget.

🛠 Technologies Used
* HTML
* CSS
* JavaScript
* Firebase Firestore
* Chart.js(for visual reports)

⭐ Features
* Add Income & Expenses
* Real-Time Data Sync (Firebase)
* Spending Alerts
* Interactive Charts (Chart.js)
* Category Support
* Monthly Summary
* Clean & Responsive Interface

🧪 Process
The development of the Budget Tracker began with defining the core problem: creating a simple and effective tool for tracking spending while keeping the interface clean and beginner-friendly.
I started with the layout structure, designing a split view where users could input their transactions on the left and view summaries and charts on the right. Once the HTML skeleton was in place, I styled the application using custom CSS to achieve a modern, minimal, and responsive UI.

After UI design, I integrated Firebase Firestore to handle all data storage. I implemented functions for adding entries, retrieving them in real time, and updating the UI when the database changes. This created a smooth, dynamic experience without needing page reloads.

Next, I connected Chart.js to visualize the financial data. The charts update dynamically whenever a new income or expense is added. Spending limits and overspending alerts were then added to give the user more awareness of their financial habits.

The final steps involved debugging, organizing the code for readability, improving form validation, and ensuring the app worked well across all devices.

📚 What I Learned
* Connecting JavaScript applications with Firebase Firestore
* Real-time database reads/writes
* Structuring clean and reusable JS functions
* Using Chart.js to create dynamic financial graphs
* Working with modular project structure
* Designing functional user flows (inputs → storage → display)

🚀 Overall Growth
This project helped develop skills in:

* Front-end development
* Real-time data applications
* State management without frameworks
* Creating user-friendly financial tools
* Data visualization and analytics
* Clean code writing and better project structure
* Deploying and managing Firebase-connected apps

🔧 How It Can Be Improved
* Add user authentication (login/register)
* Add ability to filter by month or year
* Add recurring expenses & reminders
* Add dark/light mode
* Add downloadable reports (PDF/CSV)
* Add multiple wallets/accounts
* Add expense breakdown by category over time

▶️ Running the Project
1. Clone or download the project
2. Open the project folder
3. Insert your Firebase configuration in firebase.js
4. Open index.html in your browser
5. Start adding income & expenses!

🎥 Video Demo
