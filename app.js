let categories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Transport', 'Entertainment', 'Bills', 'Other'];

function initApp() {
    loadTransactions();
    updateBalance();
    updateCharts();
    setupEventListeners();
    updateCategoryDropdowns();
    displayCategories();
    updateGoalProgress();
}

function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.description} - ₹${transaction.amount} (${transaction.category}) - ${transaction.date}`;
        transactionList.appendChild(li);
    });
}

function updateBalance() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const balance = transactions.reduce((total, transaction) => total + parseFloat(transaction.amount), 0);
    document.getElementById('balance-amount').textContent = `₹${balance.toFixed(2)}`;
}

function updateCharts() {
    updateExpenseChart();
    updateTrendChart();
}

function updateExpenseChart() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const categoryTotals = {};
    transactions.forEach(transaction => {
        if (!categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] = 0;
        }
        categoryTotals[transaction.category] += parseFloat(transaction.amount);
    });

    const ctx = document.getElementById('expense-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
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

function setupEventListeners() {
    document.getElementById('add-transaction').addEventListener('click', addTransaction);
    document.getElementById('set-goal').addEventListener('click', setBudgetGoal);
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', importData);
    document.getElementById('search').addEventListener('input', searchTransactions);
    document.getElementById('filter-category').addEventListener('change', filterTransactions);
    document.getElementById('add-category').addEventListener('click', addCategory);
}

function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const recurring = document.getElementById('recurring').checked;

    if (!description || !amount || !date || !category) {
        alert('Please fill in all fields');
        return;
    }

    const transaction = { description, amount, date, category, recurring };
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    loadTransactions();
    updateBalance();
    updateCharts();
    updateGoalProgress();
    resetForm();
}

function resetForm() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('category').value = '';
    document.getElementById('recurring').checked = false;
}

function setBudgetGoal() {
    const goalAmount = document.getElementById('goal-amount').value;
    if (!goalAmount) {
        alert('Please enter a goal amount');
        return;
    }
    localStorage.setItem('budgetGoal', goalAmount);
    updateGoalProgress();
}

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

function importData() {
    const file = document.getElementById('import-file').files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const transactions = JSON.parse(e.target.result);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        loadTransactions();
        updateBalance();
        updateCharts();
        updateGoalProgress();
    };
    reader.readAsText(file);
}

function searchTransactions() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const filteredTransactions = transactions.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm) ||
        transaction.category.toLowerCase().includes(searchTerm)
    );
    displayFilteredTransactions(filteredTransactions);
}

function filterTransactions() {
    const category = document.getElementById('filter-category').value;
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const filteredTransactions = category ? transactions.filter(transaction => transaction.category === category) : transactions;
    displayFilteredTransactions(filteredTransactions);
}

function displayFilteredTransactions(transactions) {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.description} - ₹${transaction.amount} (${transaction.category}) - ${transaction.date}`;
        transactionList.appendChild(li);
    });
}

function updateCategoryDropdowns() {
    const categorySelects = document.querySelectorAll('#category, #filter-category');
    categorySelects.forEach(select => {
        select.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            select.appendChild(option);
        });
    });
}

function displayCategories() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category;
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteCategory(category);
        li.appendChild(deleteBtn);
        categoryList.appendChild(li);
    });
}

function addCategory() {
    const newCategory = document.getElementById('new-category').value.trim();
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        updateCategoryDropdowns();
        displayCategories();
        document.getElementById('new-category').value = '';
    }
}

function deleteCategory(category) {
    categories = categories.filter(c => c !== category);
    localStorage.setItem('categories', JSON.stringify(categories));
    updateCategoryDropdowns();
    displayCategories();
}

window.onload = initApp;

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
