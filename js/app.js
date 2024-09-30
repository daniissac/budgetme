import { addTransaction, deleteTransaction, filterTransactions, exportData, importData } from './transactions.js';
import { updateCharts } from './charts.js';
import { loadData, saveData, updateBalance, updateBudgetProgress, updateTransactions } from './utils.js';

let transactions = [];
let recurringTransactions = [];
let budgetGoal = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-transaction').addEventListener('click', () => addTransaction(transactions));
    document.getElementById('set-budget-goal').addEventListener('click', setBudgetGoal);
    document.getElementById('add-recurring-transaction').addEventListener('click', addRecurringTransaction);
    document.getElementById('search').addEventListener('keyup', () => filterTransactions(transactions));
    document.getElementById('export-data').addEventListener('click', () => exportData(transactions));
    document.getElementById('import-file').addEventListener('change', (e) => importData(e, transactions));

    loadData();
    updateAll();
});

function setBudgetGoal() {
    const goal = parseFloat(document.getElementById('budget-goal').value);
    if (!isNaN(goal)) {
        budgetGoal = goal;
        saveData(transactions, recurringTransactions, budgetGoal);
        updateAll();
    }
}

function addRecurringTransaction() {
    const description = document.getElementById('recurring-description').value;
    const amount = parseFloat(document.getElementById('recurring-amount').value);
    const type = document.getElementById('recurring-type').value;
    const frequency = document.getElementById('recurring-frequency').value;

    if (description && !isNaN(amount)) {
        recurringTransactions.push({ description, amount, type, frequency });
        saveData(transactions, recurringTransactions, budgetGoal);
        clearRecurringForm();
    }
}

function applyRecurringTransactions() {
    const today = new Date();
    recurringTransactions.forEach(rt => {
        let lastDate = new Date(localStorage.getItem(`lastApplied_${rt.description}`) || 0);
        while (lastDate < today) {
            if (rt.frequency === 'daily' || 
                (rt.frequency === 'weekly' && lastDate.getDay() === today.getDay()) ||
                (rt.frequency === 'monthly' && lastDate.getDate() === today.getDate())) {
                transactions.push({
                    description: rt.description,
                    amount: rt.amount,
                    type: rt.type,
                    date: lastDate.toISOString().split('T')[0],
                    category: 'Recurring',
                    currency: 'INR'
                });
            }
            lastDate.setDate(lastDate.getDate() + 1);
        }
        localStorage.setItem(`lastApplied_${rt.description}`, today.toISOString());
    });
    saveData(transactions, recurringTransactions, budgetGoal);
}

function updateAll() {
    updateBalance(transactions);
    updateBudgetProgress(transactions, budgetGoal);
    updateTransactions(transactions);
    updateCharts(transactions);
}

function clearRecurringForm() {
    document.getElementById('recurring-description').value = '';
    document.getElementById('recurring-amount').value = '';
    document.getElementById('recurring-type').value = 'expense';
    document.getElementById('recurring-frequency').value = 'monthly';
}

export { transactions, recurringTransactions, budgetGoal, updateAll, applyRecurringTransactions };
