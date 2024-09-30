import { saveData, clearForm, convertCurrency } from './utils.js';
import { updateAll } from './app.js';

export function addTransaction(transactions) {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const currency = document.getElementById('currency').value;

    if (description && !isNaN(amount) && date) {
        transactions.push({ description, amount, type, date, category, currency });
        saveData(transactions);
        updateAll();
        clearForm();
    }
}

export function deleteTransaction(index, transactions) {
    transactions.splice(index, 1);
    saveData(transactions);
    updateAll();
}

export function filterTransactions(transactions) {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const filteredTransactions = transactions.filter(t => 
        t.description.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm)
    );
    updateTransactions(filteredTransactions);
}

export function exportData(transactions) {
    const dataStr = JSON.stringify(transactions);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'budget_data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

export function importData(event, transactions) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const contents = e.target.result;
        try {
            const importedData = JSON.parse(contents);
            transactions.push(...importedData);
            saveData(transactions);
            updateAll();
        } catch (error) {
            console.error('Error importing data:', error);
            alert('Error importing data. Please make sure the file is valid JSON.');
        }
    };

    reader.readAsText(file);
}
