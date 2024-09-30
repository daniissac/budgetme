// Initialize the app
function initApp() {
    loadTransactions();
    updateBalance();
    updateCharts();
    setupEventListeners();
}

// Load transactions from localStorage
function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.description} - ${transaction.amount} ${transaction.currency} (${transaction.category}) - ${transaction.date}`;
        transactionList.appendChild(li);
    });
}

// Update balance
function updateBalance() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const balance = transactions.reduce((total, transaction) => {
        const amount = parseFloat(transaction.amount);
        return transaction.currency === 'INR' ? total + amount : total + convertToINR(amount, transaction.currency);
    }, 0);
    document.getElementById('balance-amount').textContent = `₹${balance.toFixed(2)}`;
}

// Convert currency to INR
function convertToINR(amount, fromCurrency) {
    // For simplicity, using fixed exchange rates. In a real app, you'd use an API for live rates.
    const rates = {
        USD: 75,
        EUR: 85,
        GBP: 95,
        INR: 1
    };
    return amount * rates[fromCurrency];
}

// Update charts
function updateCharts() {
    updateExpenseChart();
    updateTrendChart();
}

// Update expense chart
function updateExpenseChart() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const categories = {};
    transactions.forEach(transaction => {
        if (!categories[transaction.category]) {
            categories[transaction.category] = 0;
        }
        categories[transaction.category] += parseFloat(transaction.amount);
    });

    const ctx = document.getElementById('expense-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Expense by Category'
            }
        }
    });
}

// Update trend chart
function updateTrendChart() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const dailyTotals = {};
    transactions.forEach(transaction => {
        if (!dailyTotals[transaction.date]) {
            dailyTotals[transaction.date] = 0;
        }
        dailyTotals[transaction.date] += parseFloat(transaction.amount);
    });

    const ctx = document.getElementById('trend-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(dailyTotals).sort(),
            datasets: [{
                label: 'Daily Spending',
                data: Object.keys(dailyTotals).sort().map(date => dailyTotals[date]),
                borderColor: '#4CAF50',
                fill: false
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Spending Trend'
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }]
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('add-transaction').addEventListener('click', addTransaction);
    document.getElementById('set-goal').addEventListener('click', setBudgetGoal);
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', importData);
    document.getElementById('search').addEventListener('input', searchTransactions);
    document.getElementById('filter-category').addEventListener('change', filterTransactions);
}

// Add transaction
function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const currency = document.getElementById('currency').value;
    const recurring = document.getElementById('recurring').checked;

    if (!description || !amount || !date || !category) {
        alert('Please fill in all fields');
        return;
    }

    const transaction = { description, amount, date, category, currency, recurring };
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    loadTransactions();
    updateBalance();
    updateCharts();
    resetForm();
}

// Reset form
function resetForm() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('category').value = '';
    document.getElementById('currency').value = 'INR';
    document.getElementById('recurring').checked = false;
}

// Set budget goal
function setBudgetGoal() {
    const goalAmount = document.getElementById('goal-amount').value;
    if (!goalAmount) {
        alert('Please enter a goal amount');
        return;
    }
    localStorage.setItem('budgetGoal', goalAmount);
    updateGoalProgress();
}

// Update goal progress
function updateGoalProgress() {
    const goalAmount = localStorage.getItem('budgetGoal');
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const totalSpent = transactions.reduce((total, transaction) => total + parseFloat(transaction.amount), 0);
    const progress = (totalSpent / goalAmount) * 100;

    const goalProgress = document.getElementById('goal-progress');
    goalProgress.innerHTML = `
        <p>Goal: ₹${goalAmount}</p>
        <p>Progress: ${progress.toFixed(2)}%</p>
        <progress value="${totalSpent}" max="${goalAmount}"></progress>
    `;
}

// Export data
function exportData() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const dataStr = JSON.stringify(transactions);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'budget_data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import data
function importData() {
    const file = document.getElementById('import-file').files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const transactions = JSON.parse(e.target.result);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        loadTransactions();
        updateBalance();
        updateCharts();
    };
    reader.readAsText(file);
}

// Search transactions
function searchTransactions() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const filteredTransactions = transactions.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm) ||
        transaction.category.toLowerCase().includes(searchTerm)
    );
    displayFilteredTransactions(filteredTransactions);
}

// Filter transactions
function filterTransactions() {
    const category = document.getElementById('filter-category').value;
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const filteredTransactions = category ? transactions.filter(transaction => transaction.category === category) : transactions;
    displayFilteredTransactions(filteredTransactions);
}

// Display filtered transactions
function displayFilteredTransactions(transactions) {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.description} - ${transaction.amount} ${transaction.currency} (${transaction.category}) - ${transaction.date}`;
        transactionList.appendChild(li);
    });
}

// Initialize the app when the page loads
window.onload = initApp;

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
